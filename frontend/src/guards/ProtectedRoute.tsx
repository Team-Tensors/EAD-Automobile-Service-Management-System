// Protected Route Component for Role-Based Access Control
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { ProtectedRouteProps } from '../types/auth';
import { UserRole } from '../types/auth';

// Loading Component
const LoadingSpinner: React.FC = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    minHeight: '200px' 
  }}>
    <div style={{ 
      border: '4px solid #f3f3f3',
      borderTop: '4px solid #007bff',
      borderRadius: '50%',
      width: '40px',
      height: '40px',
      animation: 'spin 1s linear infinite'
    }} />
    <style>
      {`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}
    </style>
  </div>
);

// Unauthorized Access Component
const UnauthorizedAccess: React.FC<{ message?: string }> = ({ 
  message = "You don't have permission to access this page." 
}) => (
  <div style={{ 
    textAlign: 'center', 
    padding: '50px 20px',
    maxWidth: '500px',
    margin: '0 auto'
  }}>
    <h2 style={{ color: '#dc3545', marginBottom: '20px' }}>Access Denied</h2>
    <p style={{ marginBottom: '30px', color: '#666' }}>{message}</p>
    <button 
      onClick={() => window.history.back()}
      style={{
        padding: '10px 20px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
      }}
    >
      Go Back
    </button>
  </div>
);

// Protected Route Component
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  requiredPermission,
  fallback
}) => {
  const { isAuthenticated, isLoading, user, hasRole, hasPermission } = useAuth();
  const location = useLocation();

  // Show loading while checking authentication
  if (isLoading) {
    return fallback || <LoadingSpinner />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access
  if (requiredRole && !hasRole(requiredRole)) {
    return fallback || <UnauthorizedAccess message={`This page requires ${requiredRole} access.`} />;
  }

  // Check permission-based access
  if (requiredPermission && !hasPermission(requiredPermission.resource, requiredPermission.action)) {
    return fallback || <UnauthorizedAccess message="You don't have the required permissions." />;
  }

  return <>{children}</>;
};

// Convenience components for specific roles
export const CustomerRoute: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <ProtectedRoute requiredRole={UserRole.CUSTOMER} fallback={fallback}>
    {children}
  </ProtectedRoute>
);

export const EmployeeRoute: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <ProtectedRoute requiredRole={UserRole.EMPLOYEE} fallback={fallback}>
    {children}
  </ProtectedRoute>
);

export const AdminRoute: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <ProtectedRoute requiredRole={UserRole.ADMIN} fallback={fallback}>
    {children}
  </ProtectedRoute>
);

// Employee or Admin Route (for operations that require elevated access)
export const StaffRoute: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return fallback || <LoadingSpinner />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.role !== UserRole.EMPLOYEE && user.role !== UserRole.ADMIN) {
    return fallback || <UnauthorizedAccess message="This page requires staff access." />;
  }

  return <>{children}</>;
};

// Public Route (only accessible when NOT authenticated)
export const PublicRoute: React.FC<{ children: React.ReactNode; redirectTo?: string }> = ({ 
  children, 
  redirectTo = '/dashboard' 
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Only show loading spinner on initial app load, not during login attempts
  // The login form itself handles loading state with the submit button
  const isLoginOrRegisterPage = location.pathname === '/login' || location.pathname === '/register';
  
  if (isLoading && !isLoginOrRegisterPage) {
    return <LoadingSpinner />;
  }

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};