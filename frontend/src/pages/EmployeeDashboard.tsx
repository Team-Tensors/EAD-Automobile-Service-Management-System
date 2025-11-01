// src/pages/EmployeeDashboard.tsx

import { useState, useEffect, useCallback } from 'react';
import {
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Car,
  Calendar,
  User,
  Filter,
  Phone,
  MapPin,
  Wrench,
  Timer,
  Coins,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Footer from '@/components/Footer/Footer';
import AuthenticatedNavbar from '@/components/Navbar/AuthenticatedNavbar';

const API_BASE_URL = 'http://localhost:4000/api/employee';

// ------------------ Types ------------------
interface Appointment {
  id: string;
  userId: number;
  userFullName: string;
  address: string;
  phoneNumber: string;
  email: string;
  vehicleId: string;
  brand: string;
  model: string;
  year: string;
  color: string;
  lastServiceDate: string | null;
  licensePlate: string;
  appointmentType: string;
  serviceOrModificationId: number;
  serviceOrModificationName: string;
  serviceOrModificationDescription: string;
  estimatedCost: number;
  estimatedTimeMinutes: number;
  appointmentDate: string;
  status: string;
  description: string;
  assignedEmployeeIds: number[];
}

interface TimeLog {
  id: number;
  startTime: string;
  endTime: string;
  hoursLogged: number;
  notes: string;
}

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
  const { user, token } = useAuth(); // <-- get token from context
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [showStatusUpdate, setShowStatusUpdate] = useState<boolean>(false);
  const [showTimeLog, setShowTimeLog] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const EMPLOYEE_ID = user?.id || 9;

  const [newStatus, setNewStatus] = useState<string>('');
  const [completionDescription, setCompletionDescription] =
    useState<string>('');

  const [timeLogForm, setTimeLogForm] = useState<TimeLogForm>({
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: '',
    description: '',
  });

  const [timeLogErrors, setTimeLogErrors] = useState<TimeLogErrors>({});

  // ------------------ Fetch Appointments ------------------
  const fetchAppointments = useCallback(async () => {
    if (!EMPLOYEE_ID) return;

    setLoading(true);
    setError(null);

    let backendStatus: string | null = null;
    if (statusFilter === 'NOT STARTED') backendStatus = 'CONFIRMED';
    else if (statusFilter === 'IN PROGRESS') backendStatus = 'IN_PROGRESS';
    else if (statusFilter === 'COMPLETED') backendStatus = 'COMPLETED';

    let url = `${API_BASE_URL}/appointments/${EMPLOYEE_ID}`;
    if (backendStatus) url += `?status=${backendStatus}`;

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // <-- use dynamic token
        },
      });

      if (!response.ok) throw new Error('Failed to fetch appointments');
      const data = await response.json();
      setAppointments(data);

      setSelectedAppointment(prev => {
        if (prev) {
          const stillExists = data.find((apt: Appointment) => apt.id === prev.id);
          if (stillExists) return stillExists;
        }
        return data.length > 0 ? data[0] : null;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [EMPLOYEE_ID, statusFilter]);

  // ------------------ Fetch Time Logs ------------------
  const fetchTimeLogs = useCallback(
    async (appointmentId: string) => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/appointments/${appointmentId}/employees/${EMPLOYEE_ID}/timelogs`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`, // <-- use dynamic token
            },
          }
        );

        if (!response.ok) throw new Error('Failed to fetch time logs');
        const data = await response.json();
        setTimeLogs(data);
      } catch (err) {
        console.error('Error fetching time logs:', err);
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
  }, [selectedAppointment, fetchTimeLogs]);

  // ------------------ Update Appointment Status ------------------
  const updateAppointmentStatus = async () => {
    if (!newStatus || !selectedAppointment) return;
    if (newStatus === 'COMPLETED' && !completionDescription.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/appointments/${selectedAppointment.id}/status?status=${newStatus}`,
        {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` }, // <-- use dynamic token
        }
      );

      if (!response.ok) throw new Error('Failed to update status');
      await fetchAppointments();
      setShowStatusUpdate(false);
      setNewStatus('');
      setCompletionDescription('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
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
      return diff > 0 ? diff.toFixed(2) : '0.00';
    }
    return '0.00';
  };

  const validateTimeLog = (): boolean => {
    const errors: TimeLogErrors = {};
    const { date, startTime, endTime, description } = timeLogForm;

    if (!date) errors.date = 'Date is required.';
    if (!startTime) errors.startTime = 'Start time is required.';
    if (!endTime) errors.endTime = 'End time is required.';
    if (!description.trim()) errors.description = 'Description is required.';

    if (date && startTime && endTime) {
      const start = new Date(`${date}T${startTime}`);
      const end = new Date(`${date}T${endTime}`);
      if (end <= start) errors.endTime = 'End time must be after start time.';
    }

    setTimeLogErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const submitTimeLog = async () => {
    if (!validateTimeLog() || !selectedAppointment) return;

    setLoading(true);
    try {
      const payload = {
        employeeId: EMPLOYEE_ID,
        startTime: `${timeLogForm.date}T${timeLogForm.startTime}:00`,
        endTime: `${timeLogForm.date}T${timeLogForm.endTime}:00`,
        notes: timeLogForm.description,
      };

      const response = await fetch(
        `${API_BASE_URL}/appointments/${selectedAppointment.id}/timelog`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`, // <-- use dynamic token
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) throw new Error('Failed to log time');
      await fetchTimeLogs(selectedAppointment.id);
      setShowTimeLog(false);
      setTimeLogForm({
        date: new Date().toISOString().split('T')[0],
        startTime: '',
        endTime: '',
        description: '',
      });
      setTimeLogErrors({});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // ------------------ Helpers / UI Formatting ------------------
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'IN_PROGRESS':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'COMPLETED':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <AlertCircle className="w-4 h-4" />;
      case 'IN_PROGRESS':
        return <Clock className="w-4 h-4" />;
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <XCircle className="w-4 h-4" />;
    }
  };

  const getDisplayStatus = (status: string): string =>
    status === 'CONFIRMED' ? 'NOT STARTED' : status.replace('_', ' ');

  const formatDateTime = (dateTime: string): string =>
    new Date(dateTime).toLocaleString('en-GB', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const formatDate = (dateTime: string): string =>
    new Date(dateTime).toLocaleDateString('en-GB', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  // ------------------ Render ------------------
  return (
    <div className="min-h-screen bg-black flex flex-col pt-12">
      <AuthenticatedNavbar />

      <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 border-b border-zinc-700 pt-4">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-white">Employee Dashboard</h1>
          <p className="text-gray-400 mt-2">
            Welcome back, {user?.fullName || `${user?.firstName} ${user?.lastName}`}!
          </p>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Assigned Services */}
          <div className="lg:col-span-1">
            <div className="bg-zinc-900/50 rounded-lg p-6 border border-zinc-800">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Assigned Services</h2>
                <Filter className="w-5 h-5 text-gray-500" />
              </div>

              <div className="flex gap-2 mb-4 flex-wrap">
                {['ALL', 'NOT STARTED', 'IN PROGRESS', 'COMPLETED'].map(status => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition border ${
                      statusFilter === status
                        ? 'bg-orange-500 text-white border-orange-500'
                        : 'bg-zinc-800 text-gray-300 border-zinc-700 hover:bg-zinc-700'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>

              {error && (
                <div className="bg-red-500/10 text-red-500 p-3 rounded-lg mb-4 text-sm border border-red-500/20">
                  {error}
                </div>
              )}

              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {loading && appointments.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    Loading appointments...
                  </div>
                )}

                {appointments.map(apt => (
                  <div
                    key={apt.id}
                    onClick={() => setSelectedAppointment(apt)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                      selectedAppointment?.id === apt.id
                        ? 'border-orange-500 bg-zinc-800'
                        : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Car className="w-4 h-4 text-gray-500" />
                          <p className="font-semibold text-white">
                            {apt.brand} {apt.model} ({apt.year})
                          </p>
                        </div>
                        <p className="text-sm text-gray-400 mb-2">{apt.appointmentType}</p>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                            apt.status
                          )}`}
                        >
                          {getStatusIcon(apt.status)}
                          {getDisplayStatus(apt.status)}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 mt-2">
                      {formatDate(apt.appointmentDate)}
                    </div>
                  </div>
                ))}

                {!loading && appointments.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    No appointments found for this filter
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel - Job Detail */}
          <div className="lg:col-span-2">
            {selectedAppointment ? (
              <div className="space-y-6">
                <div className="bg-zinc-900/50 rounded-lg shadow-md p-6 border border-zinc-800">
                  {/* VEHICLE INFO */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">
                        {selectedAppointment.brand} {selectedAppointment.model} (
                        {selectedAppointment.year})
                      </h2>
                      <p className="text-gray-400">
                        {selectedAppointment.licensePlate} •{' '}
                        {selectedAppointment.color}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(
                        selectedAppointment.status
                      )}`}
                    >
                      {getStatusIcon(selectedAppointment.status)}
                      {getDisplayStatus(selectedAppointment.status)}
                    </span>
                  </div>

                  {/* CUSTOMER INFO */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center gap-3 p-3 bg-zinc-800 rounded-lg border border-zinc-700">
                      <User className="w-5 h-5 text-orange-500" />
                      <div>
                        <p className="text-xs text-gray-400">Customer</p>
                        <p className="font-semibold text-white">
                          {selectedAppointment.userFullName}
                        </p>
                        <p className="text-xs text-gray-400">
                          {selectedAppointment.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-zinc-800 rounded-lg border border-zinc-700">
                      <Phone className="w-5 h-5 text-orange-500" />
                      <div>
                        <p className="text-xs text-gray-400">Phone</p>
                        <p className="font-semibold text-white">
                          {selectedAppointment.phoneNumber}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ADDRESS */}
                  <div className="flex items-center gap-3 mb-6 p-3 bg-zinc-800 rounded-lg border border-zinc-700">
                    <MapPin className="w-5 h-5 text-orange-500" />
                    <div>
                      <p className="text-xs text-gray-400">Address</p>
                      <p className="font-semibold text-white">
                        {selectedAppointment.address}
                      </p>
                    </div>
                  </div>

                                    {/* SERVICE INFO */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center gap-3 p-3 bg-zinc-800 rounded-lg border border-zinc-700">
                      <Wrench className="w-5 h-5 text-orange-500" />
                      <div>
                        <p className="text-xs text-gray-400">Service / Modification</p>
                        <p className="font-semibold text-white">
                          {selectedAppointment.serviceOrModificationName}
                        </p>
                        <p className="text-xs text-gray-400">
                          {selectedAppointment.serviceOrModificationDescription}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 p-3 bg-zinc-800 rounded-lg border border-zinc-700">
                      <div className="flex items-center gap-2 text-gray-400">
                        <Coins className="w-5 h-5 text-orange-500" />
                        <span>Estimated Cost</span>
                      </div>
                      <p className="text-white font-semibold">
                        £{selectedAppointment.estimatedCost?.toFixed(2) ?? 'N/A'}
                      </p>
                      <div className="flex items-center gap-2 text-gray-400 mt-1">
                        <Timer className="w-5 h-5 text-orange-500" />
                        <span>Estimated Time</span>
                      </div>
                      <p className="text-white font-semibold">
                        {selectedAppointment.estimatedTimeMinutes ?? 'N/A'} mins
                      </p>
                    </div>
                  </div>

                  {/* LAST SERVICE DATE */}
                  {selectedAppointment.lastServiceDate && (
                    <div className="flex items-center gap-3 mb-6 p-3 bg-zinc-800 rounded-lg border border-zinc-700">
                      <Calendar className="w-5 h-5 text-orange-500" />
                      <div>
                        <p className="text-xs text-gray-400">Last Service Date</p>
                        <p className="font-semibold text-white">
                          {formatDate(selectedAppointment.lastServiceDate)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* DESCRIPTION */}
                  {selectedAppointment.description && (
                    <div className="mb-6 p-3 bg-zinc-800 rounded-lg border border-zinc-700">
                      <p className="text-xs text-gray-400 mb-1">Appointment Notes</p>
                      <p className="text-sm text-white">
                        {selectedAppointment.description}
                      </p>
                    </div>
                  )}

                  {/* ASSIGNED EMPLOYEES */}
                  {selectedAppointment.assignedEmployeeIds?.length > 0 && (
                    <div className="mb-6 p-3 bg-zinc-800 rounded-lg border border-zinc-700">
                      <p className="text-xs text-gray-400 mb-1">Assigned Employees</p>
                      <p className="text-sm text-white">
                        {selectedAppointment.assignedEmployeeIds.join(', ')}
                      </p>
                    </div>
                  )}

                  {/* CONTROL BUTTONS */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowStatusUpdate(prev => !prev);
                        setShowTimeLog(false);
                      }}
                      className="flex-1 bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition"
                    >
                      Update Status
                    </button>
                    <button
                      onClick={() => {
                        setShowTimeLog(prev => !prev);
                        setShowStatusUpdate(false);
                      }}
                      disabled={selectedAppointment.status === 'CONFIRMED'}
                      className="flex-1 bg-zinc-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-zinc-700 transition border border-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Log Time
                    </button>
                  </div>
                </div>

                {/* STATUS UPDATE SECTION */}
                {showStatusUpdate && (
                  <div className="bg-zinc-900/50 rounded-lg shadow-md p-6 border border-zinc-800">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Update Service Status
                    </h3>

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
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition border ${
                              statusColors[status]
                            }`}
                          >
                            {getDisplayStatus(status)}
                          </button>
                        );
                      })}
                    </div>

                    {newStatus === 'COMPLETED' && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-white mb-2">
                          Completion Description
                        </label>
                        <textarea
                          value={completionDescription}
                          onChange={e => setCompletionDescription(e.target.value)}
                          className="w-full px-3 py-2 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-black text-white"
                          rows={3}
                          placeholder="Enter completion remarks..."
                        />
                        {!completionDescription.trim() && (
                          <p className="text-red-500 text-xs mt-1">
                            Completion description is required.
                          </p>
                        )}
                      </div>
                    )}

                    <div className="flex justify-center">
                      <button
                        onClick={updateAppointmentStatus}
                        disabled={
                          !newStatus ||
                          (newStatus === 'COMPLETED' &&
                            !completionDescription.trim()) ||
                          loading
                        }
                        className="px-6 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition disabled:opacity-50"
                      >
                        {loading ? 'Updating...' : 'Save Status'}
                      </button>
                    </div>
                  </div>
                )}

                {/* TIME LOG SECTION */}
                {showTimeLog && (
                  <div className="bg-zinc-900/50 rounded-lg shadow-md p-6 border border-zinc-800">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Log Work Time
                    </h3>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Date
                        </label>
                        <input
                          type="date"
                          name="date"
                          value={timeLogForm.date}
                          onChange={e => setTimeLogForm(prev => ({ ...prev, date: e.target.value }))}
                          className="w-full px-3 py-2 border border-zinc-700 rounded-lg bg-black text-white"
                        />
                        {timeLogErrors.date && (
                          <p className="text-red-500 text-xs mt-1">
                            {timeLogErrors.date}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Duration (hrs)
                        </label>
                        <input
                          type="text"
                          value={calculateDuration()}
                          readOnly
                          className="w-full px-3 py-2 border border-zinc-700 rounded-lg bg-zinc-800 text-gray-400"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Start Time
                        </label>
                        <input
                          type="time"
                          name="startTime"
                          value={timeLogForm.startTime}
                          onChange={e =>
                            setTimeLogForm(prev => ({ ...prev, startTime: e.target.value }))
                          }
                          className="w-full px-3 py-2 border border-zinc-700 rounded-lg bg-black text-white"
                        />
                        {timeLogErrors.startTime && (
                          <p className="text-red-500 text-xs mt-1">
                            {timeLogErrors.startTime}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          End Time
                        </label>
                        <input
                          type="time"
                          name="endTime"
                          value={timeLogForm.endTime}
                          onChange={e =>
                            setTimeLogForm(prev => ({ ...prev, endTime: e.target.value }))
                          }
                          className="w-full px-3 py-2 border border-zinc-700 rounded-lg bg-black text-white"
                        />
                        {timeLogErrors.endTime && (
                          <p className="text-red-500 text-xs mt-1">
                            {timeLogErrors.endTime}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Work Description
                      </label>
                      <textarea
                        name="description"
                        value={timeLogForm.description}
                        onChange={e =>
                          setTimeLogForm(prev => ({ ...prev, description: e.target.value }))
                        }
                        rows={3}
                        placeholder="Describe the work done..."
                        className="w-full px-3 py-2 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-black text-white"
                      />
                      {timeLogErrors.description && (
                        <p className="text-red-500 text-xs mt-1">
                          {timeLogErrors.description}
                        </p>
                      )}
                    </div>

                    <div className="flex justify-center">
                      <button
                        onClick={submitTimeLog}
                        disabled={loading}
                        className="px-6 py-2 bg-zinc-800 text-white rounded-lg font-semibold hover:bg-zinc-700 transition disabled:opacity-50"
                      >
                        {loading ? 'Logging...' : 'Submit Time Log'}
                      </button>
                    </div>
                  </div>
                )}

                {/* LOGGED TIME ENTRIES */}
                <div className="bg-zinc-900/50 rounded-lg shadow-md p-6 border border-zinc-800">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Logged Time Entries
                  </h3>

                  {timeLogs.length > 0 ? (
                    <div className="space-y-3 max-h-[300px] overflow-y-auto">
                      {timeLogs.map(log => (
                        <div
                          key={log.id}
                          className="flex justify-between items-start p-3 bg-zinc-800 rounded-lg border border-zinc-700"
                        >
                          <div>
                            <p className="text-sm font-medium text-white">
                              {formatDateTime(log.startTime)} →{' '}
                              {formatDateTime(log.endTime)}
                            </p>
                            {log.notes && (
                              <p className="text-xs text-gray-400 mt-1">
                                {log.notes}
                              </p>
                            )}
                          </div>
                          <p className="text-sm font-semibold text-orange-500">
                            {log.hoursLogged.toFixed(2)}h
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm">
                      No time logs recorded yet.
                    </p>
                  )}
                </div>
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
const style = document.createElement('style');
style.innerHTML = `
  input[type="time"]::-webkit-calendar-picker-indicator,
  input[type="date"]::-webkit-calendar-picker-indicator {
    filter: invert(1);
  }
`;
if (typeof window !== 'undefined' && !document.getElementById('white-time-icon-style')) {
  style.id = 'white-time-icon-style';
  document.head.appendChild(style);
}

