// Admin Dashboard Component
import React from 'react';
import { useAuth } from '../hooks/useAuth';

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-5">
      <div className="max-w-7xl mx-auto">
        <header className="bg-white rounded-2xl shadow-lg p-6 mb-8 border-l-4 border-orange-500">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-2xl font-bold">🔧</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-blue-800 bg-clip-text text-transparent">
                  🏭 AutoService Pro - Admin
                </h1>
                <p className="text-gray-600 mt-1 font-medium">
                  Welcome back, {user?.firstName} {user?.lastName} - System Administrator
                </p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white border-0 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 cursor-pointer font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              🚪 Logout
            </button>
          </div>
        </header>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white p-6 rounded-2xl text-center shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
            <div className="text-4xl mb-3">👥</div>
            <h3 className="m-0 mb-2 text-lg font-semibold">Total Users</h3>
            <p className="text-3xl font-bold m-0">0</p>
            <p className="text-blue-100 text-sm mt-2">Registered Customers</p>
          </div>
          
          <div className="bg-gradient-to-br from-green-500 to-green-700 text-white p-6 rounded-2xl text-center shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
            <div className="text-4xl mb-3">🔧</div>
            <h3 className="m-0 mb-2 text-lg font-semibold">Active Services</h3>
            <p className="text-3xl font-bold m-0">0</p>
            <p className="text-green-100 text-sm mt-2">In Progress</p>
          </div>
          
          <div className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white p-6 rounded-2xl text-center shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
            <div className="text-4xl mb-3">⏳</div>
            <h3 className="m-0 mb-2 text-lg font-semibold">Pending Requests</h3>
            <p className="text-3xl font-bold m-0">0</p>
            <p className="text-orange-100 text-sm mt-2">Awaiting Review</p>
          </div>
          
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-6 rounded-2xl text-center shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
            <div className="text-4xl mb-3">💰</div>
            <h3 className="m-0 mb-2 text-lg font-semibold">Revenue</h3>
            <p className="text-3xl font-bold m-0">$0</p>
            <p className="text-emerald-100 text-sm mt-2">Monthly Total</p>
          </div>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {/* User Management */}
        <div className="bg-white p-5 rounded-lg shadow-md border border-gray-200">
          <h3 className="mb-4 text-xl font-semibold text-blue-600">User Management</h3>
          <p className="text-gray-600 mb-4">Manage customers and employees</p>
          <div className="flex flex-col gap-3">
            <button className="p-3 bg-blue-600 text-white border-0 rounded hover:bg-blue-700 transition-colors cursor-pointer">
              View All Users
            </button>
            <button className="p-3 bg-green-600 text-white border-0 rounded hover:bg-green-700 transition-colors cursor-pointer">
              Add Employee
            </button>
          </div>
        </div>

        {/* Service Management */}
        <div className="bg-white p-5 rounded-lg shadow-md border border-gray-200">
          <h3 className="mb-4 text-xl font-semibold text-green-600">Service Management</h3>
          <p className="text-gray-600 mb-4">Oversee all service operations</p>
          <div className="flex flex-col gap-3">
            <button className="p-3 bg-green-600 text-white border-0 rounded hover:bg-green-700 transition-colors cursor-pointer">
              View All Services
            </button>
            <button className="p-3 bg-yellow-400 text-black border-0 rounded hover:bg-yellow-500 transition-colors cursor-pointer">
              Assign Projects
            </button>
          </div>
        </div>

        {/* Reports & Analytics */}
        <div className="bg-white p-5 rounded-lg shadow-md border border-gray-200">
          <h3 className="mb-4 text-xl font-semibold text-gray-600">Reports & Analytics</h3>
          <p className="text-gray-600 mb-4">View system analytics</p>
          <div className="flex flex-col gap-3">
            <button className="p-3 bg-gray-600 text-white border-0 rounded hover:bg-gray-700 transition-colors cursor-pointer">
              Generate Reports
            </button>
            <button className="p-3 bg-cyan-600 text-white border-0 rounded hover:bg-cyan-700 transition-colors cursor-pointer">
              View Analytics
            </button>
          </div>
        </div>

        {/* System Settings */}
        <div className="bg-white p-5 rounded-lg shadow-md border border-gray-200">
          <h3 className="mb-4 text-xl font-semibold text-red-600">System Settings</h3>
          <p className="text-gray-600 mb-4">Configure system parameters</p>
          <div className="flex flex-col gap-3">
            <button className="p-3 bg-red-600 text-white border-0 rounded hover:bg-red-700 transition-colors cursor-pointer">
              System Settings
            </button>
            <button className="p-3 bg-orange-500 text-white border-0 rounded hover:bg-orange-600 transition-colors cursor-pointer">
              Backup & Restore
            </button>
          </div>
        </div>
      </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
          <h3 className="mb-4 text-xl font-semibold text-slate-800 flex items-center">
            📊 Recent System Activity
          </h3>
          <div className="p-5 text-center text-gray-600">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📈</span>
            </div>
            <p className="font-medium">No recent activity to display</p>
            <p className="text-sm text-gray-500 mt-2">System activities will appear here</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;