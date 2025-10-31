// pages/ServiceCenters.tsx
import { useState, useEffect } from "react";
import { Navigation } from "lucide-react";
import "leaflet/dist/leaflet.css";

import { useServiceCenters } from "../hooks/useServiceCenters";
import ServiceCenterList from "../components/ServiceCenters/ServiceCenterList";
import ServiceCenterMap from "../components/ServiceCenters/ServiceCenterMap";
import SelectedCenterDetails from "../components/ServiceCenters/ServiceCenterDetails";
import type { ServiceCenter, MapCenter } from "../types/serviceCenter";
import { calculateDistance, getDirectionsUrl } from "../services/serviceCenterService";

const ServiceCenters = () => {
  const { serviceCenters, userLocation, locationError, getUserLocation } = useServiceCenters();
  const [selectedCenter, setSelectedCenter] = useState<ServiceCenter | null>(null);
  const [mapCenter, setMapCenter] = useState<MapCenter>([6.9271, 79.8612]);

  // Update map center when user location is available
  useEffect(() => {
    if (userLocation) {
      setMapCenter([userLocation.latitude, userLocation.longitude]);
    }
  }, [userLocation]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Service Centers</h1>
              <p className="text-primary-foreground/80 mt-1">
                Find DriveCare service centers near you
              </p>
            </div>
            <button
              onClick={getUserLocation}
              className="bg-accent text-accent-foreground px-4 py-2 rounded-lg font-semibold hover:bg-accent/90 transition border border-border flex items-center gap-2"
            >
              <Navigation className="w-4 h-4" />
              Update My Location
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {locationError && (
          <div className="mb-6 p-4 bg-destructive/20 text-destructive-foreground rounded-lg border border-destructive/30">
            {locationError}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* List */}
          <ServiceCenterList
            centers={serviceCenters}
            userLocation={userLocation}
            selectedCenter={selectedCenter}
            onSelect={setSelectedCenter}
            calculateDistance={calculateDistance}
            getDirectionsUrl={getDirectionsUrl}
          />

          {/* Map */}
          <ServiceCenterMap
            mapCenter={mapCenter}
            userLocation={userLocation}
            centers={serviceCenters}
            onSelect={setSelectedCenter}
          />
        </div>

        {/* Selected Center Details */}
        {selectedCenter && <SelectedCenterDetails center={selectedCenter} />}
      </div>
    </div>
  );
};

export default ServiceCenters;