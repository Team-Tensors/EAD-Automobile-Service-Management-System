// src/pages/MyAppointmentsPage.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Calendar, Clock, Car, Wrench, Package, ChevronLeft, ChevronRight } from "lucide-react";
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
  
  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

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

  // Calendar helper functions
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek };
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const hasAppointmentOnDate = (date: Date) => {
    return appointments.some((apt) => {
      const aptDate = new Date(apt.date);
      return isSameDay(aptDate, date);
    });
  };

  const getAppointmentCountOnDate = (date: Date) => {
    return appointments.filter((apt) => {
      const aptDate = new Date(apt.date);
      return isSameDay(aptDate, date);
    }).length;
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);
    const days = [];
    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-10"></div>);
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const isToday = isSameDay(date, new Date());
      const hasAppointment = hasAppointmentOnDate(date);
      const appointmentCount = getAppointmentCountOnDate(date);
      const isSelected = selectedDate && isSameDay(date, selectedDate);

      days.push(
        <div
          key={day}
          onClick={() => setSelectedDate(date)}
          className={`h-10 flex items-center justify-center rounded-lg cursor-pointer transition-all relative ${
            isSelected
              ? "bg-orange-500 text-white font-bold"
              : isToday
              ? "bg-orange-500/20 text-orange-400 font-semibold border border-orange-500/50"
              : hasAppointment
              ? "bg-zinc-800 text-white hover:bg-zinc-700"
              : "text-gray-400 hover:bg-zinc-800/50"
          }`}
        >
          <span className="text-sm">{day}</span>
          {hasAppointment && !isSelected && (
            <div className="absolute bottom-1 flex gap-0.5">
              {[...Array(Math.min(appointmentCount, 3))].map((_, i) => (
                <div
                  key={i}
                  className="w-1 h-1 rounded-full bg-orange-500"
                ></div>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={previousMonth}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-400" />
          </button>
          <h3 className="text-white font-semibold">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h3>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Day Names */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-center text-xs text-gray-500 font-semibold">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-2">{days}</div>

        {/* Legend */}
        <div className="mt-4 pt-4 border-t border-zinc-800 space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-orange-500"></div>
            <span className="text-gray-400">Selected Date</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-orange-500/20 border border-orange-500/50"></div>
            <span className="text-gray-400">Today</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-zinc-800 flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-orange-500"></div>
            </div>
            <span className="text-gray-400">Has Appointments</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black flex flex-col pt-5">
      <AuthenticatedNavbar />

      {/* Header Section */}
      <div className="bg-black border-b border-zinc-700">
        <div className="max-w-7xl mx-auto px-0 pt-22 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white uppercase">My Appointments</h1>
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

      {/* Main Content */}
      <div className="flex-1 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Loading State */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <Calendar className="w-12 h-12 mb-2 text-orange-500 animate-bounce" />
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
              {/* Two Column Layout: Appointments List + Calendar */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Appointments List - Takes 2 columns */}
                <div className="lg:col-span-2 space-y-6">
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

                {/* Calendar - Takes 1 column */}
                <div className="lg:col-span-1">
                  <div className="sticky top-20">
                    <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-orange-500" />
                      Appointment Calendar
                    </h2>
                    {renderCalendar()}
                    
                    {/* Show appointments for selected date */}
                    {selectedDate && (
                      <div className="mt-4 bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
                        <h3 className="text-white font-semibold mb-3">
                          Appointments on {formatDate(selectedDate.toISOString())}
                        </h3>
                        {appointments.filter((apt) => {
                          const aptDate = new Date(apt.date);
                          return selectedDate && isSameDay(aptDate, selectedDate);
                        }).length === 0 ? (
                          <p className="text-gray-400 text-sm">No appointments on this date</p>
                        ) : (
                          <div className="space-y-2">
                            {appointments
                              .filter((apt) => {
                                const aptDate = new Date(apt.date);
                                return selectedDate && isSameDay(aptDate, selectedDate);
                              })
                              .map((apt) => (
                                <div
                                  key={apt.id}
                                  className="bg-zinc-800/50 rounded p-3 border border-zinc-700"
                                >
                                  <div className="flex items-start gap-2">
                                    {apt.type === AppointmentTypeValues.SERVICE ? (
                                      <Wrench className="w-4 h-4 text-orange-500 mt-0.5" />
                                    ) : (
                                      <Package className="w-4 h-4 text-orange-500 mt-0.5" />
                                    )}
                                    <div className="flex-1">
                                      <p className="text-white text-sm font-medium">{apt.service}</p>
                                      <p className="text-gray-400 text-xs">{apt.vehicle}</p>
                                      <div className="flex items-center gap-1 mt-1">
                                        <Clock className="w-3 h-3 text-gray-500" />
                                        <span className="text-gray-400 text-xs">
                                          {new Date(apt.date).toLocaleTimeString("en-US", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          })}
                                        </span>
                                      </div>
                                    </div>
                                    <span
                                      className={`text-xs px-2 py-1 rounded ${
                                        apt.status === "PENDING"
                                          ? "bg-yellow-500/10 text-yellow-500"
                                          : apt.status === "CONFIRMED"
                                          ? "bg-green-500/10 text-green-500"
                                          : apt.status === "COMPLETED"
                                          ? "bg-blue-500/10 text-blue-500"
                                          : "bg-red-500/10 text-red-500"
                                      }`}
                                    >
                                      {apt.status}
                                    </span>
                                  </div>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
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
