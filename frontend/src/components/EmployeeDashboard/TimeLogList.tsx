import React from 'react';

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
    <h3 className="text-lg font-semibold text-white mb-4">Logged Time Entries</h3>
    {timeLogs.length > 0 ? (
      <div className="space-y-3 max-h-[300px] overflow-y-auto">
        {timeLogs.map(log => (
          <div
            key={log.id}
            className="flex justify-between items-start p-3 bg-zinc-800 rounded-lg border border-zinc-700"
          >
            <div>
              <p className="text-sm font-medium text-white">
                {formatDateTime(log.startTime)} → {formatDateTime(log.endTime)}
              </p>
              {log.notes && <p className="text-xs text-gray-400 mt-1">{log.notes}</p>}
            </div>
            <p className="text-sm font-semibold text-orange-500">{log.hoursLogged.toFixed(2)}h</p>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-gray-400 text-sm">No time logs recorded yet.</p>
    )}
  </div>
);

export default TimeLogList;
