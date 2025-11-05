import { useState, useEffect } from 'react';
import { 
  Calendar, 
  User, 
  Car, 
  AlertCircle, 
  CircleDashed,
  Search,
  X,
  UserPlus
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import type { AdminService, Employee } from '@/types/admin';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [upcomingServices, setUpcomingServices] = useState<AdminService[]>([]);
  const [ongoingServices, setOngoingServices] = useState<AdminService[]>([]);
  const [unassignedServices, setUnassignedServices] = useState<AdminService[]>([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedService, setSelectedService] = useState<AdminService | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchEmployee, setSearchEmployee] = useState('');

  // Mock data - Replace with actual API calls
  // Note: This mock data is structured to match backend entities
  useEffect(() => {
    const mockUpcoming: AdminService[] = [
      {
        id: 1,
        vehicleBrand: 'Mercedes-Benz',
        vehicleModel: 'E-Class',
        vehicleYear: '2023',
        vehicleLicensePlate: 'WP-5678',
        serviceTypeName: 'Premium Detailing',
        serviceTypeDescription: 'Complete interior and exterior detailing',
        estimatedCost: 25000,
        estimatedDuration: 180,
        appointmentDate: '2025-10-28T09:00:00',
        status: 'CONFIRMED',
        displayStatus: 'upcoming',
        customerName: 'Sarah Johnson',
        customerEmail: 'sarah.j@email.com',
        assignedEmployeeName: 'Michael Roberts',
        assignedEmployeeId: 3,
        serviceCenter: 'DriveCare Colombo Center',
        centerSlot: 'Bay 2'
      },
      {
        id: 2,
        vehicleBrand: 'Audi',
        vehicleModel: 'Q7',
        vehicleYear: '2022',
        vehicleLicensePlate: 'CAA-9012',
        serviceTypeName: 'Engine Diagnostic',
        serviceTypeDescription: 'Complete engine system diagnostic check',
        estimatedCost: 15000,
        estimatedDuration: 120,
        appointmentDate: '2025-10-29T10:00:00',
        status: 'CONFIRMED',
        displayStatus: 'upcoming',
        customerName: 'Robert Williams',
        customerEmail: 'robert.w@email.com',
        assignedEmployeeName: 'David Chen',
        assignedEmployeeId: 4,
        serviceCenter: 'DriveCare Negombo Center',
        centerSlot: 'Bay 1'
      },
      {
        id: 3,
        vehicleBrand: 'Tesla',
        vehicleModel: 'Model 3',
        vehicleYear: '2024',
        vehicleLicensePlate: 'EP-3456',
        serviceTypeName: 'Software Update',
        serviceTypeDescription: 'Tesla system software update and diagnostics',
        estimatedCost: 5000,
        estimatedDuration: 60,
        appointmentDate: '2025-10-30T14:00:00',
        status: 'CONFIRMED',
        displayStatus: 'upcoming',
        customerName: 'Emily Davis',
        customerEmail: 'emily.d@email.com',
        assignedEmployeeName: 'Alex Kumar',
        assignedEmployeeId: 5,
        serviceCenter: 'DriveCare Colombo Center',
        centerSlot: 'Bay 5'
      }
    ];

    const mockOngoing: AdminService[] = [
      {
        id: 4,
        vehicleBrand: 'Toyota',
        vehicleModel: 'Camry',
        vehicleYear: '2020',
        vehicleLicensePlate: 'ABC-1234',
        serviceTypeName: 'Regular Maintenance',
        serviceTypeDescription: 'Oil change, filter replacement, general checkup',
        estimatedCost: 12000,
        estimatedDuration: 90,
        appointmentDate: '2025-10-24T08:00:00',
        status: 'CONFIRMED',
        displayStatus: 'ongoing',
        customerName: 'James Anderson',
        customerEmail: 'james.a@email.com',
        assignedEmployeeName: 'John Mechanic',
        assignedEmployeeId: 1,
        serviceCenter: 'DriveCare Negombo Center',
        centerSlot: 'Bay 3',
        progress: 65,
        ongoingStatus: 'IN_PROGRESS'
      },
      {
        id: 5,
        vehicleBrand: 'BMW',
        vehicleModel: 'X5',
        vehicleYear: '2021',
        vehicleLicensePlate: 'LMN-9012',
        serviceTypeName: 'Transmission Repair',
        serviceTypeDescription: 'Transmission system repair and replacement',
        estimatedCost: 85000,
        estimatedDuration: 480,
        appointmentDate: '2025-10-23T09:00:00',
        status: 'CONFIRMED',
        displayStatus: 'ongoing',
        customerName: 'Michael Brown',
        customerEmail: 'michael.b@email.com',
        assignedEmployeeName: 'Sarah Engineer',
        assignedEmployeeId: 2,
        serviceCenter: 'DriveCare Colombo Center',
        centerSlot: 'Bay 4',
        progress: 40,
        ongoingStatus: 'AWAITING_PARTS'
      },
      {
        id: 6,
        vehicleBrand: 'Honda',
        vehicleModel: 'Accord',
        vehicleYear: '2019',
        vehicleLicensePlate: 'XYZ-7890',
        serviceTypeName: 'Brake System Overhaul',
        serviceTypeDescription: 'Complete brake system inspection and replacement',
        estimatedCost: 35000,
        estimatedDuration: 240,
        appointmentDate: '2025-10-25T07:00:00',
        status: 'CONFIRMED',
        displayStatus: 'ongoing',
        customerName: 'Lisa Martinez',
        customerEmail: 'lisa.m@email.com',
        assignedEmployeeName: 'Tom Wilson',
        assignedEmployeeId: 6,
        serviceCenter: 'DriveCare Negombo Center',
        centerSlot: 'Bay 2',
        progress: 85,
        ongoingStatus: 'QUALITY_CHECK'
      }
    ];

    const mockUnassigned: AdminService[] = [
      {
        id: 7,
        vehicleBrand: 'Ford',
        vehicleModel: 'Mustang',
        vehicleYear: '2022',
        vehicleLicensePlate: 'DEF-4567',
        serviceTypeName: 'Custom Modification',
        serviceTypeDescription: 'Custom performance and aesthetic modifications',
        estimatedCost: 150000,
        estimatedDuration: 720,
        appointmentDate: '2025-10-26T10:00:00',
        status: 'PENDING',
        displayStatus: 'unassigned',
        customerName: 'Kevin Taylor',
        customerEmail: 'kevin.t@email.com',
        serviceCenter: 'DriveCare Colombo Center',
        centerSlot: 'Bay 6'
      },
      {
        id: 8,
        vehicleBrand: 'Nissan',
        vehicleModel: 'Leaf',
        vehicleYear: '2023',
        vehicleLicensePlate: 'GHI-7891',
        serviceTypeName: 'Battery Check & Service',
        serviceTypeDescription: 'EV battery health check and maintenance',
        estimatedCost: 8000,
        estimatedDuration: 90,
        appointmentDate: '2025-10-27T11:00:00',
        status: 'PENDING',
        displayStatus: 'unassigned',
        customerName: 'Amanda White',
        customerEmail: 'amanda.w@email.com',
        serviceCenter: 'DriveCare Negombo Center',
        centerSlot: 'Bay 7'
      },
      {
        id: 9,
        vehicleBrand: 'Porsche',
        vehicleModel: '911',
        vehicleYear: '2021',
        vehicleLicensePlate: 'JKL-2345',
        serviceTypeName: 'Performance Tune',
        serviceTypeDescription: 'High-performance tuning and optimization',
        estimatedCost: 95000,
        estimatedDuration: 360,
        appointmentDate: '2025-10-28T13:00:00',
        status: 'PENDING',
        displayStatus: 'unassigned',
        customerName: 'Daniel Garcia',
        customerEmail: 'daniel.g@email.com',
        serviceCenter: 'DriveCare Colombo Center',
        centerSlot: 'Bay 8'
      }
    ];

    const mockEmployees: Employee[] = [
      {
        id: 1,
        name: 'John Mechanic',
        email: 'john.m@drivecare.com',
        specialization: 'General Maintenance',
        availability: 'busy',
        currentWorkload: 2,
        rating: 4.8,
        phoneNumber: '0771234567'
      },
      {
        id: 2,
        name: 'Sarah Engineer',
        email: 'sarah.e@drivecare.com',
        specialization: 'Engine & Transmission',
        availability: 'busy',
        currentWorkload: 1,
        rating: 4.9,
        phoneNumber: '0772345678'
      },
      {
        id: 3,
        name: 'Michael Roberts',
        email: 'michael.r@drivecare.com',
        specialization: 'Detailing & Aesthetics',
        availability: 'available',
        currentWorkload: 1,
        rating: 4.7,
        phoneNumber: '0773456789'
      },
      {
        id: 4,
        name: 'David Chen',
        email: 'david.c@drivecare.com',
        specialization: 'Diagnostics',
        availability: 'available',
        currentWorkload: 1,
        rating: 4.9,
        phoneNumber: '0774567890'
      },
      {
        id: 5,
        name: 'Alex Kumar',
        email: 'alex.k@drivecare.com',
        specialization: 'Electric Vehicles',
        availability: 'available',
        currentWorkload: 1,
        rating: 5.0,
        phoneNumber: '0775678901'
      },
      {
        id: 6,
        name: 'Tom Wilson',
        email: 'tom.w@drivecare.com',
        specialization: 'Brake Systems',
        availability: 'busy',
        currentWorkload: 1,
        rating: 4.6,
        phoneNumber: '0776789012'
      },
      {
        id: 7,
        name: 'Emma Rodriguez',
        email: 'emma.r@drivecare.com',
        specialization: 'Custom Modifications',
        availability: 'available',
        currentWorkload: 0,
        rating: 4.8,
        phoneNumber: '0777890123'
      },
      {
        id: 8,
        name: 'Chris Anderson',
        email: 'chris.a@drivecare.com',
        specialization: 'Performance Tuning',
        availability: 'available',
        currentWorkload: 0,
        rating: 4.9,
        phoneNumber: '0778901234'
      }
    ];

    setUpcomingServices(mockUpcoming);
    setOngoingServices(mockOngoing);
    setUnassignedServices(mockUnassigned);
    setEmployees(mockEmployees);
  }, []);

  useEffect(() => {
    // Inject custom scrollbar styles
    const existingStyle = document.getElementById("admin-dashboard-scrollbar-style");
    if (!existingStyle) {
      const style = document.createElement("style");
      style.id = "admin-dashboard-scrollbar-style";
      style.innerHTML = `
        .custom-scrollbar::-webkit-scrollbar {
          width: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: linear-gradient(180deg, #1f1f23 0%, #27272a 50%, #1f1f23 100%);
          border-radius: 6px;
          margin: 2px;
          border: 1px solid #3f3f46;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #52525b 0%, #71717a 50%, #52525b 100%);
          border-radius: 6px;
          border: 1px solid #3f3f46;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #71717a 0%, #9ca3af 50%, #71717a 100%);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }
        .custom-scrollbar::-webkit-scrollbar-corner {
          background: #1f1f23;
        }
      `;
      document.head.appendChild(style);
    }

    // Cleanup function to remove styles when component unmounts
    return () => {
      const styleElement = document.getElementById("admin-dashboard-scrollbar-style");
      if (styleElement) {
        styleElement.remove();
      }
    };
  }, []);

  const getOngoingStatusBadge = (status?: string) => {
    switch(status) {
      case 'IN_PROGRESS':
        return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 rounded-full text-xs font-semibold">IN PROGRESS</span>;
      case 'AWAITING_PARTS':
        return <span className="px-2 py-1 bg-blue-500/20 text-blue-500 border border-blue-500/30 rounded-full text-xs font-semibold">AWAITING PARTS</span>;
      case 'QUALITY_CHECK':
        return <span className="px-2 py-1 bg-purple-500/20 text-purple-500 border border-purple-500/30 rounded-full text-xs font-semibold">QUALITY CHECK</span>;
      default:
        return null;
    }
  };

  // Helper function to format vehicle display name
  const getVehicleDisplayName = (service: AdminService) => {
    return `${service.vehicleBrand} ${service.vehicleModel} ${service.vehicleYear}`;
  };

  // Helper function to format date for display
  const formatDisplayDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleAssignEmployee = (service: AdminService) => {
    setSelectedService(service);
    setShowAssignModal(true);
  };

  const assignEmployeeToService = (employee: Employee) => {
    if (selectedService) {
      // Update the service with assigned employee
      const updatedService: AdminService = {
        ...selectedService,
        assignedEmployeeId: employee.id,
        assignedEmployeeName: employee.name,
        status: 'CONFIRMED',
        displayStatus: 'upcoming'
      };
      
      setUnassignedServices(prev => prev.filter(s => s.id !== selectedService.id));
      setUpcomingServices(prev => [...prev, updatedService]);
      setShowAssignModal(false);
      setSelectedService(null);
      setSearchEmployee('');
    }
  };

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchEmployee.toLowerCase()) ||
    emp.specialization.toLowerCase().includes(searchEmployee.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-gradient-to-r from-black to-zinc-950 text-white shadow-lg border-b border-zinc-700 mt-0">
        <div className="max-w-7xl mx-auto px-0 pt-26 pb-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-gray-400 mt-2">
                Welcome back, {user?.firstName} {user?.lastName}!
              </p>
            </div>
            <div className="flex items-center gap-3 bg-zinc-800/50 px-4 py-2 rounded-lg border border-zinc-700">
              <Calendar className="w-5 h-5 text-gray-400" />
              <span className="font-semibold text-white">{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-0 sm:px-6 lg:px-0 py-8">
        {/* Awaiting Assignment Section - Full Width */}
        <div className="mb-8">
          <div className="bg-zinc-900 rounded-lg shadow-md p-6 border border-zinc-800">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                Awaiting Assignment
              </h2>
              <span className="px-3 py-1 bg-red-500/20 text-red-500 rounded-full text-sm font-bold border border-red-500/30 animate-pulse">
                {unassignedServices.length}
              </span>
            </div>

            {unassignedServices.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No services awaiting assignment</p>
                <p className="text-gray-500 text-sm mt-2">All services have been assigned to employees</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {unassignedServices.map(service => (
                  <div
                    key={service.id}
                    className="bg-zinc-800 rounded-lg border border-zinc-700 p-5 hover:border-red-500/50 transition-all duration-200 hover:shadow-lg"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                          <Car className="w-5 h-5 text-red-500" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white text-sm leading-tight">
                            {getVehicleDisplayName(service)}
                          </h3>
                          <p className="text-xs text-gray-400 mt-1">{service.vehicleLicensePlate}</p>
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-red-500/20 text-red-500 border border-red-500/30 rounded-full text-xs font-semibold">
                        PENDING
                      </span>
                    </div>

                    {/* Service Info */}
                    <div className="space-y-3 mb-4">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Service Type</p>
                        <p className="text-sm text-white font-medium">{service.serviceTypeName}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Customer</p>
                          <p className="text-sm text-white">{service.customerName}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Center</p>
                          <p className="text-sm text-white">{service.serviceCenter}</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Scheduled Date</p>
                        <p className="text-sm text-white">{formatDisplayDate(service.appointmentDate)}</p>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => handleAssignEmployee(service)}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 text-sm"
                    >
                      <UserPlus className="w-4 h-4" />
                      Assign Employee
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Dashboard Grid - 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Upcoming Services Section */}
          <div className="bg-zinc-900 rounded-lg shadow-md p-6 border border-zinc-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-orange-600" />
                Upcoming Services
              </h2>
              <span className="px-3 py-1 bg-orange-500/20 text-orange-500 rounded-full text-sm font-bold border border-orange-500/30">
                {upcomingServices.length}
              </span>
            </div>

            <div 
              className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#71717a #27272a'
              }}
            >
              {upcomingServices.map(service => (
                <div
                  key={service.id}
                  className="p-4 mr-1 rounded-lg border-2 border-zinc-800 bg-zinc-800 hover:border-orange-600/50 transition cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Car className="w-4 h-4 text-orange-600" />
                      <p className="font-semibold text-white text-sm">{getVehicleDisplayName(service)}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mb-1">{service.vehicleLicensePlate}</p>
                  <p className="text-xs text-gray-400 mb-2">{service.serviceTypeName}</p>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-3 h-3 text-gray-400" />
                    <p className="text-xs text-gray-400">Customer: {service.customerName}</p>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-3 h-3 text-gray-400" />
                    <p className="text-xs text-gray-400">Scheduled: {formatDisplayDate(service.appointmentDate)}</p>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <User className="w-3 h-3 text-chart-2" />
                    <p className="text-xs text-chart-2 font-semibold">{service.assignedEmployeeName}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-zinc-700">
                    <span className="text-xs text-gray-400">{service.centerSlot}</span>
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-500 border border-blue-500/30 rounded-full text-xs font-semibold">
                      SCHEDULED
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ongoing Services Section */}
          <div className="bg-zinc-900 rounded-lg shadow-md p-6 border border-zinc-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <CircleDashed className="w-5 h-5 text-yellow-500" />
                Ongoing Services
              </h2>
              <span className="px-3 py-1 bg-yellow-500/20 text-yellow-500 rounded-full text-sm font-bold border border-yellow-500/30">
                {ongoingServices.length}
              </span>
            </div>

            <div 
              className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#71717a #27272a'
              }}
            >
              {ongoingServices.map(service => (
                <div
                  key={service.id}
                  className="p-4 mr-1 rounded-lg border-2 border-zinc-800 bg-zinc-800 hover:border-yellow-500/50 transition cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Car className="w-4 h-4 text-yellow-500" />
                      <p className="font-semibold text-white text-sm">{getVehicleDisplayName(service)}</p>
                    </div>
                    {getOngoingStatusBadge(service.ongoingStatus)}
                  </div>
                  <p className="text-xs text-gray-400 mb-1">{service.vehicleLicensePlate}</p>
                  <p className="text-xs text-gray-400 mb-2">{service.serviceTypeName}</p>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-3 h-3 text-gray-400" />
                    <p className="text-xs text-gray-400">Customer: {service.customerName}</p>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-400">Progress</span>
                      <span className="text-xs font-semibold text-white">{service.progress}%</span>
                    </div>
                    <div className="w-full bg-zinc-700 rounded-full h-2">
                      <div 
                        className="bg-yellow-500 h-2 rounded-full transition-all"
                        style={{ width: `${service.progress}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-3 h-3 text-chart-2" />
                    <p className="text-xs text-chart-2 font-semibold">{service.assignedEmployeeName}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-zinc-700">
                    <span className="text-xs text-gray-400">{service.centerSlot}</span>
                    <span className="text-xs text-gray-400">Est: {service.estimatedDuration} min</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Employee Assignment Modal */}
      {showAssignModal && selectedService && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden border border-zinc-800">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-zinc-800 to-zinc-700 text-white p-6 border-b border-zinc-700 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-2">Assign Employee</h3>
                <p className="text-sm text-gray-400">
                  {getVehicleDisplayName(selectedService)} - {selectedService.serviceTypeName}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedService(null);
                  setSearchEmployee('');
                }}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Search Bar */}
            <div className="p-6 border-b border-zinc-800">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name or specialization..."
                  value={searchEmployee}
                  onChange={(e) => setSearchEmployee(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            {/* Employee List */}
            <div 
              className="p-6 space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#71717a #27272a'
              }}
            >
              {filteredEmployees.map(employee => (
                <div
                  key={employee.id}
                  className={`p-4 rounded-lg border-2 transition ${
                    employee.availability === 'available'
                      ? 'border-zinc-700 bg-zinc-800 hover:border-orange-500'
                      : 'border-zinc-700 bg-zinc-800/50 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">{employee.name}</p>
                          <p className="text-xs text-gray-400">{employee.specialization}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 ml-13">
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-400">Workload:</span>
                          <span className="text-xs font-semibold text-white">{employee.currentWorkload} tasks</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-400">Rating:</span>
                          <span className="text-xs font-semibold text-yellow-500">★ {employee.rating}</span>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          employee.availability === 'available'
                            ? 'bg-green-500/20 text-green-500 border border-green-500/30'
                            : 'bg-red-500/20 text-red-500 border border-red-500/30'
                        }`}>
                          {employee.availability.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => assignEmployeeToService(employee)}
                      disabled={employee.availability === 'busy'}
                      className={`px-4 py-2 rounded-lg font-semibold transition text-sm ${
                        employee.availability === 'available'
                          ? 'bg-orange-500 text-white hover:bg-orange-600 cursor-pointer'
                          : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      Assign
                    </button>
                  </div>
                </div>
              ))}

              {filteredEmployees.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-400">No employees found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;