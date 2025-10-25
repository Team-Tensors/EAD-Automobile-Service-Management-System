import { Outlet } from 'react-router-dom';
import AdminNavbar from '@/components/AdminNavbar/AdminNavbar';
import Footer from '@/components/Footer/Footer';

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AdminNavbar />
      <div className="grow">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};

export default AdminLayout;
