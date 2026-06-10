"use client";
import Link from "next/link";
import { ChevronLeft, Plus, Calendar, Clock, ChevronRight, Flame } from "lucide-react";
import BottomNav from "@/components/ui/BottomNav";
import { DEMO_VENDOR_SCHEDULES, DEMO_VENDOR_PROFILE } from "@/lib/demo-data";

const AMBER = "#d97706";
const AMBER_DARK = "#b45309";
const AMBER_LIGHT = "#fffbeb";
const AMBER_BG = "#fef3c7";

const TYPE_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  performance:  { label: "Live Performance", color: "#7c3aed", bg: "#f5f3ff" },
  free_tasting: { label: "Free Tasting",     color: "#16a34a", bg: "#f0fdf4" },
  competition:  { label: "Competition",      color: "#dc2626", bg: "#fef2f2" },
  workshop:     { label: "Workshop",         color: "#0284c7", bg: "#f0f9ff" },
  special:      { label: "Special Event",   color: "#d97706", bg: "#fffbeb" },
  promotion:    { label: "Promotion",       color: "#db2777", bg: "#fdf4ff" },
};

const DAYS = ["Friday", "Saturday", "Sunday"] as const;

export default function VendorSchedulePage() {
  const vendor = DEMO_VENDOR_PROFILE;
  const events = DEMO_VENDOR_SCHEDULES.filter(e => e.vendor_id === "v3"); // The Green Bar

  return (
    <div className="page-container" style={{ background: AMBER_LIGHT }}>
      {/* Header */}
      <div className="page-header justify-between"
        style={{ background: "#fff", borderBottom: "1px solid #fde68a" }}>
        <div className="flex items-center gap-3">
          <Link href="/vendor-dashboard"
            className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
            <ChevronLeft size={18} style={{ color: AMBER }} />
          </Link>
          <div>
            <p className="font-bold text-[15px]">My Schedule</p>
            <p className="text-[11px] text-gray-400">{vendor.name}</p>
          </div>
        </div>
        <Link href="/vendor/schedule/new"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-[12px] text-white"
          style={{ background: `linear-gradient(135deg, ${AMBER}, ${AMBER_DARK})` }}>
          <Plus size={13} /> Add Event
        </Link>
      </div>

      <div className="px-4 pt-4 pb-32 space-y-5 animate-fade-in-up">

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Total events", value: events.length },
            { label: "Free events", value: events.filter(e => e.is_free).length },
            { label: "Trending 🔥", value: events.filter(e => e.is_hot).length },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-2xl p-3 text-center bg-white"
              style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
              <p className="font-bold text-[20px] text-gray-900">{value}</p>
              <p className="text-[10px] text-gray-400 font-medium">{label}</p>
            </div>
          ))}
        </div>

        {/* Events by day */}
        {DAYS.map(day => {
          const dayEvents = events.filter(e => e.day === day);
          if (dayEvents.length === 0) return null;
          return (
            <div key={day}>
              <div className="flex items-center gap-2 mb-3">
                <Calendar size={14} style={{ color: AMBER }} />
                <p className="section-title mb-0">{day}</p>
                <span className="text-[11px] text-gray-400">({dayEvents.length} event{dayEvents.length > 1 ? "s" : ""})</span>
              </div>
              <div className="space-y-2">
                {dayEvents
                  .sort((a, b) => a.start_time.localeCompare(b.start_time))
                  .map(event => {
                    const typeInfo = TYPE_LABELS[event.type] ?? { label: event.type, color: "#6b7280", bg: "#f9fafb" };
                    return (
                      <div key={event.id} className="card-hover flex items-start gap-3">
                        <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 text-xl"
                          style={{ background: AMBER_BG }}>{event.emoji}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p className="font-bold text-[13px] text-gray-900 leading-tight">{event.event_name}</p>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {event.is_hot && <Flame size={13} className="text-red-500" />}
                            </div>
                          </div>
                          <div className="flex items-center gap-3 mb-2">
                            <div className="flex items-center gap-1 text-[11px] text-gray-400">
                              <Clock size={10} />
                              {event.start_time} – {event.end_time}
                            </div>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                              style={{ background: typeInfo.bg, color: typeInfo.color }}>
                              {typeInfo.label}
                            </span>
                          </div>
                          <p className="text-[12px] text-gray-500 leading-relaxed line-clamp-2">{event.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${event.is_free ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                              {event.is_free ? "Free" : "Paid"}
                            </span>
                            {event.capacity && (
                              <span className="text-[10px] text-gray-400">Max {event.capacity} people</span>
                            )}
                          </div>
                        </div>
                        <ChevronRight size={14} className="text-gray-200 flex-shrink-0 mt-1" />
                      </div>
                    );
                  })}
              </div>
            </div>
          );
        })}

        {events.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="text-5xl mb-4">📅</div>
            <p className="font-bold text-[15px] text-gray-700 mb-1">No events yet</p>
            <p className="text-[13px] text-gray-400 max-w-xs mb-6">
              Add nano-events, tastings, performances and promotions to attract campers to your stall.
            </p>
            <Link href="/vendor/schedule/new"
              className="flex items-center gap-2 font-bold py-3.5 px-6 rounded-2xl text-sm text-white"
              style={{ background: `linear-gradient(135deg, ${AMBER}, ${AMBER_DARK})` }}>
              <Plus size={16} /> Add your first event
            </Link>
          </div>
        )}

        {/* Template download CTA */}
        <div className="rounded-2xl px-4 py-4 flex items-start gap-3"
          style={{ background: "#fff", border: "1px solid #fde68a" }}>
          <span className="text-2xl">📋</span>
          <div className="flex-1">
            <p className="text-[13px] font-bold text-gray-800 mb-0.5">Have a schedule already?</p>
            <p className="text-[12px] text-gray-500 leading-relaxed mb-3">
              Download our template, fill it in, and upload it to set up all your events at once.
            </p>
            <Link href="/vendor/schedule/new?mode=upload"
              className="inline-flex items-center gap-1.5 text-[12px] font-bold px-4 py-2 rounded-xl"
              style={{ background: AMBER_BG, color: AMBER_DARK }}>
              📥 Download & Upload Template
            </Link>
          </div>
        </div>

      </div>

      <BottomNav role="vendor" />
    </div>
  );
}
