import { useState, useEffect } from 'react';
import {
  Calendar,
  Package,
  Plus,
  Search,
  AlertCircle,
  Trash2,
  X,
  PackagePlus,
  Filter,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { inventoryService } from '../../services/inventoryService';
import type { InventoryItem, InventoryItemCreateDto } from '../../types/inventory';

const CATEGORIES = [
  'Lubricant',
  'Filter',
  'Spare Part',
  'Brake Component',
  'Battery',
  'Tire',
  'Belt',
  'Fluid',
  'Electrical',
  'Body Part',
  'Other'
];

const AdminInventory = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [restockQuantity, setRestockQuantity] = useState(0);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Form state for adding new item
  const [formData, setFormData] = useState<InventoryItemCreateDto>({
    itemName: '',
    description: '',
    quantity: 0,
    unitPrice: 0,
    category: 'Spare Part',
    minStock: 10
  });

  // Load inventory items
  useEffect(() => {
    loadInventory();
  }, []);

  // Filter items based on search and category
  useEffect(() => {
    let filtered = items;

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredItems(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [items, searchQuery, selectedCategory]);

  const loadInventory = async () => {
    try {
      setLoading(true);
      const data = await inventoryService.list();
      setItems(data);
    } catch (error) {
      console.error('Failed to load inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await inventoryService.create(formData);
      setShowAddModal(false);
      resetForm();
      loadInventory();
    } catch (error: any) {
      console.error('Failed to add item:', error);
      alert(error.response?.data?.message || 'Failed to add item');
    }
  };

  const handleRestock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || restockQuantity <= 0) return;

    try {
      await inventoryService.restock(selectedItem.id, { quantity: restockQuantity });
      setShowRestockModal(false);
      setSelectedItem(null);
      setRestockQuantity(0);
      loadInventory();
    } catch (error: any) {
      console.error('Failed to restock:', error);
      alert(error.response?.data?.message || 'Failed to restock item');
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      await inventoryService.remove(id);
      loadInventory();
    } catch (error: any) {
      console.error('Failed to delete item:', error);
      alert(error.response?.data?.message || 'Failed to delete item');
    }
  };

  const resetForm = () => {
    setFormData({
      itemName: '',
      description: '',
      quantity: 0,
      unitPrice: 0,
      category: 'Spare Part',
      minStock: 10
    });
  };

  const formatCurrency = (amount: number) => {
    return `Rs. ${amount.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const lowStockCount = items.filter(item => item.lowStock).length;

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
      <header className="bg-gradient-to-r from-black to-zinc-950 text-white shadow-lg border-b border-zinc-700 mt-0">
        <div className="max-w-7xl mx-auto px-0 pt-26 pb-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Inventory Management</h1>
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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-zinc-900 rounded-lg shadow-md p-6 border border-zinc-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Items</p>
                <p className="text-3xl font-bold text-white mt-1">{items.length}</p>
              </div>
              <Package className="w-12 h-12 text-blue-500" />
            </div>
          </div>

          <div className="bg-zinc-900 rounded-lg shadow-md p-6 border border-zinc-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Low Stock Items</p>
                <p className="text-3xl font-bold text-orange-500 mt-1">{lowStockCount}</p>
              </div>
              <AlertCircle className="w-12 h-12 text-orange-500" />
            </div>
          </div>

          <div className="bg-zinc-900 rounded-lg shadow-md p-6 border border-zinc-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Value</p>
                <p className="text-3xl font-bold text-green-500 mt-1">
                  {formatCurrency(items.reduce((sum, item) => sum + item.totalValue, 0))}
                </p>
              </div>
              <PackagePlus className="w-12 h-12 text-green-500" />
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-zinc-900 rounded-lg shadow-md p-6 border border-zinc-800 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by item name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-10 pr-8 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
              >
                <option value="All">All Categories</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Add Item Button */}
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition"
            >
              <Plus className="w-5 h-5" />
              Add Item
            </button>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-zinc-900 rounded-lg shadow-md border border-zinc-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-800 border-b border-zinc-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Item Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Category</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-white">Quantity</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-white">Min Stock</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-white">Unit Price</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-white">Total Value</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-white">Last Update</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                      Loading inventory...
                    </td>
                  </tr>
                ) : filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                      No items found
                    </td>
                  </tr>
                ) : (
                  currentItems.map(item => (
                    <tr
                      key={item.id}
                      className={`border-b border-zinc-800 hover:bg-zinc-800/50 transition ${
                        item.lowStock ? 'bg-red-500/5' : ''
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-white">{item.itemName}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-semibold">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`font-semibold ${item.lowStock ? 'text-red-500' : 'text-white'}`}>
                          {item.quantity}
                          {item.lowStock && <AlertCircle className="w-4 h-4 inline ml-1" />}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-gray-400">{item.minStock}</td>
                      <td className="px-6 py-4 text-right text-white">{formatCurrency(item.unitPrice)}</td>
                      <td className="px-6 py-4 text-right font-semibold text-white">
                        {formatCurrency(item.totalValue)}
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-400">
                        {formatDate(item.lastUpdated)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedItem(item);
                              setShowRestockModal(true);
                            }}
                            className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition"
                            title="Restock"
                          >
                            <PackagePlus className="w-4 h-4" />
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

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-zinc-800">
            <div className="bg-gradient-to-r from-zinc-800 to-zinc-700 text-white p-6 border-b border-zinc-700 flex items-center justify-between">
              <h3 className="text-2xl font-bold">Add New Item</h3>
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
                  Item Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.itemName}
                  onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g., Engine Oil 5W-30"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Item description..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Category *
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Unit Price (Rs.) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0.01"
                    step="0.01"
                    value={formData.unitPrice}
                    onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Minimum Stock *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.minStock}
                    onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) || 10 })}
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
                  className="flex-1 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition"
                >
                  Add Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Restock Modal */}
      {showRestockModal && selectedItem && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 rounded-lg shadow-2xl max-w-md w-full border border-zinc-800">
            <div className="bg-gradient-to-r from-zinc-800 to-zinc-700 text-white p-6 border-b border-zinc-700 flex items-center justify-between">
              <h3 className="text-2xl font-bold">Restock Item</h3>
              <button
                onClick={() => {
                  setShowRestockModal(false);
                  setSelectedItem(null);
                  setRestockQuantity(0);
                }}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleRestock} className="p-6 space-y-4">
              <div className="bg-zinc-800 p-4 rounded-lg border border-zinc-700">
                <p className="text-sm text-gray-400 mb-1">Item</p>
                <p className="font-semibold text-white">{selectedItem.itemName}</p>
                <p className="text-sm text-gray-400 mt-2 mb-1">Current Stock</p>
                <p className="text-2xl font-bold text-white">{selectedItem.quantity} units</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Restock Quantity *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={restockQuantity}
                  onChange={(e) => setRestockQuantity(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter quantity to add"
                />
              </div>

              {restockQuantity > 0 && (
                <div className="bg-green-500/10 border border-green-500/30 p-4 rounded-lg">
                  <p className="text-sm text-green-400 mb-1">New Stock Level</p>
                  <p className="text-2xl font-bold text-green-400">
                    {selectedItem.quantity + restockQuantity} units
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowRestockModal(false);
                    setSelectedItem(null);
                    setRestockQuantity(0);
                  }}
                  className="flex-1 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition"
                >
                  Restock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInventory;
