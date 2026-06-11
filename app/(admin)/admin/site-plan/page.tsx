"use client";
/**
 * Admin › Site Plan Georeferencing
 *
 * 3-step flow:
 *   Step 1 – Upload your festival site plan (PNG / JPG / WebP)
 *   Step 2 – Georeference it: tap SW and NE corners on a live satellite map
 *   Step 3 – Preview the overlay and save
 *
 * In demo mode the result is persisted to localStorage so the map page
 * can read and display it. In production this would save to Supabase.
 */
import { useState, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft, Upload, CheckCircle, Download, MapPin, Layers } from "lucide-react";
import type { GeoBounds } from "@/components/admin/GeoreferencerMap";

// SSR-safe import of the Leaflet component
const GeoreferencerMap = dynamic(
  () => import("@/components/admin/GeoreferencerMap"),
  { ssr: false, loading: () => (
    <div className="w-full rounded-3xl flex items-center justify-center bg-amber-50"
      style={{ height: "420px" }}>
      <div className="spinner" style={{ borderTopColor: "#7c3aed", borderColor: "#ede9fe" }} />
    </div>
  )}
);

type Step = 1 | 2 | 3;

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];

function formatCoord(n: number, dp = 5) {
  return n.toFixed(dp);
}

export default function SitePlanPage() {
  const [step, setStep]         = useState<Step>(1);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<number | null>(null);
  const [bounds, setBounds]     = useState<GeoBounds | null>(null);
  const [isDragging, setIsDragging]   = useState(false);
  const [fileError, setFileError]     = useState<string | null>(null);
  const [saved, setSaved]             = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── File handling ─────────────────────────────────────────────────────────
  const processFile = useCallback((file: File) => {
    setFileError(null);

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setFileError("Please upload a PNG, JPG, or WebP image. PDF support coming soon.");
      return;
    }
    if (file.size > 30 * 1024 * 1024) {
      setFileError("File is too large. Please use an image under 30 MB.");
      return;
    }

    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setFileName(file.name);
    setFileSize(file.size);
    setStep(2);
    setBounds(null);
    setSaved(false);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = () => {
    if (!bounds || !imageUrl) return;
    // In demo mode, save to localStorage so the camp map can read it
    const record = {
      imageUrl,
      bounds,
      fileName,
      savedAt: new Date().toISOString(),
      festivalId: "demo-festival-1",
    };
    try {
      localStorage.setItem("campAssist_sitePlan", JSON.stringify(record));
    } catch {
      // localStorage not available (SSR or quota) — silently ignore
    }
    setSaved(true);
  };

  // ── JSON export ───────────────────────────────────────────────────────────
  const handleExportJson = () => {
    if (!bounds) return;
    const payload = {
      festival: "In It Together 2026",
      imageFile: fileName,
      sw: bounds.sw,
      ne: bounds.ne,
      note: "Use with Leaflet L.imageOverlay(url, [[sw.lat,sw.lng],[ne.lat,ne.lng]])",
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = "georef.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Back button ───────────────────────────────────────────────────────────
  const handleBack = () => {
    if (step === 2) { setStep(1); setImageUrl(null); setFileName(null); }
    if (step === 3) { setStep(2); setSaved(false); }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen pb-10" style={{ background: "#f7f8fa" }}>
      {/* ── Header ── */}
      <div className="page-header justify-between">
        <div className="flex items-center gap-2.5">
          {step > 1 ? (
            <button onClick={handleBack}
              className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center transition-all active:scale-95">
              <ArrowLeft size={16} className="text-gray-600" />
            </button>
          ) : (
            <Link href="/admin"
              className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center">
              <ArrowLeft size={16} className="text-gray-600" />
            </Link>
          )}
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Admin</p>
            <h1 className="font-bold text-[17px] text-gray-900 leading-tight">Site Plan Setup</h1>
          </div>
        </div>
        {/* Step indicator */}
        <div className="flex items-center gap-1">
          {([1, 2, 3] as Step[]).map(s => (
            <div key={s} className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all"
              style={{
                background: step >= s ? "#7c3aed" : "#e9d5ff",
                color: step >= s ? "#fff" : "#7c3aed",
              }}>
              {s}
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4 animate-fade-in-up">

        {/* ── STEP 1 — Upload ─────────────────────────────────────────────── */}
        {step === 1 && (
          <>
            {/* Explainer */}
            <div className="rounded-2xl p-4 space-y-2"
              style={{ background: "linear-gradient(135deg, #ede9fe, #ddd6fe)", border: "1px solid #c4b5fd" }}>
              <div className="flex items-center gap-2">
                <Layers size={18} style={{ color: "#7c3aed" }} />
                <p className="font-bold text-[14px] text-purple-900">What is this?</p>
              </div>
              <p className="text-[13px] text-purple-800 leading-relaxed">
                Upload your festival site plan — the same PNG or PDF you use for signage or your website.
                We'll overlay it onto a real map so vendors can pin their exact spots.
              </p>
            </div>

            {/* Supported formats */}
            <div className="flex gap-2">
              {["PNG", "JPG", "WebP"].map(fmt => (
                <span key={fmt} className="px-3 py-1 rounded-xl text-[12px] font-bold"
                  style={{ background: "#f3f4f6", color: "#374151" }}>
                  {fmt}
                </span>
              ))}
              <span className="px-3 py-1 rounded-xl text-[12px] font-semibold text-gray-400"
                style={{ background: "#f9fafb", border: "1px dashed #d1d5db" }}>
                PDF — coming soon
              </span>
            </div>

            {/* Drop zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className="rounded-3xl p-8 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all"
              style={{
                border: isDragging ? "2px dashed #7c3aed" : "2px dashed #d8b4fe",
                background: isDragging ? "#faf5ff" : "#fefefe",
                minHeight: "200px",
              }}>
              <div className="w-16 h-16 rounded-3xl flex items-center justify-center"
                style={{ background: isDragging ? "#ede9fe" : "#f5f3ff" }}>
                <Upload size={28} style={{ color: "#7c3aed" }} />
              </div>
              <div className="text-center">
                <p className="font-bold text-[15px] text-gray-800">
                  {isDragging ? "Drop it here!" : "Upload your site plan"}
                </p>
                <p className="text-[13px] text-gray-400 mt-1">
                  Drag & drop or tap to browse
                </p>
              </div>
              <p className="text-[11px] text-gray-300">Max 30 MB · PNG, JPG, WebP</p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".png,.jpg,.jpeg,.webp"
              className="hidden"
              onChange={handleFileChange}
            />

            {fileError && (
              <div className="rounded-2xl p-3 flex items-center gap-2"
                style={{ background: "#fef2f2", border: "1px solid #fecaca" }}>
                <span className="text-[15px]">⚠️</span>
                <p className="text-[12px] text-red-700 font-medium">{fileError}</p>
              </div>
            )}

            {/* Tips */}
            <div className="rounded-2xl p-4 space-y-2.5" style={{ background: "#fff", border: "1px solid #f3f4f6" }}>
              <p className="text-[12px] font-bold text-gray-500 uppercase tracking-widest">Tips for best results</p>
              {[
                "Use a clean, straight-on scan or export — not a photo taken at an angle",
                "A high-resolution PNG from your design file works best",
                "The image will be fitted to the GPS bounds you define — slight distortion is normal",
              ].map(tip => (
                <div key={tip} className="flex items-start gap-2">
                  <span className="text-[13px] mt-0.5">✓</span>
                  <p className="text-[12px] text-gray-600 leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── STEP 2 — Georeference ────────────────────────────────────────── */}
        {step === 2 && imageUrl && (
          <>
            {/* Uploaded image preview thumbnail */}
            <div className="rounded-2xl overflow-hidden flex items-center gap-3 px-4 py-3"
              style={{ background: "#fff", border: "1px solid #e5e7eb" }}>
              <img src={imageUrl} alt="Site plan"
                className="w-16 h-12 object-cover rounded-xl flex-shrink-0"
                style={{ background: "#f3f4f6" }} />
              <div className="min-w-0">
                <p className="font-bold text-[13px] text-gray-900 truncate">{fileName}</p>
                <p className="text-[11px] text-gray-400">
                  {fileSize ? `${(fileSize / 1024).toFixed(0)} KB` : ""} · ready to georeference
                </p>
              </div>
              <CheckCircle size={18} className="flex-shrink-0 text-green-500" />
            </div>

            {/* How-to tip */}
            <div className="rounded-2xl p-3 flex items-start gap-2"
              style={{ background: "#fef3c7", border: "1px solid #fde68a" }}>
              <MapPin size={15} style={{ color: "#92400e", marginTop: "1px", flexShrink: 0 }} />
              <p className="text-[12px] text-amber-900 leading-relaxed">
                <strong>Hint:</strong> Switch to Satellite view (top-right of map) then tap the
                bottom-left and top-right corners of where your festival site sits in the real world.
                Or tap <em>"Use In It Together demo location"</em> to auto-fill Margam Park.
              </p>
            </div>

            {/* Map */}
            <GeoreferencerMap
              imageUrl={imageUrl}
              onBoundsSet={b => setBounds(b)}
            />

            {/* Next step button */}
            <button
              onClick={() => setStep(3)}
              disabled={!bounds}
              className="w-full font-bold py-4 rounded-2xl text-[14px] transition-all active:scale-97"
              style={{
                background: bounds ? "linear-gradient(135deg,#7c3aed,#6d28d9)" : "#e5e7eb",
                color: bounds ? "#fff" : "#9ca3af",
                boxShadow: bounds ? "0 4px 18px rgba(124,58,237,0.3)" : "none",
              }}>
              {bounds ? "Preview Overlay →" : "Set both corners to continue"}
            </button>

            {bounds && (
              <div className="rounded-2xl px-4 py-3 grid grid-cols-2 gap-3"
                style={{ background: "#f5f3ff", border: "1px solid #ede9fe" }}>
                <div>
                  <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-1">SW Corner</p>
                  <p className="text-[11px] font-mono text-purple-900">
                    {formatCoord(bounds.sw.lat)}, {formatCoord(bounds.sw.lng)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-1">NE Corner</p>
                  <p className="text-[11px] font-mono text-purple-900">
                    {formatCoord(bounds.ne.lat)}, {formatCoord(bounds.ne.lng)}
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── STEP 3 — Preview & Save ──────────────────────────────────────── */}
        {step === 3 && imageUrl && bounds && (
          <>
            {/* Success/save state */}
            {saved ? (
              <div className="rounded-3xl p-6 flex flex-col items-center gap-4 text-center animate-scale-in"
                style={{ background: "linear-gradient(135deg,#f0fdf4,#dcfce7)", border: "1px solid #bbf7d0" }}>
                <div className="w-16 h-16 rounded-3xl bg-green-600 flex items-center justify-center shadow-lg">
                  <CheckCircle size={32} className="text-white" />
                </div>
                <div>
                  <p className="font-bold text-[18px] text-green-900">Site Plan Linked!</p>
                  <p className="text-[13px] text-green-700 mt-1 leading-relaxed">
                    The georeferenced overlay is saved. Vendors can now pin their specific spots on top of your festival map.
                  </p>
                </div>
                <Link href="/admin"
                  className="w-full font-bold py-3.5 rounded-2xl text-[14px] text-center transition-all active:scale-97"
                  style={{ background: "#16a34a", color: "#fff", boxShadow: "0 4px 14px rgba(22,163,74,0.3)" }}>
                  Back to Admin Panel
                </Link>
              </div>
            ) : (
              <>
                {/* Coordinate summary */}
                <div className="rounded-2xl p-4 space-y-3"
                  style={{ background: "#fff", border: "1px solid #e5e7eb" }}>
                  <p className="font-bold text-[13px] text-gray-800">Georeferenced Bounds</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "SW (↙)", lat: bounds.sw.lat, lng: bounds.sw.lng, color: "#f59e0b" },
                      { label: "NE (↗)", lat: bounds.ne.lat, lng: bounds.ne.lng, color: "#7c3aed" },
                    ].map(c => (
                      <div key={c.label} className="rounded-xl p-3"
                        style={{ background: "#f9fafb", border: `1px solid ${c.color}30` }}>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <div className="w-2 h-2 rounded-full" style={{ background: c.color }} />
                          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{c.label}</p>
                        </div>
                        <p className="text-[11px] font-mono text-gray-800">{formatCoord(c.lat)}</p>
                        <p className="text-[11px] font-mono text-gray-800">{formatCoord(c.lng)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Preview map — reuses GeoreferencerMap with auto-filled demo so overlay shows immediately */}
                <div className="space-y-2">
                  <p className="font-bold text-[12px] text-gray-500 uppercase tracking-widest">Map Preview</p>
                  <GeoreferencerMap
                    imageUrl={imageUrl}
                    onBoundsSet={() => {/* read-only in preview */}}
                  />
                  <p className="text-[11px] text-gray-400 text-center leading-relaxed">
                    Tap "Use In It Together demo location" above the map to see your image overlaid.
                    The overlay is shown semi-transparent so you can compare against satellite imagery.
                  </p>
                </div>

                {/* Uploaded image preview */}
                <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #e5e7eb" }}>
                  <div className="px-4 py-2.5" style={{ background: "#f9fafb", borderBottom: "1px solid #f3f4f6" }}>
                    <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Your Site Plan</p>
                  </div>
                  <img src={imageUrl} alt="Festival site plan"
                    className="w-full object-contain"
                    style={{ maxHeight: "260px", background: "#fff" }} />
                </div>

                {/* Actions */}
                <button onClick={handleSave}
                  className="w-full font-bold py-4 rounded-2xl text-[14px] transition-all active:scale-97"
                  style={{
                    background: "linear-gradient(135deg,#7c3aed,#6d28d9)",
                    color: "#fff",
                    boxShadow: "0 4px 18px rgba(124,58,237,0.3)",
                  }}>
                  Save & Link to Festival
                </button>

                <button onClick={handleExportJson}
                  className="w-full font-semibold py-3.5 rounded-2xl text-[13px] flex items-center justify-center gap-2 transition-all active:scale-97"
                  style={{ background: "#fff", color: "#374151", border: "1px solid #e5e7eb" }}>
                  <Download size={15} />
                  Export georef.json
                </button>

                {/* Integration note */}
                <div className="rounded-2xl p-4 space-y-2"
                  style={{ background: "#fefce8", border: "1px solid #fef08a" }}>
                  <p className="text-[11px] font-bold text-yellow-800 uppercase tracking-widest">Developer note</p>
                  <p className="text-[12px] text-yellow-900 leading-relaxed">
                    In production, saving here writes the image URL + bounds to the festival record in Supabase.
                    The camp map then renders it using{" "}
                    <code className="bg-yellow-100 px-1 rounded font-mono">L.imageOverlay(url, bounds)</code>.
                    Vendors pin their spots on top of this base layer.
                  </p>
                </div>

                <button onClick={handleBack}
                  className="w-full font-semibold py-3.5 rounded-2xl text-[13px] transition-all active:scale-97"
                  style={{ background: "#f3f4f6", color: "#6b7280" }}>
                  ← Back to Fine-tune
                </button>
              </>
            )}
          </>
        )}

      </div>
    </div>
  );
}
