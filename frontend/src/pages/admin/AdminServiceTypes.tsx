import { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Wrench,
  Edit,
  Trash2,
  X,
  Filter,
  ChevronLeft,
  ChevronRight,
  Clock
} from 'lucide-react';
import { serviceTypeAdminService } from '../../services/serviceTypeAdminService';
import type { ServiceTypeDto, ServiceTypeCreateDto } from '../../types/serviceType';
import type { AppointmentType } from '../../types/appointment';
import toast from 'react-hot-toast';
import AdminHeader from '../../components/AdminDashboard/AdminHeader';

const AdminServiceTypes = () => {
  const [items, setItems] = useState<ServiceTypeDto[]>([]);
  const [filteredItems, setFilteredItems] = useState<ServiceTypeDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'ALL' | 'SERVICE' | 'MODIFICATION'>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ServiceTypeDto | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Form state for adding/editing item
  const [formData, setFormData] = useState<ServiceTypeCreateDto>({
    type: 'SERVICE',
    name: '',
    description: '',
    estimatedCost: 0,
    estimatedTimeMinutes: 0
  });

  // Load service types on mount
  useEffect(() => {
    loadServiceTypes();
  }, []);

  // Filter items based on search and type
  useEffect(() => {
    let filtered = items;

    // Filter by type
    if (selectedType !== 'ALL') {
      filtered = filtered.filter(item => item.type === selectedType);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort by name
    filtered = filtered.sort((a, b) => a.name.localeCompare(b.name));

    setFilteredItems(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [items, searchQuery, selectedType]);

  const loadServiceTypes = async () => {
    try {
      setLoading(true);
      const data = await serviceTypeAdminService.getAll();
      setItems(data);
    } catch (error) {
      console.error('Failed to load service types:', error);
      toast.error('Failed to load service types');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await serviceTypeAdminService.create(formData);
      toast.success('Service type created successfully!');
      setShowAddModal(false);
      resetForm();
      loadServiceTypes();
    } catch (error) {
      console.error('Failed to add item:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create service type';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    
    setIsSubmitting(true);
    
    try {
      await serviceTypeAdminService.update(selectedItem.id, formData);
      toast.success('Service type updated successfully!');
      setShowEditModal(false);
      setSelectedItem(null);
      resetForm();
      loadServiceTypes();
    } catch (error) {
      console.error('Failed to update item:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update service type';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service type? This action cannot be undone.')) return;

    try {
      await serviceTypeAdminService.remove(id);
      toast.success('Service type deleted successfully!');
      loadServiceTypes();
    } catch (error) {
      console.error('Failed to delete item:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete service type';
      toast.error(errorMessage);
    }
  };

  const openEditModal = (item: ServiceTypeDto) => {
    setSelectedItem(item);
    setFormData({
      type: item.type,
      name: item.name,
      description: item.description,
      estimatedCost: item.estimatedCost,
      estimatedTimeMinutes: item.estimatedTimeMinutes
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      type: 'SERVICE',
      name: '',
      description: '',
      estimatedCost: 0,
      estimatedTimeMinutes: 0
    });
  };

  const formatCurrency = (amount: number) => {
    return `Rs. ${amount.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours === 0) {
      return `${mins}m`;
    } else if (mins === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${mins}m`;
    }
  };

  const serviceCount = items.filter(item => item.type === 'SERVICE').length;
  const modificationCount = items.filter(item => item.type === 'MODIFICATION').length;

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  const goToNextPage = () => {
    setCurrentPage((page) => Math.min(page + 1, totalPages));
  };

  const goToPreviousPage = () => {
    setCurrentPage((page) => Math.max(page - 1, 1));
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <AdminHeader title="Service Types Management" />

      {/* Loading State */}
      {loading ? (
        <div className="py-20 text-center text-gray-400">
          <div className="inline-block animate-spin rounded-full h-7 w-7 border-b-2 border-orange-600 mb-3 mx-auto"></div>
          <p className="text-sm">Loading service types...</p>
        </div>
      ) : (
        <>
          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-0 sm:px-6 lg:px-0 py-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-zinc-900 rounded-lg shadow-md p-6 border border-zinc-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Types</p>
                    <p className="text-3xl font-bold text-white mt-1">{items.length}</p>
                  </div>
                  <Wrench className="w-12 h-12 text-blue-500" />
                </div>
              </div>

              <div className="bg-zinc-900 rounded-lg shadow-md p-6 border border-zinc-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Services</p>
                    <p className="text-3xl font-bold text-green-500 mt-1">{serviceCount}</p>
                  </div>
                  <Wrench className="w-12 h-12 text-green-500" />
                </div>
              </div>

              <div className="bg-zinc-900 rounded-lg shadow-md p-6 border border-zinc-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Modifications</p>
                    <p className="text-3xl font-bold text-orange-500 mt-1">{modificationCount}</p>
                  </div>
                  <Wrench className="w-12 h-12 text-orange-500" />
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="bg-zinc-900 rounded-lg shadow-md p-3 border border-zinc-800 mb-5">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search by name or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>

                {/* Type Filter */}
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value as 'ALL' | 'SERVICE' | 'MODIFICATION')}
                    className="pl-10 pr-3 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                  >
                    <option value="ALL">All Types</option>
                    <option value="SERVICE">Services</option>
                    <option value="MODIFICATION">Modifications</option>
                  </select>
                </div>

                {/* Add Button */}
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-3 rounded-lg flex items-center gap-2 transition"
                >
                  <Plus className="w-4 h-4" />
                  Add Service Type
                </button>
              </div>
            </div>

            {/* Service Types Table */}
            <div className="bg-zinc-900 rounded-lg shadow-md border border-zinc-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-zinc-800 border-b border-zinc-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white">Name</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white">Type</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white">Description</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-white">Duration</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-white">Estimated Cost</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-white">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                          Loading service types...
                        </td>
                      </tr>
                    ) : filteredItems.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                          No service types found
                        </td>
                      </tr>
                    ) : (
                      currentItems.map(item => (
                        <tr
                          key={item.id}
                          className="border-b border-zinc-800 hover:bg-zinc-800/50 transition"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Wrench className="w-5 h-5 text-orange-500" />
                              <p className="font-semibold text-white">{item.name}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                item.type === 'SERVICE'
                                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                  : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                              }`}
                            >
                              {item.type}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-gray-300 text-sm line-clamp-2">{item.description}</p>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-1 text-gray-300">
                              <Clock className="w-4 h-4" />
                              <span className="font-semibold">{formatDuration(item.estimatedTimeMinutes)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1 text-white">
                              <span className="font-semibold">{formatCurrency(item.estimatedCost)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => openEditModal(item)}
                                className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteItem(item.id)}
                                className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {filteredItems.length > 0 && (
                <div className="px-6 py-4 border-t border-zinc-800 flex items-center justify-between">
                  <div className="text-sm text-gray-400">
                    Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredItems.length)} of {filteredItems.length} items
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1}
                      className={`p-2 rounded-lg transition ${
                        currentPage === 1
                          ? 'bg-zinc-800 text-gray-600 cursor-not-allowed'
                          : 'bg-zinc-800 text-white hover:bg-zinc-700'
                      }`}
                      title="Previous page"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-sm text-white px-4">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                      className={`p-2 rounded-lg transition ${
                        currentPage === totalPages
                          ? 'bg-zinc-800 text-gray-600 cursor-not-allowed'
                          : 'bg-zinc-800 text-white hover:bg-zinc-700'
                      }`}
                      title="Next page"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Add Modal */}
          {showAddModal && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-zinc-900 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-zinc-800">
                <div className="bg-linear-to-r from-zinc-800 to-zinc-700 text-white p-6 border-b border-zinc-700 flex items-center justify-between">
                  <h3 className="text-2xl font-bold">Add New Service Type</h3>
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      resetForm();
                    }}
                    className="text-white hover:bg-white/20 p-2 rounded-lg transition"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleAddItem} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Type *
                    </label>
                    <select
                      required
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as AppointmentType })}
                      className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="SERVICE">Service</option>
                      <option value="MODIFICATION">Modification</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="e.g., Oil Change, Brake Inspection"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Description *
                    </label>
                    <textarea
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Describe the service or modification..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">
                        Estimated Duration (minutes) *
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={formData.estimatedTimeMinutes}
                        onChange={(e) => setFormData({ ...formData, estimatedTimeMinutes: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">
                        Estimated Cost (Rs.) *
                      </label>
                      <input
                        type="number"
                        required
                        min="0.01"
                        step="0.01"
                        value={formData.estimatedCost}
                        onChange={(e) => setFormData({ ...formData, estimatedCost: parseFloat(e.target.value) || 0 })}
                        className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddModal(false);
                        resetForm();
                      }}
                      className="flex-1 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-semibold transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Adding...' : 'Add Service Type'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Edit Modal */}
          {showEditModal && selectedItem && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-zinc-900 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-zinc-800">
                <div className="bg-linear-to-r from-zinc-800 to-zinc-700 text-white p-6 border-b border-zinc-700 flex items-center justify-between">
                  <h3 className="text-2xl font-bold">Edit Service Type</h3>
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedItem(null);
                      resetForm();
                    }}
                    className="text-white hover:bg-white/20 p-2 rounded-lg transition"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleEditItem} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Type *
                    </label>
                    <select
                      required
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as AppointmentType })}
                      className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="SERVICE">Service</option>
                      <option value="MODIFICATION">Modification</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="e.g., Oil Change, Brake Inspection"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Description *
                    </label>
                    <textarea
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Describe the service or modification..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">
                        Estimated Duration (minutes) *
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={formData.estimatedTimeMinutes}
                        onChange={(e) => setFormData({ ...formData, estimatedTimeMinutes: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">
                        Estimated Cost (Rs.) *
                      </label>
                      <input
                        type="number"
                        required
                        min="0.01"
                        step="0.01"
                        value={formData.estimatedCost}
                        onChange={(e) => setFormData({ ...formData, estimatedCost: parseFloat(e.target.value) || 0 })}
                        className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditModal(false);
                        setSelectedItem(null);
                        resetForm();
                      }}
                      className="flex-1 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-semibold transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Updating...' : 'Update Service Type'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminServiceTypes;
