import { MapPin, Clock, User, Download } from "lucide-react";
import type { Service, ServiceStatus } from "../../types/myService";
import { ServiceLocationMap } from "./ServiceLocationMap";
import { ServiceProgressBar } from "./ServiceProgressBar";
import { handleDownloadReport } from "./ServiceReportGenerator";

interface MyServiceDetailsProps {
  service: Service;
  showMap: boolean;
  onToggleMap: () => void;
}

/* ---------- UI helpers ---------- */
const getStatusColor = (status: ServiceStatus) => {
  switch (status) {
    case "pending":
      return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
    case "confirmed":
      return "bg-green-500/10 text-green-500 border-green-500/20";
    case "in_progress":
      return "bg-orange-500/10 text-orange-500 border-orange-500/20";
    case "completed":
      return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    case "cancelled":
      return "bg-red-500/10 text-red-500 border-red-500/20";
    default:
      return "bg-gray-500/10 text-gray-500 border-gray-500/20";
  }
};

const getStatusLabel = (status: ServiceStatus) => {
  switch (status) {
    case "pending":
      return "PENDING";
    case "confirmed":
      return "CONFIRMED";
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

/* ---------- Component ---------- */
export const MyServiceDetails: React.FC<MyServiceDetailsProps> = ({
  service,
  showMap,
  onToggleMap,
}) => {
  return (
    <div className="space-y-6">
      {/* Progress Bar - Show for non-cancelled services */}
      {service.status !== "cancelled" && (
        <ServiceProgressBar status={service.status} />
      )}

      {/* Header */}
      <div className="bg-zinc-900/80 backdrop-blur-sm rounded-lg p-6 border border-zinc-800">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {service.vehicleName}
            </h2>
            {/* Start Date */}
            <div className="flex items-center divide-x divide-gray-500 text-gray-400">
              <p className="pr-2">{service.serviceType}</p>
              <p className="pl-2 pr-2">{formatDate(service.startDate)}</p>
              <p className="pl-2">
                {new Date(service.startDate).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
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
                {service.actualStartTime
                  ? new Date(service.actualStartTime).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Not Started"}
              </p>
            </div>
          </div>

          {/* End Time - Show when service is completed */}
          {service.status === "completed" && (
            <div className="flex items-center gap-3 p-3 bg-black/40 rounded-lg border border-zinc-800">
              <Clock className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-xs text-gray-400">End Time</p>
                <p className="font-semibold text-white">
                  {service.actualEndTime
                    ? new Date(service.actualEndTime).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Not Available"}
                </p>
              </div>
            </div>
          )}
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
          <button
            onClick={() => handleDownloadReport(service)}
            disabled={service.status !== "completed"}
            className={`flex-1 px-4 py-2 rounded-lg font-semibold transition flex items-center justify-center gap-2 border ${
              service.status === "completed"
                ? "bg-zinc-800 text-white border-zinc-700 hover:bg-zinc-700 cursor-pointer"
                : "bg-zinc-900 text-gray-600 border-zinc-800 cursor-not-allowed opacity-50"
            }`}
            title={
              service.status !== "completed"
                ? "Report available only for completed services"
                : "Download service completion report"
            }
          >
            <Download className="w-4 h-4" />
            {service.status === "completed"
              ? "Download Report"
              : "Report Unavailable"}
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
