import { useState, useEffect, useRef } from 'react';
import { 
  Calendar, 
  User, 
  Car, 
  AlertCircle, 
  CircleDashed,
  Search,
  X,
  UserPlus,
  Loader,
  CheckCircle,
  XCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import type { AdminService, Employee } from '@/types/admin';
import { getUpcomingAppointments, getOngoingAppointments, getUnassignedAppointments, getAllEmployees, assignEmployeeToAppointment } from '../../services/adminService';
import { UnassignedSectionSkeleton, AppointmentListSkeleton } from '../../components/AdminDashboard/SkeletonLoaders';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [upcomingAppointments, setUpcomingAppointments] = useState<AdminService[]>([]);
  const [ongoingAppointments, setOngoingAppointments] = useState<AdminService[]>([]);
  const [unassignedAppointments, setUnassignedAppointments] = useState<AdminService[]>([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedService, setSelectedService] = useState<AdminService | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchEmployee, setSearchEmployee] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Ref to track if data has been fetched (prevents double fetch in React Strict Mode)
  const hasFetchedData = useRef(false);

  // Fetch all data on component mount
  useEffect(() => {
    // Prevent double fetching in React Strict Mode (development)
    if (hasFetchedData.current) {
      console.log('AdminDashboard: Data already fetched, skipping duplicate request');
      return;
    }
    
    console.log('AdminDashboard: Fetching dashboard data...');
    hasFetchedData.current = true;
    
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);
        
        const [upcoming, ongoing, unassigned, employeeList] = await Promise.all([
          getUpcomingAppointments(),
          getOngoingAppointments(),
          getUnassignedAppointments(),
          getAllEmployees()
        ]);
        
        console.log('AdminDashboard: Data fetched successfully', {
          upcoming: upcoming.length,
          ongoing: ongoing.length,
          unassigned: unassigned.length,
          employees: employeeList.length
        });
        
        setUpcomingAppointments(upcoming);
        setOngoingAppointments(ongoing);
        setUnassignedAppointments(unassigned);
        setEmployees(employeeList);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setErrorMessage(error instanceof Error ? error.message : 'Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
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

  const assignEmployeeToService = async (employee: Employee) => {
    if (selectedService) {
      try {
        setIsAssigning(true);
        setErrorMessage(null);
        
        // Call the API to assign employee (may take 15+ seconds due to email sending)
        const updatedService = await assignEmployeeToAppointment(
          selectedService.id,
          [employee.id]
        );
        
        // Remove from unassigned and add to upcoming
        setUnassignedAppointments(prev => prev.filter(s => s.id !== selectedService.id));
        setUpcomingAppointments(prev => [...prev, updatedService]);
        
        // Show success notification
        toast.success(`Successfully assigned ${employee.name} to the appointment!`, {
          duration: 4000,
          icon: <CheckCircle className="w-5 h-5" />,
        });
        
        // Close modal and reset (only reached if no error was thrown)
        setShowAssignModal(false);
        setSelectedService(null);
        setSearchEmployee('');
      } catch (error) {
        console.error('Error assigning employee:', error);
        const errorMsg = error instanceof Error ? error.message : 'Failed to assign employee';
        setErrorMessage(errorMsg);
        
        // Show error notification
        toast.error(errorMsg, {
          duration: 5000,
          icon: <XCircle className="w-5 h-5" />,
        });
      } finally {
        setIsAssigning(false);
      }
    }
  };

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchEmployee.toLowerCase()) ||
    emp.specialization.toLowerCase().includes(searchEmployee.toLowerCase())
  );

  // Add custom scrollbar styles
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'admin-scrollbar-styles';
    style.textContent = `
      .admin-scrollbar::-webkit-scrollbar {
        width: 8px;
      }
      .admin-scrollbar::-webkit-scrollbar-track {
        background: #18181b;
        border-radius: 4px;
      }
      .admin-scrollbar::-webkit-scrollbar-thumb {
        background: #3f3f46;
        border-radius: 4px;
        transition: background 0.2s;
      }
      .admin-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #f97316;
      }
      .admin-scrollbar {
        scrollbar-width: thin;
        scrollbar-color: #3f3f46 #18181b;
      }
    `;
    
    if (!document.getElementById('admin-scrollbar-styles')) {
      document.head.appendChild(style);
    }

    return () => {
      const existingStyle = document.getElementById('admin-scrollbar-styles');
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <header className="bg-linear-to-r from-black to-zinc-950 text-white shadow-lg border-b border-zinc-700 mt-0">
        <div className="max-w-7xl mx-auto px-0 sm:px-6 md:px-8 lg:px-0 pt-26 pb-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
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
      <div className="max-w-7xl mx-auto sm:px-6 md:px-8 lg:px-0 py-8 w-full">
        {/* Error Message */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-red-500 text-sm">{errorMessage}</p>
              <button
                onClick={() => setErrorMessage(null)}
                className="ml-auto text-red-500 hover:text-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Awaiting Assignment Section - Full Width */}
        <div className="mb-6 w-full">
          <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-6 w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-500" />
                Awaiting Assignment
              </h2>
              <span className="px-3 py-1 bg-orange-500/20 text-orange-500 rounded-full text-sm font-bold border border-orange-500/30">
                {isLoading ? '...' : unassignedAppointments.length}
              </span>
            </div>

            {isLoading ? (
              <UnassignedSectionSkeleton />
            ) : unassignedAppointments.length === 0 ? (
              <div className="text-center py-12 w-full">
                <AlertCircle className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No appointments awaiting assignment</p>
                <p className="text-zinc-500 text-sm mt-2">All appointments have been assigned to employees</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {unassignedAppointments.map(service => (
                  <div
                    key={service.id}
                    className="bg-zinc-800 rounded-lg border border-zinc-700 p-5 hover:border-orange-500/50 transition-all duration-200"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                          <Car className="w-5 h-5 text-orange-500" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white text-sm leading-tight">
                            {getVehicleDisplayName(service)}
                          </h3>
                          <p className="text-xs text-gray-400 mt-1">{service.vehicleLicensePlate}</p>
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-orange-500/20 text-orange-500 border border-orange-500/30 rounded-full text-xs font-semibold">
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
          
          {/* Upcoming Appointments Section */}
          <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-orange-500" />
                Upcoming Appointments
              </h2>
              <span className="px-3 py-1 bg-orange-500/20 text-orange-500 rounded-full text-sm font-bold border border-orange-500/30">
                {isLoading ? '...' : upcomingAppointments.length}
              </span>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto admin-scrollbar pr-2">
              {isLoading ? (
                <AppointmentListSkeleton />
              ) : upcomingAppointments.map(service => (
                <div
                  key={service.id}
                  className="p-4 rounded-lg border border-zinc-700 bg-zinc-800 hover:border-orange-500/50 transition cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Car className="w-4 h-4 text-orange-500" />
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
                    <User className="w-3 h-3 text-green-500" />
                    <p className="text-xs text-green-500 font-semibold">{service.assignedEmployeeName}</p>
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

          {/* Ongoing Appointments Section */}
          <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <CircleDashed className="w-5 h-5 text-orange-500" />
                Ongoing Appointments
              </h2>
              <span className="px-3 py-1 bg-orange-500/20 text-orange-500 rounded-full text-sm font-bold border border-orange-500/30">
                {isLoading ? '...' : ongoingAppointments.length}
              </span>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto admin-scrollbar pr-2">
              {isLoading ? (
                <AppointmentListSkeleton />
              ) : ongoingAppointments.map(service => (
                <div
                  key={service.id}
                  className="p-4 rounded-lg border border-zinc-700 bg-zinc-800 hover:border-orange-500/50 transition cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Car className="w-4 h-4 text-orange-500" />
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
                        className="bg-orange-500 h-2 rounded-full transition-all"
                        style={{ width: `${service.progress}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-3 h-3 text-green-500" />
                    <p className="text-xs text-green-500 font-semibold">{service.assignedEmployeeName}</p>
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
          <div className="bg-zinc-900 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden border border-zinc-800">
            {/* Modal Header */}
            <div className="bg-zinc-800 text-white p-6 border-b border-zinc-700 flex items-center justify-between">
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
                className="text-white hover:bg-zinc-700 p-2 rounded-lg transition"
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

            {/* Employee List or Loader */}
            <div className="p-6 space-y-3 max-h-[400px] overflow-y-auto admin-scrollbar pr-2">
              {isAssigning ? (
                // Show loader when assigning
                <div className="flex flex-col items-center justify-center py-16 space-y-4">
                  <Loader className="w-12 h-12 text-orange-500 animate-spin" />
                  <div className="text-center">
                    <p className="text-white font-semibold text-lg">Assigning Employee...</p>
                    <p className="text-gray-400 text-sm mt-2">This may take a few seconds</p>
                  </div>
                </div>
              ) : (
                // Show employee list when not assigning
                <>
                  {filteredEmployees.map(employee => (
                    <div
                      key={employee.id}
                      className="p-4 rounded-lg border border-zinc-700 bg-zinc-800 hover:border-orange-500 transition"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-orange-500" />
                          </div>
                          <div>
                            <p className="font-semibold text-white">{employee.name}</p>
                            <p className="text-xs text-gray-400">{employee.specialization}</p>
                          </div>
                        </div>

                        <button
                          onClick={() => assignEmployeeToService(employee)}
                          className="px-4 py-2 rounded-lg font-semibold transition text-sm bg-orange-500 text-white hover:bg-orange-600 cursor-pointer"
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
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;