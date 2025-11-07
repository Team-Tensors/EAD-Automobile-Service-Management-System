import {
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

const getStatusIcon = (status: ServiceStatus) => {
  switch (status) {
    case "pending":
      return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    case "confirmed":
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case "in_progress":
      return <CircleDashed className="w-4 h-4 text-orange-500" />;
    case "completed":
      return <CheckCircle className="w-4 h-4 text-blue-500" />;
    case "cancelled":
      return <XCircle className="w-4 h-4 text-red-500" />;
    default:
      return <CircleDashed className="w-4 h-4 text-gray-500" />;
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

/* ---------- Component ---------- */
export const MyServicesList: React.FC<MyServicesListProps> = ({
  services,
  selectedId,
  onSelect,
}) => {
  return (
    <div className="bg-zinc-900/80 backdrop-blur-sm rounded-lg p-4 border border-zinc-800">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">My Appointments</h2>
      </div>

      <div className="space-y-3 max-h-[600px] overflow-y-auto">
        {services.map((service) => (
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
                  <p className="font-semibold text-white">
                    {service.vehicleName}
                  </p>
                </div>
                <p className="text-sm text-gray-400 mb-2">
                  {service.licensePlate}
                </p>
                <p className="text-xs text-gray-500 mb-2">
                  {service.serviceType}
                </p>

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
