import {
  Filter,
  Car,
  ChevronRight,
  CheckCircle,
  CircleDashed,
  AlertCircle,
  XCircle,
} from "lucide-react";
import type { Service, ServiceStatus } from "../../types/myService";

interface MyServicesListProps {
  services: Service[];
  selectedId: string | null;
  onSelect: (service: Service) => void;
  filter: string;
  onFilterChange: (filter: string) => void;
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

const getStatusIcon = (status: ServiceStatus) => {
  switch (status) {
    case "not_started":
      return <AlertCircle className="w-5 h-5 text-blue-400" />;
    case "in_progress":
      return <CircleDashed className="w-5 h-5 text-orange-400" />;
    case "completed":
      return <CheckCircle className="w-5 h-5 text-green-400" />;
    case "cancelled":
      return <XCircle className="w-5 h-5 text-red-400" />;
    default:
      return <CircleDashed className="w-5 h-5 text-gray-400" />;
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

/* ---------- Component ---------- */
export const MyServicesList: React.FC<MyServicesListProps> = ({
  services,
  selectedId,
  onSelect,
  filter,
  onFilterChange,
}) => {
  const filtered =
    filter === "all" ? services : services.filter(s => s.status === filter);

  return (
    <div className="bg-zinc-900/80 backdrop-blur-sm rounded-lg p-4 border border-zinc-800">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">My Services</h2>
        <Filter className="w-5 h-5 text-gray-400" />
      </div>

      {/* Filter buttons – now 5 (all + 4 statuses) */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {["all", "not_started", "in_progress", "completed", "cancelled"].map(st => (
          <button
            key={st}
            onClick={() => onFilterChange(st)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition border ${
              filter === st
                ? "bg-orange-500 text-white border-orange-500"
                : "bg-zinc-800 text-gray-400 border-zinc-700 hover:bg-zinc-700"
            }`}
          >
            {st === "all" ? "ALL" : getStatusLabel(st as ServiceStatus)}
          </button>
        ))}
      </div>

      <div className="space-y-3 max-h-[600px] overflow-y-auto">
        {filtered.map(service => (
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
                <p className="text-sm text-gray-400 mb-2">{service.licensePlate}</p>
                <p className="text-xs text-gray-500 mb-2">{service.serviceType}</p>

                <span
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                    service.status
                  )}`}
                >
                  {getStatusIcon(service.status)}
                  {getStatusLabel(service.status)}
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