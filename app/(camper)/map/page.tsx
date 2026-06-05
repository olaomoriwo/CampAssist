"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import BottomNav from "@/components/ui/BottomNav";
import { Festival, MapPOI, POICategory } from "@/types";
import { getPOICategoryIcon } from "@/lib/utils";
import { DEMO_MODE, DEMO_FESTIVAL, VENDOR_REVIEWS } from "@/lib/demo-data";
import { Star, MessageSquare, Send, MapPin } from "lucide-react";

const FestivalMap = dynamic(() => import("@/components/camper/FestivalMap"), { ssr: false });

const CATS: { value: POICategory | "all"; label: string; icon: string }[] = [
  { value: "all", label: "All", icon: "📍" },
  { value: "food", label: "Food", icon: "🍔" },
  { value: "bar", label: "Bars", icon: "🍺" },
  { value: "stage", label: "Stages", icon: "🎵" },
  { value: "toilet", label: "Toilets", icon: "🚽" },
  { value: "first_aid", label: "First Aid", icon: "🏥" },
  { value: "water", label: "Water", icon: "💧" },
  { value: "other", label: "More", icon: "🎮" },
];

export default function MapPage() {
  const [festival, setFestival] = useState<Festival | null>(null);
  const [cat, setCat] = useState<POICategory | "all">("all");
  const [selPOI, setSelPOI] = useState<MapPOI | null>(null);
  const [view, setView] = useState<"map" | "list">("map");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"nearest" | "rated" | "popular">("nearest");
  const [loading, setLoading] = useState(true);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [localReviews, setLocalReviews] = useState<Record<string, { id: string; user: string; rating: number; comment: string; date: string }[]>>(VENDOR_REVIEWS);
  const supabase = createClient();

  useEffect(() => {
    if (DEMO_MODE) { setFestival(DEMO_FESTIVAL as unknown as Festival); setLoading(false); return; }
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data: p } = await supabase.from("profiles").select("festival_id").eq("id", user.id).single();
      if (p?.festival_id) {
        const { data } = await supabase.from("festivals").select("*").eq("id", p.festival_id).single();
        setFestival(data);
      }
      setLoading(false);
    };
    load();
  }, []);

  const allPois: MapPOI[] = (festival?.map_pois || []) as MapPOI[];
  const filtered = allPois.filter(p => {
    const mc = cat === "all" || p.category === cat;
    const q = query.toLowerCase();
    const mq = !q || p.name.toLowerCase().includes(q) || p.category.includes(q) || (p.notes || "").toLowerCase().includes(q);
    return mc && mq;
  });

  const submitReview = () => {
    if (!selPOI || newRating === 0 || !newComment.trim()) return;
    const review = { id: Date.now().toString(), user: "Ola O.", rating: newRating, comment: newComment.trim(), date: new Date().toISOString().split("T")[0] };
    setLocalReviews(prev => ({ ...prev, [selPOI.id]: [review, ...(prev[selPOI.id] || [])] }));
    setNewRating(0);
    setNewComment("");
  };

  const getAvgRating = (poiId: string) => {
    const reviews = localReviews[poiId] || [];
    if (!reviews.length) return null;
    return (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-[3px] border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>;

  return (
    <div className="page-container">
      <div className="page-header flex-col gap-2 pb-2.5" style={{ alignItems: "flex-start" }}>
        <div className="flex items-center justify-between w-full">
          <div>
            <h1 className="font-bold text-xl">Festival Map</h1>
            <p className="text-xs text-gray-500">{festival?.name || "No festival selected"}</p>
          </div>
          <div className="flex gap-1.5">
            {(["map", "list"] as const).map(v => (
              <button key={v} onClick={() => setView(v)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border"
                style={{ background: view === v ? "#16a34a" : "#fff", color: view === v ? "#fff" : "#374151", borderColor: view === v ? "#16a34a" : "#e5e7eb" }}>
                {v === "map" ? "🗺️ Map" : "📋 List"}
              </button>
            ))}
          </div>
        </div>
        {view === "list" && (
          <div className="relative w-full">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
            <input value={query} onChange={e => setQuery(e.target.value)}
              className="w-full border border-gray-200 rounded-2xl py-2.5 pl-9 pr-3 text-sm bg-white outline-none"
              placeholder='Search: "burger", "barber", "jazz"...' />
          </div>
        )}
        <div className="flex gap-2 overflow-x-auto pb-1 w-full scrollbar-hide">
          {CATS.map(c => (
            <button key={c.value} onClick={() => setCat(c.value)}
              className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border"
              style={{ background: cat === c.value ? "#16a34a" : "#fff", color: cat === c.value ? "#fff" : "#374151", borderColor: cat === c.value ? "#16a34a" : "#e5e7eb" }}>
              {c.icon} {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* MAP VIEW */}
      {view === "map" && (
        <div className="px-4 pt-3 pb-24">
          <div className="rounded-3xl overflow-hidden shadow-md" style={{ height: "340px" }}>
            {festival ? (
              <FestivalMap festival={festival} pois={filtered} onSelectPOI={setSelPOI} />
            ) : (
              <div className="h-full bg-green-50 flex items-center justify-center">
                <p className="text-gray-400 text-sm">No map available</p>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-400 text-center mt-2 mb-4">
            Real map · Margam Park, Wales · Tap any pin for details
          </p>

          {/* Selected POI detail + reviews */}
          {selPOI && (
            <div className="bg-white rounded-3xl shadow-lg border border-black/5 overflow-hidden">
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: "#f3f4f6" }}>
                    {getPOICategoryIcon(selPOI.category)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-base text-gray-900">{selPOI.name}</h3>
                    <p className="text-xs text-gray-400 capitalize">{selPOI.category.replace("_", " ")}</p>
                    {selPOI.notes && <p className="text-xs text-gray-600 mt-1">{selPOI.notes}</p>}
                    {getAvgRating(selPOI.id) && (
                      <div className="flex items-center gap-1 mt-1.5">
                        <Star size={12} className="text-yellow-400 fill-yellow-400" />
                        <span className="text-xs font-semibold text-gray-700">{getAvgRating(selPOI.id)}</span>
                        <span className="text-xs text-gray-400">({(localReviews[selPOI.id] || []).length} reviews)</span>
                      </div>
                    )}
                  </div>
                  <button onClick={() => setSelPOI(null)} className="text-gray-300 hover:text-gray-500 text-xl leading-none">✕</button>
                </div>

                {/* Reviews */}
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-bold text-gray-900 flex items-center gap-1.5"><MessageSquare size={14} className="text-gray-400" /> Reviews</p>
                  </div>
                  {/* Write review */}
                  <div className="bg-gray-50 rounded-2xl p-3 mb-3">
                    <p className="text-xs font-semibold text-gray-600 mb-2">Leave a review</p>
                    <div className="flex gap-1 mb-2">
                      {[1,2,3,4,5].map(s => (
                        <button key={s} onClick={() => setNewRating(s)} className="text-2xl transition-transform hover:scale-110">
                          <span style={{ color: s <= newRating ? "#f59e0b" : "#e5e7eb" }}>★</span>
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input value={newComment} onChange={e => setNewComment(e.target.value)}
                        className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-xs bg-white outline-none"
                        placeholder="Share your experience..." />
                      <button onClick={submitReview} disabled={newRating === 0 || !newComment.trim()}
                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-40"
                        style={{ background: "linear-gradient(135deg, #16a34a, #15803d)" }}>
                        <Send size={14} className="text-white" />
                      </button>
                    </div>
                  </div>
                  {/* Review list */}
                  <div className="space-y-3 max-h-52 overflow-y-auto">
                    {(localReviews[selPOI.id] || []).length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-4">No reviews yet. Be the first!</p>
                    ) : (
                      (localReviews[selPOI.id] || []).map(r => (
                        <div key={r.id} className="bg-white rounded-2xl p-3 border border-gray-100">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-gray-800">{r.user}</span>
                            <div className="flex">
                              {[1,2,3,4,5].map(s => (
                                <span key={s} style={{ color: s <= r.rating ? "#f59e0b" : "#e5e7eb", fontSize: "12px" }}>★</span>
                              ))}
                            </div>
                          </div>
                          <p className="text-xs text-gray-600 leading-relaxed">{r.comment}</p>
                          <p className="text-xs text-gray-300 mt-1">{r.date}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <Link href="/request-help">
                  <button className="w-full mt-3 border border-primary-500 text-primary-600 text-xs font-semibold py-2.5 rounded-2xl bg-white">
                    Request assistant to guide me here
                  </button>
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* LIST VIEW */}
      {view === "list" && (
        <div className="px-4 py-3 pb-24">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-500">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
            <select value={sort} onChange={e => setSort(e.target.value as any)}
              className="text-xs border border-gray-200 rounded-xl px-2.5 py-1.5 bg-white outline-none font-medium">
              <option value="nearest">Nearest first</option>
              <option value="rated">Best rated</option>
              <option value="popular">Most reviewed</option>
            </select>
          </div>
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">🔍</div>
              <p className="text-sm text-gray-400 mb-4">No results for &quot;{query}&quot;</p>
              <button onClick={() => { setQuery(""); setCat("all"); }}
                className="text-xs text-primary-600 font-semibold px-4 py-2 bg-primary-50 rounded-xl">Clear search</button>
            </div>
          ) : filtered.map(p => {
            const avg = getAvgRating(p.id);
            const reviewCount = (localReviews[p.id] || []).length;
            return (
              <div key={p.id} onClick={() => { setSelPOI(selPOI?.id === p.id ? null : p); }}
                className="bg-white rounded-2xl border border-black/5 p-4 mb-3 cursor-pointer shadow-sm active:scale-98 transition-transform">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 bg-gray-50">{getPOICategoryIcon(p.category)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-sm text-gray-900">{p.name}</p>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 bg-green-100 text-green-700">Open</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 capitalize">{p.category.replace("_", " ")}</p>
                    {p.notes && <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{p.notes}</p>}
                    <div className="flex items-center gap-3 mt-1.5">
                      {avg ? (
                        <span className="text-xs text-gray-600 flex items-center gap-0.5">
                          <span style={{ color: "#f59e0b" }}>★</span> {avg} ({reviewCount})
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">No reviews yet</span>
                      )}
                    </div>
                  </div>
                </div>
                {selPOI?.id === p.id && (
                  <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                    <div className="flex gap-2">
                      <button onClick={e => { e.stopPropagation(); window.open(`https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}&travelmode=walking`); }}
                        className="flex-1 bg-blue-600 text-white text-xs font-bold py-2.5 rounded-xl">📍 Navigate with Google Maps</button>
                    </div>
                    <div className="flex gap-1 mt-2">
                      {[1,2,3,4,5].map(s => (
                        <button key={s} onClick={e => { e.stopPropagation(); setNewRating(s); }} className="text-xl">
                          <span style={{ color: s <= newRating ? "#f59e0b" : "#e5e7eb" }}>★</span>
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input value={newComment} onChange={e => setNewComment(e.target.value)}
                        onClick={e => e.stopPropagation()}
                        className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-xs bg-white outline-none"
                        placeholder="Leave a review..." />
                      <button onClick={e => { e.stopPropagation(); submitReview(); }} disabled={newRating === 0 || !newComment.trim()}
                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-40"
                        style={{ background: "linear-gradient(135deg, #16a34a, #15803d)" }}>
                        <Send size={13} className="text-white" />
                      </button>
                    </div>
                    {(localReviews[p.id] || []).slice(0, 2).map(r => (
                      <div key={r.id} className="bg-gray-50 rounded-xl p-2.5">
                        <div className="flex justify-between mb-1">
                          <span className="text-xs font-semibold">{r.user}</span>
                          <span style={{ fontSize: "11px" }}>{[1,2,3,4,5].map(s => <span key={s} style={{ color: s <= r.rating ? "#f59e0b" : "#e5e7eb" }}>★</span>)}</span>
                        </div>
                        <p className="text-xs text-gray-600">{r.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          <div className="bg-primary-50 rounded-2xl p-4 flex gap-3 items-center">
            <div className="w-9 h-9 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">👷</div>
            <div>
              <p className="text-xs font-bold text-primary-800">Can&apos;t find what you need?</p>
              <Link href="/request-help" className="text-xs text-primary-600 font-semibold">Ask a camp assistant to guide you →</Link>
            </div>
          </div>
        </div>
      )}
      <BottomNav role="camper" />
    </div>
  );
}
