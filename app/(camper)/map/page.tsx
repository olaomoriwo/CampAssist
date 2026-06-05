"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import BottomNav from "@/components/ui/BottomNav";
import { Festival, MapPOI, POICategory } from "@/types";
import { MapPin } from "lucide-react";
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
  const [mapView, setMapView] = useState<"list" | "visual">("list");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"nearest" | "rated" | "popular">("nearest");
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (DEMO_MODE) {
      setFestival(DEMO_FESTIVAL as unknown as Festival);
      setLoading(false);
      return;
    }
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

  const allPois: MapPOI[] = (festival?.map_pois || []) as MapPOI[];
  
  const filteredPOIs = allPois.filter(p => {
    const matchCat = selectedCategory === "all" || p.category === selectedCategory;
    const q = query.toLowerCase();
    const matchQuery = !q || p.name.toLowerCase().includes(q) || p.category.includes(q) || (p.notes || "").toLowerCase().includes(q);
    return matchCat && matchQuery;
  });

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-[3px] border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>;

  return (
    <div className="page-container">
      <div className="page-header" style={{flexDirection:"column",gap:"8px",paddingBottom:"10px"}}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-bold text-lg">Festival Map</h1>
            <p className="text-xs text-gray-500">{festival?.name || "No festival"}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setMapView("list")} className={`px-3 py-1 rounded-lg text-xs font-medium border-none cursor-pointer ${mapView==="list"?"bg-primary-600 text-white":"bg-gray-100 text-gray-600"}`}>List</button>
            <button onClick={() => setMapView("visual")} className={`px-3 py-1 rounded-lg text-xs font-medium border-none cursor-pointer ${mapView==="visual"?"bg-primary-600 text-white":"bg-gray-100 text-gray-600"}`}>Map</button>
          </div>
        </div>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input value={query} onChange={e => setQuery(e.target.value)}
            className="w-full border border-gray-200 rounded-xl py-2 pl-8 pr-3 text-sm bg-white outline-none"
            placeholder='Search: "burger", "barber", "games", "shower"...'/>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map(c => (
            <button key={c.value} onClick={() => setSelectedCategory(c.value)}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium border-none cursor-pointer ${selectedCategory===c.value?"bg-primary-600 text-white":"bg-gray-100 text-gray-600"}`}>
              {c.icon} {c.label}
            </button>
          ))}
        </div>
      </div>

      {mapView === "list" ? (
        <div className="px-4 py-3 pb-24">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-500">{filteredPOIs.length} result{filteredPOIs.length!==1?"s":""}{query ? ` for "${query}"` : ""}</span>
            <select value={sort} onChange={e => setSort(e.target.value as any)}
              className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white">
              <option value="nearest">Nearest first</option>
              <option value="rated">Best rated</option>
              <option value="popular">Most popular</option>
            </select>
          </div>
          {filteredPOIs.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <div className="text-4xl mb-3">🔍</div>
              <p className="text-sm mb-4">No results for &quot;{query}&quot;</p>
              <button onClick={() => { setQuery(""); setSelectedCategory("all"); }} className="text-xs text-primary-600 font-medium">Clear search</button>
              <div className="mt-4">
                <Link href="/request-help" className="text-xs bg-primary-600 text-white px-4 py-2 rounded-xl">Ask a camp assistant instead</Link>
              </div>
            </div>
          ) : (
            filteredPOIs.map(p => {
              const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}&travelmode=walking`;
              return (
                <div key={p.id} onClick={() => setSelectedPOI(selectedPOI?.id === p.id ? null : p)}
                  className="bg-white rounded-2xl border border-gray-100 p-3 mb-3 cursor-pointer">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 bg-gray-50">{getPOICategoryIcon(p.category)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-gray-900">{p.name}</div>
                      <div className="text-xs text-gray-400 capitalize">{p.category.replace("_"," ")}</div>
                      {p.notes && <div className="text-xs text-gray-500 mt-1">{p.notes}</div>}
                    </div>
                  </div>
                  {selectedPOI?.id === p.id && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <a href={mapsUrl} target="_blank" rel="noreferrer">
                        <button className="w-full bg-blue-600 text-white text-sm font-semibold py-2 rounded-xl flex items-center justify-center gap-2">
                          <span>📍</span> Navigate with Google Maps
                        </button>
                      </a>
                      <Link href="/request-help">
                        <button className="w-full mt-2 border border-primary-500 text-primary-600 text-xs font-semibold py-2 rounded-xl bg-white">
                          Request assistant to guide me
                        </button>
                      </Link>
                    </div>
                  )}
                </div>
              );
            })
          )}
          <div className="bg-primary-50 rounded-2xl p-4 flex gap-3 items-start mt-2">
            <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">👷</div>
            <div>
              <p className="text-xs font-semibold text-primary-800">Can&apos;t find what you need?</p>
              <Link href="/request-help" className="text-xs text-primary-600 font-semibold">Ask a camp assistant to guide you →</Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="px-4 py-3 pb-24">
          {festival ? (
            <div className="rounded-2xl overflow-hidden" style={{height:"320px"}}>
              <FestivalMap festival={festival} pois={filteredPOIs} onSelectPOI={setSelectedPOI} />
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center bg-green-50 rounded-2xl">
              <p className="text-gray-400 text-sm">No map available</p>
            </div>
          )}
          <p className="text-xs text-gray-400 text-center mt-2">Tap any pin for details and Google Maps navigation</p>
          {selectedPOI && (
            <div className="bg-white rounded-2xl border border-gray-100 p-4 mt-3">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">{getPOICategoryIcon(selectedPOI.category)}</span>
                <div>
                  <p className="font-semibold text-sm">{selectedPOI.name}</p>
                  {selectedPOI.notes && <p className="text-xs text-gray-400">{selectedPOI.notes}</p>}
                </div>
                <button onClick={() => setSelectedPOI(null)} className="ml-auto text-gray-400 text-lg bg-none border-none cursor-pointer">✕</button>
              </div>
              <a href={`https://www.google.com/maps/dir/?api=1&destination=${selectedPOI.lat},${selectedPOI.lng}&travelmode=walking`} target="_blank" rel="noreferrer">
                <button className="w-full bg-blue-600 text-white text-sm font-semibold py-2 rounded-xl">📍 Navigate with Google Maps</button>
              </a>
            </div>
          )}
        </div>
      )}

      <BottomNav role="camper" />
    </div>
  );
}
