import type { AppointmentSummary } from "@/types/appointment";
import { AppointmentCard } from "../AppointmentBooking/AppointmentCard";
import { Calendar } from "lucide-react";

interface Props {
  appointments: AppointmentSummary[];
  selectedDate: Date | null;
  onClearFilter: () => void;
  onCancel: (id: string) => void;
  cancellingId: string | null;
  getStatusColor: (status: string) => string;
}

export const AppointmentsList = ({
  appointments,
  selectedDate,
  onClearFilter,
  onCancel,
  cancellingId,
  getStatusColor,
}: Props) => {
  const filtered = selectedDate
    ? appointments.filter((a) => {
        const d = new Date(a.date);
        return (
          d.getFullYear() === selectedDate.getFullYear() &&
          d.getMonth() === selectedDate.getMonth() &&
          d.getDate() === selectedDate.getDate()
        );
      })
    : appointments;

  const formatDate = (d: Date) =>
    d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  if (filtered.length === 0) {
    return (
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-12 text-center">
        <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 className="text-white text-lg font-semibold mb-2">
          No appointments found
        </h3>
        <p className="text-gray-400">
          {selectedDate
            ? "No appointments scheduled for this date."
            : "You haven't booked any appointments yet."}
        </p>
        {selectedDate && (
          <button
            onClick={onClearFilter}
            className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all"
          >
            View All Appointments
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {selectedDate && (
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-2.5 sm:p-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
            <div className="flex items-start sm:items-center gap-2 sm:gap-3">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 flex-shrink-0 mt-0.5 sm:mt-0" />
              <div>
                <p className="text-white font-semibold text-sm sm:text-base">
                  Showing appointments for {formatDate(selectedDate)}
                </p>
                <p className="text-orange-300 text-xs sm:text-sm">
                  {filtered.length} appointment(s) found
                </p>
              </div>
            </div>
            <button
              onClick={onClearFilter}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-orange-500/20 text-orange-300 rounded-lg hover:bg-orange-500/30 transition-all text-xs sm:text-sm font-medium w-full sm:w-auto"
            >
              Clear Filter
            </button>
          </div>
        </div>
      )}

      {filtered.map((apt) => (
        <AppointmentCard
          key={apt.id}
          appointment={apt}
          isCancelling={cancellingId === apt.id}
          onCancel={onCancel}
          getStatusColor={getStatusColor}
        />
      ))}
    </div>
  );
};
