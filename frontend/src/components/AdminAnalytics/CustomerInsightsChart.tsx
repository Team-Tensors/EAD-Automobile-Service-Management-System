import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { CustomerInsights } from '@/types/analytics';
import { Package, Users, TrendingUp, Star } from 'lucide-react';

interface CustomerInsightsChartProps {
  data: CustomerInsights | null;
  isLoading?: boolean;
}

const CustomerInsightsChart = ({ data, isLoading }: CustomerInsightsChartProps) => {
  if (isLoading) {
    return (
      <div className="bg-zinc-900 rounded-lg shadow-md p-6 border border-zinc-800">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-orange-500" />
            Customer Insights
          </h3>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        </div>
      </div>
    );
  }

  if (!data || data.topCustomers.length === 0) {
    return (
      <div className="bg-zinc-900 rounded-lg shadow-md p-6 border border-zinc-800">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-orange-500" />
            Customer Insights
          </h3>
        </div>
        <div className="flex items-center justify-center h-64 border-2 border-dashed border-zinc-800 rounded-lg">
          <div className="text-center">
            <Package className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No customer data available</p>
          </div>
        </div>
      </div>
    );
  }

  // Get top 10 customers by total spent
  const topCustomers = data.topCustomers.slice(0, 10);
  
  const chartData = topCustomers.map((customer) => ({
    name: customer.customerName.split(' ')[0], // First name only
    totalSpent: customer.totalSpent,
    appointments: customer.totalAppointments,
    vehicles: customer.vehicleCount,
  }));

  const formatCurrency = (value: number) => {
    return `Rs. ${value.toLocaleString('en-LK', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: any[] }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-3 shadow-lg">
          <p className="text-white font-semibold mb-2">{data.name}</p>
          <p className="text-white text-sm">Total Spent: {formatCurrency(data.totalSpent)}</p>
          <p className="text-gray-300 text-sm">Appointments: {data.appointments}</p>
          <p className="text-gray-400 text-sm">Vehicles: {data.vehicles}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-zinc-900 rounded-lg shadow-md p-6 border border-zinc-800">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Package className="w-5 h-5 text-orange-500" />
          Customer Insights
        </h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-zinc-800 rounded-lg p-3">
          <p className="text-xs text-gray-400">Total Customers</p>
          <p className="text-lg font-bold text-white">{data.totalCustomers}</p>
        </div>
        <div className="bg-zinc-800 rounded-lg p-3">
          <p className="text-xs text-gray-400">Repeat Customers</p>
          <p className="text-lg font-bold text-white">{data.repeatCustomers}</p>
          <p className="text-xs text-gray-500">{data.repeatCustomerRate.toFixed(1)}%</p>
        </div>
        <div className="bg-zinc-800 rounded-lg p-3">
          <p className="text-xs text-gray-400">Avg. Spend</p>
          <p className="text-lg font-bold text-white">{formatCurrency(data.averageSpendPerCustomer)}</p>
        </div>
        <div className="bg-zinc-800 rounded-lg p-3">
          <p className="text-xs text-gray-400">Avg. Appointments</p>
          <p className="text-lg font-bold text-orange-500">{data.averageAppointmentsPerCustomer.toFixed(1)}</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
          <XAxis 
            dataKey="name" 
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => `Rs. ${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="totalSpent" 
            fill="#EA580C" 
            radius={[8, 8, 0, 0]}
            name="Total Spent"
          />
        </BarChart>
      </ResponsiveContainer>

      {/* Top 5 Customers List */}
      <div className="mt-6 pt-6 border-t border-zinc-800">
        <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
          <Star className="w-4 h-4 text-yellow-500" />
          Top 5 Customers
        </h4>
        <div className="space-y-2">
          {data.topCustomers.slice(0, 5).map((customer, index) => (
            <div key={customer.customerId} className="flex items-center justify-between bg-zinc-800 rounded-lg p-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center font-bold text-sm text-white">
                  {index + 1}
                </div>
                <div>
                  <p className="text-white font-medium text-sm">{customer.customerName}</p>
                  <p className="text-gray-400 text-xs flex items-center gap-2">
                    <Users className="w-3 h-3" />
                    {customer.totalAppointments} appointments · {customer.vehicleCount} vehicles
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-bold text-sm">{formatCurrency(customer.totalSpent)}</p>
                {customer.isRepeatCustomer && (
                  <p className="text-xs text-orange-500 flex items-center gap-1 justify-end">
                    <TrendingUp className="w-3 h-3" />
                    Repeat
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomerInsightsChart;
