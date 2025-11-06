import { User, Mail, Phone, MapPin, Clock, Edit2, Save, XCircle, Loader } from 'lucide-react';
import type { Employee } from '@/types/admin';
import type { ServiceCenter } from '@/types/serviceCenter';

interface EmployeeTableRowProps {
  employee: Employee;
  serviceCenters: ServiceCenter[];
  isEditing: boolean;
  selectedCenterId: string | null;
  isAssigning: boolean;
  onEdit: (employeeId: string, currentCenterId?: string) => void;
  onSave: (employeeId: string) => void;
  onCancel: () => void;
  onCenterChange: (centerId: string) => void;
}

const EmployeeTableRow = ({
  employee,
  serviceCenters,
  isEditing,
  selectedCenterId,
  isAssigning,
  onEdit,
  onSave,
  onCancel,
  onCenterChange
}: EmployeeTableRowProps) => {
  return (
    <tr className="hover:bg-zinc-800/50 transition">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{employee.name}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2 text-sm text-gray-300">
          <Mail className="w-4 h-4 text-gray-400" />
          {employee.email}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2 text-sm text-gray-300">
          <Phone className="w-4 h-4 text-gray-400" />
          {employee.phoneNumber || 'N/A'}
        </div>
      </td>
      <td className="px-6 py-4">
        {isEditing ? (
          <select
            value={selectedCenterId || ''}
            onChange={(e) => onCenterChange(e.target.value)}
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            disabled={isAssigning}
          >
            <option value="">Select a center...</option>
            {serviceCenters.map(center => (
              <option key={center.id} value={center.id}>{center.name}</option>
            ))}
          </select>
        ) : (
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className={`text-sm ${employee.serviceCenterId ? 'text-green-500' : 'text-orange-500'}`}>
              {employee.serviceCenterName || 'Unassigned'}
            </span>
          </div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2 text-sm text-gray-300">
          <Clock className="w-4 h-4 text-gray-400" />
          {employee.totalHoursWorked?.toFixed(1) || '0.0'}h
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onSave(employee.id)}
              disabled={isAssigning}
              className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              title="Save"
            >
              {isAssigning ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            </button>
            <button
              onClick={onCancel}
              disabled={isAssigning}
              className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              title="Cancel"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => onEdit(employee.id, employee.serviceCenterId)}
            className="p-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition"
            title="Edit Center"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        )}
      </td>
    </tr>
  );
};

export default EmployeeTableRow;
