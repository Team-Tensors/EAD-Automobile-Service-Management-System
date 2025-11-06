import type { DetailedAppointment } from "@/services/appointmentService";
import { vehicleService } from "@/services/vehicleService";
import { fetchServiceCenters } from "@/services/serviceCenterService";

/* ---------- 5 possible statuses ---------- */
export type ServiceStatus =
  | "pending"
  | "confirmed"
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
  serviceCenterLocation?: {
    name: string;
    address: string;
    city: string;
    latitude: number;
    longitude: number;
  };
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
      const match = vehicles.find((v) => v.id === detailed.vehicleId);
      if (match) {
        vehicleName = `${match.brand} ${match.model}`;
        licensePlate = match.licensePlate;
      }
    } catch (err) {
      console.error("Failed to fetch vehicles:", err);
    }
  }

  // ---- Fetch service center location data ----
  let serviceCenterLocation;
  try {
    const serviceCenters = await fetchServiceCenters();
    const matchingCenter = serviceCenters.find(
      (center) => center.name === detailed.serviceCenter
    );
    if (matchingCenter) {
      serviceCenterLocation = {
        name: matchingCenter.name,
        address: matchingCenter.address,
        city: matchingCenter.city,
        latitude: matchingCenter.latitude,
        longitude: matchingCenter.longitude,
      };
    }
  } catch (err) {
    console.error("Failed to fetch service center location:", err);
  }

  // ---- Map raw DB status to the UI status ----
  let status: ServiceStatus = "pending";
  switch (detailed.status.toUpperCase()) {
    case "PENDING":
      status = "pending";
      break;
    case "NOT_STARTED":
    case "CONFIRMED":
      status = "confirmed";
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
      status = "pending";
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
    serviceCenterLocation,
  };
};
