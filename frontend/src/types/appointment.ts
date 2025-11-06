// src/types/appointment.ts
// ──────────────────────────────────────────────────────────────────────────────
// 1. Enums & literal objects (exact match with backend)
export type AppointmentType = "SERVICE" | "MODIFICATION";

export const AppointmentTypeValues = {
  SERVICE: "SERVICE" as const,
  MODIFICATION: "MODIFICATION" as const,
};

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

// ──────────────────────────────────────────────────────────────────────────────
// 2. Full entity (used by service layer, forms, etc.)
export interface Appointment {
  id: string; // UUID as string
  vehicleId: string; // UUID as string
  appointmentType: AppointmentType;
  serviceTypeId?: number;
  modificationTypeId?: number;
  serviceCenterId: number;
  appointmentDate: string; // "YYYY-MM-DD"
  appointmentTime: string; // "HH:mm"
  status: AppointmentStatus;
  description?: string;
}

// ──────────────────────────────────────────────────────────────────────────────
// 3. DTO for creating a new appointment
export interface AppointmentCreateDto {
  vehicleId: string;
  appointmentType: AppointmentType;
  serviceTypeId?: number;
  modificationTypeId?: number;
  serviceCenterId: number;
  appointmentDate: string;
  appointmentTime: string;
  description?: string;
}

// ──────────────────────────────────────────────────────────────────────────────
// 4. **Summary** – the shape used in MyAppointmentsPage & its sub-components
export interface AppointmentSummary {
  /** UUID of the appointment */
  id: string;

  /** Human-readable service name (e.g. "Oil Change") */
  service: string;

  /** SERVICE | MODIFICATION */
  type: AppointmentType;

  /** Vehicle description (e.g. "Toyota Camry 2022") */
  vehicle: string;

  /** ISO-8601 date-time string (e.g. "2025-12-01T14:30:00Z") */
  date: string;

  /** Current status */
  status: AppointmentStatus;

  /** Service center name */
  serviceCenter?: string;
}

// ──────────────────────────────────────────────────────────────────────────────
// 5. Helper: turn the two separate fields into a single ISO string
/** Combines `appointmentDate` + `appointmentTime` → ISO-8601 */
export const combineDateTime = (
  date: string, // "2025-12-01"
  time: string // "14:30"
): string => {
  // Append seconds and UTC "Z" – backend expects full ISO
  return `${date}T${time}:00Z`;
};

/** Optional: map a full `Appointment` → `AppointmentSummary` */
export const toAppointmentSummary = (
  apt: Appointment,
  serviceName: string,
  vehicleName: string
): AppointmentSummary => ({
  id: apt.id,
  service: serviceName,
  type: apt.appointmentType,
  vehicle: vehicleName,
  date: combineDateTime(apt.appointmentDate, apt.appointmentTime),
  status: apt.status,
});
