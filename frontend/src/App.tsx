import { Routes, Route } from 'react-router-dom'
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

      {/* Admin routes with nested routing */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute requiredRole={UserRole.ADMIN}>
            <AdminRouter />
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
            <div className="p-8 bg-blue-50 border-l-4 border-blue-500">
              <h1 className="text-xl font-semibold text-blue-700">
                Customer Portal
              </h1>
              <p className="text-blue-600">Only accessible by customers</p>
            </div>
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

      {/* Home page */}
      <Route path="/" element={<HomePage />} />

      {/* Fallback for unknown routes */}
      <Route
        path="*"
        element={
          <div className="text-center p-12 text-gray-600">
            <h2 className="text-2xl font-bold mb-4">Page Not Found</h2>
            <p className="mb-4">The page you're looking for doesn't exist.</p>
            <a
              href="/dashboard"
              className="text-blue-500 hover:text-blue-700 underline"
            >
              Go to Dashboard
            </a>
          </div>
        }
      />
    </Routes>
  );
}

export default App;



      {/* Example: Admin-only route */}
      {/* <Route
        path="/admin/*"
        element={
          <ProtectedRoute requiredRole={UserRole.ADMIN}>
            <div className="p-8 bg-red-50 border-l-4 border-red-500">
              <h1 className="text-xl font-semibold text-red-700">
                Admin Panel
              </h1>
              <p className="text-red-600">Only accessible by admins</p>
            </div>
          </ProtectedRoute>
        }
      /> */}

      {/* Example: Employee or Admin route (Staff) */}
      {/* <Route
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
      /> */}

      {/* Example: Customer-only route */}
      {/* <Route
        path="/customer/*"
        element={
          <ProtectedRoute requiredRole={UserRole.CUSTOMER}>
            <div className="p-8 bg-blue-50 border-l-4 border-blue-500">
              <h1 className="text-xl font-semibold text-blue-700">
                Customer Portal
              </h1>
              <p className="text-blue-600">Only accessible by customers</p>
            </div>
          </ProtectedRoute>
        }
      /> */}
