"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ChevronLeft, MapPin, CheckCircle, Navigation, Info } from "lucide-react";
import { DEMO_FESTIVAL, DEMO_VENDOR_PROFILE } from "@/lib/demo-data";
import type { PinLocation } from "@/components/vendor/VendorPinMap";

// SSR-safe dynamic import
const VendorPinMap = dynamic(() => import("@/components/vendor/VendorPinMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full rounded-3xl flex items-center justify-center bg-amber-50"
      style={{ height: "340px" }}>
      <div className="text-center">
        <div className="spinner mb-3 mx-auto" style={{ borderTopColor: "#d97706", borderColor: "#fde68a" }} />
        <p className="text-[12px] text-amber-600">Loading map…</p>
      </div>
    </div>
  ),
});

const AMBER = "#d97706";
const AMBER_DARK = "#b45309";
const AMBER_LIGHT = "#fffbeb";

export default function VendorPinPage() {
  const vendor = DEMO_VENDOR_PROFILE;
  const existingPin: PinLocation | null = vendor.pin_confirmed
    ? { lat: vendor.lat, lng: vendor.lng }
    : null;

  const [pin, setPin] = useState<PinLocation | null>(existingPin);
  const [standNote, setStandNote] = useState(vendor.pin_description || "");
  const [saved, setSaved] = useState(false);

  const pois = DEMO_FESTIVAL.map_pois.map(p => ({
    id: p.id, name: p.name, lat: p.lat, lng: p.lng, category: p.category,
  }));

  const handleSave = () => {
    if (!pin) return;
    setSaved(true);
  };

  if (saved) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
        style={{ background: AMBER_LIGHT }}>
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6"
          style={{ background: `linear-gradient(135deg, ${AMBER}, ${AMBER_DARK})` }}>
          <CheckCircle size={40} className="text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Pin saved!</h2>
        <p className="text-[13px] text-gray-500 mb-2 max-w-xs leading-relaxed">
          Your stall is now visible on the festival map. Campers can tap your pin to get directions.
        </p>
        <div className="card text-left w-full max-w-xs mb-8">
          <p className="text-[11px] text-gray-400 font-medium mb-1">Coordinates saved</p>
          <p className="text-[13px] font-bold text-gray-800">
            {pin?.lat.toFixed(5)}, {pin?.lng.toFixed(5)}
          </p>
          {standNote && (
            <>
              <p className="text-[11px] text-gray-400 font-medium mt-2 mb-1">Stand note</p>
              <p className="text-[13px] text-gray-700">{standNote}</p>
            </>
          )}
        </div>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Link href="/vendor-dashboard"
            className="flex items-center justify-center gap-2 font-bold py-4 px-6 rounded-2xl text-sm text-white"
            style={{ background: `linear-gradient(135deg, ${AMBER}, ${AMBER_DARK})`, boxShadow: `0 4px 16px rgba(217,119,6,0.3)` }}>
            Back to Dashboard
          </Link>
          <Link href="/vendor/schedule/new"
            className="flex items-center justify-center gap-2 font-semibold py-4 px-6 rounded-2xl text-sm"
            style={{ background: "#fff", border: `1px solid #fde68a`, color: AMBER_DARK }}>
            Add my schedule next →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: AMBER_LIGHT }}>
      {/* Header */}
      <div className="page-header justify-between"
        style={{ background: "#fff", borderBottom: "1px solid #fde68a" }}>
        <div className="flex items-center gap-3">
          <Link href="/vendor-dashboard"
            className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
            <ChevronLeft size={18} style={{ color: AMBER }} />
          </Link>
          <div>
            <p className="font-bold text-[15px]">Pin My Spot</p>
            <p className="text-[11px] text-gray-400">{vendor.name}</p>
          </div>
        </div>
        {vendor.pin_confirmed && (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-green-600">
            <CheckCircle size={12} /> Pinned
          </span>
        )}
      </div>

      <div className="px-4 pt-4 pb-36 space-y-4 animate-fade-in-up">

        {/* Tip card */}
        <div className="rounded-2xl px-4 py-3 flex items-start gap-3"
          style={{ background: "#fff", border: "1px solid #fde68a" }}>
          <Navigation size={16} style={{ color: AMBER }} className="mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-[13px] font-semibold text-gray-800 mb-0.5">How pinning works</p>
            <p className="text-[12px] text-gray-500 leading-relaxed">
              Tap exactly where your stall is on the map. Drag the amber pin to fine-tune.
              Once saved, your 🏪 pin appears on the camper map with navigation directions.
            </p>
          </div>
        </div>

        {/* Map */}
        <VendorPinMap
          onPin={setPin}
          initialPin={existingPin}
          pois={pois}
        />

        {/* Pin coords display */}
        {pin && (
          <div className="card animate-fade-in">
            <div className="flex items-center gap-2 mb-2">
              <MapPin size={14} style={{ color: AMBER }} />
              <p className="text-[13px] font-bold text-gray-800">Pin location captured</p>
            </div>
            <p className="text-[12px] text-gray-400">
              Lat {pin.lat.toFixed(5)} · Lng {pin.lng.toFixed(5)}
            </p>
          </div>
        )}

        {/* Stand note */}
        <div>
          <label className="form-label">Help campers find you (optional)</label>
          <input className="input w-full"
            placeholder="e.g. Look for the neon green sign next to Jazz Tent"
            value={standNote}
            onChange={e => setStandNote(e.target.value)}
            style={{ borderColor: standNote ? AMBER : undefined }} />
          <p className="form-hint">This note appears in the map popup so campers know what to look for</p>
        </div>

        {/* GPS option */}
        <div className="rounded-2xl px-4 py-3 flex items-start gap-3"
          style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
          <Info size={14} className="text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-[12px] font-semibold text-green-800 mb-0.5">Pro tip: Use GPS while on-site</p>
            <p className="text-[12px] text-green-700 leading-relaxed">
              For the most accurate pin, open this page when you're physically standing at your stall.
              Your phone's GPS gives a precise location automatically.
            </p>
          </div>
        </div>

      </div>

      {/* Save button */}
      <div className="fixed bottom-0 left-0 right-0 px-4 pb-8 pt-4"
        style={{ background: "rgba(255,251,235,0.96)", backdropFilter: "blur(16px)", borderTop: "1px solid #fde68a" }}>
        <button
          onClick={handleSave}
          disabled={!pin}
          className="w-full flex items-center justify-center gap-2 font-bold py-4 px-6 rounded-2xl text-sm text-white transition-all disabled:opacity-40"
          style={{ background: `linear-gradient(135deg, ${AMBER}, ${AMBER_DARK})`, boxShadow: `0 4px 16px rgba(217,119,6,0.35)` }}>
          <MapPin size={17} />
          {vendor.pin_confirmed ? "Update My Pin" : "Save My Pin"}
        </button>
        {!pin && (
          <p className="text-center text-[12px] text-amber-600 mt-2">Tap on the map first to drop your pin</p>
        )}
      </div>
    </div>
  );
}
