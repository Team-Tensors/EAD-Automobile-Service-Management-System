// src/components/my-services/MyServiceDetails.tsx
import { MapPin, Clock, Car, Calendar, User, Download } from "lucide-react";
import type { Service } from "../../types/myService";

interface MyServiceDetailsProps {
  service: Service;
  showMap: boolean;
  onToggleMap: () => void;
}

const getStatusColor = (status: string) => {
  return status === "completed"
    ? "bg-green-900/20 text-green-400 border-green-900/30"
    : "bg-orange-900/20 text-orange-400 border-orange-900/30";
};

export const MyServiceDetails: React.FC<MyServiceDetailsProps> = ({
  service,
  showMap,
  onToggleMap,
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-zinc-900/80 backdrop-blur-sm rounded-lg p-6 border border-zinc-800">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {service.vehicleName}
            </h2>
            <p className="text-gray-400">{service.serviceType}</p>
          </div>
          <span
            className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(
              service.status
            )}`}
          >
            {service.status === "completed" ? "COMPLETED" : "IN PROGRESS"}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 bg-black/40 rounded-lg border border-zinc-800">
            <MapPin className="w-5 h-5 text-orange-500" />
            <div>
              <p className="text-xs text-gray-400">Service Center</p>
              <p className="font-semibold text-white">{service.serviceCenter}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-black/40 rounded-lg border border-zinc-800">
            <Car className="w-5 h-5 text-orange-500" />
            <div>
              <p className="text-xs text-gray-400">Center Slot</p>
              <p className="font-semibold text-white">{service.centerSlot}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-black/40 rounded-lg border border-zinc-800">
            <Calendar className="w-5 h-5 text-orange-500" />
            <div>
              <p className="text-xs text-gray-400">Start Date</p>
              <p className="font-semibold text-white">{service.startDate}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-black/40 rounded-lg border border-zinc-800">
            <Clock className="w-5 h-5 text-orange-500" />
            <div>
              <p className="text-xs text-gray-400">Est. Completion</p>
              <p className="font-semibold text-white">{service.estimatedCompletion}</p>
            </div>
          </div>
          <div className="col-span-2 flex items-center gap-3 p-3 bg-black/40 rounded-lg border border-zinc-800">
            <User className="w-5 h-5 text-orange-500" />
            <div>
              <p className="text-xs text-gray-400">Assigned Employee</p>
              <p className="font-semibold text-white">{service.assignedEmployee}</p>
            </div>
          </div>
        </div>

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

      {showMap && (
        <div className="bg-zinc-900/80 backdrop-blur-sm rounded-lg p-6 border border-zinc-800">
          <h3 className="text-lg font-bold text-white mb-4">Service Center Location</h3>
          <div className="bg-black/40 rounded-lg h-64 flex items-center justify-center border border-zinc-800">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-orange-500 mx-auto mb-2" />
              <p className="text-gray-400">Map integration with Google Maps / Leaflet</p>
              <p className="text-sm text-gray-400 mt-2">{service.serviceCenter}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};