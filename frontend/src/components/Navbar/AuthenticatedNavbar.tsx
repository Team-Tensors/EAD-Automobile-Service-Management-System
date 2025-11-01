import { Link, useLocation, useNavigate } from "react-router-dom";
import { User, LayoutDashboard, Calendar } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { type LucideIcon, Car } from "lucide-react";

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
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

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
    }
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pointer-events-auto">
        <div className="bg-zinc-950/80 backdrop-blur-sm border border-zinc-800 rounded-xl shadow-lg px-4 sm:px-6 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-white tracking-wider">
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
                      ? "bg-orange-500 text-white"
                      : "text-gray-400 hover:text-white hover:bg-zinc-800"
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

            {/* User Avatar - Clickable to go to profile */}
            <Link
              to="/profile"
              className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-orange-700 transition-colors"
              title="View Profile"
            >
              <User className="w-6 h-6 text-white" />
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AuthenticatedNavbar;



// import { Link, useLocation, useNavigate } from 'react-router-dom';
// import { User, LayoutDashboard, Calendar, Bell, LogOut, Car, Menu, X } from 'lucide-react';
// import { useAuth } from '../../hooks/useAuth';
// import { type LucideIcon } from 'lucide-react';
// import { useState, useRef, useEffect } from 'react';

// interface NavTab {
//   name: string;
//   path: string;
//   icon?: LucideIcon; // Icon is optional for top-level links like Home, About Us
//   roles?: string[]; // Optional: restrict tab to specific roles
// }

// const AuthenticatedNavbar = () => {
//   const { user, logout } = useAuth();
//   const location = useLocation();
//   const navigate = useNavigate();

//   const [isMenuOpen, setIsMenuOpen] = useState(false);
//   const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
//   const [isProfileOpen, setIsProfileOpen] = useState(false);
//   const customerDropdownRef = useRef<HTMLDivElement | null>(null);
//   const profileRef = useRef<HTMLDivElement | null>(null);

//   const handleLogout = async () => {
//     try {
//       await logout();
//       navigate('/login'); // Redirect to login after logout
//       setIsProfileOpen(false);
//       setIsMenuOpen(false);
//     } catch (error) {
//       console.error('Logout error:', error);
//     }
//   };

//   const topNavLinks: NavTab[] = [
//     { name: 'HOME', path: '/' },
//     { name: 'ABOUT US', path: '/about' },
//     { name: 'SERVICES', path: '/services' },
//     { name: 'CONTACT', path: '/contact' },
//   ];

//   // Define customer dashboard dropdown links
//   const customerDropdownLinks: NavTab[] = [
//     { name: 'C-Dashboard', path: '/dashboard', icon: LayoutDashboard },
//     { name: 'Appointments', path: '/my-appointments', icon: Calendar, roles: ['CUSTOMER'] },
//     { name: 'Vehicles', path: '/my-vehicles', icon: Car, roles: ['CUSTOMER'] },
//   ];

//   // Filter dropdown tabs based on user role if roles are specified
//   const availableCustomerDropdownLinks = customerDropdownLinks.filter((tab) => {
//     if (!tab.roles) return true; // No role restriction
//     return (
//       user?.roles?.some((role) => tab.roles?.includes(role)) || (user?.role && tab.roles?.includes(user.role))
//     );
//   });

//   const isActivePath = (path: string) => {
//     return location.pathname.startsWith(path);
//   };

//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       const target = event.target as Node | null;

//       if (customerDropdownRef.current && target && !customerDropdownRef.current.contains(target)) {
//         setIsCustomerDropdownOpen(false);
//       }
//       if (profileRef.current && target && !profileRef.current.contains(target)) {
//         setIsProfileOpen(false);
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   return (
//     <nav className="fixed top-6 left-0 right-0 z-50 pointer-events-none">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-0 pointer-events-auto">
//         <div className="bg-zinc-950/80 backdrop-blur-sm border border-zinc-800 rounded-xl shadow-lg px-4 sm:px-6 py-3 flex items-center justify-between">
//           {/* Logo */}
//           <div className="flex items-center space-x-4">
//             <Link to="/dashboard" className="flex items-center space-x-2">
//               <span className="text-2xl font-bold text-white tracking-wider font-heading">
//                 DRIVE<span className="text-orange-600">CARE</span>
//               </span>
//             </Link>
//           </div>

//           {/* Desktop Navigation */}
//           <div className="hidden md:flex items-center space-x-8">
//             {topNavLinks.map((link) => (
//               <Link
//                 key={link.name}
//                 to={link.path}
//                 className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
//               >
//                 {link.name}
//               </Link>
//             ))}

//             <div className="relative" ref={customerDropdownRef}>
//               <button
//                 onClick={() => setIsCustomerDropdownOpen(!isCustomerDropdownOpen)}
//                 className={`text-sm font-medium transition-colors flex items-center space-x-1 ${
//                   availableCustomerDropdownLinks.some((link) => isActivePath(link.path))
//                     ? 'text-white'
//                     : 'text-gray-400 hover:text-white'
//                 }`}
//               >
//                 <span>DASHBOARD</span>
//                 <svg
//                   className={`w-4 h-4 transition-transform ${isCustomerDropdownOpen ? 'rotate-180' : ''}`}
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
//                 </svg>
//               </button>

//               {isCustomerDropdownOpen && (
//                 <div className="absolute top-full mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-lg shadow-lg py-2">
//                   {availableCustomerDropdownLinks.map((link) => {
//                     const IconComponent = link.icon;
//                     return (
//                       <Link
//                         key={link.name}
//                         to={link.path}
//                         className={`flex items-center space-x-2 px-4 py-2 text-sm text-left transition-colors ${
//                           isActivePath(link.path)
//                             ? 'bg-orange-600 text-white'
//                             : 'text-gray-400 hover:text-white hover:bg-zinc-800'
//                         }`}
//                         onClick={() => setIsCustomerDropdownOpen(false)}
//                       >
//                         {IconComponent && <IconComponent size={16} />}
//                         <span>{link.name}</span>
//                       </Link>
//                     );
//                   })}
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Right Side - Notification & Profile */}
//           <div className="hidden md:flex items-center space-x-6">
//             <button className="relative text-gray-400 hover:text-white transition-colors">
//               <Bell size={20} />
//               {/* Optional: Add a notification dot if there are new notifications */}
//               {/* <span className="absolute top-0 right-0 w-2 h-2 bg-orange-600 rounded-full"></span> */}
//             </button>

//             <div className="relative" ref={profileRef}>
//               <button
//                 onClick={() => setIsProfileOpen(!isProfileOpen)}
//                 className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
//               >
//                 <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center">
//                   <User size={18} className="text-white" />
//                 </div>
//               </button>

//               {isProfileOpen && (
//                 <div className="absolute top-full right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-lg shadow-lg py-2">
//                   <Link
//                     to="/profile"
//                     className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-zinc-800 transition-colors"
//                     onClick={() => setIsProfileOpen(false)}
//                   >
//                     <User size={16} />
//                     <span>My Profile</span>
//                   </Link>
//                   <button
//                     onClick={handleLogout}
//                     className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-zinc-800 transition-colors text-left"
//                   >
//                     <LogOut size={16} />
//                     <span>Logout</span>
//                   </button>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Mobile menu button */}
//           <div className="md:hidden">
//             <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white">
//               {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
//             </button>
//           </div>
//         </div>

//         {/* Mobile Navigation */}
//         {isMenuOpen && (
//           <div className="md:hidden bg-zinc-950/90 backdrop-blur-sm border border-zinc-800 rounded-xl shadow-lg mt-2 py-4 px-4 space-y-4">
//             {topNavLinks.map((link) => (
//               <Link
//                 key={link.name}
//                 to={link.path}
//                 className="block text-sm font-medium text-gray-400 hover:text-white transition-colors"
//                 onClick={() => setIsMenuOpen(false)}
//               >
//                 {link.name}
//               </Link>
//             ))}

//             <div className="border-t border-zinc-800 pt-4">
//               <button
//                 onClick={() => setIsCustomerDropdownOpen(!isCustomerDropdownOpen)}
//                 className="w-full text-left text-sm font-medium text-gray-400 hover:text-white transition-colors flex items-center justify-between"
//               >
//                 <span>DASHBOARD</span>
//                 <svg
//                   className={`w-4 h-4 transition-transform ${isCustomerDropdownOpen ? 'rotate-180' : ''}`}
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
//                 </svg>
//               </button>

//               {isCustomerDropdownOpen && (
//                 <div className="mt-2 space-y-2 pl-4">
//                   {availableCustomerDropdownLinks.map((link) => {
//                     const IconComponent = link.icon;
//                     return (
//                       <Link
//                         key={link.name}
//                         to={link.path}
//                         className={`flex items-center space-x-2 text-sm text-left transition-colors ${
//                           isActivePath(link.path)
//                             ? 'bg-orange-600 text-white'
//                             : 'text-gray-400 hover:text-white hover:bg-zinc-800'
//                         }`}
//                         onClick={() => {
//                           setIsMenuOpen(false);
//                           setIsCustomerDropdownOpen(false);
//                         }}
//                       >
//                         {IconComponent && <IconComponent size={16} />}
//                         <span>{link.name}</span>
//                       </Link>
//                     );
//                   })}
//                 </div>
//               )}
//             </div>

//             <div className="border-t border-zinc-800 pt-4 space-y-2">
//               <Link
//                 to="/profile"
//                 className="flex items-center space-x-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
//                 onClick={() => setIsMenuOpen(false)}
//               >
//                 <User size={16} />
//                 <span>My Profile</span>
//               </Link>
//               <button
//                 onClick={handleLogout}
//                 className="w-full flex items-center space-x-2 text-sm font-medium text-gray-400 hover:text-white transition-colors text-left"
//               >
//                 <LogOut size={16} />
//                 <span>Logout</span>
//               </button>
//             </div>

//             <div className="border-t border-zinc-800 pt-4">
//               <button className="flex items-center space-x-2 text-sm font-medium text-gray-400 hover:text-white transition-colors">
//                 <Bell size={16} />
//                 <span>Notifications</span>
//               </button>
//             </div>
//           </div>
//         )}
//       </div>
//     </nav>
//   );
// };

// export default AuthenticatedNavbar;