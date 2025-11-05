import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  month: Date;
  onPrev: () => void;
  onNext: () => void;
}

export const CalendarHeader = ({ month, onPrev, onNext }: Props) => {
  const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
  ];

  return (
    <div className="flex items-center justify-between mb-4">
      <button
        onClick={onPrev}
        className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
      >
        <ChevronLeft className="w-5 h-5 text-gray-400" />
      </button>
      <h3 className="text-white font-semibold">
        {monthNames[month.getMonth()]} {month.getFullYear()}
      </h3>
      <button
        onClick={onNext}
        className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
      >
        <ChevronRight className="w-5 h-5 text-gray-400" />
      </button>
    </div>
  );
};