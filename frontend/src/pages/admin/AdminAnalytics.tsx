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
  getCustomerInsights
} from '../../services/analyticsService';
import type { 
  DashboardSummary,
  ServiceDistribution,
  RevenueTrend,
  EmployeePerformance,
  CustomerInsights
} from '@/types/analytics';
import AdminHeader from '../../components/AdminDashboard/AdminHeader';
import ServiceTypeChart from '../../components/AdminAnalytics/ServiceTypeChart';
import RevenueTrendChart from '../../components/AdminAnalytics/RevenueTrendChart';
import EmployeePerformanceChart from '../../components/AdminAnalytics/EmployeePerformanceChart';
import CustomerInsightsChart from '../../components/AdminAnalytics/CustomerInsightsChart';

const AdminAnalytics = () => {
  const [dashboardData, setDashboardData] = useState<DashboardSummary | null>(null);
  const [serviceDistribution, setServiceDistribution] = useState<ServiceDistribution | null>(null);
  const [revenueTrend, setRevenueTrend] = useState<RevenueTrend | null>(null);
  const [employeePerformance, setEmployeePerformance] = useState<EmployeePerformance | null>(null);
  const [customerInsights, setCustomerInsights] = useState<CustomerInsights | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [dashboard, serviceData, revenueData, employeeData, customerData] = await Promise.all([
          getDashboardSummary(),
          getServiceDistribution(),
          getRevenueTrend({ periodType: 'DAILY' }),
          getEmployeePerformance(),
          getCustomerInsights(),
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

    fetchData();
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
