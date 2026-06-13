"use client";
/**
 * Camper KYC / Onboarding
 * 4 steps: Profile photo → Date of birth (age gate) → Gov ID upload → Emergency contact
 * Gated: signup redirects here; completion redirects to /dashboard
 * Demo mode: all local state, no real document verification
 */
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Camera, Upload, ChevronRight, ChevronLeft, Check,
  Shield, AlertTriangle, User, Phone, Heart, Calendar,
  CreditCard, CheckCircle, X,
} from "lucide-react";

const GREEN      = "#16a34a";
const GREEN_DARK = "#15803d";
const GREEN_LIGHT = "#f0fdf4";

const TOTAL_STEPS = 4;

type AgeGroup = "adult" | "minor" | "under16" | null;

interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

// ── Progress bar ──────────────────────────────────────────────────────────────
function ProgressBar({ step }: { step: number }) {
  return (
    <div className="px-5 pt-5 pb-2">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
          Step {step} of {TOTAL_STEPS}
        </p>
        <p className="text-[11px] text-gray-400">{Math.round((step / TOTAL_STEPS) * 100)}%</p>
      </div>
      <div className="w-full h-1.5 rounded-full bg-gray-100 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500"
          style={{ width: `${(step / TOTAL_STEPS) * 100}%`, background: `linear-gradient(90deg, ${GREEN}, ${GREEN_DARK})` }} />
      </div>
      <div className="flex justify-between mt-2">
        {["Photo", "Age", "ID", "Emergency"].map((label, i) => (
          <div key={label} className="flex flex-col items-center gap-1">
            <div className="w-5 h-5 rounded-full flex items-center justify-center"
              style={{
                background: i + 1 < step ? GREEN : i + 1 === step ? GREEN_LIGHT : "#f3f4f6",
                border: i + 1 === step ? `2px solid ${GREEN}` : "none",
              }}>
              {i + 1 < step
                ? <Check size={10} className="text-white" />
                : <span className="w-1.5 h-1.5 rounded-full" style={{ background: i + 1 === step ? GREEN : "#d1d5db" }} />
              }
            </div>
            <p className="text-[9px] font-semibold" style={{ color: i + 1 <= step ? GREEN : "#9ca3af" }}>{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Nav buttons ───────────────────────────────────────────────────────────────
function NavButtons({
  step, canNext, onBack, onNext, nextLabel = "Continue",
}: { step: number; canNext: boolean; onBack: () => void; onNext: () => void; nextLabel?: string }) {
  return (
    <div className="flex gap-3 px-5 pb-8 pt-4">
      {step > 1 && (
        <button onClick={onBack}
          className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 bg-gray-100">
          <ChevronLeft size={18} className="text-gray-600" />
        </button>
      )}
      <button onClick={onNext} disabled={!canNext}
        className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-[14px] transition-all active:scale-97"
        style={{
          background: canNext ? `linear-gradient(135deg, ${GREEN}, ${GREEN_DARK})` : "#e5e7eb",
          color: canNext ? "#fff" : "#9ca3af",
          boxShadow: canNext ? `0 4px 14px rgba(22,163,74,0.3)` : "none",
        }}>
        {nextLabel} {canNext && <ChevronRight size={16} />}
      </button>
    </div>
  );
}

export default function CamperOnboardingPage() {
  const router = useRouter();
  const [step, setStep]   = useState(1);
  const [done, setDone]   = useState(false);

  // Step 1: profile photo
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Step 2: DOB / age gate
  const [dob, setDob]         = useState("");
  const [ageGroup, setAgeGroup] = useState<AgeGroup>(null);
  const [guardian, setGuardian] = useState({ name: "", phone: "" });

  // Step 3: ID
  const [idType,    setIdType]    = useState<string>("");
  const [idPreview, setIdPreview] = useState<string | null>(null);

  // Step 4: emergency contact
  const [ec, setEc] = useState<EmergencyContact>({ name: "", phone: "", relationship: "" });

  const fileInputRef   = useRef<HTMLInputElement>(null);
  const idInputRef     = useRef<HTMLInputElement>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setPhotoPreview(URL.createObjectURL(f));
  };

  const handleIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setIdPreview(URL.createObjectURL(f));
  };

  const calcAge = (d: string): number => {
    if (!d) return 0;
    const today = new Date();
    const born  = new Date(d);
    let age = today.getFullYear() - born.getFullYear();
    const m = today.getMonth() - born.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < born.getDate())) age--;
    return age;
  };

  const handleDobChange = (d: string) => {
    setDob(d);
    const age = calcAge(d);
    if (!d) { setAgeGroup(null); return; }
    if (age < 16)      setAgeGroup("under16");
    else if (age < 18) setAgeGroup("minor");
    else               setAgeGroup("adult");
  };

  const next = () => { if (step < TOTAL_STEPS) setStep(s => s + 1); else handleSubmit(); };
  const back = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    // Demo: simulate short submission delay
    await new Promise(r => setTimeout(r, 900));
    setDone(true);
  };

  // Per-step can-proceed logic
  const canProceed = () => {
    if (step === 1) return !!photoPreview;
    if (step === 2) {
      if (!dob || !ageGroup) return false;
      if (ageGroup === "under16") return false;
      if (ageGroup === "minor") return !!guardian.name && !!guardian.phone;
      return true;
    }
    if (step === 3) return !!idType && !!idPreview;
    if (step === 4) return !!ec.name && !!ec.phone && !!ec.relationship;
    return false;
  };

  // ── Success ───────────────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 gap-5 text-center animate-scale-in"
        style={{ background: GREEN_LIGHT }}>
        <div className="w-24 h-24 rounded-[2rem] flex items-center justify-center shadow-xl"
          style={{ background: `linear-gradient(135deg, ${GREEN}, ${GREEN_DARK})` }}>
          <CheckCircle size={44} className="text-white" />
        </div>
        <div>
          <p className="font-bold text-[22px] text-gray-900 mb-2">You&apos;re all set! 🎉</p>
          <p className="text-[14px] text-gray-600 leading-relaxed max-w-xs">
            Your identity is being verified. This usually takes less than 2 hours.
            You can use CampAssist in the meantime.
          </p>
        </div>
        <div className="w-full max-w-xs space-y-2.5 rounded-2xl p-4"
          style={{ background: "#fff", border: "1px solid #d1fae5" }}>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">What happens next</p>
          {[
            { emoji: "🔍", text: "We verify your ID documents" },
            { emoji: "📧", text: "You'll get a confirmation email" },
            { emoji: "🎪", text: "Full access unlocked before the festival" },
            { emoji: "🛟", text: "Your emergency contact is stored securely" },
          ].map(item => (
            <div key={item.text} className="flex items-center gap-3">
              <span className="text-xl flex-shrink-0">{item.emoji}</span>
              <p className="text-[13px] text-gray-700 text-left">{item.text}</p>
            </div>
          ))}
        </div>
        <button onClick={() => router.push("/dashboard")}
          className="w-full max-w-xs py-4 rounded-2xl font-bold text-[15px] text-white"
          style={{ background: `linear-gradient(135deg, ${GREEN}, ${GREEN_DARK})`, boxShadow: `0 4px 20px rgba(22,163,74,0.35)` }}>
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
            style={{ background: GREEN_LIGHT }}>
            <Shield size={18} style={{ color: GREEN }} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Camper Verification</p>
            <p className="font-bold text-[16px] text-gray-900">Let&apos;s verify you</p>
          </div>
        </div>
        <Link href="/dashboard" className="text-[12px] font-semibold text-gray-400 hover:text-gray-600">
          Skip for now
        </Link>
      </div>

      <ProgressBar step={step} />

      <div className="px-5 pt-4 pb-4 animate-fade-in-up">

        {/* ── STEP 1: Profile photo ── */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-bold text-[19px] text-gray-900 mb-1">Add a profile photo</h2>
              <p className="text-[13px] text-gray-500 leading-relaxed">
                This helps camp assistants recognise you when they arrive. Use a clear, recent photo of your face.
              </p>
            </div>

            <div className="flex flex-col items-center gap-4 py-4">
              {photoPreview ? (
                <div className="relative">
                  <img src={photoPreview} alt="Profile"
                    className="w-32 h-32 rounded-[2rem] object-cover shadow-lg"
                    style={{ border: `3px solid ${GREEN}` }} />
                  <button onClick={() => setPhotoPreview(null)}
                    className="absolute -top-2 -right-2 w-7 h-7 rounded-xl flex items-center justify-center"
                    style={{ background: "#dc2626" }}>
                    <X size={13} className="text-white" />
                  </button>
                </div>
              ) : (
                <div className="w-32 h-32 rounded-[2rem] bg-gray-100 flex items-center justify-center"
                  style={{ border: "2px dashed #d1d5db" }}>
                  <User size={40} className="text-gray-300" />
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-[13px] text-white transition-all active:scale-95"
                  style={{ background: `linear-gradient(135deg, ${GREEN}, ${GREEN_DARK})` }}>
                  <Camera size={15} /> {photoPreview ? "Retake" : "Take photo"}
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" capture="user"
                  className="hidden" onChange={handlePhotoChange} />
              </div>
            </div>

            <div className="rounded-2xl p-3.5 flex items-start gap-2.5"
              style={{ background: GREEN_LIGHT, border: `1px solid #bbf7d0` }}>
              <Shield size={14} style={{ color: GREEN, flexShrink: 0, marginTop: 2 }} />
              <p className="text-[12px] text-green-800 leading-relaxed">
                Your photo is only visible to assistants assigned to your jobs. It is never public.
              </p>
            </div>
          </div>
        )}

        {/* ── STEP 2: Date of birth ── */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-bold text-[19px] text-gray-900 mb-1">Date of birth</h2>
              <p className="text-[13px] text-gray-500 leading-relaxed">
                You must be at least 16 years old to attend as a camper. Under-18s require a guardian&apos;s details.
              </p>
            </div>

            <div>
              <label className="text-[12px] font-bold text-gray-500 uppercase tracking-wider block mb-2">
                <Calendar size={12} className="inline mr-1.5" />Date of birth
              </label>
              <input
                type="date"
                value={dob}
                max={new Date().toISOString().split("T")[0]}
                onChange={e => handleDobChange(e.target.value)}
                className="w-full px-4 py-3.5 rounded-2xl text-[15px] font-semibold text-gray-900 outline-none transition-all"
                style={{ background: "#fff", border: `1.5px solid ${dob ? GREEN : "#e5e7eb"}`, boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}
              />
            </div>

            {ageGroup === "under16" && (
              <div className="rounded-2xl p-4 flex items-start gap-3 animate-fade-in"
                style={{ background: "#fef2f2", border: "1.5px solid #fecaca" }}>
                <AlertTriangle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-[13px] text-red-800 mb-1">Age requirement not met</p>
                  <p className="text-[12px] text-red-700 leading-relaxed">
                    Campers must be at least 16 years old. Please contact the festival organisers
                    if you believe this is an error.
                  </p>
                </div>
              </div>
            )}

            {ageGroup === "minor" && (
              <div className="space-y-4 animate-fade-in">
                <div className="rounded-2xl p-3.5 flex items-start gap-2.5"
                  style={{ background: "#fffbeb", border: "1.5px solid #fde68a" }}>
                  <AlertTriangle size={14} style={{ color: "#b45309", flexShrink: 0, marginTop: 2 }} />
                  <p className="text-[12px] text-amber-800 leading-relaxed">
                    You&apos;re under 18. A parent or guardian must be contactable at all times during the festival.
                    Please provide their details below.
                  </p>
                </div>
                <div className="space-y-3">
                  <p className="font-bold text-[13px] text-gray-700">Guardian / Parent details</p>
                  <input
                    type="text" placeholder="Guardian full name" value={guardian.name}
                    onChange={e => setGuardian(g => ({ ...g, name: e.target.value }))}
                    className="w-full px-4 py-3.5 rounded-2xl text-[14px] outline-none"
                    style={{ background: "#fff", border: `1.5px solid ${guardian.name ? GREEN : "#e5e7eb"}` }}
                  />
                  <input
                    type="tel" placeholder="+44 7xxx xxxxxx" value={guardian.phone}
                    onChange={e => setGuardian(g => ({ ...g, phone: e.target.value }))}
                    className="w-full px-4 py-3.5 rounded-2xl text-[14px] outline-none"
                    style={{ background: "#fff", border: `1.5px solid ${guardian.phone ? GREEN : "#e5e7eb"}` }}
                  />
                </div>
              </div>
            )}

            {ageGroup === "adult" && dob && (
              <div className="rounded-2xl p-3.5 flex items-center gap-2.5 animate-fade-in"
                style={{ background: GREEN_LIGHT, border: `1px solid #bbf7d0` }}>
                <CheckCircle size={15} style={{ color: GREEN, flexShrink: 0 }} />
                <p className="text-[12px] text-green-800 font-semibold">
                  Age confirmed — you&apos;re good to go!
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── STEP 3: Government ID ── */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-bold text-[19px] text-gray-900 mb-1">Verify your identity</h2>
              <p className="text-[13px] text-gray-500 leading-relaxed">
                Upload a clear photo of your government-issued ID. This confirms who you are and keeps the festival safe.
              </p>
            </div>

            {/* ID type selector */}
            <div className="space-y-2">
              <p className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">Choose ID type</p>
              {[
                { id: "passport",  emoji: "🛂", label: "Passport",           desc: "Photo page only" },
                { id: "driving",   emoji: "🚗", label: "Driving Licence",    desc: "Front side" },
                { id: "national",  emoji: "🪪", label: "National ID Card",   desc: "Front and back" },
              ].map(opt => (
                <button key={opt.id} onClick={() => setIdType(opt.id)}
                  className="w-full flex items-center gap-3 p-3.5 rounded-2xl text-left transition-all"
                  style={{
                    background: "#fff",
                    border: idType === opt.id ? `2px solid ${GREEN}` : "1.5px solid #e5e7eb",
                    boxShadow: idType === opt.id ? `0 0 0 3px rgba(22,163,74,0.08)` : "0 1px 4px rgba(0,0,0,0.04)",
                  }}>
                  <span className="text-2xl">{opt.emoji}</span>
                  <div className="flex-1">
                    <p className="font-bold text-[13px] text-gray-900">{opt.label}</p>
                    <p className="text-[11px] text-gray-400">{opt.desc}</p>
                  </div>
                  {idType === opt.id && <Check size={16} style={{ color: GREEN }} />}
                </button>
              ))}
            </div>

            {/* Upload area */}
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
                    <div className="absolute bottom-0 left-0 right-0 px-3 py-2 flex items-center gap-2"
                      style={{ background: "rgba(22,163,74,0.85)" }}>
                      <CheckCircle size={13} className="text-white flex-shrink-0" />
                      <p className="text-[11px] text-white font-semibold">ID uploaded successfully</p>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center gap-3 rounded-2xl p-6 cursor-pointer"
                    style={{ border: "2px dashed #d1d5db", background: "#fefefe", minHeight: "140px" }}>
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                      style={{ background: GREEN_LIGHT }}>
                      <CreditCard size={26} style={{ color: GREEN }} />
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-[13px] text-gray-700">Upload your ID</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">Take a photo or choose from your library</p>
                    </div>
                    <input ref={idInputRef} type="file" accept="image/*" capture="environment"
                      className="hidden" onChange={handleIdChange} />
                  </label>
                )}
              </div>
            )}

            <div className="rounded-2xl p-3.5 flex items-start gap-2.5"
              style={{ background: "#fffbeb", border: "1px solid #fde68a" }}>
              <Shield size={14} style={{ color: "#b45309", flexShrink: 0, marginTop: 2 }} />
              <p className="text-[12px] text-amber-800 leading-relaxed">
                Your ID is encrypted and only accessed by our compliance team for verification.
                It is never shared with festival organisers or assistants.
              </p>
            </div>
          </div>
        )}

        {/* ── STEP 4: Emergency contact ── */}
        {step === 4 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-bold text-[19px] text-gray-900 mb-1">Emergency contact</h2>
              <p className="text-[13px] text-gray-500 leading-relaxed">
                This person will only be contacted if there is a medical emergency or welfare concern
                at the festival. They do not need to be present.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                  <User size={10} className="inline mr-1" />Full name
                </label>
                <input
                  type="text" placeholder="e.g. Adaeze Okafor" value={ec.name}
                  onChange={e => setEc(c => ({ ...c, name: e.target.value }))}
                  className="w-full px-4 py-3.5 rounded-2xl text-[14px] outline-none"
                  style={{ background: "#fff", border: `1.5px solid ${ec.name ? GREEN : "#e5e7eb"}` }}
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                  <Phone size={10} className="inline mr-1" />Phone number
                </label>
                <input
                  type="tel" placeholder="+44 7xxx xxxxxx" value={ec.phone}
                  onChange={e => setEc(c => ({ ...c, phone: e.target.value }))}
                  className="w-full px-4 py-3.5 rounded-2xl text-[14px] outline-none"
                  style={{ background: "#fff", border: `1.5px solid ${ec.phone ? GREEN : "#e5e7eb"}` }}
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                  <Heart size={10} className="inline mr-1" />Relationship
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["Parent", "Partner", "Sibling", "Friend", "Spouse", "Other"].map(rel => (
                    <button key={rel} onClick={() => setEc(c => ({ ...c, relationship: rel }))}
                      className="py-2.5 rounded-2xl text-[12px] font-bold transition-all"
                      style={{
                        background: ec.relationship === rel ? GREEN : "#fff",
                        color: ec.relationship === rel ? "#fff" : "#6b7280",
                        border: ec.relationship === rel ? "none" : "1.5px solid #e5e7eb",
                      }}>
                      {rel}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-2xl p-3.5 flex items-start gap-2.5"
              style={{ background: GREEN_LIGHT, border: `1px solid #bbf7d0` }}>
              <Shield size={14} style={{ color: GREEN, flexShrink: 0, marginTop: 2 }} />
              <p className="text-[12px] text-green-800 leading-relaxed">
                Your emergency contact details are stored securely and only accessible to the CampAssist
                medical and welfare team.
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
        nextLabel={step === TOTAL_STEPS ? "Submit & finish" : "Continue"}
      />
    </div>
  );
}
