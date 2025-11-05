import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const AppointmentsHeader = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-black border-b border-zinc-700">
      <div className="max-w-7xl mx-auto px-0 pt-22 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white uppercase">
              My Appointments
            </h1>
            <p className="text-gray-400 mt-2">
              View and manage your service appointments
            </p>
          </div>

          <button
            onClick={() => navigate("/my-appointments/appointment-booking")}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/30 transition-all duration-300"
          >
            <Plus className="w-5 h-5" />
            <span>Book Appointment</span>
          </button>
        </div>
      </div>
    </div>
  );
};