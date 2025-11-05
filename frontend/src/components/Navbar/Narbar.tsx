import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

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

  return (
    <nav className="fixed top-3 sm:top-6 left-0 right-0 z-50 pointer-events-none">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-0 pointer-events-auto">
        <div className="bg-zinc-950/80 backdrop-blur-sm border border-zinc-800 rounded-xl shadow-lg px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-1 sm:space-x-2">
              <span className="text-lg sm:text-2xl font-bold text-white tracking-wider font-heading">
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
                className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
              >
                {link.name}
              </button>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3 lg:space-x-4">
            <Link
              to="/login"
              className="px-3 lg:px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 rounded-md transition-colors"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-3 lg:px-4 py-2 text-sm font-medium bg-orange-600 text-white hover:bg-orange-700 rounded-md transition-colors"
            >
              Register
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white p-2 hover:bg-zinc-800 rounded-lg transition-colors"
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
          <div className="md:hidden mt-2 bg-zinc-950/95 backdrop-blur-sm border border-zinc-800 rounded-xl shadow-lg overflow-hidden">
            <div className="py-2">
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => navigateToSection(link.targetId)}
                  className="w-full text-left px-4 py-3 text-sm font-medium text-gray-400 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                  {link.name}
                </button>
              ))}
              <div className="flex flex-col gap-2 p-3 border-t border-zinc-800 mt-2">
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="px-4 py-2.5 text-sm font-medium text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors text-center"
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
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
