// src/pages/EmployeeDashboard.tsx

import { useState, useEffect, useCallback } from "react";
import { Clock, CheckCircle, AlertCircle, XCircle } from "lucide-react";
import AppointmentList from "@/components/EmployeeDashboard/AppointmentList";
import AppointmentDetail from "@/components/EmployeeDashboard/AppointmentDetail";
import StatusUpdateModal from "@/components/EmployeeDashboard/StatusUpdateModal";
import TimeLogForm from "@/components/EmployeeDashboard/TimeLogForm";
import TimeLogList from "@/components/EmployeeDashboard/TimeLogList";
import { useAuth } from "../hooks/useAuth";
import Footer from "@/components/Footer/Footer";
import AuthenticatedNavbar from "@/components/Navbar/AuthenticatedNavbar";
import employeeService, {
  type EmployeeAppointmentDTO,
  type TimeLogDTO,
} from "@/services/employeeService";

// ------------------ Types ------------------
// Using types from employeeService
type Appointment = EmployeeAppointmentDTO;
type TimeLog = TimeLogDTO;

interface TimeLogForm {
  date: string;
  startTime: string;
  endTime: string;
  description: string;
}

interface TimeLogErrors {
  date?: string;
  startTime?: string;
  endTime?: string;
  description?: string;
}

// ------------------ Component ------------------
const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [showStatusUpdate, setShowStatusUpdate] = useState<boolean>(false);
  const [showTimeLog, setShowTimeLog] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const EMPLOYEE_ID = user?.id || 9;

  const [newStatus, setNewStatus] = useState<string>("");
  const [completionDescription, setCompletionDescription] =
    useState<string>("");

  const [timeLogForm, setTimeLogForm] = useState<TimeLogForm>({
    date: new Date().toISOString().split("T")[0],
    startTime: "",
    endTime: "",
    description: "",
  });

  const [timeLogErrors, setTimeLogErrors] = useState<TimeLogErrors>({});
  const [timeLogTouched, setTimeLogTouched] = useState(false);
  const [statusTouched, setStatusTouched] = useState(false);

  // ------------------ Fetch Appointments ------------------
  const fetchAppointments = useCallback(async () => {
    if (!EMPLOYEE_ID) return;

    setLoading(true);
    setError(null);

    // Map frontend filter to backend status
    let backendStatus: string | undefined;
    if (statusFilter === "NOT STARTED") backendStatus = "CONFIRMED";
    else if (statusFilter === "IN PROGRESS") backendStatus = "IN_PROGRESS";
    else if (statusFilter === "COMPLETED") backendStatus = "COMPLETED";

    try {
      const data = await employeeService.getEmployeeAppointments(
        EMPLOYEE_ID,
        backendStatus
      );

      setAppointments(data);

      // Update selected appointment if it still exists
      setSelectedAppointment((prev) => {
        if (prev) {
          const stillExists = data.find((apt) => apt.id === prev.id);
          if (stillExists) return stillExists;
        }
        return data.length > 0 ? data[0] : null;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [EMPLOYEE_ID, statusFilter]);

  // ------------------ Fetch Time Logs ------------------
  const fetchTimeLogs = useCallback(
    async (appointmentId: string) => {
      try {
        const data = await employeeService.getAppointmentTimeLogs(
          appointmentId,
          EMPLOYEE_ID
        );
        setTimeLogs(data);
      } catch (err) {
        console.error("Error fetching time logs:", err);
        setTimeLogs([]);
      }
    },
    [EMPLOYEE_ID]
  );

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  useEffect(() => {
    if (selectedAppointment) {
      fetchTimeLogs(selectedAppointment.id);
    } else {
      setTimeLogs([]);
    }
    setShowTimeLog(false); // Close Log Time panel when switching appointments
    setShowStatusUpdate(false); // Close Update Status panel when switching appointments
    setNewStatus("");
    setCompletionDescription("");
    setStatusTouched(false);
    setError(null); // Reset appointment data validation error when switching appointments
  }, [selectedAppointment, fetchTimeLogs]);

  // ------------------ Update Appointment Status ------------------
  const updateAppointmentStatus = async () => {
    if (!newStatus || !selectedAppointment) return;
    if (newStatus === "COMPLETED" && !completionDescription.trim()) return;

    // Validation: Only allow status update if current date >= appointment scheduled date
    const appointmentDate = new Date(selectedAppointment.appointmentDate);
    const today = new Date();
    // Set both dates to midnight for comparison
    appointmentDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    if (today < appointmentDate) {
      setError(
        "You can only update the status after the scheduled appointment date."
      );
      return;
    }

    setLoading(true);
    try {
      await employeeService.updateAppointmentStatus(
        selectedAppointment.id,
        newStatus
      );
      await fetchAppointments();
      setShowStatusUpdate(false);
      setNewStatus("");
      setCompletionDescription("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // ------------------ Time Log Helpers ------------------
  const calculateDuration = (): string => {
    if (timeLogForm.startTime && timeLogForm.endTime) {
      const start = new Date(`${timeLogForm.date}T${timeLogForm.startTime}`);
      const end = new Date(`${timeLogForm.date}T${timeLogForm.endTime}`);
      const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      return diff > 0 ? diff.toFixed(2) : "0.00";
    }
    return "0.00";
  };

  const validateTimeLog = (): boolean => {
    const errors: TimeLogErrors = {};
    const { date, startTime, endTime, description } = timeLogForm;

    if (!date) errors.date = "Date is required.";
    if (!startTime) errors.startTime = "Start time is required.";
    if (!endTime) errors.endTime = "End time is required.";
    if (!description.trim()) errors.description = "Description is required.";

    if (date && startTime && endTime) {
      const start = new Date(`${date}T${startTime}`);
      const end = new Date(`${date}T${endTime}`);
      if (end <= start) errors.endTime = "End time must be after start time.";
    }

    setTimeLogErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const submitTimeLog = async () => {
    setTimeLogTouched(true);
    if (!validateTimeLog() || !selectedAppointment) return;

    setLoading(true);
    try {
      const payload = {
        employeeId: EMPLOYEE_ID,
        startTime: `${timeLogForm.date}T${timeLogForm.startTime}:00`,
        endTime: `${timeLogForm.date}T${timeLogForm.endTime}:00`,
        notes: timeLogForm.description,
      };

      await employeeService.createTimeLog(selectedAppointment.id, payload);
      await fetchTimeLogs(selectedAppointment.id);
      
      // Reset form
      setShowTimeLog(false);
      setTimeLogForm({
        date: new Date().toISOString().split("T")[0],
        startTime: "",
        endTime: "",
        description: "",
      });
      setTimeLogErrors({});
      setTimeLogTouched(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // ------------------ Helpers / UI Formatting ------------------
  const getStatusColor = (status: string): string => {
    switch (status) {
      case "CONFIRMED":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "IN_PROGRESS":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "COMPLETED":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return <AlertCircle className="w-4 h-4" />;
      case "IN_PROGRESS":
        return <Clock className="w-4 h-4" />;
      case "COMPLETED":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <XCircle className="w-4 h-4" />;
    }
  };

  const getDisplayStatus = (status: string): string =>
    status === "CONFIRMED" ? "NOT STARTED" : status.replace("_", " ");

  const formatDateTime = (dateTime: string): string =>
    new Date(dateTime).toLocaleString("en-GB", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const formatDate = (dateTime: string): string =>
    new Date(dateTime).toLocaleDateString("en-GB", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  // ------------------ Render ------------------
  return (
    <div className="min-h-screen bg-black flex flex-col pt-12">
      <AuthenticatedNavbar />
      <div className="bg-linear-to-r from-zinc-900 to-zinc-800 border-b border-zinc-700 pt-4">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-white">Employee Dashboard</h1>
          <p className="text-gray-400 mt-2">
            Welcome back,{" "}
            {user?.fullName || `${user?.firstName} ${user?.lastName}`}!
          </p>
        </div>
      </div>
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Assigned Services */}
          <div className="lg:col-span-1">
            <AppointmentList
              appointments={appointments}
              selectedAppointmentId={selectedAppointment?.id || null}
              setSelectedAppointment={(apt) =>
                setSelectedAppointment(apt as Appointment)
              }
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              loading={loading}
              getStatusColor={getStatusColor}
              getStatusIcon={getStatusIcon}
              getDisplayStatus={getDisplayStatus}
              formatDate={formatDate}
              formatDateTime={formatDateTime}
            />
          </div>
          {/* Right Panel - Job Detail */}
          <div className="lg:col-span-2">
            {selectedAppointment ? (
              <div className="space-y-6">
                <AppointmentDetail
                  appointment={selectedAppointment}
                  getStatusColor={getStatusColor}
                  getStatusIcon={getStatusIcon}
                  getDisplayStatus={getDisplayStatus}
                  formatDate={formatDate}
                  formatDateTime={formatDateTime}
                  onShowStatusUpdate={() => {
                    setShowStatusUpdate(true);
                    setShowTimeLog(false);
                  }}
                  onShowTimeLog={() => {
                    setShowTimeLog(true);
                    setShowStatusUpdate(false);
                  }}
                  disableTimeLog={selectedAppointment.status === "CONFIRMED"}
                />
                {showStatusUpdate && (
                  <StatusUpdateModal
                    newStatus={newStatus}
                    setNewStatus={setNewStatus}
                    completionDescription={completionDescription}
                    setCompletionDescription={(desc) => {
                      setCompletionDescription(desc);
                      if (newStatus === "COMPLETED" && desc.trim()) {
                        setStatusTouched(false);
                      }
                    }}
                    updateAppointmentStatus={() => {
                      setStatusTouched(true);
                      updateAppointmentStatus();
                    }}
                    loading={loading}
                    setShowStatusUpdate={(show) => {
                      setShowStatusUpdate(show);
                      if (!show) {
                        setNewStatus("");
                        setCompletionDescription("");
                        setStatusTouched(false);
                        setError(null);
                      }
                    }}
                    getDisplayStatus={getDisplayStatus}
                    statusTouched={statusTouched}
                    error={error}
                  />
                )}
                {showTimeLog && (
                  <TimeLogForm
                    timeLogForm={timeLogForm}
                    timeLogErrors={timeLogErrors}
                    setTimeLogForm={(form) => {
                      setTimeLogForm(form);
                      if (timeLogTouched) validateTimeLog();
                    }}
                    setTimeLogErrors={setTimeLogErrors}
                    calculateDuration={calculateDuration}
                    submitTimeLog={submitTimeLog}
                    loading={loading}
                    setShowTimeLog={setShowTimeLog}
                    timeLogTouched={timeLogTouched}
                  />
                )}
                <TimeLogList
                  timeLogs={timeLogs}
                  formatDateTime={formatDateTime}
                />
              </div>
            ) : (
              <div className="text-center py-20 text-gray-400">
                Select an appointment to view details
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default EmployeeDashboard;

// Add white clock icon for time input (works in Chromium browsers)
// This is injected as a style tag for component-scoped effect
// You can move this to a global CSS file if you prefer
const style = document.createElement("style");
style.innerHTML = `
  input[type="time"]::-webkit-calendar-picker-indicator,
  input[type="date"]::-webkit-calendar-picker-indicator {
    filter: invert(1);
  }
`;
if (
  typeof window !== "undefined" &&
  !document.getElementById("white-time-icon-style")
) {
  style.id = "white-time-icon-style";
  document.head.appendChild(style);
}
