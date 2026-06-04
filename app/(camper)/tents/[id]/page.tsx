"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import BottomNav from "@/components/ui/BottomNav";
import { TentType, Profile } from "@/types";
import { ArrowLeft, Users, Shield, CheckCircle } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function TentDetailPage() {
  const [tent, setTent] = useState<TentType | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [booked, setBooked] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const [{ data: tentData }, { data: profileData }] = await Promise.all([
        supabase.from("tent_types").select("*").eq("id", params.id).single(),
        supabase.from("profiles").select("*").eq("id", user.id).single(),
      ]);
      setTent(tentData);
      setProfile(profileData);
      setLoading(false);
    };
    load();
  }, [params.id]);

  const nights = profile?.arrival_date && profile?.departure_date
    ? Math.max(1, Math.ceil((new Date(profile.departure_date).getTime() - new Date(profile.arrival_date).getTime()) / (1000 * 60 * 60 * 24)))
    : 1;

  const handleBooking = async () => {
    if (!tent || !profile) return;
    setBooking(true);
    setError("");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error: err } = await supabase.from("bookings").insert({
      camper_id: user.id,
      tent_type_id: tent.id,
      festival_id: profile.festival_id,
      arrival_date: profile.arrival_date,
      departure_date: profile.departure_date,
      status: "pending",
    });

    if (err) { setError(err.message); setBooking(false); return; }
    setBooked(true);
    setTimeout(() => router.push("/booking-confirmation"), 1500);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-[3px] border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>;
  if (!tent) return <div className="min-h-screen flex items-center justify-center"><p>Tent not found</p></div>;

  if (booked) return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
        <CheckCircle size={32} className="text-green-600" />
      </div>
      <h2 className="text-xl font-bold mb-2">Tent Reserved!</h2>
      <p className="text-gray-500 text-sm">Redirecting to your confirmation...</p>
    </div>
  );

  return (
    <div className="page-container">
      <header className="page-header">
        <div className="flex items-center gap-3">
          <Link href="/tents" className="text-gray-500"><ArrowLeft size={20} /></Link>
          <h1 className="font-bold text-lg">{tent.name}</h1>
        </div>
      </header>

      <div className="px-4 py-6 space-y-6">
        {/* Tent image placeholder */}
        <div className="w-full h-48 bg-gradient-to-br from-primary-100 to-green-200 rounded-2xl flex items-center justify-center">
          <span className="text-6xl">⛺</span>
        </div>

        {/* Details */}
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-xl">{tent.name}</h2>
            <div className="flex items-center gap-1 text-gray-500 text-sm">
              <Users size={14} />
              <span>{tent.capacity} people</span>
            </div>
          </div>
          <p className="text-gray-600 text-sm">{tent.description}</p>

          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Price per night</span>
              <span className="font-semibold">{formatCurrency(tent.price_per_day)}</span>
            </div>
            {nights > 1 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{nights} nights</span>
                <span className="font-semibold">{formatCurrency(tent.price_per_day * nights)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Refundable deposit</span>
              <span className="font-semibold text-blue-600">{formatCurrency(tent.damage_deposit)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold border-t pt-2">
              <span>Total to pay before festival</span>
              <span className="text-primary-600">{formatCurrency(tent.price_per_day * nights + tent.damage_deposit)}</span>
            </div>
          </div>
        </div>

        {/* Dates */}
        {profile?.arrival_date && (
          <div className="card">
            <p className="text-sm font-semibold text-gray-900 mb-2">Your stay</p>
            <div className="flex justify-between text-sm">
              <div>
                <p className="text-xs text-gray-400">Arrival</p>
                <p className="font-medium">{formatDate(profile.arrival_date)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">Departure</p>
                <p className="font-medium">{profile.departure_date ? formatDate(profile.departure_date) : "—"}</p>
              </div>
            </div>
          </div>
        )}

        {/* What's included */}
        <div className="card">
          <p className="text-sm font-semibold text-gray-900 mb-3">What&apos;s included</p>
          <div className="space-y-2">
            {["Tent set up by our assistant on arrival", "Tent collected by our assistant when you leave", "Full damage protection if you pay deposit"].map(item => (
              <div key={item} className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle size={14} className="text-primary-500 shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Note */}
        <div className="flex items-start gap-3 bg-blue-50 rounded-xl p-4">
          <Shield size={16} className="text-blue-600 shrink-0 mt-0.5" />
          <p className="text-xs text-blue-700">
            This is a reservation. Payment details will be sent to you before the festival. Your tent will only be held once payment is confirmed.
          </p>
        </div>

        {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>}

        <button onClick={handleBooking} disabled={booking || !profile?.festival_id} className="btn-primary">
          {booking ? "Reserving..." : "Reserve This Tent"}
        </button>
      </div>

      <BottomNav role="camper" />
    </div>
  );
}
