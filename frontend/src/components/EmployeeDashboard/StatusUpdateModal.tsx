import React from "react";

interface StatusUpdateModalProps {
  error?: string | null;
  newStatus: string;
  setNewStatus: (status: string) => void;
  completionDescription: string;
  setCompletionDescription: (desc: string) => void;
  updateAppointmentStatus: () => void;
  loading: boolean;
  setShowStatusUpdate: (show: boolean) => void;
  getDisplayStatus: (status: string) => string;
  statusTouched: boolean;
}

const StatusUpdateModal: React.FC<StatusUpdateModalProps> = ({
  newStatus,
  setNewStatus,
  completionDescription,
  setCompletionDescription,
  updateAppointmentStatus,
  loading,
  setShowStatusUpdate,
  getDisplayStatus,
  statusTouched,
  error,
}) => (
  <div className="bg-zinc-900/50 rounded-lg shadow-md p-4 border border-zinc-800">
    <h3 className="text-base font-semibold text-white mb-3">
      Update Service Status
    </h3>
    <div className="grid grid-cols-3 gap-3 mb-3">
      {["CONFIRMED", "IN_PROGRESS", "COMPLETED"].map((status) => {
        const isSelected = newStatus === status;
        const statusColors: Record<string, string> = {
          CONFIRMED: isSelected
            ? "bg-red-500/10 text-red-500 border-red-500/20"
            : "bg-zinc-800 text-gray-300 border-zinc-700 hover:bg-zinc-700/50",
          IN_PROGRESS: isSelected
            ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
            : "bg-zinc-800 text-gray-300 border-zinc-700 hover:bg-zinc-700/50",
          COMPLETED: isSelected
            ? "bg-green-500/10 text-green-500 border-green-500/20"
            : "bg-zinc-800 text-gray-300 border-zinc-700 hover:bg-zinc-700/50",
        };
        return (
          <button
            key={status}
            onClick={() => setNewStatus(status)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition border ${statusColors[status]}`}
          >
            {getDisplayStatus(status)}
          </button>
        );
      })}
    </div>
    {newStatus === "COMPLETED" && (
      <div className="mb-3">
        <label className="block text-sm font-medium text-white mb-2">
          Completion Description
        </label>
        <textarea
          value={completionDescription}
          onChange={(e) => setCompletionDescription(e.target.value)}
          className="w-full px-3 py-2 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-black text-white text-sm"
          rows={2}
          placeholder="Enter completion remarks..."
        />
        {statusTouched && !completionDescription.trim() && (
          <p className="text-red-500 text-xs mt-1">
            Completion description is required.
          </p>
        )}
      </div>
    )}
    {error && (
      <div className="mb-2 text-center">
        <p className="text-red-500 text-sm font-semibold">{error}</p>
      </div>
    )}
    <div className="flex justify-center gap-2">
      <button
        onClick={() => setShowStatusUpdate(false)}
        className="px-4 py-2 bg-zinc-700 text-white rounded-lg text-sm font-semibold hover:bg-zinc-600 transition"
        disabled={loading}
      >
        Cancel
      </button>
      <button
        onClick={updateAppointmentStatus}
        disabled={
          !newStatus ||
          (newStatus === "COMPLETED" && !completionDescription.trim()) ||
          loading
        }
        className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-orange-600 transition disabled:opacity-50"
      >
        {loading ? "Updating..." : "Save Status"}
      </button>
    </div>
  </div>
);

export default StatusUpdateModal;
