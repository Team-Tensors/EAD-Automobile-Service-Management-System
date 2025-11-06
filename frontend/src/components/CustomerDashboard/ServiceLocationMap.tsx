import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { MapPin, Navigation } from "lucide-react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icons in React-Leaflet
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

interface ServiceLocationMapProps {
  location: {
    name: string;
    address: string;
    city: string;
    latitude: number;
    longitude: number;
  };
}

export const ServiceLocationMap: React.FC<ServiceLocationMapProps> = ({
  location,
}) => {
  const openInGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`;
    window.open(url, "_blank");
  };

  return (
    <div className="bg-zinc-900/80 backdrop-blur-sm rounded-lg border border-zinc-800 overflow-hidden">
      <div className="p-3 border-b border-zinc-800">
        <h3 className="text-base font-semibold text-white flex items-center gap-2">
          <MapPin className="w-4 h-4 text-orange-500" />
          Service Center Location
        </h3>
      </div>

      <div className="relative">
        <MapContainer
          center={[location.latitude, location.longitude]}
          zoom={15}
          style={{ height: "250px", width: "100%" }}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[location.latitude, location.longitude]}>
            <Popup>
              <div className="min-w-[180px]">
                <h4 className="font-bold text-sm mb-1">{location.name}</h4>
                <p className="text-xs text-gray-600 mb-1">{location.address}</p>
                <p className="text-xs text-gray-600 mb-2">{location.city}</p>
                <button
                  onClick={openInGoogleMaps}
                  className="w-full bg-orange-500 text-white py-1.5 px-2 rounded text-xs hover:bg-orange-600 transition flex items-center justify-center gap-1.5"
                >
                  <Navigation className="w-3 h-3" />
                  Get Directions
                </button>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>

      <div className="p-3 bg-black/40">
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-white font-semibold text-sm mb-0.5">
              {location.name}
            </p>
            <p className="text-xs text-gray-400">{location.address}</p>
            <p className="text-xs text-gray-400">{location.city}</p>
          </div>
        </div>
        <button
          onClick={openInGoogleMaps}
          className="mt-3 w-full bg-zinc-800 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-zinc-700 transition flex items-center justify-center gap-2 border border-zinc-700"
        >
          <Navigation className="w-4 h-4" />
          Get Directions in Google Maps
        </button>
      </div>
    </div>
  );
};
