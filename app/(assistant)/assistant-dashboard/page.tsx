"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import BottomNav from "@/components/ui/BottomNav";
import StatusBadge from "@/components/ui/StatusBadge";
import { AssistanceRequest } from "@/types";
import { Briefcase, Clock, LogOut, ToggleLeft, ToggleRight, MapPin } from "lucide-react";
import { getRequestTypeLabel } from "@/lib/utils";
import { DEMO_MODE, DEMO_ASSISTANT_PROFILE, DEMO_JOBS } from "@/lib/demo-data";

export default function AssistantDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [isAvailable, setIsAvailable] = useState(false);
  const [pendingJobs, setPendingJobs] = useState<any[]>([]);
  const [activeJob, setActiveJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    if (DEMO_MODE) {
      setProfile(DEMO_ASSISTANT_PROFILE);
      setPendingJobs(DEMO_JOBS);
      setLoading(false);
      return;
    }
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const [{ data: profileData }, { data: availData }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("assistant_availability").select("*").eq("assistant_id", user.id).single(),
      ]);
      setProfile(profileData);
      setIsAvailable(availData?.is_available || false);
      const { data: activeJobData } = await supabase.from("assistance_requests")
        .select("*, camper:profiles!camper_id(name, phone)").eq("assigned_assistant_id", user.id)
        .in("status", ["accepted", "in_progress"]).order("created_at", { ascending: false }).limit(1).single();
      setActiveJob(activeJobData);
      if (profileData?.festival_id) {
        const { data: pendingData } = await supabase.from("assistance_requests")
          .select("*, camper:profiles!camper_id(name)").eq("festival_id", profileData.festival_id)
          .eq("status", "pending").is("assigned_assistant_id", null).order("created_at", { ascending: true });
        setPendingJobs(pendingData || []);
      }
      setLoading(false);
    };
    load();
  }, []);

  const toggleAvailability = async () => {
    if (DEMO_MODE) { setIsAvailable(v => !v); return; }
    setToggling(true);
    const newVal = !isAvailable;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("assistant_availability").upsert({ assistant_id: user.id, is_available: newVal, festival_id: profile?.festival_id, updated_at: new Date().toISOString() });
    setIsAvailable(newVal);
    setToggling(false);
  };

  const acceptJob = async (job: any) => {
    if (DEMO_MODE) { router.push("/job/demo-job-1"); return; }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("assistance_requests").update({ status: "accepted", assigned_assistant_id: user.id }).eq("id", job.id);
    router.push(`/job/${job.id}`);
  };

  const handleLogout = async () => {
    if (!DEMO_MODE) await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-[3px] border-orange-200 border-t-orange-500 rounded-full animate-spin" /></div>;

  return (
    <div className="page-container">
      <header className="page-header" style={{justifyContent:"space-between"}}>
        <div>
          <h1 className="font-bold text-lg text-gray-900">Hey, {profile?.name?.split(" ")[0]} 👷</h1>
          <p className="text-sm text-gray-500">Camp Assistant</p>
        </div>
        <button onClick={handleLogout} className="text-gray-400"><LogOut size={18} /></button>
      </header>
      <div className="px-4 py-6 pb-24 space-y-4">
        <div className="rounded-2xl p-5 flex items-center justify-between" style={{background:isAvailable?"#ea580c":"#f3f4f6"}}>
          <div>
            <p className="font-bold text-lg" style={{color:isAvailable?"#fff":"#374151"}}>{isAvailable?"You are Available":"You are Off Duty"}</p>
            <p className="text-sm mt-1" style={{color:isAvailable?"rgba(255,255,255,0.7)":"#9ca3af"}}>{isAvailable?"New jobs will be sent to you":"Toggle on to receive jobs"}</p>
          </div>
          <button onClick={toggleAvailability} disabled={toggling} className="border-none bg-transparent cursor-pointer">
            {isAvailable ? <ToggleRight size={48} color="#fff" /> : <ToggleLeft size={48} color="#9ca3af" />}
          </button>
        </div>

        {activeJob && (
          <Link href={`/job/${activeJob.id}`} className="card block border-2 border-orange-200">
            <div className="flex items-center justify-between mb-2">
              <p className="font-bold text-sm text-orange-600">Active Job</p>
              <StatusBadge status={activeJob.status} />
            </div>
            <p className="font-semibold">{getRequestTypeLabel(activeJob.type)}</p>
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1"><MapPin size={11} />{activeJob.location_description}</p>
            <p className="text-xs text-orange-500 font-medium mt-2">Tap to continue →</p>
          </Link>
        )}

        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-gray-900 text-sm">Available Jobs</p>
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium">{pendingJobs.length} waiting</span>
          </div>
          {!isAvailable ? (
            <div className="card text-center py-6 text-gray-400">
              <Briefcase size={32} className="mx-auto mb-2" />
              <p className="text-sm">Toggle available to see jobs</p>
            </div>
          ) : pendingJobs.length === 0 ? (
            <div className="card text-center py-6 text-gray-400">
              <Clock size={32} className="mx-auto mb-2" />
              <p className="text-sm">No pending jobs right now.</p>
            </div>
          ) : (
            pendingJobs.map(job => (
              <div key={job.id} className="card mb-3">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-sm">{getRequestTypeLabel(job.type)}</p>
                    <p className="text-xs text-gray-400">{new Date(job.created_at).toLocaleTimeString("en-GB", {hour:"2-digit",minute:"2-digit"})}</p>
                  </div>
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-semibold">New</span>
                </div>
                <div className="flex items-start gap-1 text-xs text-gray-600 mb-3">
                  <MapPin size={11} className="shrink-0 mt-0.5 text-red-400" />{job.location_description}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => acceptJob(job)} className="flex-1 text-white text-sm font-semibold py-2 rounded-xl border-none cursor-pointer" style={{background:"#ea580c"}}>Accept Job</button>
                  <button className="flex-1 bg-gray-100 text-gray-600 text-sm font-semibold py-2 rounded-xl border-none cursor-pointer">Pass</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <BottomNav role="assistant" />
    </div>
  );
}
