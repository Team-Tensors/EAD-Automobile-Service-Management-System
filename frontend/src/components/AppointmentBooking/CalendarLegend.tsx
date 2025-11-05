export const CalendarLegend = () => (
  <div className="mt-4 pt-4 border-t border-zinc-800 space-y-2 text-xs">
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 rounded bg-orange-500" />
      <span className="text-gray-400">Selected Date</span>
    </div>
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 rounded bg-orange-500/20 border border-orange-500/50" />
      <span className="text-gray-400">Today</span>
    </div>
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 rounded bg-zinc-800 flex items-center justify-center">
        <div className="w-1 h-1 rounded-full bg-orange-500" />
      </div>
      <span className="text-gray-400">Has Appointments</span>
    </div>
  </div>
);