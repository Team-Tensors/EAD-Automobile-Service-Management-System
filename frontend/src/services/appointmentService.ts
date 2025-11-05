import api from "../util/apiUtils";
import type {
  AppointmentType,
  AppointmentStatus,
  AppointmentSummary,
} from "../types/appointment";

const base = "/appointments";

export interface AppointmentBookingRequest {
  vehicleId: string; // UUID as string
  serviceOrModificationId: string; // UUID as string
  serviceCenterId: string; // UUID as string
  appointmentType: AppointmentType;
  appointmentDate: string; // ISO format: "2025-10-30T14:00:00"
  description?: string;
}

export interface AppointmentBookingResponse {
  id: string; // UUID as string
  vehicleId: string; // UUID as string
  vehicleInfo: string;
  serviceName: string;
  appointmentType: AppointmentType;
  appointmentDate: string;
  status: AppointmentStatus;
  message: string;
}

// Export AppointmentSummary from types/appointment.ts
export type { AppointmentSummary };

export interface DetailedAppointment {
  id: string;
  vehicleId: string;
  vehicleName: string;
  licensePlate: string;
  service: string;
  type: AppointmentType;
  date: string;
  status: string;
  canStart: boolean;
  serviceCenter: string;
  assignedEmployee: string;
  estimatedCompletion: string;
}

// New interface for slot availability
export interface SlotAvailability {
  [hour: number]: number; // hour -> available slots count
}

export const appointmentService = {
  // Book a new appointment
  bookAppointment: async (
    request: AppointmentBookingRequest
  ): Promise<AppointmentBookingResponse> => {
    const res = await api.post(`${base}/book`, request);
    return res.data;
  },

  // Get user's appointments
  getMyAppointments: async (): Promise<AppointmentSummary[]> => {
    const res = await api.get(`${base}/my-appointments`);
    return res.data;
  },

  // Cancel an appointment
  cancelAppointment: async (appointmentId: string): Promise<void> => {
    await api.put(`${base}/${appointmentId}/cancel`);
  },

  // Get available slots for a specific service center and date
  getAvailableSlots: async (
    serviceCenterId: string,
    date: string // Format: "2025-11-05"
  ): Promise<SlotAvailability> => {
    const res = await api.get(`${base}/available-slots`, {
      params: {
        serviceCenterId,
        date,
      },
    });

    // Backend returns array like ["09:00|3", "10:00|5"]
    // Convert to object { 9: 3, 10: 5 }
    const slots: SlotAvailability = {};
    if (Array.isArray(res.data)) {
      res.data.forEach((slot: string) => {
        const [time, count] = slot.split("|");
        const hour = parseInt(time.split(":")[0], 10);
        slots[hour] = parseInt(count, 10);
      });
    }

    return slots;
  },

  // Get detailed appointments with all fields
  getMyDetailedAppointments: async (): Promise<DetailedAppointment[]> => {
    const res = await api.get(`${base}/my-detailed-appointments`);
    return res.data;
  },
};

export default appointmentService;
