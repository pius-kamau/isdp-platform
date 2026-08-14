import { NavLink } from "react-router-dom";
import { Home, Search, BookOpen, MessageCircle, User, LogOut, Settings, LayoutDashboard, Bell } from "lucide-react";
import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";

const API_URL = 'https://isdp-backend.onrender.com/api';

export default function Sidebar() {
  const { darkMode } = useTheme();
  const [userId, setUserId] = useState(null);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    try {
      const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
      if (userStr) {
        const userData = JSON.parse(userStr);
        setUser(userData);
        if (userData && userData.id) {
          setUserId(userData.id);
        }
        // Check if user is admin
        if (userData.role === 'admin' || 
            userData.email === 'piusmwangi611@gmail.com') {
          setIsAdmin(true);
        }
        // Fetch unread counts
        fetchUnreadCounts(userData.id);
      }
    } catch (e) {
      console.error('Error getting user:', e);
    }
  }, []);

  const fetchUnreadCounts = async (userId) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      // Fetch unread messages count
      const messagesRes = await fetch(`${API_URL}/messages/unread`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const messagesData = await messagesRes.json();
      
      if (messagesData.status === 'success') {
        setUnreadCount(messagesData.data.unreadCount || 0);
      }

      // For notifications - you can add a notifications endpoint later
      // For now, we'll use a placeholder
      setNotificationCount(0);
    } catch (error) {
      console.error('Error fetching unread counts:', error);
    }
  };

  const navItems = [
    { to: "/home", label: "Home", icon: Home, badge: false },
    { to: "/discover", label: "Discover", icon: Search, badge: false },
    { to: "/mentorship", label: "Mentorship", icon: BookOpen, badge: false },
    { to: "/messages", label: "Messages", icon: MessageCircle, badge: true, count: unreadCount },
    { to: userId ? `/profile/${userId}` : "/profile", label: "Profile", icon: User, badge: false },
    { to: "/settings", label: "Settings", icon: Settings, badge: false },
  ];

  // Add admin link if user is admin
  if (isAdmin) {
    navItems.push({ to: "/admin", label: "Admin", icon: LayoutDashboard, badge: false });
  }

  const handleLogout = () => {
    try {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      sessionStorage.removeItem("accessToken");
      sessionStorage.removeItem("refreshToken");
      sessionStorage.removeItem("user");
    } catch (e) {
      console.error('Logout error:', e);
    }
    window.location.href = "/login";
  };

  const renderAvatar = () => {
    if (user?.profilePhoto) {
      return (
        <img 
          src={user.profilePhoto} 
          alt={user.fullName || 'User'}
          className="w-8 h-8 rounded-full object-cover"
        />
      );
    }
    
    return (
      <div className="w-8 h-8 bg-[#00B330] rounded-lg flex items-center justify-center text-white font-bold text-sm">
        {user?.fullName?.charAt(0) || 'I'}
      </div>
    );
  };

  return (
    <aside className={`hidden md:flex md:flex-col md:w-64 md:min-h-screen md:border-r md:fixed md:left-0 md:top-0 md:z-40 transition-colors duration-300 ${
      darkMode 
        ? 'bg-gray-900 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      <div className={`flex items-center gap-2 px-6 py-4 border-b transition-colors duration-300 ${
        darkMode ? 'border-gray-700' : 'border-gray-200'
      }`}>
        {renderAvatar()}
        <span className={`font-semibold transition-colors duration-300 ${
          darkMode ? 'text-white' : 'text-gray-900'
        }`}>ISDP</span>
        {isAdmin && (
          <span className="ml-auto text-[10px] bg-[#00B330] text-white px-2 py-0.5 rounded-full">Admin</span>
        )}
        {notificationCount > 0 && (
          <span className="ml-1 text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full">
            {notificationCount}
          </span>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? darkMode 
                      ? 'bg-[#00B330]/20 text-[#00B330]' 
                      : 'bg-[#00B330]/10 text-[#00B330]'
                    : darkMode
                      ? 'text-gray-400 hover:bg-gray-800'
                      : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
              {item.badge && item.count > 0 && (
                <span className="ml-auto bg-[#00B330] text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5">
                  {item.count > 99 ? '99+' : item.count}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className={`border-t p-3 transition-colors duration-300 ${
        darkMode ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-lg transition-colors ${
            darkMode 
              ? 'text-red-400 hover:bg-red-900/30' 
              : 'text-red-600 hover:bg-red-50'
          }`}
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
