// src/components/AdminSidebar.tsx
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, BarChart3, LogOut, Bell, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth'; // Assuming this path

type NavSection = 'dashboard' | 'inventory' | 'analytics' | 'notifications'; // Extend as needed

const AdminSidebar = () => {
  const location = useLocation();
  const { logout } = useAuth(); // Assuming useAuth provides logout
  // const navigate = useNavigate(); // uncomment if you need to navigate after logout

  const getActiveAdminSection = (): NavSection => {
    const path = location.pathname;
    if (path.includes('/admin/analytics')) return 'analytics';
    if (path.includes('/admin/inventory')) return 'inventory';
    if (path.includes('/admin/notifications')) return 'notifications';
    return 'dashboard'; // default for /admin or /admin/dashboard
  };

  const activeAdminSection = getActiveAdminSection();

  const adminDashboardLinks = [
    { id: 'dashboard' as NavSection, name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { id: 'inventory' as NavSection, name: 'Inventory', path: '/admin/inventory', icon: Package },
    { id: 'analytics' as NavSection, name: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      // navigate('/login'); // Optional: redirect to login page after logout
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    // Sidebar placed in the normal document flow so it scrolls with the page
    <aside
      className={
        // fixed typo in class and add left margin of 120px to create space before the sidebar
        "w-64 flex-shrink-0 bg-zinc-950/80 p-4 border border-zinc-800 rounded-xl flex flex-col ml-[120px] mr-5 max-h-[700px] overflow-y-auto"
      }
      aria-label="Admin sidebar"
    >
      {/* Logo - can be removed if MainNavbar already has it, or kept for admin context */}
      <div className="mb-8 flex items-center justify-center">
        <Link to="/admin/dashboard" className="flex items-center space-x-2">
            <span className="text-3xl font-bold tracking-wider flex items-center">
            <span className="text-white font-heading">D</span>
            <span className="text-orange-600 font-heading">C</span>
            <span className="ml-2 border border-orange-600 text-white text-xs px-2 py-[2px] rounded-sm bg-black">
                Admin
            </span>
            </span>
        </Link>
        </div>


      <nav className="flex-grow">
        <ul className="space-y-2">
          {adminDashboardLinks.map((item) => {
            const IconComponent = item.icon;
            return (
              <li key={item.id}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors duration-200
                    ${
                      activeAdminSection === item.id
                        ? 'bg-orange-600 text-white shadow-md'
                        : 'text-gray-400 hover:bg-zinc-800 hover:text-white'
                    }`}
                >
                  <IconComponent size={20} />
                  <span className="font-medium">{item.name}</span>
                </Link>
              </li>
            );
          })}
          {/* Notifications as a separate item in the sidebar */}
          <li>
            <Link
              to="/admin/notifications"
              className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors duration-200
                ${
                  activeAdminSection === 'notifications'
                    ? 'bg-orange-600 text-white shadow-md'
                    : 'text-gray-400 hover:bg-zinc-800 hover:text-white'
                }`}
            >
              <Bell size={20} />
              <span className="font-medium">Notifications</span>
            </Link>
          </li>
        </ul>
      </nav>

      {/* Logout at the bottom */}
      <div className="mt-auto pt-4 border-t border-zinc-800">
        <Link
          to="/admin/profile" // Assuming an admin profile page
          className="flex items-center space-x-3 px-4 py-2 rounded-lg text-gray-400 hover:bg-zinc-800 hover:text-white transition-colors duration-200 mb-2"
        >
          <User size={20} />
          <span className="font-medium">Admin Profile</span>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-gray-400 hover:bg-zinc-800 hover:text-white transition-colors duration-200 text-left"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;