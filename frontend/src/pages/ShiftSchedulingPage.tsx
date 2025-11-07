import type React from "react";
import { useEffect, useState } from "react";
import {
  Calendar,
  MapPin,
  Wrench,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import shiftSchedulingService from "@/services/shiftSchedulingService";
import type { ShiftAppointment } from "@/types/ShiftScheduling";
import AuthenticatedNavbar from "@/components/Navbar/AuthenticatedNavbar";
import Footer from "@/components/Footer/Footer";
import { useAuth } from "../hooks/useAuth";

const ShiftSchedulingPage: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<ShiftAppointment[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const resp = await shiftSchedulingService.getPossibleAppointments();
        setAppointments(resp.data || []);
      } catch (err: unknown) {
        setError((err as Error).message || "Failed to load appointments");
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, []);

  const handleAssign = async (appointmentId: string) => {
    setAssigningId(appointmentId);
    setError(null);
    try {
      await shiftSchedulingService.assignEmployee({ appointmentId });

      // Remove assigned appointment from list (or mark assigned)
      setAppointments((prev) =>
        prev.filter((a) => a.appointmentId !== appointmentId)
      );
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to assign appointment");
    } finally {
      setAssigningId(null);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col pt-12">
      <AuthenticatedNavbar />
      <div className="bg-linear-to-r from-zinc-900 to-zinc-800 border-b border-zinc-700 pt-4">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-white">Shift Scheduling</h1>
          <p className="text-gray-400 mt-2">
            Welcome {user?.fullName || `${user?.firstName} ${user?.lastName}`}!
            Self-assign available appointments to your schedule.
          </p>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="bg-zinc-900/50 rounded-lg p-6 border border-zinc-800">
          {loading ? (
            <div className="py-8 text-center text-gray-400">
              <div className="inline-block animate-spin rounded-full h-7 w-7 border-b-2 border-orange-600 mb-3 mx-auto"></div>
              <p className="text-sm">Loading available appointments…</p>
            </div>
          ) : error ? (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-600/20 text-red-200 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-red-400" />
              <p className="text-sm">{error}</p>
            </div>
          ) : appointments.length === 0 ? (
            <div className="py-8 text-center">
              <Calendar className="h-12 w-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">
                No available appointments at the moment.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {appointments.map((a) => (
                <div
                  key={a.appointmentId}
                  className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 hover:border-orange-500 transition-colors"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left section - Service details */}
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Calendar className="h-5 w-5 text-orange-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-400 uppercase tracking-wide">
                            Date & Time
                          </p>
                          <p className="text-white font-medium">
                            {new Date(a.appointmentDate).toLocaleDateString(
                              "en-US",
                              {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}
                          </p>
                          <p className="text-sm text-orange-300">
                            {new Date(a.appointmentDate).toLocaleTimeString(
                              "en-US",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Wrench className="h-5 w-5 text-orange-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-400 uppercase tracking-wide">
                            Service
                          </p>
                          <p className="text-white font-medium">
                            {a.serviceOrModification}
                          </p>
                          {a.description && (
                            <p className="text-sm text-gray-400 mt-1">
                              {a.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-orange-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-400 uppercase tracking-wide">
                            Service Center
                          </p>
                          <p className="text-white font-medium">
                            {a.serviceCenter}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Right section - Vehicle and action */}
                    <div className="space-y-3">
                      <div className="bg-zinc-800/50 rounded-lg p-3 border border-zinc-700">
                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                          Vehicle
                        </p>
                        <p className="text-white font-semibold text-lg">
                          {a.vehicle}
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          {a.appointmentType}
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-400 uppercase tracking-wide">
                            Status
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="h-2 w-2 rounded-full bg-orange-400"></div>
                            <p className="text-sm text-gray-300 font-medium">
                              {a.status}
                            </p>
                          </div>
                        </div>
                      </div>

                      <button
                        className="w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-orange-500 text-white font-semibold hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                        onClick={() => handleAssign(a.appointmentId)}
                        disabled={assigningId === a.appointmentId}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        {assigningId === a.appointmentId
                          ? "Assigning…"
                          : "Assign to me"}
                      </button>
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

export default ShiftSchedulingPage;
