import { useState } from 'react';
import { X, Download, FileText, Calendar, FileSpreadsheet } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getDashboardSummary,
  getServiceDistribution,
  getRevenueTrend,
  getEmployeePerformance,
  getCustomerInsights,
} from '@/services/analyticsService';
import type { AnalyticsParams } from '@/types/analytics';
import {
  convertToCSV,
  downloadCSV,
  downloadExcel,
  formatDashboardSummary,
  formatServiceDistribution,
  formatRevenueTrend,
  formatEmployeePerformance,
  formatCustomerInsights,
  formatAppointmentsDetail,
} from '@/util/exportUtils';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ReportType = 
  | 'dashboard-summary'
  | 'appointments-detail'
  | 'revenue-report'
  | 'service-distribution'
  | 'employee-performance'
  | 'customer-insights';

type ExportFormat = 'csv' | 'excel';

const ExportModal = ({ isOpen, onClose }: ExportModalProps) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportType, setReportType] = useState<ReportType>('dashboard-summary');
  const [exportFormat, setExportFormat] = useState<ExportFormat>('csv');
  const [isExporting, setIsExporting] = useState(false);

  const reportOptions = [
    { value: 'dashboard-summary', label: 'Dashboard Summary', description: 'Overall metrics and KPIs' },
    { value: 'appointments-detail', label: 'Appointments Detail', description: 'Complete appointment records' },
    { value: 'revenue-report', label: 'Revenue Report', description: 'Revenue breakdown by service' },
    { value: 'service-distribution', label: 'Service Distribution', description: 'Service types and counts' },
    { value: 'employee-performance', label: 'Employee Performance', description: 'Employee metrics and stats' },
    { value: 'customer-insights', label: 'Customer Insights', description: 'Customer behavior analytics' },
  ];

  const handleExport = async () => {
    if (!startDate || !endDate) {
      toast.error('Please select both start and end dates');
      return;
    }

    setIsExporting(true);

    try {
      // Convert YYYY-MM-DD to ISO DateTime format (same as AdminAnalytics page)
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      // Build analytics params
      const params: AnalyticsParams = {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        allTime: false,
      };

      let csvContent = '';
      const fileName = `${reportType}_${startDate}_to_${endDate}`;

      // Fetch data from appropriate API and format for export
      switch (reportType) {
        case 'dashboard-summary': {
          const data = await getDashboardSummary(params);
          const formatted = formatDashboardSummary(data);
          csvContent = convertToCSV(formatted.rows, formatted.headers);
          break;
        }

        case 'service-distribution': {
          const data = await getServiceDistribution(params);
          const formatted = formatServiceDistribution(data);
          csvContent = convertToCSV(formatted.rows, formatted.headers);
          break;
        }

        case 'revenue-report': {
          const data = await getRevenueTrend(params);
          const formatted = formatRevenueTrend(data);
          csvContent = convertToCSV(formatted.rows, formatted.headers);
          break;
        }

        case 'employee-performance': {
          const data = await getEmployeePerformance(params);
          const formatted = formatEmployeePerformance(data);
          csvContent = convertToCSV(formatted.rows, formatted.headers);
          break;
        }

        case 'customer-insights': {
          const data = await getCustomerInsights(params);
          const formatted = formatCustomerInsights(data);
          csvContent = convertToCSV(formatted.rows, formatted.headers);
          break;
        }

        case 'appointments-detail': {
          // For appointments detail, use dashboard summary as base
          // In production, you might want a dedicated appointments API
          const data = await getDashboardSummary(params);
          const formatted = formatAppointmentsDetail(data);
          csvContent = convertToCSV(formatted.rows, formatted.headers);
          break;
        }

        default:
          throw new Error(`Unknown report type: ${reportType}`);
      }

      // Download the file in the appropriate format
      if (exportFormat === 'csv') {
        downloadCSV(csvContent, `${fileName}.csv`);
      } else {
        downloadExcel(csvContent, `${fileName}.xlsx`);
      }

      // Show success message
      toast.success(`Report downloaded: ${fileName}.${exportFormat === 'csv' ? 'csv' : 'xlsx'}`);

      // Close modal after successful export
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      console.error('Export error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to export report';
      toast.error(`Export failed: ${errorMessage}`);
    } finally {
      setIsExporting(false);
    }
  };

  const setQuickDateRange = (range: 'last7days' | 'last30days' | 'thisMonth' | 'ytd') => {
    const today = new Date();
    const formatDate = (date: Date) => {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };

    let start: Date;
    const end = today;

    switch (range) {
      case 'last7days':
        start = new Date(today);
        start.setDate(today.getDate() - 7);
        break;
      case 'last30days':
        start = new Date(today);
        start.setDate(today.getDate() - 30);
        break;
      case 'thisMonth':
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      case 'ytd':
        start = new Date(today.getFullYear(), 0, 1);
        break;
    }

    setStartDate(formatDate(start));
    setEndDate(formatDate(end));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 rounded-xl shadow-2xl border border-zinc-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-600/10 rounded-lg">
              <Download className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Export Report</h3>
              <p className="text-xs text-gray-400 mt-0.5">Download analytics data in CSV or Excel format</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Date Range Selection */}
          <div>
            <label className="flex items-center gap-2 mb-3 text-sm font-semibold text-white">
              <Calendar className="w-4 h-4 text-orange-500" />
              Date Range
            </label>
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <label className="block mb-2 text-xs text-gray-400">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                />
              </div>
              <div>
                <label className="block mb-2 text-xs text-gray-400">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                />
              </div>
            </div>
            {/* Quick Date Presets */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setQuickDateRange('last7days')}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-xs text-gray-300 hover:text-white transition-colors cursor-pointer"
              >
                Last 7 Days
              </button>
              <button
                onClick={() => setQuickDateRange('last30days')}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-xs text-gray-300 hover:text-white transition-colors cursor-pointer"
              >
                Last 30 Days
              </button>
              <button
                onClick={() => setQuickDateRange('thisMonth')}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-xs text-gray-300 hover:text-white transition-colors cursor-pointer"
              >
                This Month
              </button>
              <button
                onClick={() => setQuickDateRange('ytd')}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-xs text-gray-300 hover:text-white transition-colors cursor-pointer"
              >
                Year to Date
              </button>
            </div>
          </div>

          {/* Report Type Selection */}
          <div>
            <label className="flex items-center gap-2 mb-3 text-sm font-semibold text-white">
              <FileText className="w-4 h-4 text-orange-500" />
              Report Type
            </label>
            <div className="space-y-2">
              {reportOptions.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                    reportType === option.value
                      ? 'bg-orange-600/10 border-orange-500'
                      : 'bg-zinc-800/50 border-zinc-700 hover:border-zinc-600'
                  }`}
                >
                  <div className="relative flex items-center justify-center mt-1">
                    <input
                      type="radio"
                      name="reportType"
                      value={option.value}
                      checked={reportType === option.value}
                      onChange={(e) => setReportType(e.target.value as ReportType)}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      reportType === option.value
                        ? 'border-orange-500 bg-orange-600/20'
                        : 'border-zinc-600'
                    }`}>
                      {reportType === option.value && (
                        <div className="w-2.5 h-2.5 rounded-full bg-orange-500"></div>
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{option.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{option.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Export Format Selection */}
          <div>
            <label className="flex items-center gap-2 mb-3 text-sm font-semibold text-white">
              <FileSpreadsheet className="w-4 h-4 text-orange-500" />
              Export Format
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label
                className={`flex items-center justify-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                  exportFormat === 'csv'
                    ? 'bg-orange-600/10 border-orange-500'
                    : 'bg-zinc-800/50 border-zinc-700 hover:border-zinc-600'
                }`}
              >
                <div className="relative flex items-center justify-center">
                  <input
                    type="radio"
                    name="exportFormat"
                    value="csv"
                    checked={exportFormat === 'csv'}
                    onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    exportFormat === 'csv'
                      ? 'border-orange-500 bg-orange-600/20'
                      : 'border-zinc-600'
                  }`}>
                    {exportFormat === 'csv' && (
                      <div className="w-2.5 h-2.5 rounded-full bg-orange-500"></div>
                    )}
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-white">CSV</p>
                  <p className="text-xs text-gray-400">.csv file</p>
                </div>
              </label>
              <label
                className={`flex items-center justify-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                  exportFormat === 'excel'
                    ? 'bg-orange-600/10 border-orange-500'
                    : 'bg-zinc-800/50 border-zinc-700 hover:border-zinc-600'
                }`}
              >
                <div className="relative flex items-center justify-center">
                  <input
                    type="radio"
                    name="exportFormat"
                    value="excel"
                    checked={exportFormat === 'excel'}
                    onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    exportFormat === 'excel'
                      ? 'border-orange-500 bg-orange-600/20'
                      : 'border-zinc-600'
                  }`}>
                    {exportFormat === 'excel' && (
                      <div className="w-2.5 h-2.5 rounded-full bg-orange-500"></div>
                    )}
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-white">Excel</p>
                  <p className="text-xs text-gray-400">.xlsx file</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-zinc-800 bg-zinc-900/50">
          <button
            onClick={onClose}
            disabled={isExporting}
            className="px-5 py-2.5 text-sm font-medium text-gray-300 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={!startDate || !endDate || isExporting}
            className="flex items-center gap-2 px-6 py-2.5 bg-orange-600 hover:bg-orange-700 disabled:bg-zinc-700 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-medium text-sm rounded-lg transition-colors cursor-pointer"
          >
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Download Report
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
