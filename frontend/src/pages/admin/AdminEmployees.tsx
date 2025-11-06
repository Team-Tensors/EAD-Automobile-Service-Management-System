import { useState, useEffect } from 'react';
import { 
  User, 
  Search,
  Mail,
  Phone,
  Star,
  Briefcase,
  AlertCircle,
  Loader,
  Filter,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { Employee } from '@/types/admin';
import { getAllEmployees } from '../../services/adminService';

const AdminEmployees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [filterAvailability, setFilterAvailability] = useState<'all' | 'available' | 'busy'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'rating' | 'workload'>('name');

  // Fetch employees on component mount
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);
        
        const employeeList = await getAllEmployees();
        console.log('AdminEmployees: Fetched employees', employeeList.length);
        
        setEmployees(employeeList);
        setFilteredEmployees(employeeList);
      } catch (error) {
        console.error('Error loading employees:', error);
        const errorMsg = error instanceof Error ? error.message : 'Failed to load employees';
        setErrorMessage(errorMsg);
        toast.error(errorMsg);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEmployees();
  }, []);

  // Filter and search employees
  useEffect(() => {
    let filtered = [...employees];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(emp => 
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.specialization.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply availability filter
    if (filterAvailability !== 'all') {
      filtered = filtered.filter(emp => emp.availability === filterAvailability);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'rating':
          return b.rating - a.rating;
        case 'workload':
          return a.currentWorkload - b.currentWorkload;
        default:
          return 0;
      }
    });

    setFilteredEmployees(filtered);
  }, [employees, searchQuery, filterAvailability, sortBy]);

  // Get availability badge
  const getAvailabilityBadge = (availability: string) => {
    switch(availability) {
      case 'available':
        return <span className="px-2 py-1 bg-green-500/20 text-green-500 border border-green-500/30 rounded-full text-xs font-semibold">AVAILABLE</span>;
      case 'busy':
        return <span className="px-2 py-1 bg-red-500/20 text-red-500 border border-red-500/30 rounded-full text-xs font-semibold">BUSY</span>;
      default:
        return null;
    }
  };

  // Get workload color
  const getWorkloadColor = (workload: number) => {
    if (workload <= 3) return 'text-green-500';
    if (workload <= 7) return 'text-yellow-500';
    return 'text-red-500';
  };

  // Render star rating
  const renderStarRating = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'fill-orange-500 text-orange-500'
                : 'text-zinc-600'
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-400">({rating.toFixed(1)})</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <header className="bg-linear-to-r from-black to-zinc-950 text-white shadow-lg border-b border-zinc-700 mt-0">
        <div className="max-w-7xl mx-auto px-0 sm:px-6 md:px-8 lg:px-0 pt-26 pb-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Employees</h1>
              <p className="text-gray-400 mt-2">
                Manage and view all employees
              </p>
            </div>
            <div className="flex items-center gap-3 bg-zinc-800/50 px-4 py-2 rounded-lg border border-zinc-700">
              <User className="w-5 h-5 text-gray-400" />
              <span className="font-semibold text-white">Total: {employees.length}</span>
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Total Employees */}
          <div className="bg-zinc-900 rounded-lg shadow-md p-6 border border-zinc-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Employees</p>
                <p className="text-3xl font-bold text-white mt-1">
                  {employees.length}
                </p>
              </div>
              <User className="w-12 h-12 text-orange-500" />
            </div>
          </div>

          {/* Available */}
          <div className="bg-zinc-900 rounded-lg shadow-md p-6 border border-zinc-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Available</p>
                <p className="text-3xl font-bold text-green-500 mt-1">
                  {employees.filter(e => e.availability === 'available').length}
                </p>
              </div>
              <User className="w-12 h-12 text-green-500" />
            </div>
          </div>

          {/* Busy */}
          <div className="bg-zinc-900 rounded-lg shadow-md p-6 border border-zinc-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Busy</p>
                <p className="text-3xl font-bold text-red-500 mt-1">
                  {employees.filter(e => e.availability === 'busy').length}
                </p>
              </div>
              <User className="w-12 h-12 text-red-500" />
            </div>
          </div>

          {/* Average Rating */}
          <div className="bg-zinc-900 rounded-lg shadow-md p-6 border border-zinc-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Avg Rating</p>
                <p className="text-3xl font-bold text-yellow-500 mt-1">
                  {employees.length > 0 
                    ? (employees.reduce((sum, e) => sum + e.rating, 0) / employees.length).toFixed(1)
                    : '0.0'
                  }
                </p>
              </div>
              <Star className="w-12 h-12 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search employees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Availability Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={filterAvailability}
                onChange={(e) => setFilterAvailability(e.target.value as 'all' | 'available' | 'busy')}
                className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="available">Available</option>
                <option value="busy">Busy</option>
              </select>
            </div>

            {/* Sort By */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'rating' | 'workload')}
                className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none cursor-pointer"
              >
                <option value="name">Sort by Name</option>
                <option value="rating">Sort by Rating</option>
                <option value="workload">Sort by Workload</option>
              </select>
            </div>
          </div>

          {/* Active Filters Display */}
          {(searchQuery || filterAvailability !== 'all') && (
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-400">Active filters:</span>
              {searchQuery && (
                <span className="px-3 py-1 bg-orange-500/20 text-orange-500 rounded-full text-xs font-semibold border border-orange-500/30 flex items-center gap-2">
                  Search: "{searchQuery}"
                  <button onClick={() => setSearchQuery('')}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filterAvailability !== 'all' && (
                <span className="px-3 py-1 bg-orange-500/20 text-orange-500 rounded-full text-xs font-semibold border border-orange-500/30 flex items-center gap-2">
                  Status: {filterAvailability}
                  <button onClick={() => setFilterAvailability('all')}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Employee List */}
        <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <User className="w-5 h-5 text-orange-500" />
              Employee Directory
            </h2>
            <span className="px-3 py-1 bg-orange-500/20 text-orange-500 rounded-full text-sm font-bold border border-orange-500/30">
              {filteredEmployees.length} {filteredEmployees.length === 1 ? 'employee' : 'employees'}
            </span>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader className="w-12 h-12 text-orange-500 animate-spin" />
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="text-center py-12">
              <User className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No employees found</p>
              <p className="text-zinc-500 text-sm mt-2">
                {searchQuery || filterAvailability !== 'all' 
                  ? 'Try adjusting your filters'
                  : 'No employees have been added yet'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEmployees.map(employee => (
                <div
                  key={employee.id}
                  className="bg-zinc-800 rounded-lg border border-zinc-700 p-5 hover:border-orange-500/50 transition-all duration-200"
                >
                  {/* Header with Avatar and Status */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-orange-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white text-base leading-tight">
                          {employee.name}
                        </h3>
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                          <Briefcase className="w-3 h-3" />
                          {employee.specialization}
                        </p>
                      </div>
                    </div>
                    {getAvailabilityBadge(employee.availability)}
                  </div>

                  {/* Rating */}
                  <div className="mb-4">
                    {renderStarRating(employee.rating)}
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <p className="text-sm text-gray-300 truncate">{employee.email}</p>
                    </div>
                    {employee.phoneNumber && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <p className="text-sm text-gray-300">{employee.phoneNumber}</p>
                      </div>
                    )}
                  </div>

                  {/* Workload */}
                  <div className="pt-4 border-t border-zinc-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-400">Current Workload</span>
                      <span className={`text-sm font-semibold ${getWorkloadColor(employee.currentWorkload)}`}>
                        {employee.currentWorkload} {employee.currentWorkload === 1 ? 'task' : 'tasks'}
                      </span>
                    </div>
                    <div className="w-full bg-zinc-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all ${
                          employee.currentWorkload <= 3 
                            ? 'bg-green-500' 
                            : employee.currentWorkload <= 7 
                            ? 'bg-yellow-500' 
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min((employee.currentWorkload / 10) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminEmployees;
