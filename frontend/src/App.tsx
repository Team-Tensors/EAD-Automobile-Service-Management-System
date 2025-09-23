
import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/loginPage'
import RegisterPage from './pages/registerPage'
import DashboardRouter from './pages/DashboardRouter'
import { ProtectedRoute, PublicRoute } from './guards/ProtectedRoute'

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
