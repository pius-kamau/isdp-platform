import { Link, useLocation } from 'react-router-dom';
import { Home, Compass, GraduationCap, MessageCircle, User, Settings, LayoutDashboard } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function BottomNav() {
  const location = useLocation();
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

  const navItems = [
    { path: '/home', icon: Home, label: 'Home' },
    { path: '/discover', icon: Compass, label: 'Discover' },
    { path: '/mentorship', icon: GraduationCap, label: 'Mentorship' },
    { path: '/messages', icon: MessageCircle, label: 'Messages' },
    { path: '/profile', icon: User, label: 'Profile' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  // Add Admin nav item only if user is admin
  const allNavItems = [...navItems];
  if (isAdmin) {
    allNavItems.push({ path: '/admin', icon: LayoutDashboard, label: 'Admin' });
  }

  const isActive = (path) => {
    if (path === '/home' && location.pathname === '/') return true;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="block md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200">
      <div className="flex items-center justify-around px-2 py-1">
        {allNavItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors ${
                active
                  ? 'text-[#00B330]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
