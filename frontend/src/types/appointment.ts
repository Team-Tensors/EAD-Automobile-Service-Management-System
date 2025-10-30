// Appointment types matching backend enums and entities

export type AppointmentType = "SERVICE" | "MODIFICATION";

export const AppointmentTypeValues = {
  SERVICE: "SERVICE" as const,
  MODIFICATION: "MODIFICATION" as const,
};

export interface Appointment {
  id: number;
  vehicleId: number;
  appointmentType: AppointmentType;
  serviceTypeId?: number;
  modificationTypeId?: number;
  serviceCenterId: number;
  appointmentDate: string;
  appointmentTime: string;
  status: AppointmentStatus;
  description?: string;
}

export type AppointmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED";

export const AppointmentStatusValues = {
  PENDING: "PENDING" as const,
  CONFIRMED: "CONFIRMED" as const,
  COMPLETED: "COMPLETED" as const,
  CANCELLED: "CANCELLED" as const,
};

export interface AppointmentCreateDto {
  vehicleId: number;
  appointmentType: AppointmentType;
  serviceTypeId?: number;
  modificationTypeId?: number;
  serviceCenterId: number;
  appointmentDate: string;
  appointmentTime: string;
  description?: string;
}
