import React from 'react';
import './custom-scrollbar.css';
import { Car, Filter } from 'lucide-react';

interface Appointment {
  id: string;
  brand: string;
  model: string;
  year: string;
  appointmentType: string;
  status: string;
  appointmentDate: string;
}

interface AppointmentListProps {
  appointments: Appointment[];
  selectedAppointmentId: string | null;
  setSelectedAppointment: (apt: Appointment | null) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  loading: boolean;
  error: string | null;
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => React.ReactNode;
  getDisplayStatus: (status: string) => string;
  formatDate: (dateTime: string) => string;
}

const AppointmentList: React.FC<AppointmentListProps> = ({
  appointments,
  selectedAppointmentId,
  setSelectedAppointment,
  statusFilter,
  setStatusFilter,
  loading,
  error,
  getStatusColor,
  getStatusIcon,
  getDisplayStatus,
  formatDate,
}) => (
  <div className="bg-zinc-900/50 rounded-lg p-6 border border-zinc-800">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-bold text-white">Assigned Services</h2>
        {loading && (
          <span className="text-orange-400 animate-pulse text-xs">Loading...</span>
        )}
      </div>
      <Filter className="w-5 h-5 text-gray-500" />
    </div>
    <div className="flex gap-2 mb-4 flex-wrap items-center">
      {['ALL', 'NOT STARTED', 'IN PROGRESS', 'COMPLETED'].map(status => (
        <button
          key={status}
          onClick={() => setStatusFilter(status)}
          className={`px-3 py-1 rounded-full text-sm font-medium transition border ${
            statusFilter === status
              ? 'bg-orange-500 text-white border-orange-500'
              : 'bg-zinc-800 text-gray-300 border-zinc-700 hover:bg-zinc-700'
          }`}
        >
          {status}
        </button>
      ))}
    </div>
    {error && (
      <div className="bg-red-500/10 text-red-500 p-3 rounded-lg mb-4 text-sm border border-red-500/20">
        {error}
      </div>
    )}
  <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar">
      {loading && appointments.length === 0 && (
        <div className="text-center py-8 text-gray-400">Loading appointments...</div>
      )}
      {appointments.map(apt => (
        <div
          key={apt.id}
          onClick={() => setSelectedAppointment(apt)}
          className={`p-4 rounded-lg border-2 cursor-pointer transition ${
            selectedAppointmentId === apt.id
              ? 'border-orange-500 bg-zinc-800'
              : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/50'
          }`}
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Car className="w-4 h-4 text-gray-500" />
                <p className="font-semibold text-white">
                  {apt.brand} {apt.model} ({apt.year})
                </p>
              </div>
              <p className="text-sm text-gray-400 mb-2">{apt.appointmentType}</p>
              <span
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                  apt.status
                )}`}
              >
                {getStatusIcon(apt.status)}
                {getDisplayStatus(apt.status)}
              </span>
            </div>
          </div>
          <div className="text-xs text-gray-400 mt-2">{formatDate(apt.appointmentDate)}</div>
        </div>
      ))}
      {!loading && appointments.length === 0 && (
        <div className="text-center py-8 text-gray-400">No appointments found for this filter</div>
      )}
    </div>
  </div>
);

export default AppointmentList;
