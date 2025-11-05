// EmployeeInventory.tsx
import React from 'react';
import { useState, useEffect } from 'react';
import {
  Package,
  Search,
  AlertCircle,
  ListChecks,
  X,
  Filter,
  Calendar,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import AuthenticatedNavbar from "@/components/Navbar/AuthenticatedNavbar";
import { inventoryService } from '../services/inventoryService';
import type { InventoryItem } from '../types/inventory';

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

const EmployeeInventory = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showGetModal, setShowGetModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [getQuantity, setGetQuantity] = useState(0);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Load inventory items
  useEffect(() => {
    loadInventory();
  }, []);

  // Filter items based on search and category
  useEffect(() => {
    let filtered = items;
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
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

  const handleGetItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || getQuantity <= 0) return;
    try {
      await inventoryService.buy(selectedItem.id, { quantity: getQuantity });
      setShowGetModal(false);
      setSelectedItem(null);
      setGetQuantity(0);
      loadInventory();
    } catch (error: any) {
      console.error('Failed to get item:', error);
      alert(error.response?.data?.message || 'Failed to get item');
    }
  };

  const formatCurrency = (amount: number) => {
    return `Rs. ${amount.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const lowStockCount = items.filter(item => item.lowStock).length;
  const availableItems = items.filter(item => item.quantity > 0).length;

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
      <AuthenticatedNavbar />
      {/* Header */}
      <header className="bg-gradient-to-r from-black to-zinc-950 text-white shadow-lg border-b border-zinc-700 mt-0">
        <div className="max-w-7xl mx-auto px-0 pt-26 pb-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Employee Inventory</h1>
              <p className="text-gray-300 mt-1">
                Welcome back, {user?.firstName} {user?.lastName}!
              </p>
            </div>
            <div className="flex items-center gap-3 bg-zinc-800/50 px-4 py-2 rounded-lg border border-zinc-600">
              <Calendar className="w-5 h-5 text-gray-300" />
              <span className="font-semibold">{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-0 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-zinc-900 rounded-lg shadow-md p-6 border border-zinc-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Items</p>
                <p className="text-3xl font-bold text-white mt-1">{items.length}</p>
              </div>
              <Package className="w-12 h-12 text-blue-500" />
            </div>
          </div>
          <div className="bg-zinc-900 rounded-lg shadow-md p-6 border border-zinc-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Available Items</p>
                <p className="text-3xl font-bold text-green-500 mt-1">{availableItems}</p>
              </div>
              <ListChecks className="w-12 h-12 text-green-500" />
            </div>
          </div>
          <div className="bg-zinc-900 rounded-lg shadow-md p-6 border border-zinc-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Low Stock Alerts</p>
                <p className="text-3xl font-bold text-orange-500 mt-1">{lowStockCount}</p>
              </div>
              <AlertCircle className="w-12 h-12 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-zinc-900 rounded-lg shadow-md p-6 border border-zinc-700 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by item name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-600 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-10 pr-8 py-3 bg-zinc-800 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
              >
                <option value="All">All Categories</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-zinc-900 rounded-lg shadow-md border border-zinc-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-800 border-b border-zinc-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Item Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Category</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">Quantity</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">Min Stock</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">Unit Price</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                      Loading inventory...
                    </td>
                  </tr>
                ) : filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                      No items found
                    </td>
                  </tr>
                ) : (
                  currentItems.map(item => (
                    <tr
                      key={item.id}
                      className={`border-b border-zinc-700 hover:bg-zinc-800/50 transition ${
                        item.lowStock ? 'bg-orange-500/5' : ''
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div>
                            <p className="font-semibold text-white">{item.itemName}</p>
                            <p className="text-xs text-gray-400">{item.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-semibold">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`font-semibold ${item.quantity === 0 ? 'text-red-500' : item.lowStock ? 'text-orange-500' : 'text-white'}`}>
                          {item.quantity}
                          {item.lowStock && item.quantity > 0 && <AlertCircle className="w-4 h-4 inline ml-1" />}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-gray-400">{item.minStock}</td>
                      <td className="px-6 py-4 text-right text-white">{formatCurrency(item.unitPrice)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center">
                          <button
                            onClick={() => {
                              setSelectedItem(item);
                              setShowGetModal(true);
                            }}
                            disabled={item.quantity === 0}
                            className={`px-4 py-2 rounded-lg font-normal flex items-center gap-2 transition ${
                              item.quantity === 0
                                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                : 'bg-orange-500 hover:bg-orange-600 text-white'
                            }`}
                          >
                            Get Item
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
            <div className="px-6 py-4 border-t border-zinc-700 flex items-center justify-between">
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

      {/* Get Item Modal */}
      {showGetModal && selectedItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 rounded-lg shadow-2xl max-w-md w-full border border-zinc-700">
            <div className="bg-gradient-to-r from-zinc-800 to-zinc-700 text-white p-6 border-b border-zinc-600 flex items-center justify-between">
              <h3 className="text-2xl font-bold">Get Item</h3>
              <button
                onClick={() => {
                  setShowGetModal(false);
                  setSelectedItem(null);
                  setGetQuantity(0);
                }}
                className="text-gray-300 hover:bg-zinc-600 p-2 rounded-lg transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleGetItem} className="p-6 space-y-4">
              <div className="bg-zinc-800 p-4 rounded-lg border border-zinc-600">
                <p className="text-sm text-gray-400 mb-1">Item</p>
                <p className="font-semibold text-white">{selectedItem.itemName}</p>
                <p className="text-sm text-gray-400 mt-2 mb-1">Available Stock</p>
                <p className="text-2xl font-bold text-white">{selectedItem.quantity} units</p>
                <p className="text-sm text-gray-400 mt-2 mb-1">Unit Price</p>
                <p className="text-lg font-semibold text-white">{formatCurrency(selectedItem.unitPrice)}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Quantity to Get
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max={selectedItem.quantity}
                  value={getQuantity}
                  onChange={(e) => setGetQuantity(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-600 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter quantity"
                />
              </div>
              {getQuantity > 0 && getQuantity <= selectedItem.quantity && (
                <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-lg">
                  <p className="text-sm text-gray-400 mb-1">Total Value</p>
                  <p className="text-sm font-bold text-gray-400">
                    {formatCurrency(selectedItem.unitPrice * getQuantity)}
                  </p>
                  <p className="text-xl text-blue-400 mt-2">
                    Remaining stock: {selectedItem.quantity - getQuantity} units
                  </p>
                </div>
              )}
              {getQuantity > selectedItem.quantity && (
                <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-lg">
                  <p className="text-sm text-red-400">
                    Insufficient stock! Maximum available: {selectedItem.quantity} units
                  </p>
                </div>
              )}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowGetModal(false);
                    setSelectedItem(null);
                    setGetQuantity(0);
                  }}
                  className="flex-1 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={getQuantity <= 0 || getQuantity > selectedItem.quantity}
                  className={`flex-1 px-6 py-3 rounded-lg font-semibold transition ${
                    getQuantity > 0 && getQuantity <= selectedItem.quantity
                      ? 'bg-orange-500 hover:bg-orange-600 text-white'
                      : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeInventory;