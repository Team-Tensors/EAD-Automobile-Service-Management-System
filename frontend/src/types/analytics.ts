// Analytics API Response Types

export interface DashboardSummary {
  totalRevenue: number;
  totalAppointments: number;
  completedAppointments: number;
  confirmedAppointments: number;
  pendingAppointments: number;
  inProgressAppointments: number;
  cancelledAppointments: number;
  totalCustomers: number;
  totalEmployees: number;
  completionRate: number;
  averageServiceCost: number;
  repeatCustomerRate: number;
  popularServices: PopularService[];
  topEmployees: TopEmployee[];
  periodStart: string;
  periodEnd: string;
}

export interface PopularService {
  serviceId: string;
  serviceName: string;
  count: number;
  totalRevenue: number;
}

export interface TopEmployee {
  employeeId: string;
  employeeName: string;
  completedAppointments: number;
  completionRate: number;
}

export interface ServiceDistribution {
  totalAppointments: number;
  serviceCount: number;
  modificationCount: number;
  servicePercentage: number;
  modificationPercentage: number;
  serviceBreakdown: ServiceBreakdownItem[];
}

export interface ServiceBreakdownItem {
  serviceId: string;
  serviceName: string;
  serviceType: 'SERVICE' | 'MODIFICATION';
  count: number;
  percentage: number;
  totalRevenue: number;
  averageCost: number;
}

export interface RevenueTrend {
  totalRevenue: number;
  averageRevenue: number;
  maxRevenue: number;
  minRevenue: number;
  totalAppointments: number;
  periodType: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  trends: RevenueTrendItem[];
}

export interface RevenueTrendItem {
  period: string;
  periodLabel: string;
  revenue: number;
  appointmentCount: number;
  serviceRevenue: number;
  modificationRevenue: number;
  serviceCount: number;
  modificationCount: number;
}

export interface EmployeePerformance {
  totalEmployees: number;
  totalAppointments: number;
  averageCompletionRate: number;
  totalHoursLogged: number;
  employees: EmployeePerformanceItem[];
  topPerformers: EmployeePerformanceItem[];
}

export interface EmployeePerformanceItem {
  employeeId: string;
  employeeName: string;
  email: string;
  totalAppointments: number;
  completedAppointments: number;
  inProgressAppointments: number;
  pendingAppointments: number;
  completionRate: number;
  totalHoursLogged: number;
  averageHoursPerAppointment: number;
  rank?: number;
}

export interface CustomerInsights {
  totalCustomers: number;
  repeatCustomers: number;
  newCustomers: number;
  repeatCustomerRate: number;
  averageAppointmentsPerCustomer: number;
  averageSpendPerCustomer: number;
  totalAppointments: number;
  customerInsights: CustomerInsightItem[];
  topCustomers: CustomerInsightItem[];
}

export interface CustomerInsightItem {
  customerId: string;
  customerName: string;
  email: string;
  phoneNumber: string;
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  totalSpent: number;
  firstAppointmentDate: string;
  lastAppointmentDate: string;
  isRepeatCustomer: boolean;
  vehicleCount: number;
  daysSinceLastAppointment: number;
}

export interface AnalyticsResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface AnalyticsParams {
  startDate?: string;
  endDate?: string;
  serviceCenterId?: string;
  appointmentType?: 'SERVICE' | 'MODIFICATION';
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  periodType?: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  allTime?: boolean; // Use true for all historical data (recommended)
}
