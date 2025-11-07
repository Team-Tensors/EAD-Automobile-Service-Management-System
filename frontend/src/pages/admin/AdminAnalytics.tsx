import { useState, useEffect } from 'react';
import { 
  Calendar, 
  TrendingUp, 
  Users, 
  Clock, 
  DollarSign,
  AlertCircle,
  CheckCircle,
  Activity
} from 'lucide-react';
import { 
  getDashboardSummary,
  getServiceDistribution,
  getRevenueTrend,
  getEmployeePerformance,
  getCustomerInsights,
  getTodayRange,
  getLastNDaysRange,
  getCurrentMonthRange,
  getYearToDateRange
} from '../../services/analyticsService';
import { fetchServiceCenters } from '../../services/serviceCenterService';
import type { 
  DashboardSummary,
  ServiceDistribution,
  RevenueTrend,
  EmployeePerformance,
  CustomerInsights,
  AnalyticsParams
} from '@/types/analytics';
import type { ServiceCenter } from '@/types/serviceCenter';
import AdminHeader from '../../components/AdminDashboard/AdminHeader';
import ServiceTypeChart from '../../components/AdminAnalytics/ServiceTypeChart';
import RevenueTrendChart from '../../components/AdminAnalytics/RevenueTrendChart';
import EmployeePerformanceChart from '../../components/AdminAnalytics/EmployeePerformanceChart';
import CustomerInsightsChart from '../../components/AdminAnalytics/CustomerInsightsChart';
import AnalyticsFilters from '../../components/AdminAnalytics/AnalyticsFilters';

const AdminAnalytics = () => {
  const [dashboardData, setDashboardData] = useState<DashboardSummary | null>(null);
  const [serviceDistribution, setServiceDistribution] = useState<ServiceDistribution | null>(null);
  const [revenueTrend, setRevenueTrend] = useState<RevenueTrend | null>(null);
  const [employeePerformance, setEmployeePerformance] = useState<EmployeePerformance | null>(null);
  const [customerInsights, setCustomerInsights] = useState<CustomerInsights | null>(null);
  const [serviceCenters, setServiceCenters] = useState<ServiceCenter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filter states
  const [dateRange, setDateRange] = useState<string>('today');
  const [serviceCenterId, setServiceCenterId] = useState<string>('all');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');

  // Fetch service centers on component mount
  useEffect(() => {
    const loadServiceCenters = async () => {
      try {
        const centers = await fetchServiceCenters();
        setServiceCenters(centers);
      } catch (error) {
        console.error('Failed to load service centers:', error);
      }
    };
    loadServiceCenters();
  }, []);

  // Helper to build filter params
  const buildFilterParams = (): AnalyticsParams => {
    const params: AnalyticsParams = {};

    // Apply date range
    switch (dateRange) {
      case 'today': {
        const today = getTodayRange();
        params.startDate = today.startDate;
        params.endDate = today.endDate;
        break;
      }
      case 'last7days': {
        const last7 = getLastNDaysRange(7);
        params.startDate = last7.startDate;
        params.endDate = last7.endDate;
        break;
      }
      case 'last30days': {
        const last30 = getLastNDaysRange(30);
        params.startDate = last30.startDate;
        params.endDate = last30.endDate;
        break;
      }
      case 'thisMonth': {
        const thisMonth = getCurrentMonthRange();
        params.startDate = thisMonth.startDate;
        params.endDate = thisMonth.endDate;
        break;
      }
      case 'yearToDate': {
        const ytd = getYearToDateRange();
        params.startDate = ytd.startDate;
        params.endDate = ytd.endDate;
        break;
      }
      case 'custom': {
        // Use custom date range if provided
        if (customStartDate && customEndDate) {
          // Convert YYYY-MM-DD to ISO with time
          const start = new Date(customStartDate);
          start.setHours(0, 0, 0, 0);
          const end = new Date(customEndDate);
          end.setHours(23, 59, 59, 999);
          
          params.startDate = start.toISOString();
          params.endDate = end.toISOString();
        }
        break;
      }
      case 'all':
        // Use allTime parameter for all historical data
        params.allTime = true;
        break;
    }

    // Apply service center filter
    if (serviceCenterId !== 'all') {
      params.serviceCenterId = serviceCenterId;
    }

    return params;
  };

  // Fetch all data with current filters
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const params = buildFilterParams();
      
      const [dashboard, serviceData, revenueData, employeeData, customerData] = await Promise.all([
        getDashboardSummary(params),
        getServiceDistribution(params),
        getRevenueTrend({ ...params, periodType: 'DAILY' }),
        getEmployeePerformance(params),
        getCustomerInsights(params),
      ]);

      setDashboardData(dashboard);
      setServiceDistribution(serviceData);
      setRevenueTrend(revenueData);
      setEmployeePerformance(employeeData);
      setCustomerInsights(customerData);
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data on component mount with default filters (today)
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatCurrency = (amount: number) => {
    return `Rs. ${amount.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <AdminHeader title="Analytics Dashboard" />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-0 sm:px-6 lg:px-0 py-8">
        {/* Filters */}
        <AnalyticsFilters
          dateRange={dateRange}
          serviceCenterId={serviceCenterId}
          serviceCenters={serviceCenters}
          customStartDate={customStartDate}
          customEndDate={customEndDate}
          onDateRangeChange={setDateRange}
          onServiceCenterChange={setServiceCenterId}
          onCustomStartDateChange={setCustomStartDate}
          onCustomEndDateChange={setCustomEndDate}
          onApplyFilters={fetchData}
        />

        {isLoading ? (
          <div className="py-12 text-center text-gray-400">
            <div className="inline-block animate-spin rounded-full h-7 w-7 border-b-2 border-orange-600 mb-3 mx-auto"></div>
            <p className="text-sm">Loading analytics data...</p>
          </div>
        ) : (
          <>
            {/* Key Metrics - Top Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total Appointments */}
              <div className="bg-zinc-900 rounded-lg shadow-md p-6 border border-zinc-800">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-gray-400 text-sm">Total Appointments</p>
                    <p className="text-3xl font-bold text-white mt-1">{dashboardData?.totalAppointments || 0}</p>
                  </div>
                  <Calendar className="w-12 h-12 text-blue-500" />
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-green-500">
                    {dashboardData?.completedAppointments || 0} completed
                  </span>
                </div>
              </div>

              {/* Total Revenue */}
              <div className="bg-zinc-900 rounded-lg shadow-md p-6 border border-zinc-800">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-gray-400 text-sm">Total Revenue</p>
                    <p className="text-2xl font-bold text-white mt-1">
                      {formatCurrency(dashboardData?.totalRevenue || 0)}
                    </p>
                  </div>
                  <DollarSign className="w-12 h-12 text-green-500" />
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-green-500">
                    Avg: {formatCurrency(dashboardData?.averageServiceCost || 0)}
                  </span>
                </div>
              </div>

              {/* Completion Rate */}
              <div className="bg-zinc-900 rounded-lg shadow-md p-6 border border-zinc-800">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-gray-400 text-sm">Completion Rate</p>
                    <p className="text-3xl font-bold text-white mt-1">
                      {dashboardData?.completionRate.toFixed(1) || 0}%
                    </p>
                  </div>
                  <CheckCircle className="w-12 h-12 text-purple-500" />
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Activity className="w-4 h-4 text-purple-500" />
                  <span className="text-purple-500">Performance</span>
                </div>
              </div>

              {/* Total Customers */}
              <div className="bg-zinc-900 rounded-lg shadow-md p-6 border border-zinc-800">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-gray-400 text-sm">Total Customers</p>
                    <p className="text-3xl font-bold text-white mt-1">
                      {dashboardData?.totalCustomers || 0}
                    </p>
                  </div>
                  <Users className="w-12 h-12 text-orange-500" />
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-orange-500" />
                  <span className="text-orange-500">
                    {dashboardData?.repeatCustomerRate.toFixed(1) || 0}% repeat
                  </span>
                </div>
              </div>
            </div>

            {/* Status Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              {/* Pending */}
              <div className="bg-zinc-900 rounded-lg shadow-md p-6 border border-zinc-800">
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="w-8 h-8 text-yellow-500" />
                  <div>
                    <p className="text-sm text-gray-400">Pending</p>
                    <p className="text-2xl font-bold text-white">{dashboardData?.pendingAppointments || 0}</p>
                  </div>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-2">
                  <div 
                    className="bg-yellow-500 h-2 rounded-full transition-all"
                    style={{ 
                      width: `${dashboardData && dashboardData.totalAppointments > 0 
                        ? (dashboardData.pendingAppointments / dashboardData.totalAppointments * 100) 
                        : 0}%` 
                    }}
                  ></div>
                </div>
              </div>

              {/* Confirmed */}
              <div className="bg-zinc-900 rounded-lg shadow-md p-6 border border-zinc-800">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="w-8 h-8 text-cyan-500" />
                  <div>
                    <p className="text-sm text-gray-400">Confirmed</p>
                    <p className="text-2xl font-bold text-white">{dashboardData?.confirmedAppointments || 0}</p>
                  </div>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-2">
                  <div 
                    className="bg-cyan-500 h-2 rounded-full transition-all"
                    style={{ 
                      width: `${dashboardData && dashboardData.totalAppointments > 0 
                        ? (dashboardData.confirmedAppointments / dashboardData.totalAppointments * 100) 
                        : 0}%` 
                    }}
                  ></div>
                </div>
              </div>

              {/* In Progress */}
              <div className="bg-zinc-900 rounded-lg shadow-md p-6 border border-zinc-800">
                <div className="flex items-center gap-3 mb-4">
                  <Activity className="w-8 h-8 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-400">In Progress</p>
                    <p className="text-2xl font-bold text-white">{dashboardData?.inProgressAppointments || 0}</p>
                  </div>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ 
                      width: `${dashboardData && dashboardData.totalAppointments > 0 
                        ? (dashboardData.inProgressAppointments / dashboardData.totalAppointments * 100) 
                        : 0}%` 
                    }}
                  ></div>
                </div>
              </div>

              {/* Completed */}
              <div className="bg-zinc-900 rounded-lg shadow-md p-6 border border-zinc-800">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-400">Completed</p>
                    <p className="text-2xl font-bold text-white">{dashboardData?.completedAppointments || 0}</p>
                  </div>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{ 
                      width: `${dashboardData && dashboardData.totalAppointments > 0 
                        ? (dashboardData.completedAppointments / dashboardData.totalAppointments * 100) 
                        : 0}%` 
                    }}
                  ></div>
                </div>
              </div>

              {/* Cancelled */}
              <div className="bg-zinc-900 rounded-lg shadow-md p-6 border border-zinc-800">
                <div className="flex items-center gap-3 mb-4">
                  <AlertCircle className="w-8 h-8 text-red-500" />
                  <div>
                    <p className="text-sm text-gray-400">Cancelled</p>
                    <p className="text-2xl font-bold text-white">{dashboardData?.cancelledAppointments || 0}</p>
                  </div>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full transition-all"
                    style={{ 
                      width: `${dashboardData && dashboardData.totalAppointments > 0 
                        ? (dashboardData.cancelledAppointments / dashboardData.totalAppointments * 100) 
                        : 0}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <ServiceTypeChart data={serviceDistribution} isLoading={false} />
              <RevenueTrendChart data={revenueTrend} isLoading={false} />
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <EmployeePerformanceChart data={employeePerformance} isLoading={false} />
              <CustomerInsightsChart data={customerInsights} isLoading={false} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminAnalytics;
