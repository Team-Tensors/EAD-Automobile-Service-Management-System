import { Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { RevenueTrend } from '@/types/analytics';
import { TrendingUp } from 'lucide-react';

interface RevenueTrendChartProps {
  data: RevenueTrend | null;
  isLoading?: boolean;
}

const RevenueTrendChart = ({ data, isLoading }: RevenueTrendChartProps) => {
  if (isLoading) {
    return (
      <div className="bg-zinc-900 rounded-lg shadow-md p-6 border border-zinc-800">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            Revenue Trend
          </h3>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        </div>
      </div>
    );
  }

  if (!data || data.trends.length === 0) {
    return (
      <div className="bg-zinc-900 rounded-lg shadow-md p-6 border border-zinc-800">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            Revenue Trend
          </h3>
          <span className="text-xs text-gray-400 bg-zinc-800 px-3 py-1 rounded-full">{data?.periodType || 'DAILY'}</span>
        </div>
        <div className="flex items-center justify-center h-64 border-2 border-dashed border-zinc-800 rounded-lg">
          <div className="text-center">
            <TrendingUp className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No revenue data available</p>
          </div>
        </div>
      </div>
    );
  }

  const chartData = data.trends.map((item) => ({
    period: item.periodLabel,
    revenue: item.revenue,
    serviceRevenue: item.serviceRevenue,
    modificationRevenue: item.modificationRevenue,
    appointments: item.appointmentCount,
  }));

  const formatCurrency = (value: number) => {
    return `Rs. ${value.toLocaleString('en-LK', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-3 shadow-lg">
          <p className="text-white font-semibold mb-2">{label}</p>
          <p className="text-white text-sm">Total: {formatCurrency(payload[0].payload.revenue)}</p>
          <p className="text-gray-300 text-sm">Services: {formatCurrency(payload[0].payload.serviceRevenue)}</p>
          <p className="text-gray-300 text-sm">Modifications: {formatCurrency(payload[0].payload.modificationRevenue)}</p>
          <p className="text-gray-400 text-sm mt-1">Appointments: {payload[0].payload.appointments}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-zinc-900 rounded-lg shadow-md p-6 border border-zinc-800">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-500" />
          Revenue Trend
        </h3>
        <span className="text-xs text-gray-400 bg-zinc-800 px-3 py-1 rounded-full">{data.periodType}</span>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-zinc-800 rounded-lg p-3">
          <p className="text-xs text-gray-400">Total Revenue</p>
          <p className="text-lg font-bold text-white">{formatCurrency(data.totalRevenue)}</p>
        </div>
        <div className="bg-zinc-800 rounded-lg p-3">
          <p className="text-xs text-gray-400">Average</p>
          <p className="text-lg font-bold text-white">{formatCurrency(data.averageRevenue)}</p>
        </div>
        <div className="bg-zinc-800 rounded-lg p-3">
          <p className="text-xs text-gray-400">Peak</p>
          <p className="text-lg font-bold text-orange-500">{formatCurrency(data.maxRevenue)}</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#EA580C" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#EA580C" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
          <XAxis 
            dataKey="period" 
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => `Rs. ${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ fontSize: '12px' }}
            formatter={(value) => <span className="text-gray-300">{value}</span>}
          />
          <Area 
            type="monotone" 
            dataKey="revenue" 
            stroke="#EA580C" 
            fillOpacity={1} 
            fill="url(#colorRevenue)" 
            name="Total Revenue"
          />
          <Line 
            type="monotone" 
            dataKey="serviceRevenue" 
            stroke="#6b7280" 
            strokeWidth={2}
            dot={{ fill: '#6b7280' }}
            name="Service Revenue"
          />
          <Line 
            type="monotone" 
            dataKey="modificationRevenue" 
            stroke="#9ca3af" 
            strokeWidth={2}
            dot={{ fill: '#9ca3af' }}
            name="Modification Revenue"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueTrendChart;
