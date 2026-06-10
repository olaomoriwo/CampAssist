"use client";
import { useState } from "react";
import Link from "next/link";
import {
  Store, ChevronLeft, ChevronRight, User, Mail, Phone,
  UtensilsCrossed, Beer, Music, Shirt, Sparkles, CheckCircle,
} from "lucide-react";

const CATEGORIES = [
  { id: "food", label: "Food", emoji: "🍔", icon: UtensilsCrossed },
  { id: "bar", label: "Bar / Drinks", emoji: "🍺", icon: Beer },
  { id: "music", label: "Entertainment", emoji: "🎵", icon: Music },
  { id: "clothing", label: "Clothing / Merch", emoji: "👕", icon: Shirt },
  { id: "wellness", label: "Wellness / Beauty", emoji: "✨", icon: Sparkles },
  { id: "other", label: "Other", emoji: "🎪", icon: Store },
];

type Step = 1 | 2 | 3;

export default function VendorSignupPage() {
  const [step, setStep] = useState<Step>(1);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    businessName: "",
    category: "",
    contactName: "",
    email: "",
    phone: "",
    description: "",
    openingHours: "",
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const AMBER = "#d97706";
  const AMBER_DARK = "#b45309";
  const AMBER_LIGHT = "#fef3c7";

  if (done) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
        style={{ background: "linear-gradient(160deg, #451a03 0%, #78350f 40%, #92400e 70%, #b45309 100%)" }}>
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6"
          style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)" }}>
          <CheckCircle size={40} className="text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">You're all set!</h2>
        <p className="text-white/70 text-sm mb-8 max-w-xs leading-relaxed">
          Your vendor account for <strong className="text-white">{form.businessName}</strong> is ready.
          Head to your dashboard to pin your spot and set your schedule.
        </p>
        <Link href="/vendor-dashboard"
          className="font-bold py-4 px-8 rounded-2xl text-sm transition-all"
          style={{ background: "#fff", color: AMBER_DARK, boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}>
          Go to Vendor Dashboard →
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#fffbf0" }}>
      {/* Header */}
      <div className="page-header justify-between" style={{ background: "#fff", borderBottom: "1px solid #fde68a" }}>
        <div className="flex items-center gap-3">
          {step > 1 ? (
            <button onClick={() => setStep(s => (s - 1) as Step)}
              className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
              <ChevronLeft size={18} style={{ color: AMBER }} />
            </button>
          ) : (
            <Link href="/" className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
              <ChevronLeft size={18} style={{ color: AMBER }} />
            </Link>
          )}
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${AMBER}, ${AMBER_DARK})` }}>
            <Store size={15} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-[14px]">Vendor Sign Up</p>
            <p className="text-[11px] text-gray-400">In It Together 2027</p>
          </div>
        </div>
        <span className="text-[12px] font-semibold" style={{ color: AMBER }}>Step {step} of 3</span>
      </div>

      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2 py-4 px-6">
        {[1, 2, 3].map(s => (
          <div key={s} className="h-1.5 rounded-full transition-all duration-300"
            style={{
              background: s <= step ? AMBER : "#fde68a",
              flex: s === step ? 2 : 1,
            }} />
        ))}
      </div>

      <div className="flex-1 px-4 pb-32 animate-fade-in-up">

        {/* ── Step 1: Business info ── */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-[20px] font-bold text-gray-900">Your business</h2>
              <p className="text-[13px] text-gray-500 mt-0.5">Tell us about your stall or stand</p>
            </div>

            <div>
              <label className="form-label">Business name *</label>
              <input className="input w-full" placeholder="e.g. Big Smoke Burgers"
                value={form.businessName} onChange={set("businessName")}
                style={{ borderColor: form.businessName ? AMBER : undefined, outlineColor: AMBER }} />
            </div>

            <div>
              <label className="form-label">Category *</label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {CATEGORIES.map(cat => (
                  <button key={cat.id}
                    onClick={() => setForm(f => ({ ...f, category: cat.id }))}
                    className="flex items-center gap-2 px-3 py-3 rounded-2xl border-2 text-left transition-all"
                    style={{
                      borderColor: form.category === cat.id ? AMBER : "#fde68a",
                      background: form.category === cat.id ? AMBER_LIGHT : "#fff",
                    }}>
                    <span className="text-xl">{cat.emoji}</span>
                    <span className="text-[13px] font-semibold" style={{ color: form.category === cat.id ? AMBER_DARK : "#374151" }}>
                      {cat.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="form-label">Stall description</label>
              <textarea className="input w-full resize-none"
                rows={3} placeholder="What makes your stall special? What will you be selling?"
                value={form.description} onChange={set("description")}
                style={{ borderColor: form.description ? AMBER : undefined }} />
              <p className="form-hint">This shows on the map when campers tap your pin</p>
            </div>

            <div>
              <label className="form-label">Opening hours</label>
              <input className="input w-full" placeholder="e.g. 11am – midnight"
                value={form.openingHours} onChange={set("openingHours")}
                style={{ borderColor: form.openingHours ? AMBER : undefined }} />
            </div>
          </div>
        )}

        {/* ── Step 2: Contact info ── */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-[20px] font-bold text-gray-900">Your contact</h2>
              <p className="text-[13px] text-gray-500 mt-0.5">How we reach you on-site</p>
            </div>

            <div>
              <label className="form-label">Your name *</label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input className="input w-full pl-10" placeholder="Full name"
                  value={form.contactName} onChange={set("contactName")}
                  style={{ borderColor: form.contactName ? AMBER : undefined }} />
              </div>
            </div>

            <div>
              <label className="form-label">Email *</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input className="input w-full pl-10" type="email" placeholder="you@example.com"
                  value={form.email} onChange={set("email")}
                  style={{ borderColor: form.email ? AMBER : undefined }} />
              </div>
            </div>

            <div>
              <label className="form-label">Phone number *</label>
              <div className="relative">
                <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input className="input w-full pl-10" type="tel" placeholder="+44 7700 000000"
                  value={form.phone} onChange={set("phone")}
                  style={{ borderColor: form.phone ? AMBER : undefined }} />
              </div>
              <p className="form-hint">Used only for on-site coordination — not shared with campers</p>
            </div>

            {/* Info card */}
            <div className="rounded-2xl px-4 py-3 flex items-start gap-3"
              style={{ background: AMBER_LIGHT, border: `1px solid #fcd34d` }}>
              <span className="text-lg mt-0.5">🔒</span>
              <div>
                <p className="text-[13px] font-semibold" style={{ color: AMBER_DARK }}>Your data stays private</p>
                <p className="text-[12px] text-amber-700 leading-relaxed mt-0.5">
                  Campers only see your stall name, category, and opening hours. Contact details are never shared.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 3: Review & submit ── */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-[20px] font-bold text-gray-900">Review & confirm</h2>
              <p className="text-[13px] text-gray-500 mt-0.5">Check your details before joining</p>
            </div>

            <div className="card space-y-3">
              {[
                { label: "Business", value: form.businessName },
                { label: "Category", value: CATEGORIES.find(c => c.id === form.category)?.label || form.category },
                { label: "Description", value: form.description || "—" },
                { label: "Hours", value: form.openingHours || "—" },
                { label: "Contact", value: form.contactName },
                { label: "Email", value: form.email },
                { label: "Phone", value: form.phone },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-start justify-between gap-4">
                  <p className="text-[12px] text-gray-400 font-medium flex-shrink-0 w-20">{label}</p>
                  <p className="text-[13px] text-gray-800 font-semibold text-right">{value}</p>
                </div>
              ))}
            </div>

            <div className="rounded-2xl px-4 py-4 space-y-2.5"
              style={{ background: AMBER_LIGHT, border: `1px solid #fcd34d` }}>
              <p className="text-[13px] font-bold" style={{ color: AMBER_DARK }}>What happens next</p>
              {[
                { emoji: "📍", text: "Pin your exact spot on the festival map" },
                { emoji: "📅", text: "Add your schedule & nano-events" },
                { emoji: "👀", text: "Campers discover you via the map & schedule" },
              ].map(({ emoji, text }) => (
                <div key={text} className="flex items-center gap-2.5">
                  <span className="text-base">{emoji}</span>
                  <p className="text-[13px] text-amber-800">{text}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="fixed bottom-0 left-0 right-0 px-4 pb-8 pt-4"
        style={{ background: "rgba(255,251,240,0.96)", backdropFilter: "blur(16px)", borderTop: "1px solid #fde68a" }}>
        {step < 3 ? (
          <button
            onClick={() => setStep(s => (s + 1) as Step)}
            disabled={
              (step === 1 && (!form.businessName || !form.category)) ||
              (step === 2 && (!form.contactName || !form.email || !form.phone))
            }
            className="w-full flex items-center justify-center gap-2 font-bold py-4 px-6 rounded-2xl text-sm text-white transition-all disabled:opacity-40"
            style={{ background: `linear-gradient(135deg, ${AMBER}, ${AMBER_DARK})`, boxShadow: `0 4px 16px rgba(217,119,6,0.35)` }}>
            Continue <ChevronRight size={17} />
          </button>
        ) : (
          <button
            onClick={() => setDone(true)}
            className="w-full flex items-center justify-center gap-2 font-bold py-4 px-6 rounded-2xl text-sm text-white transition-all"
            style={{ background: `linear-gradient(135deg, ${AMBER}, ${AMBER_DARK})`, boxShadow: `0 4px 16px rgba(217,119,6,0.35)` }}>
            <CheckCircle size={17} /> Create Vendor Account
          </button>
        )}
      </div>
    </div>
  );
}
