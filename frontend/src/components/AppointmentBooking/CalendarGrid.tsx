import { useMemo } from "react";

interface Props {
  month: Date;
  selectedDate: Date | null;
  appointments: { date: string }[];
  onSelectDate: (d: Date) => void;
}

export const CalendarGrid = ({
  month,
  selectedDate,
  appointments,
  onSelectDate,
}: Props) => {
  const { daysInMonth, startingDayOfWeek } = useMemo(() => {
    const year = month.getFullYear();
    const monthIdx = month.getMonth();
    const first = new Date(year, monthIdx, 1);
    const last = new Date(year, monthIdx + 1, 0);
    return {
      daysInMonth: last.getDate(),
      startingDayOfWeek: first.getDay(),
    };
  }, [month]);

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const hasAppointment = (day: number) => {
    const d = new Date(month.getFullYear(), month.getMonth(), day);
    return appointments.some((apt) => isSameDay(new Date(apt.date), d));
  };

  const appointmentCount = (day: number) => {
    const d = new Date(month.getFullYear(), month.getMonth(), day);
    return appointments.filter((apt) => isSameDay(new Date(apt.date), d))
      .length;
  };

  const cells: React.JSX.Element[] = [];

  // empty cells before month start
  for (let i = 0; i < startingDayOfWeek; i++) {
    cells.push(<div key={`empty-${i}`} className="h-10" />);
  }

  // days of month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(month.getFullYear(), month.getMonth(), day);
    const today = new Date();
    const isToday = isSameDay(date, today);
    const has = hasAppointment(day);
    const count = appointmentCount(day);
    const selected = selectedDate && isSameDay(date, selectedDate);

    cells.push(
      <div
        key={day}
        onClick={() => onSelectDate(date)}
        className={`h-10 flex items-center justify-center rounded-lg cursor-pointer transition-all relative ${
          selected
            ? "bg-orange-500 text-white font-bold"
            : isToday
            ? "bg-orange-500/20 text-orange-400 font-semibold border border-orange-500/50"
            : has
            ? "bg-zinc-800 text-white hover:bg-zinc-700"
            : "text-gray-400 hover:bg-zinc-800/50"
        }`}
      >
        <span className="text-sm">{day}</span>
        {has && !selected && (
          <div className="absolute bottom-1 flex gap-0.5">
            {[...Array(Math.min(count, 3))].map((_, i) => (
              <div key={i} className="w-1 h-1 rounded-full bg-orange-500" />
            ))}
          </div>
        )}
      </div>
    );
  }

  return <div className="grid grid-cols-7 gap-2">{cells}</div>;
};
