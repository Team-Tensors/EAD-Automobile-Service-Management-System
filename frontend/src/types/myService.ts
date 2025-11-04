import type { AppointmentSummary } from "@/services/appointmentService";
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
  centerSlot: string;
}

export const mapSummaryToService = async (summary: AppointmentSummary): Promise<Service> => {
  let vehicleName = "Unknown Vehicle";
  let licensePlate = "N/A";

  if (summary.vehicle && summary.vehicle.includes(" • ")) {
    const [name, plate] = summary.vehicle.split(" • ");
    vehicleName = name || "Unknown Vehicle";
    licensePlate = plate || "N/A";
  } else {
    try {
      const vehicles = await vehicleService.list();
      const matchedVehicle = vehicles.find((v) => `${v.brand} ${v.model}` === summary.vehicle);
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
  }

  const status: "completed" | "not_completed" = summary.status === "COMPLETED" ? "completed" : "not_completed";

  return {
    id: summary.id,
    vehicleName,
    licensePlate,
    serviceType: summary.service,
    status,
    startDate: summary.date,
    estimatedCompletion: (summary as any).estimatedCompletion ?? "TBD",
    assignedEmployee: (summary as any).assignedEmployee ?? "Not Assigned",
    serviceCenter: (summary as any).serviceCenter ?? "TBD",
    centerSlot: (summary as any).centerSlot ?? "TBD",
  } as Service;
};