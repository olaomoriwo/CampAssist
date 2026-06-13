"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/ui/BottomNav";
import {
  User, Lock, Bell, Shield, Store,
  Camera, Eye, EyeOff, LogOut, Building2,
  CheckCircle, AlertTriangle, ChevronRight, Download, CreditCard,
} from "lucide-react";
import { DEMO_MODE } from "@/lib/demo-data";

const AMBER  = "#d97706";
const A_DARK = "#b45309";
const A_BG   = "#fffbeb";
const A_BORDER = "#fde68a";

type Tab = "profile" | "security" | "notifications" | "privacy" | "business";

const TABS: { id: Tab; label: string; icon: typeof User }[] = [
  { id: "profile",       label: "Profile",   icon: User },
  { id: "security",      label: "Security",  icon: Lock },
  { id: "notifications", label: "Notifs",    icon: Bell },
  { id: "privacy",       label: "Privacy",   icon: Shield },
  { id: "business",      label: "Business",  icon: Store },
];

const CATEGORIES = [
  { id: "food",      label: "Food & drinks",    emoji: "🍔" },
  { id: "bar",       label: "Bar / alcohol",    emoji: "🍺" },
  { id: "music",     label: "Entertainment",    emoji: "🎵" },
  { id: "clothing",  label: "Clothing & merch", emoji: "👕" },
  { id: "wellness",  label: "Wellness & beauty",emoji: "✨" },
  { id: "other",     label: "Other",            emoji: "🎪" },
];

export default function VendorProfilePage() {
  const router = useRouter();
  const photoRef = useRef<HTMLInputElement>(null);

  const [tab, setTab]         = useState<Tab>("profile");
  const [saved, setSaved]     = useState(false);
  const [showPw, setShowPw]   = useState(false);
  const [showNew, setShowNew] = useState(false);

  // Profile
  const [photo, setPhoto]   = useState<string | null>(null);
  const [name, setName]     = useState("Sam Patel");
  const [email]             = useState("sam@bigsmoke.co.uk");
  const [phone, setPhone]   = useState("+44 7700 987654");
  const [bio, setBio]       = useState("Award-winning street food. Est. 2019. 🔥");

  // Security
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw]         = useState("");
  const [pwSaved, setPwSaved]     = useState(false);

  // Notifications
  const [notifs, setNotifs] = useState({
    newReviews:          true,
    stallCheckins:       true,
    scheduleReminders:   true,
    festivalAnnouncements: true,
    paymentConfirmations: true,
    promotions:          false,
  });

  // Privacy
  const [stallVisible, setStallVisible] = useState<"everyone" | "festival" | "private">("everyone");
  const [showHours, setShowHours]       = useState(true);

  // Business settings
  const [businessName, setBusinessName]   = useState("Big Smoke Burgers");
  const [businessType, setBusinessType]   = useState("Sole Trader");
  const [category, setCategory]           = useState("food");
  const [description, setDescription]     = useState("Gourmet smash burgers & loaded fries. Gluten-free buns available.");
  const [openingHours, setOpeningHours]   = useState("11am – midnight");
  const [sortCode, setSortCode]           = useState("20-00-00");
  const [accountNumber, setAccountNumber] = useState("••••••••");
  const [showBankDetails, setShowBankDetails] = useState(false);

  function handleSave()   { setSaved(true); setTimeout(() => setSaved(false), 2000); }
  function handlePwSave() { setPwSaved(true); setCurrentPw(""); setNewPw(""); setTimeout(() => setPwSaved(false), 2000); }
  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (f) setPhoto(URL.createObjectURL(f));
  }
  const firstInitial = (businessName || "B").charAt(0).toUpperCase();

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
            style={{ background: photo ? undefined : `linear-gradient(135deg,${AMBER},${A_DARK})` }}>
            {photo
              ? <img src={photo} alt="avatar" className="w-full h-full object-cover" />
              : <span className="text-white font-bold text-2xl">{firstInitial}</span>}
          </div>
          <button onClick={() => photoRef.current?.click()}
            className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg flex items-center justify-center shadow"
            style={{ background: AMBER }}>
            <Camera size={12} className="text-white" />
          </button>
          <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
        </div>
        <div>
          <p className="font-bold text-[15px] text-gray-900">{businessName}</p>
          <p className="text-[12px] text-gray-500">{email}</p>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold mt-1"
            style={{ background: A_BG, color: AMBER }}>
            🏪 Vendor
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
                background: active ? A_BG : "transparent",
                color: active ? AMBER : "#6b7280",
                border: `1.5px solid ${active ? A_BORDER : "transparent"}`,
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
            <Section title="Contact information">
              <Field label="Contact name">
                <input className="input w-full" value={name} onChange={e => setName(e.target.value)}
                  style={{ borderColor: name ? AMBER : undefined }} />
              </Field>
              <Field label="Email" hint="Contact support to change your email">
                <input className="input w-full" value={email} readOnly style={{ background: "#f9fafb", color: "#6b7280" }} />
              </Field>
              <Field label="Phone">
                <input className="input w-full" type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                  style={{ borderColor: phone ? AMBER : undefined }} />
              </Field>
              <Field label="Stall tagline" hint="Shown under your pin on the map">
                <input className="input w-full" value={bio} onChange={e => setBio(e.target.value)}
                  style={{ borderColor: bio ? AMBER : undefined }} />
              </Field>
            </Section>
            <SaveButton saved={saved} color={AMBER} onClick={handleSave} />
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
              {DEMO_MODE ? <DemoBadge /> : <SaveButton saved={pwSaved} color={AMBER} onClick={handlePwSave} label="Update password" />}
            </Section>
            <DangerZone demoMode={DEMO_MODE} />
          </>
        )}

        {/* Notifications */}
        {tab === "notifications" && (
          <Section title="Notification preferences">
            {([
              ["newReviews",           "New reviews",              "When a camper leaves a review on your stall"],
              ["stallCheckins",        "Stall check-ins",          "When campers tag your stall in a post"],
              ["scheduleReminders",    "Schedule reminders",       "24h and 1h before your events start"],
              ["festivalAnnouncements","Festival announcements",   "Important updates from the festival team"],
              ["paymentConfirmations", "Payment confirmations",    "When a transaction is processed"],
              ["promotions",           "Promotions",               "Tips to boost your stall visibility"],
            ] as [keyof typeof notifs, string, string][]).map(([key, label, sub]) => (
              <Toggle key={key} label={label} sub={sub} value={notifs[key]} color={AMBER}
                onChange={v => setNotifs(n => ({ ...n, [key]: v }))} />
            ))}
          </Section>
        )}

        {/* Privacy */}
        {tab === "privacy" && (
          <>
            <Section title="Stall visibility on map">
              {(["everyone", "festival", "private"] as const).map(opt => (
                <RadioRow key={opt}
                  label={opt === "everyone" ? "Visible to everyone" : opt === "festival" ? "Festival attendees only" : "Hidden (off map)"}
                  sub={opt === "everyone" ? "Your pin is public on the festival map" : opt === "festival" ? "Only ticket holders can see your pin" : "Hides your stall from the map — use during closed hours"}
                  selected={stallVisible === opt} color={AMBER} onClick={() => setStallVisible(opt)} />
              ))}
            </Section>
            <Section title="Hours display">
              <Toggle label="Show opening hours publicly" sub="Campers can see when your stall is open"
                value={showHours} color={AMBER} onChange={setShowHours} />
            </Section>
            <Section title="Your data">
              <DataExportButton color={AMBER} bg={A_BG} border={A_BORDER} />
            </Section>
          </>
        )}

        {/* Business */}
        {tab === "business" && (
          <>
            <Section title="Business details">
              <Field label="Trading name">
                <div className="relative">
                  <Building2 size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input className="input w-full pl-10" value={businessName}
                    onChange={e => setBusinessName(e.target.value)}
                    style={{ borderColor: businessName ? AMBER : undefined }} />
                </div>
              </Field>
              <Field label="Business type">
                <div className="grid grid-cols-2 gap-2">
                  {["Sole Trader", "Ltd Company", "Partnership", "CIC"].map(t => (
                    <button key={t} onClick={() => setBusinessType(t)}
                      className="py-2.5 rounded-xl text-[12px] font-semibold transition-all"
                      style={{
                        background: businessType === t ? A_BG : "#f3f4f6",
                        border: `1.5px solid ${businessType === t ? AMBER : "transparent"}`,
                        color: businessType === t ? AMBER : "#374151",
                      }}>
                      {t}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Category">
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map(cat => (
                    <button key={cat.id} onClick={() => setCategory(cat.id)}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-all"
                      style={{
                        background: category === cat.id ? A_BG : "#f3f4f6",
                        border: `1.5px solid ${category === cat.id ? AMBER : "transparent"}`,
                        color: category === cat.id ? AMBER : "#374151",
                      }}>
                      <span>{cat.emoji}</span>
                      <span className="text-[12px] font-semibold">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Description" hint="Shown to campers on the map and schedule">
                <textarea className="input w-full resize-none" rows={3}
                  value={description} onChange={e => setDescription(e.target.value)}
                  style={{ borderColor: description ? AMBER : undefined }} />
              </Field>
              <Field label="Opening hours">
                <input className="input w-full" value={openingHours}
                  onChange={e => setOpeningHours(e.target.value)}
                  style={{ borderColor: openingHours ? AMBER : undefined }} />
              </Field>
            </Section>

            <Section title="Bank details">
              <div className="rounded-2xl px-4 py-3 flex items-start gap-3 mb-3"
                style={{ background: A_BG, border: `1px solid ${A_BORDER}` }}>
                <CreditCard size={15} style={{ color: AMBER }} className="mt-0.5 flex-shrink-0" />
                <p className="text-[12px] text-amber-700 leading-relaxed">
                  Bank details are encrypted and only used for festival payout transfers.
                  They are never shared with campers.
                </p>
              </div>
              <Field label="Sort code">
                <input className="input w-full font-mono tracking-wider"
                  value={showBankDetails ? sortCode : "••-••-••"}
                  readOnly={!showBankDetails}
                  onChange={e => setSortCode(e.target.value)}
                  style={{ borderColor: AMBER }} />
              </Field>
              <Field label="Account number">
                <input className="input w-full font-mono tracking-wider"
                  value={showBankDetails ? accountNumber : "••••••••"}
                  readOnly={!showBankDetails}
                  onChange={e => setAccountNumber(e.target.value)}
                  style={{ borderColor: AMBER }} />
              </Field>
              <button onClick={() => setShowBankDetails(p => !p)}
                className="text-[12px] font-semibold flex items-center gap-1.5"
                style={{ color: AMBER }}>
                {showBankDetails ? <><EyeOff size={13} /> Hide details</> : <><Eye size={13} /> Reveal & edit details</>}
              </button>
              {DEMO_MODE && <DemoBadge />}
            </Section>

            <SaveButton saved={saved} color={AMBER} onClick={handleSave} label="Save business settings" />
          </>
        )}
      </div>

      <BottomNav role="vendor" />
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
            <p className="text-[12px] text-red-500 mt-0.5">Removes your vendor profile, stall pin, events, and all data.</p>
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
