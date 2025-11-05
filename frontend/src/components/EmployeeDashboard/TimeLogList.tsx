import React from 'react';
import { Timer, FileText } from 'lucide-react';

interface TimeLog {
  id: number;
  startTime: string;
  endTime: string;
  hoursLogged: number;
  notes: string;
}

interface TimeLogListProps {
  timeLogs: TimeLog[];
  formatDateTime: (dateTime: string) => string;
}

const TimeLogList: React.FC<TimeLogListProps> = ({ timeLogs, formatDateTime }) => (
  <div className="bg-zinc-900/50 rounded-lg shadow-md p-6 border border-zinc-800">
    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
      <Timer className="w-5 h-5 text-orange-500" />
      Logged Time Entries
    </h3>
    {timeLogs.length > 0 ? (
  <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pb-6">
        {timeLogs.map(log => (
          <div
            key={log.id}
            className="flex flex-col gap-2 p-4 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-xl border border-zinc-700 shadow-sm hover:shadow-lg transition-shadow duration-200"
          >
            <div className="flex items-center gap-2 mb-1">
              <Timer className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-semibold text-white">
                {formatDateTime(log.startTime)}
              </span>
              <span className="text-xs text-gray-400">to</span>
              <span className="text-sm font-semibold text-white">
                {formatDateTime(log.endTime)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-orange-500 bg-orange-500/10 px-2 py-1 rounded-full">
                {log.hoursLogged.toFixed(2)} hours
              </span>
              {log.notes && (
                <span className="flex items-center gap-1 text-xs text-gray-400 bg-zinc-700 px-2 py-1 rounded-full">
                  <FileText className="w-3 h-3 text-gray-400" />
                  {log.notes}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-gray-400 text-sm">No time logs recorded yet.</p>
    )}
  </div>
);

export default TimeLogList;
