"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Tent, Briefcase, Store, Shield,
  ChevronLeft, ChevronRight, ArrowRight,
  Eye, EyeOff, CheckCircle, User, Mail, Phone, Lock, Building2,
} from "lucide-react";

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

// ─── Role configuration ────────────────────────────────────────────────────
const ROLES = [
  {
    id: "camper",
    label: "Camper",
    sub: "Book a tent, get help & explore",
    icon: Tent,
    color: "#16a34a",
    dark: "#15803d",
    bg: "#f0fdf4",
    border: "#bbf7d0",
    gradient: "linear-gradient(135deg,#16a34a,#15803d)",
    onboarding: "/camper-onboarding",
    dashboard: "/dashboard",
  },
  {
    id: "assistant",
    label: "Camp Assistant",
    sub: "Offer help & earn at the festival",
    icon: Briefcase,
    color: "#ea580c",
    dark: "#c2410c",
    bg: "#fff7ed",
    border: "#fed7aa",
    gradient: "linear-gradient(135deg,#ea580c,#c2410c)",
    onboarding: "/assistant-onboarding",
    dashboard: "/assistant-dashboard",
  },
  {
    id: "vendor",
    label: "Vendor",
    sub: "Manage your stall & schedule",
    icon: Store,
    color: "#d97706",
    dark: "#b45309",
    bg: "#fffbeb",
    border: "#fde68a",
    gradient: "linear-gradient(135deg,#d97706,#b45309)",
    onboarding: "/vendor-onboarding",
    dashboard: "/vendor-dashboard",
  },
  {
    id: "admin",
    label: "Festival Organiser",
    sub: "Manage the entire festival",
    icon: Shield,
    color: "#7c3aed",
    dark: "#6d28d9",
    bg: "#f5f3ff",
    border: "#ddd6fe",
    gradient: "linear-gradient(135deg,#7c3aed,#6d28d9)",
    onboarding: "/admin-onboarding",
    dashboard: "/admin",
    // NOTE: admin will NOT be a public role at go-live — remove from ROLES before production deploy
  },
] as const;

type RoleId = (typeof ROLES)[number]["id"];

// ─── Extra fields per role ─────────────────────────────────────────────────
const EXTRAS: Record<RoleId, { key: string; label: string; placeholder: string; hint?: string }[]> = {
  camper:    [],
  assistant: [
    { key: "staffCode", label: "Staff invitation code *", placeholder: "e.g. CAMP2025", hint: "Provided by the festival organiser" },
  ],
  vendor: [
    { key: "businessName", label: "Business / stall name *", placeholder: "e.g. Big Smoke Burgers" },
  ],
  admin: [
    { key: "orgName", label: "Organisation name *", placeholder: "e.g. Green Fields Festival Ltd" },
    { key: "orgCode", label: "Organiser access code *", placeholder: "e.g. ADMIN2027", hint: "Provided in your festival contract" },
  ],
};

// ──────────────────────────────────────────────────────────────────────────
export default function SignupPage() {
  const router = useRouter();

  const [step, setStep]       = useState<1 | 2>(1);
  const [roleId, setRoleId]   = useState<RoleId | null>(null);
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const [form, setForm] = useState<Record<string, string>>({
    name: "", email: "", phone: "", password: "",
    staffCode: "", businessName: "", orgName: "", orgCode: "",
  });

  const role   = ROLES.find(r => r.id === roleId);
  const set    = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  function handleRoleSelect(id: RoleId) {
    setRoleId(id);
    setError("");
    setStep(2);
  }

  async function handleSignup() {
    if (!role) return;
    setLoading(true);
    setError("");

    if (DEMO_MODE) {
      await new Promise(r => setTimeout(r, 600));
      router.push(role.onboarding);
      return;
    }

    // Production: replace with supabase.auth.signUp
    try {
      await new Promise(r => setTimeout(r, 1000));
      router.push(role.onboarding);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  // ── Step 1: Role picker ──────────────────────────────────────────────────
  if (step === 1) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: "#f9fafb" }}>
        <div className="page-header" style={{ background: "#fff", borderBottom: "1px solid #e5e7eb" }}>
          <Link href="/" className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center">
            <ChevronLeft size={18} className="text-gray-600" />
          </Link>
          <div className="ml-3">
            <p className="font-bold text-[14px]">Create account</p>
            <p className="text-[11px] text-gray-400">CampAssist · In It Together 2027</p>
          </div>
        </div>

        <div className="flex-1 px-4 py-8">
          <h2 className="text-[22px] font-bold text-gray-900 mb-1">I am a…</h2>
          <p className="text-[13px] text-gray-500 mb-6">Choose your role to get started</p>

          <div className="flex flex-col gap-3">
            {ROLES.map(r => {
              const Icon = r.icon;
              return (
                <button key={r.id} onClick={() => handleRoleSelect(r.id)}
                  className="flex items-center gap-4 px-4 py-4 rounded-2xl border-2 text-left transition-all active:scale-98"
                  style={{ background: "#fff", borderColor: "#e5e7eb" }}>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ background: r.gradient }}>
                    <Icon size={22} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-[15px] text-gray-900">{r.label}</p>
                    <p className="text-[12px] text-gray-500 mt-0.5">{r.sub}</p>
                  </div>
                  <ChevronRight size={18} className="text-gray-400" />
                </button>
              );
            })}
          </div>

          <p className="text-center text-[13px] text-gray-500 mt-8">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold" style={{ color: "#16a34a" }}>Sign in</Link>
          </p>
        </div>
      </div>
    );
  }

  // ── Step 2: Signup form ──────────────────────────────────────────────────
  if (!role) return null;
  const RoleIcon = role.icon;
  const extras   = EXTRAS[role.id as RoleId];

  const requiredExtras = extras.filter(f =>
    ["staffCode", "businessName", "orgName"].includes(f.key)
  );
  const canSubmit =
    form.name.trim() &&
    form.email.trim() &&
    form.password.length >= 8 &&
    requiredExtras.every(f => form[f.key]?.trim());

  return (
    <div className="min-h-screen flex flex-col" style={{ background: role.bg }}>
      {/* Header */}
      <div className="page-header justify-between"
        style={{ background: "#fff", borderBottom: `1px solid ${role.border}` }}>
        <div className="flex items-center gap-3">
          <button onClick={() => setStep(1)}
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: role.bg }}>
            <ChevronLeft size={18} style={{ color: role.color }} />
          </button>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: role.gradient }}>
            <RoleIcon size={15} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-[14px]">{role.label} sign up</p>
            <p className="text-[11px] text-gray-400">Step 2 of 2</p>
          </div>
        </div>
        <Link href="/login" className="text-[12px] font-semibold" style={{ color: role.color }}>
          Sign in
        </Link>
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-2 px-6 py-4">
        <div className="h-1.5 rounded-full flex-1" style={{ background: role.border }} />
        <div className="h-1.5 rounded-full flex-1" style={{ background: role.color }} />
      </div>

      <div className="flex-1 px-4 pb-36 space-y-4">
        <div>
          <h2 className="text-[20px] font-bold text-gray-900">Your details</h2>
          <p className="text-[13px] text-gray-500 mt-0.5">Fields marked * are required</p>
        </div>

        {/* Demo quick-access */}
        {DEMO_MODE && (
          <button onClick={() => router.push(role.onboarding)}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-semibold text-[13px] text-white"
            style={{ background: role.gradient }}>
            <CheckCircle size={16} /> Quick demo access — skip form <ArrowRight size={15} />
          </button>
        )}

        {/* Name */}
        <div>
          <label className="form-label">Full name *</label>
          <div className="relative">
            <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input w-full pl-10" placeholder="Your full name"
              value={form.name} onChange={set("name")}
              style={{ borderColor: form.name ? role.color : undefined }} />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="form-label">Email *</label>
          <div className="relative">
            <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input w-full pl-10" type="email" placeholder="you@example.com"
              value={form.email} onChange={set("email")}
              style={{ borderColor: form.email ? role.color : undefined }} />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="form-label">Phone number</label>
          <div className="relative">
            <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input w-full pl-10" type="tel" placeholder="+44 7700 000000"
              value={form.phone} onChange={set("phone")}
              style={{ borderColor: form.phone ? role.color : undefined }} />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="form-label">Password *</label>
          <div className="relative">
            <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input w-full pl-10 pr-11"
              type={showPw ? "text" : "password"} placeholder="At least 8 characters"
              value={form.password} onChange={set("password")}
              style={{ borderColor: form.password.length >= 8 ? role.color : undefined }} />
            <button type="button" onClick={() => setShowPw(p => !p)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {form.password.length > 0 && form.password.length < 8 && (
            <p className="form-hint" style={{ color: "#ef4444" }}>At least 8 characters required</p>
          )}
        </div>

        {/* Role-specific extra fields */}
        {extras.map(field => (
          <div key={field.key}>
            <label className="form-label">{field.label}</label>
            <div className="relative">
              <Building2 size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input className="input w-full pl-10"
                placeholder={field.placeholder}
                value={form[field.key] || ""}
                onChange={set(field.key)}
                style={{ borderColor: form[field.key] ? role.color : undefined }} />
            </div>
            {field.hint && <p className="form-hint">{field.hint}</p>}
          </div>
        ))}

        {error && (
          <div className="rounded-2xl px-4 py-3" style={{ background: "#fef2f2", border: "1px solid #fecaca" }}>
            <p className="text-[13px] text-red-600 font-medium">{error}</p>
          </div>
        )}

        {/* Privacy note */}
        <div className="rounded-2xl px-4 py-3 flex items-start gap-3"
          style={{ background: "#f9fafb", border: "1px solid #e5e7eb" }}>
          <span className="text-base mt-0.5">🔒</span>
          <p className="text-[12px] text-gray-500 leading-relaxed">
            By creating an account you agree to our Terms of Service and Privacy Policy.
            Your data is never sold to third parties.
          </p>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="fixed bottom-0 left-0 right-0 px-4 pb-8 pt-4"
        style={{
          background: `rgba(255,255,255,0.95)`,
          backdropFilter: "blur(16px)",
          borderTop: `1px solid ${role.border}`,
        }}>
        <button onClick={handleSignup} disabled={!canSubmit || loading}
          className="w-full flex items-center justify-center gap-2 font-bold py-4 px-6 rounded-2xl text-[15px] text-white transition-all disabled:opacity-40"
          style={{ background: role.gradient, boxShadow: `0 4px 16px ${role.color}55` }}>
          {loading ? "Creating account…" : <>Create account <ArrowRight size={17} /></>}
        </button>
      </div>
    </div>
  );
}
