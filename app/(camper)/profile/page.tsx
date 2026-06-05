"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import BottomNav from "@/components/ui/BottomNav";
import { Profile, Festival } from "@/types";
import { Tent, LogOut } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import { formatDate } from "@/lib/utils";
import { DEMO_MODE, DEMO_PROFILE, DEMO_FESTIVAL, DEMO_BOOKING } from "@/lib/demo-data";

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [festival, setFestival] = useState<Festival | null>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
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
      const { data: p } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      setProfile(p);
      if (p?.festival_id) {
        const { data: f } = await supabase.from("festivals").select("*").eq("id", p.festival_id).single();
        setFestival(f);
        const { data: b } = await supabase.from("bookings").select("*, tent_type:tent_types(*)").eq("camper_id", user.id).order("created_at", { ascending: false });
        setBookings(b || []);
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleSave = async () => {
    if (DEMO_MODE || !profile) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) await supabase.from("profiles").update({ name: profile.name, phone: profile.phone }).eq("id", user.id);
    setSaving(false);
  };

  const handleLogout = async () => {
    if (!DEMO_MODE) await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-[3px] border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>;

  return (
    <div className="page-container">
      <header className="page-header">
        <h1 className="font-bold text-lg">Profile</h1>
      </header>
      <div className="px-4 py-6 pb-24 space-y-4">
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mb-3">
            <span className="text-primary-700 font-bold text-3xl">{profile?.name?.charAt(0).toUpperCase()}</span>
          </div>
          <p className="text-sm text-gray-500">{profile?.email}</p>
          {festival && <p className="text-xs text-primary-600 font-medium mt-1">{festival.name}</p>}
        </div>
        <div className="card space-y-3">
          <p className="text-sm font-semibold text-gray-900">Personal Details</p>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Full name</label>
            <input className="input" type="text" value={profile?.name || ""} onChange={e => setProfile(p => p ? {...p, name: e.target.value} : p)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Phone</label>
            <input className="input" type="tel" value={profile?.phone || ""} onChange={e => setProfile(p => p ? {...p, phone: e.target.value} : p)} />
          </div>
          {!DEMO_MODE && <button onClick={handleSave} disabled={saving} className="btn-primary">{saving ? "Saving..." : "Save Changes"}</button>}
        </div>
        {bookings.length > 0 && (
          <div className="card">
            <p className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-3">
              <Tent size={16} className="text-primary-600" /> My Bookings
            </p>
            {bookings.map(b => (
              <div key={b.id} className="border border-gray-100 rounded-xl p-3">
                <div className="flex items-start justify-between mb-1">
                  <p className="text-sm font-medium">{b.tent_type?.name}</p>
                  <StatusBadge status={b.status} />
                </div>
                <p className="text-xs text-gray-400">{formatDate(b.arrival_date)} — {formatDate(b.departure_date)}</p>
              </div>
            ))}
          </div>
        )}
        <button onClick={handleLogout} className="btn-secondary flex items-center justify-center gap-2 text-red-600 border-red-100">
          <LogOut size={16} /> {DEMO_MODE ? "Back to Home" : "Sign out"}
        </button>
      </div>
      <BottomNav role="camper" />
    </div>
  );
}
