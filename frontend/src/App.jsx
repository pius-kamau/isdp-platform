import React from 'react';
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

function AppLayout({ children }) {
  const { collapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <Sidebar />
      <div 
        className={`flex-1 min-h-screen transition-all duration-300 pb-16 md:pb-0
          ${collapsed ? 'md:ml-20' : 'md:ml-64'}
        `}
      >
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
                  <Route path="/home" element={<AppLayout><Home /></AppLayout>} />
                  <Route path="/discover" element={<AppLayout><Discover /></AppLayout>} />
                  <Route path="/mentorship" element={<AppLayout><Mentorship /></AppLayout>} />
                  <Route path="/messages" element={<AppLayout><Messages /></AppLayout>} />
                  <Route path="/messages/:userId" element={<AppLayout><Messages /></AppLayout>} />
                  <Route path="/profile" element={<AppLayout><Profile /></AppLayout>} />
                  <Route path="/profile/:id" element={<AppLayout><Profile /></AppLayout>} />
                  <Route path="/settings" element={<AppLayout><Settings /></AppLayout>} />
                  <Route path="/admin" element={<AppLayout><AdminDashboard /></AppLayout>} />
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
