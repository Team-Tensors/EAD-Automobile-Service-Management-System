import React from 'react';

interface StatusUpdateModalProps {
  newStatus: string;
  setNewStatus: (status: string) => void;
  completionDescription: string;
  setCompletionDescription: (desc: string) => void;
  updateAppointmentStatus: () => void;
  loading: boolean;
  setShowStatusUpdate: (show: boolean) => void;
  getDisplayStatus: (status: string) => string;
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
}) => (
  <div className="bg-zinc-900/50 rounded-lg shadow-md p-6 border border-zinc-800">
    <h3 className="text-lg font-semibold text-white mb-4">Update Service Status</h3>
    <div className="grid grid-cols-3 gap-4 mb-4">
      {['CONFIRMED', 'IN_PROGRESS', 'COMPLETED'].map(status => {
        const isSelected = newStatus === status;
        const statusColors: Record<string, string> = {
          CONFIRMED: isSelected
            ? 'bg-red-500/10 text-red-500 border-red-500/20'
            : 'bg-zinc-800 text-gray-300 border-zinc-700 hover:bg-zinc-700/50',
          IN_PROGRESS: isSelected
            ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
            : 'bg-zinc-800 text-gray-300 border-zinc-700 hover:bg-zinc-700/50',
          COMPLETED: isSelected
            ? 'bg-green-500/10 text-green-500 border-green-500/20'
            : 'bg-zinc-800 text-gray-300 border-zinc-700 hover:bg-zinc-700/50',
        };
        return (
          <button
            key={status}
            onClick={() => setNewStatus(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition border ${statusColors[status]}`}
          >
            {getDisplayStatus(status)}
          </button>
        );
      })}
    </div>
    {newStatus === 'COMPLETED' && (
      <div className="mb-4">
        <label className="block text-sm font-medium text-white mb-2">Completion Description</label>
        <textarea
          value={completionDescription}
          onChange={e => setCompletionDescription(e.target.value)}
          className="w-full px-3 py-2 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-black text-white"
          rows={3}
          placeholder="Enter completion remarks..."
        />
        {!completionDescription.trim() && (
          <p className="text-red-500 text-xs mt-1">Completion description is required.</p>
        )}
      </div>
    )}
    <div className="flex justify-center gap-2">
      <button
        onClick={() => setShowStatusUpdate(false)}
        className="px-6 py-2 bg-zinc-700 text-white rounded-lg font-semibold hover:bg-zinc-600 transition"
        disabled={loading}
      >
        Cancel
      </button>
      <button
        onClick={updateAppointmentStatus}
        disabled={!newStatus || (newStatus === 'COMPLETED' && !completionDescription.trim()) || loading}
        className="px-6 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition disabled:opacity-50"
      >
        {loading ? 'Updating...' : 'Save Status'}
      </button>
    </div>
  </div>
);

export default StatusUpdateModal;
