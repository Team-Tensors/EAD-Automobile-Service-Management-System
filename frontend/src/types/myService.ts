// src/types/myService.ts
// Maps backend AppointmentSummary → frontend Service
import type { AppointmentSummary } from "@/services/appointmentService";

export interface Service {
  id: number;
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
    estimatedCompletion:  "TBD",
    assignedEmployee:  "Not Assigned",
    serviceCenter:  "TBD",
    centerSlot:  "TBD",
  };
};