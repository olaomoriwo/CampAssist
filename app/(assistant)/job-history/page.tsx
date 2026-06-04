"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import BottomNav from "@/components/ui/BottomNav";
import StarRating from "@/components/ui/StarRating";
import { AssistanceRequest } from "@/types";
import { ArrowLeft, History } from "lucide-react";
import { getRequestTypeLabel } from "@/lib/utils";

export default function JobHistoryPage() {
  const [jobs, setJobs] = useState<AssistanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data } = await supabase
        .from("assistance_requests")
        .select("*, camper:profiles!camper_id(name)")
        .eq("assigned_assistant_id", user.id)
        .eq("status", "complete")
        .order("created_at", { ascending: false });
      setJobs(data || []);
      setLoading(false);
    };
    load();
  }, []);

  const totalRated = jobs.filter(j => j.rating).length;
  const avgRating = totalRated > 0
    ? jobs.reduce((sum, j) => sum + (j.rating || 0), 0) / totalRated
    : 0;

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-[3px] border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>;

  return (
    <div className="page-container">
      <header className="page-header">
        <div className="flex items-center gap-3">
          <Link href="/assistant-dashboard" className="text-gray-500"><ArrowLeft size={20} /></Link>
          <h1 className="font-bold text-lg">Job History</h1>
        </div>
      </header>

      <div className="px-4 py-6 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="card text-center">
            <p className="text-3xl font-bold text-primary-600">{jobs.length}</p>
            <p className="text-xs text-gray-500 mt-1">Jobs completed</p>
          </div>
          <div className="card text-center">
            <p className="text-3xl font-bold text-yellow-500">{avgRating.toFixed(1)}</p>
            <p className="text-xs text-gray-500 mt-1">Average rating</p>
          </div>
        </div>

        {/* Job list */}
        {jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <History size={48} className="text-gray-200 mb-4" />
            <p className="text-gray-500 text-sm">No completed jobs yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map(job => (
              <div key={job.id} className="card">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{getRequestTypeLabel(job.type)}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(job.created_at).toLocaleDateString("en-GB", {
                        day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
                      })}
                    </p>
                  </div>
                  {job.rating && (
                    <StarRating value={job.rating} readonly />
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  Camper: {(job as any).camper?.name}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav role="assistant" />
    </div>
  );
}
