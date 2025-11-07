import { useState, useEffect } from "react";
import { Navigation } from "lucide-react";
import "leaflet/dist/leaflet.css";

import { useServiceCenters } from "../hooks/useServiceCenters";
import ServiceCenterList from "../components/ServiceCenters/ServiceCenterList";
import ServiceCenterMap from "../components/ServiceCenters/ServiceCenterMap";
import SelectedCenterDetails from "../components/ServiceCenters/ServiceCenterDetails";
import type { ServiceCenter, MapCenter } from "../types/serviceCenter";
import { calculateDistance, getDirectionsUrl } from "../services/serviceCenterService";
import AuthenticatedNavbar from "@/components/Navbar/AuthenticatedNavbar";
import Footer from "@/components/Footer/Footer";

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
    <div className="min-h-screen bg-black flex flex-col pt-5">
      <AuthenticatedNavbar />
      {/* Header */}
      <header className="bg-black border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-0 pt-22 pb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white mb-2 uppercase">Service Centers</h1>
              <p className="text-sm sm:text-base text-gray-400">
                Find DriveCare service centers near you
              </p>
            </div>
            <button
              onClick={getUserLocation}
              className="w-full sm:w-auto bg-orange-500 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-orange-600 transition flex items-center justify-center gap-2 text-sm sm:text-base whitespace-nowrap"
            >
              <Navigation className="w-4 h-4" />
              Update My Location
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 bg-black py-6 sm:py-8 px-4 sm:px-6 lg:px-4">
        <div className="max-w-7xl mx-auto">
          {locationError && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-900/20 text-red-400 rounded-lg border border-red-900/30 text-sm sm:text-base">
              {locationError}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
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
      <Footer />
    </div>
  );
};

export default ServiceCenters;