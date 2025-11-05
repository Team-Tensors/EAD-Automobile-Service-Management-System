import type { AppointmentSummary } from "@/services/slotAppointmentService";
import { vehicleService } from "@/services/vehicleService";

export interface Service {
  id: string;
  vehicleName: string;
  licensePlate: string;
  serviceType: string;
  status: "completed" | "not_completed";
  startDate: string;
  estimatedCompletion: string;
  assignedEmployee: string;
  serviceCenter: string;
  centerSlot: string | number;
}

export const mapSummaryToService = async (summary: AppointmentSummary): Promise<Service> => {
  let vehicleName = "Unknown Vehicle";
  let licensePlate = "N/A";

  try {
    const vehicles = await vehicleService.list();
    const matchedVehicle = vehicles.find((v) => v.id === summary.vehicle);
    if (matchedVehicle) {
      vehicleName = `${matchedVehicle.brand} ${matchedVehicle.model}`;
      licensePlate = matchedVehicle.licensePlate;
    } else {
      vehicleName = summary.vehicle || "Unknown Vehicle";
    }
  } catch (err) {
    console.error("Failed to fetch vehicles:", err);
    vehicleName = summary.vehicle || "Unknown Vehicle";
  }

  const status: "completed" | "not_completed" = summary.status === "COMPLETED" ? "completed" : "not_completed";

  return {
    id: summary.id,
    vehicleName,
    licensePlate,
    serviceType: summary.service,
    status,
    startDate: summary.date,
    estimatedCompletion: summary.estimatedCompletion || "TBD",
    assignedEmployee: summary.assignedEmployee || "Not Assigned",
    serviceCenter: summary.serviceCenter || "Unknown Center",
    centerSlot: summary.centerSlot != null ? summary.centerSlot.toString() : "None",
  } as Service;
};