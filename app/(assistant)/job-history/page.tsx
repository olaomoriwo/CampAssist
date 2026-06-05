"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import BottomNav from "@/components/ui/BottomNav";
import StarRating from "@/components/ui/StarRating";
import { History } from "lucide-react";
import { getRequestTypeLabel } from "@/lib/utils";
import { DEMO_MODE, DEMO_COMPLETED_JOBS } from "@/lib/demo-data";

export default function JobHistoryPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    if (DEMO_MODE) { setJobs(DEMO_COMPLETED_JOBS); setLoading(false); return; }
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data } = await supabase.from("assistance_requests").select("*, camper:profiles!camper_id(name)").eq("assigned_assistant_id", user.id).eq("status", "complete").order("created_at", { ascending: false });
      setJobs(data || []);
      setLoading(false);
    };
    load();
  }, []);

  const avgRating = jobs.filter(j => j.rating).length > 0
    ? (jobs.reduce((s,j) => s+(j.rating||0),0)/jobs.filter(j=>j.rating).length).toFixed(1) : "—";

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-[3px] border-orange-200 border-t-orange-500 rounded-full animate-spin" /></div>;

  return (
    <div className="page-container">
      <header className="page-header"><h1 className="font-bold text-lg">Job History</h1></header>
      <div className="px-4 py-6 pb-24">
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="card text-center" style={{background:"#fff7ed"}}>
            <p className="text-3xl font-bold text-orange-500">{jobs.length}</p>
            <p className="text-xs text-gray-400 mt-1">Jobs completed</p>
          </div>
          <div className="card text-center" style={{background:"#fffbeb"}}>
            <p className="text-3xl font-bold text-yellow-500">{avgRating}</p>
            <p className="text-xs text-gray-400 mt-1">Average rating</p>
          </div>
        </div>
        {jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400">
            <History size={48} className="mb-4" />
            <p className="text-sm">No completed jobs yet.</p>
          </div>
        ) : jobs.map(job => (
          <div key={job.id} className="card mb-3">
            <div className="flex items-start justify-between mb-1">
              <div>
                <p className="font-semibold text-sm">{getRequestTypeLabel(job.type)}</p>
                <p className="text-xs text-gray-400">{new Date(job.created_at).toLocaleDateString("en-GB",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})} · {job.camper?.name}</p>
              </div>
              {job.rating && <StarRating value={job.rating} readonly />}
            </div>
          </div>
        ))}
      </div>
      <BottomNav role="assistant" />
    </div>
  );
}
