import type { AppointmentSummary } from "@/services/appointmentService";

export interface Service {
  id: string;
  vehicleName: string;
  vehicleNumber: string;
  serviceType: string;
  status: "completed" | "not_completed";
  startDate: string;
  estimatedCompletion: string;
  assignedEmployee: string;
  serviceCenter: string;
  centerSlot: string;
}

export const mapSummaryToService = (summary: AppointmentSummary): Service => {
  const [vehicleName, vehicleNumber] = summary.vehicle.split(" • ");
  const isCompleted = summary.status === "COMPLETED";

  return {
    id: summary.id,
    vehicleName: vehicleName || "Unknown Vehicle",
    vehicleNumber: vehicleNumber || "N/A",
    serviceType: summary.service,
    status: isCompleted ? "completed" : "not_completed",
    startDate: summary.date,
    estimatedCompletion: (summary as any).estimatedCompletion ?? "TBD",
    assignedEmployee: (summary as any).assignedEmployee ?? "Not Assigned",
    serviceCenter: (summary as any).serviceCenter ?? "TBD",
    centerSlot: (summary as any).centerSlot ?? "TBD",
  };
};