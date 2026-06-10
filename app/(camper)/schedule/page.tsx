"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Flame, Clock, MapPin, Calendar, ChevronLeft,
  Music, UtensilsCrossed, Beer, Sparkles, Filter,
  Users, ChevronDown, ChevronUp, Navigation,
  type LucideIcon,
} from "lucide-react";
import BottomNav from "@/components/ui/BottomNav";
import { DEMO_VENDOR_SCHEDULES, type VendorScheduleEvent } from "@/lib/demo-data";

type Day = "All" | "Friday" | "Saturday" | "Sunday";
type TypeFilter = "all" | "performance" | "free_tasting" | "competition" | "workshop" | "special" | "promotion";

const DAY_TABS: Day[] = ["All", "Friday", "Saturday", "Sunday"];

const TYPE_CONFIG: Record<string, { label: string; emoji: string; color: string; bg: string }> = {
  performance:  { label: "Live",      emoji: "🎤", color: "#7c3aed", bg: "#f5f3ff" },
  free_tasting: { label: "Free",      emoji: "🥤", color: "#16a34a", bg: "#f0fdf4" },
  competition:  { label: "Challenge", emoji: "🏆", color: "#dc2626", bg: "#fef2f2" },
  workshop:     { label: "Workshop",  emoji: "👩‍🍳", color: "#0284c7", bg: "#f0f9ff" },
  special:      { label: "Special",   emoji: "⭐", color: "#d97706", bg: "#fffbeb" },
  promotion:    { label: "Promo",     emoji: "🏷️", color: "#db2777", bg: "#fdf4ff" },
};

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  food: UtensilsCrossed,
  bar: Beer,
  music: Music,
};

// Base "going" counts for demo — drives the Trending sort
const BASE_GOING: Record<string, number> = {
  "sch-1": 23, "sch-2": 47, "sch-3": 12,
  "sch-4": 89, "sch-5": 76, "sch-6": 18,
  "sch-7": 94, "sch-8": 31, "sch-9": 22, "sch-10": 58,
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

// Demo: simulate "now" as Friday 10:30am so the free smoothie tasting is live
const NOW_DAY = "Friday";
const NOW_MINS = 10 * 60 + 30;

function isHappeningNow(e: VendorScheduleEvent): boolean {
  return e.day === NOW_DAY && timeToMins(e.start_time) <= NOW_MINS && NOW_MINS < timeToMins(e.end_time);
}

function isUpcomingToday(e: VendorScheduleEvent): boolean {
  return e.day === NOW_DAY && timeToMins(e.start_time) > NOW_MINS;
}

const GREEN = "#16a34a";
const GREEN_DARK = "#15803d";

export default function CamperSchedulePage() {
  const [activeDay, setActiveDay] = useState<Day>("All");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  // Set of event IDs the user has marked "going"
  const [goingIds, setGoingIds] = useState<Set<string>>(new Set());

  const events = DEMO_VENDOR_SCHEDULES;

  // Compute total going count for any event (base + user's own toggle)
  const goingCount = (id: string) => (BASE_GOING[id] ?? 0) + (goingIds.has(id) ? 1 : 0);

  const toggleGoing = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setGoingIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

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

  // Trending = top 5 events by going count (includes user's own votes)
  const trending = useMemo(() => {
    return [...events]
      .sort((a, b) => goingCount(b.id) - goingCount(a.id))
      .slice(0, 5);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events, goingIds]);

  const happeningNow = events.filter(isHappeningNow);
  const upcomingToday = events.filter(isUpcomingToday).slice(0, 4);

  return (
    <div className="page-container" style={{ background: "#f7f8fa" }}>

      {/* ── Header ── */}
      <div className="sticky top-0 z-30 bg-white"
        style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard"
              className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center">
              <ChevronLeft size={18} className="text-gray-600" />
            </Link>
            <div>
              <h1 className="font-bold text-[17px] text-gray-900">What's On</h1>
              <p className="text-[11px] text-gray-400">
                {events.length} events across the weekend
              </p>
            </div>
          </div>
          <button onClick={() => setShowFilters(s => !s)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold transition-all"
            style={{
              background: showFilters ? `${GREEN}15` : "#f3f4f6",
              color: showFilters ? GREEN : "#6b7280",
              border: showFilters ? `1px solid ${GREEN}30` : "1px solid transparent",
            }}>
            <Filter size={12} /> Filter
          </button>
        </div>

        {/* Day tabs */}
        <div className="flex gap-2 px-4 pb-4 overflow-x-auto scrollbar-hide">
          {DAY_TABS.map(day => (
            <button key={day} onClick={() => setActiveDay(day)}
              className="flex-shrink-0 px-4 py-2 rounded-xl text-[12px] font-semibold transition-all"
              style={{
                background: activeDay === day ? GREEN : "#f3f4f6",
                color: activeDay === day ? "#fff" : "#6b7280",
              }}>
              {day === "Friday" ? "🎉 Fri" : day === "Saturday" ? "🌟 Sat" : day === "Sunday" ? "🌅 Sun" : "🗓 All"}
            </button>
          ))}
        </div>

        {/* Type filter pills */}
        {showFilters && (
          <div className="flex gap-2 px-4 pb-4 overflow-x-auto scrollbar-hide animate-fade-in">
            <button onClick={() => setTypeFilter("all")}
              className="flex-shrink-0 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all"
              style={{
                background: typeFilter === "all" ? GREEN : "#f3f4f6",
                color: typeFilter === "all" ? "#fff" : "#6b7280",
              }}>
              All types
            </button>
            {Object.entries(TYPE_CONFIG).map(([id, cfg]) => (
              <button key={id} onClick={() => setTypeFilter(id as TypeFilter)}
                className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all"
                style={{
                  background: typeFilter === id ? cfg.color : "#f3f4f6",
                  color: typeFilter === id ? "#fff" : "#6b7280",
                }}>
                {cfg.emoji} {cfg.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="px-4 pb-32 space-y-6 pt-5 animate-fade-in-up">

        {/* ── Happening NOW ── */}
        {happeningNow.length > 0 && activeDay === "All" && typeFilter === "all" && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0"
                style={{ animation: "pulseGlow 1.5s ease infinite" }} />
              <p className="section-title mb-0 text-gray-900">Happening Now</p>
            </div>
            <div className="space-y-3">
              {happeningNow.map(event => (
                <NowCard key={event.id} event={event}
                  going={goingIds.has(event.id)}
                  count={goingCount(event.id)}
                  onToggleGoing={(e) => toggleGoing(event.id, e)} />
              ))}
            </div>
          </div>
        )}

        {/* ── Trending ── */}
        {activeDay === "All" && typeFilter === "all" && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Flame size={14} className="text-orange-500" />
              <p className="section-title mb-0 text-gray-900">Trending</p>
              <span className="text-[11px] text-gray-400 font-normal">— most people going</span>
            </div>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4">
              {trending.map(event => (
                <TrendingCard key={event.id} event={event}
                  going={goingIds.has(event.id)}
                  count={goingCount(event.id)}
                  onToggleGoing={(e) => toggleGoing(event.id, e)} />
              ))}
            </div>
          </div>
        )}

        {/* ── Coming up today ── */}
        {upcomingToday.length > 0 && activeDay === "All" && typeFilter === "all" && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock size={13} className="text-blue-500" />
              <p className="section-title mb-0 text-gray-900">Coming Up Today</p>
            </div>
            <div className="space-y-2.5">
              {upcomingToday.map(event => (
                <EventCard key={event.id} event={event}
                  going={goingIds.has(event.id)}
                  count={goingCount(event.id)}
                  expanded={expandedId === event.id}
                  onToggleExpand={() => setExpandedId(id => id === event.id ? null : event.id)}
                  onToggleGoing={(e) => toggleGoing(event.id, e)} />
              ))}
            </div>
          </div>
        )}

        {/* ── Filtered view ── */}
        {(activeDay !== "All" || typeFilter !== "all") && (
          <div>
            <p className="section-title mb-3 text-gray-900">
              {filtered.length} event{filtered.length !== 1 ? "s" : ""}
              {activeDay !== "All" ? ` · ${activeDay}` : ""}
            </p>
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-4xl mb-3">🔍</p>
                <p className="text-[14px] font-semibold text-gray-700">No events match this filter</p>
                <button onClick={() => { setTypeFilter("all"); setActiveDay("All"); }}
                  className="mt-4 text-[13px] font-semibold underline" style={{ color: GREEN }}>
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filtered.map(event => (
                  <EventCard key={event.id} event={event}
                    going={goingIds.has(event.id)}
                    count={goingCount(event.id)}
                    expanded={expandedId === event.id}
                    onToggleExpand={() => setExpandedId(id => id === event.id ? null : event.id)}
                    onToggleGoing={(e) => toggleGoing(event.id, e)} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Full schedule by day ── */}
        {activeDay === "All" && typeFilter === "all" && (
          <>
            {(["Friday", "Saturday", "Sunday"] as const).map(day => {
              const dayEvents = events
                .filter(e => e.day === day)
                .sort((a, b) => timeToMins(a.start_time) - timeToMins(b.start_time));
              return (
                <div key={day}>
                  <div className="flex items-center gap-3 mb-3">
                    <Calendar size={13} className="text-gray-400" />
                    <p className="section-title mb-0 text-gray-900">{day}</p>
                    <div className="flex-1 h-px bg-gray-200" />
                    <p className="text-[11px] text-gray-400">{dayEvents.length} events</p>
                  </div>
                  <div className="space-y-2.5">
                    {dayEvents.map(event => (
                      <EventCard key={event.id} event={event}
                        going={goingIds.has(event.id)}
                        count={goingCount(event.id)}
                        expanded={expandedId === event.id}
                        onToggleExpand={() => setExpandedId(id => id === event.id ? null : event.id)}
                        onToggleGoing={(e) => toggleGoing(event.id, e)} />
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

interface EventCardProps {
  event: VendorScheduleEvent;
  going: boolean;
  count: number;
  expanded: boolean;
  onToggleExpand: () => void;
  onToggleGoing: (e: React.MouseEvent) => void;
}

/** Full-width event card used in schedule lists */
function EventCard({ event, going, count, expanded, onToggleExpand, onToggleGoing }: EventCardProps) {
  const cfg = TYPE_CONFIG[event.type] ?? TYPE_CONFIG.special;
  const CatIcon = CATEGORY_ICONS[event.vendor_category] ?? Sparkles;

  return (
    <div className="bg-white rounded-2xl overflow-hidden transition-all"
      style={{ boxShadow: expanded ? "0 4px 20px rgba(0,0,0,0.08)" : "0 1px 6px rgba(0,0,0,0.05)" }}>

      {/* Card header — tap to expand */}
      <button onClick={onToggleExpand} className="w-full text-left p-4">
        <div className="flex items-start gap-3">
          {/* Time */}
          <div className="flex-shrink-0 w-12 pt-0.5">
            <p className="text-[12px] font-bold text-gray-900">{fmt12(event.start_time)}</p>
            <p className="text-[10px] text-gray-400">{fmt12(event.end_time)}</p>
          </div>

          {/* Emoji badge */}
          <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
            style={{ background: cfg.bg }}>
            {event.emoji}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="font-bold text-[13px] text-gray-900 leading-tight mb-1">{event.event_name}</p>
            <div className="flex items-center gap-1.5 flex-wrap">
              <div className="flex items-center gap-1">
                <CatIcon size={10} className="text-gray-400" />
                <p className="text-[11px] text-gray-400">{event.vendor_name}</p>
              </div>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                style={{ background: cfg.bg, color: cfg.color }}>
                {cfg.label}
              </span>
              {event.is_free && (
                <span className="text-[10px] font-bold text-green-600">Free</span>
              )}
            </div>
          </div>

          {/* Expand chevron + going count */}
          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
            <div className="flex items-center gap-1 text-gray-400">
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </div>
            <div className="flex items-center gap-1">
              <Users size={10} className="text-gray-400" />
              <span className="text-[11px] text-gray-500 font-semibold">{count}</span>
            </div>
          </div>
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-4 pb-4 animate-fade-in border-t border-gray-50">
          <p className="text-[13px] text-gray-600 leading-relaxed mt-3 mb-4">
            {event.description}
          </p>
          {event.capacity && (
            <div className="flex items-center gap-1.5 mb-4">
              <Users size={12} className="text-gray-400" />
              <p className="text-[12px] text-gray-500">Max {event.capacity} people · {count} going</p>
            </div>
          )}
          <div className="flex items-center gap-2">
            {/* I'm going button */}
            <button onClick={onToggleGoing}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-[13px] transition-all active:scale-95"
              style={going ? {
                background: `linear-gradient(135deg, ${GREEN}, ${GREEN_DARK})`,
                color: "#fff",
                boxShadow: `0 3px 12px rgba(22,163,74,0.3)`,
              } : {
                background: "#f3f4f6",
                color: "#374151",
              }}>
              {going ? "✓ I'm going!" : "🙌 I'm going"}
            </button>
            {/* Navigate */}
            <Link href="/map"
              onClick={e => e.stopPropagation()}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-[13px] text-white transition-all active:scale-95 flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #0284c7, #0369a1)" }}>
              <Navigation size={13} /> Navigate
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

/** "Happening Now" hero card */
function NowCard({ event, going, count, onToggleGoing }: {
  event: VendorScheduleEvent;
  going: boolean;
  count: number;
  onToggleGoing: (e: React.MouseEvent) => void;
}) {
  return (
    <div className="rounded-3xl overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${GREEN}, ${GREEN_DARK})`, boxShadow: `0 4px 20px rgba(22,163,74,0.3)` }}>
      <div className="p-5 relative">
        <div className="absolute right-4 top-4 text-5xl opacity-10 leading-none">{event.emoji}</div>

        <div className="flex items-center gap-2 mb-2">
          <div className="w-1.5 h-1.5 rounded-full bg-white flex-shrink-0"
            style={{ animation: "pulseGlow 1.5s ease infinite" }} />
          <span className="text-[10px] font-bold text-white/80 uppercase tracking-wider">
            Live now · {fmt12(event.start_time)}–{fmt12(event.end_time)}
          </span>
        </div>

        <p className="text-white font-bold text-[18px] leading-tight mb-0.5">{event.event_name}</p>
        <p className="text-white/70 text-[12px] mb-1">{event.vendor_name}</p>

        <div className="flex items-center gap-2 mb-4">
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/20 text-white">
            {event.is_free ? "Free entry" : "Paid"}
          </span>
          {event.capacity && (
            <span className="text-[11px] text-white/60">Max {event.capacity} people</span>
          )}
          <span className="flex items-center gap-1 text-[11px] text-white/70">
            <Users size={10} /> {count} going
          </span>
        </div>

        <div className="flex gap-2">
          <button onClick={onToggleGoing}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-[13px] transition-all active:scale-95"
            style={going ? {
              background: "#fff",
              color: GREEN_DARK,
            } : {
              background: "rgba(255,255,255,0.2)",
              color: "#fff",
            }}>
            {going ? "✓ I'm going!" : "🙌 I'm going"}
          </button>
          <Link href="/map"
            onClick={e => e.stopPropagation()}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-[13px] flex-shrink-0"
            style={{ background: "rgba(255,255,255,0.15)", color: "#fff" }}>
            <Navigation size={13} /> Navigate
          </Link>
        </div>
      </div>
    </div>
  );
}

/** Horizontal trending card */
function TrendingCard({ event, going, count, onToggleGoing }: {
  event: VendorScheduleEvent;
  going: boolean;
  count: number;
  onToggleGoing: (e: React.MouseEvent) => void;
}) {
  const cfg = TYPE_CONFIG[event.type] ?? TYPE_CONFIG.special;

  return (
    <div className="flex-shrink-0 w-[180px] bg-white rounded-2xl p-4 flex flex-col gap-2"
      style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.07)", border: "1px solid rgba(0,0,0,0.04)" }}>

      <div className="text-3xl">{event.emoji}</div>

      <div>
        <p className="font-bold text-[13px] text-gray-900 leading-tight">{event.event_name}</p>
        <p className="text-[11px] text-gray-400 mt-0.5">{event.vendor_name}</p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Clock size={10} className="text-gray-400" />
          <p className="text-[10px] text-gray-400">{event.day.slice(0, 3)} · {fmt12(event.start_time)}</p>
        </div>
        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
          style={{ background: cfg.bg, color: cfg.color }}>
          {cfg.label}
        </span>
      </div>

      {/* Going count + button */}
      <div className="flex items-center gap-1.5 mt-auto pt-1 border-t border-gray-50">
        <div className="flex items-center gap-1 flex-1">
          <Users size={11} className="text-gray-400" />
          <span className="text-[12px] font-bold text-gray-700">{count}</span>
          <span className="text-[11px] text-gray-400">going</span>
        </div>
        <button onClick={onToggleGoing}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all active:scale-95"
          style={going ? {
            background: GREEN,
            color: "#fff",
          } : {
            background: "#f3f4f6",
            color: "#374151",
          }}>
          {going ? "✓ Going" : "🙌 Going?"}
        </button>
      </div>

      <Link href="/map"
        onClick={e => e.stopPropagation()}
        className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-bold text-white transition-all"
        style={{ background: `linear-gradient(135deg, ${GREEN}, ${GREEN_DARK})` }}>
        <Navigation size={11} /> Navigate there
      </Link>
    </div>
  );
}
