"use client";
import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Check, Upload, Eye, Globe, Users, MapPin, Calendar, Building, Phone, Mail, FileText, AlertCircle, X } from "lucide-react";

type Step = 1 | 2 | 3 | 4;

const EVENT_TYPES = [
  { value: "music_festival", label: "Music Festival", emoji: "🎵" },
  { value: "camping_event",  label: "Camping Event",  emoji: "⛺" },
  { value: "corporate",      label: "Corporate Event", emoji: "🏢" },
  { value: "community",      label: "Community Event", emoji: "🌍" },
  { value: "sports",         label: "Sports Event",    emoji: "🏆" },
  { value: "other",          label: "Other",            emoji: "✨" },
];

const SERVICES = [
  { id: "tent_booking",   label: "Tent Booking",        desc: "Pre-book and set up tents for attendees", icon: "⛺" },
  { id: "camp_assistance",label: "Camp Assistance",     desc: "On-demand assistants roaming the site",   icon: "🙋" },
  { id: "navigation",     label: "Festival Navigation", desc: "Interactive map with vendor search",       icon: "🗺️" },
  { id: "social",         label: "Camp Social",         desc: "In-app social feed + anonymous groups",    icon: "💬" },
];

const MAP_FORMATS = [
  {
    format: "GeoJSON",
    ext: ".geojson / .json",
    icon: "🌐",
    recommended: true,
    desc: "Our preferred format. Works directly with our mapping engine with zero conversion. Export from QGIS, Mapbox Studio, or any GIS tool.",
    bestFor: "Best for: Technical organisers, GIS users, Google Maps exports",
  },
  {
    format: "KML / KMZ",
    ext: ".kml / .kmz",
    icon: "📍",
    recommended: false,
    desc: "Standard export from Google Earth and Google My Maps. We auto-convert to GeoJSON. Most event organisers are familiar with this.",
    bestFor: "Best for: Teams who manage their site in Google Earth or My Maps",
  },
  {
    format: "CSV (POI List)",
    ext: ".csv",
    icon: "📊",
    recommended: false,
    desc: "Simple spreadsheet with columns: Name, Category, Latitude, Longitude, Description. Download our template below.",
    bestFor: "Best for: Simple point-of-interest lists, new organisers",
  },
];

function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5 justify-center py-3">
      {Array.from({ length: total }, (_, i) => (
        <div key={i}
          className="transition-all duration-300"
          style={{
            width: i + 1 === current ? "20px" : "8px",
            height: "8px",
            borderRadius: i + 1 === current ? "4px" : "50%",
            background: i + 1 <= current ? "#7c3aed" : "#e5e7eb",
          }} />
      ))}
    </div>
  );
}

export default function FestivalOnboardingPage() {
  const [step, setStep] = useState<Step>(1);
  const [showMapTemplate, setShowMapTemplate] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    // Step 1
    festival_name: "",
    organiser_name: "",
    organiser_email: "",
    organiser_phone: "",
    event_type: "",
    // Step 2
    start_date: "",
    end_date: "",
    venue_name: "",
    venue_location: "",
    expected_attendance: "",
    expected_vendors: "",
    camping_zones: "",
    // Step 3
    site_plan_file: null as File | null,
    site_plan_format: "",
    // Step 4
    services: [] as string[],
    notes: "",
    onboarding_type: "self" as "self" | "assisted",
  });

  const update = (key: string, value: any) => setForm(f => ({ ...f, [key]: value }));
  const toggleService = (id: string) =>
    update("services", form.services.includes(id) ? form.services.filter(s => s !== id) : [...form.services, id]);

  const canNext = () => {
    if (step === 1) return form.festival_name && form.organiser_name && form.organiser_email && form.event_type;
    if (step === 2) return form.start_date && form.end_date && form.venue_name && form.venue_location;
    if (step === 3) return true; // site plan is optional
    if (step === 4) return form.services.length > 0;
    return false;
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
        style={{ background: "#f7f8fa" }}>
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5"
          style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)", boxShadow: "0 6px 24px rgba(124,58,237,0.35)" }}>
          <Check size={36} className="text-white" strokeWidth={3} />
        </div>
        <h2 className="text-2xl font-bold mb-2">Festival Submitted!</h2>
        <p className="text-gray-500 text-[14px] max-w-xs leading-relaxed mb-8">
          <strong>{form.festival_name}</strong> has been submitted for review. Our team will reach out to <strong>{form.organiser_email}</strong> within 24 hours.
        </p>
        <Link href="/admin" className="btn-primary max-w-xs"
          style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)", boxShadow: "0 4px 16px rgba(124,58,237,0.3)" }}>
          Back to Admin Panel
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#f7f8fa" }}>
      {/* Header */}
      <div className="page-header justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center">
            <ChevronLeft size={18} className="text-gray-600" />
          </Link>
          <div>
            <h1 className="font-bold text-[16px]">Onboard Festival</h1>
            <p className="text-[11px] text-gray-400">Step {step} of 4</p>
          </div>
        </div>
        <span className="badge badge-purple text-[11px]">
          {form.onboarding_type === "self" ? "Self-service" : "Admin assisted"}
        </span>
      </div>

      <StepDots current={step} total={4} />

      <div className="px-4 pb-32 animate-fade-in-up">

        {/* ──────── STEP 1: Basic Info ──────── */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h2 className="font-bold text-[18px] text-gray-900 mb-1">Event Details</h2>
              <p className="text-[13px] text-gray-500">Tell us about the festival or event.</p>
            </div>

            {/* Onboarding type toggle */}
            <div className="card">
              <p className="form-label">Onboarding type</p>
              <div className="grid grid-cols-2 gap-2">
                {(["self", "assisted"] as const).map(type => (
                  <button key={type}
                    onClick={() => update("onboarding_type", type)}
                    className="py-3 rounded-2xl text-[13px] font-semibold transition-all"
                    style={{
                      background: form.onboarding_type === type ? "#7c3aed" : "#f3f4f6",
                      color: form.onboarding_type === type ? "#fff" : "#6b7280",
                      boxShadow: form.onboarding_type === type ? "0 3px 10px rgba(124,58,237,0.25)" : "none",
                    }}>
                    {type === "self" ? "🙋 Self-service" : "👥 Admin assisted"}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-gray-400 mt-2 leading-relaxed">
                {form.onboarding_type === "self"
                  ? "Organisers complete setup independently via our onboarding portal."
                  : "Our team will walk the organiser through the setup process."}
              </p>
            </div>

            <div className="form-section space-y-4">
              <p className="form-section-title"><Globe size={15} className="text-purple-500" /> Festival Information</p>
              <div>
                <label className="form-label">Festival / Event name *</label>
                <input className="input" placeholder="e.g. In It Together 2028"
                  value={form.festival_name} onChange={e => update("festival_name", e.target.value)} />
              </div>
              <div>
                <label className="form-label">Event type *</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {EVENT_TYPES.map(et => (
                    <button key={et.value}
                      onClick={() => update("event_type", et.value)}
                      className="flex items-center gap-2 py-2.5 px-3 rounded-xl text-[13px] font-semibold transition-all text-left"
                      style={{
                        background: form.event_type === et.value ? "#ede9fe" : "#f7f8fa",
                        border: form.event_type === et.value ? "1.5px solid #7c3aed" : "1.5px solid transparent",
                        color: form.event_type === et.value ? "#6d28d9" : "#6b7280",
                      }}>
                      <span>{et.emoji}</span> {et.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="form-section space-y-4">
              <p className="form-section-title"><Users size={15} className="text-purple-500" /> Organiser Contact</p>
              <div>
                <label className="form-label">Lead organiser name *</label>
                <input className="input" placeholder="Full name"
                  value={form.organiser_name} onChange={e => update("organiser_name", e.target.value)} />
              </div>
              <div>
                <label className="form-label">Email address *</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input className="input pl-9" placeholder="ops@yourfestival.com" type="email"
                    value={form.organiser_email} onChange={e => update("organiser_email", e.target.value)} />
                </div>
              </div>
              <div>
                <label className="form-label">Phone number</label>
                <div className="relative">
                  <Phone size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input className="input pl-9" placeholder="+44 7700 000000" type="tel"
                    value={form.organiser_phone} onChange={e => update("organiser_phone", e.target.value)} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ──────── STEP 2: Scale & Dates ──────── */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="font-bold text-[18px] text-gray-900 mb-1">Dates & Scale</h2>
              <p className="text-[13px] text-gray-500">Help us prepare the right team and resources.</p>
            </div>

            <div className="form-section space-y-4">
              <p className="form-section-title"><Calendar size={15} className="text-purple-500" /> Event Dates</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Start date *</label>
                  <input className="input" type="date" value={form.start_date} onChange={e => update("start_date", e.target.value)} />
                </div>
                <div>
                  <label className="form-label">End date *</label>
                  <input className="input" type="date" value={form.end_date} onChange={e => update("end_date", e.target.value)} />
                </div>
              </div>
            </div>

            <div className="form-section space-y-4">
              <p className="form-section-title"><Building size={15} className="text-purple-500" /> Venue</p>
              <div>
                <label className="form-label">Venue name *</label>
                <input className="input" placeholder="e.g. Margam Park, Glastonbury Farm"
                  value={form.venue_name} onChange={e => update("venue_name", e.target.value)} />
              </div>
              <div>
                <label className="form-label">Full address / postcode *</label>
                <div className="relative">
                  <MapPin size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input className="input pl-9" placeholder="Street, City, Postcode"
                    value={form.venue_location} onChange={e => update("venue_location", e.target.value)} />
                </div>
              </div>
            </div>

            <div className="form-section space-y-4">
              <p className="form-section-title"><Users size={15} className="text-purple-500" /> Expected Scale</p>
              <div className="rounded-2xl p-3 flex items-start gap-2"
                style={{ background: "#f5f3ff", border: "1px solid #ddd6fe" }}>
                <AlertCircle size={14} className="text-purple-500 mt-0.5 flex-shrink-0" />
                <p className="text-[12px] text-purple-700 leading-relaxed">
                  Approximate numbers are fine — we use these to allocate the right number of camp assistants and plan tent inventory.
                </p>
              </div>
              <div>
                <label className="form-label">Expected total attendance</label>
                <input className="input" type="number" placeholder="e.g. 60000"
                  value={form.expected_attendance} onChange={e => update("expected_attendance", e.target.value)} />
                <p className="form-hint">Total number of people expected at the event (including day visitors).</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Vendors on site</label>
                  <input className="input" type="number" placeholder="e.g. 40"
                    value={form.expected_vendors} onChange={e => update("expected_vendors", e.target.value)} />
                  <p className="form-hint">Food, bar, retail etc.</p>
                </div>
                <div>
                  <label className="form-label">Camping zones</label>
                  <input className="input" type="number" placeholder="e.g. 6"
                    value={form.camping_zones} onChange={e => update("camping_zones", e.target.value)} />
                  <p className="form-hint">Distinct camping areas.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ──────── STEP 3: Site Plan ──────── */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <h2 className="font-bold text-[18px] text-gray-900 mb-1">Site Plan / Event Map</h2>
              <p className="text-[13px] text-gray-500 leading-relaxed">
                Upload your site plan so we can build a fully interactive, searchable map for your attendees. <span className="text-purple-600 font-semibold">This is optional at onboarding</span> — you can upload it later.
              </p>
            </div>

            {/* Recommended format box */}
            <div className="card">
              <p className="form-section-title"><FileText size={15} className="text-purple-500" /> Accepted File Formats</p>
              <div className="space-y-3">
                {MAP_FORMATS.map(fmt => (
                  <div key={fmt.format}
                    className="rounded-2xl p-3 border-2 cursor-pointer transition-all"
                    style={{
                      borderColor: form.site_plan_format === fmt.format ? "#7c3aed" : "#e5e7eb",
                      background: form.site_plan_format === fmt.format ? "#f5f3ff" : "#fafafa",
                    }}
                    onClick={() => update("site_plan_format", fmt.format)}>
                    <div className="flex items-start gap-3">
                      <span className="text-xl flex-shrink-0">{fmt.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="font-bold text-[13px] text-gray-900">{fmt.format}</p>
                          {fmt.recommended && (
                            <span className="badge badge-purple text-[10px] px-1.5 py-0.5">Recommended</span>
                          )}
                          <span className="text-[11px] text-gray-400">{fmt.ext}</span>
                        </div>
                        <p className="text-[12px] text-gray-600 leading-relaxed mb-1">{fmt.desc}</p>
                        <p className="text-[11px] text-purple-600 font-medium">{fmt.bestFor}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* View Template Button */}
            <button onClick={() => setShowMapTemplate(true)}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-dashed border-purple-300 text-purple-600 font-semibold text-[13px] transition-all"
              style={{ background: "#f5f3ff" }}>
              <Eye size={16} /> View Site Plan Template
            </button>

            {/* Upload zone */}
            {form.site_plan_format && (
              <div className="upload-zone">
                <Upload size={28} className="text-gray-300 mx-auto mb-2" />
                <p className="font-semibold text-[14px] text-gray-700 mb-1">Upload your {form.site_plan_format} file</p>
                <p className="text-[12px] text-gray-400 mb-4">
                  {form.site_plan_format === "CSV" ? "CSV with: Name, Category, Lat, Lng, Description" :
                   form.site_plan_format === "KML / KMZ" ? "Export from Google Earth or Google My Maps" :
                   "GeoJSON FeatureCollection with point or polygon features"}
                </p>
                <label className="btn-primary max-w-xs mx-auto block text-center cursor-pointer text-[13px]"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)", boxShadow: "0 4px 14px rgba(124,58,237,0.3)" }}>
                  Choose File
                  <input type="file" className="hidden"
                    accept={form.site_plan_format === "GeoJSON" ? ".geojson,.json" : form.site_plan_format === "KML / KMZ" ? ".kml,.kmz" : ".csv"}
                    onChange={e => update("site_plan_file", e.target.files?.[0] || null)} />
                </label>
                {form.site_plan_file && (
                  <div className="mt-3 flex items-center justify-center gap-2">
                    <Check size={14} className="text-green-600" />
                    <p className="text-[12px] font-semibold text-green-700">{form.site_plan_file.name}</p>
                  </div>
                )}
              </div>
            )}

            {!form.site_plan_format && (
              <div className="upload-zone opacity-50">
                <Upload size={28} className="text-gray-300 mx-auto mb-2" />
                <p className="text-[13px] text-gray-400">Select a format above to upload your site plan</p>
              </div>
            )}

            <div className="rounded-2xl p-3 flex items-start gap-2"
              style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
              <span className="text-[15px]">✅</span>
              <div>
                <p className="text-[12px] font-semibold text-green-800 mb-0.5">What happens after upload?</p>
                <p className="text-[11px] text-green-700 leading-relaxed">
                  Our system automatically converts your file into a live, searchable map with vendor categories, navigation, and review functionality. KML files are converted to GeoJSON — no action needed from you.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ──────── STEP 4: Services & Review ──────── */}
        {step === 4 && (
          <div className="space-y-4">
            <div>
              <h2 className="font-bold text-[18px] text-gray-900 mb-1">Services & Review</h2>
              <p className="text-[13px] text-gray-500">Choose which CampAssist features to enable at this event.</p>
            </div>

            <div className="space-y-2">
              {SERVICES.map(svc => {
                const active = form.services.includes(svc.id);
                return (
                  <button key={svc.id}
                    onClick={() => toggleService(svc.id)}
                    className="w-full text-left rounded-2xl border-2 p-4 transition-all"
                    style={{
                      borderColor: active ? "#7c3aed" : "#e5e7eb",
                      background: active ? "#f5f3ff" : "#fff",
                    }}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl flex-shrink-0">{svc.icon}</span>
                        <div>
                          <p className="font-bold text-[13px] text-gray-900">{svc.label}</p>
                          <p className="text-[12px] text-gray-500 mt-0.5">{svc.desc}</p>
                        </div>
                      </div>
                      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: active ? "#7c3aed" : "#e5e7eb" }}>
                        {active && <Check size={11} className="text-white" strokeWidth={3} />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="form-section">
              <label className="form-label">Additional notes for our team</label>
              <textarea className="input resize-none" rows={3}
                placeholder="Anything specific about this event — accessibility needs, special requests, constraints..."
                value={form.notes} onChange={e => update("notes", e.target.value)} />
            </div>

            {/* Summary */}
            <div className="card" style={{ background: "#f5f3ff", border: "1px solid #ddd6fe" }}>
              <p className="font-bold text-[13px] text-purple-800 mb-3">Submission Summary</p>
              <div className="space-y-2">
                {[
                  { label: "Festival", value: form.festival_name },
                  { label: "Organiser", value: form.organiser_name },
                  { label: "Dates", value: form.start_date && form.end_date ? `${form.start_date} – ${form.end_date}` : "—" },
                  { label: "Venue", value: form.venue_name || "—" },
                  { label: "Attendance", value: form.expected_attendance ? `~${parseInt(form.expected_attendance).toLocaleString()} people` : "Not provided" },
                  { label: "Site plan", value: form.site_plan_file ? form.site_plan_file.name : "Not uploaded" },
                  { label: "Services", value: form.services.length > 0 ? form.services.map(s => SERVICES.find(x => x.id === s)?.label).join(", ") : "None selected" },
                ].map(item => (
                  <div key={item.label} className="flex items-start gap-2">
                    <p className="text-[12px] text-purple-600 font-semibold w-24 flex-shrink-0">{item.label}</p>
                    <p className="text-[12px] text-gray-700 flex-1">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ── Bottom Nav ── */}
      <div className="fixed bottom-0 left-0 right-0 px-4 pb-6 pt-3"
        style={{ background: "rgba(247,248,250,0.96)", backdropFilter: "blur(16px)", borderTop: "1px solid rgba(0,0,0,0.05)" }}>
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          {step > 1 && (
            <button onClick={() => setStep(s => (s - 1) as Step)}
              className="btn-secondary flex-shrink-0 w-12 flex items-center justify-center">
              <ChevronLeft size={18} />
            </button>
          )}
          <button
            onClick={() => step < 4 ? setStep(s => (s + 1) as Step) : setSubmitted(true)}
            disabled={!canNext()}
            className="btn-primary flex-1"
            style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)", boxShadow: "0 4px 16px rgba(124,58,237,0.3)" }}>
            {step < 4 ? "Continue" : "Submit Festival"}
          </button>
        </div>
      </div>

      {/* ── Map Template Modal ── */}
      {showMapTemplate && (
        <>
          <div className="overlay-bg" onClick={() => setShowMapTemplate(false)} />
          <div className="bottom-sheet px-5 pt-6 pb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[16px]">Site Plan Template</h3>
              <button onClick={() => setShowMapTemplate(false)}
                className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center">
                <X size={16} className="text-gray-500" />
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden border border-gray-100 mb-4"
              style={{ background: "#f0fdf4" }}>
              {/* Visual map preview */}
              <div className="relative h-48" style={{ background: "linear-gradient(135deg, #052e16, #14532d)" }}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-2">🗺️</div>
                    <p className="text-white font-bold text-[14px]">Festival Site Plan</p>
                    <p className="text-white/60 text-[12px]">GeoJSON / KML / CSV</p>
                  </div>
                </div>
                {/* Mock POI pins */}
                {[
                  { emoji: "🎵", top: "30%", left: "25%" },
                  { emoji: "🍔", top: "50%", left: "55%" },
                  { emoji: "🚻", top: "65%", left: "35%" },
                  { emoji: "🚑", top: "20%", left: "65%" },
                  { emoji: "🍺", top: "40%", left: "75%" },
                ].map((pin, i) => (
                  <div key={i} className="absolute text-xl" style={{ top: pin.top, left: pin.left, filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.4))" }}>
                    {pin.emoji}
                  </div>
                ))}
              </div>
              <div className="p-4">
                <p className="font-bold text-[13px] text-gray-900 mb-2">Required data per location pin:</p>
                <div className="space-y-1.5">
                  {[
                    { field: "name", example: "\"Big Smoke Burgers\"", required: true },
                    { field: "category", example: "\"food\" | \"bar\" | \"stage\" | \"toilet\" | \"first_aid\" | \"water\" | \"other\"", required: true },
                    { field: "lat", example: "51.5798", required: true },
                    { field: "lng", example: "-3.7265", required: true },
                    { field: "description", example: "\"Award-winning smash burgers · Open 11am–1am\"", required: false },
                  ].map(f => (
                    <div key={f.field} className="flex items-start gap-2">
                      <code className="text-[11px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded flex-shrink-0">{f.field}</code>
                      <div>
                        <code className="text-[11px] text-gray-500">{f.example}</code>
                        {f.required && <span className="ml-1 text-[10px] text-red-500 font-semibold">required</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-2xl p-4 flex items-start gap-3"
              style={{ background: "#f5f3ff", border: "1px solid #ddd6fe" }}>
              <span className="text-[20px] flex-shrink-0">💡</span>
              <div>
                <p className="font-bold text-[12px] text-purple-800 mb-1">Pro tip from our team</p>
                <p className="text-[12px] text-purple-700 leading-relaxed">
                  If your team manages site layouts in Google Maps, just use <strong>Google My Maps</strong> to pin all your locations, then export as KML. Our system handles the conversion automatically. No technical knowledge needed.
                </p>
              </div>
            </div>

            <button onClick={() => setShowMapTemplate(false)} className="btn-primary mt-4"
              style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)", boxShadow: "0 4px 14px rgba(124,58,237,0.3)" }}>
              Got it
            </button>
          </div>
        </>
      )}
    </div>
  );
}
