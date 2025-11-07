import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { ServiceDistribution } from '@/types/analytics';
import { PieChart as PieChartIcon } from 'lucide-react';

interface ServiceTypeChartProps {
  data: ServiceDistribution | null;
  isLoading?: boolean;
}

// Subtle theme colors inspired by dashboard design
const COLORS = ['#EA580C', '#d97706', '#dc2626', '#65a30d', '#0891b2', '#7c3aed'];

const ServiceTypeChart = ({ data, isLoading }: ServiceTypeChartProps) => {
  if (isLoading) {
    return (
      <div className="bg-zinc-900 rounded-lg shadow-md p-6 border border-zinc-800">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-blue-500" />
            Service Type Distribution
          </h3>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        </div>
      </div>
    );
  }

  if (!data || data.serviceBreakdown.length === 0) {
    return (
      <div className="bg-zinc-900 rounded-lg shadow-md p-6 border border-zinc-800">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-blue-500" />
            Service Type Distribution
          </h3>
        </div>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500 text-sm">No service data available</p>
        </div>
      </div>
    );
  }

  const chartData = data.serviceBreakdown.map((item) => ({
    name: item.serviceName,
    value: item.count,
    percentage: item.percentage,
    revenue: item.totalRevenue,
  }));

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: any[] }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-3 shadow-lg">
          <p className="text-white font-semibold">{payload[0].name}</p>
          <p className="text-gray-300 text-sm">Count: {payload[0].value}</p>
          <p className="text-gray-300 text-sm">
            Revenue: Rs. {payload[0].payload.revenue.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-orange-500 text-sm">{payload[0].payload.percentage.toFixed(1)}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-zinc-900 rounded-lg shadow-md p-6 border border-zinc-800">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <PieChartIcon className="w-5 h-5 text-blue-500" />
          Service Type Distribution
        </h3>
        <div className="text-sm text-gray-400">
          Total: <span className="text-white font-semibold">{data.totalAppointments}</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value) => <span className="text-gray-300">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="mt-4 pt-4 border-t border-zinc-800 grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-400">Services</p>
          <p className="text-xl font-bold text-white">{data.serviceCount}</p>
          <p className="text-xs text-gray-500">{data.servicePercentage.toFixed(1)}%</p>
        </div>
        <div>
          <p className="text-sm text-gray-400">Modifications</p>
          <p className="text-xl font-bold text-white">{data.modificationCount}</p>
          <p className="text-xs text-gray-500">{data.modificationPercentage.toFixed(1)}%</p>
        </div>
      </div>
    </div>
  );
};

export default ServiceTypeChart;
