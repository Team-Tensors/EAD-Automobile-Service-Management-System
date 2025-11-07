import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { ServiceDistribution } from '@/types/analytics';
import { PieChart as PieChartIcon, TrendingUp } from 'lucide-react';

interface ServiceTypeChartProps {
  data: ServiceDistribution | null;
  isLoading?: boolean;
}

// Simplified color scheme: Primary orange with gradient shades
const COLORS = {
  services: '#EA580C',        // orange-600 (primary theme color)
  modifications: '#F97316',   // orange-500 (lighter shade)
};

const ServiceTypeChart = ({ data, isLoading }: ServiceTypeChartProps) => {
  if (isLoading) {
    return (
      <div className="bg-zinc-900 rounded-lg shadow-md p-6 border border-zinc-800">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-orange-500" />
            Service Distribution
          </h3>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        </div>
      </div>
    );
  }

  if (!data || data.totalAppointments === 0) {
    return (
      <div className="bg-zinc-900 rounded-lg shadow-md p-6 border border-zinc-800">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-orange-500" />
            Service Distribution
          </h3>
        </div>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500 text-sm">No service data available</p>
        </div>
      </div>
    );
  }

  // Main pie chart data - Services vs Modifications
  const mainChartData = [
    { name: 'Services', value: data.serviceCount, percentage: data.servicePercentage },
    { name: 'Modifications', value: data.modificationCount, percentage: data.modificationPercentage },
  ];

  // Top 5 services for the list
  const topServices = data.serviceBreakdown
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const formatCurrency = (amount: number) => {
    return `Rs. ${amount.toLocaleString('en-LK', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { percentage: number } }> }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-3 shadow-lg">
          <p className="text-white font-semibold">{payload[0].name}</p>
          <p className="text-gray-300 text-sm">Count: {payload[0].value}</p>
          <p className="text-orange-500 text-sm font-semibold">{payload[0].payload.percentage.toFixed(1)}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-zinc-900 rounded-lg shadow-md p-6 border border-zinc-800">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <PieChartIcon className="w-5 h-5 text-orange-500" />
          Service Distribution
        </h3>
        <div className="text-sm">
          <span className="text-gray-400">Total: </span>
          <span className="text-white font-semibold">{data.totalAppointments}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Pie Chart */}
        <div className="flex flex-col items-center justify-center">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={mainChartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
              >
                <Cell fill={COLORS.services} />
                <Cell fill={COLORS.modifications} />
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div className="flex gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.services }}></div>
              <span className="text-sm text-gray-300">Services</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.modifications }}></div>
              <span className="text-sm text-gray-300">Modifications</span>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4 w-full mt-6">
            <div className="bg-zinc-800/50 rounded-lg p-3 border border-zinc-700">
              <p className="text-xs text-gray-400 mb-1">Services</p>
              <p className="text-2xl font-bold text-white">{data.serviceCount}</p>
              <p className="text-xs text-orange-500 font-semibold">{data.servicePercentage.toFixed(1)}%</p>
            </div>
            <div className="bg-zinc-800/50 rounded-lg p-3 border border-zinc-700">
              <p className="text-xs text-gray-400 mb-1">Modifications</p>
              <p className="text-2xl font-bold text-white">{data.modificationCount}</p>
              <p className="text-xs text-orange-500 font-semibold">{data.modificationPercentage.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        {/* Right: Top Services List */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-orange-500" />
            <h4 className="text-sm font-semibold text-white">Top Services</h4>
          </div>
          <div className="space-y-3 flex-1">
            {topServices.map((service, index) => (
              <div key={service.serviceId} className="flex items-center gap-3">
                {/* Rank */}
                <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  index === 0 ? 'bg-orange-600 text-white' : 
                  index === 1 ? 'bg-orange-600/70 text-white' : 
                  'bg-zinc-700 text-gray-400'
                }`}>
                  {index + 1}
                </div>

                {/* Service Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">{service.serviceName}</p>
                  <p className="text-xs text-gray-400">
                    {service.count} appointments • {formatCurrency(service.totalRevenue)}
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="shrink-0 w-12 text-right">
                  <p className="text-xs font-semibold text-orange-500">{service.percentage.toFixed(0)}%</p>
                </div>
              </div>
            ))}
            {topServices.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-8">No services data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceTypeChart;

