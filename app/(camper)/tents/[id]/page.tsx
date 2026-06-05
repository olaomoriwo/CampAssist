"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import BottomNav from "@/components/ui/BottomNav";
import { TentType } from "@/types";
import { ArrowLeft, Users, Shield, CheckCircle } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { DEMO_MODE, DEMO_TENT_TYPES, DEMO_PROFILE } from "@/lib/demo-data";

const TENT_META = [
  {color:"#7c3aed",bg:"#ede9fe",emoji:"🏕️",label:"Solo"},
  {color:"#0891b2",bg:"#e0f2fe",emoji:"⛺",label:"2 People"},
  {color:"#d97706",bg:"#fef3c7",emoji:"🛖",label:"Privacy Split"},
  {color:"#16a34a",bg:"#dcfce7",emoji:"🏠",label:"Family"},
  {color:"#db2777",bg:"#fce7f3",emoji:"🏰",label:"Group 6"},
];

export default function TentDetailPage() {
  const [tent, setTent] = useState<TentType | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [tab, setTab] = useState<"overview"|"features">("overview");
  const [loading, setLoading] = useState(true);
  const [booked, setBooked] = useState(false);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    if (DEMO_MODE) {
      const idx = DEMO_TENT_TYPES.findIndex(t => t.id === params.id);
      setTent(DEMO_TENT_TYPES[idx >= 0 ? idx : 0] as unknown as TentType);
      setProfile(DEMO_PROFILE);
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

  const idx = DEMO_TENT_TYPES.findIndex(t => t.id === (tent?.id || "tent-1"));
  const meta = TENT_META[Math.max(0, idx)] || TENT_META[0];
  const nights = profile?.arrival_date && profile?.departure_date
    ? Math.max(1, Math.ceil((new Date(profile.departure_date).getTime() - new Date(profile.arrival_date).getTime()) / 86400000))
    : 3;

  const handleBook = async () => {
    if (!tent || !profile) return;
    setBooking(true);
    setError("");
    if (DEMO_MODE) {
      setTimeout(() => { setBooked(true); setBooking(false); }, 800);
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
    setTimeout(() => router.push("/booking-confirmation"), 1200);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-[3px] border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>;
  if (!tent) return <div className="min-h-screen flex items-center justify-center"><p>Tent not found</p></div>;

  if (booked) return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
        <CheckCircle size={32} className="text-green-600" />
      </div>
      <h2 className="text-xl font-bold mb-2">Tent Reserved! 🏕️</h2>
      <p className="text-gray-500 text-sm">Redirecting to confirmation...</p>
    </div>
  );

  return (
    <div className="page-container">
      <header className="page-header">
        <Link href="/tents" className="text-gray-500"><ArrowLeft size={20} /></Link>
        <h1 className="font-bold text-lg">{tent.name}</h1>
      </header>
      <div style={{height:"140px",background:meta.bg}} className="flex items-center justify-between px-6">
        <div>
          <span className="text-xs font-semibold px-2 py-1 rounded-full text-white mb-2 inline-block" style={{background:meta.color}}>{meta.label}</span>
          <div className="font-bold text-xl text-gray-900">{tent.name}</div>
          <div className="text-xs text-gray-500">{tent.capacity} {tent.capacity===1?"person":"people"}</div>
        </div>
        <div className="text-6xl">{meta.emoji}</div>
      </div>
      <div className="flex border-b border-gray-100 bg-white">
        {(["overview","features"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="flex-1 py-3 text-sm border-none cursor-pointer"
            style={{fontWeight:tab===t?"600":"400",color:tab===t?meta.color:"#9ca3af",borderBottom:tab===t?`2px solid ${meta.color}`:"2px solid transparent",background:"transparent"}}>
            {t.charAt(0).toUpperCase()+t.slice(1)}
          </button>
        ))}
      </div>
      <div className="px-4 py-5 pb-28 space-y-4">
        {tab === "overview" ? (
          <>
            <div className="card"><p className="text-sm text-gray-600 leading-relaxed">{tent.description}</p></div>
            <div className="grid grid-cols-2 gap-3">
              {[["👥",tent.capacity+(tent.capacity===1?" person":" people"),"Capacity"],["💰",formatCurrency(tent.price_per_day)+"/night","Price"],["🛡️",formatCurrency(tent.damage_deposit),"Deposit"],["⭐","High","Privacy"]].map(([icon,val,lbl]) => (
                <div key={lbl as string} className="card text-center py-3">
                  <div className="text-xl mb-1">{icon}</div>
                  <div className="font-semibold text-sm">{val}</div>
                  <div className="text-xs text-gray-400">{lbl}</div>
                </div>
              ))}
            </div>
            <div className="card">
              <p className="text-sm font-semibold mb-3">Pricing summary</p>
              <div className="space-y-1">
                {[[`${nights} nights × ${formatCurrency(tent.price_per_day)}`,formatCurrency(tent.price_per_day*nights)],["Refundable deposit",formatCurrency(tent.damage_deposit)]].map(([l,v]) => (
                  <div key={l} className="flex justify-between text-sm"><span className="text-gray-500">{l}</span><span className="font-semibold">{v}</span></div>
                ))}
                <div className="flex justify-between text-sm font-bold border-t pt-2 mt-1">
                  <span>Total before festival</span><span style={{color:meta.color}}>{formatCurrency(tent.price_per_day*nights+tent.damage_deposit)}</span>
                </div>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-start gap-2">
              <Shield size={14} className="text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-700">Reservation only — payment details will be sent by email. Your tent is confirmed once payment is received.</p>
            </div>
          </>
        ) : (
          <>
            <div className="card">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Tent specification</p>
              {["Sleeping spaces for "+tent.capacity,"Waterproof flysheet (3000mm+)","Ventilated inner with mesh panels","Porch area for gear storage","Blackout inner lining","Setup handled by your assistant"].map(f => (
                <div key={f} className="flex items-center gap-2 py-2 border-b border-gray-50 last:border-0">
                  <CheckCircle size={14} style={{color:meta.color,flexShrink:0}} />
                  <span className="text-sm text-gray-700">{f}</span>
                </div>
              ))}
            </div>
            <div className="card bg-green-50 border-green-200">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">CampAssist service included</p>
              {["Professional tent pitch on arrival day","Tent collected by assistant when you leave","Assistant assigned 24hrs before your arrival","On-demand support throughout the festival"].map(f => (
                <div key={f} className="flex items-center gap-2 py-2 border-b border-green-100 last:border-0">
                  <CheckCircle size={14} className="text-green-600 flex-shrink-0" />
                  <span className="text-sm text-green-800">{f}</span>
                </div>
              ))}
            </div>
          </>
        )}
        {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>}
        <button onClick={handleBook} disabled={booking} className="btn-primary" style={{background:meta.color}}>
          {booking ? "Reserving..." : "Reserve This Tent"}
        </button>
      </div>
      <BottomNav role="camper" />
    </div>
  );
}
