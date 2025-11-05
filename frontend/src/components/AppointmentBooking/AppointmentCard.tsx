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
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 hover:border-zinc-700 transition-all">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Left */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              {appointment.type === AppointmentTypeValues.SERVICE ? (
                <Wrench className="w-5 h-5 text-orange-500" />
              ) : (
                <Package className="w-5 h-5 text-orange-500" />
              )}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">
                {appointment.service}
              </h3>
              <span className="text-sm text-gray-400">{appointment.type}</span>
            </div>
          </div>

          <div className="space-y-2 text-gray-300">
            <div className="flex items-center gap-2">
              <Car className="w-4 h-4 text-gray-500" />
              <span>{appointment.vehicle}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span>{formatDate(appointment.date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span>{formatTime(appointment.date)}</span>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="flex flex-col items-end gap-3">
          <span
            className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(
              appointment.status
            )}`}
          >
            {appointment.status}
          </span>

          {appointment.status === "PENDING" && (
            <button
              onClick={() => onCancel(appointment.id)}
              disabled={isCancelling}
              className="px-4 py-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCancelling ? "Cancelling..." : "Cancel"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};