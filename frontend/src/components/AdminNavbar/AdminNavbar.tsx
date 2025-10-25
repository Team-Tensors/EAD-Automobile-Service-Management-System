import { User, LayoutDashboard, BarChart3, Package, Bell } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import type { NavSection } from '@/types/admin';

const AdminNavbar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Extract active section from URL path
  const getActiveSection = (): NavSection => {
    const path = location.pathname.split('/').pop();
    if (path === 'analytics' || path === 'inventory' || path === 'notifications') {
      return path;
    }
    return 'dashboard'; // default
  };

  const activeSection = getActiveSection();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleNavigation = (section: NavSection) => {
    navigate(`/admin/${section}`);
  };

  const navItems = [
    { id: 'dashboard' as NavSection, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'analytics' as NavSection, label: 'Analytics', icon: BarChart3 },
    { id: 'inventory' as NavSection, label: 'Inventory', icon: Package },
    { id: 'notifications' as NavSection, label: 'Notifications', icon: Bell }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-white tracking-wider">
              DRIVE<span className="text-orange-500">CARE</span>
            </span>
            <span className="text-xs text-gray-400 ml-2">Admin</span>
          </div>

          {/* Navigation Sections */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all cursor-pointer ${
                    activeSection === item.id
                      ? 'bg-orange-500 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* User Section */}
          <div className="flex items-center gap-4">
            <button 
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition text-sm  cursor-pointer"
            >
              Logout
            </button>
            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center cursor-pointer">
              <User className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;
