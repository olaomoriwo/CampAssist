"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import BottomNav from "@/components/ui/BottomNav";
import StatusBadge from "@/components/ui/StatusBadge";
import { Profile, Booking, AssistanceRequest, Festival } from "@/types";
import { Tent, HelpCircle, MapPin, CheckCircle, Bell, ChevronRight, MessageCircle, Sparkles, Zap } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { DEMO_MODE, DEMO_PROFILE, DEMO_FESTIVAL, DEMO_BOOKING, DEMO_REQUESTS } from "@/lib/demo-data";

export default function CamperDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [festival, setFestival] = useState<Festival | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [activeRequest, setActiveRequest] = useState<AssistanceRequest | null>(null);
  const [arrivedNotified, setArrivedNotified] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    if (DEMO_MODE) {
      setProfile(DEMO_PROFILE as unknown as Profile);
      setFestival(DEMO_FESTIVAL as unknown as Festival);
      setBooking(DEMO_BOOKING as unknown as Booking);
      const active = DEMO_REQUESTS.find(r => (r.status as string) === "in_progress" || (r.status as string) === "pending");
      if (active) setActiveRequest(active as unknown as AssistanceRequest);
      setLoading(false);
      return;
    }
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data: p } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      setProfile(p);
      if (p?.festival_id) {
        const { data: f } = await supabase.from("festivals").select("*").eq("id", p.festival_id).single();
        setFestival(f);
        const { data: b } = await supabase.from("bookings").select("*, tent_type:tent_types(*)").eq("camper_id", user.id).order("created_at", { ascending: false }).limit(1).single();
        setBooking(b);
        const { data: r } = await supabase.from("assistance_requests").select("*").eq("camper_id", user.id).in("status", ["pending", "accepted", "in_progress"]).order("created_at", { ascending: false }).limit(1).single();
        setActiveRequest(r);
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleArrived = async () => {
    if (DEMO_MODE) { setArrivedNotified(true); if (booking) setBooking({ ...booking, status: "confirmed" }); return; }
    if (!booking || !profile) return;
    await supabase.from("bookings").update({ status: "confirmed" }).eq("id", booking.id);
    await fetch("/api/pusher/trigger", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channel: `festival-${profile.festival_id}-jobs`, event: "new-job", data: { bookingId: booking.id, type: "tent_setup", camperName: profile.name } }),
    });
    setArrivedNotified(true);
    setBooking(b => b ? { ...b, status: "confirmed" } : b);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#f7f8fa" }}>
      <div className="w-9 h-9 spinner spinner-green" />
    </div>
  );

  const firstName = profile?.name?.split(" ")[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="page-container">
      {/* ── Header ── */}
      <div className="page-header justify-between">
        <div>
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">{greeting}</p>
          <h1 className="font-bold text-[17px] text-gray-900 leading-snug">{firstName} 👋</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/my-requests" className="relative w-9 h-9 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center">
            <Bell size={16} className="text-gray-500" />
            {activeRequest && <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />}
          </Link>
          <Link href="/profile" className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-[13px] text-white"
            style={{ background: "linear-gradient(135deg, #16a34a, #15803d)" }}>
            {profile?.name?.charAt(0).toUpperCase()}
          </Link>
        </div>
      </div>

      <div className="px-4 pt-4 pb-2 space-y-3 animate-fade-in-up">

        {/* ── Festival Banner ── */}
        {festival && (
          <div className="rounded-2xl px-4 py-3 flex items-center gap-3"
            style={{ background: "linear-gradient(135deg, #f0fdf4, #dcfce7)", border: "1px solid #bbf7d0" }}>
            <div className="w-8 h-8 rounded-xl bg-green-600 flex items-center justify-center flex-shrink-0">
              <Sparkles size={15} className="text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-[12px] font-bold text-green-800 truncate">{festival.name}</p>
              <p className="text-[11px] text-green-600">{(festival as any).location}</p>
            </div>
          </div>
        )}

        {/* ── Arrival CTA ── */}
        {booking && booking.status === "pending" && !arrivedNotified && (
          <div className="card-hero-green animate-scale-in">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-1">
                <Bell size={14} />
                <span className="font-bold text-[11px] uppercase tracking-widest opacity-80">Tent Reserved</span>
              </div>
              <p className="font-bold text-xl mb-0.5">{(booking as any).tent_type?.name || "Your tent"}</p>
              <p className="text-[12px] opacity-60 mb-4">{formatDate(booking.arrival_date)} — {formatDate(booking.departure_date)}</p>
              <button onClick={handleArrived}
                className="w-full font-bold py-3.5 rounded-2xl text-[14px] transition-all active:scale-97"
                style={{ background: "#fff", color: "#15803d", boxShadow: "0 4px 14px rgba(0,0,0,0.12)" }}>
                I&apos;ve Arrived — Set Up My Tent 🏕️
              </button>
            </div>
          </div>
        )}

        {arrivedNotified && (
          <div className="rounded-2xl p-4 flex items-center gap-3 animate-scale-in"
            style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
            <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
            <p className="text-[13px] font-semibold text-green-800">Your assistant is on the way to set up your tent!</p>
          </div>
        )}

        {/* ── Active Request ── */}
        {activeRequest && (
          <Link href="/my-requests" className="card-hover flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#fff7ed" }}>
                <Zap size={16} style={{ color: "#ea580c" }} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Request</p>
                <p className="font-semibold text-[13px] capitalize mt-0.5">{activeRequest.type.replace("_", " ")}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={activeRequest.status} />
              <ChevronRight size={15} className="text-gray-300" />
            </div>
          </Link>
        )}

        {/* ── Get Assistance CTA ── */}
        <Link href="/request-help"
          className="block rounded-2xl p-4 transition-all active:scale-97"
          style={{ background: "linear-gradient(135deg, #16a34a, #15803d)", boxShadow: "0 4px 18px rgba(22,163,74,0.3)" }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-bold text-[15px]">Get Assistance</p>
              <p className="text-white/70 text-[12px] mt-0.5">Request a camp assistant right now</p>
            </div>
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.15)" }}>
              <HelpCircle size={20} className="text-white" />
            </div>
          </div>
        </Link>

        {/* ── Quick Actions ── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { href: "/messages", icon: MessageCircle, color: "#16a34a", bg: "#f0fdf4", label: "Messages" },
            { href: "/map", icon: MapPin, color: "#2563eb", bg: "#eff6ff", label: "Festival Map" },
            { href: "/my-requests", icon: CheckCircle, color: "#9333ea", bg: "#fdf4ff", label: "My Requests" },
          ].map(item => (
            <Link key={item.href} href={item.href}
              className="card-hover flex flex-col items-center py-4 gap-2">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: item.bg }}>
                <item.icon size={20} style={{ color: item.color }} />
              </div>
              <span className="text-[11px] font-semibold text-gray-700 text-center leading-tight">{item.label}</span>
            </Link>
          ))}
        </div>

        {/* ── Tent Booking Card ── */}
        {booking ? (
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center">
                  <Tent size={17} className="text-green-600" />
                </div>
                <span className="font-bold text-[13px]">Your Tent</span>
              </div>
              <StatusBadge status={booking.status} />
            </div>
            <p className="font-bold text-[15px] text-gray-900">{(booking as any).tent_type?.name}</p>
            <p className="text-[12px] text-gray-500 mt-1">{formatDate(booking.arrival_date)} — {formatDate(booking.departure_date)}</p>
            <p className="text-[11px] text-gray-300 mt-0.5 font-mono tracking-wide">REF: {booking.id.slice(0, 8).toUpperCase()}</p>
          </div>
        ) : (
          <div className="card">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center">
                <Tent size={17} className="text-green-600" />
              </div>
              <span className="font-bold text-[13px]">Book Your Tent</span>
            </div>
            <p className="text-[13px] text-gray-500 mb-3 leading-relaxed">Reserve your festival tent. Our assistants set it up before you arrive.</p>
            <Link href="/tents" className="btn-primary block text-center text-[13px]">Browse Available Tents</Link>
          </div>
        )}

        {/* ── Social Feed Teaser ── */}
        <Link href="/social"
          className="card-hover flex items-center justify-between"
          style={{ background: "linear-gradient(135deg, #fdf4ff, #f5f3ff)" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#ede9fe" }}>
              <Sparkles size={17} style={{ color: "#7c3aed" }} />
            </div>
            <div>
              <p className="font-bold text-[13px] text-gray-900">Camp Social Feed</p>
              <p className="text-[11px] text-gray-500">See what others are posting at the festival</p>
            </div>
          </div>
          <ChevronRight size={15} className="text-gray-300" />
        </Link>

      </div>

      <BottomNav role="camper" />
    </div>
  );
}
