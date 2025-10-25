import { Outlet } from 'react-router-dom';
import AdminNavbar from '@/components/AdminNavbar/AdminNavbar';
import Footer from '@/components/Footer/Footer';

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      <AdminNavbar />
      <Outlet />
      <Footer />
    </div>
  );
};

export default AdminLayout;
