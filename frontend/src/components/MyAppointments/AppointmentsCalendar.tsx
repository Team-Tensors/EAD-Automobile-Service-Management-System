import { CalendarHeader } from "../AppointmentBooking/CalendarHeader";
import { CalendarGrid } from "../AppointmentBooking/CalendarGrid";
import { CalendarLegend } from "../AppointmentBooking/CalendarLegend";

interface Props {
  month: Date;
  selectedDate: Date | null;
  appointments: { date: string }[];
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSelectDate: (d: Date) => void;
}

export const AppointmentsCalendar = ({
  month,
  selectedDate,
  appointments,
  onPrevMonth,
  onNextMonth,
  onSelectDate,
}: Props) => (
  <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3 sm:p-4">
    <CalendarHeader month={month} onPrev={onPrevMonth} onNext={onNextMonth} />

    {/* Day names */}
    <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
        <div
          key={d}
          className="text-center text-[10px] sm:text-xs text-gray-500 font-semibold"
        >
          {d}
        </div>
      ))}
    </div>

    <CalendarGrid
      month={month}
      selectedDate={selectedDate}
      appointments={appointments}
      onSelectDate={onSelectDate}
    />

    <CalendarLegend />
  </div>
);
