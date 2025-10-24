// Dashboard Router - Routes users to appropriate dashboard based on role
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types/auth';
import CustomerDashboard from './CustomerDashboard';
import EmployeeDashboard from './EmployeeDashboard';
import AdminDashboard from './AdminDashboard';

const DashboardRouter: React.FC = () => {
  const { user } = useAuth();

  // Debug logging
  console.log('DashboardRouter - User:', user);
  console.log('DashboardRouter - User role:', user?.role);
  console.log('DashboardRouter - User roles array:', user?.roles);

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

  // Get role from either user.role or first item in user.roles array
  const userRole = user.role || (user.roles && user.roles.length > 0 ? user.roles[0] : null);
  
  console.log('DashboardRouter - Determined role:', userRole);

  switch (userRole) {
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
          <p style={{ fontSize: '0.9em', marginTop: '20px', color: '#999' }}>
            Debug Info: Role = {userRole || 'undefined'}, Roles = {user.roles?.join(', ') || 'none'}
          </p>
        </div>
      );
  }
};

export default DashboardRouter;