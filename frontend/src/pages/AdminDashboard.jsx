import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, UserPlus, UserCheck, UserX, 
  BookOpen, Award, MessageCircle, Heart,
  Activity, Search, Filter, Eye, Edit, Trash2,
  CheckCircle, XCircle, AlertCircle, Shield,
  RefreshCw, Loader2, ChevronRight,
  Ban, UserCog, Bell, BellOff, Flag,
  ArrowLeft, X, Crown, Star, Mail, Phone, MapPin,
  LayoutDashboard, Settings, Home, LogOut
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';

const API_URL = 'https://isdp-backend.onrender.com/api';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [skills, setSkills] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalMentors: 0,
    totalSkills: 0,
    activeUsers: 0,
    admins: 0,
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  // Check if user is admin on mount
  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const userStr = localStorage.getItem('user');
        
        if (!token || !userStr) {
          console.log('❌ No token or user found, redirecting to login');
          navigate('/login');
          return;
        }

        const user = JSON.parse(userStr);
        console.log('👤 Current user:', user.email, 'Role:', user.role);

        // Check if user has admin role
        if (user.role === 'admin' || user.email === 'piusmwangi611@gmail.com') {
          console.log('✅ Admin access granted');
          setIsAdmin(true);
          setCheckingAuth(false);
          fetchDashboardData();
        } else {
          console.log('❌ User is not an admin, redirecting to home');
          toast.error('You do not have admin access');
          navigate('/home');
        }
      } catch (error) {
        console.error('❌ Auth check error:', error);
        navigate('/login');
      }
    };

    checkAdminAccess();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      
      const usersRes = await fetch(`${API_URL}/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const usersData = await usersRes.json();
      
      const skillsRes = await fetch(`${API_URL}/skills`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const skillsData = await skillsRes.json();

      const userList = usersData.data || [];
      const skillList = skillsData.data || [];
      
      setUsers(userList);
      setSkills(skillList);
      setStats({
        totalUsers: userList.length,
        totalMentors: userList.filter(u => u.isMentor).length,
        totalSkills: skillList.length,
        activeUsers: userList.filter(u => u.isActive).length,
        admins: userList.filter(u => u.role === 'admin').length,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId, action) => {
    try {
      const token = localStorage.getItem('accessToken');
      let endpoint = `${API_URL}/users/${userId}`;
      let method = 'PUT';
      let body = {};

      switch(action) {
        case 'activate':
          body = { isActive: true };
          break;
        case 'deactivate':
          body = { isActive: false };
          break;
        case 'make-mentor':
          body = { isMentor: true };
          break;
        case 'remove-mentor':
          body = { isMentor: false };
          break;
        case 'make-admin':
          body = { role: 'admin' };
          break;
        case 'remove-admin':
          body = { role: 'user' };
          break;
        default:
          return;
      }

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        toast.success(`User ${action.replace('-', ' ')} successful`);
        fetchDashboardData();
      } else {
        const data = await response.json();
        toast.error(data.message || `Failed to ${action} user`);
      }
    } catch (error) {
      console.error('User action error:', error);
      toast.error(`Failed to ${action} user`);
    }
  };

  const handleSkillAction = async (skillId, action) => {
    try {
      const token = localStorage.getItem('accessToken');
      
      if (action === 'delete') {
        const response = await fetch(`${API_URL}/skills/${skillId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (response.ok) {
          toast.success('Skill deleted successfully');
          fetchDashboardData();
        }
      }
    } catch (error) {
      console.error('Skill action error:', error);
      toast.error('Failed to delete skill');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || 
                       (filterRole === 'mentor' && user.isMentor) ||
                       (filterRole === 'volunteer' && user.isVolunteer) ||
                       (filterRole === 'active' && user.isActive) ||
                       (filterRole === 'admin' && user.role === 'admin');
    return matchesSearch && matchesRole;
  });

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'skills', label: 'Skills', icon: BookOpen },
  ];

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'blue' },
    { label: 'Mentors', value: stats.totalMentors, icon: UserCheck, color: 'green' },
    { label: 'Admins', value: stats.admins, icon: Shield, color: 'purple' },
    { label: 'Total Skills', value: stats.totalSkills, icon: BookOpen, color: 'orange' },
  ];

  // Show loading while checking auth
  if (checkingAuth) {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${
        darkMode ? 'bg-gray-900' : 'bg-gray-50'
      } flex flex-col md:flex-row`}>
        <div className="flex-1 md:ml-64 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-10 h-10 animate-spin text-[#00B330] mx-auto" />
            <p className={`mt-4 transition-colors duration-300 ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>Checking admin access...</p>
          </div>
        </div>
      </div>
    );
  }

  // If not admin, redirect (this should already be handled, but as a safety net)
  if (!isAdmin) {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${
        darkMode ? 'bg-gray-900' : 'bg-gray-50'
      } flex flex-col md:flex-row`}>
        <div className="flex-1 md:ml-64 flex items-center justify-center">
          <div className="text-center">
            <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className={`text-2xl font-bold transition-colors duration-300 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>Access Denied</h2>
            <p className={`mt-2 transition-colors duration-300 ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>You do not have permission to view this page.</p>
            <button
              onClick={() => navigate('/home')}
              className="mt-4 px-6 py-2 bg-[#00B330] text-white rounded-lg hover:bg-[#009f2b] transition-colors"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${
        darkMode ? 'bg-gray-900' : 'bg-gray-50'
      } flex flex-col md:flex-row`}>
        <div className="flex-1 md:ml-64 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-10 h-10 animate-spin text-[#00B330] mx-auto" />
            <p className={`mt-4 transition-colors duration-300 ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode ? 'bg-gray-900' : 'bg-gray-50'
    } flex flex-col md:flex-row`}>

      <div className="flex-1 md:ml-64 pb-20 md:pb-0">
        {/* Header */}
        <div className={`sticky top-0 z-10 px-4 py-4 md:px-8 md:py-4 border-b transition-colors duration-300 ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
        }`}>
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate(-1)} 
                className={`p-1 rounded-lg transition-colors md:hidden ${
                  darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className={`text-xl font-semibold transition-colors duration-300 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>Admin Dashboard</h1>
                <p className={`text-xs transition-colors duration-300 ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>Manage users, skills, and platform content</p>
              </div>
            </div>
            <button
              onClick={fetchDashboardData}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                darkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-6 md:px-8">
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

          {/* ============ OVERVIEW TAB ============ */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat) => {
                  const Icon = stat.icon;
                  const colors = {
                    blue: { bg: darkMode ? 'bg-blue-900/30' : 'bg-blue-50', text: 'text-blue-600 dark:text-blue-400' },
                    green: { bg: darkMode ? 'bg-green-900/30' : 'bg-green-50', text: 'text-green-600 dark:text-green-400' },
                    purple: { bg: darkMode ? 'bg-purple-900/30' : 'bg-purple-50', text: 'text-purple-600 dark:text-purple-400' },
                    orange: { bg: darkMode ? 'bg-orange-900/30' : 'bg-orange-50', text: 'text-orange-600 dark:text-orange-400' },
                  };
                  const color = colors[stat.color] || colors.blue;

                  return (
                    <div key={stat.label} className={`p-6 rounded-xl border transition-colors duration-300 ${
                      darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`text-sm transition-colors duration-300 ${
                            darkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>{stat.label}</p>
                          <p className={`text-2xl font-bold mt-1 transition-colors duration-300 ${
                            darkMode ? 'text-white' : 'text-gray-900'
                          }`}>{stat.value}</p>
                        </div>
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color.bg}`}>
                          <Icon className={`w-6 h-6 ${color.text}`} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className={`rounded-xl border overflow-hidden transition-colors duration-300 ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
              }`}>
                <div className={`px-6 py-4 border-b transition-colors duration-300 ${
                  darkMode ? 'border-gray-700' : 'border-gray-100'
                }`}>
                  <h3 className={`font-semibold transition-colors duration-300 ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>Recent Users</h3>
                </div>
                <div className="p-6">
                  {users.slice(0, 5).map((user) => (
                    <div key={user.id} className={`flex items-center gap-3 py-3 border-b last:border-0 transition-colors duration-300 ${
                      darkMode ? 'border-gray-700' : 'border-gray-100'
                    }`}>
                      <div className="w-10 h-10 rounded-full bg-[#00B330]/20 flex items-center justify-center text-[#00B330] font-bold text-sm">
                        {user.fullName?.charAt(0) || 'U'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className={`text-sm font-medium transition-colors duration-300 ${
                            darkMode ? 'text-white' : 'text-gray-900'
                          }`}>{user.fullName}</p>
                          {user.role === 'admin' && (
                            <span className="text-[10px] bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 px-2 py-0.5 rounded-full">Admin</span>
                          )}
                        </div>
                        <p className={`text-xs transition-colors duration-300 ${
                          darkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {user.isMentor ? 'Mentor' : 'Member'} • {user.county || 'N/A'}
                        </p>
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ============ USERS TAB ============ */}
          {activeTab === 'users' && (
            <div className={`rounded-xl border overflow-hidden transition-colors duration-300 ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
            }`}>
              <div className={`px-6 py-4 border-b transition-colors duration-300 ${
                darkMode ? 'border-gray-700' : 'border-gray-100'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1 flex items-center gap-2">
                    <Search className={`w-4 h-4 ${
                      darkMode ? 'text-gray-400' : 'text-gray-400'
                    }`} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search users..."
                      className={`flex-1 px-3 py-1.5 rounded-lg border text-sm transition-colors ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                      } focus:outline-none focus:ring-2 focus:ring-[#00B330]/20`}
                    />
                  </div>
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className={`px-3 py-1.5 rounded-lg border text-sm transition-colors ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-200 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-[#00B330]/20`}
                  >
                    <option value="all">All Users</option>
                    <option value="admin">Admins</option>
                    <option value="mentor">Mentors</option>
                    <option value="volunteer">Volunteers</option>
                    <option value="active">Active</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={`text-xs font-medium transition-colors duration-300 ${
                    darkMode ? 'text-gray-400 bg-gray-700/50' : 'text-gray-500 bg-gray-50'
                  }`}>
                    <tr>
                      <th className="px-6 py-3 text-left">User</th>
                      <th className="px-6 py-3 text-left">Email</th>
                      <th className="px-6 py-3 text-left">Role</th>
                      <th className="px-6 py-3 text-left">Status</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y transition-colors duration-300 ${
                    darkMode ? 'divide-gray-700' : 'divide-gray-100'
                  }`}>
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className={`transition-colors duration-300 ${
                        darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
                      }`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#00B330]/20 flex items-center justify-center text-[#00B330] font-bold text-xs">
                              {user.fullName?.charAt(0) || 'U'}
                            </div>
                            <span className={`text-sm font-medium transition-colors duration-300 ${
                              darkMode ? 'text-white' : 'text-gray-900'
                            }`}>{user.fullName}</span>
                          </div>
                        </td>
                        <td className={`px-6 py-4 text-sm transition-colors duration-300 ${
                          darkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}>{user.email}</td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {user.role === 'admin' && (
                              <span className="px-2 py-0.5 bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 text-xs rounded-full flex items-center gap-1">
                                <Shield className="w-3 h-3" /> Admin
                              </span>
                            )}
                            {user.isMentor && (
                              <span className="px-2 py-0.5 bg-[#00B330]/10 text-[#00B330] text-xs rounded-full">Mentor</span>
                            )}
                            {user.isVolunteer && (
                              <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-full">Volunteer</span>
                            )}
                            {!user.role && !user.isMentor && !user.isVolunteer && (
                              <span className={`px-2 py-0.5 text-xs rounded-full ${
                                darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'
                              }`}>Member</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 text-xs rounded-full ${
                            user.isActive 
                              ? 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400' 
                              : 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1 flex-wrap">
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowUserModal(true);
                              }}
                              className={`p-1.5 rounded-lg transition-colors ${
                                darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                              }`}
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            
                            {user.role === 'admin' ? (
                              <button
                                onClick={() => handleUserAction(user.id, 'remove-admin')}
                                className={`p-1.5 rounded-lg transition-colors ${
                                  darkMode ? 'hover:bg-yellow-900/30 text-yellow-400' : 'hover:bg-yellow-50 text-yellow-600'
                                }`}
                                title="Remove Admin"
                              >
                                <Crown className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleUserAction(user.id, 'make-admin')}
                                className={`p-1.5 rounded-lg transition-colors ${
                                  darkMode ? 'hover:bg-purple-900/30 text-purple-400' : 'hover:bg-purple-50 text-purple-600'
                                }`}
                                title="Make Admin"
                              >
                                <Crown className="w-4 h-4" />
                              </button>
                            )}
                            
                            <button
                              onClick={() => handleUserAction(user.id, user.isActive ? 'deactivate' : 'activate')}
                              className={`p-1.5 rounded-lg transition-colors ${
                                user.isActive 
                                  ? darkMode ? 'hover:bg-red-900/30 text-red-400' : 'hover:bg-red-50 text-red-500'
                                  : darkMode ? 'hover:bg-green-900/30 text-green-400' : 'hover:bg-green-50 text-green-500'
                              }`}
                              title={user.isActive ? 'Deactivate' : 'Activate'}
                            >
                              {user.isActive ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                            </button>
                            
                            <button
                              onClick={() => handleUserAction(user.id, user.isMentor ? 'remove-mentor' : 'make-mentor')}
                              className={`p-1.5 rounded-lg transition-colors ${
                                darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                              }`}
                              title={user.isMentor ? 'Remove Mentor' : 'Make Mentor'}
                            >
                              <UserCog className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ============ SKILLS TAB ============ */}
          {activeTab === 'skills' && (
            <div className={`rounded-xl border overflow-hidden transition-colors duration-300 ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
            }`}>
              <div className={`px-6 py-4 border-b flex items-center justify-between transition-colors duration-300 ${
                darkMode ? 'border-gray-700' : 'border-gray-100'
              }`}>
                <h3 className={`font-semibold transition-colors duration-300 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>Skills Management</h3>
                <span className={`text-sm transition-colors duration-300 ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>{skills.length} skills</span>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {skills.map((skill) => (
                    <div key={skill.id} className={`p-4 rounded-lg border transition-colors duration-300 ${
                      darkMode ? 'border-gray-700 hover:bg-gray-700/50' : 'border-gray-100 hover:bg-gray-50'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-[#00B330]/10 flex items-center justify-center text-[#00B330] font-bold">
                            {skill.name?.charAt(0) || 'S'}
                          </div>
                          <div>
                            <p className={`font-medium transition-colors duration-300 ${
                              darkMode ? 'text-white' : 'text-gray-900'
                            }`}>{skill.name}</p>
                            <p className={`text-xs transition-colors duration-300 ${
                              darkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>{skill.category || 'General'}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleSkillAction(skill.id, 'delete')}
                          className={`p-1.5 rounded-lg transition-colors ${
                            darkMode ? 'hover:bg-red-900/30 text-red-400' : 'hover:bg-red-50 text-red-500'
                          }`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className={`text-xs mt-2 transition-colors duration-300 ${
                        darkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {skill.isActive ? 'Active' : 'Inactive'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>


      {/* User Detail Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className={`max-w-lg w-full rounded-xl max-h-[90vh] overflow-y-auto transition-colors duration-300 ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className={`sticky top-0 z-10 px-6 py-4 border-b transition-colors duration-300 ${
              darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-white'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className={`font-semibold transition-colors duration-300 ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>User Details</h3>
                  {selectedUser.role === 'admin' && (
                    <span className="text-[10px] bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 px-2 py-0.5 rounded-full">Admin</span>
                  )}
                </div>
                <button
                  onClick={() => setShowUserModal(false)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[#00B330]/20 flex items-center justify-center text-[#00B330] text-2xl font-bold">
                  {selectedUser.fullName?.charAt(0) || 'U'}
                </div>
                <div>
                  <h4 className={`font-semibold transition-colors duration-300 ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>{selectedUser.fullName}</h4>
                  <p className={`text-sm transition-colors duration-300 ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>{selectedUser.email}</p>
                  <p className={`text-xs transition-colors duration-300 ${
                    darkMode ? 'text-gray-500' : 'text-gray-400'
                  }`}>Joined {new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className={`p-3 rounded-lg transition-colors duration-300 ${
                  darkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                }`}>
                  <p className={`text-xs transition-colors duration-300 ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>Phone</p>
                  <p className={`text-sm font-medium transition-colors duration-300 ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>{selectedUser.phone || '—'}</p>
                </div>
                <div className={`p-3 rounded-lg transition-colors duration-300 ${
                  darkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                }`}>
                  <p className={`text-xs transition-colors duration-300 ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>County</p>
                  <p className={`text-sm font-medium transition-colors duration-300 ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>{selectedUser.county || '—'}</p>
                </div>
                <div className={`p-3 rounded-lg transition-colors duration-300 ${
                  darkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                }`}>
                  <p className={`text-xs transition-colors duration-300 ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>Role</p>
                  <p className={`text-sm font-medium transition-colors duration-300 ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {selectedUser.role === 'admin' ? 'Admin' : 
                     selectedUser.isMentor ? 'Mentor' : 
                     selectedUser.isVolunteer ? 'Volunteer' : 'Member'}
                  </p>
                </div>
                <div className={`p-3 rounded-lg transition-colors duration-300 ${
                  darkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                }`}>
                  <p className={`text-xs transition-colors duration-300 ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>Status</p>
                  <p className={`text-sm font-medium transition-colors duration-300 ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      selectedUser.isActive 
                        ? 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400' 
                        : 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {selectedUser.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-4 border-t dark:border-gray-700">
                {selectedUser.role === 'admin' ? (
                  <button
                    onClick={() => {
                      handleUserAction(selectedUser.id, 'remove-admin');
                      setShowUserModal(false);
                    }}
                    className="flex-1 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <Crown className="w-4 h-4" />
                    Remove Admin
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      handleUserAction(selectedUser.id, 'make-admin');
                      setShowUserModal(false);
                    }}
                    className="flex-1 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <Shield className="w-4 h-4" />
                    Make Admin
                  </button>
                )}
                <button
                  onClick={() => {
                    handleUserAction(selectedUser.id, selectedUser.isActive ? 'deactivate' : 'activate');
                    setShowUserModal(false);
                  }}
                  className={`flex-1 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm ${
                    selectedUser.isActive 
                      ? 'bg-red-500 text-white hover:bg-red-600' 
                      : 'bg-[#00B330] text-white hover:bg-[#009f2b]'
                  }`}
                >
                  {selectedUser.isActive ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                  {selectedUser.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}