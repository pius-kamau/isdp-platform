import { NavLink } from "react-router-dom";
import { Home, Search, BookOpen, MessageCircle, User, LogOut } from "lucide-react";
import { useState, useEffect } from "react";

export default function Sidebar() {
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    try {
      // Directly read from localStorage without importing
      const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user && user.id) {
          setUserId(user.id);
        }
      }
    } catch (e) {
      console.error('Error getting user:', e);
    }
  }, []);

  const navItems = [
    { to: "/home", label: "Home", icon: Home },
    { to: "/discover", label: "Discover", icon: Search },
    { to: "/mentorship", label: "Mentorship", icon: BookOpen },
    { to: "/messages", label: "Messages", icon: MessageCircle },
    { to: userId ? `/profile/${userId}` : "/profile", label: "Profile", icon: User },
  ];

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

  return (
    <aside className="hidden md:flex md:flex-col md:w-64 md:min-h-screen md:bg-white md:border-r md:border-gray-200 md:fixed md:left-0 md:top-0 md:z-40">
      <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-200">
        <div className="w-8 h-8 bg-[#00B330] rounded-lg flex items-center justify-center text-white font-bold text-sm">
          I
        </div>
        <span className="font-semibold text-gray-900">ISDP</span>
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
                    ? "bg-[#00B330]/10 text-[#00B330]"
                    : "text-gray-600 hover:bg-gray-100"
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-gray-200 p-3">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
