"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/ui/BottomNav";
import {
  User, Lock, Bell, Shield, Briefcase,
  Camera, Eye, EyeOff, LogOut,
  CheckCircle, AlertTriangle, ChevronRight, Download,
} from "lucide-react";
import { DEMO_MODE, DEMO_ASSISTANT_PROFILE } from "@/lib/demo-data";

const ORANGE  = "#ea580c";
const O_DARK  = "#c2410c";
const O_BG    = "#fff7ed";
const O_BORDER = "#fed7aa";

type Tab = "profile" | "security" | "notifications" | "privacy" | "work";

const TABS: { id: Tab; label: string; icon: typeof User }[] = [
  { id: "profile",       label: "Profile",   icon: User },
  { id: "security",      label: "Security",  icon: Lock },
  { id: "notifications", label: "Notifs",    icon: Bell },
  { id: "privacy",       label: "Privacy",   icon: Shield },
  { id: "work",          label: "Work",      icon: Briefcase },
];

const SERVICES = [
  "Tent setup",
  "Luggage carry",
  "Map guidance",
  "Medical escort",
  "Lost & found",
  "Food & drinks delivery",
  "Charging assistance",
  "Group coordination",
];

const SLOTS = ["Morning (8am–12pm)", "Afternoon (12pm–6pm)", "Evening (6pm–12am)"];
const DAYS  = ["Fri", "Sat", "Sun", "Mon"];

export default function AssistantProfilePage() {
  const router = useRouter();
  const photoRef = useRef<HTMLInputElement>(null);

  const [tab, setTab]         = useState<Tab>("profile");
  const [saved, setSaved]     = useState(false);
  const [showPw, setShowPw]   = useState(false);
  const [showNew, setShowNew] = useState(false);

  // Profile
  const [photo, setPhoto]   = useState<string | null>(null);
  const [name, setName]     = useState((DEMO_ASSISTANT_PROFILE as any)?.name ?? "Jordan Clarke");
  const [email]             = useState((DEMO_ASSISTANT_PROFILE as any)?.email ?? "jordan@example.com");
  const [phone, setPhone]   = useState((DEMO_ASSISTANT_PROFILE as any)?.phone ?? "+44 7700 654321");
  const [bio, setBio]       = useState("Experienced festival helper. Fast, reliable, friendly. 💪");

  // Security
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw]         = useState("");
  const [pwSaved, setPwSaved]     = useState(false);

  // Notifications
  const [notifs, setNotifs] = useState({
    newJobRequests:  true,
    jobAssigned:     true,
    newMessages:     true,
    paymentReceived: true,
    scheduleReminders: true,
    promotions:      false,
  });

  // Privacy
  const [profileVis, setProfileVis] = useState<"everyone" | "festival" | "private">("festival");
  const [showRating, setShowRating] = useState(true);

  // Work preferences
  const [services, setServices]   = useState<string[]>(["Tent setup", "Luggage carry", "Map guidance"]);
  const [hourlyRate, setHourlyRate] = useState("12");
  const [maxJobs, setMaxJobs]     = useState("3");
  const [availability, setAvailability] = useState<Record<string, boolean>>({});

  function toggleSlot(day: string, slot: string) {
    const key = `${day}-${slot}`;
    setAvailability(prev => ({ ...prev, [key]: !prev[key] }));
  }

  function toggleService(s: string) {
    setServices(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  }

  function handleSave() { setSaved(true); setTimeout(() => setSaved(false), 2000); }
  function handlePwSave() { setPwSaved(true); setCurrentPw(""); setNewPw(""); setTimeout(() => setPwSaved(false), 2000); }
  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (f) setPhoto(URL.createObjectURL(f));
  }
  const firstInitial = (name || "J").charAt(0).toUpperCase();

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
            style={{ background: photo ? undefined : `linear-gradient(135deg,${ORANGE},${O_DARK})` }}>
            {photo
              ? <img src={photo} alt="avatar" className="w-full h-full object-cover" />
              : <span className="text-white font-bold text-2xl">{firstInitial}</span>}
          </div>
          <button onClick={() => photoRef.current?.click()}
            className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg flex items-center justify-center shadow"
            style={{ background: ORANGE }}>
            <Camera size={12} className="text-white" />
          </button>
          <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
        </div>
        <div>
          <p className="font-bold text-[15px] text-gray-900">{name}</p>
          <p className="text-[12px] text-gray-500">{email}</p>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold mt-1"
            style={{ background: O_BG, color: ORANGE }}>
            💼 Camp Assistant
          </span>
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
                background: active ? O_BG : "transparent",
                color: active ? ORANGE : "#6b7280",
                border: `1.5px solid ${active ? O_BORDER : "transparent"}`,
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
            <Section title="Personal information" color={ORANGE}>
              <Field label="Full name">
                <input className="input w-full" value={name} onChange={e => setName(e.target.value)}
                  style={{ borderColor: name ? ORANGE : undefined }} />
              </Field>
              <Field label="Email" hint="Contact support to change your email">
                <input className="input w-full" value={email} readOnly style={{ background: "#f9fafb", color: "#6b7280" }} />
              </Field>
              <Field label="Phone">
                <input className="input w-full" type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                  style={{ borderColor: phone ? ORANGE : undefined }} />
              </Field>
              <Field label="Bio" hint="Shown to campers when they book you">
                <textarea className="input w-full resize-none" rows={3} value={bio}
                  onChange={e => setBio(e.target.value)}
                  style={{ borderColor: bio ? ORANGE : undefined }} />
              </Field>
            </Section>
            <SaveButton saved={saved} color={ORANGE} onClick={handleSave} />
          </>
        )}

        {/* Security */}
        {tab === "security" && (
          <>
            <Section title="Change password" color={ORANGE}>
              <Field label="Current password">
                <PasswordInput value={currentPw} onChange={setCurrentPw} show={showPw} onToggle={() => setShowPw(p => !p)} />
              </Field>
              <Field label="New password">
                <PasswordInput value={newPw} onChange={setNewPw} show={showNew} onToggle={() => setShowNew(p => !p)} placeholder="At least 8 characters" />
              </Field>
              {DEMO_MODE ? <DemoBadge /> : <SaveButton saved={pwSaved} color={ORANGE} onClick={handlePwSave} label="Update password" />}
            </Section>
            <DangerZone demoMode={DEMO_MODE} />
          </>
        )}

        {/* Notifications */}
        {tab === "notifications" && (
          <Section title="Notification preferences" color={ORANGE}>
            {([
              ["newJobRequests",    "New job requests",     "When a camper requests your help"],
              ["jobAssigned",       "Job assigned",         "When you are matched to a job"],
              ["newMessages",       "New messages",         "When a camper messages you"],
              ["paymentReceived",   "Payment received",     "When earnings are added to your account"],
              ["scheduleReminders", "Schedule reminders",   "24h and 1h before your shift starts"],
              ["promotions",        "Promotions & bonuses", "Bonus offers and peak-time incentives"],
            ] as [keyof typeof notifs, string, string][]).map(([key, label, sub]) => (
              <Toggle key={key} label={label} sub={sub} value={notifs[key]} color={ORANGE}
                onChange={v => setNotifs(n => ({ ...n, [key]: v }))} />
            ))}
          </Section>
        )}

        {/* Privacy */}
        {tab === "privacy" && (
          <>
            <Section title="Profile visibility" color={ORANGE}>
              {(["everyone", "festival", "private"] as const).map(opt => (
                <RadioRow key={opt}
                  label={VISIBILITY_LABELS[opt]} sub={VISIBILITY_SUBS[opt]}
                  selected={profileVis === opt} color={ORANGE} onClick={() => setProfileVis(opt)} />
              ))}
            </Section>
            <Section title="Ratings" color={ORANGE}>
              <Toggle label="Show my rating publicly" sub="Campers can see your average rating on your profile"
                value={showRating} color={ORANGE} onChange={setShowRating} />
            </Section>
            <Section title="Your data" color={ORANGE}>
              <DataExportButton color={ORANGE} bg={O_BG} border={O_BORDER} />
            </Section>
          </>
        )}

        {/* Work preferences */}
        {tab === "work" && (
          <>
            <Section title="Services offered" color={ORANGE}>
              <div className="flex flex-wrap gap-2">
                {SERVICES.map(s => {
                  const sel = services.includes(s);
                  return (
                    <button key={s} onClick={() => toggleService(s)}
                      className="px-3 py-1.5 rounded-xl text-[12px] font-semibold transition-all"
                      style={{
                        background: sel ? O_BG : "#f3f4f6",
                        color: sel ? ORANGE : "#6b7280",
                        border: `1px solid ${sel ? ORANGE : "transparent"}`,
                      }}>
                      {s}
                    </button>
                  );
                })}
              </div>
            </Section>

            <Section title="Rates & limits" color={ORANGE}>
              <Field label="Hourly rate (£)" hint="This is shown as a guide — final rate confirmed at booking">
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">£</span>
                  <input className="input w-full pl-7" type="number" min="8" value={hourlyRate}
                    onChange={e => setHourlyRate(e.target.value)}
                    style={{ borderColor: ORANGE }} />
                </div>
              </Field>
              <Field label="Max concurrent jobs" hint="How many jobs can you handle at once?">
                <div className="grid grid-cols-4 gap-2">
                  {["1","2","3","4+"].map(n => (
                    <button key={n} onClick={() => setMaxJobs(n)}
                      className="py-2 rounded-xl text-[13px] font-semibold transition-all"
                      style={{
                        background: maxJobs === n ? O_BG : "#f3f4f6",
                        border: `1.5px solid ${maxJobs === n ? ORANGE : "transparent"}`,
                        color: maxJobs === n ? ORANGE : "#374151",
                      }}>
                      {n}
                    </button>
                  ))}
                </div>
              </Field>
            </Section>

            <Section title="Weekly availability" color={ORANGE}>
              <div className="space-y-2">
                {DAYS.map(day => (
                  <div key={day}>
                    <p className="text-[12px] font-bold text-gray-500 mb-1.5">{day}</p>
                    <div className="flex gap-2">
                      {SLOTS.map(slot => {
                        const key = `${day}-${slot}`;
                        const sel = availability[key];
                        return (
                          <button key={slot} onClick={() => toggleSlot(day, slot)}
                            className="flex-1 py-2 rounded-xl text-[10px] font-semibold transition-all"
                            style={{
                              background: sel ? O_BG : "#f3f4f6",
                              border: `1px solid ${sel ? ORANGE : "transparent"}`,
                              color: sel ? ORANGE : "#6b7280",
                            }}>
                            {slot.split(" ")[0]}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            <SaveButton saved={saved} color={ORANGE} onClick={handleSave} label="Save work settings" />
          </>
        )}
      </div>

      <BottomNav role="assistant" />
    </div>
  );
}

// ── Shared sub-components ──────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode; color?: string }) {
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
      <p className="text-[12px] text-gray-400 font-medium">Password changes disabled in demo mode</p>
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
            <p className="text-[12px] text-red-500 mt-0.5 leading-relaxed">Permanently removes your profile and all earnings history.</p>
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
          <p className="text-[11px] text-gray-500">Download a copy of everything we hold about you</p>
        </div>
      </div>
      <ChevronRight size={15} className="text-gray-400" />
    </button>
  );
}
const VISIBILITY_LABELS: Record<string, string> = { everyone: "Everyone", festival: "Festival attendees only", private: "Private" };
const VISIBILITY_SUBS: Record<string, string> = {
  everyone: "Anyone with the link can see your profile",
  festival: "Only people at your festival can see you",
  private:  "Your profile is hidden from others",
};
