import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import type { EmployeePerformance } from '@/types/analytics';
import { Users, Award } from 'lucide-react';

interface EmployeePerformanceChartProps {
  data: EmployeePerformance | null;
  isLoading?: boolean;
}

const EmployeePerformanceChart = ({ data, isLoading }: EmployeePerformanceChartProps) => {
  if (isLoading) {
    return (
      <div className="bg-zinc-900 rounded-lg shadow-md p-6 border border-zinc-800">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-500" />
            Employee Performance
          </h3>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        </div>
      </div>
    );
  }

  if (!data || data.topPerformers.length === 0) {
    return (
      <div className="bg-zinc-900 rounded-lg shadow-md p-6 border border-zinc-800">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-500" />
            Employee Performance
          </h3>
        </div>
        <div className="flex items-center justify-center h-64 border-2 border-dashed border-zinc-800 rounded-lg">
          <div className="text-center">
            <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No employee data available</p>
          </div>
        </div>
      </div>
    );
  }

  // Get top 10 performers for the chart
  const topPerformers = data.topPerformers.slice(0, 10);
  
  const chartData = topPerformers.map((employee) => ({
    name: employee.employeeName.split(' ')[0], // First name only for cleaner display
    completionRate: employee.completionRate,
    completed: employee.completedAppointments,
    total: employee.totalAppointments,
    hours: employee.totalHoursLogged,
  }));

  const getBarColor = (rate: number) => {
    if (rate >= 90) return '#EA580C'; // orange-600 - excellent
    if (rate >= 75) return '#d97706'; // amber-600 - good
    if (rate >= 60) return '#71717a'; // zinc-500 - average
    return '#52525b'; // zinc-600 - needs improvement
  };

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: any[] }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-3 shadow-lg">
          <p className="text-white font-semibold mb-2">{data.name}</p>
          <p className="text-white text-sm">Completion Rate: {data.completionRate.toFixed(1)}%</p>
          <p className="text-gray-300 text-sm">Completed: {data.completed} / {data.total}</p>
          <p className="text-gray-400 text-sm">Hours Logged: {data.hours.toFixed(1)}h</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-zinc-900 rounded-lg shadow-md p-6 border border-zinc-800">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-500" />
          Employee Performance
        </h3>
        <span className="text-xs text-gray-400 bg-zinc-800 px-3 py-1 rounded-full">
          Top {topPerformers.length} Performers
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-zinc-800 rounded-lg p-3">
          <p className="text-xs text-gray-400">Total Employees</p>
          <p className="text-lg font-bold text-white">{data.totalEmployees}</p>
        </div>
        <div className="bg-zinc-800 rounded-lg p-3">
          <p className="text-xs text-gray-400">Avg. Completion Rate</p>
          <p className="text-lg font-bold text-white">{data.averageCompletionRate.toFixed(1)}%</p>
        </div>
        <div className="bg-zinc-800 rounded-lg p-3">
          <p className="text-xs text-gray-400">Total Hours</p>
          <p className="text-lg font-bold text-orange-500">{data.totalHoursLogged.toFixed(0)}h</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
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
            domain={[0, 100]}
            label={{ value: 'Completion Rate (%)', angle: -90, position: 'insideLeft', style: { fill: '#9ca3af', fontSize: '12px' } }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ fontSize: '12px' }}
            formatter={() => <span className="text-gray-300">Completion Rate</span>}
          />
          <Bar dataKey="completionRate" radius={[8, 8, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.completionRate)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Top 3 Performers List */}
      <div className="mt-6 pt-6 border-t border-zinc-800">
        <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
          <Award className="w-4 h-4 text-yellow-500" />
          Top 3 Performers
        </h4>
        <div className="space-y-2">
          {data.topPerformers.slice(0, 3).map((employee, index) => (
            <div key={employee.employeeId} className="flex items-center justify-between bg-zinc-800 rounded-lg p-3">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  index === 0 ? 'bg-yellow-500 text-black' :
                  index === 1 ? 'bg-gray-400 text-black' :
                  'bg-orange-600 text-white'
                }`}>
                  {index + 1}
                </div>
                <div>
                  <p className="text-white font-medium text-sm">{employee.employeeName}</p>
                  <p className="text-gray-400 text-xs">{employee.email}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-bold text-sm">{employee.completionRate.toFixed(1)}%</p>
                <p className="text-gray-400 text-xs">{employee.completedAppointments}/{employee.totalAppointments}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmployeePerformanceChart;
