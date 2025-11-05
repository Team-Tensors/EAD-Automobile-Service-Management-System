import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  User,
  LayoutDashboard,
  Calendar,
  Navigation,
  LogOut,
  Menu,
  X,
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

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
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Define navigation tabs
  const navTabs: NavTab[] = [
    { name: "DASHBOARD", path: "/dashboard", icon: LayoutDashboard },
    {
      name: "MY APPOINTMENTS",
      path: "/my-appointments",
      icon: Calendar,
      roles: ["CUSTOMER"],
    },
    {
      name: "MY VEHICLES",
      path: "/my-vehicles",
      icon: Car,
      roles: ["CUSTOMER"],
    },
    {
      name: "SERVICE CENTERS",
      path: "/service-centers",
      icon: Navigation,
      roles: ["CUSTOMER"],
    },
    {
      name: "INVENTORY",
      path: "/employee-inventory",
      icon: Navigation,
      roles: ["EMPLOYEE"],
    },
    // Admin tabs
    {
      name: "ANALYTICS",
      path: "/admin/analytics",
      icon: LayoutDashboard,
      roles: ["ADMIN"],
    },
    {
      name: "INVENTORY",
      path: "/admin/inventory",
      icon: Navigation,
      roles: ["ADMIN"],
    },
    {
      name: "NOTIFICATIONS",
      path: "/admin/notifications",
      icon: Calendar,
      roles: ["ADMIN"],
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
    <nav className="fixed top-3 sm:top-6 left-0 right-0 z-50 pointer-events-none">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-0 pointer-events-auto">
        <div className="bg-zinc-950/80 backdrop-blur-sm border border-zinc-800 rounded-xl shadow-lg px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between">
          {/* Logo */}
          <Link
            to={user?.roles?.includes("ADMIN") ? "/admin" : "/dashboard"}
            className="flex items-center space-x-1 sm:space-x-2"
          >
            <span className="text-lg sm:text-2xl font-bold text-white tracking-wider font-heading">
              DRIVE<span className="text-orange-600">CARE</span>
            </span>
            <span className="hidden sm:inline text-xs text-gray-400 ml-2">
              {user?.roles?.includes("ADMIN")
                ? "ADMIN"
                : user?.roles.join(", ")}
            </span>
          </Link>

          {/* Desktop Navigation Tabs */}
          <div className="hidden md:flex items-center space-x-1">
            {availableTabs.map((tab) => {
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
                  {tab.name}
                </Link>
              );
            })}
          </div>

          {/* User Info & Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Notification Bell */}
            <NotificationBell userId={user?.id} />

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-orange-700 transition-colors"
                title="Profile"
              >
                <User className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </button>

              {/* Dropdown Menu */}
              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-3 w-35 bg-zinc-900 border border-zinc-800 rounded-lg shadow-lg overflow-hidden z-50">
                  <Link
                    to={
                      user?.roles?.includes("ADMIN")
                        ? "/admin/profile"
                        : "/profile"
                    }
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

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div
            ref={mobileMenuRef}
            className="md:hidden mt-2 bg-zinc-950/95 backdrop-blur-sm border border-zinc-800 rounded-xl shadow-lg overflow-hidden"
          >
            <div className="py-2">
              {availableTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <Link
                    key={tab.path}
                    to={tab.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                      isActiveTab(tab.path)
                        ? "text-orange-600 bg-orange-500/10"
                        : "text-gray-400 hover:text-white hover:bg-zinc-800"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default AuthenticatedNavbar;
