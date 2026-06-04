export type UserRole = "camper" | "assistant" | "admin";

export interface Profile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  festival_id: string | null;
  arrival_date: string | null;
  departure_date: string | null;
  created_at: string;
}

export interface Festival {
  id: string;
  name: string;
  location: string;
  start_date: string;
  end_date: string;
  map_image_url: string | null;
  map_pois: MapPOI[];
  created_at: string;
}

export interface MapPOI {
  id: string;
  name: string;
  category: POICategory;
  lat: number;
  lng: number;
  notes: string | null;
}

export type POICategory =
  | "toilet"
  | "stage"
  | "bar"
  | "food"
  | "first_aid"
  | "water"
  | "other";

export interface TentType {
  id: string;
  name: string;
  capacity: number;
  description: string;
  price_per_day: number;
  damage_deposit: number;
  available_quantity: number;
  images: string[];
  festival_id: string;
  created_at: string;
}

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "tent_setup"
  | "tent_collected";

export interface Booking {
  id: string;
  camper_id: string;
  tent_type_id: string;
  festival_id: string;
  arrival_date: string;
  departure_date: string;
  status: BookingStatus;
  assigned_assistant_id: string | null;
  notes: string | null;
  created_at: string;
  tent_type?: TentType;
  camper?: Profile;
}

export type RequestType =
  | "tent_setup"
  | "tent_collection"
  | "general"
  | "other";

export type RequestStatus =
  | "pending"
  | "accepted"
  | "in_progress"
  | "complete"
  | "cancelled";

export interface AssistanceRequest {
  id: string;
  camper_id: string;
  festival_id: string;
  type: RequestType;
  description: string;
  location_description: string;
  status: RequestStatus;
  assigned_assistant_id: string | null;
  rating: number | null;
  created_at: string;
  camper?: Profile;
  assistant?: Profile;
}

export interface AssistantAvailability {
  assistant_id: string;
  is_available: boolean;
  festival_id: string | null;
  updated_at: string;
}
