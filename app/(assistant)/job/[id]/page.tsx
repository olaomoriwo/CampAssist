"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import BottomNav from "@/components/ui/BottomNav";
import { MapPin, Phone, ChevronRight, CheckCircle } from "lucide-react";
import { getRequestTypeLabel } from "@/lib/utils";
import { DEMO_MODE, DEMO_JOBS } from "@/lib/demo-data";

export default function ActiveJobPage() {
  const [request, setRequest] = useState<any>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [completed, setCompleted] = useState(false);
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    if (DEMO_MODE) {
      const job = DEMO_JOBS.find(j => j.id === params.id) || DEMO_JOBS[0];
      setRequest({ ...job, status: "accepted" });
      setLoading(false);
      return;
    }
    supabase.from("assistance_requests").select("*, camper:profiles!camper_id(name, phone)").eq("id", params.id).single()
      .then(({ data }) => { setRequest(data); setLoading(false); });
  }, [params.id]);

  const updateStatus = async (newStatus: string) => {
    setUpdating(true);
    if (DEMO_MODE) {
      if (newStatus === "complete") setCompleted(true);
      else setRequest((r: any) => ({ ...r, status: newStatus }));
      setUpdating(false);
      return;
    }
    await supabase.from("assistance_requests").update({ status: newStatus, ...(notes ? { notes } : {}) }).eq("id", request.id);
    await fetch("/api/pusher/trigger", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channel: `request-${request.id}`, event: newStatus === "complete" ? "job-complete" : "job-status-update", data: { requestId: request.id, status: newStatus } }),
    });
    if (newStatus === "complete") setCompleted(true);
    else setRequest((r: any) => ({ ...r, status: newStatus }));
    setUpdating(false);
  };

  const STATUS_STEPS = [
    { from: "accepted", to: "in_progress", label: "Start Job" },
    { from: "in_progress", to: "complete", label: "Mark Complete" },
  ];

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-[3px] border-orange-200 border-t-orange-500 rounded-full animate-spin" /></div>;

  if (completed) return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4"><CheckCircle size={32} className="text-green-600" /></div>
      <h2 className="text-xl font-bold mb-2">Job Complete! 🎉</h2>
      <p className="text-gray-500 text-sm mb-8">The camper has been notified. Great work!</p>
      <Link href="/assistant-dashboard" className="btn-primary max-w-xs block text-center" style={{background:"#ea580c"}}>Back to Dashboard</Link>
    </div>
  );

  if (!request) return <div className="min-h-screen flex items-center justify-center"><p>Job not found</p></div>;

  const currentStep = STATUS_STEPS.find(s => s.from === request.status);
  const doneStatuses = request.status === "in_progress" ? ["accepted"] : request.status === "complete" ? ["accepted","in_progress"] : [];

  return (
    <div className="page-container">
      <header className="page-header">
        <Link href="/assistant-dashboard" className="text-gray-500"><ChevronRight size={20} className="rotate-180" /></Link>
        <h1 className="font-bold text-lg">Active Job</h1>
      </header>
      <div className="px-4 py-6 pb-24 space-y-4">
        <div className="card">
          <p className="text-xs text-gray-400 mb-1">Job Type</p>
          <p className="font-bold text-xl">{getRequestTypeLabel(request.type)}</p>
          {request.description && <p className="text-sm text-gray-600 mt-1">{request.description}</p>}
        </div>
        <div className="card">
          <div className="flex items-center gap-2 mb-2"><MapPin size={16} className="text-red-500" /><p className="font-semibold text-sm">Camper Location</p></div>
          <p className="text-gray-700">{request.location_description}</p>
        </div>
        {request.camper && (
          <div className="card">
            <p className="text-xs text-gray-400 mb-2">Camper</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center font-bold text-primary-700">{request.camper.name?.charAt(0)}</div>
              <div>
                <p className="font-semibold text-sm">{request.camper.name}</p>
                {request.camper.phone && <a href={`tel:${request.camper.phone}`} className="text-xs text-primary-600 flex items-center gap-1"><Phone size={11} />{request.camper.phone}</a>}
              </div>
            </div>
          </div>
        )}
        <div className="card">
          <p className="text-sm font-semibold mb-3">Progress</p>
          {["accepted","in_progress","complete"].map((s,i) => (
            <div key={s} className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{background:doneStatuses.includes(s)||request.status===s?"#ea580c":"#e5e7eb"}}>
                <span className="text-xs font-bold" style={{color:doneStatuses.includes(s)||request.status===s?"#fff":"#9ca3af"}}>{i+1}</span>
              </div>
              <span className="text-sm capitalize" style={{color:doneStatuses.includes(s)||request.status===s?"#111":"#9ca3af"}}>{s.replace("_"," ")}</span>
            </div>
          ))}
        </div>
        <textarea className="input resize-none" rows={2} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes (optional) — e.g. used spare pole from van..." />
        {currentStep && (
          <button onClick={() => updateStatus(currentStep.to)} disabled={updating} className="btn-primary flex items-center justify-center gap-2" style={{background:"#ea580c"}}>
            {updating ? "Updating..." : <>{currentStep.label} <ChevronRight size={18} /></>}
          </button>
        )}
      </div>
      <BottomNav role="assistant" />
    </div>
  );
}
