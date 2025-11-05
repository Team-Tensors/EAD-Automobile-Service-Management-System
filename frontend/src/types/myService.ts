import type { DetailedAppointment } from "@/services/appointmentService";
import { vehicleService } from "@/services/vehicleService";

/* ---------- 4 possible statuses ---------- */
export type ServiceStatus =
  | "not_started"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface Service {
  id: string;
  vehicleName: string;
  licensePlate: string;
  serviceType: string;
  status: ServiceStatus;
  startDate: string;
  estimatedCompletion: string;
  assignedEmployee: string;
  serviceCenter: string;
}

/* ---------- Mapping from the detailed backend response ---------- */
export const mapDetailedToService = async (
  detailed: DetailedAppointment
): Promise<Service> => {
  // ---- Vehicle name / plate (backend should already give them) ----
  let vehicleName = detailed.vehicleName || "Unknown Vehicle";
  let licensePlate = detailed.licensePlate || "N/A";

  // Fallback – fetch from vehicle service if the backend omitted them
  if (!vehicleName || !licensePlate) {
    try {
      const vehicles = await vehicleService.list(); // all user vehicles
      const match = vehicles.find(v => v.id === detailed.vehicleId);
      if (match) {
        vehicleName = `${match.brand} ${match.model}`;
        licensePlate = match.licensePlate;
      }
    } catch (err) {
      console.error("Failed to fetch vehicles:", err);
    }
  }

  // ---- Map raw DB status to the UI status ----
  let status: ServiceStatus = "not_started";
  switch (detailed.status.toUpperCase()) {
    case "NOT_STARTED":
      status = "not_started";
      break;
    case "IN_PROGRESS":
      status = "in_progress";
      break;
    case "COMPLETED":
      status = "completed";
      break;
    case "CANCELLED":
      status = "cancelled";
      break;
    default:
      status = "not_started";
  }

  return {
    id: detailed.id,
    vehicleName,
    licensePlate,
    serviceType: detailed.service,
    status,
    startDate: detailed.date,
    estimatedCompletion: detailed.estimatedCompletion ?? "TBD",
    assignedEmployee: detailed.assignedEmployee ?? "Not Assigned",
    serviceCenter: detailed.serviceCenter ?? "TBD",
  };
};