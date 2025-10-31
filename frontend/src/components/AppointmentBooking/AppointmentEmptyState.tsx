// src/components/AppointmentBooking/AppointmentEmptyState.tsx
import React from "react";
import { Calendar, Plus } from "lucide-react";

const AppointmentEmptyState: React.FC<{ onBookClick: () => void }> = ({
  onBookClick,
}) => {
  return (
    <div className="text-center py-20">
      <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-lg p-12 max-w-2xl mx-auto">
        <Calendar className="w-20 h-20 text-orange-500 mx-auto mb-6" />
        <h3 className="text-3xl font-bold text-white mb-4">
          No Appointments Yet
        </h3>
        <p className="text-gray-400 mb-8">
          Start by booking your first service or modification appointment for
          your vehicle
        </p>
        <button
          onClick={onBookClick}
          className="inline-flex items-center space-x-2 px-8 py-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/30 transition-all duration-300"
        >
          <Plus className="w-5 h-5" />
          <span className="font-semibold">Book Your First Appointment</span>
        </button>
      </div>
    </div>
  );
};

export default AppointmentEmptyState;
