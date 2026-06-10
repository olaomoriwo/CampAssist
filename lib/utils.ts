import { POICategory, RequestStatus, BookingStatus, RequestType } from "@/types";

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatCurrency(pence: number): string {
  return `£${(pence / 100).toFixed(2)}`;
}

export function getStatusColor(status: RequestStatus | BookingStatus): string {
  const colors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    accepted: "bg-blue-100 text-blue-800",
    in_progress: "bg-purple-100 text-purple-800",
    complete: "bg-green-100 text-green-800",
    cancelled: "bg-gray-100 text-gray-800",
    confirmed: "bg-blue-100 text-blue-800",
    tent_setup: "bg-green-100 text-green-800",
    tent_collected: "bg-gray-100 text-gray-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}

export function getStatusLabel(status: RequestStatus | BookingStatus): string {
  const labels: Record<string, string> = {
    pending: "Pending",
    accepted: "Accepted",
    in_progress: "In Progress",
    complete: "Complete",
    cancelled: "Cancelled",
    confirmed: "Confirmed",
    tent_setup: "Tent Set Up",
    tent_collected: "Tent Collected",
  };
  return labels[status] || status;
}

export function getRequestTypeLabel(type: RequestType): string {
  const labels: Record<RequestType, string> = {
    tent_setup: "Tent Setup",
    tent_collection: "Tent Collection",
    general: "General Assistance",
    other: "Other",
  };
  return labels[type];
}

export function getPOICategoryLabel(category: POICategory): string {
  const labels: Record<POICategory, string> = {
    toilet: "🚽 Toilet",
    stage: "🎵 Stage",
    bar: "🍺 Bar",
    food: "🍔 Food",
    first_aid: "🏥 First Aid",
    water: "💧 Water",
    vendor: "🏪 Vendor",
    other: "📍 Other",
  };
  return labels[category];
}

export function getPOICategoryIcon(category: POICategory): string {
  const icons: Record<POICategory, string> = {
    toilet: "🚽",
    stage: "🎵",
    bar: "🍺",
    food: "🍔",
    first_aid: "🏥",
    water: "💧",
    vendor: "🏪",
    other: "📍",
  };
  return icons[category];
}
