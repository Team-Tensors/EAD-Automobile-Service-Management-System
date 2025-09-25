// Authentication hook - separate file for Fast Refresh compatibility
import { useContext } from 'react';
import type { AuthContextType } from '../types/auth';
import { AuthContext } from '../context/authContextBase';

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context || Object.keys(context).length === 0) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};