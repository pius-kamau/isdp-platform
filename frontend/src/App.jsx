import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { SidebarProvider, useSidebar } from './context/SidebarContext';

// Components
import SplashScreen from './components/SplashScreen';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';

// Pages
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Home from './pages/Home';
import Discover from './pages/Discover';
import Mentorship from './pages/Mentorship';
import Messages from './pages/Messages';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import AdminDashboard from './pages/AdminDashboard';

// Layout component that responds to sidebar collapse
function AppLayout({ children }) {
  const { collapsed } = useSidebar();
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (e) {
        console.error('Error parsing user:', e);
      }
    }
  }, []);

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const getMarginLeft = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return '0px';
    }
    return collapsed ? '80px' : '256px';
  };

  const getContentWidth = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return '100%';
    }
    return `calc(100% - ${collapsed ? '80px' : '256px'})`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div 
        className="min-h-screen transition-all duration-300 pb-16 md:pb-0"
        style={{ 
          marginLeft: getMarginLeft(),
          width: getContentWidth()
        }}
      >
        {/* Page Content */}
        {children}
        <BottomNav />
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <SidebarProvider>
            <BrowserRouter>
              <div className="min-h-screen">
                <Routes>
                  <Route path="/" element={<SplashScreen />} />
                  <Route path="/landing" element={<Landing />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  
                  <Route path="/home" element={
                    <AppLayout>
                      <Home />
                    </AppLayout>
                  } />
                  <Route path="/discover" element={
                    <AppLayout>
                      <Discover />
                    </AppLayout>
                  } />
                  <Route path="/mentorship" element={
                    <AppLayout>
                      <Mentorship />
                    </AppLayout>
                  } />
                  <Route path="/messages" element={
                    <AppLayout>
                      <Messages />
                    </AppLayout>
                  } />
                  <Route path="/messages/:userId" element={
                    <AppLayout>
                      <Messages />
                    </AppLayout>
                  } />
                  <Route path="/profile" element={
                    <AppLayout>
                      <Profile />
                    </AppLayout>
                  } />
                  <Route path="/profile/:id" element={
                    <AppLayout>
                      <Profile />
                    </AppLayout>
                  } />
                  <Route path="/settings" element={
                    <AppLayout>
                      <Settings />
                    </AppLayout>
                  } />
                  <Route path="/admin" element={
                    <AppLayout>
                      <AdminDashboard />
                    </AppLayout>
                  } />
                  <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
              </div>
              <Toaster position="top-right" />
            </BrowserRouter>
          </SidebarProvider>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
