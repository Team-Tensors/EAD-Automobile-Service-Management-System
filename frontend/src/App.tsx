
import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/loginPage'
import RegisterPage from './pages/registerPage'
import DashboardRouter from './pages/DashboardRouter'
import { ProtectedRoute, PublicRoute } from './guards/ProtectedRoute'
import { UserRole } from './types/auth'

function App() {
  return (
    <Routes>
      {/* Public routes (only accessible when NOT authenticated) */}
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        } 
      />
      <Route 
        path="/register" 
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        } 
      />
      
      {/* Protected routes (require authentication) */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <DashboardRouter />
          </ProtectedRoute>
        } 
      />
      
      {/* Example: Admin-only route */}
      <Route 
        path="/admin/*" 
        element={
          <ProtectedRoute requiredRole={UserRole.ADMIN}>
            <div>Admin Panel - Only accessible by admins</div>
          </ProtectedRoute>
        } 
      />
      
      {/* Example: Employee or Admin route (Staff) */}
      <Route 
        path="/staff/*" 
        element={
          <ProtectedRoute 
            requiredRole={UserRole.EMPLOYEE}
            fallback={
              <ProtectedRoute requiredRole={UserRole.ADMIN}>
                <div>Staff Panel - Accessible by employees and admins</div>
              </ProtectedRoute>
            }
          >
            <div>Staff Panel - Accessible by employees and admins</div>
          </ProtectedRoute>
        } 
      />
      
      {/* Example: Customer-only route */}
      <Route 
        path="/customer/*" 
        element={
          <ProtectedRoute requiredRole={UserRole.CUSTOMER}>
            <div>Customer Portal - Only accessible by customers</div>
          </ProtectedRoute>
        } 
      />
      
      {/* Example: Permission-based route */}
      <Route 
        path="/reports" 
        element={
          <ProtectedRoute 
            requiredPermission={{ resource: 'reports', action: 'read' }}
          >
            <div>Reports - Requires specific permission</div>
          </ProtectedRoute>
        } 
      />
      
      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      {/* Fallback for unknown routes */}
      <Route 
        path="*" 
        element={
          <div style={{ 
            textAlign: 'center', 
            padding: '50px',
            color: '#666'
          }}>
            <h2>Page Not Found</h2>
            <p>The page you're looking for doesn't exist.</p>
            <a href="/dashboard" style={{ color: '#007bff' }}>Go to Dashboard</a>
          </div>
        } 
      />
    </Routes>
  )
}

export default App
