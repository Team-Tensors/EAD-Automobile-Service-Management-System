import { Calendar, Building2, Filter } from 'lucide-react';
import type { ServiceCenter } from '@/types/serviceCenter';

interface AnalyticsFiltersProps {
  dateRange: string;
  serviceCenterId: string;
  serviceCenters: ServiceCenter[];
  customStartDate: string;
  customEndDate: string;
  onDateRangeChange: (value: string) => void;
  onServiceCenterChange: (value: string) => void;
  onCustomStartDateChange: (value: string) => void;
  onCustomEndDateChange: (value: string) => void;
  onApplyFilters: () => void;
}

const AnalyticsFilters = ({
  dateRange,
  serviceCenterId,
  serviceCenters,
  customStartDate,
  customEndDate,
  onDateRangeChange,
  onServiceCenterChange,
  onCustomStartDateChange,
  onCustomEndDateChange,
  onApplyFilters,
}: AnalyticsFiltersProps) => {
  return (
    <div className="bg-zinc-900 rounded-lg shadow-md p-6 mb-8 border border-zinc-800">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-orange-500" />
        <h2 className="text-lg font-semibold text-white">Filters</h2>
      </div>

      <div className="space-y-4">
        {/* First Row: Date Range and Service Center */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Date Range Filter */}
          <div>
            <label className="flex items-center gap-2 mb-2 text-sm text-gray-400">
              <Calendar className="w-4 h-4" />
              Date Range
            </label>
            <select
              value={dateRange}
              onChange={(e) => onDateRangeChange(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all"
            >
              <option value="today">Today</option>
              <option value="last7days">Last 7 Days</option>
              <option value="last30days">Last 30 Days</option>
              <option value="thisMonth">This Month</option>
              <option value="yearToDate">Year to Date</option>
              <option value="all">All Time</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {/* Service Center Filter */}
          <div>
            <label className="flex items-center gap-2 mb-2 text-sm text-gray-400">
              <Building2 className="w-4 h-4" />
              Service Center
            </label>
            <select
              value={serviceCenterId}
              onChange={(e) => onServiceCenterChange(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all"
            >
              <option value="all">All Service Centers</option>
              {serviceCenters.map((center) => (
                <option key={center.id} value={center.id}>
                  {center.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Second Row: Custom Date Range (only shown when custom is selected) */}
        {dateRange === 'custom' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
            <div>
              <label className="block mb-2 text-sm text-gray-400">
                Start Date
              </label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => onCustomStartDateChange(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm text-gray-400">
                End Date
              </label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => onCustomEndDateChange(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-all"
              />
            </div>
          </div>
        )}

        {/* Apply Button */}
        <div className="flex justify-end">
          <button
            onClick={onApplyFilters}
            className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsFilters;
