"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import BottomNav from "@/components/ui/BottomNav";
import StatusBadge from "@/components/ui/StatusBadge";
import { Profile, AssistanceRequest } from "@/types";
import { getPusherClient, channels, events } from "@/lib/pusher";
import { Briefcase, ToggleLeft, ToggleRight, MapPin, Clock, LogOut } from "lucide-react";
import { getRequestTypeLabel } from "@/lib/utils";

export default function AssistantDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAvailable, setIsAvailable] = useState(false);
  const [activeJob, setActiveJob] = useState<AssistanceRequest | null>(null);
  const [pendingJobs, setPendingJobs] = useState<AssistanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const loadData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const [{ data: profileData }, { data: availData }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("assistant_availability").select("*").eq("assistant_id", user.id).single(),
    ]);
    setProfile(profileData);
    setIsAvailable(availData?.is_available || false);

    // Load active job
    const { data: activeJobData } = await supabase
      .from("assistance_requests")
      .select("*, camper:profiles!camper_id(name, phone)")
      .eq("assigned_assistant_id", user.id)
      .in("status", ["accepted", "in_progress"])
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
    setActiveJob(activeJobData);

    // Load pending jobs in the festival pool
    if (profileData?.festival_id) {
      const { data: pendingData } = await supabase
        .from("assistance_requests")
        .select("*, camper:profiles!camper_id(name)")
        .eq("festival_id", profileData.festival_id)
        .eq("status", "pending")
        .is("assigned_assistant_id", null)
        .order("created_at", { ascending: true });
      setPendingJobs(pendingData || []);
    }
    setLoading(false);
  }, [router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Pusher subscription for new jobs
  useEffect(() => {
    if (!profile?.festival_id) return;
    const pusher = getPusherClient();
    const channel = pusher.subscribe(channels.assistantJobs(profile.festival_id));
    channel.bind(events.NEW_JOB, () => loadData());
    const festivalId = profile.festival_id;
    return () => { channel.unbind_all(); pusher.unsubscribe(channels.assistantJobs(festivalId!)); };
  }, [profile?.festival_id, loadData]);

  const toggleAvailability = async () => {
    if (!profile) return;
    setToggling(true);
    const newVal = !isAvailable;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("assistant_availability").upsert({
      assistant_id: user.id,
      is_available: newVal,
      festival_id: profile.festival_id,
      updated_at: new Date().toISOString(),
    });
    setIsAvailable(newVal);
    setToggling(false);
  };

  const acceptJob = async (request: AssistanceRequest) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("assistance_requests")
      .update({ status: "accepted", assigned_assistant_id: user.id })
      .eq("id", request.id);
    await fetch("/api/pusher/trigger", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        channel: channels.jobStatus(request.id),
        event: events.JOB_ACCEPTED,
        data: { requestId: request.id, assistantName: profile?.name },
      }),
    });
    router.push(`/job/${request.id}`);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-[3px] border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>;

  return (
    <div className="page-container">
      <header className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-bold text-lg">Hey, {profile?.name?.split(" ")[0]} 👷</h1>
            <p className="text-sm text-gray-500">Camp Assistant</p>
          </div>
          <button onClick={handleLogout} className="text-gray-400 hover:text-gray-600">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <div className="px-4 py-6 space-y-4">
        {/* Availability toggle */}
        <div className={`rounded-2xl p-5 transition-colors ${isAvailable ? "bg-primary-600" : "bg-gray-100"}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`font-bold text-lg ${isAvailable ? "text-white" : "text-gray-700"}`}>
                {isAvailable ? "You are Available" : "You are Off Duty"}
              </p>
              <p className={`text-sm mt-0.5 ${isAvailable ? "text-white/70" : "text-gray-500"}`}>
                {isAvailable ? "New jobs will be sent to you" : "Toggle on to receive jobs"}
              </p>
            </div>
            <button onClick={toggleAvailability} disabled={toggling}
              className={`transition-opacity ${toggling ? "opacity-50" : ""}`}>
              {isAvailable
                ? <ToggleRight size={48} className="text-white" />
                : <ToggleLeft size={48} className="text-gray-400" />
              }
            </button>
          </div>
        </div>

        {/* Active job */}
        {activeJob && (
          <Link href={`/job/${activeJob.id}`} className="card block border-2 border-primary-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="font-bold text-sm text-primary-700">Active Job</p>
              <StatusBadge status={activeJob.status} />
            </div>
            <p className="font-semibold text-gray-900">{getRequestTypeLabel(activeJob.type)}</p>
            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
              <MapPin size={12} />
              <span>{activeJob.location_description}</span>
            </div>
            <p className="text-xs text-primary-600 font-medium mt-3">Tap to continue →</p>
          </Link>
        )}

        {/* Pending jobs pool */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-gray-900 text-sm">Available Jobs</p>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">{pendingJobs.length} waiting</span>
          </div>

          {!isAvailable ? (
            <div className="card text-center py-6 text-gray-400">
              <Briefcase size={32} className="mx-auto mb-2" />
              <p className="text-sm">Toggle available to see and accept jobs</p>
            </div>
          ) : pendingJobs.length === 0 ? (
            <div className="card text-center py-6 text-gray-400">
              <Clock size={32} className="mx-auto mb-2" />
              <p className="text-sm">No pending jobs right now. Check back soon.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingJobs.map(job => (
                <div key={job.id} className="card">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-sm text-gray-900">{getRequestTypeLabel(job.type)}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(job.created_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-medium">New</span>
                  </div>
                  <div className="flex items-start gap-1 text-xs text-gray-600 mb-3">
                    <MapPin size={12} className="shrink-0 mt-0.5" />
                    <span>{job.location_description}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => acceptJob(job)}
                      className="flex-1 bg-primary-600 text-white text-sm font-semibold py-2 rounded-xl hover:bg-primary-700 transition-colors">
                      Accept Job
                    </button>
                    <button
                      className="flex-1 bg-gray-100 text-gray-600 text-sm font-semibold py-2 rounded-xl hover:bg-gray-200 transition-colors">
                      Pass
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <BottomNav role="assistant" />
    </div>
  );
}
