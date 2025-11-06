import { User } from 'lucide-react';

interface EmployeeHeaderProps {
  totalEmployees: number;
}

const EmployeeHeader = ({ totalEmployees }: EmployeeHeaderProps) => {
  return (
    <header className="bg-linear-to-r from-black to-zinc-950 text-white shadow-lg border-b border-zinc-700 mt-0">
      <div className="max-w-7xl mx-auto px-0 sm:px-6 md:px-8 lg:px-0 pt-26 pb-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Employee Management</h1>
            <p className="text-gray-400 mt-2">
              Manage employees and assign them to service centers
            </p>
          </div>
          <div className="flex items-center gap-3 bg-zinc-800/50 px-4 py-2 rounded-lg border border-zinc-700">
            <User className="w-5 h-5 text-gray-400" />
            <span className="font-semibold text-white">Total: {totalEmployees}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default EmployeeHeader;
