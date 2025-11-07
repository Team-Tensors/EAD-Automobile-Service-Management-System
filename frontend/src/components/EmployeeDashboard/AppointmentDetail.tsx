import React from 'react';
import { User, Phone, Wrench, Timer, Calendar, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // ADD THIS

interface Appointment {
  id: string;
  userId: number;
  userFullName: string;
  phoneNumber: string;
  vehicleId: string;
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
  const navigate = useNavigate(); // ADD THIS
  
  // ADD THIS FUNCTION
  const handleOpenChat = () => {
    navigate(`/chat/${appointment.id}`);
  };
  
  // Show chat button only for confirmed, in_progress, or completed appointments
  const showChatButton = ['CONFIRMED', 'IN_PROGRESS', 'COMPLETED'].includes(appointment.status);
  
  return (
    <div className="bg-zinc-900/50 rounded-lg shadow-md p-6 border border-zinc-800">
      {/* VEHICLE INFO */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {appointment.brand} {appointment.model}
          </h2>
          <p className="text-gray-400">
            {appointment.licensePlate} • {appointment.color}
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(
            appointment.status
          )}`}
        >
          {getStatusIcon(appointment.status)}
          {getDisplayStatus(appointment.status)}
        </span>
      </div>
      
      {/* CUSTOMER INFO */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="flex items-center gap-3 p-3 bg-zinc-800 rounded-lg border border-zinc-700">
          <User className="w-5 h-5 text-orange-500" />
          <div>
            <p className="text-xs text-gray-400">Customer</p>
            <p className="font-semibold text-white">{appointment.userFullName}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-zinc-800 rounded-lg border border-zinc-700">
          <Phone className="w-5 h-5 text-orange-500" />
          <div>
            <p className="text-xs text-gray-400">Phone</p>
            <p className="font-semibold text-white">{appointment.phoneNumber}</p>
          </div>
        </div>
      </div>
      
      {/* SERVICE INFO */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-zinc-800 rounded-lg border border-zinc-700 flex flex-col gap-3 md:col-span-2">
          <div className="flex items-center gap-3 mb-1">
            <Wrench className="w-5 h-5 text-orange-500" />
            <span className="text-xs text-gray-400 font-medium">
              Service / Modification
            </span>
          </div>
          <div className="font-semibold text-white text-base leading-tight mb-1">
            {appointment.serviceOrModificationName}
          </div>
          <div className="text-xs text-gray-400 mb-2">
            {appointment.serviceOrModificationDescription}
          </div>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <Timer className="w-5 h-5 text-orange-500" />
              <span className="text-xs text-gray-400 font-medium">
                Estimated Time
              </span>
              <span className="text-white font-semibold text-base ml-2">
                {appointment.estimatedTimeMinutes ?? "N/A"} mins
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* LAST SERVICE DATE */}
      {appointment.lastServiceDate && (
        <div className="flex items-center gap-3 mb-6 p-3 bg-zinc-800 rounded-lg border border-zinc-700">
          <Calendar className="w-5 h-5 text-orange-500" />
          <div>
            <p className="text-xs text-gray-400">Last Service Date</p>
            <p className="font-semibold text-white">
              {formatDate(appointment.lastServiceDate)}
            </p>
          </div>
        </div>
      )}
      
      {/* DESCRIPTION */}
      {appointment.description && (
        <div className="mb-6 p-3 bg-zinc-800 rounded-lg border border-zinc-700">
          <p className="text-xs text-gray-400 mb-1">Appointment Notes</p>
          <p className="text-sm text-white">{appointment.description}</p>
        </div>
      )}
      
      {/* CONTROL BUTTONS - UPDATED */}
      <div className="grid grid-cols-2 gap-3">
        {/* Chat Button - NEW */}
        {showChatButton && (
          <button
            onClick={handleOpenChat}
            className="col-span-2 bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-5 h-5" />
            Chat with Customer
          </button>
        )}
        
        <button
          onClick={onShowStatusUpdate}
          className="bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition"
        >
          Update Status
        </button>
        <button
          onClick={onShowTimeLog}
          disabled={disableTimeLog}
          className="bg-zinc-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-zinc-700 transition border border-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Log Time
        </button>
      </div>
    </div>
  );
};

export default AppointmentDetail;