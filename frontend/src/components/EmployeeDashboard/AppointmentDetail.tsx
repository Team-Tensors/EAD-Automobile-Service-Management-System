import React from 'react';
import { User, Wrench, Timer, Calendar, MessageCircle, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Appointment {
  id: string;
  userFullName: string;
  brand: string;
  model: string;
  color: string;
  lastServiceDate: string | null;
  licensePlate: string;
  appointmentType: string;
  serviceOrModificationId: string;
  serviceOrModificationName: string;
  serviceOrModificationDescription: string;
  estimatedTimeMinutes: number;
  appointmentDate: string;
  status: string;
  description: string;
  phoneNumber?: string;
}

interface AppointmentDetailProps {
  appointment: Appointment;
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => React.ReactNode;
  getDisplayStatus: (status: string) => string;
  formatDate: (dateTime: string) => string;
  onShowStatusUpdate: () => void;
  onShowTimeLog: () => void;
  disableTimeLog: boolean;
}

const AppointmentDetail: React.FC<AppointmentDetailProps> = ({
  appointment,
  getStatusColor,
  getStatusIcon,
  getDisplayStatus,
  formatDate,
  onShowStatusUpdate,
  onShowTimeLog,
  disableTimeLog,
}) => {
  const navigate = useNavigate();
  
  const handleOpenChat = () => {
    navigate(`/chat/${appointment.id}`);
  };
  
  // Show chat button only for confirmed, in_progress, or completed appointments
  const showChatButton = ['CONFIRMED', 'IN_PROGRESS', 'COMPLETED'].includes(appointment.status);
  
  return (
    <div className="bg-zinc-900/50 rounded-lg shadow-md border border-zinc-800">
      {/* HEADER - Status & Type */}
      <div className="bg-linear-to-r from-zinc-800 to-zinc-900 p-4 rounded-t-lg border-b border-zinc-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Wrench className="w-6 h-6 text-orange-500" />
            <div>
              <h2 className="text-xl font-bold text-white">
                {appointment.serviceOrModificationName}
              </h2>
              <p className="text-sm text-gray-400">{appointment.appointmentType}</p>
            </div>
          </div>
          <span
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border-2 ${getStatusColor(
              appointment.status
            )}`}
          >
            {getStatusIcon(appointment.status)}
            {getDisplayStatus(appointment.status)}
          </span>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {/* CRITICAL INFO - Date, Customer, Vehicle in Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Scheduled Date & Time */}
          <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-orange-500" />
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Scheduled</p>
            </div>
            <p className="font-bold text-white text-base">
              {formatDate(appointment.appointmentDate)}
            </p>
            <p className="font-semibold text-gray-300 text-sm mt-1">
              {new Date(appointment.appointmentDate).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </p>
          </div>

          {/* Customer Info */}
          <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-5 h-5 text-blue-400" />
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Customer</p>
            </div>
            <p className="font-bold text-white">{appointment.userFullName}</p>
            {appointment.phoneNumber && (
              <div className="flex items-center gap-2 mt-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <p className="text-sm text-gray-300">{appointment.phoneNumber}</p>
              </div>
            )}
          </div>

          {/* Vehicle Info */}
          <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Wrench className="w-5 h-5 text-green-400" />
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Vehicle</p>
            </div>
            <p className="font-bold text-white">
              {appointment.brand} {appointment.model}
            </p>
            <p className="text-sm text-gray-300 mt-1">
              {appointment.licensePlate} • {appointment.color}
            </p>
          </div>
        </div>

        {/* SERVICE DETAILS */}
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wide">Service Details</h3>
            <div className="flex items-center gap-2 bg-zinc-900 px-3 py-1 rounded-full border border-zinc-700">
              <Timer className="w-4 h-4 text-orange-400" />
              <span className="text-sm font-semibold text-white">
                {appointment.estimatedTimeMinutes} mins
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">
            {appointment.serviceOrModificationDescription}
          </p>
        </div>

        {/* ADDITIONAL INFO ROW */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Last Service Date */}
          {appointment.lastServiceDate && (
            <div className="bg-zinc-800/30 border border-zinc-700 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <p className="text-xs text-gray-400">Last Serviced</p>
              </div>
              <p className="font-semibold text-white mt-1">
                {formatDate(appointment.lastServiceDate)}
              </p>
            </div>
          )}

          {/* Appointment Notes */}
          {appointment.description && (
            <div className="bg-zinc-800/30 border border-zinc-700 rounded-lg p-3">
              <p className="text-xs text-gray-400 mb-1">Notes</p>
              <p className="text-sm text-white">{appointment.description}</p>
            </div>
          )}
        </div>

        {/* ACTION BUTTONS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          {showChatButton && (
            <button
              onClick={handleOpenChat}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-blue-500/20"
            >
              <MessageCircle className="w-5 h-5" />
              Chat
            </button>
          )}
          
          <button
            onClick={onShowStatusUpdate}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-3 rounded-lg font-semibold transition-all shadow-lg hover:shadow-orange-500/20"
          >
            Update Status
          </button>
          
          <button
            onClick={onShowTimeLog}
            disabled={disableTimeLog}
            className="bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-3 rounded-lg font-semibold transition-all border border-zinc-600 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-zinc-700"
          >
            Log Time
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetail;