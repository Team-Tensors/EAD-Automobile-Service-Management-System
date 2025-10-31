import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { MapPin, Clock, Car, Calendar, User, Filter, Download, ChevronRight, CheckCircle, CircleDashed } from 'lucide-react';
import AuthenticatedNavbar from '@/components/Navbar/AuthenticatedNavbar';
import Footer from "@/components/Footer/Footer";

// TypeScript Interfaces
interface Service {
  id: number;
  vehicleName: string;
  vehicleNumber: string;
  serviceType: string;
  status: "completed" | "not_completed";
  startDate: string;
  estimatedCompletion: string;
  assignedEmployee: string;
  serviceCenter: string;
  centerSlot: string;
}

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showMap, setShowMap] = useState<boolean>(false);
  
  // Mock data - Replace with actual API calls
  useEffect(() => {
    const mockServices: Service[] = [
      {
        id: 1,
        vehicleName: "Toyota Camry 2020",
        vehicleNumber: "ABC-1234",
        serviceType: "Regular Maintenance",
        status: "not_completed",
        startDate: "2025-10-15",
        estimatedCompletion: "2025-10-20",
        assignedEmployee: "John Mechanic",
        serviceCenter: "DriveCare Negombo Center",
        centerSlot: "Bay 3",
      },
      {
        id: 2,
        vehicleName: "Honda Civic 2019",
        vehicleNumber: "XYZ-5678",
        serviceType: "Custom Modification",
        status: "not_completed",
        startDate: "2025-10-22",
        estimatedCompletion: "2025-11-05",
        assignedEmployee: "Not Assigned",
        serviceCenter: "DriveCare Colombo Center",
        centerSlot: "Bay 1",
      },
      {
        id: 3,
        vehicleName: "BMW X5 2021",
        vehicleNumber: "LMN-9012",
        serviceType: "Accident Repair",
        status: "completed",
        startDate: "2025-10-01",
        estimatedCompletion: "2025-10-12",
        assignedEmployee: "Sarah Engineer",
        serviceCenter: "DriveCare Negombo Center",
        centerSlot: "Bay 5",
      },
    ];
    setServices(mockServices);
    setSelectedService(mockServices[0]);
  }, []);

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "completed":
        return "bg-green-900/20 text-green-400 border-green-900/30";
      case "not_completed":
        return "bg-orange-900/20 text-orange-400 border-orange-900/30";
      default:
        return "bg-zinc-800 text-gray-400 border-zinc-700";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case "not_completed":
        return <CircleDashed className="w-5 h-5 text-orange-400" />;
      default:
        return null;
    }
  };

  const filteredServices =
    filterStatus === "all"
      ? services
      : services.filter((s) => s.status === filterStatus);

  return (
    <div className="min-h-screen bg-black pt-12">
      {/* Authenticated Navbar */}
      <AuthenticatedNavbar />

      {/* Welcome Section */}
      <div className="bg-black border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-white mb-2">Customer Dashboard</h1>
          <p className="text-gray-400">
            Welcome back, {user?.fullName || `${user?.firstName} ${user?.lastName}`}!
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Services List */}
          <div className="lg:col-span-1">
            <div className="bg-zinc-900/80 backdrop-blur-sm rounded-lg p-4 border border-zinc-800">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">
                  My Services
                </h2>
                <Filter className="w-5 h-5 text-gray-400" />
              </div>

              {/* Filter Buttons */}
              <div className="flex gap-2 mb-4 flex-wrap">
                {["all", "not_completed", "completed"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition border ${
                      filterStatus === status
                        ? "bg-orange-500 text-white border-orange-500"
                        : "bg-zinc-800 text-gray-400 border-zinc-700 hover:bg-zinc-700"
                    }`}
                  >
                    {status === "all"
                      ? "ALL"
                      : status === "not_completed"
                      ? "NOT COMPLETED"
                      : "COMPLETED"}
                  </button>
                ))}
              </div>

              {/* Service Cards */}
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {filteredServices.map((service) => (
                  <div
                    key={service.id}
                    onClick={() => setSelectedService(service)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                      selectedService?.id === service.id
                        ? "border-orange-500 bg-zinc-900"
                        : "border-zinc-800 hover:border-orange-500/50 bg-zinc-900/50"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Car className="w-4 h-4 text-gray-400" />
                          <p className="font-semibold text-white">
                            {service.vehicleName}
                          </p>
                        </div>
                        <p className="text-sm text-gray-400 mb-2">
                          {service.vehicleNumber}
                        </p>
                        <p className="text-xs text-gray-500 mb-2">
                          {service.serviceType}
                        </p>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                            service.status
                          )}`}
                        >
                          {getStatusIcon(service.status)}
                          {service.status.replace("_", " ").toUpperCase()}
                        </span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Service Details */}
          {selectedService && (
            <div className="lg:col-span-2 space-y-6">
              {/* Main Info Card */}
              <div className="bg-zinc-900/80 backdrop-blur-sm rounded-lg p-6 border border-zinc-800">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {selectedService.vehicleName}
                    </h2>
                    <p className="text-gray-400">
                      {selectedService.serviceType}
                    </p>
                  </div>
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(
                      selectedService.status
                    )}`}
                  >
                    {selectedService.status === "completed"
                      ? "COMPLETED"
                      : "NOT COMPLETED"}
                  </span>
                </div>

                {/* Service Information Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-black/40 rounded-lg border border-zinc-800">
                    <MapPin className="w-5 h-5 text-orange-500" />
                    <div>
                      <p className="text-xs text-gray-400">
                        Service Center
                      </p>
                      <p className="font-semibold text-white">
                        {selectedService.serviceCenter}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-black/40 rounded-lg border border-zinc-800">
                    <Car className="w-5 h-5 text-orange-500" />
                    <div>
                      <p className="text-xs text-gray-400">
                        Center Slot
                      </p>
                      <p className="font-semibold text-white">
                        {selectedService.centerSlot}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-black/40 rounded-lg border border-zinc-800">
                    <Calendar className="w-5 h-5 text-orange-500" />
                    <div>
                      <p className="text-xs text-gray-400">
                        Start Date
                      </p>
                      <p className="font-semibold text-white">
                        {selectedService.startDate}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-black/40 rounded-lg border border-zinc-800">
                    <Clock className="w-5 h-5 text-orange-500" />
                    <div>
                      <p className="text-xs text-gray-400">
                        Est. Completion
                      </p>
                      <p className="font-semibold text-white">
                        {selectedService.estimatedCompletion}
                      </p>
                    </div>
                  </div>
                  <div className="col-span-2 flex items-center gap-3 p-3 bg-black/40 rounded-lg border border-zinc-800">
                    <User className="w-5 h-5 text-orange-500" />
                    <div>
                      <p className="text-xs text-gray-400">
                        Assigned Employee
                      </p>
                      <p className="font-semibold text-white">
                        {selectedService.assignedEmployee}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowMap(!showMap)}
                    className="flex-1 bg-orange-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-600 transition flex items-center justify-center gap-2"
                  >
                    <MapPin className="w-4 h-4" />
                    {showMap ? "Hide" : "Show"} Location
                  </button>
                  <button className="flex-1 bg-zinc-800 text-white px-4 py-2 rounded-lg font-semibold hover:bg-zinc-700 transition flex items-center justify-center gap-2 border border-zinc-700">
                    <Download className="w-4 h-4" />
                    Download Report
                  </button>
                </div>
              </div>

              {/* Map */}
              {showMap && (
                <div className="bg-zinc-900/80 backdrop-blur-sm rounded-lg p-6 border border-zinc-800">
                  <h3 className="text-lg font-bold text-white mb-4">
                    Service Center Location
                  </h3>
                  <div className="bg-black/40 rounded-lg h-64 flex items-center justify-center border border-zinc-800">
                    <div className="text-center">
                      <MapPin className="w-12 h-12 text-orange-500 mx-auto mb-2" />
                      <p className="text-gray-400">
                        Map integration with Google Maps / Leaflet
                      </p>
                      <p className="text-sm text-gray-400 mt-2">
                        {selectedService.serviceCenter}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CustomerDashboard;