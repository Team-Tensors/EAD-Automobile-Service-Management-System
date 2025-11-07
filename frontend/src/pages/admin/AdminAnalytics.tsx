import { useState, useEffect } from 'react';
import { 
  Calendar, 
  TrendingUp, 
  Users, 
  Clock, 
  DollarSign,
  Package,
  AlertCircle,
  CheckCircle,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getUpcomingAppointments, getOngoingAppointments, getUnassignedAppointments, getAllEmployees } from '../../services/adminService';
import type { AdminService, Employee } from '@/types/admin';

const AdminAnalytics = () => {
  const { user } = useAuth();
  const [upcomingAppointments, setUpcomingAppointments] = useState<AdminService[]>([]);
  const [ongoingAppointments, setOngoingAppointments] = useState<AdminService[]>([]);
  const [unassignedAppointments, setUnassignedAppointments] = useState<AdminService[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [unassigned, upcoming, ongoing, employeeList] = await Promise.all([
          getUnassignedAppointments(),
          getUpcomingAppointments(),
          getOngoingAppointments(),
          getAllEmployees(),
        ]);

        setUnassignedAppointments(unassigned);
        setUpcomingAppointments(upcoming);
        setOngoingAppointments(ongoing);
        setEmployees(employeeList);
      } catch (error) {
        console.error('Failed to load analytics data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate metrics
  const totalAppointments = upcomingAppointments.length + ongoingAppointments.length + unassignedAppointments.length;
  const totalRevenue = [...upcomingAppointments, ...ongoingAppointments, ...unassignedAppointments]
    .reduce((sum, apt) => sum + (apt.estimatedCost || 0), 0);
  const avgServiceDuration = [...upcomingAppointments, ...ongoingAppointments, ...unassignedAppointments]
    .reduce((sum, apt) => sum + (apt.estimatedDuration || 0), 0) / (totalAppointments || 1);
  const assignmentRate = totalAppointments > 0 
    ? ((totalAppointments - unassignedAppointments.length) / totalAppointments * 100).toFixed(1)
    : 0;

  // Service type breakdown (mock data for now - would come from backend)
  const serviceBreakdown = [
    { name: 'Oil Change', count: 12, percentage: 30 },
    { name: 'Brake Service', count: 8, percentage: 20 },
    { name: 'Tire Rotation', count: 10, percentage: 25 },
    { name: 'Engine Diagnostic', count: 6, percentage: 15 },
    { name: 'Others', count: 4, percentage: 10 },
  ];

  const formatCurrency = (amount: number) => {
    return `Rs. ${amount.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-linear-to-r from-black to-zinc-950 text-white shadow-lg border-b border-zinc-700 pt-4">
        <div className="max-w-7xl mx-auto px-0 pt-26 pb-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
              <p className="text-gray-400 mt-2">
                Welcome back, {user?.firstName} {user?.lastName}!
              </p>
            </div>
            <div className="flex items-center gap-3 bg-zinc-800/50 px-4 py-2 rounded-lg border border-zinc-700">
              <Calendar className="w-5 h-5 text-gray-400" />
              <span className="font-semibold text-white">{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </header>

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
                    <p className="text-3xl font-bold text-white mt-1">{totalAppointments}</p>
                  </div>
                  <Calendar className="w-12 h-12 text-blue-500" />
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-green-500">Active services</span>
                </div>
              </div>

              {/* Total Revenue */}
              <div className="bg-zinc-900 rounded-lg shadow-md p-6 border border-zinc-800">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-gray-400 text-sm">Estimated Revenue</p>
                    <p className="text-2xl font-bold text-white mt-1">{formatCurrency(totalRevenue)}</p>
                  </div>
                  <DollarSign className="w-12 h-12 text-green-500" />
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-green-500">From active bookings</span>
                </div>
              </div>

              {/* Average Service Time */}
              <div className="bg-zinc-900 rounded-lg shadow-md p-6 border border-zinc-800">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-gray-400 text-sm">Avg. Service Time</p>
                    <p className="text-3xl font-bold text-white mt-1">{Math.round(avgServiceDuration)}m</p>
                  </div>
                  <Clock className="w-12 h-12 text-purple-500" />
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Activity className="w-4 h-4 text-purple-500" />
                  <span className="text-purple-500">Per appointment</span>
                </div>
              </div>

              {/* Assignment Rate */}
              <div className="bg-zinc-900 rounded-lg shadow-md p-6 border border-zinc-800">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-gray-400 text-sm">Assignment Rate</p>
                    <p className="text-3xl font-bold text-white mt-1">{assignmentRate}%</p>
                  </div>
                  <CheckCircle className="w-12 h-12 text-orange-500" />
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-orange-500" />
                  <span className="text-orange-500">{employees.length} employees</span>
                </div>
              </div>
            </div>

            {/* Status Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Unassigned */}
              <div className="bg-zinc-900 rounded-lg shadow-md p-6 border border-zinc-800">
                <div className="flex items-center gap-3 mb-4">
                  <AlertCircle className="w-8 h-8 text-orange-500" />
                  <div>
                    <p className="text-sm text-gray-400">Unassigned</p>
                    <p className="text-2xl font-bold text-white">{unassignedAppointments.length}</p>
                  </div>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-2">
                  <div 
                    className="bg-orange-500 h-2 rounded-full transition-all"
                    style={{ width: `${totalAppointments > 0 ? (unassignedAppointments.length / totalAppointments * 100) : 0}%` }}
                  ></div>
                </div>
              </div>

              {/* Upcoming */}
              <div className="bg-zinc-900 rounded-lg shadow-md p-6 border border-zinc-800">
                <div className="flex items-center gap-3 mb-4">
                  <Calendar className="w-8 h-8 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-400">Upcoming</p>
                    <p className="text-2xl font-bold text-white">{upcomingAppointments.length}</p>
                  </div>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${totalAppointments > 0 ? (upcomingAppointments.length / totalAppointments * 100) : 0}%` }}
                  ></div>
                </div>
              </div>

              {/* Ongoing */}
              <div className="bg-zinc-900 rounded-lg shadow-md p-6 border border-zinc-800">
                <div className="flex items-center gap-3 mb-4">
                  <Activity className="w-8 h-8 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-400">Ongoing</p>
                    <p className="text-2xl font-bold text-white">{ongoingAppointments.length}</p>
                  </div>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{ width: `${totalAppointments > 0 ? (ongoingAppointments.length / totalAppointments * 100) : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Charts Row - Placeholders */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Service Type Distribution - Placeholder */}
              <div className="bg-zinc-900 rounded-lg shadow-md p-6 border border-zinc-800">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-blue-500" />
                    Service Type Distribution
                  </h3>
                  <span className="text-xs text-gray-400 bg-zinc-800 px-3 py-1 rounded-full">Mock Data</span>
                </div>
                <div className="space-y-4">
                  {serviceBreakdown.map((service, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-300">{service.name}</span>
                        <span className="text-sm font-semibold text-white">{service.count} ({service.percentage}%)</span>
                      </div>
                      <div className="w-full bg-zinc-800 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all"
                          style={{ width: `${service.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Revenue Trend - Placeholder */}
              <div className="bg-zinc-900 rounded-lg shadow-md p-6 border border-zinc-800">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-green-500" />
                    Revenue Trend
                  </h3>
                  <span className="text-xs text-gray-400 bg-zinc-800 px-3 py-1 rounded-full">Coming Soon</span>
                </div>
                <div className="flex items-center justify-center h-64 border-2 border-dashed border-zinc-800 rounded-lg">
                  <div className="text-center">
                    <TrendingUp className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">Revenue chart will be displayed here</p>
                    <p className="text-gray-600 text-xs mt-1">Historical data required</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row - More Placeholders */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Employee Performance - Placeholder */}
              <div className="bg-zinc-900 rounded-lg shadow-md p-6 border border-zinc-800">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-500" />
                    Employee Performance
                  </h3>
                  <span className="text-xs text-gray-400 bg-zinc-800 px-3 py-1 rounded-full">Coming Soon</span>
                </div>
                <div className="flex items-center justify-center h-48 border-2 border-dashed border-zinc-800 rounded-lg">
                  <div className="text-center">
                    <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">Employee metrics will be displayed here</p>
                    <p className="text-gray-600 text-xs mt-1">Task completion, ratings, etc.</p>
                  </div>
                </div>
              </div>

              {/* Customer Insights - Placeholder */}
              <div className="bg-zinc-900 rounded-lg shadow-md p-6 border border-zinc-800">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Package className="w-5 h-5 text-orange-500" />
                    Customer Insights
                  </h3>
                  <span className="text-xs text-gray-400 bg-zinc-800 px-3 py-1 rounded-full">Coming Soon</span>
                </div>
                <div className="flex items-center justify-center h-48 border-2 border-dashed border-zinc-800 rounded-lg">
                  <div className="text-center">
                    <Package className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">Customer analytics will be displayed here</p>
                    <p className="text-gray-600 text-xs mt-1">Repeat customers, satisfaction, etc.</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminAnalytics;
