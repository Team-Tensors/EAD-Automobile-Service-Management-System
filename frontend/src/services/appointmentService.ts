import api from "../util/apiUtils";
import type { AppointmentType } from "../types/appointment";

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
  status: string;
  message: string;
}

export interface AppointmentSummary {
  id: string; // UUID as string
  vehicle: string;
  service: string;
  type: AppointmentType;
  date: string;
  status: string;
  canStart: boolean;
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
};

export default appointmentService;
