import { Calendar, Car, Clock, Package, Wrench } from "lucide-react";
import type { AppointmentSummary } from "@/types/appointment";
import { AppointmentTypeValues } from "@/types/appointment";

interface Props {
  appointment: AppointmentSummary;
  isCancelling: boolean;
  onCancel: (id: string) => void;
  getStatusColor: (status: string) => string;
}

export const AppointmentCard = ({
  appointment,
  isCancelling,
  onCancel,
  getStatusColor,
}: Props) => {
  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const formatTime = (date: string) =>
    new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 sm:p-6 hover:border-zinc-700 transition-all">
      <div className="flex flex-col gap-4">
        {/* Top Section */}
        <div className="flex items-start justify-between gap-3">
          {/* Left - Service Info */}
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="p-2 bg-orange-500/10 rounded-lg flex-shrink-0">
              {appointment.type === AppointmentTypeValues.SERVICE ? (
                <Wrench className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
              ) : (
                <Package className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-xl font-semibold text-white truncate">
                {appointment.service}
              </h3>
              <span className="text-xs sm:text-sm text-gray-400">
                {appointment.type}
              </span>
            </div>
          </div>

          {/* Status Badge */}
          <span
            className={`px-3 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold border whitespace-nowrap ${getStatusColor(
              appointment.status
            )}`}
          >
            {appointment.status}
          </span>
        </div>

        {/* Details Section */}
        <div className="space-y-2 text-sm sm:text-base text-gray-300">
          <div className="flex items-center gap-2">
            <Car className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
            <span className="truncate">{appointment.vehicle}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
            <span>{formatDate(appointment.date)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
            <span>{formatTime(appointment.date)}</span>
          </div>
        </div>

        {/* Cancel Button */}
        {appointment.status === "PENDING" && (
          <button
            onClick={() => onCancel(appointment.id)}
            disabled={isCancelling}
            className="w-full sm:w-auto sm:self-end px-4 py-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCancelling ? "Cancelling..." : "Cancel Appointment"}
          </button>
        )}
      </div>
    </div>
  );
};
