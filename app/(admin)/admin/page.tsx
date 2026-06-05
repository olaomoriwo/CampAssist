"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import StatusBadge from "@/components/ui/StatusBadge";
import { LayoutDashboard, Tent, HelpCircle, Users, Map, Plus, Trash2, LogOut } from "lucide-react";
import { getRequestTypeLabel, getPOICategoryIcon } from "@/lib/utils";
import { DEMO_MODE, DEMO_ADMIN_BOOKINGS, DEMO_ADMIN_REQUESTS, DEMO_ADMIN_STAFF, DEMO_FESTIVAL } from "@/lib/demo-data";

type Tab = "bookings" | "requests" | "staff" | "map";

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("bookings");
  const [bookings, setBookings] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [pois, setPois] = useState<any[]>([]);
  const [newPOI, setNewPOI] = useState({ name: "", category: "food", notes: "", lat: 500, lng: 500 });
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    if (DEMO_MODE) {
      setBookings(DEMO_ADMIN_BOOKINGS);
      setRequests(DEMO_ADMIN_REQUESTS);
      setStaff(DEMO_ADMIN_STAFF);
      setPois((DEMO_FESTIVAL.map_pois || []) as any[]);
      setLoading(false);
      return;
    }
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const [{ data: b }, { data: r }, { data: s }] = await Promise.all([
        supabase.from("bookings").select("*, tent_type:tent_types(*), camper:profiles!camper_id(name,phone)").order("created_at", { ascending: false }),
        supabase.from("assistance_requests").select("*, camper:profiles!camper_id(name)").order("created_at", { ascending: false }),
        supabase.from("profiles").select("*").eq("role", "assistant"),
      ]);
      setBookings(b || []); setRequests(r || []); setStaff(s || []);
      setLoading(false);
    };
    load();
  }, []);

  const addPOI = () => {
    if (!newPOI.name) return;
    const poi = { id: Date.now().toString(), ...newPOI };
    setPois(p => [...p, poi]);
    setNewPOI({ name: "", category: "food", notes: "", lat: 500, lng: 500 });
  };

  const handleLogout = async () => {
    if (!DEMO_MODE) await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-[3px] border-purple-200 border-t-purple-600 rounded-full animate-spin" /></div>;

  const tabs: { key: Tab; icon: any; label: string; count?: number }[] = [
    { key: "bookings", icon: Tent, label: "Bookings", count: bookings.length },
    { key: "requests", icon: HelpCircle, label: "Requests", count: requests.filter(r => r.status === "pending").length },
    { key: "staff", icon: Users, label: "Staff" },
    { key: "map", icon: Map, label: "Map" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      <div className="bg-white border-b border-gray-100 px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <LayoutDashboard size={20} className="text-purple-600" />
            <h1 className="font-bold text-lg">Admin Panel</h1>
          </div>
          <button onClick={handleLogout} className="text-gray-400 bg-none border-none cursor-pointer"><LogOut size={18} /></button>
        </div>
        <div className="flex gap-1">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className="flex-1 flex flex-col items-center gap-1 py-2 rounded-xl text-xs font-medium border-none cursor-pointer transition-colors"
              style={{background:tab===t.key?"#7c3aed":"transparent",color:tab===t.key?"#fff":"#9ca3af"}}>
              <t.icon size={16} />
              <span>{t.label}</span>
              {t.count !== undefined && t.count > 0 && (
                <span className="text-[10px] px-1.5 rounded-full" style={{background:tab===t.key?"rgba(255,255,255,0.3)":"#ede9fe",color:tab===t.key?"#fff":"#7c3aed"}}>{t.count}</span>
              )}
            </button>
          ))}
        </div>
      </div>
      <div className="px-4 py-5">
        {tab === "bookings" && (
          <>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-white rounded-xl p-3 text-center border border-gray-100"><p className="text-2xl font-bold text-purple-600">{bookings.length}</p><p className="text-xs text-gray-400">Bookings</p></div>
              <div className="bg-white rounded-xl p-3 text-center border border-gray-100"><p className="text-2xl font-bold text-green-600">£{bookings.length * 75}</p><p className="text-xs text-gray-400">Revenue</p></div>
            </div>
            {bookings.map(b => (
              <div key={b.id} className="card mb-3">
                <div className="flex items-start justify-between mb-1">
                  <div><p className="font-semibold text-sm">{b.camper?.name}</p><p className="text-xs text-gray-400">{b.tent_type?.name} · {b.arrival_date} – {b.departure_date}</p></div>
                  <StatusBadge status={b.status} />
                </div>
              </div>
            ))}
          </>
        )}
        {tab === "requests" && (
          <>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-yellow-50 rounded-xl p-3 text-center"><p className="text-2xl font-bold text-yellow-600">{requests.filter(r=>r.status==="pending").length}</p><p className="text-xs text-gray-400">Pending</p></div>
              <div className="bg-green-50 rounded-xl p-3 text-center"><p className="text-2xl font-bold text-green-600">{requests.filter(r=>r.status==="complete").length}</p><p className="text-xs text-gray-400">Complete</p></div>
            </div>
            {requests.map(r => (
              <div key={r.id} className="card mb-3">
                <div className="flex items-start justify-between mb-1">
                  <div><p className="font-semibold text-sm">{getRequestTypeLabel(r.type)}</p><p className="text-xs text-gray-400">{r.camper?.name} · {r.location_description}</p></div>
                  <StatusBadge status={r.status} />
                </div>
              </div>
            ))}
          </>
        )}
        {tab === "staff" && staff.map((s,i) => (
          <div key={i} className="card flex items-center justify-between mb-3">
            <div><p className="font-semibold text-sm">{s.profile?.name || s.name}</p><p className="text-xs text-gray-400">Camp Assistant</p></div>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{background:s.available?"#dcfce7":"#f3f4f6",color:s.available?"#14532d":"#6b7280"}}>{s.available?"Available":"Off Duty"}</span>
          </div>
        ))}
        {tab === "map" && (
          <>
            <div className="card mb-4">
              <p className="text-sm font-semibold mb-3">Add Location Pin</p>
              <input className="input mb-2" placeholder="Location name" value={newPOI.name} onChange={e => setNewPOI(p => ({...p,name:e.target.value}))} />
              <select className="input mb-2" value={newPOI.category} onChange={e => setNewPOI(p => ({...p,category:e.target.value}))}>
                {["food","bar","stage","toilet","first_aid","water","other"].map(c => <option key={c} value={c}>{c.replace("_"," ")}</option>)}
              </select>
              <input className="input mb-3" placeholder="Notes (optional)" value={newPOI.notes} onChange={e => setNewPOI(p => ({...p,notes:e.target.value}))} />
              <button onClick={addPOI} disabled={!newPOI.name} className="btn-primary flex items-center justify-center gap-2" style={{background:"#7c3aed"}}>
                <Plus size={16} /> Add Pin
              </button>
            </div>
            <div className="bg-green-50 rounded-xl p-3 mb-4 flex items-start gap-2">
              <span className="text-green-600 text-sm">ℹ️</span>
              <p className="text-xs text-green-800">Pins added here appear on the camper map with a Google Maps navigate button.</p>
            </div>
            <p className="text-sm font-semibold mb-3">Current Pins ({pois.length})</p>
            {pois.map((p: any) => (
              <div key={p.id} className="bg-white rounded-xl border border-gray-100 px-3 py-2 flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-base">{getPOICategoryIcon(p.category)}</span>
                  <div><p className="text-sm font-medium">{p.name}</p>{p.notes && <p className="text-xs text-gray-400">{p.notes}</p>}</div>
                </div>
                <button onClick={() => setPois(ps => ps.filter(x => x.id !== p.id))} className="text-red-300 bg-none border-none cursor-pointer"><Trash2 size={15} /></button>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
