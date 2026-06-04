"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import BottomNav from "@/components/ui/BottomNav";
import StatusBadge from "@/components/ui/StatusBadge";
import { AssistanceRequest } from "@/types";
import { channels, events } from "@/lib/pusher";
import { ArrowLeft, MapPin, User, Phone, CheckCircle, ChevronRight } from "lucide-react";
import { getRequestTypeLabel } from "@/lib/utils";

const STATUS_STEPS = [
  { from: "accepted", to: "in_progress", label: "Start Job", event: events.JOB_STATUS_UPDATE },
  { from: "in_progress", to: "complete", label: "Mark Complete", event: events.JOB_COMPLETE },
];

export default function ActiveJobPage() {
  const [request, setRequest] = useState<AssistanceRequest | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [completed, setCompleted] = useState(false);
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("assistance_requests")
        .select("*, camper:profiles!camper_id(name, phone)")
        .eq("id", params.id)
        .single();
      setRequest(data);
      setLoading(false);
    };
    load();
  }, [params.id]);

  const updateStatus = async (newStatus: string) => {
    if (!request) return;
    setUpdating(true);

    await supabase.from("assistance_requests")
      .update({ status: newStatus, ...(notes ? { notes } : {}) })
      .eq("id", request.id);

    // Notify camper via Pusher
    await fetch("/api/pusher/trigger", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        channel: channels.jobStatus(request.id),
        event: newStatus === "complete" ? events.JOB_COMPLETE : events.JOB_STATUS_UPDATE,
        data: { requestId: request.id, status: newStatus },
      }),
    });

    if (newStatus === "complete") {
      setCompleted(true);
    } else {
      setRequest(r => r ? { ...r, status: newStatus as any } : r);
    }
    setUpdating(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-[3px] border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>;

  if (completed) return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
        <CheckCircle size={32} className="text-green-600" />
      </div>
      <h2 className="text-xl font-bold mb-2">Job Complete! 🎉</h2>
      <p className="text-gray-500 text-sm mb-8">The camper has been notified. Great work!</p>
      <Link href="/assistant-dashboard" className="btn-primary max-w-xs">Back to Dashboard</Link>
    </div>
  );

  if (!request) return <div className="min-h-screen flex items-center justify-center"><p>Job not found</p></div>;

  const camper = (request as any).camper;
  const currentStep = STATUS_STEPS.find(s => s.from === request.status);

  return (
    <div className="page-container">
      <header className="page-header">
        <div className="flex items-center gap-3">
          <Link href="/assistant-dashboard" className="text-gray-500"><ArrowLeft size={20} /></Link>
          <div>
            <h1 className="font-bold text-lg">Active Job</h1>
            <StatusBadge status={request.status} />
          </div>
        </div>
      </header>

      <div className="px-4 py-6 space-y-4">
        {/* Job type */}
        <div className="card">
          <p className="text-xs text-gray-400 mb-1">Job Type</p>
          <p className="font-bold text-xl text-gray-900">{getRequestTypeLabel(request.type)}</p>
          {request.description && (
            <p className="text-sm text-gray-600 mt-2">{request.description}</p>
          )}
        </div>

        {/* Camper location */}
        <div className="card">
          <div className="flex items-center gap-2 mb-2">
            <MapPin size={16} className="text-red-500 shrink-0" />
            <p className="font-semibold text-sm text-gray-900">Camper Location</p>
          </div>
          <p className="text-gray-700">{request.location_description}</p>
        </div>

        {/* Camper details */}
        {camper && (
          <div className="card">
            <p className="text-xs text-gray-400 mb-3">Camper Details</p>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <User size={16} className="text-primary-600" />
              </div>
              <div>
                <p className="font-semibold text-sm">{camper.name}</p>
              </div>
            </div>
            {camper.phone && (
              <a href={`tel:${camper.phone}`}
                className="flex items-center gap-2 text-primary-600 text-sm font-medium hover:underline">
                <Phone size={14} /> {camper.phone}
              </a>
            )}
          </div>
        )}

        {/* Notes */}
        <div className="card">
          <label className="block text-xs text-gray-400 mb-2">Job notes (optional)</label>
          <textarea
            className="input resize-none text-sm"
            rows={3}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="e.g. Tent pole missing, used spare from van..."
          />
        </div>

        {/* Progress steps */}
        <div className="card space-y-3">
          <p className="text-sm font-semibold text-gray-900">Progress</p>
          {["accepted", "in_progress", "complete"].map((status, i) => (
            <div key={status} className={`flex items-center gap-3 ${
              request.status === status || (request.status === "in_progress" && status === "accepted") || (request.status === "complete" && status !== "complete")
                ? "opacity-100" : "opacity-40"
            }`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                (status === "accepted" && ["accepted", "in_progress", "complete"].includes(request.status)) ||
                (status === "in_progress" && ["in_progress", "complete"].includes(request.status)) ||
                (status === "complete" && request.status === "complete")
                  ? "bg-primary-600 text-white" : "bg-gray-100 text-gray-400"
              }`}>
                {i + 1}
              </div>
              <span className="text-sm capitalize">{status.replace("_", " ")}</span>
            </div>
          ))}
        </div>

        {/* Action button */}
        {currentStep && (
          <button onClick={() => updateStatus(currentStep.to)} disabled={updating}
            className="btn-primary flex items-center justify-center gap-2">
            {updating ? "Updating..." : (
              <>
                {currentStep.label}
                <ChevronRight size={18} />
              </>
            )}
          </button>
        )}
      </div>

      <BottomNav role="assistant" />
    </div>
  );
}
