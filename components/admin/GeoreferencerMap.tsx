"use client";
/**
 * GeoreferencerMap — Leaflet map for georeferencing a festival site-plan image.
 *
 * UX flow:
 *   1. User taps the SW corner (bottom-left) of their festival site on the map → amber pin
 *   2. User taps the NE corner (top-right) → purple pin
 *   3. The uploaded image appears as a semi-transparent overlay between the two corners
 *   4. Both markers are draggable to fine-tune alignment
 *   5. Opacity slider lets user see through the overlay to compare with the base map
 *
 * A "Use In It Together demo location" shortcut auto-fills Margam Park bounds so
 * the uploaded festival photo is immediately visible without manual corner-setting.
 */
import { useEffect, useRef, useState } from "react";

export interface LatLng {
  lat: number;
  lng: number;
}
export interface GeoBounds {
  sw: LatLng;
  ne: LatLng;
}

interface Props {
  imageUrl: string;
  onBoundsSet: (bounds: GeoBounds) => void;
}

// In It Together festival at Margam Park, Port Talbot, Wales — approximate site bounds
const DEMO_SW: LatLng = { lat: 51.5715, lng: -3.7365 };
const DEMO_NE: LatLng = { lat: 51.5845, lng: -3.7120 };
const MAP_CENTER: [number, number] = [51.578, -3.724];

export default function GeoreferencerMap({ imageUrl, onBoundsSet }: Props) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMap        = useRef<any>(null);
  const overlayRef        = useRef<any>(null);
  const swMarkerRef       = useRef<any>(null);
  const neMarkerRef       = useRef<any>(null);

  // Imperative setters exposed to React UI
  const setOpacityFn  = useRef<((v: number) => void) | null>(null);
  const resetFn       = useRef<(() => void) | null>(null);
  const fillDemoFn    = useRef<(() => void) | null>(null);

  const [uiMode, setUiMode] = useState<"setSW" | "setNE" | "done">("setSW");
  const [opacity, setOpacity] = useState(0.65);

  const modeRef    = useRef<"setSW" | "setNE" | "done">("setSW");
  const cornersRef = useRef<GeoBounds | null>(null);
  const imageUrlRef = useRef(imageUrl);
  imageUrlRef.current = imageUrl;

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (leafletMap.current)           return;
    if (!mapContainerRef.current)     return;

    import("leaflet").then(L => {
      // ── Fix default icon paths ──────────────────────────────────────────────
      // @ts-expect-error internal Leaflet property
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(mapContainerRef.current!, {
        center: MAP_CENTER,
        zoom: 14,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      // ── Tile layers ─────────────────────────────────────────────────────────
      const satTiles = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          attribution: "Tiles © Esri — Source: Esri, USGS, AeroGRID, IGN",
          maxZoom: 19,
        }
      );
      const streetTiles = L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          attribution: "© OpenStreetMap contributors",
          maxZoom: 19,
        }
      );

      satTiles.addTo(map); // default to satellite — much easier to georeference

      L.control.layers(
        { "🛰 Satellite": satTiles, "🗺 Street Map": streetTiles },
        {},
        { position: "topright" }
      ).addTo(map);

      // ── Corner marker icons ─────────────────────────────────────────────────
      const swIcon = L.divIcon({
        html: `<div style="
          background:linear-gradient(135deg,#f59e0b,#d97706);
          color:#fff;font-size:10px;font-weight:800;
          padding:4px 8px;border-radius:8px;
          border:2px solid #fff;
          box-shadow:0 2px 10px rgba(0,0,0,0.4);
          white-space:nowrap;cursor:grab;
        ">SW ↙</div>`,
        className: "",
        iconAnchor: [30, 14],
      });

      const neIcon = L.divIcon({
        html: `<div style="
          background:linear-gradient(135deg,#7c3aed,#6d28d9);
          color:#fff;font-size:10px;font-weight:800;
          padding:4px 8px;border-radius:8px;
          border:2px solid #fff;
          box-shadow:0 2px 10px rgba(0,0,0,0.4);
          white-space:nowrap;cursor:grab;
        ">NE ↗</div>`,
        className: "",
        iconAnchor: [0, 14],
      });

      // ── Shared helpers ──────────────────────────────────────────────────────
      function renderOverlay(currentOpacity: number) {
        if (!cornersRef.current) return;
        const { sw, ne } = cornersRef.current;
        const bounds: [[number, number], [number, number]] = [
          [sw.lat, sw.lng],
          [ne.lat, ne.lng],
        ];
        if (!overlayRef.current) {
          overlayRef.current = L.imageOverlay(imageUrlRef.current, bounds, {
            opacity: currentOpacity,
            zIndex: 500,
          }).addTo(map);
        } else {
          overlayRef.current.setBounds(L.latLngBounds(bounds[0], bounds[1]));
        }
      }

      function notifyParent() {
        if (cornersRef.current) onBoundsSet(cornersRef.current);
      }

      function placeSwMarker(lat: number, lng: number, initialOpacity: number) {
        if (!swMarkerRef.current) {
          swMarkerRef.current = L.marker([lat, lng], {
            draggable: true,
            icon: swIcon,
            zIndexOffset: 1000,
          }).addTo(map);
          swMarkerRef.current.on("dragend", () => {
            const ll = swMarkerRef.current!.getLatLng();
            cornersRef.current = { ...cornersRef.current!, sw: { lat: ll.lat, lng: ll.lng } };
            renderOverlay(initialOpacity);
            notifyParent();
          });
        } else {
          swMarkerRef.current.setLatLng([lat, lng]);
        }
      }

      function placeNeMarker(lat: number, lng: number, initialOpacity: number) {
        if (!neMarkerRef.current) {
          neMarkerRef.current = L.marker([lat, lng], {
            draggable: true,
            icon: neIcon,
            zIndexOffset: 1000,
          }).addTo(map);
          neMarkerRef.current.on("dragend", () => {
            const ll = neMarkerRef.current!.getLatLng();
            cornersRef.current = { ...cornersRef.current!, ne: { lat: ll.lat, lng: ll.lng } };
            renderOverlay(initialOpacity);
            notifyParent();
          });
        } else {
          neMarkerRef.current.setLatLng([lat, lng]);
        }
      }

      // ── Map click handler ───────────────────────────────────────────────────
      let latestOpacity = 0.65;

      map.on("click", (e: any) => {
        const { lat, lng } = e.latlng;

        if (modeRef.current === "setSW") {
          cornersRef.current = { sw: { lat, lng }, ne: { lat: lat + 0.014, lng: lng + 0.017 } };
          placeSwMarker(lat, lng, latestOpacity);
          modeRef.current = "setNE";
          setUiMode("setNE");
        } else if (modeRef.current === "setNE") {
          cornersRef.current = { ...cornersRef.current!, ne: { lat, lng } };
          placeNeMarker(lat, lng, latestOpacity);
          modeRef.current = "done";
          setUiMode("done");
          renderOverlay(latestOpacity);
          notifyParent();
          // Zoom to show the full overlay
          const { sw, ne } = cornersRef.current!;
          map.fitBounds([[sw.lat, sw.lng], [ne.lat, ne.lng]], { padding: [40, 40] });
        }
      });

      // ── Expose imperative setters to React ──────────────────────────────────
      setOpacityFn.current = (val: number) => {
        latestOpacity = val;
        if (overlayRef.current) overlayRef.current.setOpacity(val);
      };

      resetFn.current = () => {
        if (swMarkerRef.current) { map.removeLayer(swMarkerRef.current); swMarkerRef.current = null; }
        if (neMarkerRef.current) { map.removeLayer(neMarkerRef.current); neMarkerRef.current = null; }
        if (overlayRef.current)  { map.removeLayer(overlayRef.current);  overlayRef.current  = null; }
        cornersRef.current = null;
        modeRef.current = "setSW";
        setUiMode("setSW");
      };

      fillDemoFn.current = () => {
        const sw = DEMO_SW;
        const ne = DEMO_NE;
        cornersRef.current = { sw, ne };

        // Remove existing markers/overlay before re-placing
        if (swMarkerRef.current) { map.removeLayer(swMarkerRef.current); swMarkerRef.current = null; }
        if (neMarkerRef.current) { map.removeLayer(neMarkerRef.current); neMarkerRef.current = null; }
        if (overlayRef.current)  { map.removeLayer(overlayRef.current);  overlayRef.current  = null; }

        placeSwMarker(sw.lat, sw.lng, latestOpacity);
        placeNeMarker(ne.lat, ne.lng, latestOpacity);
        renderOverlay(latestOpacity);
        notifyParent();

        modeRef.current = "done";
        setUiMode("done");
        map.fitBounds([[sw.lat, sw.lng], [ne.lat, ne.lng]], { padding: [30, 30] });
      };

      leafletMap.current = map;
    });

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current  = null;
        overlayRef.current  = null;
        swMarkerRef.current = null;
        neMarkerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpacityChange = (val: number) => {
    setOpacity(val);
    setOpacityFn.current?.(val);
  };

  const handleReset = () => resetFn.current?.();
  const handleDemo  = () => fillDemoFn.current?.();

  // ── Instruction banners ───────────────────────────────────────────────────
  const instructions: Record<typeof uiMode, { text: string; color: string; bg: string }> = {
    setSW: {
      text: "Step 1 of 2 — Tap the SOUTH-WEST corner of your festival site on the map",
      color: "#92400e",
      bg: "rgba(254,243,199,0.96)",
    },
    setNE: {
      text: "Step 2 of 2 — Now tap the NORTH-EAST corner (opposite diagonal)",
      color: "#4c1d95",
      bg: "rgba(237,233,254,0.96)",
    },
    done: {
      text: "✅ Overlay placed — drag corner pins to fine-tune alignment",
      color: "#14532d",
      bg: "rgba(240,253,244,0.96)",
    },
  };
  const inst = instructions[uiMode];

  return (
    <div className="relative w-full rounded-3xl overflow-hidden" style={{ height: "420px" }}>
      {/* Leaflet CSS */}
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossOrigin="" />

      {/* Map container */}
      <div ref={mapContainerRef} style={{ width: "100%", height: "100%" }} />

      {/* Instruction banner */}
      <div className="absolute top-3 left-3 right-16 z-[400] pointer-events-none">
        <div className="px-3 py-2 rounded-2xl text-[12px] font-semibold shadow-lg leading-snug"
          style={{ background: inst.bg, color: inst.color, border: `1px solid ${inst.color}30` }}>
          {inst.text}
        </div>
      </div>

      {/* Demo shortcut button */}
      <div className="absolute top-14 left-3 z-[400]">
        <button
          onClick={handleDemo}
          className="px-3 py-1.5 rounded-xl text-[11px] font-bold shadow-md transition-all active:scale-95"
          style={{ background: "rgba(217,119,6,0.92)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)" }}>
          📍 Use In It Together demo location
        </button>
      </div>

      {/* Opacity + reset controls */}
      {uiMode !== "setSW" && (
        <div className="absolute bottom-3 left-3 right-3 z-[400]">
          <div className="rounded-2xl px-4 py-3 shadow-lg flex items-center gap-3"
            style={{ background: "rgba(255,255,255,0.95)", border: "1px solid rgba(0,0,0,0.08)" }}>
            <span className="text-[11px] font-semibold text-gray-500 whitespace-nowrap">
              Opacity
            </span>
            <input
              type="range" min={0.1} max={1} step={0.05}
              value={opacity}
              onChange={e => handleOpacityChange(parseFloat(e.target.value))}
              className="flex-1 h-1.5 accent-amber-500"
            />
            <span className="text-[11px] font-mono text-gray-400 w-8 text-right">
              {Math.round(opacity * 100)}%
            </span>
            <button onClick={handleReset}
              className="ml-2 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all active:scale-95"
              style={{ background: "#fee2e2", color: "#991b1b" }}>
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
