// src/components/my-services/MyServicesList.tsx
import { Filter, Car, ChevronRight, CheckCircle, CircleDashed } from "lucide-react";
import type { Service } from "../../types/myService";

interface MyServicesListProps {
  services: Service[];
  selectedId: number | null;
  onSelect: (service: Service) => void;
  filter: string;
  onFilterChange: (filter: string) => void;
}

const getStatusColor = (status: string) => {
  return status === "completed"
    ? "bg-green-900/20 text-green-400 border-green-900/30"
    : "bg-orange-900/20 text-orange-400 border-orange-900/30";
};

const getStatusIcon = (status: string) => {
  return status === "completed" ? (
    <CheckCircle className="w-5 h-5 text-green-400" />
  ) : (
    <CircleDashed className="w-5 h-5 text-orange-400" />
  );
};

export const MyServicesList: React.FC<MyServicesListProps> = ({
  services,
  selectedId,
  onSelect,
  filter,
  onFilterChange,
}) => {
  const filtered = filter === "all"
    ? services
    : services.filter((s) => s.status === filter);

  return (
    <div className="bg-zinc-900/80 backdrop-blur-sm rounded-lg p-4 border border-zinc-800">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">My Services</h2>
        <Filter className="w-5 h-5 text-gray-400" />
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {["all", "not_completed", "completed"].map((status) => (
          <button
            key={status}
            onClick={() => onFilterChange(status)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition border ${
              filter === status
                ? "bg-orange-500 text-white border-orange-500"
                : "bg-zinc-800 text-gray-400 border-zinc-700 hover:bg-zinc-700"
            }`}
          >
            {status === "all" ? "ALL" : status === "not_completed" ? "ACTIVE" : "COMPLETED"}
          </button>
        ))}
      </div>

      <div className="space-y-3 max-h-[600px] overflow-y-auto">
        {filtered.map((service) => (
          <div
            key={service.id}
            onClick={() => onSelect(service)}
            className={`p-4 rounded-lg border-2 cursor-pointer transition ${
              selectedId === service.id
                ? "border-orange-500 bg-zinc-900"
                : "border-zinc-800 hover:border-orange-500/50 bg-zinc-900/50"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Car className="w-4 h-4 text-gray-400" />
                  <p className="font-semibold text-white">{service.vehicleName}</p>
                </div>
                <p className="text-sm text-gray-400 mb-2">{service.vehicleNumber}</p>
                <p className="text-xs text-gray-500 mb-2">{service.serviceType}</p>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                    service.status
                  )}`}
                >
                  {getStatusIcon(service.status)}
                  {service.status === "completed" ? "COMPLETED" : "IN PROGRESS"}
                </span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};