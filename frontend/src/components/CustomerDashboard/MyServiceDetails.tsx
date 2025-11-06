import { MapPin, Clock, User, Download } from "lucide-react";
import type { Service, ServiceStatus } from "../../types/myService";
import { ServiceLocationMap } from "./ServiceLocationMap";

interface MyServiceDetailsProps {
  service: Service;
  showMap: boolean;
  onToggleMap: () => void;
}

/* ---------- UI helpers ---------- */
const getStatusColor = (status: ServiceStatus) => {
  switch (status) {
    case "not_started":
      return "bg-blue-900/20 text-blue-400 border-blue-900/30";
    case "in_progress":
      return "bg-orange-900/20 text-orange-400 border-orange-900/30";
    case "completed":
      return "bg-green-900/20 text-green-400 border-green-900/30";
    case "cancelled":
      return "bg-red-900/20 text-red-400 border-red-900/30";
    default:
      return "bg-gray-900/20 text-gray-400 border-gray-900/30";
  }
};

const getStatusLabel = (status: ServiceStatus) => {
  switch (status) {
    case "not_started":
      return "NOT STARTED";
    case "in_progress":
      return "IN PROGRESS";
    case "completed":
      return "COMPLETED";
    case "cancelled":
      return "CANCELLED";
    default:
      return "UNKNOWN";
  }
};

const formatDate = (dateString: string) => {
  const d = new Date(dateString);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/* ---------- NEW: Human-readable estimated completion ---------- */
const formatEstimatedCompletion = (isoOrTbd: string): string => {
  if (isoOrTbd === "TBD") return "TBD";

  const d = new Date(isoOrTbd);
  if (Number.isNaN(d.getTime())) return "TBD";

  const date = d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const time = d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${date} at ${time}`; // e.g. "Nov 10, 2025 at 04:00 PM"
};

/* ---------- Component ---------- */
export const MyServiceDetails: React.FC<MyServiceDetailsProps> = ({
  service,
  showMap,
  onToggleMap,
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-zinc-900/80 backdrop-blur-sm rounded-lg p-6 border border-zinc-800">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {service.vehicleName}
            </h2>
            <div className="flex items-center divide-x divide-gray-500 text-gray-400">
              <p className="pr-2">{service.serviceType}</p>
              <p className="pl-2">{formatDate(service.startDate)}</p>
            </div>
          </div>
          <span
            className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(
              service.status
            )}`}
          >
            {getStatusLabel(service.status)}
          </span>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Service Center */}
          <div className="flex items-center gap-3 p-3 bg-black/40 rounded-lg border border-zinc-800">
            <MapPin className="w-5 h-5 text-orange-500" />
            <div>
              <p className="text-xs text-gray-400">Service Center</p>
              <p className="font-semibold text-white">
                {service.serviceCenter}
              </p>
            </div>
          </div>

          {/* Assigned Employee */}
          <div className="flex items-center gap-3 p-3 bg-black/40 rounded-lg border border-zinc-800">
            <User className="w-5 h-5 text-orange-500" />
            <div>
              <p className="text-xs text-gray-400">Assigned Employee</p>
              <p className="font-semibold text-white">
                {service.assignedEmployee}
              </p>
            </div>
          </div>

          {/* Start Time */}
          <div className="flex items-center gap-3 p-3 bg-black/40 rounded-lg border border-zinc-800">
            <Clock className="w-5 h-5 text-orange-500" />
            <div>
              <p className="text-xs text-gray-400">Start Time</p>
              <p className="font-semibold text-white">
                {new Date(service.startDate).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>

          {/* Estimated Completion – User Friendly */}
          <div className="flex items-center gap-3 p-3 bg-black/40 rounded-lg border border-zinc-800">
            <Clock className="w-5 h-5 text-orange-500" />
            <div>
              <p className="text-xs text-gray-400">Est. Completion</p>
              <p className="font-semibold text-white">
                {formatEstimatedCompletion(service.estimatedCompletion)}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onToggleMap}
            className="flex-1 bg-orange-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-600 transition flex items-center justify-center gap-2"
          >
            <MapPin className="w-4 h-4" />
            {showMap ? "Hide" : "Show"} Location
          </button>
          <button className="flex-1 bg-zinc-800 text-white px-4 py-2 rounded-lg font-semibold hover:bg-zinc-700 transition flex items-center justify-center gap-2 border border-zinc-700">
            <Download className="w-4 h-4" />
            Download Report
          </button>
        </div>
      </div>

      {/* Map */}
      {showMap && service.serviceCenterLocation && (
        <ServiceLocationMap location={service.serviceCenterLocation} />
      )}

      {/* Fallback if no location data */}
      {showMap && !service.serviceCenterLocation && (
        <div className="bg-zinc-900/80 backdrop-blur-sm rounded-lg p-6 border border-zinc-800">
          <h3 className="text-lg font-bold text-white mb-4">
            Service Center Location
          </h3>
          <div className="bg-black/40 rounded-lg h-64 flex items-center justify-center border border-zinc-800">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-orange-500 mx-auto mb-2" />
              <p className="text-gray-400">
                Location information not available
              </p>
              <p className="text-sm text-gray-400 mt-2">
                {service.serviceCenter}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
