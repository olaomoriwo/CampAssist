"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import StatusBadge from "@/components/ui/StatusBadge";
import { Booking, AssistanceRequest, Profile, Festival, MapPOI, POICategory } from "@/types";
import { LayoutDashboard, Tent, HelpCircle, Users, Map, Plus, Trash2, LogOut } from "lucide-react";
import { getRequestTypeLabel, getPOICategoryIcon } from "@/lib/utils";

type Tab = "bookings" | "requests" | "staff" | "map";

const POI_CATEGORIES: POICategory[] = ["toilet", "stage", "bar", "food", "first_aid", "water", "other"];

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("bookings");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [requests, setRequests] = useState<AssistanceRequest[]>([]);
  const [staff, setStaff] = useState<{ profile: Profile; available: boolean }[]>([]);
  const [festival, setFestival] = useState<Festival | null>(null);
  const [festivals, setFestivals] = useState<Festival[]>([]);
  const [pois, setPois] = useState<MapPOI[]>([]);
  const [newPOI, setNewPOI] = useState({ name: "", category: "toilet" as POICategory, lat: 500, lng: 500, notes: "" });
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const [{ data: festivalsData }, { data: bookingsData }, { data: requestsData }, { data: staffData }] = await Promise.all([
        supabase.from("festivals").select("*"),
        supabase.from("bookings").select("*, tent_type:tent_types(*), camper:profiles!camper_id(name, phone)").order("created_at", { ascending: false }),
        supabase.from("assistance_requests").select("*, camper:profiles!camper_id(name)").order("created_at", { ascending: false }),
        supabase.from("profiles").select("*").eq("role", "assistant"),
      ]);

      setFestivals(festivalsData || []);
      if (festivalsData?.[0]) {
        setFestival(festivalsData[0]);
        setPois(festivalsData[0].map_pois || []);
      }
      setBookings(bookingsData || []);
      setRequests(requestsData || []);
      setLoading(false);
    };
    load();
  }, []);

  const addPOI = async () => {
    if (!festival || !newPOI.name) return;
    const poi: MapPOI = { id: crypto.randomUUID(), ...newPOI };
    const updatedPois = [...pois, poi];
    await supabase.from("festivals").update({ map_pois: updatedPois }).eq("id", festival.id);
    setPois(updatedPois);
    setNewPOI({ name: "", category: "toilet", lat: 500, lng: 500, notes: "" });
  };

  const removePOI = async (id: string) => {
    if (!festival) return;
    const updatedPois = pois.filter(p => p.id !== id);
    await supabase.from("festivals").update({ map_pois: updatedPois }).eq("id", festival.id);
    setPois(updatedPois);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-[3px] border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>;

  const tabs = [
    { key: "bookings" as Tab, label: "Bookings", icon: Tent, count: bookings.length },
    { key: "requests" as Tab, label: "Requests", icon: HelpCircle, count: requests.filter(r => r.status === "pending").length },
    { key: "staff" as Tab, label: "Staff", icon: Users },
    { key: "map" as Tab, label: "Map", icon: Map },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div className="flex items-center gap-2">
            <LayoutDashboard size={20} className="text-primary-600" />
            <h1 className="font-bold text-lg">Admin Panel</h1>
          </div>
          <button onClick={handleLogout} className="text-gray-400 hover:text-gray-600"><LogOut size={18} /></button>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 mt-4 max-w-2xl mx-auto">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-xl text-xs font-medium transition-colors ${
                tab === t.key ? "bg-primary-600 text-white" : "text-gray-500 hover:bg-gray-50"
              }`}>
              <t.icon size={16} />
              <span>{t.label}</span>
              {"count" in t && t.count !== undefined && t.count > 0 && (
                <span className={`text-[10px] px-1.5 rounded-full ${tab === t.key ? "bg-white text-primary-600" : "bg-primary-100 text-primary-700"}`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-6 max-w-2xl mx-auto">
        {/* Bookings tab */}
        {tab === "bookings" && (
          <div className="space-y-3">
            {bookings.length === 0 ? (
              <p className="text-center text-gray-400 py-8">No bookings yet</p>
            ) : bookings.map(b => (
              <div key={b.id} className="bg-white rounded-2xl border border-gray-100 p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-sm">{(b as any).camper?.name}</p>
                    <p className="text-xs text-gray-400">{(b as any).tent_type?.name}</p>
                  </div>
                  <StatusBadge status={b.status} />
                </div>
                <p className="text-xs text-gray-500">{b.arrival_date} → {b.departure_date}</p>
                <p className="text-xs text-gray-300">Ref: {b.id.slice(0, 8).toUpperCase()}</p>
              </div>
            ))}
          </div>
        )}

        {/* Requests tab */}
        {tab === "requests" && (
          <div className="space-y-3">
            {requests.length === 0 ? (
              <p className="text-center text-gray-400 py-8">No requests yet</p>
            ) : requests.map(r => (
              <div key={r.id} className="bg-white rounded-2xl border border-gray-100 p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-sm">{getRequestTypeLabel(r.type)}</p>
                    <p className="text-xs text-gray-400">{(r as any).camper?.name}</p>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
                <p className="text-xs text-gray-600">{r.location_description}</p>
                <p className="text-xs text-gray-300 mt-1">
                  {new Date(r.created_at).toLocaleString("en-GB")}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Staff tab */}
        {tab === "staff" && (
          <div className="space-y-3">
            <p className="text-sm text-gray-500">Staff availability is managed by assistants via their app. Below is a read-only view.</p>
            {staff.length === 0 ? (
              <p className="text-center text-gray-400 py-8">No assistants registered yet</p>
            ) : staff.map(s => (
              <div key={s.profile.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm">{s.profile.name}</p>
                  <p className="text-xs text-gray-400">{s.profile.phone}</p>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                  s.available ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                }`}>
                  {s.available ? "Available" : "Off Duty"}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Map tab */}
        {tab === "map" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <p className="text-sm font-semibold text-gray-900 mb-3">Add Map Pin</p>
              <div className="space-y-3">
                <input className="input" placeholder="Location name" value={newPOI.name}
                  onChange={e => setNewPOI(p => ({ ...p, name: e.target.value }))} />
                <select className="input" value={newPOI.category}
                  onChange={e => setNewPOI(p => ({ ...p, category: e.target.value as POICategory }))}>
                  {POI_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{getPOICategoryIcon(cat)} {cat.replace("_", " ")}</option>
                  ))}
                </select>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-400">X position (0-1000)</label>
                    <input className="input" type="number" min="0" max="1000" value={newPOI.lat}
                      onChange={e => setNewPOI(p => ({ ...p, lat: Number(e.target.value) }))} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">Y position (0-1000)</label>
                    <input className="input" type="number" min="0" max="1000" value={newPOI.lng}
                      onChange={e => setNewPOI(p => ({ ...p, lng: Number(e.target.value) }))} />
                  </div>
                </div>
                <input className="input" placeholder="Notes (optional)" value={newPOI.notes}
                  onChange={e => setNewPOI(p => ({ ...p, notes: e.target.value }))} />
                <button onClick={addPOI} disabled={!newPOI.name}
                  className="btn-primary flex items-center justify-center gap-2">
                  <Plus size={16} /> Add Pin
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-900">Current Pins ({pois.length})</p>
              {pois.map(poi => (
                <div key={poi.id} className="bg-white rounded-xl border border-gray-100 p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>{getPOICategoryIcon(poi.category)}</span>
                    <div>
                      <p className="text-sm font-medium">{poi.name}</p>
                      {poi.notes && <p className="text-xs text-gray-400">{poi.notes}</p>}
                    </div>
                  </div>
                  <button onClick={() => removePOI(poi.id)} className="text-red-400 hover:text-red-600">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
