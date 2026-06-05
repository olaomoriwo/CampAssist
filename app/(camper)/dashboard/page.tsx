"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import BottomNav from "@/components/ui/BottomNav";
import StatusBadge from "@/components/ui/StatusBadge";
import { Profile, Booking, AssistanceRequest, Festival } from "@/types";
import { Tent, HelpCircle, MapPin, CheckCircle, Bell } from "lucide-react";
import { formatDate } from "@/lib/utils";
import {
  DEMO_MODE, DEMO_PROFILE, DEMO_FESTIVAL, DEMO_BOOKING, DEMO_REQUESTS
} from "@/lib/demo-data";

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
      const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      setProfile(profileData);
      if (profileData?.festival_id) {
        const { data: festData } = await supabase.from("festivals").select("*").eq("id", profileData.festival_id).single();
        setFestival(festData);
        const { data: bookingData } = await supabase.from("bookings").select("*, tent_type:tent_types(*)").eq("camper_id", user.id).order("created_at", { ascending: false }).limit(1).single();
        setBooking(bookingData);
        const { data: requestData } = await supabase.from("assistance_requests").select("*").eq("camper_id", user.id).in("status", ["pending", "accepted", "in_progress"]).order("created_at", { ascending: false }).limit(1).single();
        setActiveRequest(requestData);
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleArrived = async () => {
    if (DEMO_MODE) {
      setArrivedNotified(true);
      if (booking) setBooking({ ...booking, status: "confirmed" });
      return;
    }
    if (!booking || !profile) return;
    await supabase.from("bookings").update({ status: "confirmed" }).eq("id", booking.id);
    await fetch("/api/pusher/trigger", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channel: `festival-${profile.festival_id}-jobs`, event: "new-job", data: { bookingId: booking.id, type: "tent_setup", camperName: profile.name } }),
    });
    setArrivedNotified(true);
    setBooking(b => b ? { ...b, status: "confirmed" } : b);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-[3px] border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>;

  return (
    <div className="page-container">
      <header className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-bold text-lg text-gray-900">Hey, {profile?.name?.split(" ")[0]} 👋</h1>
            <p className="text-sm text-gray-500">{festival?.name || "No festival selected"}</p>
          </div>
          <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-primary-700 font-bold text-sm">{profile?.name?.charAt(0).toUpperCase()}</span>
          </div>
        </div>
      </header>

      <div className="px-4 py-6 space-y-4">
        {booking && booking.status === "pending" && !arrivedNotified && (
          <div className="bg-primary-600 rounded-2xl p-5 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Bell size={18} />
              <span className="font-semibold">You have a tent reserved!</span>
            </div>
            <p className="text-sm text-white/80 mb-4">Let us know when you&apos;ve arrived and we&apos;ll send an assistant to set it up.</p>
            <button onClick={handleArrived} className="w-full bg-white text-primary-700 font-bold py-3 rounded-xl hover:bg-primary-50 transition-colors">
              I&apos;ve Arrived 🏕️
            </button>
          </div>
        )}

        {arrivedNotified && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
            <CheckCircle size={20} className="text-green-600 shrink-0" />
            <p className="text-sm text-green-800 font-medium">Great! An assistant has been notified to set up your tent.</p>
          </div>
        )}

        {activeRequest && (
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-gray-900 text-sm">Active Request</span>
              <StatusBadge status={activeRequest.status} />
            </div>
            <p className="text-sm text-gray-600 capitalize">{activeRequest.type.replace("_", " ")}</p>
            <p className="text-xs text-gray-400 mt-1">{activeRequest.location_description}</p>
          </div>
        )}

        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Tent size={18} className="text-primary-600" />
              <span className="font-semibold text-gray-900">Your Tent</span>
            </div>
            {booking ? <StatusBadge status={booking.status} /> : null}
          </div>
          {booking ? (
            <div className="space-y-1">
              <p className="text-sm font-medium">{(booking as any).tent_type?.name}</p>
              <p className="text-xs text-gray-500">{formatDate(booking.arrival_date)} — {formatDate(booking.departure_date)}</p>
              <p className="text-xs text-gray-400">Booking ref: {booking.id.slice(0, 8).toUpperCase()}</p>
            </div>
          ) : (
            <div>
              <p className="text-sm text-gray-500 mb-3">No tent booked yet.</p>
              <Link href="/tents" className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:underline">Browse tents →</Link>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Link href="/map" className="card flex flex-col items-center gap-2 py-5 hover:shadow-md transition-shadow text-center">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <MapPin size={20} className="text-blue-600" />
            </div>
            <span className="text-sm font-semibold text-gray-900">Festival Map</span>
            <span className="text-xs text-gray-400">Find your way around</span>
          </Link>
          <Link href="/request-help" className="card flex flex-col items-center gap-2 py-5 hover:shadow-md transition-shadow text-center">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <HelpCircle size={20} className="text-orange-600" />
            </div>
            <span className="text-sm font-semibold text-gray-900">Request Help</span>
            <span className="text-xs text-gray-400">Get on-site assistance</span>
          </Link>
        </div>

        <Link href="/tents" className="card flex items-center justify-between hover:shadow-md transition-shadow">
          <div><p className="font-semibold text-sm text-gray-900">Book a Tent</p><p className="text-xs text-gray-500">Browse and reserve before arrival</p></div>
          <span className="text-gray-400">→</span>
        </Link>

        <Link href="/my-requests" className="card flex items-center justify-between hover:shadow-md transition-shadow">
          <div><p className="font-semibold text-sm text-gray-900">My Requests</p><p className="text-xs text-gray-500">View all assistance history</p></div>
          <span className="text-gray-400">→</span>
        </Link>
      </div>

      <BottomNav role="camper" />
    </div>
  );
}
