import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, Compass, GraduationCap, MessageCircle, 
  User, Settings, LogOut, 
  ChevronLeft, ChevronRight, LayoutDashboard
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSidebar } from '../context/SidebarContext';

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { collapsed, toggleCollapse } = useSidebar();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setIsAdmin(user.role === 'admin' || user.email === 'piusmwangi611@gmail.com');
      }
    } catch (e) {
      setIsAdmin(false);
    }
  }, []);

  const menuItems = [
    { path: '/home', icon: Home, label: 'Home' },
    { path: '/discover', icon: Compass, label: 'Discover' },
    { path: '/mentorship', icon: GraduationCap, label: 'Mentorship' },
    { path: '/messages', icon: MessageCircle, label: 'Messages' },
    { path: '/profile', icon: User, label: 'Profile' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  // Add Admin menu item only if user is admin
  const allMenuItems = [...menuItems];
  if (isAdmin) {
    allMenuItems.push({ path: '/admin', icon: LayoutDashboard, label: 'Admin' });
  }

  const isActive = (path) => {
    if (path === '/home' && location.pathname === '/') return true;
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div
      className={`
        fixed top-0 left-0 h-full z-40 transition-all duration-300
        hidden md:flex
        ${collapsed ? 'w-20' : 'w-64'}
        bg-white border-r border-gray-200
        flex-col
      `}
    >
      {/* Logo */}
      <div className={`flex items-center h-16 px-4 border-b border-gray-200`}>
        {!collapsed ? (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#00B330] rounded-lg flex items-center justify-center text-white font-bold">
              I
            </div>
            <span className="font-semibold text-gray-900">
              ISDP
            </span>
          </div>
        ) : (
          <div className="w-8 h-8 bg-[#00B330] rounded-lg flex items-center justify-center text-white font-bold mx-auto">
            I
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {allMenuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                active
                  ? 'bg-[#00B330] text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              } ${collapsed ? 'justify-center' : ''}`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="border-t border-gray-200 p-2 space-y-1">
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors w-full text-red-600 hover:bg-red-50 ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Logout</span>}
        </button>

        <button
          onClick={toggleCollapse}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors w-full text-gray-600 hover:bg-gray-100 ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5 flex-shrink-0" />
          ) : (
            <ChevronLeft className="w-5 h-5 flex-shrink-0" />
          )}
          {!collapsed && <span className="text-sm font-medium">Collapse</span>}
        </button>
      </div>
    </div>
  );
}
