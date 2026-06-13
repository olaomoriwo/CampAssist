"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/ui/BottomNav";
import {
  User, Lock, Bell, Shield, Cog,
  Camera, Eye, EyeOff, LogOut, Copy,
  CheckCircle, AlertTriangle, ChevronRight, Download, Users,
} from "lucide-react";
import { DEMO_MODE } from "@/lib/demo-data";

const PURPLE   = "#7c3aed";
const P_DARK   = "#6d28d9";
const P_BG     = "#f5f3ff";
const P_BORDER = "#ddd6fe";

type Tab = "profile" | "security" | "notifications" | "privacy" | "festival";

const TABS: { id: Tab; label: string; icon: typeof User }[] = [
  { id: "profile",       label: "Profile",   icon: User },
  { id: "security",      label: "Security",  icon: Lock },
  { id: "notifications", label: "Notifs",    icon: Bell },
  { id: "privacy",       label: "Privacy",   icon: Shield },
  { id: "festival",      label: "Festival",  icon: Cog },
];

const TEAM_MEMBERS = [
  { name: "Priya Okafor",  role: "Co-organiser", email: "priya@greenfields.co.uk", avatar: "P" },
  { name: "Tom Bashir",    role: "Site manager",  email: "tom@greenfields.co.uk",   avatar: "T" },
  { name: "Lena Marchetti",role: "Welfare lead",  email: "lena@greenfields.co.uk",  avatar: "L" },
];

export default function AdminProfilePage() {
  const router = useRouter();
  const photoRef = useRef<HTMLInputElement>(null);

  const [tab, setTab]         = useState<Tab>("profile");
  const [saved, setSaved]     = useState(false);
  const [showPw, setShowPw]   = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);

  // Profile
  const [photo, setPhoto]   = useState<string | null>(null);
  const [name, setName]     = useState("Riley Morgan");
  const [email]             = useState("riley@greenfields.co.uk");
  const [phone, setPhone]   = useState("+44 7700 111222");
  const [orgRole, setOrgRole] = useState("Festival Director");

  // Security
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw]         = useState("");
  const [pwSaved, setPwSaved]     = useState(false);

  // Notifications
  const [notifs, setNotifs] = useState({
    newReports:           true,
    staffJoins:           true,
    vendorApplications:   true,
    incidentAlerts:       true,
    festivalAnnouncements: true,
    systemUpdates:        true,
  });

  // Privacy
  const [profileVis, setProfileVis]  = useState<"staff" | "all" | "private">("staff");
  const [showOrgDetails, setShowOrgDetails] = useState(true);

  // Festival settings
  const [orgName, setOrgName]         = useState("Green Fields Festival Ltd");
  const [festivalName, setFestivalName] = useState("In It Together 2027");
  const [festivalDates, setFestivalDates] = useState("25–28 Jul 2027");
  const [orgCode]                     = useState("ADMIN2027");
  const [maxCapacity, setMaxCapacity] = useState("5000");
  const [showCode, setShowCode]       = useState(false);

  function copyCode() {
    navigator.clipboard.writeText(orgCode).then(() => {
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    });
  }

  function handleSave()   { setSaved(true); setTimeout(() => setSaved(false), 2000); }
  function handlePwSave() { setPwSaved(true); setCurrentPw(""); setNewPw(""); setTimeout(() => setPwSaved(false), 2000); }
  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (f) setPhoto(URL.createObjectURL(f));
  }
  const firstInitial = (name || "R").charAt(0).toUpperCase();

  return (
    <div className="page-container" style={{ background: "#f9fafb" }}>
      {/* Header */}
      <div className="page-header justify-between" style={{ background: "#fff", borderBottom: "1px solid #e5e7eb" }}>
        <h1 className="font-bold text-[16px]">Account</h1>
        <button onClick={() => router.push("/")}
          className="flex items-center gap-1.5 text-[12px] font-semibold text-red-500 px-3 py-1.5 rounded-xl"
          style={{ background: "#fef2f2" }}>
          <LogOut size={13} /> {DEMO_MODE ? "Home" : "Sign out"}
        </button>
      </div>

      {/* Profile hero */}
      <div className="px-4 pt-5 pb-4 flex items-center gap-4"
        style={{ background: "#fff", borderBottom: "1px solid #e5e7eb" }}>
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center"
            style={{ background: photo ? undefined : `linear-gradient(135deg,${PURPLE},${P_DARK})` }}>
            {photo
              ? <img src={photo} alt="avatar" className="w-full h-full object-cover" />
              : <span className="text-white font-bold text-2xl">{firstInitial}</span>}
          </div>
          <button onClick={() => photoRef.current?.click()}
            className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg flex items-center justify-center shadow"
            style={{ background: PURPLE }}>
            <Camera size={12} className="text-white" />
          </button>
          <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
        </div>
        <div>
          <p className="font-bold text-[15px] text-gray-900">{name}</p>
          <p className="text-[12px] text-gray-500">{email}</p>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
              style={{ background: P_BG, color: PURPLE }}>
              🛡 {orgRole}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-1 px-4 py-3 border-b border-gray-100 bg-white scrollbar-hide">
        {TABS.map(t => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold text-[12px] whitespace-nowrap transition-all flex-shrink-0"
              style={{
                background: active ? P_BG : "transparent",
                color: active ? PURPLE : "#6b7280",
                border: `1.5px solid ${active ? P_BORDER : "transparent"}`,
              }}>
              <Icon size={13} /> {t.label}
            </button>
          );
        })}
      </div>

      <div className="flex-1 px-4 py-5 pb-28 space-y-4 overflow-y-auto">

        {/* Profile */}
        {tab === "profile" && (
          <>
            <Section title="Personal information">
              <Field label="Full name">
                <input className="input w-full" value={name} onChange={e => setName(e.target.value)}
                  style={{ borderColor: name ? PURPLE : undefined }} />
              </Field>
              <Field label="Email" hint="Contact support to change your email">
                <input className="input w-full" value={email} readOnly style={{ background: "#f9fafb", color: "#6b7280" }} />
              </Field>
              <Field label="Phone">
                <input className="input w-full" type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                  style={{ borderColor: phone ? PURPLE : undefined }} />
              </Field>
              <Field label="Your role in the organisation">
                <div className="grid grid-cols-2 gap-2">
                  {["Festival Director", "Operations Lead", "Site Manager", "Welfare Lead", "Finance Lead"].map(r => (
                    <button key={r} onClick={() => setOrgRole(r)}
                      className="py-2 px-3 rounded-xl text-[12px] font-semibold transition-all text-left"
                      style={{
                        background: orgRole === r ? P_BG : "#f3f4f6",
                        border: `1.5px solid ${orgRole === r ? PURPLE : "transparent"}`,
                        color: orgRole === r ? PURPLE : "#374151",
                      }}>
                      {r}
                    </button>
                  ))}
                </div>
              </Field>
            </Section>
            <SaveButton saved={saved} color={PURPLE} onClick={handleSave} />
          </>
        )}

        {/* Security */}
        {tab === "security" && (
          <>
            <Section title="Change password">
              <Field label="Current password">
                <PasswordInput value={currentPw} onChange={setCurrentPw} show={showPw} onToggle={() => setShowPw(p => !p)} />
              </Field>
              <Field label="New password">
                <PasswordInput value={newPw} onChange={setNewPw} show={showNew} onToggle={() => setShowNew(p => !p)} placeholder="At least 8 characters" />
              </Field>
              {DEMO_MODE ? <DemoBadge /> : <SaveButton saved={pwSaved} color={PURPLE} onClick={handlePwSave} label="Update password" />}
            </Section>
            <Section title="Two-factor authentication">
              <div className="flex items-center justify-between gap-3 py-1">
                <div>
                  <p className="text-[13px] font-semibold text-gray-800">Enable 2FA</p>
                  <p className="text-[11px] text-gray-500">Adds an extra layer of security to your admin account</p>
                </div>
                <span className="px-2 py-1 rounded-lg text-[11px] font-bold" style={{ background: P_BG, color: PURPLE }}>
                  {DEMO_MODE ? "Demo" : "Off"}
                </span>
              </div>
            </Section>
            <DangerZone demoMode={DEMO_MODE} />
          </>
        )}

        {/* Notifications */}
        {tab === "notifications" && (
          <Section title="Notification preferences">
            {([
              ["newReports",           "New reports",             "When a camper files a misconduct report"],
              ["staffJoins",           "Staff joins",             "When a new assistant is approved"],
              ["vendorApplications",   "Vendor applications",    "When a vendor submits their KYC"],
              ["incidentAlerts",       "Incident alerts",         "High-priority flags from on-site staff"],
              ["festivalAnnouncements","Festival announcements",  "Updates shared with all attendees"],
              ["systemUpdates",        "System updates",          "Platform maintenance and feature releases"],
            ] as [keyof typeof notifs, string, string][]).map(([key, label, sub]) => (
              <Toggle key={key} label={label} sub={sub} value={notifs[key]} color={PURPLE}
                onChange={v => setNotifs(n => ({ ...n, [key]: v }))} />
            ))}
          </Section>
        )}

        {/* Privacy */}
        {tab === "privacy" && (
          <>
            <Section title="Admin profile visibility">
              {([
                ["staff", "Staff only",         "Only verified staff and co-organisers can see your profile"],
                ["all",   "All attendees",       "Any festival attendee can view your profile page"],
                ["private","Private",            "Your admin profile is completely hidden"],
              ] as ["staff" | "all" | "private", string, string][]).map(([opt, label, sub]) => (
                <RadioRow key={opt} label={label} sub={sub} selected={profileVis === opt} color={PURPLE} onClick={() => setProfileVis(opt)} />
              ))}
            </Section>
            <Section title="Organisation details">
              <Toggle label="Show organisation name publicly"
                sub="Festival attendees can see which organisation runs this festival"
                value={showOrgDetails} color={PURPLE} onChange={setShowOrgDetails} />
            </Section>
            <Section title="Your data">
              <DataExportButton color={PURPLE} bg={P_BG} border={P_BORDER} />
            </Section>
          </>
        )}

        {/* Festival settings */}
        {tab === "festival" && (
          <>
            <Section title="Organisation">
              <Field label="Organisation name">
                <input className="input w-full" value={orgName} onChange={e => setOrgName(e.target.value)}
                  style={{ borderColor: orgName ? PURPLE : undefined }} />
              </Field>
            </Section>

            <Section title="Festival details">
              <Field label="Festival name">
                <input className="input w-full" value={festivalName} onChange={e => setFestivalName(e.target.value)}
                  style={{ borderColor: festivalName ? PURPLE : undefined }} />
              </Field>
              <Field label="Festival dates">
                <input className="input w-full" placeholder="e.g. 25–28 Jul 2027"
                  value={festivalDates} onChange={e => setFestivalDates(e.target.value)}
                  style={{ borderColor: festivalDates ? PURPLE : undefined }} />
              </Field>
              <Field label="Maximum capacity">
                <input className="input w-full" type="number" value={maxCapacity}
                  onChange={e => setMaxCapacity(e.target.value)}
                  style={{ borderColor: PURPLE }} />
              </Field>
            </Section>

            <Section title="Organisation access code">
              <div className="rounded-2xl px-4 py-3 flex items-start gap-3 mb-3"
                style={{ background: P_BG, border: `1px solid ${P_BORDER}` }}>
                <Shield size={15} style={{ color: PURPLE }} className="mt-0.5 flex-shrink-0" />
                <p className="text-[12px] text-violet-700 leading-relaxed">
                  Share this code with co-organisers and staff so they can access the admin panel.
                  Rotate it if you believe it&apos;s been compromised.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2 px-4 py-3 rounded-2xl font-mono text-[14px] font-bold tracking-widest"
                  style={{ background: showCode ? P_BG : "#f3f4f6", border: `1px solid ${showCode ? P_BORDER : "#e5e7eb"}`, color: showCode ? PURPLE : "#9ca3af" }}>
                  {showCode ? orgCode : "••••••••"}
                </div>
                <button onClick={() => setShowCode(p => !p)}
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: P_BG, border: `1px solid ${P_BORDER}` }}>
                  {showCode ? <EyeOff size={16} style={{ color: PURPLE }} /> : <Eye size={16} style={{ color: PURPLE }} />}
                </button>
                {showCode && (
                  <button onClick={copyCode}
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
                    style={{ background: codeCopied ? "#22c55e" : P_BG, border: `1px solid ${codeCopied ? "#22c55e" : P_BORDER}` }}>
                    {codeCopied ? <CheckCircle size={16} className="text-white" /> : <Copy size={16} style={{ color: PURPLE }} />}
                  </button>
                )}
              </div>
            </Section>

            <Section title="Team members">
              <div className="space-y-3">
                {TEAM_MEMBERS.map(m => (
                  <div key={m.email} className="flex items-center gap-3 px-3 py-2.5 rounded-2xl"
                    style={{ background: "#f9fafb", border: "1px solid #e5e7eb" }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-[14px]"
                      style={{ background: `linear-gradient(135deg,${PURPLE},${P_DARK})`, color: "#fff" }}>
                      {m.avatar}
                    </div>
                    <div className="flex-1">
                      <p className="text-[13px] font-semibold text-gray-800">{m.name}</p>
                      <p className="text-[11px] text-gray-500">{m.role}</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg"
                      style={{ background: P_BG, color: PURPLE }}>Active</span>
                  </div>
                ))}
                <button className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-[13px] font-semibold"
                  style={{ background: P_BG, border: `1px dashed ${P_BORDER}`, color: PURPLE }}>
                  <Users size={15} /> Invite team member
                </button>
              </div>
            </Section>

            <SaveButton saved={saved} color={PURPLE} onClick={handleSave} label="Save festival settings" />
          </>
        )}
      </div>

      <BottomNav role="admin" />
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl overflow-hidden" style={{ background: "#fff", border: "1px solid #e5e7eb" }}>
      <div className="px-4 py-3 border-b border-gray-50">
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{title}</p>
      </div>
      <div className="px-4 py-4 space-y-4">{children}</div>
    </div>
  );
}
function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="form-label">{label}</label>
      {children}
      {hint && <p className="form-hint">{hint}</p>}
    </div>
  );
}
function PasswordInput({ value, onChange, show, onToggle, placeholder = "••••••••" }: {
  value: string; onChange: (v: string) => void; show: boolean; onToggle: () => void; placeholder?: string;
}) {
  return (
    <div className="relative">
      <input className="input w-full pr-10" type={show ? "text" : "password"}
        placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} />
      <button type="button" onClick={onToggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
        {show ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  );
}
function Toggle({ label, sub, value, color, onChange }: {
  label: string; sub?: string; value: boolean; color: string; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-1">
      <div>
        <p className="text-[13px] font-semibold text-gray-800">{label}</p>
        {sub && <p className="text-[11px] text-gray-500">{sub}</p>}
      </div>
      <button onClick={() => onChange(!value)}
        className="flex-shrink-0 w-11 h-6 rounded-full transition-all relative"
        style={{ background: value ? color : "#d1d5db" }}>
        <div className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all"
          style={{ left: value ? "calc(100% - 22px)" : "2px" }} />
      </button>
    </div>
  );
}
function RadioRow({ label, sub, selected, color, onClick }: {
  label: string; sub?: string; selected: boolean; color: string; onClick: () => void;
}) {
  return (
    <button onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-left"
      style={{ background: selected ? `${color}10` : "#f9fafb", border: `1.5px solid ${selected ? color : "transparent"}` }}>
      <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
        style={{ borderColor: selected ? color : "#d1d5db" }}>
        {selected && <div className="w-2 h-2 rounded-full" style={{ background: color }} />}
      </div>
      <div>
        <p className="text-[13px] font-semibold text-gray-800">{label}</p>
        {sub && <p className="text-[11px] text-gray-500">{sub}</p>}
      </div>
    </button>
  );
}
function SaveButton({ saved, color, onClick, label = "Save changes" }: {
  saved: boolean; color: string; onClick: () => void; label?: string;
}) {
  return (
    <button onClick={onClick}
      className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-[14px] text-white transition-all"
      style={{ background: saved ? "#22c55e" : color, boxShadow: `0 4px 14px ${color}44` }}>
      {saved ? <><CheckCircle size={16} /> Saved!</> : label}
    </button>
  );
}
function DemoBadge() {
  return (
    <div className="rounded-xl px-3 py-2 text-center" style={{ background: "#f3f4f6", border: "1px solid #e5e7eb" }}>
      <p className="text-[12px] text-gray-400 font-medium">Disabled in demo mode</p>
    </div>
  );
}
function DangerZone({ demoMode }: { demoMode: boolean }) {
  return (
    <div className="rounded-3xl overflow-hidden" style={{ background: "#fff", border: "1px solid #e5e7eb" }}>
      <div className="px-4 py-3 border-b border-gray-50">
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Danger zone</p>
      </div>
      <div className="px-4 py-4">
        <div className="rounded-2xl px-4 py-3 flex items-start gap-3" style={{ background: "#fef2f2", border: "1px solid #fecaca" }}>
          <AlertTriangle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-[13px] font-bold text-red-700">Delete account</p>
            <p className="text-[12px] text-red-500 mt-0.5">Removes your admin profile and organisation access. The festival data will remain.</p>
            <button disabled className="mt-3 text-[12px] font-bold text-red-500 px-3 py-1.5 rounded-xl opacity-40" style={{ background: "#fee2e2" }}>
              {demoMode ? "Disabled in demo" : "Delete my account"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
function DataExportButton({ color, bg, border }: { color: string; bg: string; border: string }) {
  return (
    <button className="w-full flex items-center justify-between px-4 py-3 rounded-2xl" style={{ background: bg, border: `1px solid ${border}` }}>
      <div className="flex items-center gap-3">
        <Download size={16} style={{ color }} />
        <div className="text-left">
          <p className="text-[13px] font-semibold text-gray-800">Export my data</p>
          <p className="text-[11px] text-gray-500">Download everything we hold on your account</p>
        </div>
      </div>
      <ChevronRight size={15} className="text-gray-400" />
    </button>
  );
}
