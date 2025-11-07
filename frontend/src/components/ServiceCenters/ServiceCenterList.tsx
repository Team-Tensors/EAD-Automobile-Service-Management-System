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
    <div className="space-y-3 sm:space-y-4">
      <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">
        Available Service Centers
        {userLocation && (
          <span className="block sm:inline text-xs sm:text-sm font-normal text-gray-400 sm:ml-2 mt-1 sm:mt-0">
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
            className={`bg-zinc-900/80 backdrop-blur-sm rounded-lg p-4 sm:p-6 border-2 cursor-pointer transition ${
              selectedCenter?.id === center.id
                ? "border-orange-500 bg-zinc-900"
                : "border-zinc-800 hover:border-orange-500/50"
            }`}
            onClick={() => onSelect(center)}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 flex-shrink-0" />
                  <h3 className="font-bold text-base sm:text-lg text-white truncate">{center.name}</h3>
                </div>

                <p className="text-sm sm:text-base text-gray-400 mb-3 line-clamp-2">{center.address}</p>

                {userLocation && (
                  <div className="flex items-center gap-2 mb-3 sm:mb-4">
                    <Navigation className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500 flex-shrink-0" />
                    <span className="text-xs sm:text-sm font-semibold text-white">
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-300 truncate">{center.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 min-w-0">
                    <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-300 truncate">{center.email}</span>
                  </div>
                </div>
              </div>

              <a
              title={`Get directions to ${center.name}`}
                href={getDirectionsUrl(center)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 p-2 sm:p-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
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