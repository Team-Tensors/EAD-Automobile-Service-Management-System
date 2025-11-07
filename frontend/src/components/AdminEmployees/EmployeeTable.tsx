import { User} from 'lucide-react';
import type { Employee } from '@/types/admin';
import type { ServiceCenter } from '@/types/serviceCenter';
import EmployeeTableHeader, { type SortField, type SortOrder } from './EmployeeTableHeader';
import EmployeeTableRow from './EmployeeTableRow';

interface EmployeeTableProps {
  employees: Employee[];
  serviceCenters: ServiceCenter[];
  isLoading: boolean;
  searchQuery: string;
  filterCenter: 'all' | string;
  sortField: SortField;
  sortOrder: SortOrder;
  editingEmployeeId: string | null;
  selectedCenterId: string | null;
  isAssigning: boolean;
  onSort: (field: SortField) => void;
  onEdit: (employeeId: string, currentCenterId?: string) => void;
  onSave: (employeeId: string) => void;
  onCancel: () => void;
  onCenterChange: (centerId: string) => void;
}

const EmployeeTable = ({
  employees,
  serviceCenters,
  isLoading,
  searchQuery,
  filterCenter,
  sortField,
  sortOrder,
  editingEmployeeId,
  selectedCenterId,
  isAssigning,
  onSort,
  onEdit,
  onSave,
  onCancel,
  onCenterChange
}: EmployeeTableProps) => {
  return (
    <div className="bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden">
      <div className="p-6 border-b border-zinc-800">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <User className="w-5 h-5 text-orange-500" />
            Employee Directory
          </h2>
          <span className="px-3 py-1 bg-orange-500/20 text-orange-500 rounded-full text-sm font-bold border border-orange-500/30">
            {employees.length} {employees.length === 1 ? 'employee' : 'employees'}
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-gray-400">
          <div className="inline-block animate-spin rounded-full h-7 w-7 border-b-2 border-orange-600 mb-3 mx-auto"></div>
          <p className="text-sm">Loading employee data...</p>
        </div>
      ) : employees.length === 0 ? (
        <div className="text-center py-12">
          <User className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No employees found</p>
          <p className="text-zinc-500 text-sm mt-2">
            {searchQuery || filterCenter !== 'all' 
              ? 'Try adjusting your filters'
              : 'No employees have been added yet'
            }
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <EmployeeTableHeader 
              sortField={sortField}
              sortOrder={sortOrder}
              onSort={onSort}
            />
            <tbody className="divide-y divide-zinc-800">
              {employees.map((employee) => (
                <EmployeeTableRow
                  key={employee.id}
                  employee={employee}
                  serviceCenters={serviceCenters}
                  isEditing={editingEmployeeId === employee.id}
                  selectedCenterId={selectedCenterId}
                  isAssigning={isAssigning}
                  onEdit={onEdit}
                  onSave={onSave}
                  onCancel={onCancel}
                  onCenterChange={onCenterChange}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EmployeeTable;
