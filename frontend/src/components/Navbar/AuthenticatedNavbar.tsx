import { Link, useLocation, useNavigate } from "react-router-dom";
import { User, LogOut } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

interface NavTab {
  name: string;
  path: string;
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
    { name: "Dashboard", path: "/dashboard" },
    { name: "Appointments", path: "/dashboard/appointments", roles: ['CUSTOMER'] },
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
    <nav className="bg-zinc-950 text-white shadow-lg border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-white tracking-wider">
              DRIVE<span className="text-orange-500">CARE</span>
            </span>
          </Link>

          {/* Navigation Tabs */}
          <div className="hidden md:flex items-center space-x-1">
            {availableTabs.map((tab) => (
              <Link
                key={tab.path}
                to={tab.path}
                className={`px-6 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActiveTab(tab.path)
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                    : 'text-gray-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                {tab.name}
              </Link>
            ))}
          </div>

          {/* User Info & Actions */}
          <div className="flex items-center gap-4">
            {/* User Info */}
            <div className="hidden md:flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-white">
                  {user?.fullName || `${user?.firstName} ${user?.lastName}`}
                </p>
                <p className="text-xs text-gray-400">
                  {user?.role || user?.roles?.[0]}
                </p>
              </div>
              <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center border-2 border-orange-500/50">
                <User className="w-5 h-5 text-orange-500" />
              </div>
            </div>

            {/* Logout Button */}
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-500/10 text-red-400 px-4 py-2 rounded-lg font-medium hover:bg-red-500/20 transition-all duration-200 border border-red-500/30 hover:border-red-500/50"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="md:hidden flex items-center gap-2 pb-3 overflow-x-auto">
          {availableTabs.map((tab) => (
            <Link
              key={tab.path}
              to={tab.path}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap ${
                isActiveTab(tab.path)
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-400 bg-zinc-800 hover:text-white'
              }`}
            >
              {tab.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default AuthenticatedNavbar;
