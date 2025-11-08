import React from "react";

interface TimeLogFormProps {
  timeLogForm: {
    date: string;
    startTime: string;
    endTime: string;
    description: string;
  };
  timeLogErrors: {
    date?: string;
    startTime?: string;
    endTime?: string;
    description?: string;
  };
  setTimeLogForm: (
    form:
      | {
          date: string;
          startTime: string;
          endTime: string;
          description: string;
        }
      | ((prev: {
          date: string;
          startTime: string;
          endTime: string;
          description: string;
        }) => {
          date: string;
          startTime: string;
          endTime: string;
          description: string;
        })
  ) => void;
  setTimeLogErrors: (errors: {
    date?: string;
    startTime?: string;
    endTime?: string;
    description?: string;
  }) => void;
  calculateDuration: () => string;
  submitTimeLog: () => void;
  loading: boolean;
  setShowTimeLog: (show: boolean) => void;
  timeLogTouched: boolean;
}

const TimeLogForm: React.FC<TimeLogFormProps> = ({
  timeLogForm,
  timeLogErrors,
  setTimeLogForm,
  setTimeLogErrors,
  calculateDuration,
  submitTimeLog,
  loading,
  setShowTimeLog,
  timeLogTouched,
}) => (
  <div className="bg-zinc-900/50 rounded-lg shadow-md p-4 border border-zinc-800">
    <h3 className="text-base font-semibold text-white mb-3">Log Work Time</h3>
    <div className="grid grid-cols-2 gap-3 mb-3">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          Date
        </label>
        <input
          type="date"
          name="date"
          value={timeLogForm.date}
          onChange={(e) =>
            setTimeLogForm((prev) => ({ ...prev, date: e.target.value }))
          }
          className="w-full px-3 py-2 border border-zinc-700 rounded-lg bg-black text-white text-sm"
        />
        {timeLogTouched && timeLogErrors.date && (
          <p className="text-red-500 text-xs mt-1">{timeLogErrors.date}</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          Duration (hrs)
        </label>
        <input
          type="text"
          value={calculateDuration()}
          readOnly
          className="w-full px-3 py-2 border border-zinc-700 rounded-lg bg-zinc-800 text-gray-400 text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          Start Time
        </label>
        <input
          type="time"
          name="startTime"
          value={timeLogForm.startTime}
          onChange={(e) =>
            setTimeLogForm((prev) => ({
              ...prev,
              startTime: e.target.value,
            }))
          }
          className="w-full px-3 py-2 border border-zinc-700 rounded-lg bg-black text-white text-sm"
        />
        {timeLogTouched && timeLogErrors.startTime && (
          <p className="text-red-500 text-xs mt-1">{timeLogErrors.startTime}</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          End Time
        </label>
        <input
          type="time"
          name="endTime"
          value={timeLogForm.endTime}
          onChange={(e) =>
            setTimeLogForm((prev) => ({
              ...prev,
              endTime: e.target.value,
            }))
          }
          className="w-full px-3 py-2 border border-zinc-700 rounded-lg bg-black text-white text-sm"
        />
        {timeLogTouched && timeLogErrors.endTime && (
          <p className="text-red-500 text-xs mt-1">{timeLogErrors.endTime}</p>
        )}
      </div>
    </div>
    <div className="mb-3">
      <label className="block text-sm font-medium text-gray-300 mb-1.5">
        Work Description
      </label>
      <textarea
        name="description"
        value={timeLogForm.description}
        onChange={(e) =>
          setTimeLogForm((prev) => ({
            ...prev,
            description: e.target.value,
          }))
        }
        rows={2}
        placeholder="Describe the work done..."
        className="w-full px-3 py-2 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-black text-white text-sm"
      />
      {timeLogTouched && timeLogErrors.description && (
        <p className="text-red-500 text-xs mt-1">{timeLogErrors.description}</p>
      )}
    </div>
    <div className="flex justify-center gap-2">
      <button
        onClick={() => {
          setShowTimeLog(false);
          setTimeLogForm({
            date: new Date().toISOString().split("T")[0],
            startTime: "",
            endTime: "",
            description: "",
          });
          setTimeLogErrors({});
        }}
        className="px-4 py-2 bg-zinc-700 text-white rounded-lg text-sm font-semibold hover:bg-zinc-600 transition"
        disabled={loading}
      >
        Cancel
      </button>
      <button
        onClick={submitTimeLog}
        disabled={loading}
        className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-orange-600 transition disabled:opacity-50"
      >
        {loading ? "Logging..." : "Submit Time Log"}
      </button>
    </div>
  </div>
);

export default TimeLogForm;
