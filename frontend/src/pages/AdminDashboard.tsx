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
    <div></div>    
  );
};

export default AdminDashboard;