"use client";
/**
 * VendorPinMap — SSR-safe Leaflet map for vendor spot pinning.
 * Tap anywhere to drop a pin. Drag the pin to fine-tune.
 * Renders existing POI markers + any confirmed vendor pins.
 */
import { useEffect, useRef, useState } from "react";

export interface PinLocation {
  lat: number;
  lng: number;
}

interface VendorPinMapProps {
  onPin: (loc: PinLocation) => void;
  initialPin?: PinLocation | null;
  pois?: { id: string; name: string; lat: number; lng: number; category: string }[];
}

const FESTIVAL_CENTER: [number, number] = [51.5785, -3.7265];
const FESTIVAL_ZOOM = 16;

export default function VendorPinMap({ onPin, initialPin, pois = [] }: VendorPinMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<import("leaflet").Map | null>(null);
  const pinMarkerRef = useRef<import("leaflet").Marker | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (leafletMap.current) return;
    if (!mapRef.current) return;

    // Dynamically import Leaflet to avoid SSR issues
    import("leaflet").then(L => {
      // Fix default icon paths
      // @ts-expect-error – internal Leaflet property
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current!, {
        center: FESTIVAL_CENTER,
        zoom: FESTIVAL_ZOOM,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);

      // Existing POI markers (faded)
      pois.forEach(poi => {
        const emoji = categoryEmoji(poi.category);
        const poiIcon = L.divIcon({
          html: `<div style="font-size:18px;line-height:1;">${emoji}</div>`,
          className: "",
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });
        L.marker([poi.lat, poi.lng], { icon: poiIcon, opacity: 0.5 })
          .bindTooltip(poi.name, { direction: "top", offset: [0, -8] })
          .addTo(map);
      });

      // Vendor pin icon
      const vendorIcon = L.divIcon({
        html: `
          <div style="
            width:36px; height:36px; border-radius:50% 50% 50% 0;
            transform:rotate(-45deg);
            background:linear-gradient(135deg,#d97706,#b45309);
            border:3px solid #fff;
            box-shadow:0 3px 12px rgba(0,0,0,0.35);
            display:flex; align-items:center; justify-content:center;
          ">
            <span style="transform:rotate(45deg);font-size:16px;">🏪</span>
          </div>`,
        className: "",
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -36],
      });

      // Place initial pin if given
      if (initialPin) {
        pinMarkerRef.current = L.marker([initialPin.lat, initialPin.lng], {
          icon: vendorIcon,
          draggable: true,
        }).addTo(map);
        pinMarkerRef.current.on("dragend", () => {
          const ll = pinMarkerRef.current!.getLatLng();
          onPin({ lat: ll.lat, lng: ll.lng });
        });
      }

      // Click to pin
      map.on("click", (e: import("leaflet").LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        if (pinMarkerRef.current) {
          pinMarkerRef.current.setLatLng([lat, lng]);
        } else {
          pinMarkerRef.current = L.marker([lat, lng], {
            icon: vendorIcon,
            draggable: true,
          }).addTo(map);
          pinMarkerRef.current.on("dragend", () => {
            const ll = pinMarkerRef.current!.getLatLng();
            onPin({ lat: ll.lat, lng: ll.lng });
          });
        }
        onPin({ lat, lng });
      });

      leafletMap.current = map;
      setReady(true);
    });

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative w-full rounded-3xl overflow-hidden" style={{ height: "340px" }}>
      {/* Leaflet CSS */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        crossOrigin=""
      />

      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-amber-50 z-10">
          <div className="spinner spinner-green" style={{ borderTopColor: "#d97706", borderColor: "#fde68a" }} />
        </div>
      )}

      <div ref={mapRef} style={{ width: "100%", height: "100%" }} />

      {/* Overlay hint */}
      {ready && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[400] pointer-events-none">
          <div className="px-3 py-1.5 rounded-full text-[12px] font-semibold shadow-md"
            style={{ background: "rgba(255,255,255,0.95)", color: "#b45309", border: "1px solid #fde68a" }}>
            📍 Tap the map to drop your pin
          </div>
        </div>
      )}
    </div>
  );
}

function categoryEmoji(cat: string): string {
  const map: Record<string, string> = {
    food: "🍔", bar: "🍺", stage: "🎵", toilet: "🚽",
    first_aid: "🏥", water: "💧", other: "📍", vendor: "🏪",
  };
  return map[cat] ?? "📍";
}
