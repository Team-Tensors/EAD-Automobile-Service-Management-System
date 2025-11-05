import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, LayoutDashboard, BarChart3, Package, Bell, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import type { NavSection } from '@/types/admin';
import { useState, useRef, useEffect } from 'react';
import NotificationBell from '@/components/Notification/NotificationBell';

const AdminNavbar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navItems: { id: NavSection; label: string; icon: any }[] = [
    { id: 'dashboard' as NavSection, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'analytics' as NavSection, label: 'Analytics', icon: BarChart3 },
    { id: 'inventory' as NavSection, label: 'Inventory', icon: Package },
    { id: 'notifications' as NavSection, label: 'Notifications', icon: Bell }
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = (id: NavSection) => {
    return location.pathname.startsWith(`/admin/${id}`) || (id === 'dashboard' && location.pathname === '/admin');
  };

  return (
    <nav className="fixed top-6 left-0 right-0 z-50 pointer-events-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-0 pointer-events-auto">
        <div className="bg-zinc-950/80 backdrop-blur-sm border border-zinc-800 rounded-xl shadow-lg px-4 sm:px-6 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link to="/admin" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-white tracking-wider font-heading">
              DRIVE<span className="text-orange-600">CARE</span>
            </span>
            <span className="text-xs text-gray-400 ml-2">Admin</span>
          </Link>

          {/* Navigation Sections */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  to={`/admin/${item.id}`}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all cursor-pointer ${
                    isActive(item.id) ? 'text-orange-600' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* User Section */}
          <div className="flex items-center gap-4">
            <NotificationBell />

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-orange-700 transition-colors"
                title="Profile"
              >
                <User className="w-6 h-6 text-white" />
              </button>

              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-3 w-40 bg-zinc-900 border border-zinc-800 rounded-lg shadow-lg overflow-hidden z-50">
                  <Link
                    to="/admin/profile"
                    onClick={() => setIsProfileDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
                  >
                    <User className="w-4 h-4" />
                    <span className="text-sm font-medium">My Profile</span>
                  </Link>
                  <button
                    onClick={() => {
                      setIsProfileDropdownOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm font-medium">Log Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;
