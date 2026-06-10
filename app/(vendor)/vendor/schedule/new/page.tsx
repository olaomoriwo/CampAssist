"use client";
import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, CheckCircle, Download, Upload, X, Calendar, Clock } from "lucide-react";

const AMBER = "#d97706";
const AMBER_DARK = "#b45309";
const AMBER_LIGHT = "#fffbeb";
const AMBER_BG = "#fef3c7";

type EventType = "performance" | "free_tasting" | "competition" | "workshop" | "special" | "promotion";
type Day = "Friday" | "Saturday" | "Sunday";
type Mode = "form" | "upload";

const EVENT_TYPES: { id: EventType; label: string; emoji: string; desc: string }[] = [
  { id: "performance",  emoji: "🎤", label: "Live Performance",  desc: "Band, DJ, comedy, artist" },
  { id: "free_tasting", emoji: "🥤", label: "Free Tasting",      desc: "Let people try your product" },
  { id: "competition",  emoji: "🏆", label: "Competition",       desc: "Games, challenges, prizes" },
  { id: "workshop",     emoji: "👩‍🍳", label: "Workshop",         desc: "Hands-on demos or classes" },
  { id: "special",      emoji: "⭐", label: "Special Event",    desc: "Secret menu, VIP access" },
  { id: "promotion",    emoji: "🏷️", label: "Promotion",         desc: "Discounts, 2-for-1, happy hour" },
];

const TEMPLATE_CSV = `event_name,day,start_time,end_time,description,type,is_free,capacity
"Secret Menu Launch","Friday","12:00","13:00","Try our exclusive festival-only menu before anyone else!","special","no","50"
"Live Acoustic Set","Friday","20:00","21:30","Artist performing live at our stall — free to watch, buy drinks!","performance","yes","80"
"Burger Eating Challenge","Saturday","16:00","17:00","Eat 3 double smash burgers in 10 min and win a weekend of free food!","competition","yes","10"
"Happy Hour 2-for-1","Sunday","15:00","17:00","Two-for-one on all burgers, first come first served.","promotion","no",""`;

function downloadTemplate() {
  const blob = new Blob([TEMPLATE_CSV], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "campAssist_vendor_schedule_template.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function VendorScheduleNewPage() {
  const [mode, setMode] = useState<Mode>("form");
  const [saved, setSaved] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadDone, setUploadDone] = useState(false);

  const [form, setForm] = useState({
    eventName: "",
    day: "" as Day | "",
    startTime: "",
    endTime: "",
    type: "" as EventType | "",
    description: "",
    isFree: true,
    capacity: "",
    isHot: false,
  });

  const set = (k: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm(f => ({ ...f, [k]: e.target.value }));

  const valid = form.eventName && form.day && form.startTime && form.endTime && form.type;

  if (saved) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
        style={{ background: AMBER_LIGHT }}>
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6"
          style={{ background: `linear-gradient(135deg, ${AMBER}, ${AMBER_DARK})` }}>
          <CheckCircle size={40} className="text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Event added!</h2>
        <p className="text-[13px] text-gray-500 mb-8 max-w-xs leading-relaxed">
          <strong className="text-gray-800">"{form.eventName}"</strong> is now live on
          the camper schedule. Campers browsing What's On will see it instantly.
        </p>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Link href="/vendor/schedule"
            className="flex items-center justify-center gap-2 font-bold py-4 px-6 rounded-2xl text-sm text-white"
            style={{ background: `linear-gradient(135deg, ${AMBER}, ${AMBER_DARK})`, boxShadow: "0 4px 16px rgba(217,119,6,0.3)" }}>
            View My Schedule
          </Link>
          <button onClick={() => { setSaved(false); setForm({ eventName:"", day:"", startTime:"", endTime:"", type:"", description:"", isFree:true, capacity:"", isHot:false }); }}
            className="flex items-center justify-center gap-2 font-semibold py-4 px-6 rounded-2xl text-sm"
            style={{ background: "#fff", border: "1px solid #fde68a", color: AMBER_DARK }}>
            Add another event
          </button>
        </div>
      </div>
    );
  }

  if (uploadDone) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
        style={{ background: AMBER_LIGHT }}>
        <div className="text-6xl mb-5">🎉</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Schedule imported!</h2>
        <p className="text-[13px] text-gray-500 mb-3 max-w-xs leading-relaxed">
          <strong className="text-gray-800">{uploadedFile?.name}</strong> was processed.
          Your events have been added to the festival schedule.
        </p>
        <div className="card w-full max-w-xs mb-8 text-left">
          <p className="text-[12px] text-gray-400 mb-2">Events detected</p>
          {[
            { name: "Secret Menu Launch", day: "Friday", time: "12:00–13:00" },
            { name: "Live Acoustic Set", day: "Friday", time: "20:00–21:30" },
            { name: "Burger Eating Challenge", day: "Saturday", time: "16:00–17:00" },
          ].map(e => (
            <div key={e.name} className="flex items-center gap-2 py-1.5 border-b border-gray-50 last:border-0">
              <CheckCircle size={12} className="text-green-500 flex-shrink-0" />
              <div>
                <p className="text-[12px] font-semibold text-gray-800">{e.name}</p>
                <p className="text-[11px] text-gray-400">{e.day} · {e.time}</p>
              </div>
            </div>
          ))}
        </div>
        <Link href="/vendor/schedule"
          className="flex items-center justify-center gap-2 font-bold py-4 px-8 rounded-2xl text-sm text-white"
          style={{ background: `linear-gradient(135deg, ${AMBER}, ${AMBER_DARK})`, boxShadow: "0 4px 16px rgba(217,119,6,0.3)" }}>
          View My Schedule →
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: AMBER_LIGHT }}>
      {/* Header */}
      <div className="page-header justify-between"
        style={{ background: "#fff", borderBottom: "1px solid #fde68a" }}>
        <div className="flex items-center gap-3">
          <Link href="/vendor/schedule"
            className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
            <ChevronLeft size={18} style={{ color: AMBER }} />
          </Link>
          <div>
            <p className="font-bold text-[15px]">Add Event</p>
            <p className="text-[11px] text-gray-400">The Green Bar</p>
          </div>
        </div>
      </div>

      {/* Mode toggle */}
      <div className="flex items-center gap-1 mx-4 mt-4 p-1 rounded-2xl bg-white"
        style={{ border: "1px solid #fde68a" }}>
        {(["form", "upload"] as Mode[]).map(m => (
          <button key={m} onClick={() => setMode(m)}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold transition-all"
            style={{
              background: mode === m ? `linear-gradient(135deg, ${AMBER}, ${AMBER_DARK})` : "transparent",
              color: mode === m ? "#fff" : "#9ca3af",
            }}>
            {m === "form" ? "✏️  Add manually" : "📤  Upload template"}
          </button>
        ))}
      </div>

      <div className="flex-1 px-4 pt-5 pb-36 space-y-5 animate-fade-in-up">

        {/* ── Manual form ── */}
        {mode === "form" && (
          <>
            <div>
              <label className="form-label">Event name *</label>
              <input className="input w-full" placeholder='e.g. "Tango Night", "Free Tasting 12–2pm"'
                value={form.eventName} onChange={set("eventName")}
                style={{ borderColor: form.eventName ? AMBER : undefined }} />
            </div>

            <div>
              <label className="form-label">Day *</label>
              <div className="grid grid-cols-3 gap-2">
                {(["Friday", "Saturday", "Sunday"] as Day[]).map(d => (
                  <button key={d} onClick={() => setForm(f => ({ ...f, day: d }))}
                    className="py-3 rounded-2xl border-2 text-[13px] font-semibold transition-all"
                    style={{
                      borderColor: form.day === d ? AMBER : "#fde68a",
                      background: form.day === d ? AMBER_BG : "#fff",
                      color: form.day === d ? AMBER_DARK : "#374151",
                    }}>
                    <div className="text-lg mb-0.5">
                      {d === "Friday" ? "🎉" : d === "Saturday" ? "🌟" : "🌅"}
                    </div>
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="form-label">Start time *</label>
                <div className="relative">
                  <Clock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="time" className="input w-full pl-9"
                    value={form.startTime} onChange={set("startTime")}
                    style={{ borderColor: form.startTime ? AMBER : undefined }} />
                </div>
              </div>
              <div>
                <label className="form-label">End time *</label>
                <div className="relative">
                  <Clock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="time" className="input w-full pl-9"
                    value={form.endTime} onChange={set("endTime")}
                    style={{ borderColor: form.endTime ? AMBER : undefined }} />
                </div>
              </div>
            </div>

            <div>
              <label className="form-label">Event type *</label>
              <div className="grid grid-cols-2 gap-2">
                {EVENT_TYPES.map(t => (
                  <button key={t.id} onClick={() => setForm(f => ({ ...f, type: t.id }))}
                    className="flex items-start gap-2.5 px-3 py-3 rounded-2xl border-2 text-left transition-all"
                    style={{
                      borderColor: form.type === t.id ? AMBER : "#fde68a",
                      background: form.type === t.id ? AMBER_BG : "#fff",
                    }}>
                    <span className="text-xl flex-shrink-0 mt-0.5">{t.emoji}</span>
                    <div>
                      <p className="text-[12px] font-bold" style={{ color: form.type === t.id ? AMBER_DARK : "#374151" }}>
                        {t.label}
                      </p>
                      <p className="text-[11px] text-gray-400">{t.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="form-label">Description</label>
              <textarea className="input w-full resize-none" rows={3}
                placeholder="Tell campers what to expect — be specific and exciting!"
                value={form.description} onChange={set("description")}
                style={{ borderColor: form.description ? AMBER : undefined }} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="form-label">Entry</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {[{ v: true, l: "Free" }, { v: false, l: "Paid" }].map(({ v, l }) => (
                    <button key={l} onClick={() => setForm(f => ({ ...f, isFree: v }))}
                      className="py-2.5 rounded-xl text-[12px] font-semibold border-2 transition-all"
                      style={{
                        borderColor: form.isFree === v ? AMBER : "#fde68a",
                        background: form.isFree === v ? AMBER_BG : "#fff",
                        color: form.isFree === v ? AMBER_DARK : "#374151",
                      }}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="form-label">Max capacity</label>
                <input type="number" className="input w-full" placeholder="Leave blank if unlimited"
                  value={form.capacity} onChange={set("capacity")}
                  style={{ borderColor: form.capacity ? AMBER : undefined }} />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-amber-100">
              <div>
                <p className="text-[13px] font-semibold text-gray-800">Mark as trending 🔥</p>
                <p className="text-[12px] text-gray-400">Appears at the top of the What's On feed</p>
              </div>
              <button onClick={() => setForm(f => ({ ...f, isHot: !f.isHot }))}
                className="w-12 h-6 rounded-full transition-all relative"
                style={{ background: form.isHot ? AMBER : "#e5e7eb" }}>
                <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm"
                  style={{ left: form.isHot ? "26px" : "2px" }} />
              </button>
            </div>
          </>
        )}

        {/* ── Upload template ── */}
        {mode === "upload" && (
          <div className="space-y-4">
            <div className="rounded-2xl px-4 py-4 flex items-start gap-3"
              style={{ background: "#fff", border: "1px solid #fde68a" }}>
              <span className="text-2xl">📋</span>
              <div>
                <p className="text-[13px] font-bold text-gray-800 mb-1">How to use the template</p>
                {[
                  "Download the CSV template below",
                  "Open it in Excel, Numbers, or Google Sheets",
                  "Fill in each row with one event per row",
                  "Save as CSV and upload it here",
                ].map((s, i) => (
                  <p key={s} className="text-[12px] text-gray-500 leading-relaxed">
                    <span className="font-bold" style={{ color: AMBER }}>{i + 1}. </span>{s}
                  </p>
                ))}
              </div>
            </div>

            {/* Template columns */}
            <div>
              <p className="form-label">Template columns</p>
              <div className="rounded-2xl overflow-hidden border border-amber-100">
                {[
                  { col: "event_name", desc: "What you're calling this event", req: true },
                  { col: "day", desc: "Friday, Saturday, or Sunday", req: true },
                  { col: "start_time", desc: "HH:MM format e.g. 14:00", req: true },
                  { col: "end_time", desc: "HH:MM format e.g. 15:30", req: true },
                  { col: "description", desc: "Details campers will see", req: false },
                  { col: "type", desc: "performance / free_tasting / competition / workshop / special / promotion", req: true },
                  { col: "is_free", desc: "yes or no", req: true },
                  { col: "capacity", desc: "Max number of people (leave blank for unlimited)", req: false },
                ].map(({ col, desc, req }, i) => (
                  <div key={col} className={`flex items-start gap-3 px-4 py-2.5 ${i % 2 === 0 ? "bg-white" : "bg-amber-50/50"}`}>
                    <code className="text-[11px] font-bold text-amber-700 flex-shrink-0 w-28">{col}</code>
                    <div className="flex-1">
                      <p className="text-[12px] text-gray-600">{desc}</p>
                    </div>
                    {req && <span className="text-[10px] text-red-400 font-semibold flex-shrink-0">Required</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Download */}
            <button onClick={downloadTemplate}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-[14px] text-white transition-all"
              style={{ background: `linear-gradient(135deg, ${AMBER}, ${AMBER_DARK})`, boxShadow: "0 4px 16px rgba(217,119,6,0.3)" }}>
              <Download size={18} /> Download Template CSV
            </button>

            {/* Upload zone */}
            <div>
              <p className="form-label">Upload your completed template</p>
              {uploadedFile ? (
                <div className="rounded-2xl px-4 py-4 flex items-center gap-3"
                  style={{ background: "#f0fdf4", border: "2px solid #86efac" }}>
                  <span className="text-2xl">✅</span>
                  <div className="flex-1">
                    <p className="text-[13px] font-bold text-green-800">{uploadedFile.name}</p>
                    <p className="text-[12px] text-green-600">Ready to import</p>
                  </div>
                  <button onClick={() => setUploadedFile(null)}
                    className="w-7 h-7 rounded-full bg-green-200 flex items-center justify-center">
                    <X size={12} className="text-green-700" />
                  </button>
                </div>
              ) : (
                <label className="upload-zone flex flex-col items-center cursor-pointer text-center py-10">
                  <Upload size={28} style={{ color: AMBER }} className="mb-2" />
                  <p className="text-[13px] font-semibold text-gray-700">Drop your CSV here</p>
                  <p className="text-[12px] text-gray-400">or tap to browse</p>
                  <p className="text-[11px] text-amber-500 mt-1">.csv files only</p>
                  <input type="file" accept=".csv" className="sr-only"
                    onChange={e => e.target.files?.[0] && setUploadedFile(e.target.files[0])} />
                </label>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Save button */}
      <div className="fixed bottom-0 left-0 right-0 px-4 pb-8 pt-4"
        style={{ background: "rgba(255,251,235,0.96)", backdropFilter: "blur(16px)", borderTop: "1px solid #fde68a" }}>
        {mode === "form" ? (
          <button onClick={() => setSaved(true)} disabled={!valid}
            className="w-full flex items-center justify-center gap-2 font-bold py-4 px-6 rounded-2xl text-sm text-white transition-all disabled:opacity-40"
            style={{ background: `linear-gradient(135deg, ${AMBER}, ${AMBER_DARK})`, boxShadow: "0 4px 16px rgba(217,119,6,0.35)" }}>
            <Calendar size={17} /> Add to My Schedule
          </button>
        ) : (
          <button onClick={() => uploadedFile && setUploadDone(true)} disabled={!uploadedFile}
            className="w-full flex items-center justify-center gap-2 font-bold py-4 px-6 rounded-2xl text-sm text-white transition-all disabled:opacity-40"
            style={{ background: `linear-gradient(135deg, ${AMBER}, ${AMBER_DARK})`, boxShadow: "0 4px 16px rgba(217,119,6,0.35)" }}>
            <Upload size={17} /> Import Schedule
          </button>
        )}
      </div>
    </div>
  );
}
