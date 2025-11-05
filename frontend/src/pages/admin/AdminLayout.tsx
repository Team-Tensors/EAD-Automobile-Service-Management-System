import { Outlet } from 'react-router-dom';
import AuthenticatedNavbar from '@/components/Navbar/AuthenticatedNavbar';
import Footer from '@/components/Footer/Footer';

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-black flex flex-col">
      <AuthenticatedNavbar />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};

export default AdminLayout;
