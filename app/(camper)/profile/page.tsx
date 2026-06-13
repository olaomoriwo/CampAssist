"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import BottomNav from "@/components/ui/BottomNav";
import {
  User, Lock, Bell, Shield, Tent,
  Camera, Eye, EyeOff, LogOut, ChevronRight,
  Download, Trash2, CheckCircle, AlertTriangle,
} from "lucide-react";
import { DEMO_MODE, DEMO_PROFILE } from "@/lib/demo-data";

const GREEN  = "#16a34a";
const G_DARK = "#15803d";
const G_BG   = "#f0fdf4";
const G_BORDER = "#bbf7d0";

type Tab = "profile" | "security" | "notifications" | "privacy" | "booking";

const TABS: { id: Tab; label: string; icon: typeof User }[] = [
  { id: "profile",       label: "Profile",       icon: User },
  { id: "security",      label: "Security",      icon: Lock },
  { id: "notifications", label: "Notifs",        icon: Bell },
  { id: "privacy",       label: "Privacy",       icon: Shield },
  { id: "booking",       label: "Booking",       icon: Tent },
];

const DIETARY = ["Vegan", "Vegetarian", "Gluten-free", "Nut-free", "Halal", "Kosher", "No preference"];
const ZONES   = ["Green Fields (quiet)", "Main Stage (lively)", "Family Zone", "No preference"];

export default function CamperProfilePage() {
  const router = useRouter();
  const photoRef = useRef<HTMLInputElement>(null);

  const [tab, setTab]           = useState<Tab>("profile");
  const [saved, setSaved]       = useState(false);
  const [showPw, setShowPw]     = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  // ── Profile state ──────────────────────────────────────────────────────
  const [photo, setPhoto]       = useState<string | null>(null);
  const [name, setName]         = useState(DEMO_PROFILE?.name ?? "Alex Johnson");
  const [email]                 = useState(DEMO_PROFILE?.email ?? "alex@example.com");
  const [phone, setPhone]       = useState(DEMO_PROFILE?.phone ?? "+44 7700 123456");
  const [bio, setBio]           = useState("Festival lover since 2015. Glasto veteran. 🎪");

  // ── Security state ─────────────────────────────────────────────────────
  const [currentPw, setCurrentPw]   = useState("");
  const [newPw, setNewPw]           = useState("");
  const [pwSaved, setPwSaved]       = useState(false);

  // ── Notification toggles ───────────────────────────────────────────────
  const [notifs, setNotifs] = useState({
    bookingUpdates:      true,
    newMessages:         true,
    assistantArrival:    true,
    festivalAnnouncements: true,
    scheduleChanges:     true,
    promotions:          false,
  });

  // ── Privacy state ──────────────────────────────────────────────────────
  const [profileVisibility, setProfileVisibility] = useState<"everyone" | "festival" | "private">("festival");
  const [showActivity, setShowActivity]           = useState(true);

  // ── Booking preferences ────────────────────────────────────────────────
  const [tentPref, setTentPref]     = useState<"solo" | "duo" | "family">("duo");
  const [dietary, setDietary]       = useState<string[]>(["No preference"]);
  const [zone, setZone]             = useState("No preference");
  const [arrivalTime, setArrivalTime] = useState("12:00");

  // ── Helpers ────────────────────────────────────────────────────────────
  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setPhoto(URL.createObjectURL(file));
  }

  function toggleDietary(item: string) {
    if (item === "No preference") { setDietary(["No preference"]); return; }
    setDietary(prev => {
      const without = prev.filter(d => d !== "No preference");
      return without.includes(item) ? without.filter(d => d !== item) : [...without, item];
    });
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handlePwSave() {
    setPwSaved(true);
    setCurrentPw(""); setNewPw("");
    setTimeout(() => setPwSaved(false), 2000);
  }

  function handleLogout() { router.push("/"); }

  // ── Tab content ────────────────────────────────────────────────────────
  const firstInitial = (name || "A").charAt(0).toUpperCase();

  return (
    <div className="page-container" style={{ background: "#f9fafb" }}>
      {/* Header */}
      <div className="page-header justify-between" style={{ background: "#fff", borderBottom: "1px solid #e5e7eb" }}>
        <h1 className="font-bold text-[16px]">Account</h1>
        <button onClick={handleLogout}
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
            style={{ background: photo ? undefined : `linear-gradient(135deg,${GREEN},${G_DARK})` }}>
            {photo
              ? <img src={photo} alt="avatar" className="w-full h-full object-cover" />
              : <span className="text-white font-bold text-2xl">{firstInitial}</span>}
          </div>
          <button onClick={() => photoRef.current?.click()}
            className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg flex items-center justify-center shadow"
            style={{ background: GREEN }}>
            <Camera size={12} className="text-white" />
          </button>
          <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
        </div>
        <div>
          <p className="font-bold text-[15px] text-gray-900">{name}</p>
          <p className="text-[12px] text-gray-500">{email}</p>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold mt-1"
            style={{ background: G_BG, color: GREEN }}>
            🏕 Camper
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
                background: active ? G_BG : "transparent",
                color: active ? GREEN : "#6b7280",
                border: active ? `1.5px solid ${G_BORDER}` : "1.5px solid transparent",
              }}>
              <Icon size={13} /> {t.label}
            </button>
          );
        })}
      </div>

      <div className="flex-1 px-4 py-5 pb-28 space-y-4 overflow-y-auto">

        {/* ── Profile tab ─────────────────────────────────────────────── */}
        {tab === "profile" && (
          <>
            <Section title="Personal information">
              <Field label="Full name">
                <input className="input w-full" value={name} onChange={e => setName(e.target.value)}
                  style={{ borderColor: name ? GREEN : undefined }} />
              </Field>
              <Field label="Email" hint="Contact support to change your email">
                <input className="input w-full" value={email} readOnly
                  style={{ background: "#f9fafb", color: "#6b7280" }} />
              </Field>
              <Field label="Phone">
                <input className="input w-full" type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                  style={{ borderColor: phone ? GREEN : undefined }} />
              </Field>
              <Field label="Bio">
                <textarea className="input w-full resize-none" rows={3} value={bio}
                  onChange={e => setBio(e.target.value)}
                  style={{ borderColor: bio ? GREEN : undefined }} />
              </Field>
            </Section>
            <SaveButton saved={saved} color={GREEN} onClick={handleSave} />
          </>
        )}

        {/* ── Security tab ────────────────────────────────────────────── */}
        {tab === "security" && (
          <>
            <Section title="Change password">
              <Field label="Current password">
                <div className="relative">
                  <input className="input w-full pr-10" type={showPw ? "text" : "password"}
                    placeholder="••••••••" value={currentPw} onChange={e => setCurrentPw(e.target.value)} />
                  <button type="button" onClick={() => setShowPw(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </Field>
              <Field label="New password">
                <div className="relative">
                  <input className="input w-full pr-10" type={showNewPw ? "text" : "password"}
                    placeholder="At least 8 characters" value={newPw} onChange={e => setNewPw(e.target.value)} />
                  <button type="button" onClick={() => setShowNewPw(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showNewPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </Field>
              {DEMO_MODE
                ? <DemoBadge />
                : <SaveButton saved={pwSaved} color={GREEN} onClick={handlePwSave} label="Update password" />}
            </Section>

            <Section title="Danger zone">
              <div className="rounded-2xl px-4 py-3 flex items-start gap-3"
                style={{ background: "#fef2f2", border: "1px solid #fecaca" }}>
                <AlertTriangle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[13px] font-bold text-red-700">Delete account</p>
                  <p className="text-[12px] text-red-500 mt-0.5 leading-relaxed">
                    Permanently removes your profile, bookings, and all data. This cannot be undone.
                  </p>
                  <button disabled className="mt-3 text-[12px] font-bold text-red-500 px-3 py-1.5 rounded-xl opacity-40"
                    style={{ background: "#fee2e2" }}>
                    {DEMO_MODE ? "Disabled in demo" : "Delete my account"}
                  </button>
                </div>
              </div>
            </Section>
          </>
        )}

        {/* ── Notifications tab ────────────────────────────────────────── */}
        {tab === "notifications" && (
          <Section title="Notification preferences">
            {(Object.entries(notifs) as [keyof typeof notifs, boolean][]).map(([key, val]) => (
              <Toggle key={key}
                label={NOTIF_LABELS[key]}
                sub={NOTIF_SUBS[key]}
                value={val}
                color={GREEN}
                onChange={v => setNotifs(n => ({ ...n, [key]: v }))} />
            ))}
          </Section>
        )}

        {/* ── Privacy tab ─────────────────────────────────────────────── */}
        {tab === "privacy" && (
          <>
            <Section title="Profile visibility">
              {(["everyone", "festival", "private"] as const).map(opt => (
                <RadioRow key={opt}
                  label={VISIBILITY_LABELS[opt]}
                  sub={VISIBILITY_SUBS[opt]}
                  selected={profileVisibility === opt}
                  color={GREEN}
                  onClick={() => setProfileVisibility(opt)} />
              ))}
            </Section>

            <Section title="Activity">
              <Toggle label="Show my activity status"
                sub="Other campers can see when you were last active"
                value={showActivity} color={GREEN}
                onChange={setShowActivity} />
            </Section>

            <Section title="Your data">
              <button className="w-full flex items-center justify-between px-4 py-3 rounded-2xl"
                style={{ background: G_BG, border: `1px solid ${G_BORDER}` }}>
                <div className="flex items-center gap-3">
                  <Download size={16} style={{ color: GREEN }} />
                  <div className="text-left">
                    <p className="text-[13px] font-semibold text-gray-800">Export my data</p>
                    <p className="text-[11px] text-gray-500">Download a copy of everything we hold about you</p>
                  </div>
                </div>
                <ChevronRight size={15} className="text-gray-400" />
              </button>
            </Section>
          </>
        )}

        {/* ── Booking preferences tab ─────────────────────────────────── */}
        {tab === "booking" && (
          <>
            <Section title="Tent preference">
              <div className="grid grid-cols-3 gap-2">
                {(["solo","duo","family"] as const).map(t => (
                  <button key={t} onClick={() => setTentPref(t)}
                    className="py-3 rounded-2xl font-semibold text-[13px] transition-all"
                    style={{
                      background: tentPref === t ? G_BG : "#fff",
                      border: `1.5px solid ${tentPref === t ? GREEN : "#e5e7eb"}`,
                      color: tentPref === t ? GREEN : "#374151",
                    }}>
                    {t === "solo" ? "🏕 Solo" : t === "duo" ? "⛺ Duo" : "🏕 Family"}
                  </button>
                ))}
              </div>
            </Section>

            <Section title="Dietary requirements">
              <div className="flex flex-wrap gap-2">
                {DIETARY.map(d => {
                  const sel = dietary.includes(d);
                  return (
                    <button key={d} onClick={() => toggleDietary(d)}
                      className="px-3 py-1.5 rounded-xl text-[12px] font-semibold transition-all"
                      style={{
                        background: sel ? G_BG : "#f3f4f6",
                        color: sel ? GREEN : "#6b7280",
                        border: `1px solid ${sel ? GREEN : "transparent"}`,
                      }}>
                      {d}
                    </button>
                  );
                })}
              </div>
            </Section>

            <Section title="Preferred campsite zone">
              <div className="flex flex-col gap-2">
                {ZONES.map(z => (
                  <RadioRow key={z} label={z} selected={zone === z} color={GREEN} onClick={() => setZone(z)} />
                ))}
              </div>
            </Section>

            <Section title="Preferred arrival time">
              <Field label="What time do you typically arrive?">
                <input className="input w-full" type="time" value={arrivalTime}
                  onChange={e => setArrivalTime(e.target.value)}
                  style={{ borderColor: GREEN }} />
              </Field>
            </Section>

            <SaveButton saved={saved} color={GREEN} onClick={handleSave} label="Save preferences" />
          </>
        )}
      </div>

      <BottomNav role="camper" />
    </div>
  );
}

// ── Shared sub-components ──────────────────────────────────────────────────
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
      style={{
        background: selected ? `${color}10` : "#f9fafb",
        border: `1.5px solid ${selected ? color : "transparent"}`,
      }}>
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
    <div className="rounded-xl px-3 py-2 text-center"
      style={{ background: "#f3f4f6", border: "1px solid #e5e7eb" }}>
      <p className="text-[12px] text-gray-400 font-medium">Password changes disabled in demo mode</p>
    </div>
  );
}

const NOTIF_LABELS: Record<string, string> = {
  bookingUpdates:        "Booking updates",
  newMessages:           "New messages",
  assistantArrival:      "Assistant on the way",
  festivalAnnouncements: "Festival announcements",
  scheduleChanges:       "Schedule changes",
  promotions:            "Promotions & offers",
};

const NOTIF_SUBS: Record<string, string> = {
  bookingUpdates:        "Confirmation, changes, and cancellations",
  newMessages:           "When a camp assistant messages you",
  assistantArrival:      "When your requested assistant is en route",
  festivalAnnouncements: "Important updates from the festival team",
  scheduleChanges:       "When an event you like is rescheduled",
  promotions:            "Deals, new vendor spots, and early-bird offers",
};

const VISIBILITY_LABELS: Record<string, string> = {
  everyone: "Everyone",
  festival: "Festival attendees only",
  private:  "Private",
};

const VISIBILITY_SUBS: Record<string, string> = {
  everyone: "Anyone with the link can see your profile",
  festival: "Only people at your festival can see you",
  private:  "Your profile is hidden from others",
};
