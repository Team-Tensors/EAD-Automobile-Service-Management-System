import type { LatLngExpression } from "leaflet";

export interface ServiceCenter {
  id: string; // UUID from backend
  name: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  phone: string;
  email: string;
  operatingHours: string;
  isActive: boolean;
}

export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export type MapCenter = LatLngExpression;