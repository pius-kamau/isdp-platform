import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Home, Search, BookOpen, MessageCircle, User, 
  Settings, LayoutDashboard, LogOut 
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const API_URL = 'https://isdp-backend.onrender.com/api';

export default function Sidebar() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
        setIsAdmin(userData.role === 'admin');
        fetchUnreadCount();
      } catch (e) {
        console.error('Error parsing user:', e);
      }
    }
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;
      const response = await fetch(`${API_URL}/messages/unread`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.status === 'success') {
        setUnreadCount(data.data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const navItems = [
    { to: '/home', label: 'Home', icon: Home },
    { to: '/discover', label: 'Discover', icon: Search },
    { to: '/mentorship', label: 'Mentorship', icon: BookOpen },
    { to: '/messages', label: 'Messages', icon: MessageCircle, badge: unreadCount },
    { to: '/profile', label: 'Profile', icon: User },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  if (isAdmin) {
    navItems.push({ to: '/admin', label: 'Admin', icon: LayoutDashboard });
  }

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const renderAvatar = () => {
    if (user?.profilePhoto) {
      return <img src={user.profilePhoto} alt={user.fullName} className="w-8 h-8 rounded-full object-cover" />;
    }
    return (
      <div className="w-8 h-8 bg-[#00B330] rounded-lg flex items-center justify-center text-white font-bold text-sm">
        {user?.fullName?.charAt(0) || 'U'}
      </div>
    );
  };

  return (
    <aside className={`hidden md:flex md:flex-col md:w-56 md:min-h-screen md:fixed md:left-0 md:top-0 md:z-40 transition-colors duration-300 border-r ${
      darkMode 
        ? 'bg-gray-900 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      <div className={`flex items-center gap-3 px-4 py-4 border-b ${
        darkMode ? 'border-gray-700' : 'border-gray-200'
      }`}>
        {renderAvatar()}
        <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>ISDP</span>
        {isAdmin && (
          <span className="ml-auto text-[10px] bg-[#00B330] text-white px-2 py-0.5 rounded-full">Admin</span>
        )}
      </div>

      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm ${
                  isActive
                    ? 'bg-[#00B330]/10 text-[#00B330] dark:bg-[#00B330]/20 dark:text-[#00B330]'
                    : darkMode
                      ? 'text-gray-400 hover:bg-gray-800'
                      : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span className="font-medium">{item.label}</span>
              {item.badge > 0 && (
                <span className="ml-auto bg-[#00B330] text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1.5">
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className={`border-t p-3 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg transition-colors text-sm ${
            darkMode 
              ? 'text-red-400 hover:bg-red-900/30' 
              : 'text-red-600 hover:bg-red-50'
          }`}
        >
          <LogOut className="w-4 h-4" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
