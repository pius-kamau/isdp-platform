import { NavLink } from "react-router-dom";
import { Home, Search, BookOpen, MessageCircle, User } from "lucide-react";
import { useState, useEffect } from "react";

export default function BottomNav() {
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    try {
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

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                  isActive ? "text-[#00B330]" : "text-gray-500"
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs mt-0.5">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
