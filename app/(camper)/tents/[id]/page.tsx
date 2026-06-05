"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import BottomNav from "@/components/ui/BottomNav";
import { TentType } from "@/types";
import { ArrowLeft, Shield, CheckCircle, ChevronLeft, ChevronRight, Minus, Plus } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { DEMO_MODE, DEMO_TENT_TYPES, DEMO_PROFILE, TENT_EXTRAS } from "@/lib/demo-data";

const TENT_META = [
  {color:"#7c3aed",bg:"#ede9fe",emoji:"🏕️",label:"Solo"},
  {color:"#0891b2",bg:"#e0f2fe",emoji:"⛺",label:"2 People"},
  {color:"#d97706",bg:"#fef3c7",emoji:"🛖",label:"Privacy Split"},
  {color:"#16a34a",bg:"#dcfce7",emoji:"🏠",label:"Family"},
  {color:"#db2777",bg:"#fce7f3",emoji:"🏰",label:"Group"},
];

export default function TentDetailPage() {
  const [tent, setTent] = useState<TentType | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [tab, setTab] = useState<"overview" | "features">("overview");
  const [imgIdx, setImgIdx] = useState(0);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [booked, setBooked] = useState(false);
  const [booking, setBooking] = useState(false);
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
      const [{ data: t }, { data: p }] = await Promise.all([
        supabase.from("tent_types").select("*").eq("id", params.id).single(),
        supabase.from("profiles").select("*").eq("id", user.id).single(),
      ]);
      setTent(t); setProfile(p); setLoading(false);
    };
    load();
  }, [params.id]);

  const idx = DEMO_TENT_TYPES.findIndex(t => t.id === (tent?.id || "tent-1"));
  const meta = TENT_META[Math.max(0, idx)] || TENT_META[0];
  const nights = profile?.arrival_date && profile?.departure_date
    ? Math.max(1, Math.ceil((new Date(profile.departure_date).getTime() - new Date(profile.arrival_date).getTime()) / 86400000)) : 3;
  const imgs: string[] = (tent as any)?.images || [];

  const extrasTotal = selectedExtras.reduce((sum, eid) => {
    const e = TENT_EXTRAS.find(x => x.id === eid);
    if (!e) return sum;
    return sum + (e.unit === "per night" ? e.price * nights : e.price);
  }, 0);

  const toggleExtra = (eid: string) => {
    setSelectedExtras(prev => prev.includes(eid) ? prev.filter(x => x !== eid) : [...prev, eid]);
  };

  const handleBook = async () => {
    if (!tent || !profile) return;
    setBooking(true);
    if (DEMO_MODE) { setTimeout(() => { setBooked(true); setBooking(false); }, 800); return; }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("bookings").insert({
      camper_id: user.id, tent_type_id: tent.id, festival_id: profile.festival_id,
      arrival_date: profile.arrival_date, departure_date: profile.departure_date,
      status: "pending", notes: selectedExtras.length ? `Extras: ${selectedExtras.join(",")}` : null,
    });
    if (error) { setBooking(false); return; }
    setBooked(true);
    setTimeout(() => router.push("/booking-confirmation"), 1200);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-[3px] border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>;
  if (!tent) return <div className="min-h-screen flex items-center justify-center"><p>Tent not found</p></div>;

  if (booked) return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4"><CheckCircle size={32} className="text-green-600" /></div>
      <h2 className="text-xl font-bold mb-2">Tent Reserved! 🏕️</h2>
      <p className="text-gray-500 text-sm">Redirecting...</p>
    </div>
  );

  return (
    <div className="page-container">
      {/* Image carousel */}
      <div className="relative" style={{ height: "260px", background: meta.bg }}>
        {imgs.length > 0 ? (
          <>
            <img src={imgs[imgIdx]} alt={tent.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
            {imgs.length > 1 && (
              <>
                <button onClick={() => setImgIdx(i => Math.max(0, i - 1))}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20">
                  <ChevronLeft size={18} className="text-white" />
                </button>
                <button onClick={() => setImgIdx(i => Math.min(imgs.length - 1, i + 1))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20">
                  <ChevronRight size={18} className="text-white" />
                </button>
                <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {imgs.map((_, i) => (
                    <div key={i} onClick={() => setImgIdx(i)} className="w-1.5 h-1.5 rounded-full cursor-pointer transition-all"
                      style={{ background: i === imgIdx ? "#fff" : "rgba(255,255,255,0.4)" }} />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-7xl">{meta.emoji}</div>
        )}
        {/* Back button */}
        <Link href="/tents" className="absolute top-12 left-4 w-9 h-9 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20">
          <ArrowLeft size={18} className="text-white" />
        </Link>
        {/* Title overlay */}
        <div className="absolute bottom-4 left-4 right-4">
          <span className="text-xs font-bold px-2.5 py-1 rounded-full text-white inline-block mb-1" style={{ background: meta.color }}>{meta.label}</span>
          <h1 className="text-white font-bold text-2xl">{tent.name}</h1>
          <p className="text-white/70 text-sm">{tent.capacity} {tent.capacity === 1 ? "person" : "people"}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white border-b border-gray-100">
        {(["overview", "features"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="flex-1 py-3.5 text-sm font-semibold transition-all border-none"
            style={{ color: tab === t ? meta.color : "#9ca3af", borderBottom: tab === t ? `2.5px solid ${meta.color}` : "2.5px solid transparent", background: "transparent" }}>
            {t === "overview" ? "Overview" : "What's Included"}
          </button>
        ))}
      </div>

      <div className="px-4 py-5 pb-32 space-y-4">
        {tab === "overview" ? (
          <>
            <div className="card">
              <p className="text-sm text-gray-600 leading-relaxed">{tent.description}</p>
            </div>
            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Capacity", value: tent.capacity + (tent.capacity === 1 ? " person" : " people"), icon: "👥" },
                { label: "Privacy", value: idx >= 2 ? "High" : idx >= 1 ? "Medium" : "Full", icon: "🔒" },
              ].map(s => (
                <div key={s.label} className="card text-center py-4">
                  <div className="text-2xl mb-1">{s.icon}</div>
                  <div className="font-bold text-base text-gray-900">{s.value}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
            {/* Pricing */}
            <div className="card">
              <p className="text-sm font-bold text-gray-900 mb-3">Pricing</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm"><span className="text-gray-500">{nights} nights × {formatCurrency(tent.price_per_day)}</span><span className="font-semibold">{formatCurrency(tent.price_per_day * nights)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Refundable deposit</span><span className="font-semibold text-blue-600">{formatCurrency(tent.damage_deposit)}</span></div>
                {extrasTotal > 0 && <div className="flex justify-between text-sm"><span className="text-gray-500">Extras</span><span className="font-semibold text-purple-600">{formatCurrency(extrasTotal)}</span></div>}
                <div className="flex justify-between text-sm font-bold border-t border-gray-100 pt-2 mt-1">
                  <span>Total before festival</span>
                  <span style={{ color: meta.color }}>{formatCurrency(tent.price_per_day * nights + tent.damage_deposit + extrasTotal)}</span>
                </div>
              </div>
            </div>

            {/* ── EXTRAS ── */}
            <div>
              <p className="text-sm font-bold text-gray-900 mb-3">Add Extras</p>
              <div className="space-y-3">
                {TENT_EXTRAS.map(extra => {
                  const selected = selectedExtras.includes(extra.id);
                  return (
                    <div key={extra.id} onClick={() => toggleExtra(extra.id)}
                      className="cursor-pointer rounded-2xl border-2 p-4 transition-all"
                      style={{ borderColor: selected ? meta.color : "#e5e7eb", background: selected ? `${meta.color}08` : "#fff" }}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">{extra.emoji}</span>
                          <div>
                            <p className="text-sm font-bold text-gray-900">{extra.name}</p>
                            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{extra.desc}</p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-bold" style={{ color: meta.color }}>{formatCurrency(extra.price)}</p>
                          <p className="text-xs text-gray-400">{extra.unit}</p>
                        </div>
                      </div>
                      {selected && (
                        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100">
                          <CheckCircle size={14} style={{ color: meta.color }} />
                          <span className="text-xs font-semibold" style={{ color: meta.color }}>Added to your booking</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-2xl px-4 py-3 flex items-start gap-2">
              <Shield size={14} className="text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-700 leading-relaxed">Reservation only — payment details sent by email before the festival. Your tent is confirmed once payment is received.</p>
            </div>
          </>
        ) : (
          <>
            <div className="card">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Tent Specification</p>
              {["Sleeping spaces for " + tent.capacity, "3000mm+ waterproof flysheet", "Ventilated inner with mesh panels", "Porch storage area for gear", "Blackout inner lining"].map(f => (
                <div key={f} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
                  <CheckCircle size={15} style={{ color: meta.color, flexShrink: 0 }} />
                  <span className="text-sm text-gray-700">{f}</span>
                </div>
              ))}
            </div>
            <div className="rounded-2xl p-4 border border-green-200" style={{ background: "#f0fdf4" }}>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">CampAssist Service</p>
              {["Assistant pre-pitches tent before you arrive", "Tent collected when you leave — just notify us", "Assistant assigned 24hrs before your arrival", "On-demand support throughout the festival"].map(f => (
                <div key={f} className="flex items-start gap-3 py-2.5 border-b border-green-100 last:border-0">
                  <CheckCircle size={15} className="text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-green-800">{f}</span>
                </div>
              ))}
            </div>
          </>
        )}

        <button onClick={handleBook} disabled={booking} className="btn-primary" style={{ background: `linear-gradient(135deg, ${meta.color}, ${meta.color}dd)`, boxShadow: `0 4px 14px ${meta.color}40` }}>
          {booking ? "Reserving..." : `Reserve ${tent.name}${selectedExtras.length > 0 ? ` + ${selectedExtras.length} extra${selectedExtras.length > 1 ? "s" : ""}` : ""}`}
        </button>
      </div>
      <BottomNav role="camper" />
    </div>
  );
}
