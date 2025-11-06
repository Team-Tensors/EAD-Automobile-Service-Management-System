import { User, MapPin, AlertCircle, Clock } from 'lucide-react';
import type { Employee } from '@/types/admin';

interface EmployeeStatsCardsProps {
  employees: Employee[];
}

const EmployeeStatsCards = ({ employees }: EmployeeStatsCardsProps) => {
  const unassignedCount = employees.filter(e => !e.serviceCenterId).length;
  const assignedCount = employees.filter(e => e.serviceCenterId).length;
  const totalHours = employees.reduce((sum, e) => sum + (e.totalHoursWorked || 0), 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {/* Total Employees */}
      <div className="bg-zinc-900 rounded-lg shadow-md p-6 border border-zinc-800">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Total Employees</p>
            <p className="text-3xl font-bold text-white mt-1">
              {employees.length}
            </p>
          </div>
          <User className="w-12 h-12 text-orange-500" />
        </div>
      </div>

      {/* Assigned */}
      <div className="bg-zinc-900 rounded-lg shadow-md p-6 border border-zinc-800">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Assigned to Centers</p>
            <p className="text-3xl font-bold text-green-500 mt-1">
              {assignedCount}
            </p>
          </div>
          <MapPin className="w-12 h-12 text-green-500" />
        </div>
      </div>

      {/* Unassigned */}
      <div className="bg-zinc-900 rounded-lg shadow-md p-6 border border-zinc-800">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Unassigned</p>
            <p className="text-3xl font-bold text-orange-500 mt-1">
              {unassignedCount}
            </p>
          </div>
          <AlertCircle className="w-12 h-12 text-orange-500" />
        </div>
      </div>

      {/* Total Hours */}
      <div className="bg-zinc-900 rounded-lg shadow-md p-6 border border-zinc-800">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Total Hours Worked</p>
            <p className="text-3xl font-bold text-blue-500 mt-1">
              {totalHours.toFixed(0)}h
            </p>
          </div>
          <Clock className="w-12 h-12 text-blue-500" />
        </div>
      </div>
    </div>
  );
};

export default EmployeeStatsCards;
