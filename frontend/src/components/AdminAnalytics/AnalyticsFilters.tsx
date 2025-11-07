import { useState, useEffect } from 'react';
import { Calendar, Building2, X, ChevronDown, Filter } from 'lucide-react';
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
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pendingDateRange, setPendingDateRange] = useState(dateRange);
  const [pendingServiceCenterId, setPendingServiceCenterId] = useState(serviceCenterId);
  const [hasUnappliedChanges, setHasUnappliedChanges] = useState(false);

  // Track when filters change
  useEffect(() => {
    const filtersChanged = 
      pendingDateRange !== dateRange || 
      pendingServiceCenterId !== serviceCenterId;
    setHasUnappliedChanges(filtersChanged);
  }, [pendingDateRange, pendingServiceCenterId, dateRange, serviceCenterId]);

  const dateRangeOptions = [
    { value: 'today', label: 'Today' },
    { value: 'last7days', label: 'Last 7 Days' },
    { value: 'next7days', label: 'Next 7 Days' },
    { value: 'last30days', label: 'Last 30 Days' },
    { value: 'thisMonth', label: 'This Month' },
    { value: 'yearToDate', label: 'Year to Date' },
    { value: 'all', label: 'All Time' },
    { value: 'custom', label: 'Custom Range' },
  ];

  const handleDateRangeChange = (value: string) => {
    setPendingDateRange(value);
    if (value === 'custom') {
      setShowDatePicker(true);
    }
  };

  const handleServiceCenterChange = (value: string) => {
    setPendingServiceCenterId(value);
  };

  const handleApplyFilters = () => {
    onDateRangeChange(pendingDateRange);
    onServiceCenterChange(pendingServiceCenterId);
    onApplyFilters();
    setHasUnappliedChanges(false);
  };

  const handleCustomDateApply = () => {
    setShowDatePicker(false);
    setPendingDateRange('custom');
    setHasUnappliedChanges(true);
  };

  const getDateRangeLabel = () => {
    const option = dateRangeOptions.find(opt => opt.value === pendingDateRange);
    if (pendingDateRange === 'custom' && customStartDate && customEndDate) {
      return `${new Date(customStartDate).toLocaleDateString()} - ${new Date(customEndDate).toLocaleDateString()}`;
    }
    return option?.label || 'Today';
  };

  const getServiceCenterLabel = () => {
    if (pendingServiceCenterId === 'all') return 'All Service Centers';
    const center = serviceCenters.find(c => c.id === pendingServiceCenterId);
    return center?.name || 'All Service Centers';
  };

  return (
    <>
      <div className="bg-zinc-900 rounded-lg shadow-md p-6 mb-8 border border-zinc-800">
        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Date Range Pill */}
          <div className="relative group">
            <button
              onClick={() => {}}
              className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 rounded-full px-4 py-2.5 text-sm text-white transition-all hover:border-orange-500/50 group"
            >
              <Calendar className="w-4 h-4 text-orange-500" />
              <span className="font-medium">{getDateRangeLabel()}</span>
              <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-orange-500 transition-colors" />
            </button>
            
            {/* Dropdown */}
            <div className="absolute top-full left-0 mt-2 w-64 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="p-2">
                {dateRangeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleDateRangeChange(option.value)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      pendingDateRange === option.value
                        ? 'bg-orange-600 text-white font-medium'
                        : 'text-gray-300 hover:bg-zinc-700 hover:text-white'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Service Center Pill */}
          <div className="relative group">
            <button
              onClick={() => {}}
              className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 rounded-full px-4 py-2.5 text-sm text-white transition-all hover:border-orange-500/50"
            >
              <Building2 className="w-4 h-4 text-orange-500" />
              <span className="font-medium">{getServiceCenterLabel()}</span>
              <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-orange-500 transition-colors" />
            </button>

            {/* Dropdown */}
            <div className="absolute top-full left-0 mt-2 w-72 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 max-h-80 overflow-y-auto">
              <div className="p-2">
                <button
                  onClick={() => handleServiceCenterChange('all')}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    pendingServiceCenterId === 'all'
                      ? 'bg-orange-600 text-white font-medium'
                      : 'text-gray-300 hover:bg-zinc-700 hover:text-white'
                  }`}
                >
                  All Service Centers
                </button>
                {serviceCenters.map((center) => (
                  <button
                    key={center.id}
                    onClick={() => handleServiceCenterChange(center.id)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      pendingServiceCenterId === center.id
                        ? 'bg-orange-600 text-white font-medium'
                        : 'text-gray-300 hover:bg-zinc-700 hover:text-white'
                    }`}
                  >
                    {center.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Apply Filters Button */}
          <button
            onClick={handleApplyFilters}
            disabled={!hasUnappliedChanges}
            className={`ml-auto flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
              hasUnappliedChanges
                ? 'bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-600/20'
                : 'bg-zinc-800 text-gray-500 cursor-not-allowed border border-zinc-700'
            }`}
          >
            <Filter className="w-4 h-4" />
            {hasUnappliedChanges ? 'Apply Filters' : 'Filters Applied'}
          </button>
        </div>
      </div>

      {/* Custom Date Picker Modal */}
      {showDatePicker && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-xl shadow-2xl border border-zinc-800 w-full max-w-md">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-600/10 rounded-lg">
                  <Calendar className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Select Date Range</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Choose start and end dates</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowDatePicker(false);
                  setPendingDateRange(dateRange);
                }}
                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
              </button>
            </div>

            {/* Date Inputs */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-300">
                  Start Date
                </label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => onCustomStartDateChange(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-300">
                  End Date
                </label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => onCustomEndDateChange(e.target.value)}
                  min={customStartDate}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                />
              </div>

              {/* Quick Presets */}
              <div className="pt-2">
                <p className="text-xs text-gray-400 mb-2">Quick Select</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      const today = new Date();
                      const lastWeek = new Date(today);
                      lastWeek.setDate(today.getDate() - 7);
                      onCustomStartDateChange(lastWeek.toISOString().split('T')[0]);
                      onCustomEndDateChange(today.toISOString().split('T')[0]);
                    }}
                    className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-xs text-gray-300 hover:text-white transition-colors"
                  >
                    Last 7 Days
                  </button>
                  <button
                    onClick={() => {
                      const today = new Date();
                      const lastMonth = new Date(today);
                      lastMonth.setDate(today.getDate() - 30);
                      onCustomStartDateChange(lastMonth.toISOString().split('T')[0]);
                      onCustomEndDateChange(today.toISOString().split('T')[0]);
                    }}
                    className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-xs text-gray-300 hover:text-white transition-colors"
                  >
                    Last 30 Days
                  </button>
                  <button
                    onClick={() => {
                      const today = new Date();
                      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
                      onCustomStartDateChange(firstDay.toISOString().split('T')[0]);
                      onCustomEndDateChange(today.toISOString().split('T')[0]);
                    }}
                    className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-xs text-gray-300 hover:text-white transition-colors"
                  >
                    This Month
                  </button>
                  <button
                    onClick={() => {
                      const today = new Date();
                      const firstDay = new Date(today.getFullYear(), 0, 1);
                      onCustomStartDateChange(firstDay.toISOString().split('T')[0]);
                      onCustomEndDateChange(today.toISOString().split('T')[0]);
                    }}
                    className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-xs text-gray-300 hover:text-white transition-colors"
                  >
                    Year to Date
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-zinc-800 bg-zinc-900/50">
              <button
                onClick={() => {
                  setShowDatePicker(false);
                  setPendingDateRange(dateRange);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCustomDateApply}
                disabled={!customStartDate || !customEndDate}
                className="px-6 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-zinc-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-medium text-sm rounded-lg transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AnalyticsFilters;
