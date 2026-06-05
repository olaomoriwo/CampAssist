"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import BottomNav from "@/components/ui/BottomNav";
import StatusBadge from "@/components/ui/StatusBadge";
import StarRating from "@/components/ui/StarRating";
import { AssistanceRequest } from "@/types";
import { ArrowLeft, HelpCircle } from "lucide-react";
import { getRequestTypeLabel } from "@/lib/utils";
import { DEMO_MODE, DEMO_REQUESTS } from "@/lib/demo-data";

export default function MyRequestsPage() {
  const [requests, setRequests] = useState<AssistanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const supabase = createClient();

  useEffect(() => {
    if (DEMO_MODE) {
      setRequests(DEMO_REQUESTS as unknown as AssistanceRequest[]);
      setLoading(false);
      return;
    }
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data } = await supabase.from("assistance_requests").select("*").eq("camper_id", user.id).order("created_at", { ascending: false });
      setRequests(data || []);
      setLoading(false);
    };
    load();
  }, []);

  const handleCancel = async (id: string) => {
    if (DEMO_MODE) { setRequests(r => r.map(x => x.id === id ? { ...x, status: "cancelled" as any } : x)); return; }
    await supabase.from("assistance_requests").update({ status: "cancelled" }).eq("id", id);
    setRequests(r => r.map(x => x.id === id ? { ...x, status: "cancelled" as any } : x));
  };

  const handleRate = async (id: string, stars: number) => {
    setRatings(r => ({ ...r, [id]: stars }));
    if (!DEMO_MODE) await supabase.from("assistance_requests").update({ rating: stars }).eq("id", id);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-[3px] border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>;

  return (
    <div className="page-container">
      <header className="page-header">
        <Link href="/dashboard" className="text-gray-500"><ArrowLeft size={20} /></Link>
        <h1 className="font-bold text-lg">My Requests</h1>
      </header>
      <div className="px-4 py-6 pb-24">
        {requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <HelpCircle size={48} className="text-gray-200 mb-4" />
            <p className="text-gray-500 text-sm">No requests yet.</p>
            <Link href="/request-help" className="mt-4 text-primary-600 text-sm font-medium">Request help →</Link>
          </div>
        ) : (
          requests.map(req => (
            <div key={req.id} className="card mb-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold text-sm text-gray-900">{getRequestTypeLabel(req.type)}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{new Date(req.created_at).toLocaleDateString("en-GB", { day:"numeric", month:"short", hour:"2-digit", minute:"2-digit" })}</p>
                </div>
                <StatusBadge status={req.status} />
              </div>
              <p className="text-sm text-gray-600 mb-2">{req.location_description}</p>
              {req.status === "pending" && (
                <button onClick={() => handleCancel(req.id)} className="text-xs text-red-500 font-medium bg-none border-none cursor-pointer p-0">Cancel request</button>
              )}
              {req.status === "complete" && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Rate your assistant</p>
                  <StarRating value={ratings[req.id] ?? req.rating ?? 0} onChange={s => handleRate(req.id, s)} readonly={!!req.rating} />
                </div>
              )}
            </div>
          ))
        )}
      </div>
      <BottomNav role="camper" />
    </div>
  );
}
