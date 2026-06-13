"use client";
/**
 * Admin KYC / Onboarding
 * 4 steps: Organisation profile → Festival being managed → Organisation code → Photo ID
 * Demo code: "ADMIN2027"
 * On completion → /admin (full access granted)
 */
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronRight, ChevronLeft, Check, Shield, Building,
  CheckCircle, X, CreditCard, Globe, AlertTriangle, Key,
  Lock,
} from "lucide-react";

const PURPLE       = "#7c3aed";
const PURPLE_DARK  = "#6d28d9";
const PURPLE_LIGHT = "#ede9fe";

const TOTAL_STEPS = 4;
const DEMO_ORG_CODE = "ADMIN2027";

const ROLES = [
  { id: "director",    label: "Festival Director",      desc: "Overall responsibility for the event" },
  { id: "operations",  label: "Operations Manager",     desc: "Day-to-day logistics and site management" },
  { id: "site_mgr",   label: "Site Manager",           desc: "Physical site setup and infrastructure" },
  { id: "marketing",   label: "Marketing / Comms",      desc: "Promotions and audience communications" },
  { id: "other",       label: "Other",                  desc: "Another role within the organising team" },
];

const DEMO_FESTIVALS = [
  { id: "f1", name: "In It Together 2027",  location: "Margam Park, Wales",    dates: "23–26 May 2027" },
  { id: "f2", name: "Wildfire Festival",     location: "Shropshire, England",   dates: "14–16 June 2027" },
  { id: "f3", name: "Sol Festival",          location: "Dorset, England",       dates: "4–7 July 2027" },
];

function ProgressBar({ step }: { step: number }) {
  const labels = ["Org", "Festival", "Code", "ID"];
  return (
    <div className="px-5 pt-5 pb-2">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Step {step} of {TOTAL_STEPS}</p>
        <p className="text-[11px] text-gray-400">{Math.round((step / TOTAL_STEPS) * 100)}%</p>
      </div>
      <div className="w-full h-1.5 rounded-full bg-gray-100 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500"
          style={{ width: `${(step / TOTAL_STEPS) * 100}%`, background: `linear-gradient(90deg, ${PURPLE}, ${PURPLE_DARK})` }} />
      </div>
      <div className="flex justify-between mt-2">
        {labels.map((label, i) => (
          <div key={label} className="flex flex-col items-center gap-1">
            <div className="w-5 h-5 rounded-full flex items-center justify-center"
              style={{
                background: i + 1 < step ? PURPLE : i + 1 === step ? PURPLE_LIGHT : "#f3f4f6",
                border: i + 1 === step ? `2px solid ${PURPLE}` : "none",
              }}>
              {i + 1 < step
                ? <Check size={10} className="text-white" />
                : <span className="w-1.5 h-1.5 rounded-full" style={{ background: i + 1 === step ? PURPLE : "#d1d5db" }} />}
            </div>
            <p className="text-[9px] font-semibold" style={{ color: i + 1 <= step ? PURPLE : "#9ca3af" }}>{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function NavButtons({ step, canNext, onBack, onNext, nextLabel = "Continue", loading = false }: {
  step: number; canNext: boolean; onBack: () => void; onNext: () => void; nextLabel?: string; loading?: boolean;
}) {
  return (
    <div className="flex gap-3 px-5 pb-8 pt-4">
      {step > 1 && (
        <button onClick={onBack} className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 bg-gray-100">
          <ChevronLeft size={18} className="text-gray-600" />
        </button>
      )}
      <button onClick={onNext} disabled={!canNext || loading}
        className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-[14px] transition-all active:scale-97"
        style={{
          background: canNext ? `linear-gradient(135deg, ${PURPLE}, ${PURPLE_DARK})` : "#e5e7eb",
          color: canNext ? "#fff" : "#9ca3af",
          boxShadow: canNext ? `0 4px 14px rgba(124,58,237,0.3)` : "none",
        }}>
        {loading
          ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Verifying…</>
          : <>{nextLabel} {canNext && <ChevronRight size={16} />}</>}
      </button>
    </div>
  );
}

export default function AdminOnboardingPage() {
  const router = useRouter();
  const [step,    setStep]    = useState(1);
  const [done,    setDone]    = useState(false);
  const [loading, setLoading] = useState(false);

  // Step 1
  const [orgName,  setOrgName]  = useState("");
  const [roleId,   setRoleId]   = useState("");
  const [roleOther, setRoleOther] = useState("");

  // Step 2
  const [festivalId,    setFestivalId]    = useState("");
  const [customFestival, setCustomFestival] = useState({ name: "", location: "", dates: "" });
  const [useCustom,     setUseCustom]     = useState(false);

  // Step 3
  const [orgCode,    setOrgCode]    = useState("");
  const [codeStatus, setCodeStatus] = useState<"idle" | "valid" | "invalid">("idle");

  // Step 4
  const [idType,    setIdType]    = useState("");
  const [idPreview, setIdPreview] = useState<string | null>(null);
  const idRef = useRef<HTMLInputElement>(null);

  const validateCode = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    if (orgCode.toUpperCase().trim() === DEMO_ORG_CODE) {
      setCodeStatus("valid");
    } else {
      setCodeStatus("invalid");
    }
    setLoading(false);
  };

  const canProceed = () => {
    if (step === 1) return !!orgName.trim() && !!roleId;
    if (step === 2) {
      if (useCustom) return !!customFestival.name.trim() && !!customFestival.location.trim();
      return !!festivalId;
    }
    if (step === 3) return codeStatus === "valid";
    if (step === 4) return !!idType && !!idPreview;
    return false;
  };

  const next = () => { if (step < TOTAL_STEPS) setStep(s => s + 1); else handleSubmit(); };
  const back = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    setDone(true);
  };

  const selectedFestival = DEMO_FESTIVALS.find(f => f.id === festivalId);

  // ── Success ───────────────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 gap-5 text-center animate-scale-in"
        style={{ background: PURPLE_LIGHT }}>
        <div className="w-24 h-24 rounded-[2rem] flex items-center justify-center shadow-xl"
          style={{ background: `linear-gradient(135deg, ${PURPLE}, ${PURPLE_DARK})` }}>
          <Shield size={42} className="text-white" />
        </div>
        <div>
          <p className="font-bold text-[22px] text-gray-900 mb-2">Admin access granted 🎉</p>
          <p className="text-[14px] text-gray-600 leading-relaxed max-w-xs">
            Your organisation code has been verified. You now have full admin access to CampAssist for your festival.
          </p>
        </div>
        <div className="w-full max-w-xs rounded-2xl p-4 space-y-2.5"
          style={{ background: "#fff", border: "1px solid #ddd6fe" }}>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Your access includes</p>
          {[
            "📋 Bookings, requests and staff management",
            "🗺️ Site plan upload and georeferencing",
            "🏪 Vendor approvals and scheduling",
            "🚩 Report mediation and assistant suspension",
            "📊 Festival analytics and settings",
          ].map(item => (
            <div key={item} className="flex items-start gap-3">
              <p className="text-[12px] text-gray-700 text-left">{item}</p>
            </div>
          ))}
        </div>
        <button onClick={() => router.push("/admin")}
          className="w-full max-w-xs py-4 rounded-2xl font-bold text-[15px] text-white"
          style={{ background: `linear-gradient(135deg, ${PURPLE}, ${PURPLE_DARK})`, boxShadow: `0 4px 20px rgba(124,58,237,0.35)` }}>
          Open admin panel →
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#f7f8fa" }}>
      {/* Header */}
      <div className="px-5 pt-6 pb-3 flex items-center gap-3">
        <div className="w-9 h-9 rounded-2xl flex items-center justify-center" style={{ background: PURPLE_LIGHT }}>
          <Lock size={18} style={{ color: PURPLE }} />
        </div>
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Admin Verification</p>
          <p className="font-bold text-[16px] text-gray-900">Organiser access setup</p>
        </div>
      </div>

      <ProgressBar step={step} />

      <div className="px-5 pt-4 pb-2 animate-fade-in-up">

        {/* ── STEP 1: Organisation profile ── */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-bold text-[19px] text-gray-900 mb-1">Your organisation</h2>
              <p className="text-[13px] text-gray-500 leading-relaxed">
                Tell us about the team organising the festival you&apos;re using CampAssist for.
              </p>
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                <Building size={10} className="inline mr-1" />Organisation / Company name
              </label>
              <input
                type="text" placeholder="e.g. Green Fields Events Ltd" value={orgName}
                onChange={e => setOrgName(e.target.value)}
                className="w-full px-4 py-3.5 rounded-2xl text-[14px] outline-none"
                style={{ background: "#fff", border: `1.5px solid ${orgName ? PURPLE : "#e5e7eb"}` }}
              />
            </div>

            <div className="space-y-2">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Your role</p>
              {ROLES.map(r => (
                <button key={r.id} onClick={() => setRoleId(r.id)}
                  className="w-full flex items-center gap-3 p-3.5 rounded-2xl text-left transition-all"
                  style={{
                    background: "#fff",
                    border: roleId === r.id ? `2px solid ${PURPLE}` : "1.5px solid #e5e7eb",
                    boxShadow: roleId === r.id ? `0 0 0 3px rgba(124,58,237,0.07)` : "0 1px 4px rgba(0,0,0,0.04)",
                  }}>
                  <div className="flex-1">
                    <p className="font-bold text-[13px] text-gray-900">{r.label}</p>
                    <p className="text-[11px] text-gray-400">{r.desc}</p>
                  </div>
                  {roleId === r.id && <Check size={16} style={{ color: PURPLE }} />}
                </button>
              ))}
              {roleId === "other" && (
                <input type="text" placeholder="Describe your role" value={roleOther}
                  onChange={e => setRoleOther(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-2xl text-[14px] outline-none animate-fade-in"
                  style={{ background: "#fff", border: "1.5px solid #e5e7eb" }}
                />
              )}
            </div>
          </div>
        )}

        {/* ── STEP 2: Festival selection ── */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-bold text-[19px] text-gray-900 mb-1">Which festival?</h2>
              <p className="text-[13px] text-gray-500 leading-relaxed">
                Select the festival you&apos;re managing, or enter the details if yours isn&apos;t listed yet.
              </p>
            </div>

            {!useCustom && (
              <div className="space-y-2">
                {DEMO_FESTIVALS.map(f => (
                  <button key={f.id} onClick={() => setFestivalId(f.id)}
                    className="w-full flex items-start gap-3 p-3.5 rounded-2xl text-left transition-all"
                    style={{
                      background: "#fff",
                      border: festivalId === f.id ? `2px solid ${PURPLE}` : "1.5px solid #e5e7eb",
                      boxShadow: festivalId === f.id ? `0 0 0 3px rgba(124,58,237,0.07)` : "0 1px 4px rgba(0,0,0,0.04)",
                    }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: festivalId === f.id ? PURPLE_LIGHT : "#f7f8fa" }}>
                      <Globe size={16} style={{ color: festivalId === f.id ? PURPLE : "#9ca3af" }} />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-[13px] text-gray-900">{f.name}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{f.location}</p>
                      <p className="text-[11px] text-gray-400">{f.dates}</p>
                    </div>
                    {festivalId === f.id && <Check size={16} style={{ color: PURPLE, flexShrink: 0, marginTop: 2 }} />}
                  </button>
                ))}
                <button onClick={() => setUseCustom(true)}
                  className="w-full py-3 rounded-2xl text-[13px] font-semibold transition-all"
                  style={{ background: "#f3f4f6", color: "#6b7280", border: "1.5px dashed #d1d5db" }}>
                  + My festival isn&apos;t listed
                </button>
              </div>
            )}

            {useCustom && (
              <div className="space-y-3 animate-fade-in">
                <button onClick={() => setUseCustom(false)} className="flex items-center gap-1.5 text-[12px] font-semibold" style={{ color: PURPLE }}>
                  <ChevronLeft size={14} /> Back to list
                </button>
                <input type="text" placeholder="Festival name" value={customFestival.name}
                  onChange={e => setCustomFestival(f => ({ ...f, name: e.target.value }))}
                  className="w-full px-4 py-3.5 rounded-2xl text-[14px] outline-none"
                  style={{ background: "#fff", border: `1.5px solid ${customFestival.name ? PURPLE : "#e5e7eb"}` }}
                />
                <input type="text" placeholder="Location (venue, county)" value={customFestival.location}
                  onChange={e => setCustomFestival(f => ({ ...f, location: e.target.value }))}
                  className="w-full px-4 py-3.5 rounded-2xl text-[14px] outline-none"
                  style={{ background: "#fff", border: `1.5px solid ${customFestival.location ? PURPLE : "#e5e7eb"}` }}
                />
                <input type="text" placeholder="Dates (e.g. 21–24 Aug 2027)" value={customFestival.dates}
                  onChange={e => setCustomFestival(f => ({ ...f, dates: e.target.value }))}
                  className="w-full px-4 py-3.5 rounded-2xl text-[14px] outline-none"
                  style={{ background: "#fff", border: "1.5px solid #e5e7eb" }}
                />
              </div>
            )}
          </div>
        )}

        {/* ── STEP 3: Organisation code ── */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-bold text-[19px] text-gray-900 mb-1">Organisation code</h2>
              <p className="text-[13px] text-gray-500 leading-relaxed">
                Enter the 8-character organisation code issued to you by CampAssist when your account was provisioned.
                This confirms you are the legitimate organiser.
              </p>
            </div>

            <div className="rounded-2xl p-4 flex items-start gap-3"
              style={{ background: PURPLE_LIGHT, border: "1px solid #ddd6fe" }}>
              <Key size={16} style={{ color: PURPLE, flexShrink: 0, marginTop: 2 }} />
              <div>
                <p className="font-bold text-[13px] text-purple-900 mb-0.5">Where do I find my code?</p>
                <p className="text-[12px] text-purple-700 leading-relaxed">
                  Your code was sent in your CampAssist onboarding email. Contact <strong>hello@campAssist.app</strong> if you can&apos;t find it.
                </p>
                {/* Demo hint */}
                <p className="text-[11px] text-purple-500 mt-2 font-mono">Demo code: ADMIN2027</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text" maxLength={10}
                  placeholder="ADMIN2027"
                  value={orgCode}
                  onChange={e => { setOrgCode(e.target.value.toUpperCase()); setCodeStatus("idle"); }}
                  className="flex-1 px-4 py-3.5 rounded-2xl text-[16px] font-mono font-bold tracking-widest outline-none uppercase text-center"
                  style={{
                    background: "#fff",
                    border: `1.5px solid ${codeStatus === "valid" ? "#16a34a" : codeStatus === "invalid" ? "#dc2626" : "#e5e7eb"}`,
                    letterSpacing: "0.2em",
                  }}
                />
              </div>
              <button onClick={validateCode}
                disabled={orgCode.length < 6 || loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-[14px] transition-all"
                style={{
                  background: orgCode.length >= 6 ? `linear-gradient(135deg, ${PURPLE}, ${PURPLE_DARK})` : "#e5e7eb",
                  color: orgCode.length >= 6 ? "#fff" : "#9ca3af",
                }}>
                {loading
                  ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Verifying…</>
                  : "Verify code"}
              </button>
            </div>

            {codeStatus === "valid" && (
              <div className="rounded-2xl p-3.5 flex items-center gap-2.5 animate-fade-in"
                style={{ background: "#f0fdf4", border: "1.5px solid #bbf7d0" }}>
                <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
                <div>
                  <p className="font-bold text-[13px] text-green-800">Code verified!</p>
                  <p className="text-[11px] text-green-700">
                    Organisation confirmed — {selectedFestival ? selectedFestival.name : customFestival.name}.
                  </p>
                </div>
              </div>
            )}

            {codeStatus === "invalid" && (
              <div className="rounded-2xl p-3.5 flex items-start gap-2.5 animate-fade-in"
                style={{ background: "#fef2f2", border: "1.5px solid #fecaca" }}>
                <AlertTriangle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-[12px] text-red-800">Code not recognised</p>
                  <p className="text-[11px] text-red-700 leading-relaxed">
                    Double-check the code from your onboarding email, or contact support at hello@campAssist.app.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── STEP 4: Photo ID ── */}
        {step === 4 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-bold text-[19px] text-gray-900 mb-1">Identity verification</h2>
              <p className="text-[13px] text-gray-500 leading-relaxed">
                As you&apos;ll have access to sensitive attendee data and festival operations, we require a final ID check. This is a one-time step.
              </p>
            </div>

            <div className="space-y-2">
              {[
                { id: "passport", emoji: "🛂", label: "Passport",        desc: "Photo page only" },
                { id: "driving",  emoji: "🚗", label: "Driving Licence", desc: "Front side" },
                { id: "national", emoji: "🪪", label: "National ID",     desc: "Front + back" },
              ].map(opt => (
                <button key={opt.id} onClick={() => setIdType(opt.id)}
                  className="w-full flex items-center gap-3 p-3.5 rounded-2xl text-left transition-all"
                  style={{
                    background: "#fff",
                    border: idType === opt.id ? `2px solid ${PURPLE}` : "1.5px solid #e5e7eb",
                    boxShadow: idType === opt.id ? `0 0 0 3px rgba(124,58,237,0.07)` : "0 1px 4px rgba(0,0,0,0.04)",
                  }}>
                  <span className="text-2xl">{opt.emoji}</span>
                  <div className="flex-1">
                    <p className="font-bold text-[13px] text-gray-900">{opt.label}</p>
                    <p className="text-[11px] text-gray-400">{opt.desc}</p>
                  </div>
                  {idType === opt.id && <Check size={16} style={{ color: PURPLE }} />}
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
                    <div className="absolute bottom-0 left-0 right-0 px-3 py-2 flex items-center gap-2"
                      style={{ background: `rgba(124,58,237,0.85)` }}>
                      <CheckCircle size={13} className="text-white flex-shrink-0" />
                      <p className="text-[11px] text-white font-semibold">ID uploaded</p>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center gap-3 rounded-2xl p-6 cursor-pointer"
                    style={{ border: "2px dashed #d1d5db", background: "#fefefe", minHeight: "130px" }}>
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: PURPLE_LIGHT }}>
                      <CreditCard size={22} style={{ color: PURPLE }} />
                    </div>
                    <p className="font-bold text-[13px] text-gray-700">Upload your ID</p>
                    <input ref={idRef} type="file" accept="image/*" capture="environment"
                      className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) setIdPreview(URL.createObjectURL(f)); }} />
                  </label>
                )}
              </div>
            )}

            <div className="rounded-2xl p-3.5 flex items-start gap-2.5"
              style={{ background: "#fffbeb", border: "1px solid #fde68a" }}>
              <Shield size={14} style={{ color: "#b45309", flexShrink: 0, marginTop: 2 }} />
              <p className="text-[12px] text-amber-800 leading-relaxed">
                Your ID is encrypted and only accessed by the CampAssist compliance team.
                Admin access is revoked immediately if misuse is detected.
              </p>
            </div>
          </div>
        )}

      </div>

      <NavButtons
        step={step} canNext={canProceed()} onBack={back} onNext={next} loading={loading}
        nextLabel={step === TOTAL_STEPS ? "Activate admin access" : "Continue"}
      />
    </div>
  );
}
