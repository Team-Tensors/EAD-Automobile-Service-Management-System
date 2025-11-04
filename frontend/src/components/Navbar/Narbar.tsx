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
    <nav className="fixed top-6 left-0 right-0 z-50 pointer-events-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-0 pointer-events-auto">
        <div className="bg-zinc-950/80 backdrop-blur-sm border border-zinc-800 rounded-xl shadow-lg px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-white tracking-wider font-heading">
              DRIVE<span className="text-orange-600">CARE</span>
            </span>
          </Link>

          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
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
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/login" className="px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 rounded-md transition-colors">
              Login
            </Link>
            <Link to="/register" className="px-4 py-2 text-sm font-medium bg-orange-600 text-white hover:bg-orange-700 rounded-md transition-colors">
              Register
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

        </div>

        {/* Mobile Navigation (keeps below the floating bar) */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-4 mt-2 px-2">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => navigateToSection(link.targetId)}
                className="block text-sm font-medium text-gray-400 hover:text-white transition-colors"
              >
                {link.name}
              </button>
            ))}
            <div className="flex flex-col space-y-2 pt-4 border-t border-zinc-800">
              <Link to="/login" className="px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 rounded-md transition-colors text-center">
                Login
              </Link>
              <Link to="/register" className="px-4 py-2 text-sm font-medium bg-orange-600 text-white hover:bg-orange-700 rounded-md transition-colors text-center">
                Register
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
