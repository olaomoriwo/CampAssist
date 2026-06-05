"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import BottomNav from "@/components/ui/BottomNav";
import { TentType } from "@/types";
import { ArrowLeft, Tent, Users } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { DEMO_MODE, DEMO_TENT_TYPES, DEMO_PROFILE } from "@/lib/demo-data";
import { createClient } from "@/lib/supabase";

export default function BrowseTentsPage() {
  const [tents, setTents] = useState<TentType[]>([]);
  const [festivalId, setFestivalId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (DEMO_MODE) {
      setTents(DEMO_TENT_TYPES as unknown as TentType[]);
      setFestivalId(DEMO_PROFILE.festival_id);
      setLoading(false);
      return;
    }
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      setFestivalId(profileData?.festival_id ?? null);
      if (profileData?.festival_id) {
        const { data } = await supabase.from("tent_types").select("*").eq("festival_id", profileData.festival_id).gt("available_quantity", 0);
        setTents(data || []);
      }
      setLoading(false);
    };
    load();
  }, []);

  const filters = ["all","solo","friends","family","group"] as const;
  type Filter = typeof filters[number];
  const [filter, setFilter] = useState<Filter>("all");

  const catMap: Record<number, string> = {1:"solo",2:"friends",3:"friends",4:"family",5:"group"};
  const shown = filter === "all" ? tents : tents.filter((_,i) => catMap[i+1] === filter);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-[3px] border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>;

  return (
    <div className="page-container">
      <div className="page-header" style={{flexDirection:"column",gap:"8px",paddingBottom:"12px"}}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-bold text-lg">Book Your Tent</h1>
            <p className="text-xs text-gray-500">Reserve now · pay before the event</p>
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-full text-xs font-medium border-none cursor-pointer flex-shrink-0 ${filter===f?"bg-primary-600 text-white":"bg-gray-100 text-gray-700"}`}>
              {f.charAt(0).toUpperCase()+f.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <div className="px-4 py-4">
        {tents.length === 0 ? (
          <div className="card text-center py-8">
            <Tent size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No tents available yet.</p>
          </div>
        ) : (
          tents.map((tent, i) => {
            const colors = ["#7c3aed","#0891b2","#d97706","#16a34a","#db2777"];
            const bgs = ["#ede9fe","#e0f2fe","#fef3c7","#dcfce7","#fce7f3"];
            const emojis = ["🏕️","⛺","🛖","🏠","🏰"];
            const labels = ["Solo","2 People","Privacy Split","Family","Group 6"];
            const c = colors[i % colors.length];
            const bg = bgs[i % bgs.length];
            return (
              <Link key={tent.id} href={`/tents/${tent.id}`}
                className="block bg-white rounded-2xl border border-gray-100 mb-4 overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-24 flex items-center justify-between px-5" style={{background:bg}}>
                  <div>
                    <span className="text-xs font-semibold px-2 py-1 rounded-full text-white mb-2 inline-block" style={{background:c}}>{labels[i]}</span>
                    <div className="font-bold text-lg text-gray-900">{tent.name}</div>
                    <div className="text-xs text-gray-500">{tent.capacity} {tent.capacity===1?"person":"people"} · {formatCurrency(tent.price_per_day)}/night</div>
                  </div>
                  <div className="text-5xl">{emojis[i]}</div>
                </div>
                <div className="px-5 py-3 flex items-center justify-between">
                  <p className="text-xs text-gray-500 flex-1 mr-4 line-clamp-1">{tent.description}</p>
                  <span className="text-xs font-semibold text-white px-3 py-2 rounded-xl flex-shrink-0" style={{background:c}}>View →</span>
                </div>
              </Link>
            );
          })
        )}
      </div>
      <BottomNav role="camper" />
    </div>
  );
}
