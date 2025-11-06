import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { MapPin, Phone, ExternalLink } from "lucide-react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { serviceCenterService } from "@/services/serviceCenterService";
import type { ServiceCenter } from "@/types/serviceCenter";

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom orange marker icon
const orangeIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export const ServiceCentersMap = () => {
  const [serviceCenters, setServiceCenters] = useState<ServiceCenter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCenters = async () => {
      try {
        const centers = await serviceCenterService.getAllServiceCenters();
        setServiceCenters(centers);
      } catch (error) {
        console.error("Failed to fetch service centers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCenters();
  }, []);

  // Calculate center of Sri Lanka (approximate)
  const sriLankaCenter: [number, number] = [7.8731, 80.7718];
  const defaultZoom = 8;

  if (loading) {
    return (
      <div className="relative bg-zinc-900/50 rounded-lg overflow-hidden h-64 lg:h-80 flex items-center justify-center">
        <div className="text-center">
          <MapPin className="w-12 h-12 text-orange-600 mx-auto mb-2 animate-pulse" />
          <p className="text-gray-400 text-sm">Loading Service Centers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-zinc-900 rounded-lg overflow-hidden h-64 lg:h-80">
      <MapContainer
        center={sriLankaCenter}
        zoom={defaultZoom}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {serviceCenters.map((center) => (
          <Marker
            key={center.id}
            position={[center.latitude, center.longitude]}
            icon={orangeIcon}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                <h3 className="font-bold text-base mb-2 text-orange-600">
                  {center.name}
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-gray-700">{center.address}</p>
                      <p className="text-gray-600">{center.city}</p>
                    </div>
                  </div>
                  {center.contactNumber && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-600" />
                      <a
                        href={`tel:${center.contactNumber}`}
                        className="text-blue-600 hover:underline"
                      >
                        {center.contactNumber}
                      </a>
                    </div>
                  )}
                  <a
                    href={`https://www.google.com/maps/dir//${center.latitude},${center.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-orange-600 hover:text-orange-700 font-medium mt-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Get Directions
                  </a>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg z-[1000]">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
          <span className="text-xs font-medium text-gray-700">
            {serviceCenters.length} Service Center
            {serviceCenters.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>
    </div>
  );
};
