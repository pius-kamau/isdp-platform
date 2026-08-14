import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

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

// Layout component for authenticated pages
function AuthenticatedLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <Sidebar />
      <div className="flex-1 min-h-screen">
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
          <BrowserRouter>
            <div className="min-h-screen">
              <Routes>
                {/* Public routes - no sidebar/nav */}
                <Route path="/" element={<SplashScreen />} />
                <Route path="/landing" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                
                {/* Protected routes - with sidebar and bottom nav */}
                <Route path="/home" element={
                  <AuthenticatedLayout>
                    <Home />
                  </AuthenticatedLayout>
                } />
                <Route path="/discover" element={
                  <AuthenticatedLayout>
                    <Discover />
                  </AuthenticatedLayout>
                } />
                <Route path="/mentorship" element={
                  <AuthenticatedLayout>
                    <Mentorship />
                  </AuthenticatedLayout>
                } />
                <Route path="/messages" element={
                  <AuthenticatedLayout>
                    <Messages />
                  </AuthenticatedLayout>
                } />
                <Route path="/messages/:userId" element={
                  <AuthenticatedLayout>
                    <Messages />
                  </AuthenticatedLayout>
                } />
                <Route path="/profile" element={
                  <AuthenticatedLayout>
                    <Profile />
                  </AuthenticatedLayout>
                } />
                <Route path="/profile/:id" element={
                  <AuthenticatedLayout>
                    <Profile />
                  </AuthenticatedLayout>
                } />
                <Route path="/settings" element={
                  <AuthenticatedLayout>
                    <Settings />
                  </AuthenticatedLayout>
                } />
                <Route path="/admin" element={
                  <AuthenticatedLayout>
                    <AdminDashboard />
                  </AuthenticatedLayout>
                } />
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            </div>
            <Toaster position="top-right" />
          </BrowserRouter>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
