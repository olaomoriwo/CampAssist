"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { Booking } from "@/types";
import { CheckCircle, Home, Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function BookingConfirmationPage() {
  const [booking, setBooking] = useState<Booking | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("bookings")
        .select("*, tent_type:tent_types(*)")
        .eq("camper_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      setBooking(data);
    };
    load();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center py-12">
        {/* Success icon */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle size={40} className="text-green-600" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Tent Reserved! 🏕️</h1>
        <p className="text-gray-500 text-sm mb-8 max-w-xs">
          Your tent has been reserved. We&apos;ll contact you before the festival to arrange payment and confirm your booking.
        </p>

        {/* Booking details */}
        {booking && (
          <div className="w-full max-w-sm bg-white rounded-2xl border border-gray-100 p-5 text-left mb-8 space-y-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Booking Details</p>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Tent</span>
              <span className="font-semibold">{(booking as any).tent_type?.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Arrival</span>
              <span className="font-semibold">{formatDate(booking.arrival_date)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Departure</span>
              <span className="font-semibold">{formatDate(booking.departure_date)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Ref</span>
              <span className="font-mono text-xs font-semibold text-gray-700">{booking.id.slice(0, 8).toUpperCase()}</span>
            </div>
            <div className="border-t pt-3">
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <Calendar size={12} />
                Payment details will be sent to your email before the festival
              </p>
            </div>
          </div>
        )}

        {/* What happens next */}
        <div className="w-full max-w-sm bg-primary-50 rounded-2xl p-4 text-left mb-8">
          <p className="text-sm font-semibold text-primary-800 mb-3">What happens next</p>
          <div className="space-y-2">
            {[
              "We'll email you payment instructions",
              "Once payment is confirmed, your tent is locked in",
              "On arrival day, tap 'I've Arrived' in the app",
              "An assistant will set up your tent at your spot",
            ].map((step, i) => (
              <div key={step} className="flex items-start gap-2 text-sm text-primary-700">
                <span className="w-5 h-5 bg-primary-200 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  {i + 1}
                </span>
                {step}
              </div>
            ))}
          </div>
        </div>

        <Link href="/dashboard" className="flex items-center gap-2 bg-primary-600 text-white font-bold py-4 px-8 rounded-2xl hover:bg-primary-700 transition-colors">
          <Home size={18} /> Back to Dashboard
        </Link>
      </div>
    </main>
  );
}
