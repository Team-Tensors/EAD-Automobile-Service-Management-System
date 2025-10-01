// Customer Dashboard Component
import React from 'react';
import { useAuth } from '../hooks/useAuth';

const CustomerDashboard: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="p-5 max-w-6xl mx-auto">
      <header className="flex justify-between items-center mb-8 pb-5 border-b border-gray-200">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customer Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {user?.firstName} {user?.lastName}!
          </p>
        </div>
        <button 
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white border-0 rounded hover:bg-red-700 transition-colors cursor-pointer"
        >
          Logout
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {/* Service Status */}
        <div className="bg-white p-5 rounded-lg shadow-md border border-gray-200">
          <h3 className="mb-4 text-xl font-semibold text-blue-600">My Services</h3>
          <p className="text-gray-600 mb-4">Track your vehicle service progress</p>
          <div className="p-4 bg-gray-50 rounded">
            <p className="font-semibold">No active services</p>
            <p className="text-sm text-gray-600">Book a service to see progress here</p>
          </div>
        </div>

        {/* Book Appointment */}
        <div className="bg-white p-5 rounded-lg shadow-md border border-gray-200">
          <h3 className="mb-4 text-xl font-semibold text-green-600">Book Appointment</h3>
          <p className="text-gray-600 mb-4">Schedule a vehicle service</p>
          <button className="w-full p-3 bg-green-600 text-white border-0 rounded hover:bg-green-700 transition-colors cursor-pointer text-base">
            Book Service
          </button>
        </div>

        {/* Request Modification */}
        <div className="bg-white p-5 rounded-lg shadow-md border border-gray-200">
          <h3 className="mb-4 text-xl font-semibold text-yellow-500">Request Modification</h3>
          <p className="text-gray-600 mb-4">Submit modification requests</p>
          <button className="w-full p-3 bg-yellow-400 text-black border-0 rounded hover:bg-yellow-500 transition-colors cursor-pointer text-base">
            Request Changes
          </button>
        </div>

        {/* Service History */}
        <div className="bg-white p-5 rounded-lg shadow-md border border-gray-200">
          <h3 className="mb-4 text-xl font-semibold text-gray-600">Service History</h3>
          <p className="text-gray-600 mb-4">View past services and projects</p>
          <div className="p-4 bg-gray-50 rounded">
            <p className="font-semibold">No service history</p>
            <p className="text-sm text-gray-600">Your completed services will appear here</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8 bg-white p-5 rounded-lg shadow-md border border-gray-200">
        <h3 className="mb-4 text-xl font-semibold">Recent Activity</h3>
        <div className="p-5 text-center text-gray-600">
          <p>No recent activity to display</p>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;