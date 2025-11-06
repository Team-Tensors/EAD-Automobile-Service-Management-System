// SHOULD BE CHANGED with new backend implementations
// Admin Dashboard Types - Aligned with current Backend Entities

export type NavSection = 'dashboard' | 'analytics' | 'inventory' | 'notifications';

// Backend-aligned status types
export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
export type OngoingStatus = 'IN_PROGRESS' | 'AWAITING_PARTS' | 'QUALITY_CHECK';

// Vehicle Entity (matches backend)
export interface Vehicle {
  id: number;
  brand: string;
  model: string;
  year: string;
  color: string;
  lastServiceDate?: string; // LocalDateTime from backend
  licensePlate: string;
  userId: number;
}

// ServiceType Entity (matches backend)
export interface ServiceType {
  id: number;
  name: string;
  description: string;
  estimatedCost: number;
  estimatedDuration: number; // in minutes
}

// User Entity (simplified for admin view)
export interface AdminUser {
  id: number;
  email: string;
  fullName: string;
  phoneNumber?: string;
  address?: string;
  createdAt: string;
  isActive: boolean;
  roles: string[];
  oauthProvider?: string;
  oauthId?: string;
}

// Appointment Entity (matches backend + UI extensions)
export interface Appointment {
  id: number;
  userId: number;
  vehicleId: number;
  serviceTypeId: number;
  appointmentDate: string; // LocalDateTime from backend as ISO string
  status: AppointmentStatus;
  description?: string;
  
  // Populated/joined data for UI
  user?: AdminUser;
  vehicle?: Vehicle;
  serviceType?: ServiceType;
  assignedEmployee?: Employee;
  assignedEmployeeId?: number;
}

// Employee interface (for assignment functionality)
export interface Employee {
  id: string; // UUID from backend
  name: string;
  email: string;
  specialization: string;
  availability: 'available' | 'busy';
  currentWorkload: number;
  rating: number;
  phoneNumber?: string;
  serviceCenterId?: number;
  serviceCenterName?: string;
  totalHoursWorked?: number;
}

// Extended Admin Service view (combines Appointment with Vehicle and ServiceType details)
export interface AdminService {
  id: string; // UUID from backend
  
  // Vehicle information
  vehicleBrand: string;
  vehicleModel: string;
  vehicleYear: string;
  vehicleLicensePlate: string;
  vehicleColor?: string;
  
  // Service information
  serviceTypeName: string;
  serviceTypeDescription: string;
  estimatedCost: number;
  estimatedDuration: number; // in minutes
  
  // Appointment information
  appointmentDate: string;
  status: AppointmentStatus;
  description?: string;
  
  // Customer information
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  
  // Assignment information
  assignedEmployeeId?: number;
  assignedEmployeeName?: string;
  
  // Service center information (if applicable)
  serviceCenter?: string;
  centerSlot?: string;
  
  // UI-specific fields for ongoing services
  progress?: number;
  ongoingStatus?: OngoingStatus;
  
  // Computed/UI helper fields
  displayStatus: 'upcoming' | 'ongoing' | 'unassigned' | 'completed' | 'cancelled';
}

// Statistics for dashboard overview
export interface DashboardStats {
  totalAppointments: number;
  pendingAppointments: number;
  confirmedAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  unassignedAppointments: number;
  totalRevenue: number;
  averageServiceDuration: number;
}

// Filter options for admin dashboard
export interface AdminServiceFilters {
  status?: AppointmentStatus[];
  displayStatus?: ('upcoming' | 'ongoing' | 'unassigned' | 'completed' | 'cancelled')[];
  dateFrom?: string;
  dateTo?: string;
  serviceTypeId?: number;
  assignedEmployeeId?: number;
  customerId?: number;
}

