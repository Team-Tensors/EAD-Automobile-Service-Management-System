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
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3 sm:p-4 hover:border-zinc-700 transition-all">
      <div className="flex flex-col gap-2.5 sm:gap-3">
        {/* Top Section */}
        <div className="flex items-start justify-between gap-2">
          {/* Left - Service Info */}
          <div className="flex items-start gap-2 flex-1 min-w-0">
            <div className="p-1.5 bg-orange-500/10 rounded-lg flex-shrink-0">
              {appointment.type === AppointmentTypeValues.SERVICE ? (
                <Wrench className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-500" />
              ) : (
                <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-500" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm sm:text-base font-semibold text-white truncate">
                {appointment.service}
              </h3>
              <span className="text-[10px] sm:text-xs text-gray-400">
                {appointment.type}
              </span>
            </div>
          </div>

          {/* Right - Status and Cancel Button */}
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold border whitespace-nowrap ${getStatusColor(
                appointment.status
              )}`}
            >
              {appointment.status}
            </span>

            {appointment.status === "PENDING" && (
              <button
                onClick={() => onCancel(appointment.id)}
                disabled={isCancelling}
                className="px-2 py-0.5 sm:px-3 sm:py-1 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-all text-[10px] sm:text-xs disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {isCancelling ? "Cancelling..." : "Cancel"}
              </button>
            )}
          </div>
        </div>

        {/* Details Section */}
        <div className="space-y-1 sm:space-y-1.5 text-xs sm:text-sm text-gray-300">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Car className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-500 flex-shrink-0" />
            <span className="truncate">{appointment.vehicle}</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-500 flex-shrink-0" />
            <span>{formatDate(appointment.date)}</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-500 flex-shrink-0" />
            <span>{formatTime(appointment.date)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
