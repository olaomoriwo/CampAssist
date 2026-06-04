"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import BottomNav from "@/components/ui/BottomNav";
import { Festival, MapPOI, POICategory } from "@/types";
import { ArrowLeft, MapPin } from "lucide-react";
import { getPOICategoryIcon, getPOICategoryLabel } from "@/lib/utils";

// Dynamically import map to avoid SSR issues with Leaflet
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

  const filteredPOIs = festival?.map_pois?.filter(
    poi => selectedCategory === "all" || poi.category === selectedCategory
  ) || [];

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-[3px] border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>;

  return (
    <div className="page-container">
      <header className="page-header">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-gray-500"><ArrowLeft size={20} /></Link>
          <div>
            <h1 className="font-bold text-lg">Festival Map</h1>
            {festival && <p className="text-xs text-gray-500">{festival.name}</p>}
          </div>
        </div>
      </header>

      {/* Category filter */}
      <div className="bg-white border-b border-gray-100 px-4 py-3">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat.value
                  ? "bg-primary-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Map */}
      <div className="px-4 pt-4" style={{ height: "calc(100vh - 220px)" }}>
        {!festival ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <MapPin size={48} className="text-gray-200 mb-4" />
            <p className="text-gray-500 text-sm">No festival map available yet.</p>
            <p className="text-gray-400 text-xs mt-1">The map will appear once your festival is set up.</p>
          </div>
        ) : !festival.map_image_url ? (
          <div className="h-full flex flex-col items-center justify-center text-center bg-green-50 rounded-2xl">
            <span className="text-6xl mb-4">🗺️</span>
            <p className="text-gray-700 font-semibold text-sm">Map coming soon</p>
            <p className="text-gray-500 text-xs mt-1 px-8">The festival site map is being set up. Check back closer to the event.</p>
          </div>
        ) : (
          <FestivalMap
            festival={festival}
            pois={filteredPOIs}
            onSelectPOI={setSelectedPOI}
          />
        )}
      </div>

      {/* POI detail bottom sheet */}
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
