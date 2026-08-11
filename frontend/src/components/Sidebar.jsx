import { NavLink } from "react-router-dom";
import { Home, Search, BookOpen, MessageCircle, User, LogOut } from "lucide-react";

export default function Sidebar() {
  const navItems = [
    { to: "/home", label: "Home", icon: Home },
    { to: "/discover", label: "Discover", icon: Search },
    { to: "/mentorship", label: "Mentorship", icon: BookOpen },
    { to: "/messages", label: "Messages", icon: MessageCircle },
    { to: "/profile", label: "Profile", icon: User },
  ];

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    window.location.href = "/login";
  };

  return (
    <aside className="hidden md:flex md:flex-col md:w-64 md:min-h-screen md:bg-white md:border-r md:border-gray-200 md:fixed md:left-0 md:top-0 md:z-40">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-100">
        <div className="h-10 w-10 rounded-xl bg-[#00B330] flex items-center justify-center text-white font-bold text-lg">
          I
        </div>
        <span className="text-xl font-bold text-[#00B330]">ISDP</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? "bg-[#00B330]/10 text-[#00B330]"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`
            }
          >
            <Icon className="w-5 h-5" strokeWidth={2} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
        <p className="text-xs text-gray-400 text-center mt-3">v1.0.0</p>
      </div>
    </aside>
  );
}