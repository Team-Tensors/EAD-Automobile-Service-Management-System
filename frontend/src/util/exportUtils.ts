import type {
  DashboardSummary,
  ServiceDistribution,
  RevenueTrend,
  EmployeePerformance,
  CustomerInsights,
} from '@/types/analytics';

/**
 * Convert data to CSV format
 */
export const convertToCSV = (data: unknown[][], headers: string[]): string => {
  const escapeCSVValue = (value: unknown): string => {
    if (value === null || value === undefined) return '';
    const stringValue = String(value);
    // Escape quotes and wrap in quotes if contains comma, quote, or newline
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  };

  const csvRows = [
    headers.map(escapeCSVValue).join(','),
    ...data.map(row => row.map(escapeCSVValue).join(','))
  ];

  return csvRows.join('\n');
};

/**
 * Download CSV file
 */
export const downloadCSV = (csvContent: string, filename: string): void => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

/**
 * Download Excel file (using CSV format with .xlsx extension for simplicity)
 * For true Excel format, you would need a library like xlsx or exceljs
 */
export const downloadExcel = (csvContent: string, filename: string): void => {
  // For now, we'll use CSV format with .xlsx extension
  // In production, consider using a library like 'xlsx' for proper Excel format
  const blob = new Blob([csvContent], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

/**
 * Format Dashboard Summary data for export
 */
export const formatDashboardSummary = (data: DashboardSummary): { headers: string[]; rows: unknown[][] } => {
  const headers = [
    'Metric',
    'Value',
    'Percentage'
  ];

  const rows = [
    ['Total Appointments', data.totalAppointments, '-'],
    ['Pending Appointments', data.pendingAppointments, `${((data.pendingAppointments / data.totalAppointments) * 100).toFixed(1)}%`],
    ['Confirmed Appointments', data.confirmedAppointments, `${((data.confirmedAppointments / data.totalAppointments) * 100).toFixed(1)}%`],
    ['In Progress Appointments', data.inProgressAppointments, `${((data.inProgressAppointments / data.totalAppointments) * 100).toFixed(1)}%`],
    ['Completed Appointments', data.completedAppointments, `${((data.completedAppointments / data.totalAppointments) * 100).toFixed(1)}%`],
    ['Cancelled Appointments', data.cancelledAppointments, `${((data.cancelledAppointments / data.totalAppointments) * 100).toFixed(1)}%`],
    ['', '', ''],
    ['Total Revenue', `Rs. ${data.totalRevenue.toFixed(2)}`, '-'],
    ['Average Service Cost', `Rs. ${data.averageServiceCost.toFixed(2)}`, '-'],
    ['Completion Rate', data.completionRate.toFixed(1) + '%', '-'],
    ['', '', ''],
    ['Total Customers', data.totalCustomers, '-'],
    ['Repeat Customer Rate', data.repeatCustomerRate.toFixed(1) + '%', '-'],
  ];

  return { headers, rows };
};

/**
 * Format Service Distribution data for export
 */
export const formatServiceDistribution = (data: ServiceDistribution): { headers: string[]; rows: unknown[][] } => {
  const headers = [
    'Service Name',
    'Service ID',
    'Count',
    'Percentage',
    'Total Revenue'
  ];

  const rows = [
    ['SUMMARY', '', '', '', ''],
    ['Total Appointments', '', data.totalAppointments, '100%', ''],
    ['Services', '', data.serviceCount, `${data.servicePercentage.toFixed(1)}%`, ''],
    ['Modifications', '', data.modificationCount, `${data.modificationPercentage.toFixed(1)}%`, ''],
    ['', '', '', '', ''],
    ['SERVICE BREAKDOWN', '', '', '', ''],
    ...data.serviceBreakdown.map(service => [
      service.serviceName,
      service.serviceId,
      service.count,
      `${service.percentage.toFixed(1)}%`,
      `Rs. ${service.totalRevenue.toFixed(2)}`
    ])
  ];

  return { headers, rows };
};

/**
 * Format Revenue Trend data for export
 */
export const formatRevenueTrend = (data: RevenueTrend): { headers: string[]; rows: unknown[][] } => {
  const headers = [
    'Period',
    'Period Label',
    'Revenue',
    'Appointment Count',
    'Service Revenue',
    'Modification Revenue',
    'Service Count',
    'Modification Count'
  ];

  const rows = [
    ['SUMMARY', '', '', '', '', '', '', ''],
    ['Total Revenue', '', `Rs. ${data.totalRevenue.toFixed(2)}`, '', '', '', '', ''],
    ['Total Appointments', '', data.totalAppointments, '', '', '', '', ''],
    ['Average Revenue', '', `Rs. ${data.averageRevenue.toFixed(2)}`, '', '', '', '', ''],
    ['Max Revenue', '', `Rs. ${data.maxRevenue.toFixed(2)}`, '', '', '', '', ''],
    ['Min Revenue', '', `Rs. ${data.minRevenue.toFixed(2)}`, '', '', '', '', ''],
    ['Period Type', '', data.periodType, '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['PERIOD BREAKDOWN', '', '', '', '', '', '', ''],
    ...data.trends.map(item => [
      item.period,
      item.periodLabel,
      `Rs. ${item.revenue.toFixed(2)}`,
      item.appointmentCount,
      `Rs. ${item.serviceRevenue.toFixed(2)}`,
      `Rs. ${item.modificationRevenue.toFixed(2)}`,
      item.serviceCount,
      item.modificationCount
    ])
  ];

  return { headers, rows };
};

/**
 * Format Employee Performance data for export
 */
export const formatEmployeePerformance = (data: EmployeePerformance): { headers: string[]; rows: unknown[][] } => {
  const headers = [
    'Employee ID',
    'Employee Name',
    'Email',
    'Total Appointments',
    'Completed Appointments',
    'In Progress',
    'Pending',
    'Completion Rate',
    'Total Hours Logged',
    'Avg Hours per Appointment'
  ];

  const rows = [
    ['SUMMARY', '', '', '', '', '', '', '', '', ''],
    ['Total Employees', data.totalEmployees, '', '', '', '', '', '', '', ''],
    ['Total Appointments', data.totalAppointments, '', '', '', '', '', '', '', ''],
    ['Average Completion Rate', `${data.averageCompletionRate.toFixed(1)}%`, '', '', '', '', '', '', '', ''],
    ['Total Hours Logged', data.totalHoursLogged.toFixed(1), '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', '', ''],
    ['EMPLOYEE DETAILS', '', '', '', '', '', '', '', '', ''],
    ...data.employees.map(emp => [
      emp.employeeId,
      emp.employeeName,
      emp.email,
      emp.totalAppointments,
      emp.completedAppointments,
      emp.inProgressAppointments,
      emp.pendingAppointments,
      `${emp.completionRate.toFixed(1)}%`,
      emp.totalHoursLogged.toFixed(1),
      emp.averageHoursPerAppointment.toFixed(1)
    ])
  ];

  return { headers, rows };
};

/**
 * Format Customer Insights data for export
 */
export const formatCustomerInsights = (data: CustomerInsights): { headers: string[]; rows: unknown[][] } => {
  const headers = [
    'Customer ID',
    'Customer Name',
    'Email',
    'Phone Number',
    'Total Appointments',
    'Completed',
    'Cancelled',
    'Total Spent',
    'First Appointment',
    'Last Appointment',
    'Days Since Last',
    'Repeat Customer',
    'Vehicle Count'
  ];

  const rows = [
    ['SUMMARY', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['Total Customers', data.totalCustomers, '', '', '', '', '', '', '', '', '', '', ''],
    ['Repeat Customers', data.repeatCustomers, '', '', '', '', '', '', '', '', '', '', ''],
    ['New Customers', data.newCustomers, '', '', '', '', '', '', '', '', '', '', ''],
    ['Repeat Rate', `${data.repeatCustomerRate.toFixed(1)}%`, '', '', '', '', '', '', '', '', '', '', ''],
    ['Avg Appointments per Customer', data.averageAppointmentsPerCustomer.toFixed(1), '', '', '', '', '', '', '', '', '', '', ''],
    ['Avg Spend per Customer', `Rs. ${data.averageSpendPerCustomer.toFixed(2)}`, '', '', '', '', '', '', '', '', '', '', ''],
    ['Total Appointments', data.totalAppointments, '', '', '', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', '', '', '', '', ''],
    ['TOP CUSTOMERS', '', '', '', '', '', '', '', '', '', '', '', ''],
    ...data.topCustomers.map(customer => [
      customer.customerId,
      customer.customerName,
      customer.email,
      customer.phoneNumber,
      customer.totalAppointments,
      customer.completedAppointments,
      customer.cancelledAppointments,
      `Rs. ${customer.totalSpent.toFixed(2)}`,
      customer.firstAppointmentDate,
      customer.lastAppointmentDate,
      customer.daysSinceLastAppointment,
      customer.isRepeatCustomer ? 'Yes' : 'No',
      customer.vehicleCount
    ])
  ];

  return { headers, rows };
};

/**
 * Create mock appointments detail data
 * Note: This would need a real API endpoint to get actual appointment details
 */
export const formatAppointmentsDetail = (data: DashboardSummary): { headers: string[]; rows: unknown[][] } => {
  const headers = [
    'Status',
    'Count',
    'Percentage'
  ];

  const rows = [
    ['Total Appointments', data.totalAppointments, '100%'],
    ['Pending', data.pendingAppointments, `${((data.pendingAppointments / data.totalAppointments) * 100).toFixed(1)}%`],
    ['Confirmed', data.confirmedAppointments, `${((data.confirmedAppointments / data.totalAppointments) * 100).toFixed(1)}%`],
    ['In Progress', data.inProgressAppointments, `${((data.inProgressAppointments / data.totalAppointments) * 100).toFixed(1)}%`],
    ['Completed', data.completedAppointments, `${((data.completedAppointments / data.totalAppointments) * 100).toFixed(1)}%`],
    ['Cancelled', data.cancelledAppointments, `${((data.cancelledAppointments / data.totalAppointments) * 100).toFixed(1)}%`],
    ['', '', ''],
    ['Note:', 'For detailed appointment records, please implement the appointments API endpoint', ''],
  ];

  return { headers, rows };
};
