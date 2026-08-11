import { NavLink } from "react-router-dom";
import { Home, Search, BookOpen, MessageCircle, User } from "lucide-react";

export default function BottomNav() {
  const navItems = [
    { to: "/home", label: "Home", icon: Home },
    { to: "/discover", label: "Discover", icon: Search },
    { to: "/mentorship", label: "Mentorship", icon: BookOpen },
    { to: "/messages", label: "Messages", icon: MessageCircle },
    { to: "/profile", label: "Profile", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around items-center h-16 px-2 z-50">
      {navItems.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 text-[10px] transition-colors min-w-[48px] py-1 ${
              isActive ? "text-[#00B330] font-medium" : "text-gray-400"
            }`
          }
        >
          <>
            <Icon className="w-5 h-5" strokeWidth={2} />
            <span>{label}</span>
          </>
        </NavLink>
      ))}
    </nav>
  );
}