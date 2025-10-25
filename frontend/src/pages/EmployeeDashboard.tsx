// Employee Dashboard Component
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import AuthenticatedNavbar from '@/components/Navbar/AuthenticatedNavbar';

const EmployeeDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className='min-h-screen bg-background pt-12'>

       {/* Authenticated Navbar */}
      <AuthenticatedNavbar />
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 border-b border-zinc-700">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-white">Employee Dashboard</h1>
          <p className="text-gray-400 mt-2">
            Welcome back, {user?.fullName || `${user?.firstName} ${user?.lastName}`}!
          </p>
        </div>
      </div>
      <div className="p-5 max-w-6xl mx-auto">
     

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {/* Active Projects */}
        <div className="bg-white p-5 rounded-lg shadow-md border border-gray-200">
          <h3 className="mb-4 text-xl font-semibold text-blue-600">Active Projects</h3>
          <p className="text-gray-600 mb-4">Current service projects assigned to you</p>
          <div className="p-4 bg-gray-50 rounded">
            <p className="font-semibold">No active projects</p>
            <p className="text-sm text-gray-600">New assignments will appear here</p>
          </div>
        </div>

        {/* Time Logging */}
        <div className="bg-white p-5 rounded-lg shadow-md border border-gray-200">
          <h3 className="mb-4 text-xl font-semibold text-green-600">Log Time</h3>
          <p className="text-gray-600 mb-4">Track time spent on projects</p>
          <button className="w-full p-3 bg-green-600 text-white border-0 rounded hover:bg-green-700 transition-colors cursor-pointer text-base">
            Log Time
          </button>
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-white p-5 rounded-lg shadow-md border border-gray-200">
          <h3 className="mb-4 text-xl font-semibold text-yellow-500">Upcoming Appointments</h3>
          <p className="text-gray-600 mb-4">Scheduled customer appointments</p>
          <div className="p-4 bg-gray-50 rounded">
            <p className="font-semibold">No upcoming appointments</p>
            <p className="text-sm text-gray-600">Your schedule is clear</p>
          </div>
        </div>

        {/* Workload Summary */}
        <div className="bg-white p-5 rounded-lg shadow-md border border-gray-200">
          <h3 className="mb-4 text-xl font-semibold text-gray-600">Workload Summary</h3>
          <div className="flex justify-between mb-3">
            <span>Today's Hours:</span>
            <strong>0h</strong>
          </div>
          <div className="flex justify-between mb-3">
            <span>This Week:</span>
            <strong>0h</strong>
          </div>
          <div className="flex justify-between">
            <span>Active Projects:</span>
            <strong>0</strong>
          </div>
        </div>
      </div>

      {/* Recent Work */}
      <div className="mt-8 bg-white p-5 rounded-lg shadow-md border border-gray-200">
        <h3 className="mb-4 text-xl font-semibold">Recent Work</h3>
        <div className="p-5 text-center text-gray-600">
          <p>No recent work logged</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-5 bg-white p-5 rounded-lg shadow-md border border-gray-200">
        <h3 className="mb-4 text-xl font-semibold">Quick Actions</h3>
        <div className="flex gap-3 flex-wrap">
          <button className="px-5 py-3 bg-blue-600 text-white border-0 rounded hover:bg-blue-700 transition-colors cursor-pointer">
            Update Project Status
          </button>
          <button className="px-5 py-3 bg-cyan-600 text-white border-0 rounded hover:bg-cyan-700 transition-colors cursor-pointer">
            View Customer Requests
          </button>
          <button className="px-5 py-3 bg-gray-600 text-white border-0 rounded hover:bg-gray-700 transition-colors cursor-pointer">
            Generate Report
          </button>
        </div>
      </div>
    </div>
    </div>
    
  );
};

export default EmployeeDashboard;