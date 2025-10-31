// components/service-centers/ServiceCenterList.tsx
import { MapPin, Navigation, Phone, Mail } from "lucide-react";
import type { ServiceCenter, UserLocation } from "../../types/serviceCenter";

interface ServiceCenterListProps {
  centers: ServiceCenter[];
  userLocation: UserLocation | null;
  selectedCenter: ServiceCenter | null;
  onSelect: (center: ServiceCenter) => void;
  calculateDistance: (lat1: number, lon1: number, lat2: number, lon2: number) => string;
  getDirectionsUrl: (center: ServiceCenter) => string;
}

const ServiceCenterList = ({
  centers,
  userLocation,
  selectedCenter,
  onSelect,
  calculateDistance,
  getDirectionsUrl,
}: ServiceCenterListProps) => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-card-foreground mb-4">
        Available Service Centers
        {userLocation && (
          <span className="text-sm font-normal text-muted-foreground ml-2">
            (Sorted by distance)
          </span>
        )}
      </h2>

      {centers
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
            onClick={() => onSelect(center)}
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
  );
};

export default ServiceCenterList;