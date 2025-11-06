// components/service-centers/ServiceCenterMap.tsx
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Phone, Clock } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import MapViewUpdater from "./MapViewUpdater";
import type { ServiceCenter, UserLocation, MapCenter } from "../../types/serviceCenter";

interface ServiceCenterMapProps {
  mapCenter: MapCenter;
  userLocation: UserLocation | null;
  centers: ServiceCenter[];
  onSelect: (center: ServiceCenter) => void;
}

// Fix default marker icon issues in production
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icon for user location (blue)
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Custom icon for service centers (red)
const serviceCenterIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const ServiceCenterMap = ({ mapCenter, userLocation, centers, onSelect }: ServiceCenterMapProps) => {
  return (
    <div className="sticky top-4 h-[600px]">
      <style>{`
        .leaflet-popup-content-wrapper {
          background-color: #000000 !important;
          color: #ffffff !important;
        }
        .leaflet-popup-tip {
          background-color: #000000 !important;
        }
      `}</style>
      
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

        {/* User Marker - Blue */}
        {userLocation && (
          <Marker 
            position={[userLocation.latitude, userLocation.longitude]}
            icon={userIcon}
          >
            <Popup>
              <div className="text-center">
                <strong className="text-white">Your Location</strong>
                <br />
                <span className="text-sm text-gray-300">Accuracy: {userLocation.accuracy.toFixed(0)} m</span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Service Center Markers - Red */}
        {centers
          .filter((c) => c.isActive)
          .map((center) => (
            <Marker
              key={center.id}
              position={[center.latitude, center.longitude]}
              icon={serviceCenterIcon}
              eventHandlers={{ click: () => onSelect(center) }}
            >
              <Popup>
                <div className="min-w-[200px]">
                  <h3 className="font-bold text-lg mb-2 text-white">{center.name}</h3>
                  <p className="text-sm mb-2 text-gray-300">{center.address}</p>
                  <div className="flex items-center gap-2 mb-1 text-gray-300">
                    <Phone className="w-3 h-3" />
                    <span className="text-sm">{center.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <Clock className="w-3 h-3" />
                    <span className="text-sm">Open Today</span>
                  </div>
                  <button
                    onClick={() => onSelect(center)}
                    className="mt-2 w-full bg-orange-500 text-white py-1 px-2 rounded text-sm hover:bg-orange-600 transition"
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