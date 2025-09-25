// Dashboard Router - Routes users to appropriate dashboard based on role
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types/auth';
import CustomerDashboard from './CustomerDashboard';
import EmployeeDashboard from './EmployeeDashboard';
import AdminDashboard from './AdminDashboard';

const DashboardRouter: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '50px',
        color: '#666'
      }}>
        Loading your dashboard...
      </div>
    );
  }

  switch (user.role) {
    case UserRole.CUSTOMER:
      return <CustomerDashboard />;
    case UserRole.EMPLOYEE:
      return <EmployeeDashboard />;
    case UserRole.ADMIN:
      return <AdminDashboard />;
    default:
      return (
        <div style={{ 
          textAlign: 'center', 
          padding: '50px',
          color: '#dc3545'
        }}>
          <h2>Access Error</h2>
          <p>Unable to determine your dashboard. Please contact support.</p>
        </div>
      );
  }
};

export default DashboardRouter;