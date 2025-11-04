// src/pages/MyAppointmentsPage.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Calendar, Clock, Car, Wrench, Package } from "lucide-react";
import toast from "react-hot-toast";
import AuthenticatedNavbar from "@/components/Navbar/AuthenticatedNavbar";
import Footer from "@/components/Footer/Footer";
import AppointmentEmptyState from "@/components/AppointmentBooking/AppointmentEmptyState";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { AppointmentTypeValues } from "@/types/appointment";
import {
  appointmentService,
  type AppointmentSummary,
} from "@/services/appointmentService";

const MyAppointmentsPage = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<AppointmentSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState<string | null>(null);

  // Fetch appointments on component mount
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setIsLoading(true);
        const data = await appointmentService.getMyAppointments();
        setAppointments(data);
      } catch (error) {
        console.error("Failed to fetch appointments:", error);
        toast.error("Failed to load appointments");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const handleCancelClick = (appointmentId: string) => {
    setAppointmentToCancel(appointmentId);
    setShowCancelDialog(true);
  };

  const handleCancelAppointment = async () => {
    if (!appointmentToCancel) return;

    setCancellingId(appointmentToCancel);

    const cancelPromise = appointmentService
      .cancelAppointment(appointmentToCancel)
      .then(() => {
        // Update the appointment status to CANCELLED in the list
        setAppointments((prev) =>
          prev.map((apt) =>
            apt.id === appointmentToCancel ? { ...apt, status: "CANCELLED" } : apt
          )
        );
        setCancellingId(null);
        setAppointmentToCancel(null);
      })
      .catch((error) => {
        setCancellingId(null);
        throw error;
      });

    toast.promise(cancelPromise, {
      loading: "Cancelling appointment...",
      success: "Appointment cancelled successfully!",
      error: (err) => {
        const errorMessage =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to cancel appointment";
        return errorMessage;
      },
    });
  };

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
      <div className="bg-linear-to-r from-zinc-900 to-zinc-800 border-b border-zinc-700">
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
          {/* Loading State */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <Calendar className="w-16 h-16 text-orange-500 animate-bounce" />
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse delay-75"></div>
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse delay-150"></div>
                  </div>
                </div>
                <p className="text-zinc-400 text-sm">Loading appointments...</p>
              </div>
            </div>
          ) : appointments.length === 0 ? (
            <AppointmentEmptyState
              onBookClick={() =>
                navigate("/my-appointments/appointment-booking")
              }
            />
          ) : (
            <>
              {/* Add Appointment Button */}
              <div className="mb-8">
                <button
                  onClick={() =>
                    navigate("/my-appointments/appointment-booking")
                  }
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/30 transition-all duration-300"
                >
                  <Plus className="w-5 h-5" />
                  <span>Book New Appointment</span>
                </button>
              </div>

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
                            {appointment.type ===
                            AppointmentTypeValues.SERVICE ? (
                              <Wrench className="w-5 h-5 text-orange-500" />
                            ) : (
                              <Package className="w-5 h-5 text-orange-500" />
                            )}
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold text-white">
                              {appointment.service}
                            </h3>
                            <span className="text-sm text-gray-400">
                              {appointment.type}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2 text-gray-300">
                          <div className="flex items-center gap-2">
                            <Car className="w-4 h-4 text-gray-500" />
                            <span>{appointment.vehicle}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span>{formatDate(appointment.date)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span>
                              {new Date(appointment.date).toLocaleTimeString(
                                "en-US",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </span>
                          </div>
                        </div>
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
                        {appointment.status === "PENDING" && (
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => handleCancelClick(appointment.id)}
                              disabled={cancellingId === appointment.id}
                              className="px-4 py-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {cancellingId === appointment.id
                                ? "Cancelling..."
                                : "Cancel"}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <Footer />

      {/* Cancellation Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showCancelDialog}
        onClose={() => {
          setShowCancelDialog(false);
          setAppointmentToCancel(null);
        }}
        onConfirm={handleCancelAppointment}
        title="Cancel Appointment?"
        message="Are you sure you want to cancel this appointment? This action cannot be undone."
        confirmText="Yes, Cancel"
        cancelText="No, Keep It"
        isDestructive={true}
      />
    </div>
  );
};

export default MyAppointmentsPage;
