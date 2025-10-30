// src/components/ServiceCenters.tsx
import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import { MapPin, Navigation, Phone, Mail, Clock } from "lucide-react";
import api from "../util/apiUtils";
import "leaflet/dist/leaflet.css";

// Types – **NO services**
interface ServiceCenter {
  id: number;
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

interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
}

function MapViewUpdater({ center }: { center: LatLngExpression }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom() || 10);
  }, [center, map]);
  return null;
}

const ServiceCenters = () => {
  const [serviceCenters, setServiceCenters] = useState<ServiceCenter[]>([]);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [selectedCenter, setSelectedCenter] = useState<ServiceCenter | null>(null);
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState<string>("");

  const [mapCenter, setMapCenter] = useState<LatLngExpression>([6.9271, 79.8612]);

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser.");
      fetchServiceCenters();
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };
        setUserLocation(location);
        setMapCenter([location.latitude, location.longitude]);
        setLocationError("");
        fetchServiceCenters(location);
      },
      () => {
        setLocationError("Unable to retrieve your location. Using default location.");
        fetchServiceCenters();
      }
    );
  };

  const fetchServiceCenters = async (location?: UserLocation) => {
    try {
      let url = "/service-centers/with-services";
      if (location) {
        url = `/service-centers/nearby-with-services?lat=${location.latitude}&lng=${location.longitude}&radius=50`;
      }
      const response = await api.get(url);
      setServiceCenters(response.data);
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
  }, []);

  const calculateDistance = (
    lat1: number, lon1: number, lat2: number, lon2: number
  ): string => {
    const R = 6371;
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

  const getDirectionsUrl = (center: ServiceCenter): string =>
    userLocation
      ? `https://www.google.com/maps/dir/${userLocation.latitude},${userLocation.longitude}/${center.latitude},${center.longitude}`
      : `https://www.google.com/maps/dir//${center.latitude},${center.longitude}`;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading service centers...</p>
        </div>
      </div>
    );
  }

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
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-card-foreground mb-4">
              Available Service Centers
              {userLocation && (
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  (Sorted by distance)
                </span>
              )}
            </h2>

            {serviceCenters
              .filter((c) => c.isActive)
              .sort((a, b) => {
                if (!userLocation) return 0;
                const distA = parseFloat(
                  calculateDistance(userLocation.latitude, userLocation.longitude, a.latitude, a.longitude)
                );
                const distB = parseFloat(
                  calculateDistance(userLocation.latitude, userLocation.longitude, b.latitude, b.longitude)
                );
                return distA - distB;
              })
              .map((center) => (
                <div
                  key={center.id}
                  className={`bg-card rounded-lg shadow-md p-6 border-2 cursor-pointer transition ${
                    selectedCenter?.id === center.id
                      ? "border-primary bg-accent/50"
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedCenter(center)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-4 h-4 text-chart-1" />
                        <h3 className="font-bold text-lg text-card-foreground">{center.name}</h3>
                      </div>

                      <p className="text-muted-foreground mb-2">{center.address}</p>

                      {userLocation && (
                        <div className="flex items-center gap-2 mb-3">
                          <Navigation className="w-4 h-4 text-chart-2" />
                          <span className="text-sm font-semibold text-card-foreground">
                            {calculateDistance(
                              userLocation.latitude,
                              userLocation.longitude,
                              center.latitude,
                              center.longitude
                            )}{" "}
                            km away
                          </span>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <span className="text-card-foreground">{center.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span className="text-card-foreground">{center.email}</span>
                        </div>
                      </div>
                    </div>

                    <a
                      href={getDirectionsUrl(center)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-4 p-2 bg-chart-2 text-white rounded-lg hover:bg-chart-2/90 transition"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Navigation className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ))}
          </div>

          {/* Map */}
          <div className="sticky top-4 h-[600px]">
            <MapContainer
              center={mapCenter}
              zoom={10}
              style={{ height: "100%", width: "100%", borderRadius: "0.5rem" }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapViewUpdater center={mapCenter} />

              {/* User Marker */}
              {userLocation && (
                <Marker position={[userLocation.latitude, userLocation.longitude]}>
                  <Popup>
                    <div className="text-center">
                      <strong>Your Location</strong>
                      <br />
                      <span className="text-sm">Accuracy: {userLocation.accuracy.toFixed(0)} m</span>
                    </div>
                  </Popup>
                </Marker>
              )}

              {/* Service Center Markers */}
              {serviceCenters
                .filter((c) => c.isActive)
                .map((center) => (
                  <Marker
                    key={center.id}
                    position={[center.latitude, center.longitude]}
                    eventHandlers={{ click: () => setSelectedCenter(center) }}
                  >
                    <Popup>
                      <div className="min-w-[200px]">
                        <h3 className="font-bold text-lg mb-2">{center.name}</h3>
                        <p className="text-sm mb-2">{center.address}</p>
                        <div className="flex items-center gap-2 mb-1">
                          <Phone className="w-3 h-3" />
                          <span className="text-sm">{center.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          <span className="text-sm">Open Today</span>
                        </div>
                        <button
                          onClick={() => setSelectedCenter(center)}
                          className="mt-2 w-full bg-chart-2 text-white py-1 px-2 rounded text-sm hover:bg-chart-2/90 transition"
                        >
                          View Details
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                ))}
            </MapContainer>
          </div>
        </div>

        {/* Selected Center Details – ONLY contact + operating hours */}
        {selectedCenter && (
          <div className="mt-8 bg-card rounded-lg shadow-md p-6 border border-border">
            <h2 className="text-2xl font-bold text-card-foreground mb-4">
              {selectedCenter.name} - Details
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Contact */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-card-foreground">Contact Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-chart-1" />
                    <div>
                      <p className="text-sm text-muted-foreground">Address</p>
                      <p className="font-medium text-card-foreground">{selectedCenter.address}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-chart-1" />
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium text-card-foreground">{selectedCenter.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-chart-1" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium text-card-foreground">{selectedCenter.email}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Operating Hours */}
              <div>
                <h3 className="font-semibold text-lg text-card-foreground mb-4">Operating Hours</h3>
                <div className="bg-secondary rounded-lg p-4 border border-border">
                  <pre className="text-sm text-card-foreground whitespace-pre-wrap">
                    {selectedCenter.operatingHours
                      ? Object.entries(JSON.parse(selectedCenter.operatingHours)).map(([day, hours]) => (
                          <div key={day} className="flex justify-between">
                            <span className="capitalize">{day}:</span>
                            <span>{hours as string}</span>
                          </div>
                        ))
                      : "Operating hours not available"}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceCenters;