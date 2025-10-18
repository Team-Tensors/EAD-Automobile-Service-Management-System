import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Car, Calendar, DollarSign, User, Filter, Download, ChevronRight, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import Navbar from '@/components/Navbar/Narbar';
import Footer from '@/components/Footer/Footer';

// TypeScript Interfaces
interface TimeLog {
  task: string;
  hours: number;
  status: 'completed' | 'in_progress';
}

interface Service {
  id: number;
  vehicleName: string;
  vehicleNumber: string;
  serviceType: string;
  status: 'pending' | 'in_progress' | 'completed';
  progress: number;
  startDate: string;
  estimatedCompletion: string;
  assignedEmployee: string;
  currentStage: string;
  costEstimate: number;
  timeLogs: TimeLog[];
}

interface RealtimeUpdate {
  message: string;
  timestamp: string;
}

const CustomerDashboard = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showMap, setShowMap] = useState<boolean>(false);
  const [realTimeUpdates, setRealTimeUpdates] = useState<RealtimeUpdate[]>([]);

  // Mock data - Replace with actual API calls
  useEffect(() => {
    const mockServices: Service[] = [
      {
        id: 1,
        vehicleName: 'Toyota Camry 2020',
        vehicleNumber: 'ABC-1234',
        serviceType: 'Regular Maintenance',
        status: 'in_progress',
        progress: 65,
        startDate: '2025-10-15',
        estimatedCompletion: '2025-10-20',
        assignedEmployee: 'John Mechanic',
        currentStage: 'Engine Inspection',
        costEstimate: 15000,
        timeLogs: [
          { task: 'Oil Change', hours: 2, status: 'completed' },
          { task: 'Brake Inspection', hours: 1.5, status: 'completed' },
          { task: 'Engine Inspection', hours: 0, status: 'in_progress' }
        ]
      },
      {
        id: 2,
        vehicleName: 'Honda Civic 2019',
        vehicleNumber: 'XYZ-5678',
        serviceType: 'Custom Modification',
        status: 'pending',
        progress: 0,
        startDate: '2025-10-22',
        estimatedCompletion: '2025-11-05',
        assignedEmployee: 'Not Assigned',
        currentStage: 'Awaiting Parts',
        costEstimate: 45000,
        timeLogs: []
      },
      {
        id: 3,
        vehicleName: 'BMW X5 2021',
        vehicleNumber: 'LMN-9012',
        serviceType: 'Accident Repair',
        status: 'completed',
        progress: 100,
        startDate: '2025-10-01',
        estimatedCompletion: '2025-10-12',
        assignedEmployee: 'Sarah Engineer',
        currentStage: 'Quality Check Passed',
        costEstimate: 85000,
        timeLogs: [
          { task: 'Body Work', hours: 12, status: 'completed' },
          { task: 'Painting', hours: 8, status: 'completed' },
          { task: 'Final Assembly', hours: 6, status: 'completed' }
        ]
      }
    ];
    setServices(mockServices);
    setSelectedService(mockServices[0]);

    // Simulate real-time updates via WebSocket
    const ws = simulateWebSocket();
    return () => ws.close();
  }, []);

  const simulateWebSocket = () => {
    const interval = setInterval(() => {
      const updates = [
        'Engine inspection completed - 70% progress',
        'Parts ordered for Honda Civic modification',
        'Quality check started on BMW X5'
      ];
      const randomUpdate = updates[Math.floor(Math.random() * updates.length)];
      setRealTimeUpdates(prev => [{
        message: randomUpdate,
        timestamp: new Date().toLocaleTimeString()
      }, ...prev.slice(0, 4)]);
    }, 15000);

    return { close: () => clearInterval(interval) };
  };

  const getStatusColor = (status: string): string => {
    switch(status) {
      case 'completed': return 'bg-chart-2/20 text-chart-2 border-chart-2/30';
      case 'in_progress': return 'bg-chart-1/20 text-chart-1 border-chart-1/30';
      case 'pending': return 'bg-chart-4/20 text-chart-4 border-chart-4/30';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-chart-2" />;
      case 'in_progress': return <Loader className="w-5 h-5 text-chart-1 animate-spin" />;
      case 'pending': return <AlertCircle className="w-5 h-5 text-chart-4" />;
      default: return null;
    }
  };

  const filteredServices = filterStatus === 'all' 
    ? services 
    : services.filter(s => s.status === filterStatus);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Navbar />
      <header className="mt-16 bg-primary text-primary-foreground shadow-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              {/* <h1 className="text-3xl font-bold font-heading">DriveCare Dashboard</h1> */}
              <p className="text-muted-foreground mt-1">Track your vehicle services in real-time</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg font-semibold hover:bg-secondary/80 transition border border-border">
                Book Service
              </button>
              <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center border border-border">
                <User className="w-6 h-6 text-accent-foreground" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Real-Time Updates Banner */}
        {realTimeUpdates.length > 0 && (
          <div className="bg-chart-1/10 border-l-4 border-chart-1 p-4 mb-6 rounded-r-lg">
            <div className="flex items-center gap-2">
              <Loader className="w-5 h-5 text-chart-1 animate-spin" />
              <div>
                <p className="font-semibold text-foreground">Live Update</p>
                <p className="text-sm text-muted-foreground">{realTimeUpdates[0]?.message}</p>
                <p className="text-xs text-muted-foreground mt-1">{realTimeUpdates[0]?.timestamp}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Services List */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-lg shadow-md p-4 border border-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-card-foreground">My Services</h2>
                <Filter className="w-5 h-5 text-muted-foreground" />
              </div>

              {/* Filter Buttons */}
              <div className="flex gap-2 mb-4 flex-wrap">
                {['all', 'pending', 'in_progress', 'completed'].map(status => (
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

              {/* Service Cards */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredServices.map(service => (
                  <div
                    key={service.id}
                    onClick={() => setSelectedService(service)}
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

          {/* Service Details */}
          {selectedService && (
            <div className="lg:col-span-2 space-y-6">
              {/* Main Info Card */}
              <div className="bg-card rounded-lg shadow-md p-6 border border-border">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-card-foreground mb-2">{selectedService.vehicleName}</h2>
                    <p className="text-muted-foreground">{selectedService.serviceType}</p>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(selectedService.status)}`}>
                    {selectedService.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">Overall Progress</span>
                    <span className="text-sm font-bold text-chart-1">{selectedService.progress}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-3 border border-border">
                    <div
                      className="bg-chart-1 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${selectedService.progress}%` }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Current Stage: <span className="font-semibold text-foreground">{selectedService.currentStage}</span></p>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg border border-border">
                    <Calendar className="w-5 h-5 text-chart-1" />
                    <div>
                      <p className="text-xs text-muted-foreground">Start Date</p>
                      <p className="font-semibold text-card-foreground">{selectedService.startDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg border border-border">
                    <Clock className="w-5 h-5 text-chart-1" />
                    <div>
                      <p className="text-xs text-muted-foreground">Est. Completion</p>
                      <p className="font-semibold text-card-foreground">{selectedService.estimatedCompletion}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg border border-border">
                    <User className="w-5 h-5 text-chart-1" />
                    <div>
                      <p className="text-xs text-muted-foreground">Assigned To</p>
                      <p className="font-semibold text-card-foreground">{selectedService.assignedEmployee}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg border border-border">
                    <DollarSign className="w-5 h-5 text-chart-1" />
                    <div>
                      <p className="text-xs text-muted-foreground">Estimated Cost</p>
                      <p className="font-semibold text-card-foreground">Rs. {selectedService.costEstimate.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button 
                    onClick={() => setShowMap(!showMap)}
                    className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-semibold hover:bg-primary/90 transition flex items-center justify-center gap-2 border border-border"
                  >
                    <MapPin className="w-4 h-4" />
                    {showMap ? 'Hide' : 'Show'} Location
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
                  <h3 className="text-lg font-bold text-card-foreground mb-4">Service Center Location</h3>
                  <div className="bg-secondary rounded-lg h-64 flex items-center justify-center border border-border">
                    <div className="text-center">
                      <MapPin className="w-12 h-12 text-chart-1 mx-auto mb-2" />
                      <p className="text-muted-foreground">Map integration with Google Maps / Leaflet</p>
                      <p className="text-sm text-muted-foreground mt-2">DriveCare Service Center - Negombo</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Time Logs */}
              <div className="bg-card rounded-lg shadow-md p-6 border border-border">
                <h3 className="text-lg font-bold text-card-foreground mb-4">Service Timeline & Time Logs</h3>
                <div className="space-y-3">
                  {selectedService.timeLogs.length > 0 ? (
                    selectedService.timeLogs.map((log, idx) => (
                      <div key={idx} className="flex items-center gap-4 p-3 bg-secondary rounded-lg border border-border">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          log.status === 'completed' ? 'bg-chart-2/20 border border-chart-2/30' : 'bg-chart-1/20 border border-chart-1/30'
                        }`}>
                          {log.status === 'completed' ? (
                            <CheckCircle className="w-5 h-5 text-chart-2" />
                          ) : (
                            <Loader className="w-5 h-5 text-chart-1 animate-spin" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-card-foreground">{log.task}</p>
                          <p className="text-sm text-muted-foreground">
                            {log.hours > 0 ? `${log.hours} hours logged` : 'In progress...'}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                          log.status === 'completed' ? 'bg-chart-2/20 text-chart-2 border-chart-2/30' : 'bg-chart-1/20 text-chart-1 border-chart-1/30'
                        }`}>
                          {log.status.toUpperCase()}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-4">No time logs available yet</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CustomerDashboard;