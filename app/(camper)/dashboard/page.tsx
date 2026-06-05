"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import BottomNav from "@/components/ui/BottomNav";
import StatusBadge from "@/components/ui/StatusBadge";
import { Profile, Booking, AssistanceRequest, Festival } from "@/types";
import { Tent, HelpCircle, MapPin, CheckCircle, Bell, ChevronRight } from "lucide-react";
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
      const active = DEMO_REQUESTS.find(r => (r.status as string) === 'in_progress' || (r.status as string) === 'pending');
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

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-[3px] border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>;

  return (
    <div className="page-container" style={{ background: "#f8fafc" }}>
      {/* Header */}
      <div className="page-header justify-between">
        <div>
          <h1 className="font-bold text-xl text-gray-900">Hey, {profile?.name?.split(" ")[0]} 👋</h1>
          <p className="text-xs text-gray-500 mt-0.5">{festival?.name || "No festival selected"}</p>
        </div>
        <Link href="/profile" className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white" style={{ background: "linear-gradient(135deg, #16a34a, #15803d)" }}>
          {profile?.name?.charAt(0).toUpperCase()}
        </Link>
      </div>

      <div className="px-4 py-5 space-y-4">
        {/* Arrival CTA */}
        {booking && booking.status === "pending" && !arrivedNotified && (
          <div className="rounded-3xl p-5 text-white overflow-hidden relative" style={{ background: "linear-gradient(135deg, #16a34a, #15803d)" }}>
            <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10" style={{ background: "#fff" }} />
            <div className="absolute -right-2 -bottom-6 w-32 h-32 rounded-full opacity-5" style={{ background: "#fff" }} />
            <div className="flex items-center gap-2 mb-1.5">
              <Bell size={16} />
              <span className="font-bold text-sm">You have a tent reserved!</span>
            </div>
            <p className="text-sm mb-1 opacity-80">{(booking as any).tent_type?.name || "Your tent"}</p>
            <p className="text-xs mb-4 opacity-60">{formatDate(booking.arrival_date)} — {formatDate(booking.departure_date)}</p>
            <button onClick={handleArrived} className="w-full font-bold py-3.5 rounded-2xl text-sm transition-all" style={{ background: "#fff", color: "#15803d" }}>
              I've Arrived — Set Up My Tent 🏕️
            </button>
          </div>
        )}

        {arrivedNotified && (
          <div className="rounded-3xl p-4 flex items-center gap-3" style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
            <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
            <p className="text-sm font-semibold text-green-800">Chidi is on his way to set up your tent!</p>
          </div>
        )}

        {activeRequest && (
          <Link href="/my-requests" className="card-hover flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Active Request</p>
              <p className="font-semibold text-sm capitalize">{activeRequest.type.replace("_", " ")}</p>
              <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{activeRequest.location_description}</p>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={activeRequest.status} />
              <ChevronRight size={16} className="text-gray-300" />
            </div>
          </Link>
        )}

        {/* Booking card */}
        {booking ? (
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center">
                  <Tent size={16} className="text-green-600" />
                </div>
                <span className="font-bold text-sm">Your Tent</span>
              </div>
              <StatusBadge status={booking.status} />
            </div>
            <p className="text-base font-bold text-gray-900">{(booking as any).tent_type?.name}</p>
            <p className="text-xs text-gray-500 mt-1">{formatDate(booking.arrival_date)} — {formatDate(booking.departure_date)}</p>
            <p className="text-xs text-gray-300 mt-0.5 font-mono">Ref: {booking.id.slice(0, 8).toUpperCase()}</p>
          </div>
        ) : (
          <div className="card">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center"><Tent size={16} className="text-green-600" /></div>
              <span className="font-bold text-sm">Book Your Tent</span>
            </div>
            <p className="text-sm text-gray-500 mb-3">Reserve your festival tent before you arrive. Our assistants set it up for you.</p>
            <Link href="/tents" className="btn-primary block text-center">Browse Available Tents</Link>
          </div>
        )}

        {/* Quick action grid */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { href: "/map", icon: MapPin, color: "#2563eb", bg: "#eff6ff", label: "Festival Map" },
            { href: "/request-help", icon: HelpCircle, color: "#ea580c", bg: "#fff7ed", label: "Request Help" },
            { href: "/my-requests", icon: CheckCircle, color: "#9333ea", bg: "#fdf4ff", label: "My Requests" },
          ].map(item => (
            <Link key={item.href} href={item.href}
              className="card-hover flex flex-col items-center py-4 gap-2">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: item.bg }}>
                <item.icon size={20} style={{ color: item.color }} />
              </div>
              <span className="text-xs font-semibold text-gray-700 text-center leading-tight">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>

      <BottomNav role="camper" />
    </div>
  );
}
