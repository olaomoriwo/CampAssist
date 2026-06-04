"use client";
import { useEffect } from "react";
import { MapContainer, ImageOverlay, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Festival, MapPOI } from "@/types";
import { getPOICategoryIcon } from "@/lib/utils";

interface FestivalMapProps {
  festival: Festival;
  pois: MapPOI[];
  onSelectPOI: (poi: MapPOI) => void;
}

// Create custom emoji markers
function createEmojiMarker(emoji: string) {
  return L.divIcon({
    html: `<div style="font-size:24px;line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3))">${emoji}</div>`,
    className: "",
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
}

function MapBounds({ bounds }: { bounds: L.LatLngBoundsExpression }) {
  const map = useMap();
  useEffect(() => {
    map.fitBounds(bounds);
  }, [map, bounds]);
  return null;
}

export default function FestivalMap({ festival, pois, onSelectPOI }: FestivalMapProps) {
  // Default bounds — festival organisers update these when uploading the map
  // These represent the image overlay bounds on the Leaflet canvas
  const bounds: L.LatLngBoundsExpression = [[0, 0], [1000, 1000]];

  return (
    <MapContainer
      crs={L.CRS.Simple}
      bounds={bounds}
      style={{ height: "100%", width: "100%", borderRadius: "1rem" }}
      zoomControl={true}
      attributionControl={false}
    >
      {festival.map_image_url && (
        <ImageOverlay url={festival.map_image_url} bounds={bounds} />
      )}
      <MapBounds bounds={bounds} />
      {pois.map(poi => (
        <Marker
          key={poi.id}
          position={[poi.lat, poi.lng]}
          icon={createEmojiMarker(getPOICategoryIcon(poi.category))}
          eventHandlers={{ click: () => onSelectPOI(poi) }}
        >
          <Popup>
            <strong>{poi.name}</strong>
            {poi.notes && <p className="text-xs mt-1">{poi.notes}</p>}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
