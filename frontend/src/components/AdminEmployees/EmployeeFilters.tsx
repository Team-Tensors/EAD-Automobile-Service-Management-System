import { Search, Filter, X } from 'lucide-react';
import type { ServiceCenter } from '@/types/serviceCenter';

interface EmployeeFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterCenter: 'all' | string;
  setFilterCenter: (center: 'all' | string) => void;
  serviceCenters: ServiceCenter[];
}

const EmployeeFilters = ({
  searchQuery,
  setSearchQuery,
  filterCenter,
  setFilterCenter,
  serviceCenters
}: EmployeeFiltersProps) => {
  return (
    <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name, email, phone, or center..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {/* Center Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <select
            value={filterCenter}
            onChange={(e) => setFilterCenter(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none cursor-pointer"
          >
            <option value="all">All Centers</option>
            <option value="unassigned">Unassigned</option>
            {serviceCenters.map(center => (
              <option key={center.id} value={center.id}>{center.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Filters Display */}
      {(searchQuery || filterCenter !== 'all') && (
        <div className="mt-4 flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-400">Active filters:</span>
          {searchQuery && (
            <span className="px-3 py-1 bg-orange-500/20 text-orange-500 rounded-full text-xs font-semibold border border-orange-500/30 flex items-center gap-2">
              Search: "{searchQuery}"
              <button onClick={() => setSearchQuery('')}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filterCenter !== 'all' && (
            <span className="px-3 py-1 bg-orange-500/20 text-orange-500 rounded-full text-xs font-semibold border border-orange-500/30 flex items-center gap-2">
              Center: {filterCenter === 'unassigned' ? 'Unassigned' : serviceCenters.find(c => c.id === filterCenter)?.name}
              <button onClick={() => setFilterCenter('all')}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default EmployeeFilters;
