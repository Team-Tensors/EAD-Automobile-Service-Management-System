import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const AppointmentsHeader = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-black border-b border-zinc-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-22 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white uppercase">
              My Appointments
            </h1>
            <p className="text-gray-400 mt-1 sm:mt-2 text-sm sm:text-base">
              View and manage your service appointments
            </p>
          </div>

          <button
            onClick={() => navigate("/my-appointments/appointment-booking")}
            className="inline-flex items-center justify-center space-x-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/30 transition-all duration-300 w-full sm:w-auto text-sm sm:text-base"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Book Appointment</span>
          </button>
        </div>
      </div>
    </div>
  );
};
