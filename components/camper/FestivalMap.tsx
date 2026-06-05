"use client";
import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Festival, MapPOI } from "@/types";
import { getPOICategoryIcon } from "@/lib/utils";

// Fix Leaflet default icon path issue with Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

function createEmojiMarker(emoji: string) {
  return L.divIcon({
    html: `<div style="font-size:26px;line-height:1;filter:drop-shadow(0 2px 6px rgba(0,0,0,0.35));cursor:pointer;transition:transform 0.1s">${emoji}</div>`,
    className: "",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

function FitBounds({ pois }: { pois: MapPOI[] }) {
  const map = useMap();
  useEffect(() => {
    if (pois.length > 0) {
      const bounds = L.latLngBounds(pois.map(p => [p.lat, p.lng] as [number, number]));
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [map, pois.length]);
  return null;
}

interface FestivalMapProps {
  festival: Festival;
  pois: MapPOI[];
  onSelectPOI: (poi: MapPOI) => void;
}

export default function FestivalMap({ festival, pois, onSelectPOI }: FestivalMapProps) {
  // Center on Margam Park, Wales
  const center: [number, number] = [51.578, -3.729];

  return (
    <MapContainer
      center={center}
      zoom={16}
      style={{ height: "100%", width: "100%", borderRadius: "1rem" }}
      zoomControl={true}
      attributionControl={true}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        maxZoom={19}
      />
      {pois.length > 0 && <FitBounds pois={pois} />}
      {pois.map(poi => (
        <Marker
          key={poi.id}
          position={[poi.lat, poi.lng] as [number, number]}
          icon={createEmojiMarker(getPOICategoryIcon(poi.category))}
          eventHandlers={{ click: () => onSelectPOI(poi) }}
        >
          <Popup>
            <div style={{ fontFamily: "sans-serif", minWidth: "120px" }}>
              <strong style={{ fontSize: "13px" }}>{poi.name}</strong>
              {poi.notes && <p style={{ margin: "4px 0 0", fontSize: "11px", color: "#6b7280" }}>{poi.notes}</p>}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
