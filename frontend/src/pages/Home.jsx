import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search, Bell, User as UserIcon, MapPin, Star, 
  Sparkles, Users, TrendingUp, Briefcase, 
  ArrowRight, Filter, X, Loader2, Award,
  Clock, ChevronRight, MessageCircle, Heart
} from "lucide-react";
import BottomNav from "../components/BottomNav";
import toast from "react-hot-toast";

const API_URL = 'https://isdp-backend.onrender.com/api';

export default function Home() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalSkills: 0,
    totalMentors: 0,
    totalUsers: 0
  });

  const popularSkills = [
    "Technology", "Farming", "Teaching", "Repair", 
    "Cooking", "Design", "Plumbing", "Carpentry"
  ];

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchUser();
    fetchAllUsers();
    fetchSkills();
  }, []);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        const response = await fetch(`${API_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.status === 'success') {
          setUser(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  // Fetch skills count
  const fetchSkills = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const response = await fetch(`${API_URL}/skills`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success' && data.data) {
          setStats(prev => ({
            ...prev,
            totalSkills: data.data.length || 0
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching skills:', error);
    }
  };

  // Fetch real users from the database
  const fetchAllUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setLoading(false);
        return;
      }

      let response = await fetch(`${API_URL}/admin/users`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        response = await fetch(`${API_URL}/users`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }

      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success' && data.data) {
          const users = data.data;
          setAllUsers(users);
          
          const mentors = users.filter(u => u.isMentor === true).length;
          
          setStats(prev => ({
            ...prev,
            totalMentors: mentors,
            totalUsers: users.length
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/discover?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">

      <div className="flex-1  pb-20 md:pb-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-100 px-4 py-3 flex justify-between items-center sticky top-0 z-10 md:px-8 md:py-4">
          <div className="flex items-center gap-3">
            <div className="md:hidden">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#00B330] to-[#008A26] flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-[#00B330]/20">
                I
              </div>
            </div>
            <div className="hidden md:flex md:flex-col">
              <span className="text-sm text-gray-500">Welcome back,</span>
              <span className="text-lg font-semibold text-gray-900">
                {user?.fullName || 'User'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 md:gap-4">
            <button className="relative text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-50 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
            </button>
            <button 
              onClick={() => navigate('/profile')}
              className="flex items-center gap-2 text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <UserIcon className="w-5 h-5" />
              <span className="hidden md:inline text-sm font-medium text-gray-700">Profile</span>
            </button>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-4 py-4 md:px-8 md:py-6">
          {/* Welcome + Search inline */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Welcome to ISDP Platform
              </h1>
              <p className="text-sm md:text-base text-gray-500 mt-1">
                Discover skills and connect with mentors in your community
              </p>
            </div>
            
            {/* Search Bar - inline with greeting */}
            <form onSubmit={handleSearch} className="w-full md:w-auto md:min-w-[300px] lg:min-w-[400px]">
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search skills, mentors, or topics..."
                  className="w-full pl-9 pr-20 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00B330] focus:border-transparent text-sm placeholder:text-gray-400 shadow-sm hover:shadow-md transition-shadow"
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1 px-4 py-1 bg-[#00B330] text-white rounded-lg text-sm font-medium hover:bg-[#009f2b] transition-all hover:shadow-md active:scale-95"
                >
                  Search
                </button>
              </div>
            </form>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-3 md:grid-cols-3 md:gap-4 mb-6">
            <div className="bg-white rounded-xl p-3 md:p-4 text-center border border-gray-100 shadow-sm">
              <p className="text-xl md:text-2xl font-bold text-[#00B330]">{stats.totalMentors}</p>
              <p className="text-xs text-gray-500 font-medium">Mentors</p>
            </div>
            <div className="bg-white rounded-xl p-3 md:p-4 text-center border border-gray-100 shadow-sm">
              <p className="text-xl md:text-2xl font-bold text-[#00B330]">{stats.totalSkills}</p>
              <p className="text-xs text-gray-500 font-medium">Skills</p>
            </div>
            <div className="bg-white rounded-xl p-3 md:p-4 text-center border border-gray-100 shadow-sm">
              <p className="text-xl md:text-2xl font-bold text-[#00B330]">{stats.totalUsers}</p>
              <p className="text-xs text-gray-500 font-medium">Members</p>
            </div>
          </div>

          {/* Popular Skills */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                Popular Skills
              </h2>
              <button 
                onClick={() => navigate('/discover')}
                className="text-sm text-[#00B330] font-medium hover:underline flex items-center gap-1 transition-colors"
              >
                View All
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2 md:gap-3">
              {popularSkills.map((skill) => (
                <button
                  key={skill}
                  onClick={() => navigate(`/discover?skill=${encodeURIComponent(skill)}`)}
                  className="px-4 md:px-5 py-2 md:py-2.5 bg-white border border-gray-200 rounded-xl text-sm md:text-base text-gray-700 hover:border-[#00B330] hover:text-[#00B330] hover:shadow-md transition-all active:scale-95 touch-manipulation font-medium"
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          {/* Community Members */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                Community Members
              </h2>
              <button 
                onClick={() => navigate('/discover')}
                className="text-sm text-[#00B330] font-medium hover:underline flex items-center gap-1 transition-colors"
              >
                View All
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#00B330]" />
                <span className="ml-3 text-gray-500 font-medium">Loading members...</span>
              </div>
            ) : allUsers.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900">No members found</h3>
                <p className="text-gray-500">Start connecting with people in your community</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {allUsers.slice(0, 6).map((person) => (
                  <div
                    key={person.id}
                    className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1"
                    onClick={() => navigate(`/profile/${person.id}`)}
                  >
                    {/* Card Header */}
                    <div className="relative p-4 pb-0">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            {person.profilePhoto ? (
                              <img 
                                src={person.profilePhoto} 
                                alt={person.fullName}
                                className="w-14 h-14 rounded-xl object-cover"
                              />
                            ) : (
                              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#00B330] to-[#008A26] flex items-center justify-center text-white font-bold text-xl shadow-md shadow-[#00B330]/20">
                                {person.fullName?.charAt(0) || 'U'}
                              </div>
                            )}
                            {person.isActive !== false && (
                              <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></span>
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 text-base leading-tight">
                              {person.fullName || 'User'}
                            </h3>
                            <p className="text-sm text-gray-500">{person.occupation || 'Member'}</p>
                          </div>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            toast.success('Added to favorites!');
                          }}
                          className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                        >
                          <Heart className="w-5 h-5 text-gray-300 hover:text-red-500 transition-colors" />
                        </button>
                      </div>
                    </div>

                    {/* User Details */}
                    <div className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {person.county && (
                          <span className="px-2.5 py-1 bg-blue-50 text-blue-600 text-xs rounded-lg font-medium">
                            {person.county}
                          </span>
                        )}
                        {person.role === 'admin' && (
                          <span className="px-2.5 py-1 bg-yellow-50 text-yellow-600 text-xs rounded-lg font-medium">
                            Admin
                          </span>
                        )}
                        {person.isMentor && (
                          <span className="px-2.5 py-1 bg-purple-50 text-purple-600 text-xs rounded-lg font-medium">
                            Mentor
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="px-4 py-3 border-t border-gray-50 bg-gray-50/50 group-hover:bg-white transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" />
                            Member
                          </span>
                          {person.isActive !== false && (
                            <span className="flex items-center gap-1 text-[#00B330] font-medium">
                              <Clock className="w-3.5 h-3.5" />
                              Active
                            </span>
                          )}
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/profile/${person.id}`);
                          }}
                          className="px-4 py-1.5 bg-[#00B330] text-white text-xs font-medium rounded-lg hover:bg-[#009f2b] transition-all shadow-sm hover:shadow-md"
                        >
                          View Profile
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Call to Action - Mobile */}
          <div className="mt-8 md:hidden">
            <div className="bg-gradient-to-r from-[#00B330] to-[#008A26] rounded-2xl p-6 text-white shadow-lg shadow-[#00B330]/20">
              <h3 className="text-lg font-bold">Join the Community</h3>
              <p className="text-sm opacity-90 mt-1">Connect with {stats.totalUsers}+ members</p>
              <button 
                onClick={() => navigate('/discover')}
                className="mt-4 px-6 py-2.5 bg-white text-[#00B330] rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all hover:shadow-md active:scale-95"
              >
                Discover
              </button>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}