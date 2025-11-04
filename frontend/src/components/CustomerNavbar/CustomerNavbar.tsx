import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  User,
  LayoutDashboard,
  Calendar,
  Navigation,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { type LucideIcon, Car } from "lucide-react";
import NotificationBell from "@/components/Notification/NotificationBell";
import { useState, useRef, useEffect } from "react";

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
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Define navigation tabs
  const navTabs: NavTab[] = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    {
      name: "My Appointments",
      path: "/my-appointments",
      icon: Calendar,
      roles: ["CUSTOMER"],
    },
    {
      name: "My Vehicles",
      path: "/my-vehicles",
      icon: Car,
      roles: ["CUSTOMER"],
    },
    {
      name: "Service Centers",
      path: "/service-centers",
      icon: Navigation,
      roles: ["CUSTOMER"],
    },
    // Add more tabs here as needed
  ];

  // Filter tabs based on user role if roles are specified
  const availableTabs = navTabs.filter((tab) => {
    if (!tab.roles) return true; // No role restriction
    return (
      user?.roles?.some((role) => tab.roles?.includes(role)) ||
      (user?.role && tab.roles?.includes(user.role))
    );
  });

  const isActiveTab = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed top-6 left-0 right-0 z-50 pointer-events-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-0 pointer-events-auto">
        <div className="bg-zinc-950/80 backdrop-blur-sm border border-zinc-800 rounded-xl shadow-lg px-4 sm:px-6 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-white tracking-wider font-heading">
              DRIVE<span className="text-orange-600">CARE</span>
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
                      ? "text-orange-600"
                      : "text-gray-400 hover:text-white"
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
            {/* Notification Bell */}
            <NotificationBell userId={user?.id} />

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-orange-700 transition-colors"
                title="Profile"
              >
                <User className="w-6 h-6 text-white" />
              </button>

              {/* Dropdown Menu */}
              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-3 w-35 bg-zinc-900 border border-zinc-800 rounded-lg shadow-lg overflow-hidden z-50">
                  <Link
                    to="/profile"
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

export default AuthenticatedNavbar;
