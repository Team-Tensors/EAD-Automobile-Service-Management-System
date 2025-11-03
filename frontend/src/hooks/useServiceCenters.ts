import { useState, useEffect } from "react";
import { fetchServiceCenters as apiFetchServiceCenters } from "../services/serviceCenterService";
import type { ServiceCenter, UserLocation } from "../types/serviceCenter";

export const useServiceCenters = () => {
  const [serviceCenters, setServiceCenters] = useState<ServiceCenter[]>([]);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState<string>("");

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser.");
      loadServiceCenters(); // fallback
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location: UserLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };
        setUserLocation(location);
        setLocationError("");
        loadServiceCenters(location);
      },
      () => {
        setLocationError("Unable to retrieve your location. Using default location.");
        loadServiceCenters();
      }
    );
  };

  const loadServiceCenters = async (location?: UserLocation) => {
    try {
      const data = await apiFetchServiceCenters(location); // Call API service
      setServiceCenters(data);
    } catch (error) {
      console.error("Error fetching service centers:", error);
      setLocationError(
        (error as Error).message.includes("Authentication")
          ? "Please log in to view service centers."
          : "Failed to load service centers. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUserLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    serviceCenters,
    userLocation,
    loading,
    locationError,
    getUserLocation,
    refetch: loadServiceCenters,
  };
};