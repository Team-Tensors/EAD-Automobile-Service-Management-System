// components/service-centers/ServiceCenterMap.tsx
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Phone, Clock } from "lucide-react";
import MapViewUpdater from "./MapViewUpdater";
import type { ServiceCenter, UserLocation, MapCenter } from "../../types/serviceCenter";

interface ServiceCenterMapProps {
  mapCenter: MapCenter;
  userLocation: UserLocation | null;
  centers: ServiceCenter[];
  onSelect: (center: ServiceCenter) => void;
}

const ServiceCenterMap = ({ mapCenter, userLocation, centers, onSelect }: ServiceCenterMapProps) => {
  return (
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
        {centers
          .filter((c) => c.isActive)
          .map((center) => (
            <Marker
              key={center.id}
              position={[center.latitude, center.longitude]}
              eventHandlers={{ click: () => onSelect(center) }}
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
                    onClick={() => onSelect(center)}
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
  );
};

export default ServiceCenterMap;