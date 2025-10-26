import { Routes, Route, Link } from 'react-router-dom'
import LoginPage from './pages/loginPage'
import RegisterPage from './pages/registerPage'
import EmployeeRegisterPage from './pages/EmployeeRegisterPage'
import HomePage from './pages/HomePage'
import DashboardRouter from './pages/DashboardRouter'
import AdminRouter from './pages/admin/AdminRouter'
import OAuthCallback from './pages/OAuthCallback'
import CompleteProfilePage from './pages/CompleteProfilePage'
import { ProtectedRoute, PublicRoute } from './guards/ProtectedRoute'
import { UserRole } from './types/auth'
import AppointmentBookingPage from "./pages/AppoinmentBookingPage";
import AddVehiclePage from './pages/MyVehiclesPage'
import MyAppointmentsPage from "./pages/MyAppointmentsPage";

function App() {
  return (
    <Routes>
      {/* Home page - MUST BE FIRST */}
      <Route path="/" element={<HomePage />} />

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
      <Route
        path="/register/employee"
        element={
          <PublicRoute>
            <EmployeeRegisterPage />
          </PublicRoute>
        }
      />
      
      {/* OAuth callback route - accessible to everyone */}
      <Route path="/oauth/callback" element={<OAuthCallback />} />
      
      {/* Complete profile route - for OAuth users who need to add missing info */}
      <Route
        path="/complete-profile"
        element={
          <ProtectedRoute>
            <CompleteProfilePage />
          </ProtectedRoute>
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

      {/* Customer Appointment Route */}
      <Route
        path="/dashboard/appointments"
        element={
          <ProtectedRoute requiredRole={UserRole.CUSTOMER}>
            <AppointmentBookingPage />
          </ProtectedRoute>
        }
      />

      {/* Customer Appointment Routes */}
      <Route
        path="/my-appointments"
        element={
          <ProtectedRoute requiredRole={UserRole.CUSTOMER}>
            <MyAppointmentsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/appointment-booking"
        element={
          <ProtectedRoute requiredRole={UserRole.CUSTOMER}>
            <AppointmentBookingPage />
          </ProtectedRoute>
        }
      />

      {/* Admin routes with nested routing */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute requiredRole={UserRole.ADMIN}>
            <AdminRouter />
          </ProtectedRoute>
        }
      />

      {/* Legacy route for backward compatibility */}
      <Route
        path="/dashboard/appointments"
        element={
          <ProtectedRoute requiredRole={UserRole.CUSTOMER}>
            <MyAppointmentsPage />
          </ProtectedRoute>
        }
      />

        <Route
        path="/my-vehicle"
        element={
          <ProtectedRoute requiredRole={UserRole.CUSTOMER}>
            <AddVehiclePage />
          </ProtectedRoute>
        }
      />

      {/* Example: Permission-based route */}
      <Route
        path="/reports"
        element={
          <ProtectedRoute
            requiredPermission={{ resource: "reports", action: "read" }}
          >
            <div>Reports - Requires specific permission</div>
          </ProtectedRoute>
        }
      />

      {/* Fallback for unknown routes - MUST BE LAST */}
      <Route
        path="*"
        element={
          <div className="text-center p-12 text-gray-600">
            <h2 className="text-2xl font-bold mb-4">Page Not Found</h2>
            <p className="mb-4">The page you're looking for doesn't exist.</p>
            <Link
              to="/"
              className="text-blue-500 hover:text-blue-700 underline"
            >
              Go to Home
            </Link>
          </div>
        }
      />
    </Routes>
  );
}

export default App;
