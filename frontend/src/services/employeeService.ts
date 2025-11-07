import { api } from "../util/apiUtils";

// Backend DTO types
export interface EmployeeAppointmentDTO {
  id: string;
  userFullName: string;
  brand: string;
  model: string;
  color: string;
  lastServiceDate: string | null;
  licensePlate: string;
  appointmentType: string;
  serviceOrModificationId: string;
  serviceOrModificationName: string;
  serviceOrModificationDescription: string;
  estimatedTimeMinutes: number;
  appointmentDate: string;
  status: string;
  description: string;
}

export interface TimeLogDTO {
  id: number;
  startTime: string;
  endTime: string;
  hoursLogged: number;
  notes: string;
}

export interface CreateTimeLogRequest {
  employeeId: number;
  startTime: string;
  endTime: string;
  notes: string;
}

export interface EmployeeCenterDTO {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  serviceCenter: string;
}

export interface ShiftDTO {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  estimatedDuration: number;
  status: string;
  description: string;
  customerName?: string;
  vehicleInfo?: string;
  appointmentType?: string;
  serviceOrModificationName?: string;
  isAssigned?: boolean; // To distinguish between assigned and available shifts
}

export interface AvailableAppointmentDTO {
  appointmentId: string;
  userName: string;
  vehicle: string;
  appointmentType: string;
  serviceOrModification: string;
  serviceCenter: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: string;
  description: string;
}

export interface SelfAssignRequest {
  appointmentId: string;
}

/**
 * Get all appointments assigned to a specific employee
 * @returns Promise with array of appointments
 */
export const getEmployeeAppointments = async (): Promise<
  EmployeeAppointmentDTO[]
> => {
  try {
    const response = await api.get(`/employee/appointments`);
    return response.data;
  } catch (error) {
    console.error("Error fetching employee appointments:", error);
    throw error;
  }
};

/**
 * Update the status of an appointment
 * @param appointmentId - The appointment's ID
 * @param status - New status (CONFIRMED, IN_PROGRESS, COMPLETED)
 * @returns Promise with updated appointment data
 */
export const updateAppointmentStatus = async (
  appointmentId: string,
  status: string
): Promise<void> => {
  try {
    await api.put(`/employee/appointments/${appointmentId}/status`, null, {
      params: { status },
    });
  } catch (error) {
    console.error("Error updating appointment status:", error);
    throw error;
  }
};

/**
 * Get time logs for a specific appointment and employee
 * @param appointmentId - The appointment's ID
 * @param employeeId - The employee's ID
 * @returns Promise with array of time logs
 */
export const getAppointmentTimeLogs = async (
  appointmentId: string,
  employeeId: number
): Promise<TimeLogDTO[]> => {
  try {
    const response = await api.get(
      `/employee/appointments/${appointmentId}/employees/${employeeId}/timelogs`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching time logs:", error);
    throw error;
  }
};

/**
 * Create a new time log for an appointment
 * @param appointmentId - The appointment's ID
 * @param timeLogData - Time log data including employeeId, start/end times, and notes
 * @returns Promise with created time log
 */
export const createTimeLog = async (
  appointmentId: string,
  timeLogData: CreateTimeLogRequest
): Promise<TimeLogDTO> => {
  try {
    const response = await api.post(
      `/employee/appointments/${appointmentId}/timelog`,
      timeLogData
    );
    return response.data;
  } catch (error) {
    console.error("Error creating time log:", error);
    throw error;
  }
};

/**
 * Get dashboard statistics for an employee
 * @param employeeId - The employee's ID
 * @returns Promise with dashboard stats
 */
export const getEmployeeStats = async (
  employeeId: number
): Promise<Record<string, unknown>> => {
  try {
    const response = await api.get(`/employee/${employeeId}/stats`);
    return response.data;
  } catch (error) {
    console.error("Error fetching employee stats:", error);
    throw error;
  }
};

/**
 * Get employee details
 * @returns Promise with employee details including service center
 */
export const getEmployeeDetails = async (): Promise<EmployeeCenterDTO> => {
  try {
    const response = await api.get(`/employee/details`);
    return response.data;
  } catch (error) {
    console.error("Error fetching employee details:", error);
    throw error;
  }
};

/**
 * Get all shifts for the logged-in employee
 * @returns Promise with array of shifts
 */
export const getEmployeeShifts = async (): Promise<ShiftDTO[]> => {
  try {
    // Use appointments as shifts since there's no dedicated shifts endpoint
    const response = await api.get<EmployeeAppointmentDTO[]>(
      `/employee/appointments`
    );

    // Convert appointments to shifts
    const shifts: ShiftDTO[] = response.data.map((appointment) => ({
      id: appointment.id,
      title: `${appointment.appointmentType}: ${
        appointment.serviceOrModificationName || "Service"
      }`,
      startTime: appointment.appointmentDate,
      endTime: appointment.appointmentDate, // Will calculate with estimated time in component
      estimatedDuration: appointment.estimatedTimeMinutes || 0,
      status: appointment.status,
      description: appointment.description || "",
      customerName: appointment.userFullName,
      vehicleInfo: `${appointment.brand} ${appointment.model} (${appointment.licensePlate})`,
      appointmentType: appointment.appointmentType,
      serviceOrModificationName: appointment.serviceOrModificationName,
    }));

    return shifts;
  } catch (error) {
    console.error("Error fetching employee shifts:", error);
    throw error;
  }
};

/**
 * Get all time logs for the logged-in employee
 * @returns Promise with array of all time logs
 */
export const getAllTimeLogs = async (): Promise<TimeLogDTO[]> => {
  try {
    // Get employee details to obtain employee ID
    const employeeDetails = await api.get<EmployeeCenterDTO>(
      `/employee/details`
    );
    const employeeId = employeeDetails.data.id;

    // Get all appointments for the employee
    const appointmentsResponse = await api.get<EmployeeAppointmentDTO[]>(
      `/employee/appointments`
    );
    const appointments = appointmentsResponse.data;

    // Fetch time logs for each appointment
    const timeLogsPromises = appointments.map(async (appointment) => {
      try {
        const response = await api.get<TimeLogDTO[]>(
          `/employee/appointments/${appointment.id}/employees/${employeeId}/timelogs`
        );
        return response.data;
      } catch {
        // If no time logs for this appointment, return empty array
        console.debug(`No time logs for appointment ${appointment.id}`);
        return [];
      }
    });

    // Wait for all promises and flatten the results
    const allTimeLogs = await Promise.all(timeLogsPromises);
    const flattenedTimeLogs = allTimeLogs.flat();

    return flattenedTimeLogs;
  } catch (error) {
    console.error("Error fetching all time logs:", error);
    throw error;
  }
};

/**
 * Get available appointments for self-assignment
 * @returns Promise with array of available appointments
 */
export const getAvailableAppointments = async (): Promise<ShiftDTO[]> => {
  try {
    const response = await api.get<AvailableAppointmentDTO[]>(
      `/shift/possible-appointments`
    );

    // Convert available appointments to shifts
    const availableShifts: ShiftDTO[] = response.data.map((appointment) => ({
      id: appointment.appointmentId,
      title: `${appointment.appointmentType}: ${appointment.serviceOrModification}`,
      startTime: appointment.appointmentDate,
      endTime: appointment.endTime || appointment.appointmentDate,
      estimatedDuration: 0, // Not provided in this DTO
      status: appointment.status,
      description: appointment.description || "",
      customerName: appointment.userName,
      vehicleInfo: appointment.vehicle,
      appointmentType: appointment.appointmentType,
      serviceOrModificationName: appointment.serviceOrModification,
      isAssigned: false, // Mark as available/unassigned
    }));

    return availableShifts;
  } catch (error) {
    console.error("Error fetching available appointments:", error);
    throw error;
  }
};

/**
 * Self-assign an appointment to the logged-in employee
 * @param appointmentId - The appointment ID to self-assign
 * @returns Promise
 */
export const selfAssignAppointment = async (
  appointmentId: string
): Promise<void> => {
  try {
    await api.post(`/shift/self-assign-employee`, {
      appointmentId,
    });
  } catch (error) {
    console.error("Error self-assigning appointment:", error);
    throw error;
  }
};

export const employeeService = {
  getEmployeeAppointments,
  updateAppointmentStatus,
  getAppointmentTimeLogs,
  createTimeLog,
  getEmployeeStats,
  getEmployeeDetails,
  getEmployeeShifts,
  getAllTimeLogs,
  getAvailableAppointments,
  selfAssignAppointment,
};

export default employeeService;
