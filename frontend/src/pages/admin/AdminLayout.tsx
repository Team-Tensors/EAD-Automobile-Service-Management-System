import { Outlet } from 'react-router-dom';
import AdminNavbar from '@/components/AdminNavbar/AdminNavbar';
import Footer from '@/components/Footer/Footer';
import AdminSidebar from '@/components/AdminNavbar/AdminSidebar';

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AdminNavbar />

      {/* Main area: sidebar left, content right - both flow and scroll together */}
      <div className="flex grow bg-black">
        <AdminSidebar />
        <main className="grow ">
          <Outlet />
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default AdminLayout;
