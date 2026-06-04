"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import BottomNav from "@/components/ui/BottomNav";
import StatusBadge from "@/components/ui/StatusBadge";
import StarRating from "@/components/ui/StarRating";
import { AssistanceRequest } from "@/types";
import { ArrowLeft, HelpCircle } from "lucide-react";
import { getRequestTypeLabel } from "@/lib/utils";

export default function MyRequestsPage() {
  const [requests, setRequests] = useState<AssistanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState<Record<string, number>>({});
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data } = await supabase
        .from("assistance_requests")
        .select("*")
        .eq("camper_id", user.id)
        .order("created_at", { ascending: false });
      setRequests(data || []);
      setLoading(false);
    };
    load();
  }, []);

  const handleCancel = async (id: string) => {
    await supabase.from("assistance_requests").update({ status: "cancelled" }).eq("id", id);
    setRequests(r => r.map(req => req.id === id ? { ...req, status: "cancelled" } : req));
  };

  const handleRate = async (id: string, stars: number) => {
    setRating(r => ({ ...r, [id]: stars }));
    await supabase.from("assistance_requests").update({ rating: stars }).eq("id", id);
    setRequests(r => r.map(req => req.id === id ? { ...req, rating: stars } : req));
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-[3px] border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>;

  return (
    <div className="page-container">
      <header className="page-header">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-gray-500"><ArrowLeft size={20} /></Link>
          <h1 className="font-bold text-lg">My Requests</h1>
        </div>
      </header>

      <div className="px-4 py-6">
        {requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <HelpCircle size={48} className="text-gray-200 mb-4" />
            <p className="text-gray-500 text-sm">No requests yet.</p>
            <Link href="/request-help" className="mt-4 text-primary-600 text-sm font-medium hover:underline">
              Request help →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map(req => (
              <div key={req.id} className="card space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{getRequestTypeLabel(req.type)}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(req.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <StatusBadge status={req.status} />
                </div>

                <p className="text-sm text-gray-600">{req.location_description}</p>
                {req.description && <p className="text-xs text-gray-400">{req.description}</p>}

                {/* Cancel button for pending requests */}
                {req.status === "pending" && (
                  <button onClick={() => handleCancel(req.id)}
                    className="text-xs text-red-500 hover:text-red-700 font-medium">
                    Cancel request
                  </button>
                )}

                {/* Rating for completed requests */}
                {req.status === "complete" && (
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Rate your assistant</p>
                    <StarRating
                      value={rating[req.id] ?? req.rating ?? 0}
                      onChange={(stars) => handleRate(req.id, stars)}
                      readonly={!!(req.rating)}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav role="camper" />
    </div>
  );
}
