import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import AdminDashboard from './AdminDashboard';
import AdminAnalytics from './AdminAnalytics';
import AdminInventory from './AdminInventory';
import AdminNotifications from './AdminNotifications';
import AdminEmployees from './AdminEmployees';

const AdminRouter = () => {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        {/* Default redirect to dashboard */}
        <Route index element={<Navigate to="dashboard" replace />} />
        
        {/* Admin sub-routes */}
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="inventory" element={<AdminInventory />} />
        <Route path="employees" element={<AdminEmployees />} />
        <Route path="notifications" element={<AdminNotifications />} />
        
        {/* Fallback for unknown admin routes */}
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Route>
    </Routes>
  );
};

export default AdminRouter;
