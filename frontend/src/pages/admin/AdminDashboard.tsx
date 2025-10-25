import { useState, useEffect } from 'react';
import { 
  Calendar, 
  User, 
  Car, 
  AlertCircle, 
  CircleDashed,
  MapPin,
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
    <>
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-lg border-b border-border mt-16">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-primary-foreground/80 mt-1">
                Welcome back, {user?.firstName} {user?.lastName}!
              </p>
            </div>
            <div className="flex items-center gap-3 bg-primary-foreground/10 px-4 py-2 rounded-lg border border-primary-foreground/20">
              <Calendar className="w-5 h-5" />
              <span className="font-semibold">October 25, 2025</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            
            {/* Upcoming Services Section */}
            <div className="bg-card rounded-lg shadow-md p-6 border border-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-card-foreground flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-orange-500" />
                  Upcoming Services
                </h2>
                <span className="px-3 py-1 bg-orange-500/20 text-orange-500 rounded-full text-sm font-bold border border-orange-500/30">
                  {upcomingServices.length}
                </span>
              </div>

              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {upcomingServices.map(service => (
                  <div
                    key={service.id}
                    className="p-4 rounded-lg border-2 border-border bg-secondary hover:border-orange-500/50 transition cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Car className="w-4 h-4 text-orange-500" />
                        <p className="font-semibold text-card-foreground text-sm">{getVehicleDisplayName(service)}</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">{service.vehicleLicensePlate}</p>
                    <p className="text-xs text-muted-foreground mb-2">{service.serviceTypeName}</p>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-3 h-3 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Customer: {service.customerName}</p>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-3 h-3 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Scheduled: {formatDisplayDate(service.appointmentDate)}</p>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <User className="w-3 h-3 text-chart-2" />
                      <p className="text-xs text-chart-2 font-semibold">{service.assignedEmployeeName}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <span className="text-xs text-muted-foreground">{service.centerSlot}</span>
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-500 border border-blue-500/30 rounded-full text-xs font-semibold">
                        SCHEDULED
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ongoing Services Section */}
            <div className="bg-card rounded-lg shadow-md p-6 border border-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-card-foreground flex items-center gap-2">
                  <CircleDashed className="w-5 h-5 text-yellow-500" />
                  Ongoing Services
                </h2>
                <span className="px-3 py-1 bg-yellow-500/20 text-yellow-500 rounded-full text-sm font-bold border border-yellow-500/30">
                  {ongoingServices.length}
                </span>
              </div>

              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {ongoingServices.map(service => (
                  <div
                    key={service.id}
                    className="p-4 rounded-lg border-2 border-border bg-secondary hover:border-yellow-500/50 transition cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Car className="w-4 h-4 text-yellow-500" />
                        <p className="font-semibold text-card-foreground text-sm">{getVehicleDisplayName(service)}</p>
                      </div>
                      {getOngoingStatusBadge(service.ongoingStatus)}
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">{service.vehicleLicensePlate}</p>
                    <p className="text-xs text-muted-foreground mb-2">{service.serviceTypeName}</p>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-3 h-3 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Customer: {service.customerName}</p>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground">Progress</span>
                        <span className="text-xs font-semibold text-card-foreground">{service.progress}%</span>
                      </div>
                      <div className="w-full bg-border rounded-full h-2">
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

                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <span className="text-xs text-muted-foreground">{service.centerSlot}</span>
                      <span className="text-xs text-muted-foreground">Est: {service.estimatedDuration} min</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Unassigned Services Section */}
            <div className="rounded-lg shadow-md p-6 border-2 border-red-500/30 bg-red-500/5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-card-foreground flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  Awaiting Assignment
                </h2>
                <span className="px-3 py-1 bg-red-500/20 text-red-500 rounded-full text-sm font-bold border border-red-500/30 animate-pulse">
                  {unassignedServices.length}
                </span>
              </div>

              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {unassignedServices.map(service => (
                  <div
                    key={service.id}
                    className="p-4 rounded-lg border-2 border-red-500/30 bg-card hover:border-red-500 transition"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Car className="w-4 h-4 text-red-500" />
                        <p className="font-semibold text-card-foreground text-sm">{getVehicleDisplayName(service)}</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">{service.vehicleLicensePlate}</p>
                    <p className="text-xs text-muted-foreground mb-2">{service.serviceTypeName}</p>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-3 h-3 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Customer: {service.customerName}</p>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-3 h-3 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Scheduled: {formatDisplayDate(service.appointmentDate)}</p>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <MapPin className="w-3 h-3 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">{service.serviceCenter}</p>
                    </div>

                    <button
                      onClick={() => handleAssignEmployee(service)}
                      className="w-full bg-orange-500 text-white px-3 py-2 rounded-lg font-semibold hover:bg-orange-600 transition text-sm flex items-center justify-center gap-2"
                    >
                      <UserPlus className="w-4 h-4" />
                      Assign Employee
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      {/* Employee Assignment Modal */}
      {showAssignModal && selectedService && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden border border-border">
            {/* Modal Header */}
            <div className="bg-primary text-primary-foreground p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Assign Employee</h3>
                  <p className="text-sm text-primary-foreground/80">
                    {getVehicleDisplayName(selectedService)} - {selectedService.serviceTypeName}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedService(null);
                    setSearchEmployee('');
                  }}
                  className="text-primary-foreground hover:bg-primary-foreground/20 p-2 rounded-lg transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="p-6 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name or specialization..."
                  value={searchEmployee}
                  onChange={(e) => setSearchEmployee(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-secondary border border-border rounded-lg text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            {/* Employee List */}
            <div className="p-6 space-y-3 max-h-[400px] overflow-y-auto">
              {filteredEmployees.map(employee => (
                <div
                  key={employee.id}
                  className={`p-4 rounded-lg border-2 transition ${
                    employee.availability === 'available'
                      ? 'border-border bg-secondary hover:border-orange-500 cursor-pointer'
                      : 'border-border bg-secondary/50 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-card-foreground">{employee.name}</p>
                          <p className="text-xs text-muted-foreground">{employee.specialization}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 ml-13">
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-muted-foreground">Workload:</span>
                          <span className="text-xs font-semibold text-card-foreground">{employee.currentWorkload} tasks</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-muted-foreground">Rating:</span>
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
                          ? 'bg-orange-500 text-white hover:bg-orange-600'
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
                  <p className="text-muted-foreground">No employees found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminDashboard;