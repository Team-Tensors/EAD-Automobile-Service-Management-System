import api from "../util/apiUtils";
import type { ServiceCenter, UserLocation } from "../types/serviceCenter";

// API calls
export const fetchServiceCenters = async (location?: UserLocation): Promise<ServiceCenter[]> => {
  let url = "/service-centers/with-services";
  if (location) {
    url = `/service-centers/nearby-with-services?lat=${location.latitude}&lng=${location.longitude}&radius=50`;
  }
  const response = await api.get(url);
  return response.data;
};

// Utility functions
/**
 * Calculate distance between two coordinates using Haversine formula
 * @returns Distance in kilometers (as string with 1 decimal place)
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): string => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(1);
};

/**
 * Generate Google Maps directions URL
 */
export const getDirectionsUrl = (
  center: ServiceCenter,
  userLocation?: UserLocation | null
): string => {
  if (userLocation) {
    return `https://www.google.com/maps/dir/${userLocation.latitude},${userLocation.longitude}/${center.latitude},${center.longitude}`;
  }
  return `https://www.google.com/maps/dir//${center.latitude},${center.longitude}`;
};

/**
 * Sort service centers by distance from user location
 */
export const sortCentersByDistance = (
  centers: ServiceCenter[],
  userLocation: UserLocation
): ServiceCenter[] => {
  return [...centers].sort((a, b) => {
    const distA = parseFloat(
      calculateDistance(userLocation.latitude, userLocation.longitude, a.latitude, a.longitude)
    );
    const distB = parseFloat(
      calculateDistance(userLocation.latitude, userLocation.longitude, b.latitude, b.longitude)
    );
    return distA - distB;
  });
};