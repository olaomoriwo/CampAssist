"use client";
/**
 * Camp Assistant KYC / Onboarding
 * 5 steps: Profile + Bio → Skills/Services → Gov ID → Selfie → Availability
 * Gated: assistant-signup redirects here; completion redirects to /assistant/dashboard
 * Demo mode: all local state, simulated face-match review
 */
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Camera, ChevronRight, ChevronLeft, Check, Shield,
  User, Briefcase, Clock, CheckCircle, X, Smile,
  AlertTriangle,
} from "lucide-react";

const ORANGE      = "#ea580c";
const ORANGE_DARK = "#c2410c";
const ORANGE_LIGHT = "#fff7ed";

const TOTAL_STEPS = 5;

const SERVICES = [
  { id: "tent_setup",      emoji: "⛺", label: "Tent Setup",           desc: "Erecting and securing tents" },
  { id: "tent_collection", emoji: "📦", label: "Tent Collection",      desc: "Collecting and packing down tents" },
  { id: "navigation",      emoji: "🗺️", label: "Festival Navigation",  desc: "Guiding campers around the site" },
  { id: "general_help",    emoji: "🙌", label: "General Help",         desc: "Miscellaneous support tasks" },
  { id: "heavy_lifting",   emoji: "💪", label: "Heavy Lifting",        desc: "Moving heavy equipment or luggage" },
  { id: "disability",      emoji: "♿", label: "Disability Support",   desc: "Assisting campers with accessibility needs" },
];

const DAYS = ["Friday", "Saturday", "Sunday"];
const SLOTS = ["Morning\n6am–12pm", "Afternoon\n12pm–6pm", "Evening\n6pm–2am"];

// ── Progress bar ──────────────────────────────────────────────────────────────
function ProgressBar({ step }: { step: number }) {
  const labels = ["Profile", "Skills", "ID", "Selfie", "Hours"];
  return (
    <div className="px-5 pt-5 pb-2">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Step {step} of {TOTAL_STEPS}</p>
        <p className="text-[11px] text-gray-400">{Math.round((step / TOTAL_STEPS) * 100)}%</p>
      </div>
      <div className="w-full h-1.5 rounded-full bg-gray-100 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500"
          style={{ width: `${(step / TOTAL_STEPS) * 100}%`, background: `linear-gradient(90deg, ${ORANGE}, ${ORANGE_DARK})` }} />
      </div>
      <div className="flex justify-between mt-2">
        {labels.map((label, i) => (
          <div key={label} className="flex flex-col items-center gap-1">
            <div className="w-5 h-5 rounded-full flex items-center justify-center"
              style={{
                background: i + 1 < step ? ORANGE : i + 1 === step ? ORANGE_LIGHT : "#f3f4f6",
                border: i + 1 === step ? `2px solid ${ORANGE}` : "none",
              }}>
              {i + 1 < step
                ? <Check size={10} className="text-white" />
                : <span className="w-1.5 h-1.5 rounded-full" style={{ background: i + 1 === step ? ORANGE : "#d1d5db" }} />
              }
            </div>
            <p className="text-[9px] font-semibold leading-tight text-center" style={{ color: i + 1 <= step ? ORANGE : "#9ca3af" }}>{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function NavButtons({ step, canNext, onBack, onNext, nextLabel = "Continue" }: {
  step: number; canNext: boolean; onBack: () => void; onNext: () => void; nextLabel?: string;
}) {
  return (
    <div className="flex gap-3 px-5 pb-8 pt-4">
      {step > 1 && (
        <button onClick={onBack} className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 bg-gray-100">
          <ChevronLeft size={18} className="text-gray-600" />
        </button>
      )}
      <button onClick={onNext} disabled={!canNext}
        className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-[14px] transition-all active:scale-97"
        style={{
          background: canNext ? `linear-gradient(135deg, ${ORANGE}, ${ORANGE_DARK})` : "#e5e7eb",
          color: canNext ? "#fff" : "#9ca3af",
          boxShadow: canNext ? `0 4px 14px rgba(234,88,12,0.3)` : "none",
        }}>
        {nextLabel} {canNext && <ChevronRight size={16} />}
      </button>
    </div>
  );
}

export default function AssistantOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [done, setDone] = useState(false);

  // Step 1
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [bio, setBio] = useState("");

  // Step 2
  const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set());

  // Step 3
  const [idType,    setIdType]    = useState("");
  const [idPreview, setIdPreview] = useState<string | null>(null);

  // Step 4
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);

  // Step 5: availability grid [day][slot] = boolean
  const [availability, setAvailability] = useState<boolean[][]>(
    Array(3).fill(null).map(() => Array(3).fill(false))
  );

  const photoRef  = useRef<HTMLInputElement>(null);
  const idRef     = useRef<HTMLInputElement>(null);
  const selfieRef = useRef<HTMLInputElement>(null);

  const toggleService = (id: string) => {
    setSelectedServices(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAvail = (day: number, slot: number) => {
    setAvailability(prev => {
      const next = prev.map(r => [...r]);
      next[day][slot] = !next[day][slot];
      return next;
    });
  };

  const totalSlots = availability.flat().filter(Boolean).length;

  const canProceed = () => {
    if (step === 1) return !!photoPreview && bio.trim().length >= 20;
    if (step === 2) return selectedServices.size >= 1;
    if (step === 3) return !!idType && !!idPreview;
    if (step === 4) return !!selfiePreview;
    if (step === 5) return totalSlots >= 1;
    return false;
  };

  const next = () => { if (step < TOTAL_STEPS) setStep(s => s + 1); else handleSubmit(); };
  const back = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    await new Promise(r => setTimeout(r, 1000));
    setDone(true);
  };

  // ── Success ───────────────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 gap-5 text-center animate-scale-in"
        style={{ background: ORANGE_LIGHT }}>
        <div className="w-24 h-24 rounded-[2rem] flex items-center justify-center shadow-xl"
          style={{ background: `linear-gradient(135deg, ${ORANGE}, ${ORANGE_DARK})` }}>
          <Briefcase size={40} className="text-white" />
        </div>
        <div>
          <p className="font-bold text-[22px] text-gray-900 mb-2">Application submitted! 🎉</p>
          <p className="text-[14px] text-gray-600 leading-relaxed max-w-xs">
            Our team is verifying your ID and selfie match. This typically takes 24–48 hours.
            You&apos;ll be notified as soon as you&apos;re approved.
          </p>
        </div>
        <div className="w-full max-w-xs space-y-2.5 rounded-2xl p-4"
          style={{ background: "#fff", border: "1px solid #fed7aa" }}>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Review process</p>
          {[
            { emoji: "🔍", text: "ID + selfie face match verified" },
            { emoji: "✅", text: "Skills profile reviewed by CampAssist" },
            { emoji: "📲", text: "You'll receive an in-app notification" },
            { emoji: "⛺", text: "Jobs start appearing in your dashboard" },
          ].map(item => (
            <div key={item.text} className="flex items-center gap-3">
              <span className="text-xl flex-shrink-0">{item.emoji}</span>
              <p className="text-[13px] text-gray-700 text-left">{item.text}</p>
            </div>
          ))}
        </div>
        <button onClick={() => router.push("/assistant-dashboard")}
          className="w-full max-w-xs py-4 rounded-2xl font-bold text-[15px] text-white"
          style={{ background: `linear-gradient(135deg, ${ORANGE}, ${ORANGE_DARK})`, boxShadow: `0 4px 20px rgba(234,88,12,0.35)` }}>
          Go to my dashboard →
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#f7f8fa" }}>
      {/* Header */}
      <div className="px-5 pt-6 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl flex items-center justify-center"
            style={{ background: ORANGE_LIGHT }}>
            <Briefcase size={18} style={{ color: ORANGE }} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Assistant Verification</p>
            <p className="font-bold text-[16px] text-gray-900">Your assistant profile</p>
          </div>
        </div>
        <Link href="/assistant-dashboard" className="text-[12px] font-semibold text-gray-400">Skip for now</Link>
      </div>

      <ProgressBar step={step} />

      <div className="px-5 pt-4 pb-2 animate-fade-in-up">

        {/* ── STEP 1: Photo + bio ── */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-bold text-[19px] text-gray-900 mb-1">Your profile</h2>
              <p className="text-[13px] text-gray-500 leading-relaxed">
                Campers choose assistants partly based on their profile photo and bio. Make a great first impression.
              </p>
            </div>

            <div className="flex flex-col items-center gap-4 py-2">
              {photoPreview ? (
                <div className="relative">
                  <img src={photoPreview} alt="Profile"
                    className="w-28 h-28 rounded-[2rem] object-cover shadow-lg"
                    style={{ border: `3px solid ${ORANGE}` }} />
                  <button onClick={() => setPhotoPreview(null)}
                    className="absolute -top-2 -right-2 w-7 h-7 rounded-xl flex items-center justify-center"
                    style={{ background: "#dc2626" }}>
                    <X size={13} className="text-white" />
                  </button>
                </div>
              ) : (
                <div className="w-28 h-28 rounded-[2rem] bg-gray-100 flex items-center justify-center"
                  style={{ border: "2px dashed #d1d5db" }}>
                  <User size={36} className="text-gray-300" />
                </div>
              )}
              <button onClick={() => photoRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-[13px] text-white"
                style={{ background: `linear-gradient(135deg, ${ORANGE}, ${ORANGE_DARK})` }}>
                <Camera size={14} /> {photoPreview ? "Retake" : "Add photo"}
              </button>
              <input ref={photoRef} type="file" accept="image/*" capture="user"
                className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) setPhotoPreview(URL.createObjectURL(f)); }} />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Short bio</label>
                <span className="text-[11px] text-gray-400">{bio.length}/200</span>
              </div>
              <textarea rows={4}
                placeholder="Tell campers a bit about yourself — your experience, personality, and why you love helping at festivals. Min 20 characters."
                value={bio} onChange={e => setBio(e.target.value.slice(0, 200))}
                className="w-full px-4 py-3.5 rounded-2xl text-[13px] leading-relaxed resize-none outline-none"
                style={{ background: "#fff", border: `1.5px solid ${bio.length >= 20 ? ORANGE : "#e5e7eb"}` }}
              />
              {bio.length < 20 && bio.length > 0 && (
                <p className="text-[11px] text-gray-400 mt-1">{20 - bio.length} more characters needed</p>
              )}
            </div>
          </div>
        )}

        {/* ── STEP 2: Skills / services ── */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-bold text-[19px] text-gray-900 mb-1">What can you offer?</h2>
              <p className="text-[13px] text-gray-500 leading-relaxed">
                Select all the services you&apos;re able and willing to provide. You&apos;ll only receive job requests for your selected services.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {SERVICES.map(svc => {
                const selected = selectedServices.has(svc.id);
                return (
                  <button key={svc.id} onClick={() => toggleService(svc.id)}
                    className="flex items-center gap-3 p-3.5 rounded-2xl text-left transition-all"
                    style={{
                      background: selected ? ORANGE_LIGHT : "#fff",
                      border: selected ? `2px solid ${ORANGE}` : "1.5px solid #e5e7eb",
                      boxShadow: selected ? `0 0 0 3px rgba(234,88,12,0.07)` : "0 1px 4px rgba(0,0,0,0.04)",
                    }}>
                    <span className="text-2xl flex-shrink-0">{svc.emoji}</span>
                    <div className="flex-1">
                      <p className="font-bold text-[13px] text-gray-900">{svc.label}</p>
                      <p className="text-[11px] text-gray-400">{svc.desc}</p>
                    </div>
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: selected ? ORANGE : "#f3f4f6", border: selected ? "none" : "1.5px solid #e5e7eb" }}>
                      {selected && <Check size={13} className="text-white" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {selectedServices.size >= 1 && (
              <div className="rounded-2xl p-3 flex items-center gap-2.5 animate-fade-in"
                style={{ background: ORANGE_LIGHT, border: `1px solid #fed7aa` }}>
                <CheckCircle size={14} style={{ color: ORANGE, flexShrink: 0 }} />
                <p className="text-[12px] font-semibold" style={{ color: ORANGE_DARK }}>
                  {selectedServices.size} service{selectedServices.size > 1 ? "s" : ""} selected
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── STEP 3: Gov ID ── */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-bold text-[19px] text-gray-900 mb-1">Government ID</h2>
              <p className="text-[13px] text-gray-500 leading-relaxed">
                As you&apos;ll be working directly with campers and their belongings, we require a valid government ID before you can accept jobs.
              </p>
            </div>

            <div className="space-y-2">
              {[
                { id: "passport", emoji: "🛂", label: "Passport", desc: "Photo page only" },
                { id: "driving",  emoji: "🚗", label: "Driving Licence", desc: "Front side" },
                { id: "national", emoji: "🪪", label: "National ID Card", desc: "Front + back" },
              ].map(opt => (
                <button key={opt.id} onClick={() => setIdType(opt.id)}
                  className="w-full flex items-center gap-3 p-3.5 rounded-2xl text-left transition-all"
                  style={{
                    background: "#fff",
                    border: idType === opt.id ? `2px solid ${ORANGE}` : "1.5px solid #e5e7eb",
                    boxShadow: idType === opt.id ? `0 0 0 3px rgba(234,88,12,0.07)` : "0 1px 4px rgba(0,0,0,0.04)",
                  }}>
                  <span className="text-2xl">{opt.emoji}</span>
                  <div className="flex-1">
                    <p className="font-bold text-[13px] text-gray-900">{opt.label}</p>
                    <p className="text-[11px] text-gray-400">{opt.desc}</p>
                  </div>
                  {idType === opt.id && <Check size={16} style={{ color: ORANGE }} />}
                </button>
              ))}
            </div>

            {idType && (
              <div className="animate-fade-in">
                {idPreview ? (
                  <div className="relative rounded-2xl overflow-hidden" style={{ height: "180px" }}>
                    <img src={idPreview} alt="ID" className="w-full h-full object-cover" />
                    <button onClick={() => setIdPreview(null)}
                      className="absolute top-2.5 right-2.5 w-8 h-8 rounded-xl flex items-center justify-center"
                      style={{ background: "rgba(0,0,0,0.6)" }}>
                      <X size={14} className="text-white" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center gap-3 rounded-2xl p-6 cursor-pointer"
                    style={{ border: "2px dashed #d1d5db", background: "#fefefe", minHeight: "130px" }}>
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: ORANGE_LIGHT }}>
                      <Shield size={22} style={{ color: ORANGE }} />
                    </div>
                    <p className="font-bold text-[13px] text-gray-700">Upload your ID</p>
                    <input ref={idRef} type="file" accept="image/*" capture="environment"
                      className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) setIdPreview(URL.createObjectURL(f)); }} />
                  </label>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── STEP 4: Selfie ── */}
        {step === 4 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-bold text-[19px] text-gray-900 mb-1">Take a selfie</h2>
              <p className="text-[13px] text-gray-500 leading-relaxed">
                We compare your live selfie with your ID photo to confirm it&apos;s really you. Use good lighting and look directly at the camera.
              </p>
            </div>

            <div className="rounded-2xl p-4 space-y-2" style={{ background: ORANGE_LIGHT, border: `1px solid #fed7aa` }}>
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Tips for a good selfie</p>
              {[
                "Remove glasses, hats, or anything covering your face",
                "Ensure your face is well-lit and fully visible",
                "Look directly into the camera lens",
                "Neutral expression, similar to your ID photo",
              ].map(tip => (
                <div key={tip} className="flex items-start gap-2">
                  <Check size={12} style={{ color: ORANGE, flexShrink: 0, marginTop: 2 }} />
                  <p className="text-[12px] text-gray-700">{tip}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col items-center gap-4 py-2">
              {selfiePreview ? (
                <div className="relative">
                  <img src={selfiePreview} alt="Selfie"
                    className="w-40 h-40 rounded-[2rem] object-cover shadow-lg"
                    style={{ border: `3px solid ${ORANGE}` }} />
                  <button onClick={() => setSelfiePreview(null)}
                    className="absolute -top-2 -right-2 w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: "#dc2626" }}>
                    <X size={14} className="text-white" />
                  </button>
                </div>
              ) : (
                <div className="w-40 h-40 rounded-[2rem] bg-gray-100 flex items-center justify-center"
                  style={{ border: "2px dashed #d1d5db" }}>
                  <Smile size={50} className="text-gray-200" />
                </div>
              )}
              <button onClick={() => selfieRef.current?.click()}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-[14px] text-white"
                style={{ background: `linear-gradient(135deg, ${ORANGE}, ${ORANGE_DARK})`, boxShadow: `0 4px 14px rgba(234,88,12,0.3)` }}>
                <Camera size={16} /> {selfiePreview ? "Retake selfie" : "Take selfie"}
              </button>
              <input ref={selfieRef} type="file" accept="image/*" capture="user"
                className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) setSelfiePreview(URL.createObjectURL(f)); }} />
            </div>

            <div className="rounded-2xl p-3.5 flex items-start gap-2.5"
              style={{ background: "#fffbeb", border: "1px solid #fde68a" }}>
              <Shield size={14} style={{ color: "#b45309", flexShrink: 0, marginTop: 2 }} />
              <p className="text-[12px] text-amber-800 leading-relaxed">
                Your selfie is used solely for the face-match check and deleted after verification.
                It is never stored on our servers or shared.
              </p>
            </div>
          </div>
        )}

        {/* ── STEP 5: Availability ── */}
        {step === 5 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-bold text-[19px] text-gray-900 mb-1">Your availability</h2>
              <p className="text-[13px] text-gray-500 leading-relaxed">
                Select the time slots you&apos;re available to work. You&apos;ll only receive job requests during your available windows.
              </p>
            </div>

            <div className="rounded-2xl overflow-hidden" style={{ border: "1.5px solid #e5e7eb" }}>
              {/* Header row */}
              <div className="grid grid-cols-4 bg-gray-50">
                <div className="p-3" />
                {SLOTS.map((slot, si) => (
                  <div key={si} className="p-2 text-center border-l border-gray-100">
                    {slot.split("\n").map((line, li) => (
                      <p key={li} className={li === 0 ? "text-[11px] font-bold text-gray-700" : "text-[9px] text-gray-400"}>{line}</p>
                    ))}
                  </div>
                ))}
              </div>
              {/* Day rows */}
              {DAYS.map((day, di) => (
                <div key={day} className="grid grid-cols-4 border-t border-gray-100">
                  <div className="p-3 flex items-center">
                    <p className="text-[12px] font-bold text-gray-700">{day}</p>
                  </div>
                  {SLOTS.map((_, si) => {
                    const active = availability[di][si];
                    return (
                      <button key={si} onClick={() => toggleAvail(di, si)}
                        className="p-3 flex items-center justify-center border-l border-gray-100 transition-all"
                        style={{ background: active ? ORANGE_LIGHT : "transparent" }}>
                        <div className="w-7 h-7 rounded-xl flex items-center justify-center transition-all"
                          style={{ background: active ? ORANGE : "#f3f4f6", border: active ? "none" : "1.5px solid #e5e7eb" }}>
                          {active && <Check size={13} className="text-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            {totalSlots > 0 && (
              <div className="rounded-2xl p-3 flex items-center gap-2.5 animate-fade-in"
                style={{ background: ORANGE_LIGHT, border: `1px solid #fed7aa` }}>
                <Clock size={14} style={{ color: ORANGE, flexShrink: 0 }} />
                <p className="text-[12px] font-semibold" style={{ color: ORANGE_DARK }}>
                  {totalSlots} slot{totalSlots > 1 ? "s" : ""} selected — you can update this anytime in settings
                </p>
              </div>
            )}

            <div className="rounded-2xl p-3.5 flex items-start gap-2.5"
              style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
              <AlertTriangle size={14} className="text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-[12px] text-green-800 leading-relaxed">
                Select at least 1 slot. Your availability can be changed from your dashboard settings at any time.
              </p>
            </div>
          </div>
        )}

      </div>

      <NavButtons
        step={step}
        canNext={canProceed()}
        onBack={back}
        onNext={next}
        nextLabel={step === TOTAL_STEPS ? "Submit application" : "Continue"}
      />
    </div>
  );
}
