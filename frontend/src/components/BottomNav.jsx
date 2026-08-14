import { NavLink } from "react-router-dom";
import { Home, Search, BookOpen, MessageCircle, User, Settings, LayoutDashboard } from "lucide-react";
import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";

const API_URL = 'https://isdp-backend.onrender.com/api';

export default function BottomNav() {
  const { darkMode } = useTheme();
  const [userId, setUserId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    try {
      const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user && user.id) {
          setUserId(user.id);
        }
        // Check if user is admin
        if (user.role === 'admin' || 
            user.email === 'piusmwangi611@gmail.com') {
          setIsAdmin(true);
        }
        // Fetch unread count
        fetchUnreadCount(user.id);
      }
    } catch (e) {
      console.error('Error getting user:', e);
    }
  }, []);

  const fetchUnreadCount = async (userId) => {
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
    { to: "/home", label: "Home", icon: Home },
    { to: "/discover", label: "Discover", icon: Search },
    { to: "/mentorship", label: "Mentorship", icon: BookOpen },
    { to: "/messages", label: "Messages", icon: MessageCircle },
    { to: userId ? `/profile/${userId}` : "/profile", label: "Profile", icon: User },
    { to: "/settings", label: "Settings", icon: Settings },
  ];

  if (isAdmin) {
    navItems.push({ to: "/admin", label: "Admin", icon: LayoutDashboard });
  }

  return (
    <nav className={`md:hidden fixed bottom-0 left-0 right-0 border-t z-50 transition-colors duration-300 ${
      darkMode 
        ? 'bg-gray-900 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isMessages = item.to === "/messages" || item.to.startsWith("/messages");
          const count = isMessages ? unreadCount : 0;
          
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center flex-1 h-full transition-colors relative ${
                  isActive 
                    ? 'text-[#00B330]' 
                    : darkMode ? 'text-gray-500' : 'text-gray-500'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs mt-0.5">{item.label}</span>
              {count > 0 && (
                <span className="absolute -top-0.5 right-1/4 bg-[#00B330] text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  {count > 99 ? '99+' : count}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
