"use client";
import Link from "next/link";
import {
  Store, MapPin, Calendar, Star, ChevronRight,
  CheckCircle, AlertCircle, Clock, Zap, TrendingUp,
} from "lucide-react";
import BottomNav from "@/components/ui/BottomNav";
import { DEMO_MODE, DEMO_VENDOR_PROFILE, DEMO_VENDOR_SCHEDULES } from "@/lib/demo-data";

const AMBER = "#d97706";
const AMBER_DARK = "#b45309";
const AMBER_LIGHT = "#fffbeb";
const AMBER_BG = "#fef3c7";

function getTimeGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default function VendorDashboardPage() {
  const vendor = DEMO_MODE ? DEMO_VENDOR_PROFILE : null;
  if (!vendor) return null;

  const mySchedule = DEMO_VENDOR_SCHEDULES.filter(e => e.vendor_id === vendor.poi_id || e.poi_id === vendor.poi_id);
  const todaySchedule = mySchedule.filter(e => e.day === "Friday").slice(0, 2);

  return (
    <div className="page-container" style={{ background: AMBER_LIGHT }}>
      {/* Header */}
      <div className="page-header justify-between"
        style={{ background: "#fff", borderBottom: "1px solid #fde68a" }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${AMBER}, ${AMBER_DARK})` }}>
            <Store size={18} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-[15px]">{vendor.name}</p>
            <p className="text-[11px] text-gray-400">Vendor Dashboard</p>
          </div>
        </div>
        <Link href="/vendor-signup"
          className="text-[12px] font-semibold px-3 py-1.5 rounded-xl"
          style={{ background: AMBER_BG, color: AMBER_DARK }}>
          Profile
        </Link>
      </div>

      <div className="px-4 pt-4 pb-32 space-y-4 animate-fade-in-up">

        {/* Greeting */}
        <div>
          <h1 className="text-[22px] font-bold text-gray-900 leading-tight">
            {getTimeGreeting()}, {vendor.contact_name.split(" ")[0]} 👋
          </h1>
          <p className="text-[13px] text-gray-500 mt-0.5">In It Together 2027 · Margam Park</p>
        </div>

        {/* Pin status card */}
        <div className="rounded-3xl p-5 relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${AMBER}, ${AMBER_DARK})`, boxShadow: `0 4px 20px rgba(217,119,6,0.3)` }}>
          <div className="absolute right-4 top-4 opacity-10 text-8xl leading-none">📍</div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              {vendor.pin_confirmed
                ? <CheckCircle size={15} className="text-white/80" />
                : <AlertCircle size={15} className="text-white/80" />}
              <span className="text-white/70 text-[12px] font-medium">
                {vendor.pin_confirmed ? "Spot pinned on map" : "Spot not pinned yet"}
              </span>
            </div>
            <p className="text-white font-bold text-[16px] mb-1">
              {vendor.pin_confirmed ? "Campers can find you!" : "Pin your spot now"}
            </p>
            <p className="text-white/70 text-[12px] leading-relaxed mb-4">
              {vendor.pin_confirmed
                ? vendor.pin_description
                : "Let campers navigate directly to your stall. It takes 30 seconds."}
            </p>
            <Link href="/vendor/pin"
              className="inline-flex items-center gap-2 bg-white font-bold text-[13px] px-4 py-2.5 rounded-xl"
              style={{ color: AMBER_DARK }}>
              <MapPin size={14} />
              {vendor.pin_confirmed ? "Update Pin" : "Pin My Spot"}
            </Link>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Events", value: mySchedule.length, icon: Calendar, color: "#7c3aed" },
            { label: "Trending", value: mySchedule.filter(e => e.is_hot).length, icon: TrendingUp, color: "#dc2626" },
            { label: "Rating", value: "4.9 ⭐", icon: Star, color: "#16a34a", isString: true },
          ].map(({ label, value, icon: Icon, color, isString }) => (
            <div key={label} className="rounded-2xl p-3 text-center bg-white"
              style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center mx-auto mb-1.5"
                style={{ background: `${color}15` }}>
                <Icon size={15} style={{ color }} />
              </div>
              <p className="font-bold text-[16px] text-gray-900">
                {isString ? value : value}
              </p>
              <p className="text-[10px] text-gray-400 font-medium">{label}</p>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div>
          <p className="section-title">Quick actions</p>
          <div className="space-y-2">
            {[
              {
                href: "/vendor/schedule/new",
                icon: Calendar,
                label: "Add to my schedule",
                sub: "Create a new nano-event or promotion",
                badge: "New",
                badgeColor: "#7c3aed",
              },
              {
                href: "/vendor/schedule",
                icon: Clock,
                label: "View my schedule",
                sub: `${mySchedule.length} events across 3 days`,
                badge: null,
                badgeColor: null,
              },
              {
                href: "/vendor/pin",
                icon: MapPin,
                label: "Update my pin",
                sub: vendor.pin_confirmed ? "Fine-tune your spot on the map" : "Pin your spot — takes 30 seconds",
                badge: vendor.pin_confirmed ? null : "Required",
                badgeColor: "#dc2626",
              },
            ].map(({ href, icon: Icon, label, sub, badge, badgeColor }) => (
              <Link key={href} href={href}
                className="card-hover flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: AMBER_BG }}>
                  <Icon size={18} style={{ color: AMBER }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-[13px] text-gray-900">{label}</p>
                    {badge && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                        style={{ background: badgeColor! }}>{badge}</span>
                    )}
                  </div>
                  <p className="text-[12px] text-gray-400 truncate">{sub}</p>
                </div>
                <ChevronRight size={15} className="text-gray-300 flex-shrink-0" />
              </Link>
            ))}
          </div>
        </div>

        {/* Today's schedule */}
        {todaySchedule.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="section-title mb-0">Today's events</p>
              <Link href="/vendor/schedule"
                className="text-[12px] font-semibold" style={{ color: AMBER }}>See all</Link>
            </div>
            <div className="space-y-2">
              {todaySchedule.map(event => (
                <div key={event.id} className="card flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 text-xl"
                    style={{ background: AMBER_BG }}>{event.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[13px] text-gray-900">{event.event_name}</p>
                    <p className="text-[12px] text-gray-400">{event.start_time} – {event.end_time}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {event.is_hot && <span className="text-[10px] font-bold text-red-500">🔥 Hot</span>}
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${event.is_free ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                      {event.is_free ? "Free" : "Paid"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="rounded-2xl px-4 py-4 space-y-2"
          style={{ background: "#fff", border: "1px solid #fde68a" }}>
          <div className="flex items-center gap-2 mb-1">
            <Zap size={14} style={{ color: AMBER }} />
            <p className="text-[13px] font-bold text-gray-800">Boost your visibility</p>
          </div>
          {[
            "Add colourful, specific event names — 'Secret Menu at Noon' beats 'Lunch special'",
            "Set a capacity so campers know to arrive early",
            "Mark events as Free to appear at the top of the schedule",
          ].map(tip => (
            <div key={tip} className="flex items-start gap-2">
              <span className="text-amber-400 mt-0.5 flex-shrink-0">•</span>
              <p className="text-[12px] text-gray-500 leading-relaxed">{tip}</p>
            </div>
          ))}
        </div>

      </div>

      <BottomNav role="vendor" />
    </div>
  );
}
