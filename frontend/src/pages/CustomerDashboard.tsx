import { useState, useEffect } from "react";
import {
  MapPin,
  Clock,
  Car,
  Calendar,
  User,
  Filter,
  Download,
  ChevronRight,
  CheckCircle,
  CircleDashed,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { Link } from "react-router-dom";

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
  const { user, logout } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showMap, setShowMap] = useState<boolean>(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

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
        return "bg-chart-2/20 text-chart-2 border-chart-2/30";
      case "not_completed":
        return "bg-chart-4/20 text-chart-4 border-chart-4/30";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-chart-2" />;
      case "not_completed":
        return <CircleDashed className="w-5 h-5 text-chart-4" />;
      default:
        return null;
    }
  };

  const filteredServices =
    filterStatus === "all"
      ? services
      : services.filter((s) => s.status === filterStatus);

  return (
    <div className="min-h-screen bg-background">
      {/* Welcome Header */}
      <header className="bg-primary text-primary-foreground shadow-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Customer Dashboard</h1>
              <p className="text-primary-foreground/80 mt-1">
                Welcome back, {user?.firstName} {user?.lastName}!
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleLogout}
                className="bg-destructive text-destructive-foreground px-4 py-2 rounded-lg font-semibold hover:bg-destructive/90 transition border border-border"
              >
                Logout
              </button>
              <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center border border-border">
                <User className="w-6 h-6 text-accent-foreground" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Book Appointment Button */}
        <div className="mb-6 flex gap-4">
          <Link
            to="/customer/appointments"
            className="bg-card text-black px-6 py-3 rounded-lg font-semibold hover:bg-chart-1/90 transition border border-border shadow-md"
          >
            Book Appointment
          </Link>
          <Link
            to="/service-centers"
            className="bg-card text-black px-6 py-3 rounded-lg font-semibold hover:bg-chart-1/90 transition border border-border shadow-md flex items-center gap-2"
          >
            <MapPin className="w-4 h-4" />
            Find Service Centers
          </Link>
          <Link
            to="/vehicles"
            className="bg-card text-black px-6 py-3 rounded-lg font-semibold hover:bg-chart-1/90 transition border border-border shadow-md flex items-center gap-2"
          >
            My Vehicles
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Services List */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-lg shadow-md p-4 border border-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-card-foreground">
                  My Services
                </h2>
                <Filter className="w-5 h-5 text-muted-foreground" />
              </div>

              {/* Filter Buttons */}
              <div className="flex gap-2 mb-4 flex-wrap">
                {["all", "not_completed", "completed"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition border ${
                      filterStatus === status
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-secondary text-secondary-foreground border-border hover:bg-accent"
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
                        ? "border-primary bg-accent/50"
                        : "border-border hover:border-primary/50 bg-card"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Car className="w-4 h-4 text-muted-foreground" />
                          <p className="font-semibold text-card-foreground">
                            {service.vehicleName}
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {service.vehicleNumber}
                        </p>
                        <p className="text-xs text-muted-foreground mb-2">
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
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
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
              <div className="bg-card rounded-lg shadow-md p-6 border border-border">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-card-foreground mb-2">
                      {selectedService.vehicleName}
                    </h2>
                    <p className="text-muted-foreground">
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
                  <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg border border-border">
                    <MapPin className="w-5 h-5 text-chart-1" />
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Service Center
                      </p>
                      <p className="font-semibold text-card-foreground">
                        {selectedService.serviceCenter}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg border border-border">
                    <Car className="w-5 h-5 text-chart-1" />
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Center Slot
                      </p>
                      <p className="font-semibold text-card-foreground">
                        {selectedService.centerSlot}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg border border-border">
                    <Calendar className="w-5 h-5 text-chart-1" />
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Start Date
                      </p>
                      <p className="font-semibold text-card-foreground">
                        {selectedService.startDate}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg border border-border">
                    <Clock className="w-5 h-5 text-chart-1" />
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Est. Completion
                      </p>
                      <p className="font-semibold text-card-foreground">
                        {selectedService.estimatedCompletion}
                      </p>
                    </div>
                  </div>
                  <div className="col-span-2 flex items-center gap-3 p-3 bg-secondary rounded-lg border border-border">
                    <User className="w-5 h-5 text-chart-1" />
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Assigned Employee
                      </p>
                      <p className="font-semibold text-card-foreground">
                        {selectedService.assignedEmployee}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowMap(!showMap)}
                    className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-semibold hover:bg-primary/90 transition flex items-center justify-center gap-2 border border-border"
                  >
                    <MapPin className="w-4 h-4" />
                    {showMap ? "Hide" : "Show"} Location
                  </button>
                  <button className="flex-1 bg-secondary text-secondary-foreground px-4 py-2 rounded-lg font-semibold hover:bg-accent transition flex items-center justify-center gap-2 border border-border">
                    <Download className="w-4 h-4" />
                    Download Report
                  </button>
                </div>
              </div>

              {/* Map */}
              {showMap && (
                <div className="bg-card rounded-lg shadow-md p-6 border border-border">
                  <h3 className="text-lg font-bold text-card-foreground mb-4">
                    Service Center Location
                  </h3>
                  <div className="bg-secondary rounded-lg h-64 flex items-center justify-center border border-border">
                    <div className="text-center">
                      <MapPin className="w-12 h-12 text-chart-1 mx-auto mb-2" />
                      <p className="text-muted-foreground">
                        Map integration with Google Maps / Leaflet
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
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
    </div>
  );
};

export default CustomerDashboard;
