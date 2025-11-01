// import { User, LayoutDashboard, BarChart3, Package, Bell } from 'lucide-react';
// import { useAuth } from '../../hooks/useAuth';
// import { useNavigate, useLocation } from 'react-router-dom';
// import type { NavSection } from '@/types/admin';

// const AdminNavbar = () => {
//   const { logout } = useAuth();
//   const navigate = useNavigate();
//   const location = useLocation();

//   // Extract active section from URL path
//   const getActiveSection = (): NavSection => {
//     const path = location.pathname.split('/').pop();
//     if (path === 'analytics' || path === 'inventory' || path === 'notifications') {
//       return path;
//     }
//     return 'dashboard'; // default
//   };

//   const activeSection = getActiveSection();

//   const handleLogout = async () => {
//     try {
//       await logout();
//     } catch (error) {
//       console.error('Logout error:', error);
//     }
//   };

//   const handleNavigation = (section: NavSection) => {
//     navigate(`/admin/${section}`);
//   };

//   const navItems = [
//     { id: 'dashboard' as NavSection, label: 'Dashboard', icon: LayoutDashboard },
//     { id: 'analytics' as NavSection, label: 'Analytics', icon: BarChart3 },
//     { id: 'inventory' as NavSection, label: 'Inventory', icon: Package },
//     { id: 'notifications' as NavSection, label: 'Notifications', icon: Bell }
//   ];

//   return (
//     <nav className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-800">
//       <div className="max-w-7xl mx-auto px-4">
//         <div className="flex items-center justify-between h-16">
//           {/* Logo */}
//           <div className="flex items-center space-x-2">
//             <span className="text-2xl font-bold text-white tracking-wider">
//               DRIVE<span className="text-orange-600">CARE</span>
//             </span>
//             <span className="text-xs text-gray-400 ml-2">Admin</span>
//           </div>

//           {/* Navigation Sections */}
//           <div className="hidden md:flex items-center space-x-1">
//             {navItems.map((item) => {
//               const Icon = item.icon;
//               return (
//                 <button
//                   key={item.id}
//                   onClick={() => handleNavigation(item.id)}
//                   className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all cursor-pointer ${
//                     activeSection === item.id
//                       ? 'bg-orange-600 text-white'
//                       : 'text-gray-400 hover:text-white hover:bg-zinc-800'
//                   }`}
//                 >
//                   <Icon className="w-4 h-4" />
//                   {item.label}
//                 </button>
//               );
//             })}
//           </div>

//           {/* User Section */}
//           <div className="flex items-center gap-4">
//             <button 
//               onClick={handleLogout}
//               className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition text-sm  cursor-pointer"
//             >
//               Logout
//             </button>
//             <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center cursor-pointer">
//               <User className="w-6 h-6 text-white" />
//             </div>
//           </div>
//         </div>
//       </div>
//     </nav>
//   );
// };

// export default AdminNavbar;



// src/components/AdminNavbar.tsx
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Bell, User, LogOut } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth'; // Assuming this path

const AdminNavbar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate(); // We'll add useNavigate if needed for profile/logout

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement | null>(null);
  const location = useLocation();

  const navLinks = [
    { name: 'HOME', path: '/' },
    { name: 'ABOUT US', path: '/about' },
    { name: 'SERVICES', path: '/services' },
    { name: 'CONTACT', path: '/contact' },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (profileRef.current && target && !profileRef.current.contains(target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setIsProfileOpen(false);
      setIsMenuOpen(false);
      // Optionally navigate to home or login page after logout
      // navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Determine if the current path is within the admin section
  const isAdminPath = location.pathname.startsWith('/admin');

  return (
    <nav className="w-full z-50 py-5 bg-[#000000]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-0 pointer-events-auto">
        <div className="bg-zinc-950/80 backdrop-blur-sm border border-zinc-800 rounded-xl shadow-lg px-4 sm:px-6 py-3 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-white tracking-wider font-heading">
                DRIVE<span className="text-orange-600">CARE</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-sm font-medium transition-colors ${
                  location.pathname === link.path ? 'text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                {link.name}
              </Link>
            ))}
            {/* Added a conditional link to Admin Dashboard if not already in admin section */}
            {!isAdminPath && (
              <Link
                to="/admin/dashboard"
                className={`text-sm font-medium transition-colors text-gray-400 hover:text-white`}
              >
                ADMIN
              </Link>
            )}
          </div>

          {/* Right Side - Notification & Profile (for Admin users or generally logged in users) */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Notifications, only show if user is an admin or generally has notifications */}
            {isAdminPath && ( // Example: only show bell icon when in admin section
              <button
                // Assuming a notifications page for admin
                // onClick={() => navigate('/admin/notifications')}
                className={`relative transition-colors text-gray-400 hover:text-white`}
              >
                <Bell size={20} />
                {/* Optional: Add a notification dot */}
                {/* <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-600 rounded-full"></span> */}
              </button>
            )}

            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
              >
                <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center">
                  <User size={18} className="text-white" />
                </div>
              </button>

              {isProfileOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-lg shadow-lg py-2">
                  <Link
                    to="/profile" // General user profile, or /admin/profile if applicable
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-zinc-800 transition-colors"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <User size={16} />
                    <span>My Profile</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-zinc-800 transition-colors text-left"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-zinc-950/90 backdrop-blur-sm border border-zinc-800 rounded-xl shadow-lg mt-2 py-4 px-4 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="block text-sm font-medium text-gray-400 hover:text-white transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            {!isAdminPath && (
              <Link
                to="/admin/dashboard"
                className="block text-sm font-medium text-gray-400 hover:text-white transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                ADMIN
              </Link>
            )}

            <div className="border-t border-zinc-800 pt-4 space-y-2">
              <Link
                to="/profile"
                className="flex items-center space-x-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <User size={16} />
                <span>My Profile</span>
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-2 text-sm font-medium text-gray-400 hover:text-white transition-colors text-left"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default AdminNavbar;