import api from "@/util/apiUtils";

export interface AppointmentSummary {
  id: string;
  vehicle: string;
  service: string;
  status: string;
  date: string;
  serviceCenter: string;
  centerSlot: number | null;
  estimatedCompletion?: string;
  assignedEmployee?: string;
}

export class SlotAppointmentService {
  async getMyAppointments(userId: string): Promise<AppointmentSummary[]> {
    const token = localStorage.getItem("token");
    if (!userId) throw new Error("User ID is required");
    const response = await api.get(`/slot-appointments`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { userId },
    });
    return response.data.map((dto: any) => ({
      id: dto.id,
      vehicle: dto.vehicleId,
      service: dto.appointmentType,
      status: dto.status,
      date: dto.appointmentDate,
      serviceCenter: dto.serviceCenterName,
      centerSlot: dto.slotNumber, // number | null from backend
      estimatedCompletion: dto.estimatedCompletion || "TBD",
      assignedEmployee: dto.assignedEmployeeIds?.length
        ? dto.assignedEmployeeIds.join(", ")
        : "Not Assigned",
    }));
  }

  async getAppointment(id: string): Promise<AppointmentSummary> {
    const token = localStorage.getItem("token");
    const response = await api.get(`/slot-appointments/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const dto = response.data;
    return {
      id: dto.id,
      vehicle: dto.vehicleId,
      service: dto.appointmentType,
      status: dto.status,
      date: dto.appointmentDate,
      serviceCenter: dto.serviceCenterName,
      centerSlot: dto.slotNumber, // number | null
      estimatedCompletion: dto.estimatedCompletion || "TBD",
      assignedEmployee: dto.assignedEmployeeIds?.length
        ? dto.assignedEmployeeIds.join(", ")
        : "Not Assigned",
    };
  }
}

export const slotAppointmentService = new SlotAppointmentService();