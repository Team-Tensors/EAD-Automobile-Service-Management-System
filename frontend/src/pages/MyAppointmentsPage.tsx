import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Calendar } from "lucide-react";

import AuthenticatedNavbar from "@/components/Navbar/AuthenticatedNavbar";
import Footer from "@/components/Footer/Footer";
import AppointmentEmptyState from "@/components/AppointmentBooking/AppointmentEmptyState";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

import {
  appointmentService,
  type AppointmentSummary,
} from "@/services/appointmentService";

import { AppointmentsHeader } from "@/components/MyAppointments/AppointmentsHeader";
import { AppointmentsLoadingState } from "@/components/MyAppointments/AppointmentsLoadingState";
import { AppointmentsList } from "@/components/MyAppointments/AppointmentsList";
import { AppointmentsCalendar } from "@/components/MyAppointments/AppointmentsCalendar";

const MyAppointmentsPage = () => {
  const navigate = useNavigate();

  // ----- data -----
  const [appointments, setAppointments] = useState<AppointmentSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ----- cancel flow -----
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState<string | null>(
    null
  );

  // ----- calendar -----
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // ----- fetch -----
  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const data = await appointmentService.getMyAppointments();
        setAppointments(data);
      } catch (e) {
        console.error(e);
        toast.error("Failed to load appointments");
      } finally {
        setIsLoading(false);
      }
    };
    load();

    // Poll for updates every 30 seconds
    const intervalId = setInterval(async () => {
      try {
        const data = await appointmentService.getMyAppointments();
        setAppointments(data);
      } catch (e) {
        console.error("Failed to refresh appointments:", e);
      }
    }, 30000); // 30 seconds

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, []);

  // ----- cancel -----
  const openCancelDialog = (id: string) => {
    setAppointmentToCancel(id);
    setShowCancelDialog(true);
  };

  const confirmCancel = async () => {
    if (!appointmentToCancel) return;
    setCancellingId(appointmentToCancel);

    const promise = appointmentService
      .cancelAppointment(appointmentToCancel)
      .then(() => {
        setAppointments((prev) =>
          prev.map((a) =>
            a.id === appointmentToCancel ? { ...a, status: "CANCELLED" } : a
          )
        );
      })
      .finally(() => {
        setCancellingId(null);
        setAppointmentToCancel(null);
        setShowCancelDialog(false);
      });

    toast.promise(promise, {
      loading: "Cancelling appointment...",
      success: "Appointment cancelled successfully!",
      error: (err) =>
        err?.response?.data?.message ?? err?.message ?? "Failed to cancel",
    });
  };

  // ----- helpers -----
  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      PENDING: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      CONFIRMED: "bg-green-500/10 text-green-500 border-green-500/20",
      COMPLETED: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      CANCELLED: "bg-red-500/10 text-red-500 border-red-500/20",
    };
    return map[status] ?? "bg-gray-500/10 text-gray-500 border-gray-500/20";
  };

  const prevMonth = () =>
    setCurrentMonth((d) => new Date(d.getFullYear(), d.getMonth() - 1));
  const nextMonth = () =>
    setCurrentMonth((d) => new Date(d.getFullYear(), d.getMonth() + 1));

  // ----- render -----
  return (
    <div className="min-h-screen bg-black flex flex-col pt-5">
      <AuthenticatedNavbar />
      <AppointmentsHeader />

      <div className="flex-1 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
          {isLoading ? (
            <AppointmentsLoadingState />
          ) : appointments.length === 0 ? (
            <AppointmentEmptyState
              onBookClick={() =>
                navigate("/my-appointments/appointment-booking")
              }
            />
          ) : (
            <div className="flex flex-col lg:grid lg:grid-cols-3 gap-8">
              {/* CALENDAR – 1 column (shown first on mobile) */}
              <div className="lg:col-span-1 lg:order-2">
                <div className="lg:sticky lg:top-20">
                  <h2 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                    <span className="hidden sm:inline">
                      Appointment Calendar
                    </span>
                    <span className="sm:hidden">Calendar</span>
                  </h2>
                  <AppointmentsCalendar
                    month={currentMonth}
                    selectedDate={selectedDate}
                    appointments={appointments}
                    onPrevMonth={prevMonth}
                    onNextMonth={nextMonth}
                    onSelectDate={setSelectedDate}
                  />
                </div>
              </div>

              {/* LIST – 2 columns (shown second on mobile) */}
              <div className="lg:col-span-2 lg:order-1">
                <AppointmentsList
                  appointments={appointments}
                  selectedDate={selectedDate}
                  onClearFilter={() => setSelectedDate(null)}
                  onCancel={openCancelDialog}
                  cancellingId={cancellingId}
                  getStatusColor={getStatusColor}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />

      {/* Cancel dialog */}
      <ConfirmDialog
        isOpen={showCancelDialog}
        onClose={() => {
          setShowCancelDialog(false);
          setAppointmentToCancel(null);
        }}
        onConfirm={confirmCancel}
        title="Cancel Appointment?"
        message="Are you sure you want to cancel this appointment? This action cannot be undone."
        confirmText="Yes, Cancel"
        cancelText="No, Keep It"
        isDestructive
      />
    </div>
  );
};

export default MyAppointmentsPage;
