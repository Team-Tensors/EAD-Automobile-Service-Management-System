import { api } from '../util/apiUtils';

// Backend DTO types
export interface EmployeeAppointmentDTO {
  id: string;
  userId: number;
  userFullName: string;
  phoneNumber: string;
  vehicleId: string;
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
  startTime: string; // ISO format: "YYYY-MM-DDTHH:mm:ss"
  endTime: string;   // ISO format: "YYYY-MM-DDTHH:mm:ss"
  notes: string;
}

/**
 * Get all appointments assigned to a specific employee
 * @param employeeId - The employee's ID
 * @param status - Optional status filter (CONFIRMED, IN_PROGRESS, COMPLETED)
 * @returns Promise with array of appointments
 */
export const getEmployeeAppointments = async (
  employeeId: number,
  status?: string
): Promise<EmployeeAppointmentDTO[]> => {
  try {
    const params = status ? { status } : {};
    const response = await api.get(`/employee/appointments/${employeeId}`, { params });
    // Ensure we always return an array
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Error fetching employee appointments:', error);
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
      params: { status }
    });
  } catch (error) {
    console.error('Error updating appointment status:', error);
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
    console.error('Error fetching time logs:', error);
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
    console.error('Error creating time log:', error);
    throw error;
  }
};

/**
 * Get employee dashboard statistics
 * @param employeeId - The employee's ID
 * @returns Promise with dashboard stats
 */
export const getEmployeeStats = async (employeeId: number): Promise<any> => {
  try {
    const response = await api.get(`/employee/${employeeId}/stats`);
    return response.data;
  } catch (error) {
    console.error('Error fetching employee stats:', error);
    throw error;
  }
};

export const employeeService = {
  getEmployeeAppointments,
  updateAppointmentStatus,
  getAppointmentTimeLogs,
  createTimeLog,
  getEmployeeStats,
};

export default employeeService;
