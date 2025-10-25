import { Link, useLocation, useNavigate } from "react-router-dom";
import { User, LayoutDashboard, Calendar } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import type { LucideIcon } from "lucide-react";

interface NavTab {
  name: string;
  path: string;
  icon: LucideIcon;
  roles?: string[]; // Optional: restrict tab to specific roles
}

const AuthenticatedNavbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Define navigation tabs
  const navTabs: NavTab[] = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Appointments", path: "/dashboard/appointments", icon: Calendar, roles: ['CUSTOMER'] },
    // Add more tabs here as needed
  ];

  // Filter tabs based on user role if roles are specified
  const availableTabs = navTabs.filter(tab => {
    if (!tab.roles) return true; // No role restriction
    return user?.roles?.some(role => tab.roles?.includes(role)) || 
           (user?.role && tab.roles?.includes(user.role));
  });

  const isActiveTab = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="fixed top-6 left-0 right-0 z-50 pointer-events-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pointer-events-auto">
        <div className="bg-zinc-950/80 backdrop-blur-sm border border-zinc-800 rounded-xl shadow-lg px-4 sm:px-6 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-white tracking-wider">
              DRIVE<span className="text-orange-500">CARE</span>
            </span>
          </Link>

          {/* Navigation Tabs */}
          <div className="hidden md:flex items-center space-x-1">
            {availableTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.path}
                  to={tab.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all cursor-pointer ${
                    isActiveTab(tab.path)
                      ? 'bg-orange-500 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.name}
                </Link>
              );
            })}
          </div>

          {/* User Info & Actions */}
          <div className="flex items-center gap-4">
            {/* Logout Button */}
            <button 
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition text-sm cursor-pointer"
            >
              Logout
            </button>
            
            {/* User Avatar */}
            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center cursor-pointer">
              <User className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AuthenticatedNavbar;
