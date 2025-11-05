import React, { useEffect, useState } from "react";
import {
  X,
  Calendar,
  Wrench,
  Package,
  Clock,
  Car,
  Palette,
  FileText,
} from "lucide-react";
import toast from "react-hot-toast";
import type { Vehicle } from "../../types/vehicle";
import {
  appointmentService,
  type AppointmentSummary,
} from "../../services/appointmentService";

interface VehicleDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle;
}

const VehicleDetailsModal: React.FC<VehicleDetailsModalProps> = ({
  isOpen,
  onClose,
  vehicle,
}) => {
  const [appointments, setAppointments] = useState<AppointmentSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchVehicleHistory = async () => {
      setIsLoading(true);
      try {
        // Get all user appointments and filter by vehicle
        const allAppointments = await appointmentService.getMyAppointments();
        // Filter appointments for this vehicle (vehicle name matches)
        const vehicleAppointments = allAppointments.filter(
          (apt) => apt.vehicle === `${vehicle.brand} ${vehicle.model}`
        );
        setAppointments(vehicleAppointments);
      } catch (error) {
        console.error("Failed to fetch vehicle history:", error);
        toast.error("Failed to load service history");
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen && vehicle.id) {
      fetchVehicleHistory();
    }
  }, [isOpen, vehicle.id, vehicle.brand, vehicle.model]);

  if (!isOpen) return null;

  const now = new Date();

  // Separate past and upcoming appointments
  const pastAppointments = appointments.filter(
    (apt) => new Date(apt.date) < now
  );
  const upcomingAppointments = appointments.filter(
    (apt) => new Date(apt.date) >= now
  );

  const pastServices = pastAppointments.filter((apt) => apt.type === "SERVICE");
  const pastModifications = pastAppointments.filter(
    (apt) => apt.type === "MODIFICATION"
  );

  const upcomingServices = upcomingAppointments.filter(
    (apt) => apt.type === "SERVICE"
  );
  const upcomingModifications = upcomingAppointments.filter(
    (apt) => apt.type === "MODIFICATION"
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-zinc-800">
          <div className="flex-1 min-w-0 mr-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white truncate">
              {vehicle.brand} {vehicle.model}
            </h2>
            <p className="text-gray-400 text-xs sm:text-sm mt-1">
              Vehicle Details & History
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* Vehicle Information */}
          <div className="mb-6 sm:mb-8">
            <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
              <Car className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
              Vehicle Information
            </h3>
            <div className="bg-zinc-800/50 rounded-lg p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-orange-500/10 rounded-lg flex-shrink-0">
                  <Car className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs text-gray-400">
                    Brand & Model
                  </p>
                  <p className="text-sm sm:text-base text-white font-semibold truncate">
                    {vehicle.brand} {vehicle.model}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-blue-500/10 rounded-lg flex-shrink-0">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-gray-400">Year</p>
                  <p className="text-sm sm:text-base text-white font-semibold">
                    {vehicle.year}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-purple-500/10 rounded-lg flex-shrink-0">
                  <Palette className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-gray-400">Color</p>
                  <p className="text-sm sm:text-base text-white font-semibold capitalize">
                    {vehicle.color}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <FileText className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">License Plate</p>
                  <p className="text-white font-semibold uppercase">
                    {vehicle.licensePlate}
                  </p>
                </div>
              </div>

              {vehicle.lastServiceDate && (
                <div className="flex items-center gap-3 md:col-span-2">
                  <div className="p-2 bg-orange-500/10 rounded-lg">
                    <Clock className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Last Service Date</p>
                    <p className="text-orange-500 font-semibold">
                      {new Date(vehicle.lastServiceDate).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Service History */}
          <div className="mb-6 sm:mb-8">
            <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex flex-wrap items-center gap-2">
              <Wrench className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
              <span>Service History</span>
              <span className="text-xs sm:text-sm font-normal text-gray-400">
                ({pastServices.length} past services)
              </span>
            </h3>

            {isLoading ? (
              <div className="flex items-center justify-center py-6 sm:py-8">
                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-orange-500"></div>
              </div>
            ) : pastServices.length === 0 ? (
              <div className="bg-zinc-800/30 rounded-lg p-6 sm:p-8 text-center">
                <Wrench className="w-10 h-10 sm:w-12 sm:h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-sm sm:text-base text-gray-400">
                  No service history yet
                </p>
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {pastServices.map((service) => (
                  <div
                    key={service.id}
                    className="bg-zinc-800/50 rounded-lg p-3 sm:p-4 border border-zinc-700 hover:border-orange-500/50 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                          <Wrench className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-500 flex-shrink-0" />
                          <h4 className="text-sm sm:text-base text-white font-semibold truncate">
                            {service.service}
                          </h4>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {new Date(service.date).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )}
                          </span>
                          <Clock className="w-3 h-3 ml-2" />
                          <span>
                            {new Date(service.date).toLocaleTimeString(
                              "en-US",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          service.status === "COMPLETED"
                            ? "bg-blue-500/10 text-blue-500"
                            : service.status === "CONFIRMED"
                            ? "bg-green-500/10 text-green-500"
                            : service.status === "PENDING"
                            ? "bg-yellow-500/10 text-yellow-500"
                            : "bg-red-500/10 text-red-500"
                        }`}
                      >
                        {service.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Services */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-green-500" />
              Upcoming Services
              <span className="text-sm font-normal text-gray-400">
                ({upcomingServices.length} scheduled)
              </span>
            </h3>

            {upcomingServices.length === 0 ? (
              <div className="bg-zinc-800/30 rounded-lg p-8 text-center">
                <Clock className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No upcoming services scheduled</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingServices.map((service) => (
                  <div
                    key={service.id}
                    className="bg-zinc-800/50 rounded-lg p-4 border border-green-500/20"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Wrench className="w-4 h-4 text-green-500" />
                          <h4 className="text-white font-semibold">
                            {service.service}
                          </h4>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {new Date(service.date).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )}
                          </span>
                          <Clock className="w-3 h-3 ml-2" />
                          <span>
                            {new Date(service.date).toLocaleTimeString(
                              "en-US",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          service.status === "CONFIRMED"
                            ? "bg-green-500/10 text-green-500"
                            : service.status === "PENDING"
                            ? "bg-yellow-500/10 text-yellow-500"
                            : "bg-green-500/10 text-green-500"
                        }`}
                      >
                        {service.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Modification History */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-500" />
              Modification History
              <span className="text-sm font-normal text-gray-400">
                ({pastModifications.length} past modifications)
              </span>
            </h3>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : pastModifications.length === 0 ? (
              <div className="bg-zinc-800/30 rounded-lg p-8 text-center">
                <Package className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No modification history yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pastModifications.map((mod) => (
                  <div
                    key={mod.id}
                    className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700 hover:border-orange-500/50 transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Package className="w-4 h-4 text-orange-500" />
                          <h4 className="text-white font-semibold">
                            {mod.service}
                          </h4>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {new Date(mod.date).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                          <Clock className="w-3 h-3 ml-2" />
                          <span>
                            {new Date(mod.date).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          mod.status === "COMPLETED"
                            ? "bg-blue-500/10 text-blue-500"
                            : mod.status === "CONFIRMED"
                            ? "bg-green-500/10 text-green-500"
                            : mod.status === "PENDING"
                            ? "bg-yellow-500/10 text-yellow-500"
                            : "bg-red-500/10 text-red-500"
                        }`}
                      >
                        {mod.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Modifications */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-500" />
              Upcoming Modifications
              <span className="text-sm font-normal text-gray-400">
                ({upcomingModifications.length} scheduled)
              </span>
            </h3>

            {upcomingModifications.length === 0 ? (
              <div className="bg-zinc-800/30 rounded-lg p-8 text-center">
                <Clock className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">
                  No upcoming modifications scheduled
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingModifications.map((mod) => (
                  <div
                    key={mod.id}
                    className="bg-zinc-800/50 rounded-lg p-4 border border-purple-500/20"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Package className="w-4 h-4 text-purple-500" />
                          <h4 className="text-white font-semibold">
                            {mod.service}
                          </h4>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {new Date(mod.date).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                          <Clock className="w-3 h-3 ml-2" />
                          <span>
                            {new Date(mod.date).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          mod.status === "CONFIRMED"
                            ? "bg-green-500/10 text-green-500"
                            : mod.status === "PENDING"
                            ? "bg-yellow-500/10 text-yellow-500"
                            : "bg-purple-500/10 text-purple-500"
                        }`}
                      >
                        {mod.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-zinc-800">
          <button
            onClick={onClose}
            className="w-full px-4 sm:px-6 py-2.5 sm:py-3 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-all font-semibold text-sm sm:text-base"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetailsModal;
