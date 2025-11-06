import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import type { Employee } from '@/types/admin';
import type { ServiceCenter } from '@/types/serviceCenter';
import { getAllEmployees, assignEmployeeToCenter } from '../../services/adminService';
import { fetchServiceCenters } from '../../services/serviceCenterService';
import {
  EmployeeHeader,
  EmployeeStatsCards,
  EmployeeFilters,
  EmployeeTable,
  ErrorAlert,
  type SortField,
  type SortOrder
} from '../../components/AdminEmployees';

const AdminEmployees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [serviceCenters, setServiceCenters] = useState<ServiceCenter[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [filterCenter, setFilterCenter] = useState<'all' | number>('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null);
  const [selectedCenterId, setSelectedCenterId] = useState<number | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);

  // Fetch employees and service centers on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);
        
        const [employeeList, centerList] = await Promise.all([
          getAllEmployees(),
          fetchServiceCenters()
        ]);
        
        console.log('AdminEmployees: Fetched', employeeList.length, 'employees and', centerList.length, 'centers');
        
        setEmployees(employeeList);
        setFilteredEmployees(employeeList);
        setServiceCenters(centerList);
      } catch (error) {
        console.error('Error loading data:', error);
        const errorMsg = error instanceof Error ? error.message : 'Failed to load data';
        setErrorMessage(errorMsg);
        toast.error(errorMsg);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Filter, search, and sort employees
  useEffect(() => {
    let filtered = [...employees];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(emp => 
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (emp.phoneNumber && emp.phoneNumber.includes(searchQuery)) ||
        (emp.serviceCenterName && emp.serviceCenterName.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply center filter
    if (filterCenter !== 'all') {
      filtered = filtered.filter(emp => emp.serviceCenterId === filterCenter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'email':
          comparison = a.email.localeCompare(b.email);
          break;
        case 'phone':
          comparison = (a.phoneNumber || '').localeCompare(b.phoneNumber || '');
          break;
        case 'center':
          comparison = (a.serviceCenterName || 'Unassigned').localeCompare(b.serviceCenterName || 'Unassigned');
          break;
        case 'hours':
          comparison = (a.totalHoursWorked || 0) - (b.totalHoursWorked || 0);
          break;
        default:
          return 0;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredEmployees(filtered);
  }, [employees, searchQuery, filterCenter, sortField, sortOrder]);

  // Handle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Handle edit employee center
  const handleEditCenter = (employeeId: string, currentCenterId?: number) => {
    setEditingEmployeeId(employeeId);
    setSelectedCenterId(currentCenterId || null);
  };

  // Handle save center assignment
  const handleSaveCenter = async (employeeId: string) => {
    if (selectedCenterId === null) {
      toast.error('Please select a service center');
      return;
    }

    try {
      setIsAssigning(true);
      await assignEmployeeToCenter(employeeId, selectedCenterId);
      
      // Update local state
      setEmployees(prev => prev.map(emp => 
        emp.id === employeeId 
          ? { 
              ...emp, 
              serviceCenterId: selectedCenterId,
              serviceCenterName: serviceCenters.find(c => c.id === selectedCenterId)?.name || 'Unknown'
            }
          : emp
      ));
      
      toast.success('Employee center updated successfully');
      setEditingEmployeeId(null);
      setSelectedCenterId(null);
    } catch (error) {
      console.error('Error updating employee center:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update employee center');
    } finally {
      setIsAssigning(false);
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingEmployeeId(null);
    setSelectedCenterId(null);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <EmployeeHeader totalEmployees={employees.length} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto sm:px-6 md:px-8 lg:px-0 py-8 w-full">
        {errorMessage && (
          <ErrorAlert 
            errorMessage={errorMessage}
            onDismiss={() => setErrorMessage(null)}
          />
        )}

        <EmployeeStatsCards employees={employees} />

        <EmployeeFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filterCenter={filterCenter}
          setFilterCenter={setFilterCenter}
          serviceCenters={serviceCenters}
        />

        <EmployeeTable
          employees={filteredEmployees}
          serviceCenters={serviceCenters}
          isLoading={isLoading}
          searchQuery={searchQuery}
          filterCenter={filterCenter}
          sortField={sortField}
          sortOrder={sortOrder}
          editingEmployeeId={editingEmployeeId}
          selectedCenterId={selectedCenterId}
          isAssigning={isAssigning}
          onSort={handleSort}
          onEdit={handleEditCenter}
          onSave={handleSaveCenter}
          onCancel={handleCancelEdit}
          onCenterChange={setSelectedCenterId}
        />
      </div>
    </div>
  );
};

export default AdminEmployees;
