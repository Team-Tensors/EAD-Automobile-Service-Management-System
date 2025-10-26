import { useState, useEffect, useRef } from 'react';
import { 
  Clock, 
  Car, 
  Calendar, 
  User, 
  ChevronRight, 
  CheckCircle, 
  CircleDashed,
  Briefcase,
  Loader,
  Check,
  ClipboardList,
  ClipboardX,
  ChevronLeft,
  Save,
  Trash2,
  Edit,
  Dot,
  X,
  AlertTriangle 
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Footer from '@/components/Footer/Footer';

// --- INTERFACES ---

interface AssignedService {
  id: number;
  vehicleName: string;
  vehicleNumber: string;
  serviceType: string;
  status: 'completed' | 'in_progress' | 'not_started';
  startDate: string | null; 
  estimatedCompletion: string | null;
  customerName: string; 
  serviceCenter: string;
  centerSlot: string;
}

interface TimeLog {
  id: number;
  serviceId: number;
  date: string; // "YYYY-MM-DD"
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  duration: string; // "2h 30m"
  description: string;
}

type ServiceStatus = 'completed' | 'in_progress' | 'not_started';
type ActiveSection = 'logTime' | 'updateStatus' | 'none';
type NotificationType = 'success' | 'error';

// --- MOCK DATA ---

const MOCK_SERVICES: AssignedService[] = [
  {
    id: 1,
    vehicleName: 'Toyota Camry 2020',
    vehicleNumber: 'ABC-1234',
    serviceType: 'Regular Maintenance',
    status: 'in_progress',
    startDate: '2025-10-24T10:00:00Z', 
    estimatedCompletion: '2025-10-28T17:00:00Z',
    customerName: 'Alice Smith',
    serviceCenter: 'DriveCare Negombo Center',
    centerSlot: 'Bay 3'
  },
  {
    id: 2,
    vehicleName: 'Honda Civic 2019',
    vehicleNumber: 'XYZ-5678',
    serviceType: 'Custom Modification',
    status: 'not_started', 
    startDate: null, 
    estimatedCompletion: '2025-11-05T17:00:00Z',
    customerName: 'Bob Johnson',
    serviceCenter: 'DriveCare Colombo Center',
    centerSlot: 'Bay 1'
  },
  {
    id: 3,
    vehicleName: 'BMW X5 2021',
    vehicleNumber: 'LMN-9012',
    serviceType: 'Accident Repair',
    status: 'completed',
    startDate: '2025-10-01T09:00:00Z',
    estimatedCompletion: '2025-10-12T17:00:00Z',
    customerName: 'Charlie Brown',
    serviceCenter: 'DriveCare Negombo Center',
    centerSlot: 'Bay 5'
  }
];

// Mock logs are set for October 2025 to match the calendar logic
const MOCK_TIME_LOGS: { [key: number]: TimeLog[] } = {
  1: [
    { id: 101, serviceId: 1, date: '2025-10-24', startTime: '10:00', endTime: '12:30', duration: '2h 30m', description: 'Initial diagnostics and oil change.' },
    { id: 102, serviceId: 1, date: '2025-10-24', startTime: '13:30', endTime: '15:00', duration: '1h 30m', description: 'Replaced air filter and spark plugs.' },
    // Add a log for the selected date (Oct 27, 2025 based on context)
    { id: 103, serviceId: 1, date: '2025-10-27', startTime: '09:00', endTime: '11:00', duration: '2h 0m', description: 'Checked tire pressure.' },
  ],
  2: [],
  3: [
    { id: 301, serviceId: 3, date: '2025-10-01', startTime: '09:00', endTime: '17:00', duration: '8h 0m', description: 'Full day body work.' }
  ]
};


// --- HELPER FUNCTIONS ---

const formatDate = (date: Date): string => {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    console.error("Invalid date passed to formatDate:", date);
    return new Date().toISOString().split('T')[0]; 
  }
  return date.toISOString().split('T')[0];
};

const formatTime = (date: Date): string => {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
      console.error("Invalid date passed to formatTime:", date);
      return new Date().toTimeString().split(' ')[0].substring(0, 5); 
  }
  return date.toTimeString().split(' ')[0].substring(0, 5);
};

// --- Calendar Helpers ---
interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
}

const generateMonthGrid = (date: Date): CalendarDay[] => {
  const grid: CalendarDay[] = [];
  const year = date.getFullYear();
  const month = date.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const firstDayWeekday = firstDayOfMonth.getDay(); 

  for (let i = 0; i < firstDayWeekday; i++) {
    const prevDate = new Date(firstDayOfMonth);
    prevDate.setDate(prevDate.getDate() - (firstDayWeekday - i));
    grid.push({ date: prevDate, isCurrentMonth: false });
  }

  for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
    grid.push({ date: new Date(year, month, i), isCurrentMonth: true });
  }

  const remainingCells = 42 - grid.length;
  for (let i = 1; i <= remainingCells; i++) {
    const nextDate = new Date(lastDayOfMonth);
    nextDate.setDate(nextDate.getDate() + i);
    grid.push({ date: nextDate, isCurrentMonth: false });
  }
  
  return grid;
};

// --- Time Log Helpers ---
const calculateDuration = (startTime: string, endTime: string): string => {
  if (!startTime || !endTime) return '0h 0m';
  try {
    const start = new Date(`1970-01-01T${startTime}:00`);
    const end = new Date(`1970-01-01T${endTime}:00`);
    let diff = end.getTime() - start.getTime();
    if (diff < 0) diff += 24 * 60 * 60 * 1000;
    
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    
    return `${hours}h ${minutes}m`;
  } catch (e) {
    return '0h 0m';
  }
};

const getLogsForDate = (date: Date, allLogs: { [key: number]: TimeLog[] }, services: AssignedService[]): (TimeLog & { vehicleNumber: string })[] => {
  const dateString = formatDate(date);
  const logsForDay: (TimeLog & { vehicleNumber: string })[] = [];
  
  Object.values(allLogs).flat().forEach(log => {
    if (log.date === dateString) {
      const service = services.find(s => s.id === log.serviceId);
      logsForDay.push({
        ...log,
        vehicleNumber: service?.vehicleNumber || 'N/A'
      });
    }
  });
  return logsForDay;
};

const dateHasLogs = (date: Date, allLogs: { [key: number]: TimeLog[] }): boolean => {
  const dateString = formatDate(date);
  return Object.values(allLogs).flat().some(log => log.date === dateString);
};


// --- MAIN COMPONENT ---

const EmployeeDashboard = () => {
  const { user, logout } = useAuth();
  const [assignedServices, setAssignedServices] = useState<AssignedService[]>(MOCK_SERVICES);
  const [selectedService, setSelectedService] = useState<AssignedService | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  const [activeSection, setActiveSection] = useState<ActiveSection>('none');
  const [timeLogs, setTimeLogs] = useState<{ [key: number]: TimeLog[] }>(MOCK_TIME_LOGS);
  
  const currentDate = new Date(); // Use actual current date
  const firstOfCurrentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const [summaryMonth, setSummaryMonth] = useState(firstOfCurrentMonth); 
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | null>(currentDate); 
  
  const [notification, setNotification] = useState<{ message: string; type: NotificationType } | null>(null);
  const notificationTimer = useRef<NodeJS.Timeout | null>(null);

  const [logToDelete, setLogToDelete] = useState<TimeLog | null>(null);
  
  const showNotification = (message: string, type: NotificationType = 'success') => {
    if (notificationTimer.current) {
      clearTimeout(notificationTimer.current);
    }
    setNotification({ message, type });
    notificationTimer.current = setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  useEffect(() => {
    const defaultService = assignedServices.find(s => s.status !== 'completed') || assignedServices[0];
    setSelectedService(defaultService);
  }, []); 

  // --- Status & Color Helpers ---
  const getStatusColor = (status: string): string => {
    switch(status) {
      case 'completed': return 'bg-chart-2/20 text-chart-2 border-chart-2/30';
      case 'in_progress': return 'bg-chart-4/20 text-chart-4 border-chart-4/30';
      case 'not_started': return 'bg-chart-1/20 text-chart-1 border-chart-1/30'; 
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-chart-2" />;
      case 'in_progress': return <Loader className="w-5 h-5 text-chart-4" />; 
      case 'not_started': return <CircleDashed className="w-5 h-5 text-chart-1" />; 
      default: return null;
    }
  };

  const filteredServices = filterStatus === 'all' 
    ? assignedServices 
    : assignedServices.filter(s => s.status === filterStatus);

  // --- Stat Calculations ---
  const activeProjects = assignedServices.filter(s => s.status === 'in_progress').length;
  const notStartedTasks = assignedServices.filter(s => s.status === 'not_started').length;
  const completedTasks = assignedServices.filter(s => s.status === 'completed').length; 

  // --- Event Handlers ---
  const handleSelectService = (service: AssignedService) => {
    setSelectedService(service);
    setActiveSection('none');
  };
  
  const handleToggleSection = (section: ActiveSection) => {
    setActiveSection(prev => (prev === section ? 'none' : section));
  };

  const handleStatusUpdate = (newStatus: ServiceStatus, description?: string) => {
    if (!selectedService) return;

    let newStartDate = selectedService.startDate;
    let newEstimatedCompletion = selectedService.estimatedCompletion;

    if (selectedService.status === 'not_started' && newStatus === 'in_progress') {
      const now = new Date();
      const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
      
      newStartDate = now.toISOString();
      newEstimatedCompletion = oneHourLater.toISOString();
      
      showNotification(`Service Started. Est. completion: ${oneHourLater.toLocaleTimeString()}`, 'success');
    } else {
       showNotification(`Status updated to: ${newStatus.replace('_', ' ').toUpperCase()}`, 'success');
    }
    
    if (newStatus === 'completed') {
      console.log("Saving Completion Description:", description);
    }

    const updatedService = { 
      ...selectedService, 
      status: newStatus, 
      startDate: newStartDate,
      estimatedCompletion: newEstimatedCompletion
    };
    
    setSelectedService(updatedService);
    setAssignedServices(prevServices => 
      prevServices.map(s => s.id === updatedService.id ? updatedService : s)
    );
    
    setActiveSection('none');
  };

  const handleSaveLog = (newLog: Omit<TimeLog, 'id' | 'serviceId' | 'duration'>) => {
    if (!selectedService) return;
    
    const duration = calculateDuration(newLog.startTime, newLog.endTime);
    const logToSave: TimeLog = {
      ...newLog,
      id: Date.now(),
      serviceId: selectedService.id,
      duration: duration
    };

    setTimeLogs(prevLogs => {
      const currentLogs = prevLogs[selectedService.id] || [];
      return {
        ...prevLogs,
        [selectedService.id]: [...currentLogs, logToSave]
      };
    });
    
    showNotification('Time log saved successfully!', 'success');
  };
  
  const handleUpdateLog = (updatedLog: TimeLog) => {
    if (!selectedService) return;

    const duration = calculateDuration(updatedLog.startTime, updatedLog.endTime);
    const logToUpdate = { ...updatedLog, duration };
    
    setTimeLogs(prevLogs => {
      const currentLogs = prevLogs[selectedService.id] || [];
      return {
        ...prevLogs,
        [selectedService.id]: currentLogs.map(log => 
          log.id === logToUpdate.id ? logToUpdate : log
        )
      };
    });
    
    showNotification('Time log updated successfully!', 'success');
  };

  const handleDeleteLogRequest = (log: TimeLog) => {
    setLogToDelete(log); 
  };

  const handleConfirmDelete = () => {
    if (!logToDelete || !selectedService) return;

    setTimeLogs(prevLogs => {
      const currentLogs = prevLogs[selectedService.id] || [];
      return {
        ...prevLogs,
        [selectedService.id]: currentLogs.filter(log => log.id !== logToDelete.id)
      };
    });
    
    showNotification('Log entry deleted.', 'success');
    setLogToDelete(null); 
  };
  
  const changeMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(summaryMonth);
    const amount = direction === 'prev' ? -1 : 1;
    newDate.setMonth(newDate.getMonth() + amount);
    setSummaryMonth(newDate);
    setSelectedCalendarDate(null);
  };

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-background relative"> 
      
      {/* --- ToastNotification --- */}
      {notification && (
        <ToastNotification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      
      {/* --- Delete Confirmation Modal --- */}
      {logToDelete && (
        <DeleteConfirmationModal
          onCancel={() => setLogToDelete(null)}
          onConfirm={handleConfirmDelete}
        />
      )}

      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Employee Dashboard</h1>
              <p className="text-primary-foreground/80 mt-1">
                Welcome back, {user?.firstName} {user?.lastName}! {user?.department && `(${user.department})`}
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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card rounded-lg shadow-md p-6 border border-border flex items-center gap-4">
            <div className="p-3 bg-chart-4/10 rounded-lg">
              <Briefcase className="w-6 h-6 text-chart-4" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Projects</p>
              <p className="text-2xl font-bold text-card-foreground">{activeProjects}</p>
            </div>
          </div>
          <div className="bg-card rounded-lg shadow-md p-6 border border-border flex items-center gap-4">
            <div className="p-3 bg-chart-1/10 rounded-lg">
              <CircleDashed className="w-6 h-6 text-chart-1" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Not Started</p>
              <p className="text-2xl font-bold text-card-foreground">{notStartedTasks}</p>
            </div>
          </div>
          <div className="bg-card rounded-lg shadow-md p-6 border border-border flex items-center gap-4">
            <div className="p-3 bg-chart-2/10 rounded-lg">
              <CheckCircle className="w-6 h-6 text-chart-2" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completed This Week</p>
              <p className="text-2xl font-bold text-card-foreground">{completedTasks}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions / Navigation Cards */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-card-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <a href="#" className="bg-card rounded-lg shadow-md p-6 border border-border flex flex-col items-start gap-3 hover:bg-accent transition-colors group">
              <div className="p-3 bg-secondary rounded-lg border border-border">
                <ClipboardList className="w-6 h-6 text-chart-3" />
              </div>
              <h3 className="text-xl font-bold text-card-foreground">Manage Inventory</h3>
              <p className="text-sm text-muted-foreground flex-1">View and update service parts and stock levels.</p>
              <div className="mt-2 text-sm font-semibold text-primary group-hover:underline flex items-center">
                Go to Inventory <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </a>
            <a href="#" className="bg-card rounded-lg shadow-md p-6 border border-border flex flex-col items-start gap-3 hover:bg-accent transition-colors group">
              <div className="p-3 bg-secondary rounded-lg border border-border">
                <ClipboardX className="w-6 h-6 text-chart-5" />
              </div>
              <h3 className="text-xl font-bold text-card-foreground">Unassigned Services</h3>
              <p className="text-sm text-muted-foreground flex-1">View and claim new jobs from the service pool.</p>
              <div className="mt-2 text-sm font-semibold text-primary group-hover:underline flex items-center">
                View All <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </a>
            <a 
              href="#" 
              className="bg-card rounded-lg shadow-md p-6 border border-border flex flex-col items-start gap-3 hover:bg-accent transition-colors group"
            >
              <div className="p-3 bg-secondary rounded-lg border border-border">
                <Calendar className="w-6 h-6 text-chart-1" />
              </div>
              <h3 className="text-xl font-bold text-card-foreground">Service Scheduling</h3>
              <p className="text-sm text-muted-foreground flex-1">See the list of your assigned services.</p>
              <div className="mt-2 text-sm font-semibold text-primary group-hover:underline flex items-center">
                View all services <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </a>
          </div>
        </div>

        {/* Main Content: List + Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Services List */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-lg shadow-md p-4 border border-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-card-foreground">Assigned Services</h2>
              </div>
              <div className="flex gap-2 mb-4 flex-wrap">
                {['all', 'in_progress', 'not_started', 'completed'].map(status => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition border ${
                      filterStatus === status 
                        ? 'bg-primary text-primary-foreground border-primary' 
                        : 'bg-secondary text-secondary-foreground border-border hover:bg-accent'
                    }`}
                  >
                    {status.replace('_', ' ').toUpperCase()}
                  </button>
                ))}
              </div>
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {filteredServices.map(service => (
                  <div
                    key={service.id}
                    onClick={() => handleSelectService(service)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                      selectedService?.id === service.id
                        ? 'border-primary bg-accent/50'
                        : 'border-border hover:border-primary/50 bg-card'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Car className="w-4 h-4 text-muted-foreground" />
                          <p className="font-semibold text-card-foreground">{service.vehicleName}</p>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{service.vehicleNumber}</p>
                        <p className="text-xs text-muted-foreground mb-2">{service.serviceType}</p>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(service.status)}`}>
                          {getStatusIcon(service.status)}
                          {service.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Service Details + Action Sections */}
          <div className="lg:col-span-2 space-y-6">
            {selectedService && (
              <>
                {/* Main Info Card */}
                <div className="bg-card rounded-lg shadow-md p-6 border border-border">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-card-foreground mb-1">{selectedService.vehicleName}</h2>
                      <p className="text-lg font-semibold text-muted-foreground mb-2">{selectedService.vehicleNumber}</p>
                      <p className="text-muted-foreground">{selectedService.serviceType}</p>
                    </div>
                    <span className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(selectedService.status)}`}>
                      {getStatusIcon(selectedService.status)}
                      {selectedService.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button 
                      onClick={() => handleToggleSection('updateStatus')}
                      className={`flex-1 px-4 py-2 rounded-lg font-semibold transition flex items-center justify-center gap-2 border ${
                        activeSection === 'updateStatus' ? 'bg-primary text-primary-foreground' : 'bg-primary/80 text-primary-foreground hover:bg-primary/90'
                      }`}
                    >
                      <Check className="w-4 h-4" />
                      Update Status
                    </button>
                    {/* --- LOG TIME BUTTON --- */}
                    <button 
                      onClick={() => handleToggleSection('logTime')}
                      disabled={selectedService.status === 'not_started'}
                      className={`flex-1 px-4 py-2 rounded-lg font-semibold transition flex items-center justify-center gap-2 border ${
                        activeSection === 'logTime' 
                          ? 'bg-chart-2 text-white border-chart-2/50' 
                          : 'bg-chart-2/80 text-white hover:bg-chart-2 border-chart-2/50'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <Clock className="w-4 h-4" />
                      Log Time
                    </button>
                  </div>
                </div>
                
                {activeSection === 'updateStatus' && (
                  <UpdateStatusSection 
                    service={selectedService}
                    onStatusUpdate={handleStatusUpdate}
                    showNotification={showNotification}
                  />
                )}
                
                {activeSection === 'logTime' && (
                  <LogTimeSection 
                    serviceId={selectedService.id}
                    logs={timeLogs[selectedService.id] || []}
                    onSaveLog={handleSaveLog}
                    onUpdateLog={handleUpdateLog}
                    onDeleteRequest={handleDeleteLogRequest}
                    showNotification={showNotification}
                    // --- Pass selected calendar date ---
                    selectedCalendarDate={selectedCalendarDate} 
                  />
                )}
              </>
            )}
          </div>
        </div>

        {/* --- Monthly Calendar Section --- */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-card-foreground mb-4">Monthly Work Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MonthlyCalendar 
              currentMonth={summaryMonth}
              allLogs={timeLogs}
              selectedDate={selectedCalendarDate}
              onDateClick={setSelectedCalendarDate}
              onChangeMonth={changeMonth}
            />
            <DailyLogSummary 
              selectedDate={selectedCalendarDate}
              allLogs={timeLogs}
              services={assignedServices}
            />
          </div>
        </div>

      </div>
      <Footer />
    </div>
  );
};

// --- SUB-COMPONENTS ---

// --- ToastNotification Component ---
interface ToastNotificationProps {
  message: string;
  type: NotificationType;
  onClose: () => void;
}

const ToastNotification: React.FC<ToastNotificationProps> = ({ message, type, onClose }) => {
  const isSuccess = type === 'success';

  return (
    <div className="fixed top-20 right-6 z-50 bg-card rounded-lg shadow-xl p-4 border border-border w-full max-w-sm m-4 animate-fade-in-down">
      <div className="flex items-start gap-4">
        <div className={`flex-shrink-0 p-2 rounded-full border ${
          isSuccess 
          ? 'bg-chart-2/10 border-chart-2/20' 
          : 'bg-destructive/10 border-destructive/20'
        }`}>
          {isSuccess ? (
            <CheckCircle className="w-5 h-5 text-chart-2" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-destructive" />
          )}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-card-foreground">
            {isSuccess ? 'Success' : 'Error'}
          </p>
          <p className="text-sm text-muted-foreground">
            {message}
          </p>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-card-foreground">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};


// --- Update Status Component ---
interface UpdateStatusProps {
  service: AssignedService;
  onStatusUpdate: (newStatus: ServiceStatus, description?: string) => void;
  showNotification: (message: string, type: NotificationType) => void;
}

const UpdateStatusSection: React.FC<UpdateStatusProps> = ({ service, onStatusUpdate, showNotification }) => {
  const [pendingStatus, setPendingStatus] = useState<ServiceStatus>(service.status);
  const [description, setDescription] = useState('');

  const getSolidStatusColor = (status: string): string => {
    switch(status) {
      case 'completed': return 'bg-chart-2 text-white border-chart-2';
      case 'in_progress': return 'bg-chart-4 text-white border-chart-4';
      case 'not_started': return 'bg-chart-1 text-white border-chart-1';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getButtonClass = (status: ServiceStatus) => {
    return `flex-1 p-4 rounded-lg font-semibold border-2 transition text-center ${
      pendingStatus === status 
      ? getSolidStatusColor(status)
      : `bg-secondary text-secondary-foreground border-border hover:bg-accent`
    }`;
  };
  
  const handleSaveClick = () => {
    if (pendingStatus === 'completed' && !description.trim()) {
      showNotification('Please add a completion description.', 'error');
      return;
    }
    onStatusUpdate(pendingStatus, description);
  };

  return (
    <div className="bg-card rounded-lg shadow-md p-6 border border-border">
      <h3 className="text-xl font-bold text-card-foreground mb-4">Update Service Status</h3>
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">Select the new status for:</p>
        <p className="font-semibold text-card-foreground">{service.vehicleName} ({service.vehicleNumber})</p>
      </div>
      <div className="flex gap-3 mb-6">
        <button className={getButtonClass('not_started')} onClick={() => setPendingStatus('not_started')}>
          NOT STARTED
        </button>
        <button className={getButtonClass('in_progress')} onClick={() => setPendingStatus('in_progress')}>
          IN PROGRESS
        </button>
        <button className={getButtonClass('completed')} onClick={() => setPendingStatus('completed')}>
          COMPLETED
        </button>
      </div>

      {pendingStatus === 'completed' && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-muted-foreground mb-1">Completion Description</label>
          <textarea 
            value={description} 
            onChange={e => setDescription(e.target.value)} 
            rows={4}
            placeholder="Describe the work completed, parts used, and final checks."
            className="w-full p-2 bg-background border border-border rounded-lg"
          ></textarea>
        </div>
      )}

      <button 
        onClick={handleSaveClick}
        disabled={pendingStatus === service.status && (pendingStatus !== 'completed' || description === '')}
        className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-lg font-semibold hover:bg-primary/90 transition flex items-center justify-center gap-2 border border-border disabled:opacity-50"
      >
        <Save className="w-4 h-4" />
        Save Status
      </button>
    </div>
  );
};


// --- MODIFIED Log Time Component ---
interface LogTimeProps {
  serviceId: number;
  logs: TimeLog[];
  onSaveLog: (newLog: Omit<TimeLog, 'id' | 'serviceId' | 'duration'>) => void;
  onUpdateLog: (updatedLog: TimeLog) => void;
  onDeleteRequest: (log: TimeLog) => void;
  showNotification: (message: string, type: NotificationType) => void;
  selectedCalendarDate: Date | null; // Added prop
}

const LogTimeSection: React.FC<LogTimeProps> = ({ 
  serviceId, 
  logs, 
  onSaveLog, 
  onUpdateLog, 
  onDeleteRequest, 
  showNotification, 
  selectedCalendarDate // Use prop
}) => {
  const [editingLog, setEditingLog] = useState<TimeLog | null>(null);
  
  // --- Initialize state with current date/time OR selected calendar date ---
  const getDefaultDate = () => selectedCalendarDate ? formatDate(selectedCalendarDate) : formatDate(new Date());
  const [date, setDate] = useState(getDefaultDate());
  const [startTime, setStartTime] = useState(() => formatTime(new Date()));
  const [endTime, setEndTime] = useState(() => formatTime(new Date()));
  const [duration, setDuration] = useState('0h 0m');
  const [description, setDescription] = useState('');
  
  const resetForm = () => {
    // --- Reset state to current time, but date to selectedCalendarDate or today ---
    const now = new Date();
    setDate(getDefaultDate()); // Use selected calendar date or today
    setStartTime(formatTime(now));
    setEndTime(formatTime(now));
    setDuration('0h 0m');
    setDescription('');
    setEditingLog(null);
  };
  
  // --- Effect to update default date if calendar selection changes ---
  useEffect(() => {
    // Only update the date field if not currently editing a log
    if (!editingLog) {
      setDate(getDefaultDate());
    }
  }, [selectedCalendarDate, editingLog]); // Rerun when calendar date changes or edit mode changes

  useEffect(() => {
    if (editingLog) {
      setDate(editingLog.date);
      setStartTime(editingLog.startTime);
      setEndTime(editingLog.endTime);
      setDuration(editingLog.duration);
      setDescription(editingLog.description);
    } 
    // No 'else' needed here, resetForm handles non-edit state, 
    // and the other useEffect handles date changes from calendar
  }, [editingLog]);

  const handleDurationCalc = () => {
    setDuration(calculateDuration(startTime, endTime));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || duration === '0h 0m' || startTime >= endTime) {
      showNotification("Please enter a valid description and time range.", "error");
      return;
    }
    
    if (editingLog) {
      onUpdateLog({
        ...editingLog,
        date,
        startTime,
        endTime,
        description,
        duration 
      });
    } else {
      onSaveLog({ date, startTime, endTime, description });
    }
    
    resetForm();
  };
  
  return (
    <div className="bg-card rounded-lg shadow-md p-6 border border-border">
      <h3 className="text-xl font-bold text-card-foreground mb-4">Log Time</h3>
      
      {/* Log Form */}
      <form onSubmit={handleSave} className="bg-secondary p-4 rounded-lg border border-border mb-6 space-y-4">
        <h4 className="text-lg font-semibold text-card-foreground">
          {editingLog ? 'Edit Log Entry' : 'New Log Entry'}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-2 bg-background border border-border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Start Time</label>
            <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} onBlur={handleDurationCalc} className="w-full p-2 bg-background border border-border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">End Time</label>
            <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} onBlur={handleDurationCalc} className="w-full p-2 bg-background border border-border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Duration</label>
            <input type="text" value={duration} readOnly className="w-full p-2 bg-background border border-border rounded-lg text-muted-foreground" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">Description</label>
          <textarea 
            value={description} 
            onChange={e => setDescription(e.target.value)} 
            rows={3}
            placeholder="What work was done?"
            className="w-full p-2 bg-background border border-border rounded-lg"
          ></textarea>
        </div>
        <div className="flex justify-end gap-3">
          {editingLog && (
            <button 
              type="button" 
              onClick={resetForm} 
              className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg font-semibold hover:bg-accent transition flex items-center justify-center gap-2 border border-border"
            >
              Cancel Edit
            </button>
          )}
          <button 
            type="submit" 
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-semibold hover:bg-primary/90 transition flex items-center justify-center gap-2 border border-border"
          >
            <Save className="w-4 h-4" />
            {editingLog ? 'Update Log' : 'Save Log'}
          </button>
        </div>
      </form>

      {/* Previous Logs */}
      <div>
        <h4 className="text-lg font-semibold text-card-foreground mb-3">Previous Log Entries</h4>
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {logs.length === 0 && (
            <p className="text-muted-foreground text-center p-4">No time logged for this service yet.</p>
          )}
          {logs.slice().reverse().map(log => (
            <div key={log.id} className="p-3 bg-secondary rounded-lg border border-border flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-1 flex-wrap">
                  <span className="font-semibold text-card-foreground">{log.date}</span>
                  <span className="text-sm text-muted-foreground">{log.startTime} - {log.endTime}</span>
                  <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-medium border border-primary/20">{log.duration}</span>
                </div>
                <p className="text-sm text-muted-foreground">{log.description}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditingLog(log)} className="p-2 text-muted-foreground hover:text-primary"><Edit className="w-4 h-4" /></button>
                <button onClick={() => onDeleteRequest(log)} className="p-2 text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- Calendar Sub-Components ---

interface MonthlyCalendarProps {
  currentMonth: Date;
  allLogs: { [key: number]: TimeLog[] };
  selectedDate: Date | null;
  onDateClick: (date: Date) => void;
  onChangeMonth: (direction: 'prev' | 'next') => void;
}

const MonthlyCalendar: React.FC<MonthlyCalendarProps> = ({ currentMonth, allLogs, selectedDate, onDateClick, onChangeMonth }) => {
  // --- Get today's date string once ---
  const todayString = formatDate(new Date()); 
  const monthGrid = generateMonthGrid(currentMonth);
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="md:col-span-2 bg-card rounded-lg shadow-md p-6 border border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-card-foreground">
          {currentMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
        </h3>
        <div className="flex gap-2">
          <button onClick={() => onChangeMonth('prev')} className="p-2 bg-secondary rounded-lg border border-border hover:bg-accent"><ChevronLeft className="w-5 h-5" /></button>
          <button onClick={() => onChangeMonth('next')} className="p-2 bg-secondary rounded-lg border border-border hover:bg-accent"><ChevronRight className="w-5 h-5" /></button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {weekdays.map(day => (
          <div key={day} className="text-xs font-bold text-muted-foreground">{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {monthGrid.map((day, index) => {
          if (!day.isCurrentMonth) {
            return <div key={index} className="h-16 rounded-lg bg-secondary/30 border border-transparent"></div>;
          }

          const isSelected = selectedDate && formatDate(day.date) === formatDate(selectedDate);
          const hasLogs = dateHasLogs(day.date, allLogs);
          const isToday = formatDate(day.date) === todayString;

          // --- Determine cell background and text color ---
          let cellClasses = 'border-border bg-secondary hover:bg-accent';
          let textClasses = 'text-card-foreground';

          if (isToday) {
            cellClasses = 'border-border bg-accent hover:bg-accent/80'; 
            textClasses = 'text-accent-foreground font-bold'; 
          }
          if (isSelected) {
            cellClasses = 'border-primary bg-primary/10'; 
            textClasses = 'text-primary font-bold'; 
          }

          return (
            <button
              key={index}
              onClick={() => onDateClick(day.date)}
              className={`h-16 p-2 rounded-lg border transition-colors relative flex flex-col items-center justify-start ${cellClasses}`}
            >
              <span className={`font-semibold ${textClasses}`}>
                {day.date.getDate()}
              </span>
              {hasLogs && <Dot className="text-primary w-6 h-6 absolute bottom-0 left-1/2 -translate-x-1/2" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};

interface DailyLogSummaryProps {
  selectedDate: Date | null;
  allLogs: { [key: number]: TimeLog[] };
  services: AssignedService[];
}

const DailyLogSummary: React.FC<DailyLogSummaryProps> = ({ selectedDate, allLogs, services }) => {
  if (!selectedDate) {
    return (
      <div className="md:col-span-1 bg-card rounded-lg shadow-md p-6 border border-border flex items-center justify-center">
        <p className="text-muted-foreground text-center">Select a date from the calendar to view logged work.</p>
      </div>
    );
  }

  const logsForDay = getLogsForDate(selectedDate, allLogs, services);

  return (
    <div className="md:col-span-1 bg-card rounded-lg shadow-md p-6 border border-border">
      <h3 className="text-xl font-bold text-card-foreground mb-4">
        Logs for {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
      </h3>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {logsForDay.length === 0 ? (
          <p className="text-muted-foreground text-center p-4">No time logged for this date.</p>
        ) : (
          logsForDay.map(log => (
            <div key={log.id} className="p-3 bg-secondary rounded-lg border border-border">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-card-foreground">{log.vehicleNumber}</span>
                <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-medium border border-primary/20">{log.duration}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-1">{log.startTime} - {log.endTime}</p>
              <p className="text-sm text-card-foreground/90">{log.description}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};


// --- Delete Confirmation Modal (Backdrop removed) ---
interface DeleteConfirmationModalProps {
  onCancel: () => void;
  onConfirm: () => void;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ onCancel, onConfirm }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="bg-card rounded-lg shadow-xl p-6 border border-border w-full max-w-md m-4">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 p-3 bg-destructive/10 rounded-full border border-destructive/20">
            <AlertTriangle className="w-6 h-6 text-destructive" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-card-foreground mb-2">Delete Log Entry</h3>
            <p className="text-muted-foreground">
              Are you sure you want to delete this? This cannot be undone.
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button 
            onClick={onCancel}
            className="px-4 py-2 rounded-lg font-semibold bg-secondary text-secondary-foreground hover:bg-accent transition border border-border"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg font-semibold bg-destructive text-destructive-foreground hover:bg-destructive/90 transition border border-border"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;