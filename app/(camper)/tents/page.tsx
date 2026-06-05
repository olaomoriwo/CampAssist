"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import BottomNav from "@/components/ui/BottomNav";
import { TentType } from "@/types";
import { Tent, Users, Star } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { DEMO_MODE, DEMO_TENT_TYPES } from "@/lib/demo-data";
import { createClient } from "@/lib/supabase";

const TENT_META = [
  { color:"#7c3aed", bg:"#ede9fe", emoji:"🏕️", label:"Solo", tag:"Perfect for one" },
  { color:"#0891b2", bg:"#e0f2fe", emoji:"⛺", label:"2 People", tag:"Friends & couples" },
  { color:"#d97706", bg:"#fef3c7", emoji:"🛖", label:"Privacy Split", tag:"Best of both worlds" },
  { color:"#16a34a", bg:"#dcfce7", emoji:"🏠", label:"Family", tag:"Room for everyone" },
  { color:"#db2777", bg:"#fce7f3", emoji:"🏰", label:"Group", tag:"The festival HQ" },
];

export default function BrowseTentsPage() {
  const [tents, setTents] = useState<TentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const supabase = createClient();

  useEffect(() => {
    if (DEMO_MODE) {
      setTents(DEMO_TENT_TYPES as unknown as TentType[]);
      setLoading(false);
      return;
    }
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data: p } = await supabase.from("profiles").select("festival_id").eq("id", user.id).single();
      if (p?.festival_id) {
        const { data } = await supabase.from("tent_types").select("*").eq("festival_id", p.festival_id).gt("available_quantity", 0);
        setTents(data || []);
      }
      setLoading(false);
    };
    load();
  }, []);

  const filters = [
    { k: "all", l: "All Tents" },
    { k: "solo", l: "Solo" },
    { k: "friends", l: "Friends" },
    { k: "family", l: "Family" },
    { k: "group", l: "Group" },
  ];

  const catMap: Record<number, string> = { 1: "solo", 2: "friends", 3: "friends", 4: "family", 5: "group" };
  const shown = filter === "all" ? tents : tents.filter((_, i) => catMap[i + 1] === filter);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-[3px] border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>;

  return (
    <div className="page-container">
      <div className="page-header flex-col gap-3 pb-3" style={{alignItems:"flex-start"}}>
        <div>
          <h1 className="font-bold text-xl text-gray-900">Book Your Tent</h1>
          <p className="text-xs text-gray-500 mt-0.5">Pre-pitched on arrival · Pay before the festival</p>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 w-full scrollbar-hide">
          {filters.map(f => (
            <button key={f.k} onClick={() => setFilter(f.k)}
              className="flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all border"
              style={{ background: filter === f.k ? "#16a34a" : "#fff", color: filter === f.k ? "#fff" : "#374151", borderColor: filter === f.k ? "#16a34a" : "#e5e7eb" }}>
              {f.l}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {shown.map((tent, i) => {
          const meta = TENT_META[i] || TENT_META[0];
          const imgs = (tent as any).images as string[];
          return (
            <Link key={tent.id} href={`/tents/${tent.id}`}
              className="block bg-white rounded-3xl overflow-hidden shadow-sm border border-black/5 active:scale-98 transition-transform">
              {/* Image */}
              <div className="relative h-44 overflow-hidden" style={{ background: meta.bg }}>
                {imgs?.[0] ? (
                  <img src={imgs[0]} alt={tent.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl">{meta.emoji}</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                  <div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full text-white" style={{ background: meta.color }}>{meta.label}</span>
                    <h3 className="text-white font-bold text-lg mt-1">{tent.name}</h3>
                    <p className="text-white/70 text-xs">{meta.tag}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold text-lg">{formatCurrency(tent.price_per_day)}</p>
                    <p className="text-white/60 text-xs">per night</p>
                  </div>
                </div>
              </div>
              {/* Details strip */}
              <div className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Users size={12} /> {tent.capacity} {tent.capacity === 1 ? "person" : "people"}
                  </span>
                  <span className="text-xs text-gray-300">·</span>
                  <span className="text-xs text-gray-500">+ {formatCurrency(tent.damage_deposit)} deposit</span>
                </div>
                <span className="text-xs font-semibold text-white px-3 py-1.5 rounded-xl" style={{ background: meta.color }}>View →</span>
              </div>
            </Link>
          );
        })}

        {shown.length === 0 && (
          <div className="text-center py-16">
            <Tent size={48} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No tents available.</p>
          </div>
        )}
      </div>
      <BottomNav role="camper" />
    </div>
  );
}
