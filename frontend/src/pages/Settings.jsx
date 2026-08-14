import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, User, Bell, Shield, Palette, 
  Lock, Globe, Smartphone, LogOut, ChevronRight,
  Moon, Sun, Key, HelpCircle, CreditCard,
  Camera, Check, X, Loader2, Eye, EyeOff,
  Mail, Phone, MapPin, Briefcase, Award,
  Save, Edit2, Trash2, Plus, Clock, FileText,
  AlertTriangle, ShieldCheck, Info
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import BottomNav from '../components/BottomNav';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';
import PrivacyPolicy from '../components/common/PrivacyPolicy';

const API_URL = 'https://isdp-backend.onrender.com/api';

export default function Settings() {
  const navigate = useNavigate();
  const { darkMode, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  
  // Profile edit form
  const [editForm, setEditForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    county: '',
    subCounty: '',
    occupation: '',
    bio: '',
  });

  // Password change
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  // 2FA
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [isSettingUp2FA, setIsSettingUp2FA] = useState(false);

  // Notifications
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    mentorship: true,
    messages: true,
    marketing: false,
  });

  // Counties data
  const counties = [
    'Nairobi', 'Kiambu', 'Kisumu', 'Mombasa', 'Nakuru', 
    'Eldoret', 'Thika', 'Malindi', 'Kitale', 'Nyeri'
  ];

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
        setEditForm({
          fullName: userData.fullName || '',
          email: userData.email || '',
          phone: userData.phone || '',
          county: userData.county || '',
          subCounty: userData.subCounty || '',
          occupation: userData.occupation || '',
          bio: userData.bio || '',
        });
        setTwoFactorEnabled(userData.twoFactorEnabled || false);
        
        // Load notification preferences
        const savedNotifs = localStorage.getItem('notificationPreferences');
        if (savedNotifs) {
          try {
            setNotifications(JSON.parse(savedNotifs));
          } catch (e) {}
        }
      } catch (e) {
        console.error('Error parsing user:', e);
      }
    }
  }, []);

  // ============ PROFILE UPDATE ============
  const handleProfileUpdate = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_URL}/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });

      const data = await response.json();
      if (response.ok) {
        const updatedUser = data.data || data;
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setIsEditing(false);
        toast.success('Profile updated successfully!');
      } else {
        toast.error(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // ============ PASSWORD CHANGE ============
  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsChangingPassword(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success('Password changed successfully!');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setShowPasswordForm(false);
      } else {
        toast.error(data.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Password change error:', error);
      toast.error('Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // ============ 2FA TOGGLE ============
  const handleToggle2FA = async () => {
    if (twoFactorEnabled) {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`${API_URL}/auth/2fa/disable`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          setTwoFactorEnabled(false);
          toast.success('2FA disabled successfully');
        } else {
          toast.error('Failed to disable 2FA');
        }
      } catch (error) {
        console.error('2FA disable error:', error);
        toast.error('Failed to disable 2FA');
      }
    } else {
      setShow2FAModal(true);
    }
  };

  const handleEnable2FA = async () => {
    setIsSettingUp2FA(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_URL}/auth/2fa/enable`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ code: twoFactorCode }),
      });

      const data = await response.json();
      if (response.ok) {
        setTwoFactorEnabled(true);
        setShow2FAModal(false);
        setTwoFactorCode('');
        toast.success('2FA enabled successfully!');
      } else {
        toast.error(data.message || 'Failed to enable 2FA');
      }
    } catch (error) {
      console.error('2FA enable error:', error);
      toast.error('Failed to enable 2FA');
    } finally {
      setIsSettingUp2FA(false);
    }
  };

  // ============ NOTIFICATION TOGGLE ============
  const toggleNotification = (key) => {
    setNotifications(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      localStorage.setItem('notificationPreferences', JSON.stringify(updated));
      return updated;
    });
    toast.success(`${key} notifications ${!notifications[key] ? 'enabled' : 'disabled'}`);
  };

  // ============ LOGOUT ============
  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('user');
    window.location.href = '/login';
  };

  // ============ SECTIONS ============
  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'preferences', label: 'Preferences', icon: Palette },
  ];

  return (
    <>
      <div className={`min-h-screen transition-colors duration-300 ${
        darkMode ? 'bg-gray-900' : 'bg-gray-50'
      } flex flex-col md:flex-row`}>
        <Sidebar />

        <div className="flex-1 md:ml-64 pb-20 md:pb-0">
          {/* Header */}
          <div className={`sticky top-0 z-10 px-4 py-4 md:px-8 md:py-4 border-b transition-colors duration-300 ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
          }`}>
            <div className="flex items-center justify-between max-w-4xl mx-auto">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => navigate(-1)} 
                  className={`p-1 rounded-lg transition-colors md:hidden ${
                    darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className={`text-xl font-semibold transition-colors duration-300 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>Settings</h1>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs transition-colors duration-300 hidden sm:inline ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {user?.fullName || 'User'}
                </span>
                <div className="w-8 h-8 rounded-full bg-[#00B330]/20 flex items-center justify-center text-[#00B330] font-bold text-sm">
                  {user?.fullName?.charAt(0) || 'U'}
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-4xl mx-auto px-4 py-6 md:px-8">
            {/* Tabs */}
            <div className={`flex gap-1 overflow-x-auto border-b mb-6 transition-colors duration-300 ${
              darkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-[#00B330] text-[#00B330]'
                        : darkMode
                          ? 'border-transparent text-gray-400 hover:text-gray-300'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* ============ PROFILE TAB ============ */}
            {activeTab === 'profile' && (
              <div className={`rounded-xl border overflow-hidden transition-colors duration-300 ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
              }`}>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-lg font-semibold transition-colors duration-300 ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>Profile Information</h3>
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isEditing
                          ? 'bg-red-500 text-white hover:bg-red-600'
                          : 'bg-[#00B330] text-white hover:bg-[#009f2b]'
                      }`}
                    >
                      {isEditing ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                      {isEditing ? 'Cancel' : 'Edit'}
                    </button>
                  </div>

                  <div className="space-y-4">
                    {isEditing ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className={`block text-sm font-medium mb-1 ${
                              darkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>Full Name</label>
                            <input
                              type="text"
                              value={editForm.fullName}
                              onChange={(e) => setEditForm({...editForm, fullName: e.target.value})}
                              className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                                darkMode 
                                  ? 'bg-gray-700 border-gray-600 text-white focus:border-[#00B330]' 
                                  : 'bg-white border-gray-300 text-gray-900 focus:border-[#00B330]'
                              } focus:outline-none focus:ring-2 focus:ring-[#00B330]/20`}
                            />
                          </div>
                          <div>
                            <label className={`block text-sm font-medium mb-1 ${
                              darkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>Email</label>
                            <input
                              type="email"
                              value={editForm.email}
                              onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                              className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                                darkMode 
                                  ? 'bg-gray-700 border-gray-600 text-white focus:border-[#00B330]' 
                                  : 'bg-white border-gray-300 text-gray-900 focus:border-[#00B330]'
                              } focus:outline-none focus:ring-2 focus:ring-[#00B330]/20`}
                            />
                          </div>
                          <div>
                            <label className={`block text-sm font-medium mb-1 ${
                              darkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>Phone</label>
                            <input
                              type="tel"
                              value={editForm.phone}
                              onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                              className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                                darkMode 
                                  ? 'bg-gray-700 border-gray-600 text-white focus:border-[#00B330]' 
                                  : 'bg-white border-gray-300 text-gray-900 focus:border-[#00B330]'
                              } focus:outline-none focus:ring-2 focus:ring-[#00B330]/20`}
                            />
                          </div>
                          <div>
                            <label className={`block text-sm font-medium mb-1 ${
                              darkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>Occupation</label>
                            <input
                              type="text"
                              value={editForm.occupation}
                              onChange={(e) => setEditForm({...editForm, occupation: e.target.value})}
                              className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                                darkMode 
                                  ? 'bg-gray-700 border-gray-600 text-white focus:border-[#00B330]' 
                                  : 'bg-white border-gray-300 text-gray-900 focus:border-[#00B330]'
                              } focus:outline-none focus:ring-2 focus:ring-[#00B330]/20`}
                            />
                          </div>
                          <div>
                            <label className={`block text-sm font-medium mb-1 ${
                              darkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>County</label>
                            <select
                              value={editForm.county}
                              onChange={(e) => setEditForm({...editForm, county: e.target.value})}
                              className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                                darkMode 
                                  ? 'bg-gray-700 border-gray-600 text-white focus:border-[#00B330]' 
                                  : 'bg-white border-gray-300 text-gray-900 focus:border-[#00B330]'
                              } focus:outline-none focus:ring-2 focus:ring-[#00B330]/20`}
                            >
                              <option value="">Select County</option>
                              {counties.map(c => (
                                <option key={c} value={c}>{c}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className={`block text-sm font-medium mb-1 ${
                              darkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>Sub-County</label>
                            <input
                              type="text"
                              value={editForm.subCounty}
                              onChange={(e) => setEditForm({...editForm, subCounty: e.target.value})}
                              className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                                darkMode 
                                  ? 'bg-gray-700 border-gray-600 text-white focus:border-[#00B330]' 
                                  : 'bg-white border-gray-300 text-gray-900 focus:border-[#00B330]'
                              } focus:outline-none focus:ring-2 focus:ring-[#00B330]/20`}
                            />
                          </div>
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${
                            darkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>Bio</label>
                          <textarea
                            value={editForm.bio}
                            onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                            rows={3}
                            className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                              darkMode 
                                ? 'bg-gray-700 border-gray-600 text-white focus:border-[#00B330]' 
                                : 'bg-white border-gray-300 text-gray-900 focus:border-[#00B330]'
                            } focus:outline-none focus:ring-2 focus:ring-[#00B330]/20`}
                            placeholder="Tell us about yourself..."
                          />
                        </div>
                        <button
                          onClick={handleProfileUpdate}
                          disabled={loading}
                          className="w-full py-2.5 bg-[#00B330] text-white rounded-lg hover:bg-[#009f2b] transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                          {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className={`p-3 rounded-lg transition-colors duration-300 ${
                          darkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                        }`}>
                          <p className={`text-xs transition-colors duration-300 ${
                            darkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>Full Name</p>
                          <p className={`text-sm font-medium transition-colors duration-300 ${
                            darkMode ? 'text-white' : 'text-gray-900'
                          }`}>{user?.fullName || '—'}</p>
                        </div>
                        <div className={`p-3 rounded-lg transition-colors duration-300 ${
                          darkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                        }`}>
                          <p className={`text-xs transition-colors duration-300 ${
                            darkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>Email</p>
                          <p className={`text-sm font-medium transition-colors duration-300 ${
                            darkMode ? 'text-white' : 'text-gray-900'
                          }`}>{user?.email || '—'}</p>
                        </div>
                        <div className={`p-3 rounded-lg transition-colors duration-300 ${
                          darkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                        }`}>
                          <p className={`text-xs transition-colors duration-300 ${
                            darkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>Phone</p>
                          <p className={`text-sm font-medium transition-colors duration-300 ${
                            darkMode ? 'text-white' : 'text-gray-900'
                          }`}>{user?.phone || '—'}</p>
                        </div>
                        <div className={`p-3 rounded-lg transition-colors duration-300 ${
                          darkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                        }`}>
                          <p className={`text-xs transition-colors duration-300 ${
                            darkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>Occupation</p>
                          <p className={`text-sm font-medium transition-colors duration-300 ${
                            darkMode ? 'text-white' : 'text-gray-900'
                          }`}>{user?.occupation || '—'}</p>
                        </div>
                        <div className={`p-3 rounded-lg transition-colors duration-300 ${
                          darkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                        }`}>
                          <p className={`text-xs transition-colors duration-300 ${
                            darkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>County</p>
                          <p className={`text-sm font-medium transition-colors duration-300 ${
                            darkMode ? 'text-white' : 'text-gray-900'
                          }`}>{user?.county || '—'}</p>
                        </div>
                        <div className={`p-3 rounded-lg transition-colors duration-300 ${
                          darkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                        }`}>
                          <p className={`text-xs transition-colors duration-300 ${
                            darkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>Sub-County</p>
                          <p className={`text-sm font-medium transition-colors duration-300 ${
                            darkMode ? 'text-white' : 'text-gray-900'
                          }`}>{user?.subCounty || '—'}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ============ NOTIFICATIONS TAB ============ */}
            {activeTab === 'notifications' && (
              <div className={`rounded-xl border overflow-hidden transition-colors duration-300 ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
              }`}>
                <div className="p-6">
                  <h3 className={`text-lg font-semibold mb-4 transition-colors duration-300 ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>Notification Preferences</h3>
                  <div className="space-y-2">
                    {Object.entries(notifications).map(([key, value]) => (
                      <div key={key} className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                        darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
                      }`}>
                        <div>
                          <p className={`font-medium transition-colors duration-300 ${
                            darkMode ? 'text-white' : 'text-gray-900'
                          } capitalize`}>{key.replace(/([A-Z])/g, ' $1')}</p>
                          <p className={`text-sm transition-colors duration-300 ${
                            darkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>Receive {key} notifications</p>
                        </div>
                        <button
                          onClick={() => toggleNotification(key)}
                          className={`relative w-11 h-6 rounded-full transition-colors ${
                            value ? 'bg-[#00B330]' : darkMode ? 'bg-gray-600' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                              value ? 'translate-x-5' : ''
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ============ SECURITY TAB ============ */}
            {activeTab === 'security' && (
              <div className={`rounded-xl border overflow-hidden transition-colors duration-300 ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
              }`}>
                <div className="p-6">
                  <h3 className={`text-lg font-semibold mb-4 transition-colors duration-300 ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>Security Settings</h3>
                  
                  {/* Change Password */}
                  <div className={`border rounded-lg mb-4 overflow-hidden transition-colors duration-300 ${
                    darkMode ? 'border-gray-700' : 'border-gray-200'
                  }`}>
                    <button
                      onClick={() => setShowPasswordForm(!showPasswordForm)}
                      className={`flex items-center justify-between w-full p-4 transition-colors ${
                        darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Key className={`w-5 h-5 transition-colors duration-300 ${
                          darkMode ? 'text-gray-400' : 'text-gray-400'
                        }`} />
                        <span className={`transition-colors duration-300 ${
                          darkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>Change Password</span>
                      </div>
                      <ChevronRight className={`w-5 h-5 transition-transform duration-300 ${
                        showPasswordForm ? 'rotate-90' : ''
                      } ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                    </button>
                    
                    {showPasswordForm && (
                      <div className={`p-4 border-t transition-colors duration-300 ${
                        darkMode ? 'border-gray-700' : 'border-gray-200'
                      }`}>
                        <div className="space-y-3">
                          <div>
                            <label className={`block text-sm font-medium mb-1 ${
                              darkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>Current Password</label>
                            <div className="relative">
                              <input
                                type={showCurrentPassword ? 'text' : 'password'}
                                value={passwordData.currentPassword}
                                onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                                className={`w-full px-3 py-2 rounded-lg border transition-colors pr-10 ${
                                  darkMode 
                                    ? 'bg-gray-700 border-gray-600 text-white focus:border-[#00B330]' 
                                    : 'bg-white border-gray-300 text-gray-900 focus:border-[#00B330]'
                                } focus:outline-none focus:ring-2 focus:ring-[#00B330]/20`}
                                placeholder="Enter current password"
                              />
                              <button
                                type="button"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                              >
                                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                          <div>
                            <label className={`block text-sm font-medium mb-1 ${
                              darkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>New Password</label>
                            <div className="relative">
                              <input
                                type={showNewPassword ? 'text' : 'password'}
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                                className={`w-full px-3 py-2 rounded-lg border transition-colors pr-10 ${
                                  darkMode 
                                    ? 'bg-gray-700 border-gray-600 text-white focus:border-[#00B330]' 
                                    : 'bg-white border-gray-300 text-gray-900 focus:border-[#00B330]'
                                } focus:outline-none focus:ring-2 focus:ring-[#00B330]/20`}
                                placeholder="Enter new password (min 6 characters)"
                              />
                              <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                              >
                                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                          <div>
                            <label className={`block text-sm font-medium mb-1 ${
                              darkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>Confirm Password</label>
                            <div className="relative">
                              <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                                className={`w-full px-3 py-2 rounded-lg border transition-colors pr-10 ${
                                  darkMode 
                                    ? 'bg-gray-700 border-gray-600 text-white focus:border-[#00B330]' 
                                    : 'bg-white border-gray-300 text-gray-900 focus:border-[#00B330]'
                                } focus:outline-none focus:ring-2 focus:ring-[#00B330]/20`}
                                placeholder="Confirm new password"
                              />
                              <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                              >
                                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                          <button
                            onClick={handlePasswordChange}
                            disabled={isChangingPassword}
                            className="w-full py-2 bg-[#00B330] text-white rounded-lg hover:bg-[#009f2b] transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            {isChangingPassword ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            {isChangingPassword ? 'Changing...' : 'Update Password'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Two-Factor Authentication */}
                  <div className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                    darkMode ? 'border-gray-700 hover:bg-gray-700/50' : 'border-gray-200 hover:bg-gray-50'
                  }`}>
                    <div className="flex items-center gap-3">
                      <Shield className={`w-5 h-5 transition-colors duration-300 ${
                        darkMode ? 'text-gray-400' : 'text-gray-400'
                      }`} />
                      <div>
                        <p className={`font-medium transition-colors duration-300 ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}>Two-Factor Authentication</p>
                        <p className={`text-sm transition-colors duration-300 ${
                          darkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {twoFactorEnabled ? 'Enabled - Extra security active' : 'Disabled - Add an extra layer of security'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleToggle2FA}
                      className={`relative w-11 h-6 rounded-full transition-colors ${
                        twoFactorEnabled ? 'bg-[#00B330]' : darkMode ? 'bg-gray-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          twoFactorEnabled ? 'translate-x-5' : ''
                        }`}
                      />
                    </button>
                  </div>

                  {/* Privacy Settings */}
                  <button
                    onClick={() => setShowPrivacyPolicy(true)}
                    className={`flex items-center justify-between w-full p-4 rounded-lg border mt-4 transition-colors ${
                      darkMode ? 'border-gray-700 hover:bg-gray-700/50' : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <FileText className={`w-5 h-5 transition-colors duration-300 ${
                        darkMode ? 'text-gray-400' : 'text-gray-400'
                      }`} />
                      <div>
                        <p className={`font-medium transition-colors duration-300 ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}>Privacy Policy</p>
                        <p className={`text-sm transition-colors duration-300 ${
                          darkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>How we handle your data</p>
                      </div>
                    </div>
                    <ChevronRight className={`w-5 h-5 transition-colors duration-300 ${
                      darkMode ? 'text-gray-500' : 'text-gray-400'
                    }`} />
                  </button>
                </div>
              </div>
            )}

            {/* ============ PREFERENCES TAB ============ */}
            {activeTab === 'preferences' && (
              <div className={`rounded-xl border overflow-hidden transition-colors duration-300 ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
              }`}>
                <div className="p-6">
                  <h3 className={`text-lg font-semibold mb-4 transition-colors duration-300 ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>Appearance & Preferences</h3>
                  
                  {/* Dark Mode Toggle */}
                  <div className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                    darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
                  }`}>
                    <div className="flex items-center gap-3">
                      {darkMode ? (
                        <Moon className="w-5 h-5 text-gray-400" />
                      ) : (
                        <Sun className="w-5 h-5 text-gray-400" />
                      )}
                      <div>
                        <p className={`font-medium transition-colors duration-300 ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}>Dark Mode</p>
                        <p className={`text-sm transition-colors duration-300 ${
                          darkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>Switch between light and dark themes</p>
                      </div>
                    </div>
                    <button
                      onClick={toggleTheme}
                      className={`relative w-12 h-7 rounded-full transition-colors ${
                        darkMode ? 'bg-[#00B330]' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                          darkMode ? 'translate-x-5' : ''
                        }`}
                      />
                    </button>
                  </div>

                  {/* Language */}
                  <div className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                    darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
                  }`}>
                    <div className="flex items-center gap-3">
                      <Globe className={`w-5 h-5 transition-colors duration-300 ${
                        darkMode ? 'text-gray-400' : 'text-gray-400'
                      }`} />
                      <div>
                        <p className={`font-medium transition-colors duration-300 ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}>Language</p>
                        <p className={`text-sm transition-colors duration-300 ${
                          darkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>Select your preferred language</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm transition-colors duration-300 ${
                        darkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>English</span>
                      <ChevronRight className={`w-4 h-4 transition-colors duration-300 ${
                        darkMode ? 'text-gray-500' : 'text-gray-400'
                      }`} />
                    </div>
                  </div>

                  {/* Push Notifications */}
                  <div className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                    darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
                  }`}>
                    <div className="flex items-center gap-3">
                      <Smartphone className={`w-5 h-5 transition-colors duration-300 ${
                        darkMode ? 'text-gray-400' : 'text-gray-400'
                      }`} />
                      <div>
                        <p className={`font-medium transition-colors duration-300 ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}>Push Notifications</p>
                        <p className={`text-sm transition-colors duration-300 ${
                          darkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>Receive notifications on your devices</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setNotifications(prev => ({ ...prev, push: !prev.push }));
                        localStorage.setItem('notificationPreferences', JSON.stringify({...notifications, push: !notifications.push}));
                        toast.success(`Push notifications ${!notifications.push ? 'enabled' : 'disabled'}`);
                      }}
                      className={`relative w-11 h-6 rounded-full transition-colors ${
                        notifications.push ? 'bg-[#00B330]' : darkMode ? 'bg-gray-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          notifications.push ? 'translate-x-5' : ''
                        }`}
                      />
                    </button>
                  </div>

                  {/* Data Saver */}
                  <div className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                    darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
                  }`}>
                    <div className="flex items-center gap-3">
                      <CreditCard className={`w-5 h-5 transition-colors duration-300 ${
                        darkMode ? 'text-gray-400' : 'text-gray-400'
                      }`} />
                      <div>
                        <p className={`font-medium transition-colors duration-300 ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}>Data Saver</p>
                        <p className={`text-sm transition-colors duration-300 ${
                          darkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>Reduce data usage across the app</p>
                      </div>
                    </div>
                    <button
                      className={`relative w-11 h-6 rounded-full transition-colors ${
                        darkMode ? 'bg-gray-600' : 'bg-gray-300'
                      }`}
                    >
                      <span className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className={`mt-6 w-full py-3.5 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 border ${
                darkMode 
                  ? 'bg-red-900/20 text-red-400 hover:bg-red-900/30 border-red-800/30' 
                  : 'bg-red-50 text-red-600 hover:bg-red-100 border-red-200'
              }`}
            >
              <LogOut className="w-5 h-5" />
              Log Out
            </button>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className={`text-xs transition-colors duration-300 ${
                darkMode ? 'text-gray-500' : 'text-gray-400'
              }`}>
                ISDP Platform v1.0.0 • © 2026 All rights reserved
              </p>
            </div>
          </div>
        </div>

        <BottomNav />
      </div>

      {/* 2FA Modal */}
      {show2FAModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className={`rounded-xl p-6 max-w-md w-full mx-4 transition-colors duration-300 ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold transition-colors duration-300 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>Enable 2FA</h3>
              <button
                onClick={() => setShow2FAModal(false)}
                className={`transition-colors duration-300 ${
                  darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className={`text-sm mb-4 transition-colors duration-300 ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Enter the 6-digit code from your authenticator app to enable 2FA.
            </p>
            <input
              type="text"
              value={twoFactorCode}
              onChange={(e) => setTwoFactorCode(e.target.value)}
              placeholder="Enter 6-digit code"
              className={`w-full px-3 py-2 rounded-lg border transition-colors text-center text-lg tracking-widest ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-[#00B330]' 
                  : 'bg-white border-gray-300 text-gray-900 focus:border-[#00B330]'
              } focus:outline-none focus:ring-2 focus:ring-[#00B330]/20`}
              maxLength={6}
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShow2FAModal(false)}
                className={`flex-1 py-2.5 rounded-lg transition-colors border ${
                  darkMode 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                    : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleEnable2FA}
                disabled={isSettingUp2FA || twoFactorCode.length !== 6}
                className="flex-1 py-2.5 bg-[#00B330] text-white rounded-lg hover:bg-[#009f2b] transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSettingUp2FA ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Enable'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Policy Modal */}
      {showPrivacyPolicy && (
        <PrivacyPolicy onClose={() => setShowPrivacyPolicy(false)} />
      )}
    </>
  );
}
