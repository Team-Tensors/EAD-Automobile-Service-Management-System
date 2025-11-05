import { api } from '../util/apiUtils';
import type { AdminService, Employee } from '@/types/admin';

// Backend DTO types
interface AdminAppointmentDTO {
  id: string;
  vehicleId: string;
  vehicleName: string;
  licensePlate: string;
  customerName: string;
  customerEmail: string;
  service: string;
  type: string;
  date: string;
  status: string;
  serviceCenter: string;
  assignedEmployees: string;
  assignedEmployeeCount: number;
}

interface EmployeeDTO {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string;
}

/**
 * Transform backend AdminAppointmentDTO to frontend AdminService type
 * Maps field names and structures to match UI requirements
 */
const transformToAdminService = (dto: AdminAppointmentDTO, displayStatus: 'upcoming' | 'ongoing' | 'unassigned'): AdminService => {
  // Parse vehicle name to extract brand, model, year
  const vehicleNameParts = dto.vehicleName?.split(' ') || [];
  const vehicleYear = vehicleNameParts[vehicleNameParts.length - 1] || '';
  const vehicleModel = vehicleNameParts[vehicleNameParts.length - 2] || '';
  const vehicleBrand = vehicleNameParts.slice(0, -2).join(' ') || '';

  return {
    id: parseInt(dto.id as unknown as string) || 0,
    vehicleBrand,
    vehicleModel,
    vehicleYear,
    vehicleLicensePlate: dto.licensePlate,
    serviceTypeName: dto.service,
    serviceTypeDescription: dto.service,
    estimatedCost: 0, // Not provided in DTO
    estimatedDuration: 0, // Not provided in DTO
    appointmentDate: dto.date,
    status: dto.status as 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED',
    customerName: dto.customerName,
    customerEmail: dto.customerEmail,
    assignedEmployeeName: dto.assignedEmployees,
    serviceCenter: dto.serviceCenter,
    displayStatus,
    progress: displayStatus === 'ongoing' ? Math.floor(Math.random() * 100) : undefined,
    ongoingStatus: displayStatus === 'ongoing' ? 'IN_PROGRESS' : undefined,
  };
};

/**
 * Get all upcoming appointments
 */
export const getUpcomingAppointments = async (): Promise<AdminService[]> => {
  try {
    const response = await api.get('/admin/appointments/upcoming');
    return response.data.map((dto: AdminAppointmentDTO) => transformToAdminService(dto, 'upcoming'));
  } catch (error) {
    console.error('Error fetching upcoming appointments:', error);
    throw error;
  }
};

/**
 * Get all ongoing appointments
 */
export const getOngoingAppointments = async (): Promise<AdminService[]> => {
  try {
    const response = await api.get('/admin/appointments/ongoing');
    return response.data.map((dto: AdminAppointmentDTO) => transformToAdminService(dto, 'ongoing'));
  } catch (error) {
    console.error('Error fetching ongoing appointments:', error);
    throw error;
  }
};

/**
 * Get all unassigned appointments
 */
export const getUnassignedAppointments = async (): Promise<AdminService[]> => {
  try {
    const response = await api.get('/admin/appointments/unassigned');
    return response.data.map((dto: AdminAppointmentDTO) => transformToAdminService(dto, 'unassigned'));
  } catch (error) {
    console.error('Error fetching unassigned appointments:', error);
    throw error;
  }
};

/**
 * Get all employees (for dropdown/assignment modal)
 * Note: Backend DTO only provides basic info (id, email, fullName, phoneNumber)
 * Other fields like specialization, availability, workload, rating are set to defaults
 */
export const getAllEmployees = async (): Promise<Employee[]> => {
  try {
    const response = await api.get('/admin/appointments/employees');
    return response.data.map((dto: EmployeeDTO) => ({
      id: parseInt(dto.id as unknown as string) || 0,
      name: dto.fullName || '',
      email: dto.email,
      specialization: 'General Service', // Default value - not provided by backend
      availability: 'available' as const, // Default value - not provided by backend
      currentWorkload: 0, // Default value - not provided by backend
      rating: 4.5, // Default value - not provided by backend
      phoneNumber: dto.phoneNumber || '',
    }));
  } catch (error) {
    console.error('Error fetching employees:', error);
    throw error;
  }
};

/**
 * Assign employees to an appointment
 */
export const assignEmployeeToAppointment = async (
  appointmentId: string | number,
  employeeIds: (string | number)[]
): Promise<AdminService> => {
  try {
    const response = await api.post(
      `/admin/appointments/${appointmentId}/assign-employees`,
      employeeIds
    );
    
    // Determine display status based on API response
    let displayStatus: 'upcoming' | 'ongoing' | 'unassigned' = 'upcoming';
    if (response.data.status === 'PENDING') {
      displayStatus = 'unassigned';
    }
    
    return transformToAdminService(response.data, displayStatus);
  } catch (error) {
    console.error('Error assigning employee to appointment:', error);
    throw error;
  }
};
