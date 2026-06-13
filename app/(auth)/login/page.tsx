"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import {
  Tent, Briefcase, Store, Shield,
  ChevronLeft, ChevronRight, ArrowRight,
  Eye, EyeOff, Mail, Lock, Zap,
} from "lucide-react";

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

// ─── Role configuration ────────────────────────────────────────────────────
const ROLES = [
  {
    id: "camper",
    label: "Camper",
    sub: "Access your bookings & festival tools",
    icon: Tent,
    color: "#16a34a",
    dark: "#15803d",
    bg: "#f0fdf4",
    border: "#bbf7d0",
    gradient: "linear-gradient(135deg,#16a34a,#15803d)",
    dashboard: "/dashboard",
  },
  {
    id: "assistant",
    label: "Camp Assistant",
    sub: "View your requests & schedule",
    icon: Briefcase,
    color: "#ea580c",
    dark: "#c2410c",
    bg: "#fff7ed",
    border: "#fed7aa",
    gradient: "linear-gradient(135deg,#ea580c,#c2410c)",
    dashboard: "/assistant-dashboard",
  },
  {
    id: "vendor",
    label: "Vendor",
    sub: "Manage your stall & sales",
    icon: Store,
    color: "#d97706",
    dark: "#b45309",
    bg: "#fffbeb",
    border: "#fde68a",
    gradient: "linear-gradient(135deg,#d97706,#b45309)",
    dashboard: "/vendor-dashboard",
  },
  {
    id: "admin",
    label: "Festival Organiser",
    sub: "Access the admin panel",
    icon: Shield,
    color: "#7c3aed",
    dark: "#6d28d9",
    bg: "#f5f3ff",
    border: "#ddd6fe",
    gradient: "linear-gradient(135deg,#7c3aed,#6d28d9)",
    dashboard: "/admin",
    // NOTE: admin will NOT be a public role at go-live — remove from ROLES before production deploy
  },
] as const;

type RoleId = (typeof ROLES)[number]["id"];

// ──────────────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep]       = useState<1 | 2>(1);
  const [roleId, setRoleId]   = useState<RoleId | null>(null);
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const role = ROLES.find(r => r.id === roleId);

  function handleRoleSelect(id: RoleId) {
    setRoleId(id);
    setError("");
    setStep(2);
  }

  async function handleLogin() {
    if (!role) return;
    setLoading(true);
    setError("");

    if (DEMO_MODE) {
      await new Promise(r => setTimeout(r, 700));
      router.push(role.dashboard);
      return;
    }

    const { error: signInError, data } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    // Check stored role and redirect
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    if (profile?.role === "assistant") router.push("/assistant-dashboard");
    else if (profile?.role === "admin") router.push("/admin");
    else if (profile?.role === "vendor") router.push("/vendor-dashboard");
    else router.push("/dashboard");
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
            <p className="font-bold text-[14px]">Welcome back</p>
            <p className="text-[11px] text-gray-400">CampAssist · In It Together 2027</p>
          </div>
        </div>

        <div className="flex-1 px-4 py-8">
          <h2 className="text-[22px] font-bold text-gray-900 mb-1">Sign in as…</h2>
          <p className="text-[13px] text-gray-500 mb-6">Choose your account type to continue</p>

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
            New to CampAssist?{" "}
            <Link href="/signup" className="font-semibold" style={{ color: "#16a34a" }}>Create an account</Link>
          </p>
        </div>
      </div>
    );
  }

  // ── Step 2: Login form ───────────────────────────────────────────────────
  if (!role) return null;
  const RoleIcon = role.icon;
  const canSubmit = DEMO_MODE || (email.trim() && password.length >= 6);

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
            <p className="font-bold text-[14px]">{role.label}</p>
            <p className="text-[11px] text-gray-400">Sign in to your account</p>
          </div>
        </div>
        <Link href="/signup" className="text-[12px] font-semibold" style={{ color: role.color }}>
          Sign up
        </Link>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 px-6 py-4">
        <div className="h-1.5 rounded-full flex-1" style={{ background: role.border }} />
        <div className="h-1.5 rounded-full flex-1" style={{ background: role.color }} />
      </div>

      <div className="flex-1 px-4 pb-36 space-y-4">
        <div>
          <h2 className="text-[20px] font-bold text-gray-900">Welcome back</h2>
          <p className="text-[13px] text-gray-500 mt-0.5">Sign in to continue to your dashboard</p>
        </div>

        {/* Demo bypass */}
        {DEMO_MODE && (
          <button onClick={() => router.push(role.dashboard)}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl font-bold text-[14px] text-white"
            style={{ background: role.gradient, boxShadow: `0 4px 16px ${role.color}44` }}>
            <Zap size={17} /> Enter as {role.label} (Demo) <ArrowRight size={15} />
          </button>
        )}

        {/* Divider */}
        {DEMO_MODE && (
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: role.border }} />
            <span className="text-[11px] text-gray-400 font-medium">or sign in with credentials</span>
            <div className="flex-1 h-px" style={{ background: role.border }} />
          </div>
        )}

        {/* Email */}
        <div>
          <label className="form-label">Email</label>
          <div className="relative">
            <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input w-full pl-10" type="email" placeholder="you@example.com"
              value={email} onChange={e => setEmail(e.target.value)}
              style={{ borderColor: email ? role.color : undefined }} />
          </div>
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="form-label mb-0">Password</label>
            <button type="button" className="text-[12px] font-semibold" style={{ color: role.color }}>
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input w-full pl-10 pr-11"
              type={showPw ? "text" : "password"} placeholder="Your password"
              value={password} onChange={e => setPassword(e.target.value)}
              style={{ borderColor: password ? role.color : undefined }} />
            <button type="button" onClick={() => setShowPw(p => !p)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl px-4 py-3" style={{ background: "#fef2f2", border: "1px solid #fecaca" }}>
            <p className="text-[13px] text-red-600 font-medium">{error}</p>
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="fixed bottom-0 left-0 right-0 px-4 pb-8 pt-4"
        style={{
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(16px)",
          borderTop: `1px solid ${role.border}`,
        }}>
        <button onClick={handleLogin} disabled={!canSubmit || loading}
          className="w-full flex items-center justify-center gap-2 font-bold py-4 px-6 rounded-2xl text-[15px] text-white transition-all disabled:opacity-40"
          style={{ background: role.gradient, boxShadow: `0 4px 16px ${role.color}55` }}>
          {loading ? "Signing in…" : <>Sign in <ArrowRight size={17} /></>}
        </button>
        <p className="text-center text-[12px] text-gray-400 mt-3">
          New to CampAssist?{" "}
          <Link href="/signup" className="font-semibold" style={{ color: role.color }}>Create an account</Link>
        </p>
      </div>
    </div>
  );
}
