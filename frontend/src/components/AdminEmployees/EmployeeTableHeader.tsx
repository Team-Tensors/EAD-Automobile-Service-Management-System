import { ChevronUp, ChevronDown } from 'lucide-react';

export type SortField = 'name' | 'email' | 'phone' | 'center' | 'hours';
export type SortOrder = 'asc' | 'desc';

interface EmployeeTableHeaderProps {
  sortField: SortField;
  sortOrder: SortOrder;
  onSort: (field: SortField) => void;
}

const EmployeeTableHeader = ({ sortField, sortOrder, onSort }: EmployeeTableHeaderProps) => {
  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
  };

  return (
    <thead className="bg-zinc-800">
      <tr>
        <th 
          className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-orange-500 transition"
          onClick={() => onSort('name')}
        >
          <div className="flex items-center gap-2">
            Name {renderSortIcon('name')}
          </div>
        </th>
        <th 
          className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-orange-500 transition"
          onClick={() => onSort('email')}
        >
          <div className="flex items-center gap-2">
            Email {renderSortIcon('email')}
          </div>
        </th>
        <th 
          className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-orange-500 transition"
          onClick={() => onSort('phone')}
        >
          <div className="flex items-center gap-2">
            Phone {renderSortIcon('phone')}
          </div>
        </th>
        <th 
          className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-orange-500 transition"
          onClick={() => onSort('center')}
        >
          <div className="flex items-center gap-2">
            Service Center {renderSortIcon('center')}
          </div>
        </th>
        <th 
          className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-orange-500 transition"
          onClick={() => onSort('hours')}
        >
          <div className="flex items-center gap-2">
            Hours Worked {renderSortIcon('hours')}
          </div>
        </th>
        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Actions
        </th>
      </tr>
    </thead>
  );
};

export default EmployeeTableHeader;
