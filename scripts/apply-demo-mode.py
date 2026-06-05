#!/usr/bin/env python3
"""
Patches all CampAssist pages to support DEMO_MODE with mock data.
Run from the campAssist directory: python3 scripts/apply-demo-mode.py
"""
import os

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def write(path, content):
    full = os.path.join(BASE, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, 'w') as f:
        f.write(content)
    print(f"  ✓ {path}")

print("Applying demo mode to all pages...\n")

# ── TENTS BROWSE PAGE ────────────────────────────────────────────────────────
write("app/(camper)/tents/page.tsx", '''\
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import BottomNav from "@/components/ui/BottomNav";
import { TentType } from "@/types";
import { ArrowLeft, Tent, Users } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { DEMO_MODE, DEMO_TENT_TYPES, DEMO_PROFILE } from "@/lib/demo-data";

export default function BrowseTentsPage() {
  const [tents, setTents] = useState<TentType[]>([]);
  const [hasFestival, setHasFestival] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    if (DEMO_MODE) {
      setTents(DEMO_TENT_TYPES as unknown as TentType[]);
      setHasFestival(true);
      setLoading(false);
      return;
    }
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data: profile } = await supabase.from("profiles").select("festival_id").eq("id", user.id).single();
      if (profile?.festival_id) {
        setHasFestival(true);
        const { data } = await supabase.from("tent_types").select("*").eq("festival_id", profile.festival_id).gt("available_quantity", 0);
        setTents(data || []);
      }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-[3px] border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>;

  return (
    <div className="page-container">
      <header className="page-header">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-gray-500 hover:text-gray-700"><ArrowLeft size={20} /></Link>
          <h1 className="font-bold text-lg">Book a Tent</h1>
        </div>
      </header>
      <div className="px-4 py-6">
        <p className="text-sm text-gray-500 mb-6">Reserve your tent before the festival. Our assistants set it up when you arrive. Payment confirmed before event.</p>
        {!hasFestival ? (
          <div className="card text-center py-8">
            <Tent size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm mb-3">No festival selected yet.</p>
            <Link href="/profile" className="text-primary-600 text-sm font-medium hover:underline">Update your profile →</Link>
          </div>
        ) : tents.length === 0 ? (
          <div className="card text-center py-8">
            <Tent size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No tents available yet. Check back soon.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tents.map(tent => (
              <Link key={tent.id} href={`/tents/${tent.id}`} className="card block hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900">{tent.name}</h3>
                    <div className="flex items-center gap-1 text-gray-500 text-xs mt-1"><Users size={12} /><span>Up to {tent.capacity} people</span></div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary-600">{formatCurrency(tent.price_per_day)}</p>
                    <p className="text-xs text-gray-400">per night</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">{tent.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">+ {formatCurrency(tent.damage_deposit)} refundable deposit</span>
                  <span className="text-xs font-medium text-primary-600">View details →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      <BottomNav role="camper" />
    </div>
  );
}
''')

# ── TENT DETAIL PAGE ─────────────────────────────────────────────────────────
write("app/(camper)/tents/[id]/page.tsx", '''\
"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import BottomNav from "@/components/ui/BottomNav";
import { TentType, Profile } from "@/types";
import { ArrowLeft, Users, Shield, CheckCircle } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { DEMO_MODE, DEMO_TENT_TYPES, DEMO_PROFILE } from "@/lib/demo-data";

export default function TentDetailPage() {
  const [tent, setTent] = useState<TentType | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [booked, setBooked] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    if (DEMO_MODE) {
      const found = DEMO_TENT_TYPES.find(t => t.id === params.id) || DEMO_TENT_TYPES[0];
      setTent(found as unknown as TentType);
      setProfile(DEMO_PROFILE as unknown as Profile);
      setLoading(false);
      return;
    }
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const [{ data: tentData }, { data: profileData }] = await Promise.all([
        supabase.from("tent_types").select("*").eq("id", params.id).single(),
        supabase.from("profiles").select("*").eq("id", user.id).single(),
      ]);
      setTent(tentData);
      setProfile(profileData);
      setLoading(false);
    };
    load();
  }, [params.id]);

  const nights = profile?.arrival_date && profile?.departure_date
    ? Math.max(1, Math.ceil((new Date(profile.departure_date).getTime() - new Date(profile.arrival_date).getTime()) / 86400000))
    : 3;

  const handleBooking = async () => {
    if (!tent || !profile) return;
    setBooking(true);
    if (DEMO_MODE) {
      setTimeout(() => { setBooked(true); setTimeout(() => router.push("/booking-confirmation"), 1200); }, 800);
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error: err } = await supabase.from("bookings").insert({
      camper_id: user.id, tent_type_id: tent.id, festival_id: profile.festival_id,
      arrival_date: profile.arrival_date, departure_date: profile.departure_date, status: "pending",
    });
    if (err) { setError(err.message); setBooking(false); return; }
    setBooked(true);
    setTimeout(() => router.push("/booking-confirmation"), 1500);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-[3px] border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>;
  if (!tent) return <div className="min-h-screen flex items-center justify-center"><p>Tent not found</p></div>;
  if (booked) return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4"><CheckCircle size={32} className="text-green-600" /></div>
      <h2 className="text-xl font-bold mb-2">Tent Reserved!</h2>
      <p className="text-gray-500 text-sm">Redirecting to your confirmation...</p>
    </div>
  );

  return (
    <div className="page-container">
      <header className="page-header">
        <div className="flex items-center gap-3">
          <Link href="/tents" className="text-gray-500"><ArrowLeft size={20} /></Link>
          <h1 className="font-bold text-lg">{tent.name}</h1>
        </div>
      </header>
      <div className="px-4 py-6 space-y-6">
        <div className="w-full h-48 bg-gradient-to-br from-primary-100 to-green-200 rounded-2xl flex items-center justify-center"><span className="text-6xl">⛺</span></div>
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-xl">{tent.name}</h2>
            <div className="flex items-center gap-1 text-gray-500 text-sm"><Users size={14} /><span>{tent.capacity} people</span></div>
          </div>
          <p className="text-gray-600 text-sm">{tent.description}</p>
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm"><span className="text-gray-500">Price per night</span><span className="font-semibold">{formatCurrency(tent.price_per_day)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">{nights} nights</span><span className="font-semibold">{formatCurrency(tent.price_per_day * nights)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">Refundable deposit</span><span className="font-semibold text-blue-600">{formatCurrency(tent.damage_deposit)}</span></div>
            <div className="flex justify-between text-sm font-bold border-t pt-2"><span>Total to pay before festival</span><span className="text-primary-600">{formatCurrency(tent.price_per_day * nights + tent.damage_deposit)}</span></div>
          </div>
        </div>
        <div className="card">
          <p className="text-sm font-semibold text-gray-900 mb-3">What&apos;s included</p>
          <div className="space-y-2">
            {["Tent set up by our assistant on arrival", "Tent collected by our assistant when you leave", "Assistant assigned 24hrs before arrival"].map(item => (
              <div key={item} className="flex items-center gap-2 text-sm text-gray-600"><CheckCircle size={14} className="text-primary-500 shrink-0" />{item}</div>
            ))}
          </div>
        </div>
        <div className="flex items-start gap-3 bg-blue-50 rounded-xl p-4">
          <Shield size={16} className="text-blue-600 shrink-0 mt-0.5" />
          <p className="text-xs text-blue-700">Reservation only — payment details sent before the festival. Tent locked in once payment confirmed.</p>
        </div>
        {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>}
        <button onClick={handleBooking} disabled={booking} className="btn-primary">{booking ? "Reserving..." : "Reserve This Tent"}</button>
      </div>
      <BottomNav role="camper" />
    </div>
  );
}
''')

# ── BOOKING CONFIRMATION ─────────────────────────────────────────────────────
write("app/(camper)/booking-confirmation/page.tsx", '''\
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { Booking } from "@/types";
import { CheckCircle, Home, Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { DEMO_MODE, DEMO_BOOKING } from "@/lib/demo-data";

export default function BookingConfirmationPage() {
  const [booking, setBooking] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    if (DEMO_MODE) { setBooking(DEMO_BOOKING); return; }
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("bookings").select("*, tent_type:tent_types(*)").eq("camper_id", user.id).order("created_at", { ascending: false }).limit(1).single();
      setBooking(data);
    };
    load();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6"><CheckCircle size={40} className="text-green-600" /></div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Tent Reserved! 🏕️</h1>
        <p className="text-gray-500 text-sm mb-8 max-w-xs">We&apos;ll contact you before the festival to arrange payment and confirm your booking.</p>
        {booking && (
          <div className="w-full max-w-sm bg-white rounded-2xl border border-gray-100 p-5 text-left mb-8 space-y-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Booking Details</p>
            <div className="flex justify-between text-sm"><span className="text-gray-500">Tent</span><span className="font-semibold">{booking.tent_type?.name}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">Arrival</span><span className="font-semibold">{formatDate(booking.arrival_date)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">Departure</span><span className="font-semibold">{formatDate(booking.departure_date)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">Ref</span><span className="font-mono text-xs font-semibold text-gray-700">{booking.id.slice(0, 8).toUpperCase()}</span></div>
            <div className="border-t pt-3"><p className="text-xs text-gray-400 flex items-center gap-1"><Calendar size={12} />Payment details will be sent to your email before the festival</p></div>
          </div>
        )}
        <div className="w-full max-w-sm bg-primary-50 rounded-2xl p-4 text-left mb-8">
          <p className="text-sm font-semibold text-primary-800 mb-3">What happens next</p>
          {["We\'ll email you payment instructions", "Once payment confirmed, tent is locked in", "On arrival day, tap I\'ve Arrived in the app", "Assistant sets up your tent at your spot"].map((step, i) => (
            <div key={step} className="flex items-start gap-2 text-sm text-primary-700 mb-2">
              <span className="w-5 h-5 bg-primary-200 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>{step}
            </div>
          ))}
        </div>
        <Link href="/dashboard" className="flex items-center justify-center gap-2 bg-primary-600 text-white font-bold py-4 px-8 rounded-2xl hover:bg-primary-700 transition-colors"><Home size={18} /> Back to Dashboard</Link>
      </div>
    </main>
  );
}
''')

# ── REQUEST HELP ─────────────────────────────────────────────────────────────
write("app/(camper)/request-help/page.tsx", '''\
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import BottomNav from "@/components/ui/BottomNav";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { RequestType } from "@/types";
import { DEMO_MODE } from "@/lib/demo-data";

const REQUEST_TYPES: { value: RequestType; label: string; description: string; emoji: string }[] = [
  { value: "tent_setup", label: "Tent Setup", description: "Help setting up your tent", emoji: "⛺" },
  { value: "tent_collection", label: "Tent Collection", description: "Ready to leave, collect tent", emoji: "📦" },
  { value: "general", label: "General Help", description: "General assistance needed", emoji: "🙋" },
  { value: "other", label: "Other", description: "Something else", emoji: "💬" },
];

export default function RequestHelpPage() {
  const [type, setType] = useState<RequestType | null>(null);
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!type) return;
    setLoading(true);
    if (DEMO_MODE) {
      setTimeout(() => { setSubmitted(true); setLoading(false); }, 600);
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }
    const { data: profile } = await supabase.from("profiles").select("festival_id").eq("id", user.id).single();
    const { data, error: err } = await supabase.from("assistance_requests").insert({
      camper_id: user.id, festival_id: profile?.festival_id, type,
      description: description || REQUEST_TYPES.find(t => t.value === type)?.description || "",
      location_description: location, status: "pending",
    }).select().single();
    if (err) { setError(err.message); setLoading(false); return; }
    await fetch("/api/pusher/trigger", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channel: `festival-${profile?.festival_id}-jobs`, event: "new-job", data: { requestId: data.id, type, location } }) });
    setSubmitted(true);
    setLoading(false);
  };

  if (submitted) return (
    <div className="page-container">
      <div className="flex flex-col items-center justify-center min-h-screen px-6 pb-24 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4"><CheckCircle size={32} className="text-green-600" /></div>
        <h2 className="text-xl font-bold mb-2">Request Sent!</h2>
        <p className="text-gray-500 text-sm mb-8 max-w-xs">An available assistant has been notified. You&apos;ll see updates as they accept your request.</p>
        <div className="space-y-3 w-full max-w-xs">
          <Link href="/my-requests" className="btn-primary block text-center">Track My Request</Link>
          <Link href="/dashboard" className="btn-secondary block text-center">Back to Dashboard</Link>
        </div>
      </div>
      <BottomNav role="camper" />
    </div>
  );

  return (
    <div className="page-container">
      <header className="page-header">
        <div className="flex items-center gap-3"><Link href="/dashboard" className="text-gray-500"><ArrowLeft size={20} /></Link><h1 className="font-bold text-lg">Request Help</h1></div>
      </header>
      <form onSubmit={handleSubmit} className="px-4 py-6 space-y-6">
        <div>
          <p className="text-sm font-semibold text-gray-900 mb-3">What do you need help with?</p>
          <div className="grid grid-cols-2 gap-3">
            {REQUEST_TYPES.map(t => (
              <button key={t.value} type="button" onClick={() => setType(t.value)}
                className={`p-4 rounded-2xl border-2 text-left transition-all ${type === t.value ? "border-primary-500 bg-primary-50" : "border-gray-100 bg-white hover:border-gray-200"}`}>
                <span className="text-2xl block mb-2">{t.emoji}</span>
                <p className="text-sm font-semibold text-gray-900">{t.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{t.description}</p>
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Where are you? <span className="text-red-500">*</span></label>
          <textarea className="input resize-none" rows={2} required value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Near the main stage, section B, green tent with a blue flag" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Additional notes (optional)</label>
          <textarea className="input resize-none" rows={3} value={description} onChange={e => setDescription(e.target.value)} placeholder="Any extra details..." />
        </div>
        {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>}
        <button type="submit" disabled={!type || !location || loading} className="btn-primary">{loading ? "Sending request..." : "Send Request"}</button>
      </form>
      <BottomNav role="camper" />
    </div>
  );
}
''')

# ── MY REQUESTS ──────────────────────────────────────────────────────────────
write("app/(camper)/my-requests/page.tsx", '''\
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import BottomNav from "@/components/ui/BottomNav";
import StatusBadge from "@/components/ui/StatusBadge";
import StarRating from "@/components/ui/StarRating";
import { AssistanceRequest } from "@/types";
import { ArrowLeft, HelpCircle } from "lucide-react";
import { getRequestTypeLabel } from "@/lib/utils";
import { DEMO_MODE, DEMO_REQUESTS } from "@/lib/demo-data";

export default function MyRequestsPage() {
  const [requests, setRequests] = useState<AssistanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    if (DEMO_MODE) { setRequests(DEMO_REQUESTS as unknown as AssistanceRequest[]); setLoading(false); return; }
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data } = await supabase.from("assistance_requests").select("*").eq("camper_id", user.id).order("created_at", { ascending: false });
      setRequests(data || []);
      setLoading(false);
    };
    load();
  }, []);

  const handleCancel = async (id: string) => {
    if (DEMO_MODE) { setRequests(r => r.map(req => req.id === id ? { ...req, status: "cancelled" as any } : req)); return; }
    await supabase.from("assistance_requests").update({ status: "cancelled" }).eq("id", id);
    setRequests(r => r.map(req => req.id === id ? { ...req, status: "cancelled" } : req));
  };

  const handleRate = async (id: string, stars: number) => {
    setRatings(r => ({ ...r, [id]: stars }));
    if (!DEMO_MODE) await supabase.from("assistance_requests").update({ rating: stars }).eq("id", id);
    setRequests(r => r.map(req => req.id === id ? { ...req, rating: stars } : req));
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-[3px] border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>;

  return (
    <div className="page-container">
      <header className="page-header">
        <div className="flex items-center gap-3"><Link href="/dashboard" className="text-gray-500"><ArrowLeft size={20} /></Link><h1 className="font-bold text-lg">My Requests</h1></div>
      </header>
      <div className="px-4 py-6">
        {requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <HelpCircle size={48} className="text-gray-200 mb-4" />
            <p className="text-gray-500 text-sm">No requests yet.</p>
            <Link href="/request-help" className="mt-4 text-primary-600 text-sm font-medium hover:underline">Request help →</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map(req => (
              <div key={req.id} className="card space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{getRequestTypeLabel(req.type)}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{new Date(req.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
                  </div>
                  <StatusBadge status={req.status} />
                </div>
                <p className="text-sm text-gray-600">{req.location_description}</p>
                {req.description && <p className="text-xs text-gray-400">{req.description}</p>}
                {req.status === "pending" && <button onClick={() => handleCancel(req.id)} className="text-xs text-red-500 hover:text-red-700 font-medium">Cancel request</button>}
                {req.status === "complete" && (
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Rate your assistant</p>
                    <StarRating value={ratings[req.id] ?? req.rating ?? 0} onChange={(stars) => handleRate(req.id, stars)} readonly={!!(req.rating)} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <BottomNav role="camper" />
    </div>
  );
}
''')

# ── MAP ──────────────────────────────────────────────────────────────────────
write("app/(camper)/map/page.tsx", '''\
"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import BottomNav from "@/components/ui/BottomNav";
import { Festival, MapPOI, POICategory } from "@/types";
import { ArrowLeft, MapPin } from "lucide-react";
import { getPOICategoryIcon, getPOICategoryLabel } from "@/lib/utils";
import { DEMO_MODE, DEMO_FESTIVAL } from "@/lib/demo-data";

const FestivalMap = dynamic(() => import("@/components/camper/FestivalMap"), { ssr: false });

const CATEGORIES: { value: POICategory | "all"; label: string; icon: string }[] = [
  { value: "all", label: "All", icon: "📍" },
  { value: "toilet", label: "Toilets", icon: "🚽" },
  { value: "stage", label: "Stages", icon: "🎵" },
  { value: "bar", label: "Bars", icon: "🍺" },
  { value: "food", label: "Food", icon: "🍔" },
  { value: "first_aid", label: "First Aid", icon: "🏥" },
  { value: "water", label: "Water", icon: "💧" },
];

export default function MapPage() {
  const [festival, setFestival] = useState<Festival | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<POICategory | "all">("all");
  const [selectedPOI, setSelectedPOI] = useState<MapPOI | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (DEMO_MODE) { setFestival(DEMO_FESTIVAL as unknown as Festival); setLoading(false); return; }
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data: profile } = await supabase.from("profiles").select("festival_id").eq("id", user.id).single();
      if (profile?.festival_id) {
        const { data } = await supabase.from("festivals").select("*").eq("id", profile.festival_id).single();
        setFestival(data);
      }
      setLoading(false);
    };
    load();
  }, []);

  const filteredPOIs = festival?.map_pois?.filter(poi => selectedCategory === "all" || poi.category === selectedCategory) || [];

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-[3px] border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>;

  return (
    <div className="page-container">
      <header className="page-header">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-gray-500"><ArrowLeft size={20} /></Link>
          <div><h1 className="font-bold text-lg">Festival Map</h1>{festival && <p className="text-xs text-gray-500">{festival.name}</p>}</div>
        </div>
      </header>
      <div className="bg-white border-b border-gray-100 px-4 py-3">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map(cat => (
            <button key={cat.value} onClick={() => setSelectedCategory(cat.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${selectedCategory === cat.value ? "bg-primary-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              <span>{cat.icon}</span><span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="px-4 pt-4" style={{ height: "calc(100vh - 220px)" }}>
        {!festival ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <MapPin size={48} className="text-gray-200 mb-4" />
            <p className="text-gray-500 text-sm">No festival map available yet.</p>
          </div>
        ) : (
          <FestivalMap festival={festival} pois={filteredPOIs} onSelectPOI={setSelectedPOI} />
        )}
      </div>
      {selectedPOI && (
        <div className="fixed bottom-20 left-0 right-0 px-4 z-30">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 max-w-lg mx-auto">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{getPOICategoryIcon(selectedPOI.category)}</span>
                  <h3 className="font-bold text-gray-900">{selectedPOI.name}</h3>
                </div>
                <p className="text-xs text-gray-500 capitalize">{getPOICategoryLabel(selectedPOI.category)}</p>
                {selectedPOI.notes && <p className="text-sm text-gray-600 mt-2">{selectedPOI.notes}</p>}
              </div>
              <button onClick={() => setSelectedPOI(null)} className="text-gray-400 hover:text-gray-600 text-lg leading-none">✕</button>
            </div>
          </div>
        </div>
      )}
      <BottomNav role="camper" />
    </div>
  );
}
''')

# ── PROFILE ──────────────────────────────────────────────────────────────────
write("app/(camper)/profile/page.tsx", '''\
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import BottomNav from "@/components/ui/BottomNav";
import StatusBadge from "@/components/ui/StatusBadge";
import { Profile, Festival, Booking } from "@/types";
import { ArrowLeft, LogOut, Tent } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { DEMO_MODE, DEMO_PROFILE, DEMO_FESTIVAL, DEMO_BOOKING } from "@/lib/demo-data";

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [festival, setFestival] = useState<Festival | null>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    if (DEMO_MODE) {
      setProfile(DEMO_PROFILE as unknown as Profile);
      setFestival(DEMO_FESTIVAL as unknown as Festival);
      setBookings([DEMO_BOOKING]);
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
        const { data: bookingData } = await supabase.from("bookings").select("*, tent_type:tent_types(*)").eq("camper_id", user.id).order("created_at", { ascending: false });
        setBookings(bookingData || []);
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleSave = async () => {
    if (!profile || DEMO_MODE) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) await supabase.from("profiles").update({ name: profile.name, phone: profile.phone }).eq("id", user.id);
    setSaving(false);
  };

  const handleLogout = async () => {
    if (DEMO_MODE) { router.push("/"); return; }
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-[3px] border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>;

  return (
    <div className="page-container">
      <header className="page-header">
        <div className="flex items-center gap-3"><Link href="/dashboard" className="text-gray-500"><ArrowLeft size={20} /></Link><h1 className="font-bold text-lg">Profile</h1></div>
      </header>
      <div className="px-4 py-6 space-y-6">
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mb-3">
            <span className="text-primary-700 font-bold text-3xl">{profile?.name?.charAt(0).toUpperCase()}</span>
          </div>
          <p className="text-sm text-gray-500">{profile?.email}</p>
          {festival && <p className="text-xs text-primary-600 font-medium mt-1">{festival.name}</p>}
        </div>
        <div className="card space-y-4">
          <p className="text-sm font-semibold text-gray-900">Personal Details</p>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Full name</label>
            <input className="input" type="text" value={profile?.name || ""} onChange={e => setProfile(p => p ? { ...p, name: e.target.value } : p)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Phone number</label>
            <input className="input" type="tel" value={profile?.phone || ""} onChange={e => setProfile(p => p ? { ...p, phone: e.target.value } : p)} />
          </div>
          <button onClick={handleSave} disabled={saving || DEMO_MODE} className="btn-primary">{saving ? "Saving..." : "Save Changes"}</button>
        </div>
        {bookings.length > 0 && (
          <div className="card space-y-3">
            <p className="text-sm font-semibold text-gray-900 flex items-center gap-2"><Tent size={16} className="text-primary-600" /> My Bookings</p>
            {bookings.map(b => (
              <div key={b.id} className="border border-gray-100 rounded-xl p-3">
                <div className="flex items-start justify-between mb-1"><p className="text-sm font-medium">{b.tent_type?.name}</p><StatusBadge status={b.status} /></div>
                <p className="text-xs text-gray-400">{formatDate(b.arrival_date)} — {formatDate(b.departure_date)}</p>
                <p className="text-xs text-gray-300 mt-1">Ref: {b.id.slice(0, 8).toUpperCase()}</p>
              </div>
            ))}
          </div>
        )}
        <button onClick={handleLogout} className="btn-secondary flex items-center justify-center gap-2 text-red-600 border-red-100"><LogOut size={16} /> Sign out</button>
      </div>
      <BottomNav role="camper" />
    </div>
  );
}
''')

# ── ASSISTANT DASHBOARD ──────────────────────────────────────────────────────
write("app/(assistant)/assistant-dashboard/page.tsx", '''\
"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import BottomNav from "@/components/ui/BottomNav";
import StatusBadge from "@/components/ui/StatusBadge";
import { Profile, AssistanceRequest } from "@/types";
import { getPusherClient, channels, events } from "@/lib/pusher";
import { Briefcase, ToggleLeft, ToggleRight, MapPin, Clock, LogOut } from "lucide-react";
import { getRequestTypeLabel } from "@/lib/utils";
import { DEMO_MODE, DEMO_ASSISTANT_PROFILE, DEMO_JOBS } from "@/lib/demo-data";

export default function AssistantDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAvailable, setIsAvailable] = useState(false);
  const [activeJob, setActiveJob] = useState<AssistanceRequest | null>(null);
  const [pendingJobs, setPendingJobs] = useState<AssistanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const loadData = useCallback(async () => {
    if (DEMO_MODE) {
      setProfile(DEMO_ASSISTANT_PROFILE as unknown as Profile);
      setPendingJobs(DEMO_JOBS as unknown as AssistanceRequest[]);
      setLoading(false);
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }
    const [{ data: profileData }, { data: availData }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("assistant_availability").select("*").eq("assistant_id", user.id).single(),
    ]);
    setProfile(profileData);
    setIsAvailable(availData?.is_available || false);
    const { data: activeJobData } = await supabase.from("assistance_requests").select("*, camper:profiles!camper_id(name, phone)")
      .eq("assigned_assistant_id", user.id).in("status", ["accepted", "in_progress"]).order("created_at", { ascending: false }).limit(1).single();
    setActiveJob(activeJobData);
    if (profileData?.festival_id) {
      const { data: pendingData } = await supabase.from("assistance_requests").select("*, camper:profiles!camper_id(name)")
        .eq("festival_id", profileData.festival_id).eq("status", "pending").is("assigned_assistant_id", null).order("created_at", { ascending: true });
      setPendingJobs(pendingData || []);
    }
    setLoading(false);
  }, [router]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    if (!profile?.festival_id || DEMO_MODE) return;
    const pusher = getPusherClient();
    const channel = pusher.subscribe(channels.assistantJobs(profile.festival_id));
    channel.bind(events.NEW_JOB, () => loadData());
    const fid = profile.festival_id as string;
    return () => { channel.unbind_all(); pusher.unsubscribe(channels.assistantJobs(fid)); };
  }, [profile?.festival_id, loadData]);

  const toggleAvailability = async () => {
    setToggling(true);
    if (DEMO_MODE) { setIsAvailable(v => !v); setToggling(false); return; }
    const newVal = !isAvailable;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("assistant_availability").upsert({ assistant_id: user.id, is_available: newVal, festival_id: profile?.festival_id, updated_at: new Date().toISOString() });
    setIsAvailable(newVal);
    setToggling(false);
  };

  const acceptJob = async (request: AssistanceRequest) => {
    if (DEMO_MODE) { router.push(`/job/${request.id}`); return; }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("assistance_requests").update({ status: "accepted", assigned_assistant_id: user.id }).eq("id", request.id);
    await fetch("/api/pusher/trigger", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channel: channels.jobStatus(request.id), event: events.JOB_ACCEPTED, data: { requestId: request.id, assistantName: profile?.name } }) });
    router.push(`/job/${request.id}`);
  };

  const handleLogout = async () => {
    if (DEMO_MODE) { router.push("/"); return; }
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-[3px] border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>;

  return (
    <div className="page-container">
      <header className="page-header">
        <div className="flex items-center justify-between">
          <div><h1 className="font-bold text-lg">Hey, {profile?.name?.split(" ")[0]} 👷</h1><p className="text-sm text-gray-500">Camp Assistant</p></div>
          <button onClick={handleLogout} className="text-gray-400 hover:text-gray-600"><LogOut size={18} /></button>
        </div>
      </header>
      <div className="px-4 py-6 space-y-4">
        <div className={`rounded-2xl p-5 transition-colors ${isAvailable ? "bg-orange-500" : "bg-gray-100"}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`font-bold text-lg ${isAvailable ? "text-white" : "text-gray-700"}`}>{isAvailable ? "You are Available" : "You are Off Duty"}</p>
              <p className={`text-sm mt-0.5 ${isAvailable ? "text-white/70" : "text-gray-500"}`}>{isAvailable ? "New jobs will be sent to you" : "Toggle on to receive jobs"}</p>
            </div>
            <button onClick={toggleAvailability} disabled={toggling}>
              {isAvailable ? <ToggleRight size={48} className="text-white" /> : <ToggleLeft size={48} className="text-gray-400" />}
            </button>
          </div>
        </div>
        {activeJob && (
          <Link href={`/job/${activeJob.id}`} className="card block border-2 border-primary-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2"><p className="font-bold text-sm text-primary-700">Active Job</p><StatusBadge status={activeJob.status} /></div>
            <p className="font-semibold text-gray-900">{getRequestTypeLabel(activeJob.type)}</p>
            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1"><MapPin size={12} /><span>{activeJob.location_description}</span></div>
            <p className="text-xs text-primary-600 font-medium mt-3">Tap to continue →</p>
          </Link>
        )}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-gray-900 text-sm">Available Jobs</p>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">{pendingJobs.length} waiting</span>
          </div>
          {!isAvailable ? (
            <div className="card text-center py-6 text-gray-400"><Briefcase size={32} className="mx-auto mb-2" /><p className="text-sm">Toggle available to see and accept jobs</p></div>
          ) : pendingJobs.length === 0 ? (
            <div className="card text-center py-6 text-gray-400"><Clock size={32} className="mx-auto mb-2" /><p className="text-sm">No pending jobs right now.</p></div>
          ) : (
            <div className="space-y-3">
              {pendingJobs.map(job => (
                <div key={job.id} className="card">
                  <div className="flex items-start justify-between mb-2">
                    <div><p className="font-semibold text-sm text-gray-900">{getRequestTypeLabel(job.type)}</p><p className="text-xs text-gray-400">{new Date(job.created_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</p></div>
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-medium">New</span>
                  </div>
                  <div className="flex items-start gap-1 text-xs text-gray-600 mb-3"><MapPin size={12} className="shrink-0 mt-0.5" /><span>{job.location_description}</span></div>
                  <div className="flex gap-2">
                    <button onClick={() => acceptJob(job)} className="flex-1 bg-orange-500 text-white text-sm font-semibold py-2 rounded-xl hover:bg-orange-600 transition-colors">Accept Job</button>
                    <button className="flex-1 bg-gray-100 text-gray-600 text-sm font-semibold py-2 rounded-xl hover:bg-gray-200 transition-colors">Pass</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <BottomNav role="assistant" />
    </div>
  );
}
''')

# ── JOB DETAIL ───────────────────────────────────────────────────────────────
write("app/(assistant)/job/[id]/page.tsx", '''\
"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import BottomNav from "@/components/ui/BottomNav";
import StatusBadge from "@/components/ui/StatusBadge";
import { AssistanceRequest } from "@/types";
import { channels, events } from "@/lib/pusher";
import { ArrowLeft, MapPin, Phone, CheckCircle, ChevronRight } from "lucide-react";
import { getRequestTypeLabel } from "@/lib/utils";
import { DEMO_MODE, DEMO_JOBS } from "@/lib/demo-data";

const STATUS_STEPS = [
  { from: "accepted", to: "in_progress", label: "Start Job" },
  { from: "in_progress", to: "complete", label: "Mark Complete" },
];

export default function ActiveJobPage() {
  const [request, setRequest] = useState<any>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [completed, setCompleted] = useState(false);
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    if (DEMO_MODE) {
      const job = DEMO_JOBS.find(j => j.id === params.id) || { ...DEMO_JOBS[0], status: "accepted" };
      setRequest({ ...job, status: "accepted" });
      setLoading(false);
      return;
    }
    const load = async () => {
      const { data } = await supabase.from("assistance_requests").select("*, camper:profiles!camper_id(name, phone)").eq("id", params.id).single();
      setRequest(data);
      setLoading(false);
    };
    load();
  }, [params.id]);

  const updateStatus = async (newStatus: string) => {
    if (!request) return;
    setUpdating(true);
    if (DEMO_MODE) {
      if (newStatus === "complete") { setCompleted(true); } else { setRequest((r: any) => ({ ...r, status: newStatus })); }
      setUpdating(false);
      return;
    }
    await supabase.from("assistance_requests").update({ status: newStatus, ...(notes ? { notes } : {}) }).eq("id", request.id);
    await fetch("/api/pusher/trigger", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channel: channels.jobStatus(request.id), event: newStatus === "complete" ? events.JOB_COMPLETE : events.JOB_STATUS_UPDATE, data: { requestId: request.id, status: newStatus } }) });
    if (newStatus === "complete") { setCompleted(true); } else { setRequest((r: any) => ({ ...r, status: newStatus })); }
    setUpdating(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-[3px] border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>;
  if (completed) return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4"><CheckCircle size={32} className="text-green-600" /></div>
      <h2 className="text-xl font-bold mb-2">Job Complete! 🎉</h2>
      <p className="text-gray-500 text-sm mb-8">The camper has been notified. Great work!</p>
      <Link href="/assistant-dashboard" className="btn-primary max-w-xs">Back to Dashboard</Link>
    </div>
  );
  if (!request) return <div className="min-h-screen flex items-center justify-center"><p>Job not found</p></div>;

  const currentStep = STATUS_STEPS.find(s => s.from === request.status);

  return (
    <div className="page-container">
      <header className="page-header">
        <div className="flex items-center gap-3">
          <Link href="/assistant-dashboard" className="text-gray-500"><ArrowLeft size={20} /></Link>
          <div><h1 className="font-bold text-lg">Active Job</h1><StatusBadge status={request.status} /></div>
        </div>
      </header>
      <div className="px-4 py-6 space-y-4">
        <div className="card"><p className="text-xs text-gray-400 mb-1">Job Type</p><p className="font-bold text-xl text-gray-900">{getRequestTypeLabel(request.type)}</p>{request.description && <p className="text-sm text-gray-600 mt-2">{request.description}</p>}</div>
        <div className="card"><div className="flex items-center gap-2 mb-2"><MapPin size={16} className="text-red-500 shrink-0" /><p className="font-semibold text-sm text-gray-900">Camper Location</p></div><p className="text-gray-700">{request.location_description}</p></div>
        {request.camper && (
          <div className="card">
            <p className="text-xs text-gray-400 mb-3">Camper Details</p>
            <p className="font-semibold text-sm mb-2">{request.camper.name}</p>
            {request.camper.phone && <a href={`tel:${request.camper.phone}`} className="flex items-center gap-2 text-primary-600 text-sm font-medium hover:underline"><Phone size={14} /> {request.camper.phone}</a>}
          </div>
        )}
        <div className="card">
          <p className="text-sm font-semibold text-gray-900 mb-3">Progress</p>
          {["accepted", "in_progress", "complete"].map((status, i) => (
            <div key={status} className="flex items-center gap-3 mb-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${["accepted","in_progress","complete"].slice(0, ["accepted","in_progress","complete"].indexOf(request.status)+1).includes(status) ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-400"}`}>{i + 1}</div>
              <span className="text-sm capitalize">{status.replace("_", " ")}</span>
            </div>
          ))}
        </div>
        <textarea className="input resize-none" rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Job notes (optional)..." />
        {currentStep && (
          <button onClick={() => updateStatus(currentStep.to)} disabled={updating}
            className="btn-primary bg-orange-500 hover:bg-orange-600 flex items-center justify-center gap-2">
            {updating ? "Updating..." : <>{currentStep.label}<ChevronRight size={18} /></>}
          </button>
        )}
      </div>
      <BottomNav role="assistant" />
    </div>
  );
}
''')

# ── JOB HISTORY ──────────────────────────────────────────────────────────────
write("app/(assistant)/job-history/page.tsx", '''\
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import BottomNav from "@/components/ui/BottomNav";
import StarRating from "@/components/ui/StarRating";
import { AssistanceRequest } from "@/types";
import { ArrowLeft, History } from "lucide-react";
import { getRequestTypeLabel } from "@/lib/utils";
import { DEMO_MODE, DEMO_COMPLETED_JOBS } from "@/lib/demo-data";

export default function JobHistoryPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    if (DEMO_MODE) { setJobs(DEMO_COMPLETED_JOBS); setLoading(false); return; }
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data } = await supabase.from("assistance_requests").select("*, camper:profiles!camper_id(name)").eq("assigned_assistant_id", user.id).eq("status", "complete").order("created_at", { ascending: false });
      setJobs(data || []);
      setLoading(false);
    };
    load();
  }, []);

  const totalRated = jobs.filter(j => j.rating).length;
  const avgRating = totalRated > 0 ? (jobs.reduce((s, j) => s + (j.rating || 0), 0) / totalRated).toFixed(1) : "—";

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-[3px] border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>;

  return (
    <div className="page-container">
      <header className="page-header">
        <div className="flex items-center gap-3"><Link href="/assistant-dashboard" className="text-gray-500"><ArrowLeft size={20} /></Link><h1 className="font-bold text-lg">Job History</h1></div>
      </header>
      <div className="px-4 py-6 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="card text-center"><p className="text-3xl font-bold text-orange-500">{jobs.length}</p><p className="text-xs text-gray-500 mt-1">Jobs completed</p></div>
          <div className="card text-center"><p className="text-3xl font-bold text-yellow-500">{avgRating}</p><p className="text-xs text-gray-500 mt-1">Average rating</p></div>
        </div>
        {jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center"><History size={48} className="text-gray-200 mb-4" /><p className="text-gray-500 text-sm">No completed jobs yet.</p></div>
        ) : (
          <div className="space-y-3">
            {jobs.map(job => (
              <div key={job.id} className="card">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{getRequestTypeLabel(job.type)}</p>
                    <p className="text-xs text-gray-400">{new Date(job.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</p>
                  </div>
                  {job.rating && <StarRating value={job.rating} readonly />}
                </div>
                <p className="text-xs text-gray-500">Camper: {job.camper?.name}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      <BottomNav role="assistant" />
    </div>
  );
}
''')

# ── ADMIN ────────────────────────────────────────────────────────────────────
write("app/(admin)/admin/page.tsx", '''\
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import StatusBadge from "@/components/ui/StatusBadge";
import { Booking, AssistanceRequest, Profile, Festival, MapPOI, POICategory } from "@/types";
import { LayoutDashboard, Tent, HelpCircle, Users, Map, Plus, Trash2, LogOut } from "lucide-react";
import { getRequestTypeLabel, getPOICategoryIcon } from "@/lib/utils";
import { DEMO_MODE, DEMO_FESTIVAL, DEMO_ADMIN_BOOKINGS, DEMO_ADMIN_REQUESTS, DEMO_STAFF } from "@/lib/demo-data";

type Tab = "bookings" | "requests" | "staff" | "map";
const POI_CATEGORIES: POICategory[] = ["toilet", "stage", "bar", "food", "first_aid", "water", "other"];

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("bookings");
  const [bookings, setBookings] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [festival, setFestival] = useState<Festival | null>(null);
  const [pois, setPois] = useState<MapPOI[]>([]);
  const [newPOI, setNewPOI] = useState({ name: "", category: "toilet" as POICategory, lat: 500, lng: 500, notes: "" });
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    if (DEMO_MODE) {
      setBookings(DEMO_ADMIN_BOOKINGS as any[]);
      setRequests(DEMO_ADMIN_REQUESTS as any[]);
      setStaff(DEMO_STAFF);
      setFestival(DEMO_FESTIVAL as unknown as Festival);
      setPois((DEMO_FESTIVAL.map_pois || []) as unknown as MapPOI[]);
      setLoading(false);
      return;
    }
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const [{ data: festivalsData }, { data: bookingsData }, { data: requestsData }, { data: staffData }] = await Promise.all([
        supabase.from("festivals").select("*"),
        supabase.from("bookings").select("*, tent_type:tent_types(*), camper:profiles!camper_id(name, phone)").order("created_at", { ascending: false }),
        supabase.from("assistance_requests").select("*, camper:profiles!camper_id(name)").order("created_at", { ascending: false }),
        supabase.from("profiles").select("*").eq("role", "assistant"),
      ]);
      if (festivalsData?.[0]) { setFestival(festivalsData[0]); setPois(festivalsData[0].map_pois || []); }
      setBookings(bookingsData || []);
      setRequests(requestsData || []);
      setLoading(false);
    };
    load();
  }, []);

  const addPOI = async () => {
    if (!newPOI.name) return;
    const poi: MapPOI = { id: crypto.randomUUID(), ...newPOI };
    const updatedPois = [...pois, poi];
    setPois(updatedPois);
    if (!DEMO_MODE && festival) await supabase.from("festivals").update({ map_pois: updatedPois }).eq("id", festival.id);
    setNewPOI({ name: "", category: "toilet", lat: 500, lng: 500, notes: "" });
  };

  const removePOI = async (id: string) => {
    const updatedPois = pois.filter(p => p.id !== id);
    setPois(updatedPois);
    if (!DEMO_MODE && festival) await supabase.from("festivals").update({ map_pois: updatedPois }).eq("id", festival.id);
  };

  const handleLogout = async () => {
    if (DEMO_MODE) { router.push("/"); return; }
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-[3px] border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>;

  const tabs: { key: Tab; icon: any; label: string; count?: number }[] = [
    { key: "bookings", icon: Tent, label: "Bookings", count: bookings.length },
    { key: "requests", icon: HelpCircle, label: "Requests", count: requests.filter(r => r.status === "pending").length },
    { key: "staff", icon: Users, label: "Staff" },
    { key: "map", icon: Map, label: "Map" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      <div className="bg-white border-b border-gray-100 px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div className="flex items-center gap-2"><LayoutDashboard size={20} className="text-primary-600" /><h1 className="font-bold text-lg">Admin Panel</h1></div>
          <button onClick={handleLogout} className="text-gray-400 hover:text-gray-600"><LogOut size={18} /></button>
        </div>
        <div className="flex gap-1 mt-4 max-w-2xl mx-auto">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-xl text-xs font-medium transition-colors ${tab === t.key ? "bg-primary-600 text-white" : "text-gray-500 hover:bg-gray-50"}`}>
              <t.icon size={16} /><span>{t.label}</span>
              {t.count !== undefined && t.count > 0 && <span className={`text-[10px] px-1.5 rounded-full ${tab === t.key ? "bg-white text-primary-600" : "bg-primary-100 text-primary-700"}`}>{t.count}</span>}
            </button>
          ))}
        </div>
      </div>
      <div className="px-4 py-6 max-w-2xl mx-auto">
        {tab === "bookings" && (
          <div className="space-y-3">
            {bookings.map(b => (
              <div key={b.id} className="bg-white rounded-2xl border border-gray-100 p-4">
                <div className="flex items-start justify-between mb-2"><div><p className="font-semibold text-sm">{b.camper?.name}</p><p className="text-xs text-gray-400">{b.tent_type?.name}</p></div><StatusBadge status={b.status} /></div>
                <p className="text-xs text-gray-500">{b.arrival_date} → {b.departure_date}</p>
              </div>
            ))}
          </div>
        )}
        {tab === "requests" && (
          <div className="space-y-3">
            {requests.map(r => (
              <div key={r.id} className="bg-white rounded-2xl border border-gray-100 p-4">
                <div className="flex items-start justify-between mb-2"><div><p className="font-semibold text-sm">{getRequestTypeLabel(r.type)}</p><p className="text-xs text-gray-400">{r.camper?.name}</p></div><StatusBadge status={r.status} /></div>
                <p className="text-xs text-gray-600">{r.location_description}</p>
              </div>
            ))}
          </div>
        )}
        {tab === "staff" && (
          <div className="space-y-3">
            {staff.map((s: any) => (
              <div key={s.profile.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center justify-between">
                <div><p className="font-semibold text-sm">{s.profile.name}</p><p className="text-xs text-gray-400">{s.profile.phone}</p></div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${s.available ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{s.available ? "Available" : "Off Duty"}</span>
              </div>
            ))}
          </div>
        )}
        {tab === "map" && (
          <div className="space-y-4">
            <div className="card">
              <p className="text-sm font-semibold text-gray-900 mb-3">Add Map Pin</p>
              <div className="space-y-3">
                <input className="input" placeholder="Location name" value={newPOI.name} onChange={e => setNewPOI(p => ({ ...p, name: e.target.value }))} />
                <select className="input" value={newPOI.category} onChange={e => setNewPOI(p => ({ ...p, category: e.target.value as POICategory }))}>
                  {POI_CATEGORIES.map(cat => <option key={cat} value={cat}>{getPOICategoryIcon(cat)} {cat.replace("_", " ")}</option>)}
                </select>
                <input className="input" placeholder="Notes (optional)" value={newPOI.notes} onChange={e => setNewPOI(p => ({ ...p, notes: e.target.value }))} />
                <button onClick={addPOI} disabled={!newPOI.name} className="btn-primary flex items-center justify-center gap-2"><Plus size={16} /> Add Pin</button>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-900">Current Pins ({pois.length})</p>
              {pois.map(poi => (
                <div key={poi.id} className="bg-white rounded-xl border border-gray-100 p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2"><span>{getPOICategoryIcon(poi.category)}</span><div><p className="text-sm font-medium">{poi.name}</p>{poi.notes && <p className="text-xs text-gray-400">{poi.notes}</p>}</div></div>
                  <button onClick={() => removePOI(poi.id)} className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
''')

print("\nAll pages updated successfully!")
print("\nNext steps:")
print("  cd \"/Users/olasehindeomoriwo/Documents/Claude/Projects/Founder Lab/campAssist\"")
print("  git add -A")
print("  git commit -m \"Add demo mode to all pages\"")
print("  git push")
print("\nThen add NEXT_PUBLIC_DEMO_MODE=true to Vercel environment variables and redeploy.")
