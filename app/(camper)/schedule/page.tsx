"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Flame, Clock, MapPin, Calendar, Zap, ChevronLeft,
  Music, UtensilsCrossed, Beer, Star, Sparkles, Filter,
  type LucideIcon,
} from "lucide-react";
import BottomNav from "@/components/ui/BottomNav";
import { DEMO_VENDOR_SCHEDULES, type VendorScheduleEvent } from "@/lib/demo-data";

type Day = "All" | "Friday" | "Saturday" | "Sunday";
type TypeFilter = "all" | "performance" | "free_tasting" | "competition" | "workshop" | "special" | "promotion";

const DAY_TABS: Day[] = ["All", "Friday", "Saturday", "Sunday"];

const TYPE_CONFIG: Record<string, { label: string; emoji: string; color: string; bg: string; gradient: string }> = {
  performance:  { label: "Live",         emoji: "🎤", color: "#7c3aed", bg: "#f5f3ff", gradient: "linear-gradient(135deg,#7c3aed,#6d28d9)" },
  free_tasting: { label: "Free",         emoji: "🥤", color: "#16a34a", bg: "#f0fdf4", gradient: "linear-gradient(135deg,#16a34a,#15803d)" },
  competition:  { label: "Challenge",    emoji: "🏆", color: "#dc2626", bg: "#fef2f2", gradient: "linear-gradient(135deg,#dc2626,#b91c1c)" },
  workshop:     { label: "Workshop",     emoji: "👩‍🍳", color: "#0284c7", bg: "#f0f9ff", gradient: "linear-gradient(135deg,#0284c7,#0369a1)" },
  special:      { label: "Special",      emoji: "⭐", color: "#d97706", bg: "#fffbeb", gradient: "linear-gradient(135deg,#d97706,#b45309)" },
  promotion:    { label: "Promo",        emoji: "🏷️", color: "#db2777", bg: "#fdf4ff", gradient: "linear-gradient(135deg,#db2777,#be185d)" },
};

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  food: UtensilsCrossed,
  bar: Beer,
  music: Music,
};

function timeToMins(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function fmt12(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "pm" : "am";
  const h12 = h % 12 || 12;
  return m === 0 ? `${h12}${ampm}` : `${h12}:${m.toString().padStart(2, "0")}${ampm}`;
}

// Roughly simulate "now" as Friday 11:30am for demo
const NOW_DAY = "Friday";
const NOW_MINS = 11 * 60 + 30;

function isHappeningNow(e: VendorScheduleEvent): boolean {
  return e.day === NOW_DAY && timeToMins(e.start_time) <= NOW_MINS && NOW_MINS < timeToMins(e.end_time);
}

function isUpcomingToday(e: VendorScheduleEvent): boolean {
  return e.day === NOW_DAY && timeToMins(e.start_time) > NOW_MINS;
}

export default function CamperSchedulePage() {
  const [activeDay, setActiveDay] = useState<Day>("All");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const events = DEMO_VENDOR_SCHEDULES;

  const filtered = useMemo(() => {
    return events
      .filter(e => activeDay === "All" || e.day === activeDay)
      .filter(e => typeFilter === "all" || e.type === typeFilter)
      .sort((a, b) => {
        const dayOrder = ["Friday", "Saturday", "Sunday"];
        const dDiff = dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
        if (dDiff !== 0) return dDiff;
        return timeToMins(a.start_time) - timeToMins(b.start_time);
      });
  }, [events, activeDay, typeFilter]);

  const happeningNow = events.filter(isHappeningNow);
  const upcomingToday = events.filter(isUpcomingToday).slice(0, 3);
  const trending = events.filter(e => e.is_hot);

  return (
    <div className="page-container" style={{ background: "#0f0f1a" }}>
      {/* Header — dark glassmorphism */}
      <div className="sticky top-0 z-30 px-4 pt-safe"
        style={{ background: "rgba(15,15,26,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard"
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.1)" }}>
              <ChevronLeft size={18} className="text-white" />
            </Link>
            <div>
              <h1 className="font-bold text-[17px] text-white">What's On</h1>
              <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.45)" }}>
                {events.length} events across the weekend
              </p>
            </div>
          </div>
          <button onClick={() => setShowFilters(s => !s)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold transition-all"
            style={{
              background: showFilters ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.7)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}>
            <Filter size={12} /> Filter
          </button>
        </div>

        {/* Day tabs */}
        <div className="flex gap-2 pb-4 overflow-x-auto scrollbar-hide">
          {DAY_TABS.map(day => (
            <button key={day} onClick={() => setActiveDay(day)}
              className="flex-shrink-0 px-4 py-2 rounded-xl text-[12px] font-semibold transition-all"
              style={{
                background: activeDay === day ? "#fff" : "rgba(255,255,255,0.08)",
                color: activeDay === day ? "#0f0f1a" : "rgba(255,255,255,0.5)",
              }}>
              {day === "Friday" ? "🎉 Fri" : day === "Saturday" ? "🌟 Sat" : day === "Sunday" ? "🌅 Sun" : "🗓 All"}
            </button>
          ))}
        </div>

        {/* Type filter pills */}
        {showFilters && (
          <div className="flex gap-2 pb-4 overflow-x-auto scrollbar-hide animate-fade-in">
            <button key="all"
              onClick={() => setTypeFilter("all")}
              className="flex-shrink-0 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all"
              style={{
                background: typeFilter === "all" ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.06)",
                color: typeFilter === "all" ? "#fff" : "rgba(255,255,255,0.4)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}>
              All types
            </button>
            {Object.entries(TYPE_CONFIG).map(([id, cfg]) => (
              <button key={id}
                onClick={() => setTypeFilter(id as TypeFilter)}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all"
                style={{
                  background: typeFilter === id ? cfg.gradient : "rgba(255,255,255,0.06)",
                  color: typeFilter === id ? "#fff" : "rgba(255,255,255,0.4)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}>
                {cfg.emoji} {cfg.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="px-4 pb-32 space-y-6 pt-5">

        {/* ── Happening NOW ── */}
        {happeningNow.length > 0 && activeDay === "All" && typeFilter === "all" && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-red-500" style={{ animation: "pulseGlow 1.5s ease infinite" }} />
              <p className="text-[13px] font-bold text-white uppercase tracking-wider">Happening Now</p>
            </div>
            <div className="space-y-3">
              {happeningNow.map(event => (
                <NowCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        )}

        {/* ── Trending ── */}
        {trending.length > 0 && activeDay === "All" && typeFilter === "all" && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Flame size={14} className="text-orange-400" />
              <p className="text-[13px] font-bold text-white uppercase tracking-wider">Trending This Weekend</p>
            </div>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
              {trending.map(event => (
                <TrendingCard key={event.id} event={event}
                  expanded={expandedId === event.id}
                  onToggle={() => setExpandedId(id => id === event.id ? null : event.id)} />
              ))}
            </div>
          </div>
        )}

        {/* ── Coming up today ── */}
        {upcomingToday.length > 0 && activeDay === "All" && typeFilter === "all" && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock size={13} className="text-blue-400" />
              <p className="text-[13px] font-bold text-white uppercase tracking-wider">Coming Up Today</p>
            </div>
            <div className="space-y-2">
              {upcomingToday.map(event => (
                <EventRow key={event.id} event={event}
                  expanded={expandedId === event.id}
                  onToggle={() => setExpandedId(id => id === event.id ? null : event.id)} />
              ))}
            </div>
          </div>
        )}

        {/* ── All events (filtered) ── */}
        {(activeDay !== "All" || typeFilter !== "all") && (
          <div>
            <p className="text-[13px] font-bold text-white uppercase tracking-wider mb-3">
              {filtered.length} event{filtered.length !== 1 ? "s" : ""}{activeDay !== "All" ? ` · ${activeDay}` : ""}
            </p>
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-4xl mb-3">🔍</p>
                <p className="text-[14px] font-semibold text-white/70">No events match this filter</p>
                <button onClick={() => { setTypeFilter("all"); setActiveDay("All"); }}
                  className="mt-4 text-[12px] font-semibold text-white/40 underline">
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {filtered.map(event => (
                  <EventRow key={event.id} event={event}
                    expanded={expandedId === event.id}
                    onToggle={() => setExpandedId(id => id === event.id ? null : event.id)} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Full schedule (default view) ── */}
        {activeDay === "All" && typeFilter === "all" && (
          <>
            {(["Friday", "Saturday", "Sunday"] as const).map(day => {
              const dayEvents = events
                .filter(e => e.day === day)
                .sort((a, b) => timeToMins(a.start_time) - timeToMins(b.start_time));
              return (
                <div key={day}>
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar size={13} style={{ color: "rgba(255,255,255,0.4)" }} />
                    <p className="text-[13px] font-bold text-white/60 uppercase tracking-wider">{day}</p>
                    <div className="flex-1 h-px bg-white/10" />
                  </div>
                  <div className="space-y-2">
                    {dayEvents.map(event => (
                      <EventRow key={event.id} event={event}
                        expanded={expandedId === event.id}
                        onToggle={() => setExpandedId(id => id === event.id ? null : event.id)} />
                    ))}
                  </div>
                </div>
              );
            })}
          </>
        )}

      </div>

      <BottomNav role="camper" />
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function NowCard({ event }: { event: VendorScheduleEvent }) {
  const cfg = TYPE_CONFIG[event.type] ?? TYPE_CONFIG.special;
  return (
    <div className="rounded-3xl p-5 relative overflow-hidden"
      style={{ background: cfg.gradient, boxShadow: `0 4px 24px ${cfg.color}40` }}>
      <div className="absolute right-4 top-4 text-5xl opacity-15 leading-none">{event.emoji}</div>
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <span className="flex items-center gap-1 text-[10px] font-bold text-white/80 uppercase tracking-wider">
            <div className="w-1.5 h-1.5 rounded-full bg-white" style={{ animation: "pulseGlow 1.5s ease infinite" }} />
            Now · {fmt12(event.start_time)}–{fmt12(event.end_time)}
          </span>
        </div>
        <p className="text-white font-bold text-[17px] mb-1 leading-tight">{event.event_name}</p>
        <p className="text-white/70 text-[12px] mb-3">{event.vendor_name}</p>
        <div className="flex items-center gap-2">
          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${event.is_free ? "bg-white/20 text-white" : "bg-black/20 text-white/80"}`}>
            {event.is_free ? "Free entry" : "Paid entry"}
          </span>
          {event.capacity && (
            <span className="text-[11px] text-white/60">Max {event.capacity} people</span>
          )}
        </div>
      </div>
    </div>
  );
}

function TrendingCard({ event, expanded, onToggle }: {
  event: VendorScheduleEvent;
  expanded: boolean;
  onToggle: () => void;
}) {
  const cfg = TYPE_CONFIG[event.type] ?? TYPE_CONFIG.special;
  return (
    <button onClick={onToggle}
      className="flex-shrink-0 rounded-3xl p-4 text-left transition-all w-[200px] relative overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.06)",
        border: expanded ? `1px solid ${cfg.color}60` : "1px solid rgba(255,255,255,0.08)",
        boxShadow: expanded ? `0 0 20px ${cfg.color}25` : "none",
      }}>
      <div className="text-3xl mb-3">{event.emoji}</div>
      <div className="flex items-center gap-1.5 mb-1">
        <Flame size={11} className="text-red-400" />
        <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider">Trending</span>
      </div>
      <p className="text-[13px] font-bold text-white leading-tight mb-1">{event.event_name}</p>
      <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.45)" }}>{event.vendor_name}</p>
      <div className="flex items-center gap-1.5 mt-2">
        <Clock size={9} style={{ color: "rgba(255,255,255,0.3)" }} />
        <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>
          {event.day} · {fmt12(event.start_time)}
        </span>
      </div>
      {expanded && (
        <div className="mt-3 pt-3 border-t border-white/10 animate-fade-in">
          <p className="text-[11px] leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>
            {event.description}
          </p>
          {event.capacity && (
            <p className="text-[10px] text-white/30 mt-1.5">Max {event.capacity} people</p>
          )}
        </div>
      )}
    </button>
  );
}

function EventRow({ event, expanded, onToggle }: {
  event: VendorScheduleEvent;
  expanded: boolean;
  onToggle: () => void;
}) {
  const cfg = TYPE_CONFIG[event.type] ?? TYPE_CONFIG.special;
  const CatIcon = CATEGORY_ICONS[event.vendor_category] ?? Sparkles;

  return (
    <button onClick={onToggle}
      className="w-full text-left rounded-2xl p-4 transition-all"
      style={{
        background: expanded ? "rgba(255,255,255,0.09)" : "rgba(255,255,255,0.05)",
        border: expanded ? `1px solid ${cfg.color}40` : "1px solid rgba(255,255,255,0.06)",
      }}>
      <div className="flex items-start gap-3">
        {/* Time column */}
        <div className="flex-shrink-0 w-14 text-right">
          <p className="text-[12px] font-bold text-white">{fmt12(event.start_time)}</p>
          <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>{fmt12(event.end_time)}</p>
        </div>

        {/* Emoji */}
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
          style={{ background: "rgba(255,255,255,0.07)" }}>
          {event.emoji}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="font-bold text-[13px] text-white leading-tight">{event.event_name}</p>
            <div className="flex items-center gap-1 flex-shrink-0">
              {event.is_hot && <Flame size={12} className="text-orange-400" />}
              <Star size={11} style={{ color: "rgba(255,255,255,0.15)" }} />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <div className="flex items-center gap-1 opacity-40">
              <CatIcon size={10} className="text-white" />
              <p className="text-[11px] text-white">{event.vendor_name}</p>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{ background: cfg.bg + "25", color: cfg.color + "cc" }}>
              {cfg.label}
            </span>
            {event.is_free && (
              <span className="text-[10px] font-bold text-green-400">Free</span>
            )}
          </div>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="mt-3 pt-3 border-t border-white/08 animate-fade-in">
          <p className="text-[12px] leading-relaxed mb-3" style={{ color: "rgba(255,255,255,0.6)" }}>
            {event.description}
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            {event.capacity && (
              <span className="flex items-center gap-1 text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>
                <Zap size={10} /> Max {event.capacity} people
              </span>
            )}
            <Link href="/map"
              onClick={e => e.stopPropagation()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold text-white"
              style={{ background: cfg.gradient }}>
              <MapPin size={10} /> Get directions
            </Link>
          </div>
        </div>
      )}
    </button>
  );
}
