import { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import AuthenticatedNavbar from "@/components/Navbar/AuthenticatedNavbar";
import Footer from "@/components/Footer/Footer";
import DashboardHeader from "@/components/DashboardHeader";
import employeeService, {
  type TimeLogDTO,
  type ShiftDTO,
} from "@/services/employeeService";

type Shift = ShiftDTO;

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  shifts: Shift[];
  timeLogs: TimeLogDTO[];
}

const MySchedulePage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [availableShifts, setAvailableShifts] = useState<Shift[]>([]);
  const [timeLogs, setTimeLogs] = useState<TimeLogDTO[]>([]);
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);
  const [view, setView] = useState<"calendar" | "list">("calendar");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assigningId, setAssigningId] = useState<string | null>(null);

  // Fetch shifts and time logs
  const fetchScheduleData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("Fetching shifts, available appointments, and time logs...");
      const [shiftsData, availableData, timeLogsData] = await Promise.all([
        employeeService.getEmployeeShifts(),
        employeeService.getAvailableAppointments(),
        employeeService.getAllTimeLogs(),
      ]);

      console.log("Assigned shifts received:", shiftsData);
      console.log("Available appointments received:", availableData);
      console.log("Time logs received:", timeLogsData);

      setShifts(shiftsData || []);
      setAvailableShifts(availableData || []);
      setTimeLogs(timeLogsData || []);
    } catch (err) {
      console.error("Error fetching schedule data:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load schedule data"
      );
      setShifts([]);
      setTimeLogs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchScheduleData();
  }, [fetchScheduleData]);

  // Handle self-assignment of available shifts
  const handleSelfAssign = async (appointmentId: string) => {
    setAssigningId(appointmentId);
    try {
      await employeeService.selfAssignAppointment(appointmentId);
      // Refresh the data after successful assignment
      await fetchScheduleData();
      alert("Shift successfully assigned to you!");
    } catch (err) {
      console.error("Error self-assigning shift:", err);
      alert("Failed to assign shift. Please try again.");
    } finally {
      setAssigningId(null);
    }
  };

  // Calendar helpers
  const getDaysInMonth = (date: Date): CalendarDay[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: CalendarDay[] = [];

    // Add previous month's days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({
        date,
        isCurrentMonth: false,
        shifts: getShiftsForDate(date),
        timeLogs: getTimeLogsForDate(date),
      });
    }

    // Add current month's days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      days.push({
        date,
        isCurrentMonth: true,
        shifts: getShiftsForDate(date),
        timeLogs: getTimeLogsForDate(date),
      });
    }

    // Add next month's days to complete the grid
    const remainingDays = 42 - days.length; // 6 weeks * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      days.push({
        date,
        isCurrentMonth: false,
        shifts: getShiftsForDate(date),
        timeLogs: getTimeLogsForDate(date),
      });
    }

    return days;
  };

  const getShiftsForDate = (date: Date): Shift[] => {
    return shifts.filter((shift) => {
      const shiftDate = new Date(shift.startTime);
      return (
        shiftDate.getFullYear() === date.getFullYear() &&
        shiftDate.getMonth() === date.getMonth() &&
        shiftDate.getDate() === date.getDate()
      );
    });
  };

  const getAvailableShiftsForDate = (date: Date): Shift[] => {
    return availableShifts.filter((shift) => {
      const shiftDate = new Date(shift.startTime);
      return (
        shiftDate.getFullYear() === date.getFullYear() &&
        shiftDate.getMonth() === date.getMonth() &&
        shiftDate.getDate() === date.getDate()
      );
    });
  };

  const getTimeLogsForDate = (date: Date): TimeLogDTO[] => {
    return timeLogs.filter((log) => {
      const logDate = new Date(log.startTime);
      return (
        logDate.getFullYear() === date.getFullYear() &&
        logDate.getMonth() === date.getMonth() &&
        logDate.getDate() === date.getDate()
      );
    });
  };

  const previousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const formatTime = (time: string): string => {
    return new Date(time).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDuration = (startTime: string, endTime: string): string => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return `${diff.toFixed(1)}h`;
  };

  const getShiftStatusColor = (status: string): string => {
    switch (status.toUpperCase()) {
      case "SCHEDULED":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "COMPLETED":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      case "CANCELLED":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    }
  };

  const calendarDays = getDaysInMonth(currentDate);
  const monthYear = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div className="min-h-screen bg-black flex flex-col pt-12">
      <AuthenticatedNavbar />

      {/* Header */}
      <DashboardHeader
        title="My Schedule"
        subtitle="View your shifts, available slots, and time logs"
        showWelcomeMessage={false}
        rightContent={
          <div className="flex items-center gap-3">
            <button
              onClick={() =>
                setView(view === "calendar" ? "list" : "calendar")
              }
              className="px-4 py-2 bg-zinc-800 text-white rounded-lg text-sm font-semibold hover:bg-zinc-700 transition border border-zinc-700"
            >
              {view === "calendar" ? "List View" : "Calendar View"}
            </button>
          </div>
        }
      />

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-0 py-12 w-full">
        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading schedule...</p>
            </div>
          </div>
        ) : error ? (
          /* Error State */
          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-400 mb-2">
              Error Loading Schedule
            </h3>
            <p className="text-gray-400 mb-4">{error}</p>
            <button
              onClick={fetchScheduleData}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-orange-600 transition"
            >
              Retry
            </button>
          </div>
        ) : shifts.length === 0 &&
          timeLogs.length === 0 &&
          availableShifts.length === 0 ? (
          /* Empty State */
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">
              No Schedule Data
            </h3>
            <p className="text-gray-500 mb-4">
              You don't have any assigned shifts, available shifts, or time logs
              yet.
            </p>
            <p className="text-gray-600 text-sm">
              Shifts will appear here once they are assigned to you or become
              available for self-assignment.
            </p>
          </div>
        ) : view === "calendar" ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar */}
            <div className="lg:col-span-2">
              <div className="bg-zinc-900/50 rounded-lg shadow-md border border-zinc-800 p-6">
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">{monthYear}</h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={goToToday}
                      className="px-3 py-1 bg-orange-500 text-white rounded text-sm font-semibold hover:bg-orange-600 transition"
                    >
                      Today
                    </button>
                    <button
                      onClick={previousMonth}
                      className="p-2 bg-zinc-800 text-white rounded hover:bg-zinc-700 transition"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextMonth}
                      className="p-2 bg-zinc-800 text-white rounded hover:bg-zinc-700 transition"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Weekday Headers */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                    (day) => (
                      <div
                        key={day}
                        className="text-center text-xs font-semibold text-gray-400 py-2"
                      >
                        {day}
                      </div>
                    )
                  )}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2">
                  {calendarDays.map((day, index) => {
                    const hasShifts = day.shifts.length > 0;
                    const hasTimeLogs = day.timeLogs.length > 0;
                    const availableCount = getAvailableShiftsForDate(
                      day.date
                    ).length;
                    const hasAvailable = availableCount > 0;
                    const isCurrentDay = isToday(day.date);

                    return (
                      <button
                        key={index}
                        onClick={() => setSelectedDay(day)}
                        className={`
                          min-h-20 p-2 rounded-lg border transition-all
                          ${
                            day.isCurrentMonth
                              ? "bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700/50"
                              : "bg-zinc-900/30 border-zinc-800 text-gray-600"
                          }
                          ${isCurrentDay ? "ring-2 ring-orange-500" : ""}
                          ${
                            selectedDay?.date.getTime() === day.date.getTime()
                              ? "bg-zinc-700 border-orange-500"
                              : ""
                          }
                        `}
                      >
                        <div className="text-left">
                          <div
                            className={`text-sm font-semibold mb-1 ${
                              isCurrentDay ? "text-orange-400" : "text-white"
                            }`}
                          >
                            {day.date.getDate()}
                          </div>
                          <div className="space-y-1">
                            {hasShifts && (
                              <div className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                <span className="text-xs text-gray-400">
                                  {day.shifts.length} shift
                                  {day.shifts.length > 1 ? "s" : ""}
                                </span>
                              </div>
                            )}
                            {hasAvailable && (
                              <div className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                                <span className="text-xs text-orange-400">
                                  {availableCount} available
                                </span>
                              </div>
                            )}
                            {hasTimeLogs && (
                              <div className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <span className="text-xs text-gray-400">
                                  {day.timeLogs.length} log
                                  {day.timeLogs.length > 1 ? "s" : ""}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="flex items-center gap-6 mt-6 pt-4 border-t border-zinc-700">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-sm text-gray-400">My Shifts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                    <span className="text-sm text-gray-400">Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-sm text-gray-400">Time Logs</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Day Details */}
            <div className="lg:col-span-1">
              <div className="bg-zinc-900/50 rounded-lg shadow-md border border-zinc-800 p-6 sticky top-24">
                <h3 className="text-lg font-bold text-white mb-4">
                  {selectedDay
                    ? selectedDay.date.toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "Select a date"}
                </h3>

                {selectedDay ? (
                  <div className="space-y-4">
                    {/* Shifts */}
                    {selectedDay.shifts.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wide">
                          Shifts
                        </h4>
                        <div className="space-y-2">
                          {selectedDay.shifts.map((shift) => (
                            <div
                              key={shift.id}
                              className="bg-zinc-800 border border-zinc-700 rounded-lg p-3"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold border ${getShiftStatusColor(
                                    shift.status
                                  )}`}
                                >
                                  {shift.status}
                                </span>
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 text-sm text-gray-300">
                                  <Clock className="w-4 h-4 text-gray-400" />
                                  <span>
                                    {formatTime(shift.startTime)}
                                    {shift.estimatedDuration > 0 &&
                                      ` (${shift.estimatedDuration} min)`}
                                  </span>
                                </div>
                                {shift.customerName && (
                                  <p className="text-sm text-gray-400">
                                    {shift.customerName}
                                  </p>
                                )}
                                {shift.vehicleInfo && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    {shift.vehicleInfo}
                                  </p>
                                )}
                                {shift.description && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    {shift.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Available Shifts */}
                    {getAvailableShiftsForDate(selectedDay.date).length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-orange-400 mb-2 uppercase tracking-wide">
                          Available to Assign
                        </h4>
                        <div className="space-y-2">
                          {getAvailableShiftsForDate(selectedDay.date).map(
                            (shift) => (
                              <div
                                key={shift.id}
                                className="bg-zinc-800/50 border border-orange-500/30 rounded-lg p-3"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-orange-500/20 text-orange-400 border border-orange-500/50">
                                    AVAILABLE
                                  </span>
                                </div>
                                <div className="space-y-1">
                                  <div className="text-sm font-medium text-white">
                                    {shift.title}
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-gray-300">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    <span>{formatTime(shift.startTime)}</span>
                                  </div>
                                  {shift.customerName && (
                                    <p className="text-xs text-gray-400">
                                      {shift.customerName}
                                    </p>
                                  )}
                                  {shift.vehicleInfo && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      {shift.vehicleInfo}
                                    </p>
                                  )}
                                </div>
                                <button
                                  onClick={() => handleSelfAssign(shift.id)}
                                  disabled={assigningId === shift.id}
                                  className={`mt-2 w-full px-3 py-1.5 rounded text-xs font-semibold transition ${
                                    assigningId === shift.id
                                      ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                                      : "bg-orange-500 text-white hover:bg-orange-600"
                                  }`}
                                >
                                  {assigningId === shift.id
                                    ? "Assigning..."
                                    : "Assign to Me"}
                                </button>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {/* Time Logs */}
                    {selectedDay.timeLogs.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wide">
                          Time Logs
                        </h4>
                        <div className="space-y-2">
                          {selectedDay.timeLogs.map((log) => (
                            <div
                              key={log.id}
                              className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2 text-sm text-gray-300">
                                  <CheckCircle className="w-4 h-4 text-green-400" />
                                  <span>{formatTime(log.startTime)}</span>
                                  <span className="text-gray-500">-</span>
                                  <span>{formatTime(log.endTime)}</span>
                                </div>
                                <span className="text-xs font-semibold text-orange-400">
                                  {formatDuration(log.startTime, log.endTime)}
                                </span>
                              </div>
                              {log.notes && (
                                <p className="text-xs text-gray-400 mt-1">
                                  {log.notes}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedDay.shifts.length === 0 &&
                      selectedDay.timeLogs.length === 0 &&
                      getAvailableShiftsForDate(selectedDay.date).length ===
                        0 && (
                        <div className="text-center py-8">
                          <AlertCircle className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                          <p className="text-gray-500 text-sm">
                            No shifts or time logs for this day
                          </p>
                        </div>
                      )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">
                      Click on a date to view details
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* List View */
          <div className="bg-zinc-900/50 rounded-lg shadow-md border border-zinc-800 p-6">
            <h2 className="text-xl font-bold text-white mb-6">
              All Shifts & Time Logs
            </h2>

            {/* Upcoming Shifts */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-300 mb-4">
                My Assigned Shifts
              </h3>
              <div className="space-y-3">
                {shifts
                  .filter((shift) => new Date(shift.startTime) >= new Date())
                  .sort(
                    (a, b) =>
                      new Date(a.startTime).getTime() -
                      new Date(b.startTime).getTime()
                  )
                  .map((shift) => (
                    <div
                      key={shift.id}
                      className="bg-zinc-800 border border-zinc-700 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-semibold text-white">
                              {new Date(shift.startTime).toLocaleDateString(
                                "en-US",
                                {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold border ${getShiftStatusColor(
                                shift.status
                              )}`}
                            >
                              {shift.status}
                            </span>
                          </div>
                          <div className="flex flex-col gap-2 text-sm text-gray-400">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span>
                                {formatTime(shift.startTime)}
                                {shift.estimatedDuration > 0 &&
                                  ` (${shift.estimatedDuration} min)`}
                              </span>
                            </div>
                            {shift.customerName && (
                              <div className="text-gray-400">
                                Customer: {shift.customerName}
                              </div>
                            )}
                            {shift.vehicleInfo && (
                              <div className="text-gray-500 text-xs">
                                {shift.vehicleInfo}
                              </div>
                            )}
                          </div>
                          {shift.description && (
                            <p className="text-sm text-gray-500 mt-2">
                              {shift.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                {shifts.filter(
                  (shift) => new Date(shift.startTime) >= new Date()
                ).length === 0 && (
                  <div className="text-center py-6 text-gray-500">
                    No upcoming assigned shifts
                  </div>
                )}
              </div>
            </div>

            {/* Available Shifts to Assign */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-orange-400 mb-4">
                Available Shifts to Self-Assign
              </h3>
              <div className="space-y-3">
                {availableShifts
                  .filter((shift) => new Date(shift.startTime) >= new Date())
                  .sort(
                    (a, b) =>
                      new Date(a.startTime).getTime() -
                      new Date(b.startTime).getTime()
                  )
                  .map((shift) => (
                    <div
                      key={shift.id}
                      className="bg-zinc-800 border border-orange-500/30 rounded-lg p-4 hover:border-orange-500/50 transition"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-semibold text-white">
                              {new Date(shift.startTime).toLocaleDateString(
                                "en-US",
                                {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )}
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-orange-500/20 text-orange-400 border border-orange-500/50">
                              AVAILABLE
                            </span>
                          </div>
                          <div className="flex flex-col gap-2 text-sm text-gray-400">
                            <div className="font-medium text-white">
                              {shift.title}
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span>{formatTime(shift.startTime)}</span>
                            </div>
                            {shift.customerName && (
                              <div className="text-gray-400">
                                Customer: {shift.customerName}
                              </div>
                            )}
                            {shift.vehicleInfo && (
                              <div className="text-gray-500 text-xs">
                                {shift.vehicleInfo}
                              </div>
                            )}
                          </div>
                          {shift.description && (
                            <p className="text-sm text-gray-500 mt-2">
                              {shift.description}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => handleSelfAssign(shift.id)}
                          disabled={assigningId === shift.id}
                          className={`ml-4 px-4 py-2 rounded-lg text-sm font-semibold transition ${
                            assigningId === shift.id
                              ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                              : "bg-orange-500 text-white hover:bg-orange-600"
                          }`}
                        >
                          {assigningId === shift.id
                            ? "Assigning..."
                            : "Assign to Me"}
                        </button>
                      </div>
                    </div>
                  ))}
                {availableShifts.filter(
                  (shift) => new Date(shift.startTime) >= new Date()
                ).length === 0 && (
                  <div className="text-center py-6 text-gray-500">
                    No available shifts to assign at the moment
                  </div>
                )}
              </div>
            </div>

            {/* Recent Time Logs */}
            <div>
              <h3 className="text-lg font-semibold text-gray-300 mb-4">
                Recent Time Logs
              </h3>
              <div className="space-y-3">
                {timeLogs
                  .sort(
                    (a, b) =>
                      new Date(b.startTime).getTime() -
                      new Date(a.startTime).getTime()
                  )
                  .slice(0, 10)
                  .map((log) => (
                    <div
                      key={log.id}
                      className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            <span className="font-semibold text-white">
                              {new Date(log.startTime).toLocaleDateString(
                                "en-US",
                                {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )}
                            </span>
                            <span className="text-orange-400 font-semibold text-sm">
                              {formatDuration(log.startTime, log.endTime)}
                            </span>
                          </div>
                          <div className="text-sm text-gray-400">
                            {formatTime(log.startTime)} -{" "}
                            {formatTime(log.endTime)}
                          </div>
                          {log.notes && (
                            <p className="text-sm text-gray-500 mt-2">
                              {log.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default MySchedulePage;
