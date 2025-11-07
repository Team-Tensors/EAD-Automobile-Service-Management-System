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
 * Helper: Get last N days date range
 */
export const getLastNDaysRange = (days: number): { startDate: string; endDate: string } => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  };
};

/**
 * Helper: Get current month date range
 */
export const getCurrentMonthRange = (): { startDate: string; endDate: string } => {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  
  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  };
};

/**
 * Helper: Get year-to-date range
 */
export const getYearToDateRange = (): { startDate: string; endDate: string } => {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), 0, 1);
  
  return {
    startDate: startDate.toISOString(),
    endDate: now.toISOString(),
  };
};
