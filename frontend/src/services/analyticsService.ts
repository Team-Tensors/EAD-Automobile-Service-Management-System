import { api } from '../util/apiUtils';
import type {
  AnalyticsResponse,
  AnalyticsParams,
  DashboardSummary,
  ServiceDistribution,
  RevenueTrend,
  EmployeePerformance,
  CustomerInsights,
} from '@/types/analytics';

const BASE_URL = '/analytics';

/**
 * Build query string from parameters
 */
const buildQueryString = (params: AnalyticsParams = {}): string => {
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, String(value));
    }
  });
  
  const queryString = queryParams.toString();
  return queryString ? `?${queryString}` : '';
};

/**
 * Get dashboard summary with optional date range and service center filter
 * Default: Last 30 days
 */
export const getDashboardSummary = async (
  params?: AnalyticsParams
): Promise<DashboardSummary> => {
  const queryString = buildQueryString(params);
  const response = await api.get<AnalyticsResponse<DashboardSummary>>(
    `${BASE_URL}/dashboard${queryString}`
  );
  return response.data.data;
};

/**
 * Get service type distribution
 * Shows breakdown of services vs modifications, and individual service types
 */
export const getServiceDistribution = async (
  params?: AnalyticsParams
): Promise<ServiceDistribution> => {
  const queryString = buildQueryString(params);
  const response = await api.get<AnalyticsResponse<ServiceDistribution>>(
    `${BASE_URL}/service-distribution${queryString}`
  );
  return response.data.data;
};

/**
 * Get revenue trend over time
 * @param params - Include periodType: 'DAILY' | 'WEEKLY' | 'MONTHLY'
 */
export const getRevenueTrend = async (
  params?: AnalyticsParams
): Promise<RevenueTrend> => {
  const queryString = buildQueryString(params);
  const response = await api.get<AnalyticsResponse<RevenueTrend>>(
    `${BASE_URL}/revenue-trend${queryString}`
  );
  return response.data.data;
};

/**
 * Get employee performance metrics
 */
export const getEmployeePerformance = async (
  params?: AnalyticsParams
): Promise<EmployeePerformance> => {
  const queryString = buildQueryString(params);
  const response = await api.get<AnalyticsResponse<EmployeePerformance>>(
    `${BASE_URL}/employee-performance${queryString}`
  );
  return response.data.data;
};

/**
 * Get customer insights and statistics
 */
export const getCustomerInsights = async (
  params?: AnalyticsParams
): Promise<CustomerInsights> => {
  const queryString = buildQueryString(params);
  const response = await api.get<AnalyticsResponse<CustomerInsights>>(
    `${BASE_URL}/customer-insights${queryString}`
  );
  return response.data.data;
};

/**
 * Custom analytics with POST for complex filters
 */
export const getCustomAnalytics = async (
  params: AnalyticsParams
): Promise<DashboardSummary> => {
  const response = await api.post<AnalyticsResponse<DashboardSummary>>(
    `${BASE_URL}/custom`,
    params
  );
  return response.data.data;
};

/**
 * Helper: Get today's date range (full 24 hours from local midnight to now + buffer)
 * Uses local timezone to capture all today's data, with a future buffer to avoid missing recent data
 */
export const getTodayRange = (): { startDate: string; endDate: string } => {
  const now = new Date();
  // Start of today in local timezone
  const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  // End of today + 1 day buffer to ensure we don't miss data due to timezone differences
  const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 23, 59, 59, 999);
  
  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  };
};

/**
 * Helper: Get last N days date range
 * Includes a future buffer to avoid missing recent data
 */
export const getLastNDaysRange = (days: number): { startDate: string; endDate: string } => {
  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);
  
  // Add 1 day buffer to end date
  const endDate = new Date(now);
  endDate.setDate(endDate.getDate() + 1);
  endDate.setHours(23, 59, 59, 999);
  
  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  };
};

/**
 * Helper: Get next N days date range
 * For upcoming appointments and scheduled services
 */
export const getNextNDaysRange = (days: number): { startDate: string; endDate: string } => {
  const now = new Date();
  // Start from today
  const startDate = new Date(now);
  startDate.setHours(0, 0, 0, 0);
  
  // End date is N days in the future
  const endDate = new Date(now);
  endDate.setDate(endDate.getDate() + days);
  endDate.setHours(23, 59, 59, 999);
  
  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  };
};

/**
 * Helper: Get current month date range
 * Includes end-of-month + 1 day buffer
 */
export const getCurrentMonthRange = (): { startDate: string; endDate: string } => {
  const now = new Date();
  // First day of current month
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  // Last day of current month + 1 day buffer
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1, 23, 59, 59, 999);
  
  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  };
};

/**
 * Helper: Get year-to-date range
 * Includes current date + 1 day buffer
 */
export const getYearToDateRange = (): { startDate: string; endDate: string } => {
  const now = new Date();
  // January 1st of current year
  const startDate = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
  // Current date + 1 day buffer
  const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 23, 59, 59, 999);
  
  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  };
};
