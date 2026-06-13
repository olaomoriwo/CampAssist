"use client";
/**
 * Camper › Report an Assistant
 *
 * Accessible ONLY from a specific request card where an assistant is assigned.
 * The requestId param drives the context — we look up which assistant is tied
 * to that job and lock the report to that relationship.
 *
 * Access rules (enforced client-side for demo):
 *   - Request must exist and belong to this camper
 *   - Request must have an assigned_assistant_id
 *   - Status must be: accepted | in_progress | complete
 *   (pending = no one assigned yet; cancelled = no engagement)
 */
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, AlertTriangle, Camera, X, CheckCircle, Shield } from "lucide-react";
import { DEMO_MODE, DEMO_REQUESTS, DEMO_ASSISTANT_PROFILE, type MisconductType } from "@/lib/demo-data";
import { getRequestTypeLabel } from "@/lib/utils";

// ── Misconduct options ────────────────────────────────────────────────────────
const MISCONDUCT_OPTIONS: {
  type: MisconductType;
  label: string;
  emoji: string;
  desc: string;
}[] = [
  { type: "rude_behavior",     emoji: "😤", label: "Rude / Unprofessional", desc: "Disrespectful language or attitude" },
  { type: "no_show",           emoji: "🚶", label: "No-show / Late",         desc: "Failed to arrive or severely delayed" },
  { type: "damaged_property",  emoji: "🏚️", label: "Damaged Property",      desc: "Broke or damaged your belongings" },
  { type: "harassment",        emoji: "🚨", label: "Harassment",             desc: "Unwanted or threatening behaviour" },
  { type: "theft",             emoji: "🔓", label: "Theft",                  desc: "Something was taken without consent" },
  { type: "other",             emoji: "📝", label: "Other",                  desc: "Something not listed above" },
];

const REPORTABLE_STATUSES = ["accepted", "in_progress", "complete"];

export default function ReportAssistantPage() {
  const params    = useParams();
  const router    = useRouter();
  const requestId = params.requestId as string;

  // ── Resolve request from demo data (or real API in production) ────────────
  const request = DEMO_MODE
    ? DEMO_REQUESTS.find(r => r.id === requestId)
    : null; // production: fetch from API

  const assistantName = DEMO_ASSISTANT_PROFILE.name; // demo: always Chidi Musa

  // ── Form state ────────────────────────────────────────────────────────────
  const [selectedType, setSelectedType] = useState<MisconductType | null>(null);
  const [description,  setDescription]  = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageName,    setImageName]    = useState<string | null>(null);
  const [submitted,    setSubmitted]    = useState(false);
  const [submitting,   setSubmitting]   = useState(false);

  // ── Access guard ──────────────────────────────────────────────────────────
  if (!DEMO_MODE && !request) {
    // Production: loading state while fetching
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f7f8fa" }}>
        <div className="w-8 h-8 spinner" />
      </div>
    );
  }

  // No request found or not eligible
  if (DEMO_MODE && (!request || !request.assigned_assistant_id || !REPORTABLE_STATUSES.includes(request.status))) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 gap-4 text-center" style={{ background: "#f7f8fa" }}>
        <div className="w-16 h-16 rounded-3xl bg-gray-100 flex items-center justify-center">
          <Shield size={28} className="text-gray-400" />
        </div>
        <p className="font-bold text-[16px] text-gray-800">Nothing to report here</p>
        <p className="text-[13px] text-gray-500 leading-relaxed max-w-xs">
          You can only report an assistant when they&apos;re actively working on a job for you,
          or have completed one.
        </p>
        <Link href="/my-requests"
          className="mt-2 px-6 py-3 rounded-2xl font-bold text-[14px] text-white"
          style={{ background: "linear-gradient(135deg, #16a34a, #15803d)" }}>
          Back to My Requests
        </Link>
      </div>
    );
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImagePreview(url);
    setImageName(file.name);
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageName(null);
  };

  const handleSubmit = async () => {
    if (!selectedType || !description.trim()) return;
    setSubmitting(true);
    // Demo: simulate API call
    await new Promise(r => setTimeout(r, 1200));
    setSubmitting(false);
    setSubmitted(true);
  };

  const canSubmit = !!selectedType && description.trim().length >= 20;

  // ── Success screen ────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 gap-5 text-center animate-scale-in"
        style={{ background: "#f7f8fa" }}>
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-lg"
          style={{ background: "linear-gradient(135deg, #16a34a, #15803d)" }}>
          <CheckCircle size={38} className="text-white" />
        </div>
        <div>
          <p className="font-bold text-[20px] text-gray-900 mb-2">Report Submitted</p>
          <p className="text-[13px] text-gray-500 leading-relaxed max-w-xs">
            Our admin team will review your report within 24 hours.
            We take misconduct seriously and will keep you updated.
          </p>
        </div>

        <div className="w-full max-w-xs rounded-2xl p-4 text-left space-y-2"
          style={{ background: "#fff", border: "1px solid #e5e7eb" }}>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">What happens next</p>
          {[
            "Admin reviews evidence and description",
            "Assistant is contacted for their account",
            "A decision is made within 24 hrs",
            "You'll be notified of the outcome",
          ].map((step, i) => (
            <div key={step} className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white mt-0.5"
                style={{ background: "#16a34a" }}>
                {i + 1}
              </div>
              <p className="text-[12px] text-gray-600 leading-snug">{step}</p>
            </div>
          ))}
        </div>

        <Link href="/my-requests"
          className="w-full max-w-xs font-bold py-4 rounded-2xl text-[14px] text-center text-white"
          style={{ background: "linear-gradient(135deg, #16a34a, #15803d)", boxShadow: "0 4px 14px rgba(22,163,74,0.3)" }}>
          Back to My Requests
        </Link>
      </div>
    );
  }

  // ── Main form ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen pb-10" style={{ background: "#f7f8fa" }}>
      {/* Header */}
      <div className="page-header justify-between">
        <div className="flex items-center gap-2.5">
          <Link href="/my-requests"
            className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center">
            <ArrowLeft size={16} className="text-gray-600" />
          </Link>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Misconduct</p>
            <h1 className="font-bold text-[17px] text-gray-900">Report Assistant</h1>
          </div>
        </div>
        <div className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: "#fef2f2" }}>
          <AlertTriangle size={16} style={{ color: "#dc2626" }} />
        </div>
      </div>

      <div className="px-4 pt-4 space-y-5 animate-fade-in-up">

        {/* Context card — which job this is tied to */}
        {request && (
          <div className="rounded-2xl p-4 flex items-center gap-3"
            style={{ background: "#fff", border: "1px solid #e5e7eb" }}>
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 text-xl"
              style={{ background: "#fef2f2" }}>
              ⚠️
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Reporting assistant for</p>
              <p className="font-bold text-[13px] text-gray-900">{getRequestTypeLabel(request.type)}</p>
              <p className="text-[12px] text-gray-500 mt-0.5">
                Assigned to <span className="font-semibold text-gray-700">{assistantName}</span>
              </p>
            </div>
          </div>
        )}

        {/* Warning */}
        <div className="rounded-2xl p-3.5 flex items-start gap-2.5"
          style={{ background: "#fffbeb", border: "1px solid #fde68a" }}>
          <AlertTriangle size={14} style={{ color: "#b45309", marginTop: "1px", flexShrink: 0 }} />
          <p className="text-[12px] text-amber-800 leading-relaxed">
            <strong>Please be accurate.</strong> False reports affect an assistant&apos;s livelihood.
            Abusing this feature may result in your account being reviewed.
          </p>
        </div>

        {/* Misconduct type selector */}
        <div>
          <p className="section-title mb-3">What happened?</p>
          <div className="grid grid-cols-2 gap-2.5">
            {MISCONDUCT_OPTIONS.map(opt => (
              <button key={opt.type}
                onClick={() => setSelectedType(opt.type)}
                className="text-left rounded-2xl p-3.5 transition-all active:scale-97"
                style={{
                  background: selectedType === opt.type ? "#fff" : "#fff",
                  border: selectedType === opt.type ? "2px solid #dc2626" : "1.5px solid #e5e7eb",
                  boxShadow: selectedType === opt.type ? "0 0 0 3px rgba(220,38,38,0.08)" : "0 1px 3px rgba(0,0,0,0.04)",
                }}>
                <p className="text-2xl mb-1.5">{opt.emoji}</p>
                <p className="font-bold text-[12px] text-gray-900 leading-tight">{opt.label}</p>
                <p className="text-[10px] text-gray-400 mt-0.5 leading-snug">{opt.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <p className="section-title mb-2">Describe what happened</p>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={5}
            placeholder="Give as much detail as possible — time, what was said or done, how it made you feel. Minimum 20 characters."
            className="w-full rounded-2xl p-4 text-[13px] text-gray-800 leading-relaxed resize-none outline-none transition-all"
            style={{
              background: "#fff",
              border: description.length >= 20 ? "1.5px solid #16a34a" : "1.5px solid #e5e7eb",
              boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
            }}
          />
          <div className="flex items-center justify-between mt-1.5 px-1">
            <p className="text-[11px] text-gray-400">
              {description.length < 20 ? `${20 - description.length} more characters needed` : "✓ Good length"}
            </p>
            <p className="text-[11px] text-gray-400">{description.length}/500</p>
          </div>
        </div>

        {/* Image evidence */}
        <div>
          <p className="section-title mb-2">Add photo evidence <span className="font-normal text-gray-400">(optional)</span></p>
          {imagePreview ? (
            <div className="relative rounded-2xl overflow-hidden" style={{ height: "180px" }}>
              <img src={imagePreview} alt="Evidence" className="w-full h-full object-cover" />
              <button onClick={removeImage}
                className="absolute top-2.5 right-2.5 w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(0,0,0,0.6)" }}>
                <X size={14} className="text-white" />
              </button>
              {imageName && (
                <div className="absolute bottom-0 left-0 right-0 px-3 py-2"
                  style={{ background: "rgba(0,0,0,0.5)" }}>
                  <p className="text-[11px] text-white font-medium truncate">{imageName}</p>
                </div>
              )}
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center gap-3 rounded-2xl p-6 cursor-pointer transition-all"
              style={{ border: "2px dashed #d1d5db", background: "#fefefe", minHeight: "130px" }}>
              <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center">
                <Camera size={22} className="text-gray-400" />
              </div>
              <div className="text-center">
                <p className="text-[13px] font-semibold text-gray-700">Add a photo</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Tap to take a photo or choose from library</p>
              </div>
              <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageChange} />
            </label>
          )}
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit || submitting}
          className="w-full font-bold py-4 rounded-2xl text-[14px] transition-all active:scale-97 flex items-center justify-center gap-2"
          style={{
            background: canSubmit ? "linear-gradient(135deg, #dc2626, #b91c1c)" : "#e5e7eb",
            color: canSubmit ? "#fff" : "#9ca3af",
            boxShadow: canSubmit ? "0 4px 14px rgba(220,38,38,0.3)" : "none",
          }}>
          {submitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Submitting report...
            </>
          ) : (
            <>⚠️ Submit Report</>
          )}
        </button>

        <p className="text-[11px] text-gray-400 text-center leading-relaxed pb-2">
          Your report is private. Only CampAssist admin can see it.
          The assistant is not shown your name until admin decides it is necessary.
        </p>

      </div>
    </div>
  );
}
