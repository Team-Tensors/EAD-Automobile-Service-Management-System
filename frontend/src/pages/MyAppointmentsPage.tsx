// src/pages/MyAppointmentsPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Calendar, Clock, Car, Wrench, Package } from "lucide-react";
import AuthenticatedNavbar from "@/components/Navbar/AuthenticatedNavbar";
import Footer from "@/components/Footer/Footer";

interface Appointment {
  id: number;
  vehicleBrand: string;
  vehicleModel: string;
  vehicleLicensePlate: string;
  appointmentType: "SERVICE" | "MODIFICATION";
  serviceName: string;
  appointmentDate: string;
  appointmentTime: string;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  description?: string;
  estimatedDuration: string;
  price: number;
}

const MyAppointmentsPage = () => {
  const navigate = useNavigate();

  // Sample data - replace with API call later
  const [appointments] = useState<Appointment[]>([
    {
      id: 1,
      vehicleBrand: "Toyota",
      vehicleModel: "Camry",
      vehicleLicensePlate: "ABC-1234",
      appointmentType: "SERVICE",
      serviceName: "Oil Change",
      appointmentDate: "2025-10-30",
      appointmentTime: "10:00",
      status: "CONFIRMED",
      description: "Regular maintenance oil change",
      estimatedDuration: "30 mins",
      price: 50,
    },
    {
      id: 2,
      vehicleBrand: "Honda",
      vehicleModel: "Civic",
      vehicleLicensePlate: "XYZ-5678",
      appointmentType: "MODIFICATION",
      serviceName: "Window Tinting",
      appointmentDate: "2025-11-05",
      appointmentTime: "14:00",
      status: "PENDING",
      description: "Full vehicle window tinting",
      estimatedDuration: "2 hours",
      price: 200,
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "CONFIRMED":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "COMPLETED":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "CANCELLED":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-black flex flex-col pt-12">
      <AuthenticatedNavbar />

      {/* Header Section */}
      <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 border-b border-zinc-700">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-white">My Appointments</h1>
          <p className="text-gray-400 mt-2">
            View and manage your service appointments
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Add Appointment Button */}
          <div className="mb-8">
            <button
              onClick={() => navigate("/my-appointments/appointment-booking")}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/30 transition-all duration-300"
            >
              <Plus className="w-5 h-5" />
              <span>Book New Appointment</span>
            </button>
          </div>

          {/* Appointments List */}
          {appointments.length === 0 ? (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-12 text-center">
              <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                No Appointments Yet
              </h3>
              <p className="text-gray-400 mb-6">
                You haven't booked any appointments yet.
              </p>
              <button
                onClick={() => navigate("/appointment-booking")}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-all"
              >
                <Plus className="w-5 h-5" />
                <span>Book Your First Appointment</span>
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 hover:border-zinc-700 transition-all"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Left Section */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-orange-500/10 rounded-lg">
                          {appointment.appointmentType === "SERVICE" ? (
                            <Wrench className="w-5 h-5 text-orange-500" />
                          ) : (
                            <Package className="w-5 h-5 text-orange-500" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-white">
                            {appointment.serviceName}
                          </h3>
                          <span className="text-sm text-gray-400">
                            {appointment.appointmentType}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2 text-gray-300">
                        <div className="flex items-center gap-2">
                          <Car className="w-4 h-4 text-gray-500" />
                          <span>
                            {appointment.vehicleBrand}{" "}
                            {appointment.vehicleModel} (
                            {appointment.vehicleLicensePlate})
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span>{formatDate(appointment.appointmentDate)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span>
                            {appointment.appointmentTime} •{" "}
                            {appointment.estimatedDuration}
                          </span>
                        </div>
                      </div>

                      {appointment.description && (
                        <p className="text-gray-400 mt-3 text-sm">
                          {appointment.description}
                        </p>
                      )}
                    </div>

                    {/* Right Section */}
                    <div className="flex flex-col items-end gap-3">
                      <span
                        className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(
                          appointment.status
                        )}`}
                      >
                        {appointment.status}
                      </span>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-white">
                          ${appointment.price}
                        </p>
                        <p className="text-sm text-gray-400">Total Cost</p>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <button className="px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-all text-sm">
                          View Details
                        </button>
                        {appointment.status === "PENDING" && (
                          <button className="px-4 py-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-all text-sm">
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default MyAppointmentsPage;
