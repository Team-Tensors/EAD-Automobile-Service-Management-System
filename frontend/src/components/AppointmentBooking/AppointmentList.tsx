import type { AppointmentSummary } from "@/types/appointment";
import { AppointmentCard } from "./AppointmentCard";
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
        const aptDate = new Date(a.date);
        return (
          aptDate.getFullYear() === selectedDate.getFullYear() &&
          aptDate.getMonth() === selectedDate.getMonth() &&
          aptDate.getDate() === selectedDate.getDate()
        );
      })
    : appointments;

  const formatDate = (d: Date) =>
    d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

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
    <div className="space-y-6">
      {/* Selected-date banner */}
      {selectedDate && (
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-white font-semibold">
                  Showing appointments for {formatDate(selectedDate)}
                </p>
                <p className="text-orange-300 text-sm">
                  {filtered.length} appointment(s) found
                </p>
              </div>
            </div>
            <button
              onClick={onClearFilter}
              className="px-4 py-2 bg-orange-500/20 text-orange-300 rounded-lg hover:bg-orange-500/30 transition-all text-sm font-medium"
            >
              Clear Filter
            </button>
          </div>
        </div>
      )}

      {/* Cards */}
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