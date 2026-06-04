"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import BottomNav from "@/components/ui/BottomNav";
import { TentType, Profile } from "@/types";
import { ArrowLeft, Tent, Users } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function BrowseTentsPage() {
  const [tents, setTents] = useState<TentType[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      setProfile(profileData);
      if (profileData?.festival_id) {
        const { data } = await supabase.from("tent_types")
          .select("*").eq("festival_id", profileData.festival_id).gt("available_quantity", 0);
        setTents(data || []);
      }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-[3px] border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>;

  return (
    <div className="page-container">
      <header className="page-header">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-gray-500 hover:text-gray-700"><ArrowLeft size={20} /></Link>
          <h1 className="font-bold text-lg">Book a Tent</h1>
        </div>
      </header>

      <div className="px-4 py-6">
        <p className="text-sm text-gray-500 mb-6">
          Reserve your tent before the festival. Our assistants will set it up when you arrive.
          Payment is collected before the event.
        </p>

        {!profile?.festival_id ? (
          <div className="card text-center py-8">
            <Tent size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm mb-3">You haven&apos;t selected a festival yet.</p>
            <Link href="/profile" className="text-primary-600 text-sm font-medium hover:underline">Update your profile →</Link>
          </div>
        ) : tents.length === 0 ? (
          <div className="card text-center py-8">
            <Tent size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No tents available for your festival yet. Check back soon.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tents.map(tent => (
              <Link key={tent.id} href={`/tents/${tent.id}`}
                className="card block hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900">{tent.name}</h3>
                    <div className="flex items-center gap-1 text-gray-500 text-xs mt-1">
                      <Users size={12} />
                      <span>Up to {tent.capacity} people</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary-600">{formatCurrency(tent.price_per_day)}</p>
                    <p className="text-xs text-gray-400">per night</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">{tent.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    + {formatCurrency(tent.damage_deposit)} refundable deposit
                  </span>
                  <span className="text-xs font-medium text-primary-600">View details →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <BottomNav role="camper" />
    </div>
  );
}
