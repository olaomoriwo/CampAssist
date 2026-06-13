"use client";
/**
 * Vendor KYC / Onboarding
 * 5 steps: Business profile → Company registration → Festival confirmation (code or upload)
 *          → What you sell → Bank / settlement details
 * Demo codes: "VEN2027" (valid festival vendor code)
 */
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight, ChevronLeft, Check, Shield, Building,
  Upload, CheckCircle, X, Banknote, Tag, AlertTriangle,
  Lock,
} from "lucide-react";

const AMBER       = "#d97706";
const AMBER_DARK  = "#b45309";
const AMBER_LIGHT = "#fffbeb";

const TOTAL_STEPS = 5;

const DEMO_VALID_CODE = "VEN2027";

const CATEGORIES = [
  { id: "food",        emoji: "🍔", label: "Food" },
  { id: "bar",         emoji: "🍺", label: "Bar / Drinks" },
  { id: "coffee",      emoji: "☕", label: "Coffee / Hot drinks" },
  { id: "merch",       emoji: "🎽", label: "Merchandise" },
  { id: "wellness",    emoji: "💆", label: "Wellness / Beauty" },
  { id: "activities",  emoji: "🎪", label: "Activities / Fun" },
  { id: "other",       emoji: "🛍️", label: "Other" },
];

const BIZ_TYPES = [
  { id: "ltd",         label: "Limited Company (Ltd)",       desc: "Registered with Companies House" },
  { id: "sole_trader", label: "Sole Trader",                 desc: "Self-employed individual" },
  { id: "partnership", label: "Partnership",                 desc: "Two or more people trading together" },
  { id: "cic",         label: "CIC / Social Enterprise",    desc: "Community Interest Company" },
];

function ProgressBar({ step }: { step: number }) {
  const labels = ["Business", "Reg", "Festival", "Products", "Bank"];
  return (
    <div className="px-5 pt-5 pb-2">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Step {step} of {TOTAL_STEPS}</p>
        <p className="text-[11px] text-gray-400">{Math.round((step / TOTAL_STEPS) * 100)}%</p>
      </div>
      <div className="w-full h-1.5 rounded-full bg-gray-100 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500"
          style={{ width: `${(step / TOTAL_STEPS) * 100}%`, background: `linear-gradient(90deg, ${AMBER}, ${AMBER_DARK})` }} />
      </div>
      <div className="flex justify-between mt-2">
        {labels.map((label, i) => (
          <div key={label} className="flex flex-col items-center gap-1">
            <div className="w-5 h-5 rounded-full flex items-center justify-center"
              style={{
                background: i + 1 < step ? AMBER : i + 1 === step ? AMBER_LIGHT : "#f3f4f6",
                border: i + 1 === step ? `2px solid ${AMBER}` : "none",
              }}>
              {i + 1 < step
                ? <Check size={10} className="text-white" />
                : <span className="w-1.5 h-1.5 rounded-full" style={{ background: i + 1 === step ? AMBER : "#d1d5db" }} />}
            </div>
            <p className="text-[9px] font-semibold" style={{ color: i + 1 <= step ? AMBER : "#9ca3af" }}>{label}</p>
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
          background: canNext ? `linear-gradient(135deg, ${AMBER}, ${AMBER_DARK})` : "#e5e7eb",
          color: canNext ? "#fff" : "#9ca3af",
          boxShadow: canNext ? `0 4px 14px rgba(217,119,6,0.3)` : "none",
        }}>
        {nextLabel} {canNext && <ChevronRight size={16} />}
      </button>
    </div>
  );
}

export default function VendorOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [done, setDone] = useState(false);
  const [approvedByCode, setApprovedByCode] = useState(false);

  // Step 1: business profile
  const [tradingName, setTradingName] = useState("");
  const [bizType,     setBizType]     = useState("");

  // Step 2: registration
  const [regNumber, setRegNumber] = useState("");
  const [soloDecl,  setSoloDecl]  = useState(false);

  // Step 3: festival confirmation
  const [confirmMode,    setConfirmMode]    = useState<"code" | "upload">("code");
  const [vendorCode,     setVendorCode]     = useState("");
  const [codeStatus,     setCodeStatus]     = useState<"idle" | "valid" | "invalid">("idle");
  const [confirmPreview, setConfirmPreview] = useState<string | null>(null);
  const uploadRef = useRef<HTMLInputElement>(null);

  const validateCode = () => {
    if (vendorCode.toUpperCase().trim() === DEMO_VALID_CODE) {
      setCodeStatus("valid");
      setApprovedByCode(true);
    } else {
      setCodeStatus("invalid");
    }
  };

  // Step 4: what you sell
  const [category,    setCategory]    = useState("");
  const [description, setDescription] = useState("");
  const [priceRange,  setPriceRange]  = useState("");

  // Step 5: bank details
  const [bankName,   setBankName]   = useState("");
  const [sortCode,   setSortCode]   = useState("");
  const [accNumber,  setAccNumber]  = useState("");
  const [accHolder,  setAccHolder]  = useState("");

  const formatSortCode = (v: string) => {
    const digits = v.replace(/\D/g, "").slice(0, 6);
    return digits.replace(/(\d{2})(?=\d)/g, "$1-").slice(0, 8);
  };

  const canProceed = () => {
    if (step === 1) return !!tradingName.trim() && !!bizType;
    if (step === 2) {
      if (bizType === "sole_trader") return soloDecl;
      return !!regNumber.trim();
    }
    if (step === 3) {
      if (confirmMode === "code") return codeStatus === "valid";
      return !!confirmPreview;
    }
    if (step === 4) return !!category && description.trim().length >= 10 && !!priceRange;
    if (step === 5) return !!bankName && sortCode.length === 8 && accNumber.length === 8 && !!accHolder;
    return false;
  };

  const next = () => { if (step < TOTAL_STEPS) setStep(s => s + 1); else handleSubmit(); };
  const back = () => setStep(s => s - 1);
  const handleSubmit = async () => {
    await new Promise(r => setTimeout(r, 1100));
    setDone(true);
  };

  // ── Success ───────────────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 gap-5 text-center animate-scale-in"
        style={{ background: AMBER_LIGHT }}>
        <div className="w-24 h-24 rounded-[2rem] flex items-center justify-center shadow-xl"
          style={{ background: `linear-gradient(135deg, ${AMBER}, ${AMBER_DARK})` }}>
          {approvedByCode ? <CheckCircle size={44} className="text-white" /> : <Upload size={40} className="text-white" />}
        </div>
        <div>
          <p className="font-bold text-[22px] text-gray-900 mb-2">
            {approvedByCode ? "You're approved! 🎉" : "Application received!"}
          </p>
          <p className="text-[14px] text-gray-600 leading-relaxed max-w-xs">
            {approvedByCode
              ? "Your vendor code was verified instantly. Your spot is confirmed at the festival."
              : "We've received your acceptance letter. Our team will verify it within 24 hours and confirm your spot."}
          </p>
        </div>
        <div className="w-full max-w-xs rounded-2xl p-4 space-y-2.5"
          style={{ background: "#fff", border: "1px solid #fde68a" }}>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Next steps</p>
          {(approvedByCode
            ? ["Your spot is reserved at the festival", "Set up your pin on the festival map", "Upload your menu / product catalogue", "Payouts processed after the event"]
            : ["We verify your acceptance letter", "You'll receive email confirmation", "Then set up your spot on the map", "Payouts processed after the event"]
          ).map(step => (
            <div key={step} className="flex items-center gap-3">
              <Check size={13} style={{ color: AMBER, flexShrink: 0 }} />
              <p className="text-[12px] text-gray-700 text-left">{step}</p>
            </div>
          ))}
        </div>
        <button onClick={() => router.push("/vendor-dashboard")}
          className="w-full max-w-xs py-4 rounded-2xl font-bold text-[15px] text-white"
          style={{ background: `linear-gradient(135deg, ${AMBER}, ${AMBER_DARK})`, boxShadow: `0 4px 20px rgba(217,119,6,0.35)` }}>
          Go to vendor dashboard →
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#f7f8fa" }}>
      <div className="px-5 pt-6 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl flex items-center justify-center" style={{ background: AMBER_LIGHT }}>
            <Building size={18} style={{ color: AMBER }} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Vendor Onboarding</p>
            <p className="font-bold text-[16px] text-gray-900">Set up your stall</p>
          </div>
        </div>
        <Link href="/vendor-dashboard" className="text-[12px] font-semibold text-gray-400">Skip for now</Link>
      </div>

      <ProgressBar step={step} />

      <div className="px-5 pt-4 pb-2 animate-fade-in-up">

        {/* ── STEP 1: Business profile ── */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-bold text-[19px] text-gray-900 mb-1">Your business</h2>
              <p className="text-[13px] text-gray-500 leading-relaxed">
                Tell us about the business that will be trading at the festival.
              </p>
            </div>
            <div>
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Trading name</label>
              <input
                type="text" placeholder="e.g. Mama's Kitchen" value={tradingName}
                onChange={e => setTradingName(e.target.value)}
                className="w-full px-4 py-3.5 rounded-2xl text-[14px] outline-none"
                style={{ background: "#fff", border: `1.5px solid ${tradingName ? AMBER : "#e5e7eb"}` }}
              />
            </div>
            <div className="space-y-2">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Business type</p>
              {BIZ_TYPES.map(bt => (
                <button key={bt.id} onClick={() => setBizType(bt.id)}
                  className="w-full flex items-center gap-3 p-3.5 rounded-2xl text-left transition-all"
                  style={{
                    background: "#fff",
                    border: bizType === bt.id ? `2px solid ${AMBER}` : "1.5px solid #e5e7eb",
                    boxShadow: bizType === bt.id ? `0 0 0 3px rgba(217,119,6,0.07)` : "0 1px 4px rgba(0,0,0,0.04)",
                  }}>
                  <div className="flex-1">
                    <p className="font-bold text-[13px] text-gray-900">{bt.label}</p>
                    <p className="text-[11px] text-gray-400">{bt.desc}</p>
                  </div>
                  {bizType === bt.id && <Check size={16} style={{ color: AMBER }} />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP 2: Registration ── */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-bold text-[19px] text-gray-900 mb-1">
                {bizType === "sole_trader" ? "Sole trader declaration" : "Company registration"}
              </h2>
              <p className="text-[13px] text-gray-500 leading-relaxed">
                {bizType === "sole_trader"
                  ? "As a sole trader, you confirm you are legally registered and responsible for your taxes."
                  : "Provide your company registration number so we can verify your business is legitimate."}
              </p>
            </div>

            {bizType === "sole_trader" ? (
              <div className="space-y-4">
                <div className="rounded-2xl p-4 space-y-2" style={{ background: "#f8fafc", border: "1.5px solid #e5e7eb" }}>
                  <p className="font-bold text-[13px] text-gray-800">Sole Trader Declaration</p>
                  <p className="text-[12px] text-gray-500 leading-relaxed">
                    I confirm that I am a self-employed sole trader registered with HMRC,
                    I am responsible for my own tax and National Insurance contributions,
                    and all information provided is accurate to the best of my knowledge.
                  </p>
                </div>
                <button onClick={() => setSoloDecl(s => !s)}
                  className="w-full flex items-center gap-3 p-4 rounded-2xl text-left transition-all"
                  style={{
                    background: soloDecl ? AMBER_LIGHT : "#fff",
                    border: soloDecl ? `2px solid ${AMBER}` : "1.5px solid #e5e7eb",
                  }}>
                  <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: soloDecl ? AMBER : "#f3f4f6", border: soloDecl ? "none" : "1.5px solid #e5e7eb" }}>
                    {soloDecl && <Check size={14} className="text-white" />}
                  </div>
                  <p className="font-semibold text-[13px] text-gray-800">I agree to this declaration</p>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Company number</label>
                  <input
                    type="text" placeholder="e.g. 12345678" value={regNumber}
                    onChange={e => setRegNumber(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-2xl text-[14px] font-mono outline-none"
                    style={{ background: "#fff", border: `1.5px solid ${regNumber ? AMBER : "#e5e7eb"}` }}
                  />
                  <p className="text-[11px] text-gray-400 mt-1">Find this on the Companies House register</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── STEP 3: Festival confirmation ── */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-bold text-[19px] text-gray-900 mb-1">Festival confirmation</h2>
              <p className="text-[13px] text-gray-500 leading-relaxed">
                Prove you&apos;ve been approved to trade at the festival — either with the vendor code from the organiser, or by uploading your acceptance email.
              </p>
            </div>

            {/* Mode toggle */}
            <div className="flex rounded-2xl overflow-hidden" style={{ border: "1.5px solid #e5e7eb" }}>
              {[{ key: "code", label: "🔑 Vendor code" }, { key: "upload", label: "📄 Upload letter" }].map(m => (
                <button key={m.key} onClick={() => setConfirmMode(m.key as "code" | "upload")}
                  className="flex-1 py-2.5 text-[12px] font-bold transition-all"
                  style={{
                    background: confirmMode === m.key ? AMBER : "transparent",
                    color: confirmMode === m.key ? "#fff" : "#6b7280",
                  }}>
                  {m.label}
                </button>
              ))}
            </div>

            {confirmMode === "code" && (
              <div className="space-y-3 animate-fade-in">
                <p className="text-[12px] text-gray-500">Enter the 7-character vendor approval code from the festival organiser.</p>
                <div className="flex gap-2">
                  <input
                    type="text" maxLength={7}
                    placeholder="e.g. VEN2027"
                    value={vendorCode}
                    onChange={e => { setVendorCode(e.target.value.toUpperCase()); setCodeStatus("idle"); }}
                    className="flex-1 px-4 py-3.5 rounded-2xl text-[15px] font-mono font-bold tracking-widest outline-none uppercase"
                    style={{
                      background: "#fff",
                      border: `1.5px solid ${codeStatus === "valid" ? "#16a34a" : codeStatus === "invalid" ? "#dc2626" : "#e5e7eb"}`,
                    }}
                  />
                  <button onClick={validateCode}
                    disabled={vendorCode.length < 5}
                    className="px-4 py-3.5 rounded-2xl font-bold text-[13px] text-white transition-all"
                    style={{ background: vendorCode.length >= 5 ? `linear-gradient(135deg, ${AMBER}, ${AMBER_DARK})` : "#e5e7eb", color: vendorCode.length >= 5 ? "#fff" : "#9ca3af" }}>
                    Verify
                  </button>
                </div>
                {codeStatus === "valid" && (
                  <div className="rounded-2xl p-3.5 flex items-center gap-2.5 animate-fade-in"
                    style={{ background: "#f0fdf4", border: "1.5px solid #bbf7d0" }}>
                    <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-[13px] text-green-800">Code verified!</p>
                      <p className="text-[11px] text-green-700">Your vendor spot is confirmed. You can proceed.</p>
                    </div>
                  </div>
                )}
                {codeStatus === "invalid" && (
                  <div className="rounded-2xl p-3.5 flex items-center gap-2.5 animate-fade-in"
                    style={{ background: "#fef2f2", border: "1.5px solid #fecaca" }}>
                    <AlertTriangle size={14} className="text-red-500 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-[12px] text-red-800">Invalid code</p>
                      <p className="text-[11px] text-red-700">Check with the festival organiser or switch to upload below.</p>
                    </div>
                  </div>
                )}
                <button onClick={() => setConfirmMode("upload")}
                  className="text-[12px] font-semibold underline" style={{ color: AMBER }}>
                  Don&apos;t have a code? Upload your acceptance letter instead
                </button>
              </div>
            )}

            {confirmMode === "upload" && (
              <div className="space-y-3 animate-fade-in">
                <p className="text-[12px] text-gray-500">Upload a screenshot or PDF of your acceptance email / letter from the festival organiser.</p>
                {confirmPreview ? (
                  <div className="relative rounded-2xl overflow-hidden" style={{ height: "170px" }}>
                    <img src={confirmPreview} alt="Confirmation" className="w-full h-full object-cover" />
                    <button onClick={() => setConfirmPreview(null)}
                      className="absolute top-2.5 right-2.5 w-8 h-8 rounded-xl flex items-center justify-center"
                      style={{ background: "rgba(0,0,0,0.6)" }}>
                      <X size={14} className="text-white" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 px-3 py-2 flex items-center gap-2"
                      style={{ background: `rgba(217,119,6,0.85)` }}>
                      <CheckCircle size={13} className="text-white flex-shrink-0" />
                      <p className="text-[11px] text-white font-semibold">Document uploaded — awaiting manual review</p>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center gap-3 rounded-2xl p-6 cursor-pointer"
                    style={{ border: "2px dashed #d1d5db", background: "#fefefe", minHeight: "130px" }}>
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: AMBER_LIGHT }}>
                      <Upload size={22} style={{ color: AMBER }} />
                    </div>
                    <p className="font-bold text-[13px] text-gray-700">Upload acceptance document</p>
                    <p className="text-[11px] text-gray-400">PDF, PNG or JPG · Max 10MB</p>
                    <input ref={uploadRef} type="file" accept="image/*,application/pdf"
                      className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) setConfirmPreview(URL.createObjectURL(f)); }} />
                  </label>
                )}
                <div className="rounded-2xl p-3 flex items-start gap-2"
                  style={{ background: AMBER_LIGHT, border: "1px solid #fde68a" }}>
                  <AlertTriangle size={12} style={{ color: AMBER, flexShrink: 0, marginTop: 2 }} />
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    Manual review takes up to 24 hours. Your account will be pending until verified.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── STEP 4: What you sell ── */}
        {step === 4 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-bold text-[19px] text-gray-900 mb-1">What you&apos;re selling</h2>
              <p className="text-[13px] text-gray-500 leading-relaxed">
                This appears on the festival map and helps campers find you.
              </p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Category</p>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map(cat => (
                  <button key={cat.id} onClick={() => setCategory(cat.id)}
                    className="flex items-center gap-2.5 p-3 rounded-2xl text-left transition-all"
                    style={{
                      background: category === cat.id ? AMBER_LIGHT : "#fff",
                      border: category === cat.id ? `2px solid ${AMBER}` : "1.5px solid #e5e7eb",
                    }}>
                    <span className="text-xl">{cat.emoji}</span>
                    <p className="font-semibold text-[12px] text-gray-800">{cat.label}</p>
                    {category === cat.id && <Check size={13} style={{ color: AMBER, marginLeft: "auto" }} />}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                Short description
              </label>
              <textarea rows={3} placeholder="e.g. Authentic West African street food — suya, jollof rice, and fresh pepper soup."
                value={description} onChange={e => setDescription(e.target.value.slice(0, 200))}
                className="w-full px-4 py-3.5 rounded-2xl text-[13px] leading-relaxed resize-none outline-none"
                style={{ background: "#fff", border: `1.5px solid ${description.length >= 10 ? AMBER : "#e5e7eb"}` }}
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
                <Tag size={10} className="inline mr-1" />Typical price range
              </label>
              <div className="grid grid-cols-3 gap-2">
                {["£1–£5", "£5–£10", "£10–£20", "£20–£40", "£40+", "Free"].map(p => (
                  <button key={p} onClick={() => setPriceRange(p)}
                    className="py-2.5 rounded-2xl text-[12px] font-bold transition-all"
                    style={{
                      background: priceRange === p ? AMBER : "#fff",
                      color: priceRange === p ? "#fff" : "#6b7280",
                      border: priceRange === p ? "none" : "1.5px solid #e5e7eb",
                    }}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 5: Bank details ── */}
        {step === 5 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-bold text-[19px] text-gray-900 mb-1">Bank details</h2>
              <p className="text-[13px] text-gray-500 leading-relaxed">
                Revenue collected through CampAssist is settled after the festival. Provide the account you want payments sent to.
              </p>
            </div>

            <div className="rounded-2xl p-3.5 flex items-start gap-2.5"
              style={{ background: "#f0f9ff", border: "1.5px solid #bae6fd" }}>
              <Lock size={14} style={{ color: "#0284c7", flexShrink: 0, marginTop: 2 }} />
              <p className="text-[12px] text-blue-800 leading-relaxed">
                Your bank details are encrypted with AES-256 and never stored in plain text.
                They are only used for post-event settlement transfers.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Bank name</label>
                <input
                  type="text" placeholder="e.g. Barclays" value={bankName}
                  onChange={e => setBankName(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-2xl text-[14px] outline-none"
                  style={{ background: "#fff", border: `1.5px solid ${bankName ? AMBER : "#e5e7eb"}` }}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Sort code</label>
                  <input
                    type="text" placeholder="00-00-00" value={sortCode}
                    onChange={e => setSortCode(formatSortCode(e.target.value))}
                    className="w-full px-4 py-3.5 rounded-2xl text-[14px] font-mono outline-none"
                    style={{ background: "#fff", border: `1.5px solid ${sortCode.length === 8 ? AMBER : "#e5e7eb"}` }}
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Account number</label>
                  <input
                    type="text" placeholder="12345678" maxLength={8}
                    value={accNumber}
                    onChange={e => setAccNumber(e.target.value.replace(/\D/g, "").slice(0, 8))}
                    className="w-full px-4 py-3.5 rounded-2xl text-[14px] font-mono outline-none"
                    style={{ background: "#fff", border: `1.5px solid ${accNumber.length === 8 ? AMBER : "#e5e7eb"}` }}
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Account holder name</label>
                <input
                  type="text" placeholder="Name on account" value={accHolder}
                  onChange={e => setAccHolder(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-2xl text-[14px] outline-none"
                  style={{ background: "#fff", border: `1.5px solid ${accHolder ? AMBER : "#e5e7eb"}` }}
                />
              </div>
            </div>

            <div className="rounded-2xl p-3.5 flex items-start gap-2.5"
              style={{ background: AMBER_LIGHT, border: "1px solid #fde68a" }}>
              <Banknote size={14} style={{ color: AMBER_DARK, flexShrink: 0, marginTop: 2 }} />
              <p className="text-[12px] text-amber-800 leading-relaxed">
                Settlements are processed within 5 business days after the festival ends.
                A 3% platform fee applies to all sales processed through CampAssist.
              </p>
            </div>
          </div>
        )}

      </div>

      <NavButtons
        step={step} canNext={canProceed()} onBack={back} onNext={next}
        nextLabel={step === TOTAL_STEPS ? "Submit & apply" : "Continue"}
      />
    </div>
  );
}
