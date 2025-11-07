import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, User, LayoutDashboard, LogOut, Settings } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Use targetId for in-page scrolling. If user is not on home page, navigate to
  // '/' and pass the target id via location.state so HomePage can scroll on mount.
  const navLinks = [
    { name: "HOME", targetId: "top" },
    { name: "ABOUT US", targetId: "choose-us" },
    { name: "SERVICES", targetId: "services" },
    { name: "CONTACT", targetId: "contact-us" },
  ];

  const navigateToSection = (targetId: string) => {
    if (!targetId) return;

    // If already on home page, scroll directly
    if (location.pathname === "/") {
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } else {
      // Navigate to home and pass desired id in state
      navigate("/", { state: { scrollToId: targetId } });
    }

    // Close mobile menu if open
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
    setIsMenuOpen(false);
    navigate("/");
  };

  const getDashboardRoute = () => {
    if (!user) return "/";

    const roles = user.roles || [];
    if (roles.includes("ADMIN")) return "/admin/dashboard";
    if (roles.includes("EMPLOYEE")) return "/dashboard";
    return "/dashboard";
  };

  return (
    <nav className="fixed top-3 sm:top-6 left-0 right-0 z-50 pointer-events-none">
      <div className="max-w-[calc(80rem+12px)] mx-auto px-2 sm:px-4 lg:px-0 pointer-events-auto">
        <div className="bg-zinc-950/80 dark:bg-zinc-950/80 light:bg-white/95 backdrop-blur-sm border border-zinc-800 dark:border-zinc-800 light:border-gray-200 rounded-xl shadow-lg px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-1 sm:space-x-2">
              <span className="text-lg sm:text-2xl font-bold text-white dark:text-white light:text-gray-900 tracking-wider font-heading">
                DRIVE<span className="text-orange-600">CARE</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => navigateToSection(link.targetId)}
                className="text-sm font-medium text-gray-400 dark:text-gray-400 light:text-gray-600 hover:text-white dark:hover:text-white light:hover:text-gray-900 transition-colors"
              >
                {link.name}
              </button>
            ))}
          </div>

          {/* Auth Buttons / Profile Dropdown */}
          <div className="hidden md:flex items-center space-x-3 lg:space-x-4">
            {user ? (
              // Profile Dropdown for logged-in users
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-600 rounded-full flex items-center justify-center hover:bg-orange-700 transition-colors cursor-pointer"
                  title="Profile"
                >
                  <User className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                </button>

                {/* Dropdown Menu */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-zinc-900 dark:bg-zinc-900 light:bg-white border border-zinc-800 dark:border-zinc-800 light:border-gray-200 rounded-lg shadow-xl py-2 z-50">
                    <div className="px-4 py-3 border-b border-zinc-800 dark:border-zinc-800 light:border-gray-200">
                      <p className="text-sm font-semibold text-white dark:text-white light:text-gray-900">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-400 light:text-gray-600 truncate">
                        {user.email}
                      </p>
                    </div>

                    <Link
                      to={getDashboardRoute()}
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 dark:text-gray-300 light:text-gray-700 hover:bg-zinc-800 dark:hover:bg-zinc-800 light:hover:bg-gray-100 hover:text-white dark:hover:text-white light:hover:text-gray-900 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Link>

                    <Link
                      to="/profile"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 dark:text-gray-300 light:text-gray-700 hover:bg-zinc-800 dark:hover:bg-zinc-800 light:hover:bg-gray-100 hover:text-white dark:hover:text-white light:hover:text-gray-900 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </Link>

                    <div className="border-t border-zinc-800 dark:border-zinc-800 light:border-gray-200 mt-2 pt-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-zinc-800 dark:hover:bg-zinc-800 light:hover:bg-gray-100 hover:text-red-300 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Login/Register buttons for guests
              <>
                <Link
                  to="/login"
                  className="px-3 lg:px-4 py-2 text-sm font-medium text-white dark:text-white light:text-gray-900 hover:bg-zinc-800 dark:hover:bg-zinc-800 light:hover:bg-gray-100 rounded-md transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-3 lg:px-4 py-2 text-sm font-medium bg-orange-600 text-white hover:bg-orange-700 rounded-md transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white dark:text-white light:text-gray-900 p-2 hover:bg-zinc-800 dark:hover:bg-zinc-800 light:hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation (keeps below the floating bar) */}
        {isMenuOpen && (
          <div className="md:hidden mt-2 bg-zinc-950/95 dark:bg-zinc-950/95 light:bg-white/95 backdrop-blur-sm border border-zinc-800 dark:border-zinc-800 light:border-gray-200 rounded-xl shadow-lg overflow-hidden">
            <div className="py-2">
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => navigateToSection(link.targetId)}
                  className="w-full text-left px-4 py-3 text-sm font-medium text-gray-400 dark:text-gray-400 light:text-gray-600 hover:text-white dark:hover:text-white light:hover:text-gray-900 hover:bg-zinc-800 dark:hover:bg-zinc-800 light:hover:bg-gray-100 transition-colors"
                >
                  {link.name}
                </button>
              ))}

              {user ? (
                // Profile section for logged-in users
                <div className="border-t border-zinc-800 dark:border-zinc-800 light:border-gray-200 mt-2">
                  <div className="px-4 py-3 bg-zinc-800/50 dark:bg-zinc-800/50 light:bg-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white dark:text-white light:text-gray-900">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-400 light:text-gray-600 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Link
                    to={getDashboardRoute()}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-400 dark:text-gray-400 light:text-gray-600 hover:text-white dark:hover:text-white light:hover:text-gray-900 hover:bg-zinc-800 dark:hover:bg-zinc-800 light:hover:bg-gray-100 transition-colors"
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    Dashboard
                  </Link>

                  <Link
                    to="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-400 dark:text-gray-400 light:text-gray-600 hover:text-white dark:hover:text-white light:hover:text-gray-900 hover:bg-zinc-800 dark:hover:bg-zinc-800 light:hover:bg-gray-100 transition-colors"
                  >
                    <Settings className="w-5 h-5" />
                    Settings
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-zinc-800 dark:hover:bg-zinc-800 light:hover:bg-gray-100 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
                </div>
              ) : (
                // Login/Register buttons for guests
                <div className="flex flex-col gap-2 p-3 border-t border-zinc-800 dark:border-zinc-800 light:border-gray-200 mt-2">
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="px-4 py-2.5 text-sm font-medium text-white dark:text-white light:text-gray-900 bg-zinc-800 dark:bg-zinc-800 light:bg-gray-100 hover:bg-zinc-700 dark:hover:bg-zinc-700 light:hover:bg-gray-200 rounded-lg transition-colors text-center"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMenuOpen(false)}
                    className="px-4 py-2.5 text-sm font-medium bg-orange-600 text-white hover:bg-orange-700 rounded-lg transition-colors text-center"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
