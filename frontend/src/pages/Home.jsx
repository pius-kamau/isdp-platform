import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search, Bell, User as UserIcon, MapPin, Star, 
  Sparkles, Users, TrendingUp, Briefcase, 
  ArrowRight, Filter, X, Loader2, Award,
  Clock, ChevronRight, MessageCircle, Heart
} from "lucide-react";
import BottomNav from "../components/BottomNav";
import Sidebar from "../components/Sidebar";
import apiClient from "../services/auth.service";
import toast from "react-hot-toast";

export default function Home() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [recommendations, setRecommendations] = useState([]);
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
    fetchData();
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        const response = await apiClient.get('/users/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setLoading(false);
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };
      
      // Fetch mentors for recommendations
      const mentorsRes = await apiClient.get('/mentorship/search', {
        headers,
        params: { limit: 6 }
      });

      const mentorData = mentorsRes.data.data || [];
      
      // Format recommendations
      const formatted = mentorData.map((mentor, index) => ({
        id: mentor.id,
        name: mentor.fullName || `Mentor ${index + 1}`,
        skill: mentor.mentorSkills?.[0]?.skill?.name || "Mentor",
        location: mentor.county || "Kenya",
        rating: 4.5 + Math.random() * 0.5,
        available: true,
        initials: mentor.fullName?.charAt(0) || "M",
        profilePhoto: mentor.profilePhoto,
        occupation: mentor.occupation || "Mentor",
        skills: mentor.mentorSkills || []
      }));

      setRecommendations(formatted);
      setStats({
        totalSkills: mentorData.reduce((acc, m) => acc + (m.mentorSkills?.length || 0), 0),
        totalMentors: mentorData.length,
        totalUsers: mentorData.length + 5
      });
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      // Use fallback data if API fails
      setRecommendations(fallbackRecommendations);
    } finally {
      setLoading(false);
    }
  };

  const fallbackRecommendations = [
    {
      id: 1,
      name: "John Kamau",
      skill: "Plumbing",
      location: "Nairobi",
      rating: 4.8,
      available: true,
      initials: "JK",
      occupation: "Master Plumber",
    },
    {
      id: 2,
      name: "Grace Wanjiru",
      skill: "Farming",
      location: "Kiambu",
      rating: 4.9,
      available: true,
      initials: "GW",
      occupation: "Agricultural Expert",
    },
    {
      id: 3,
      name: "Peter Ochieng",
      skill: "Teaching",
      location: "Kisumu",
      rating: 4.7,
      available: false,
      initials: "PO",
      occupation: "Education Specialist",
    },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/discover?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      <Sidebar />

      <div className="flex-1 md:ml-64 pb-20 md:pb-0">
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
                {user?.fullName || 'Pius'}
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
          {/* Welcome Section - Improved */}
          <div className="mb-6 md:mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  {getGreeting()} 👋
                </h1>
                <p className="text-sm md:text-base text-gray-500 mt-1">
                  Discover skills and connect with mentors in your community
                </p>
              </div>
              <div className="hidden md:flex items-center gap-6 mt-2 md:mt-0">
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#00B330]">{stats.totalMentors}</p>
                  <p className="text-xs text-gray-500">Mentors</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#00B330]">{stats.totalSkills}</p>
                  <p className="text-xs text-gray-500">Skills</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#00B330]">{stats.totalUsers}+</p>
                  <p className="text-xs text-gray-500">Members</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search Bar - Enhanced */}
          <form onSubmit={handleSearch} className="mb-6 md:mb-8">
            <div className="relative max-w-2xl">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for skills, mentors, or topics..."
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#00B330] focus:border-transparent text-sm md:text-base placeholder:text-gray-400 shadow-sm hover:shadow-md transition-shadow"
              />
              <button
                type="submit"
                className="absolute right-2 top-1.5 px-4 py-2 bg-[#00B330] text-white rounded-xl text-sm font-medium hover:bg-[#009f2b] transition-colors"
              >
                Search
              </button>
            </div>
          </form>

          {/* Stats Cards - Mobile */}
          <div className="grid grid-cols-3 gap-3 md:hidden mb-6">
            <div className="bg-white rounded-xl p-3 text-center border border-gray-100 shadow-sm">
              <p className="text-xl font-bold text-[#00B330]">{stats.totalMentors}</p>
              <p className="text-xs text-gray-500">Mentors</p>
            </div>
            <div className="bg-white rounded-xl p-3 text-center border border-gray-100 shadow-sm">
              <p className="text-xl font-bold text-[#00B330]">{stats.totalSkills}</p>
              <p className="text-xs text-gray-500">Skills</p>
            </div>
            <div className="bg-white rounded-xl p-3 text-center border border-gray-100 shadow-sm">
              <p className="text-xl font-bold text-[#00B330]">{stats.totalUsers}+</p>
              <p className="text-xs text-gray-500">Members</p>
            </div>
          </div>

          {/* Popular Skills */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#00B330]" />
                Popular Skills
              </h2>
              <button 
                onClick={() => navigate('/discover')}
                className="text-sm text-[#00B330] font-medium hover:underline flex items-center gap-1"
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

          {/* Recommendations - Professional Cards */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-[#00B330]" />
                Top Mentors
              </h2>
              <button 
                onClick={() => navigate('/mentorship')}
                className="text-sm text-[#00B330] font-medium hover:underline flex items-center gap-1"
              >
                View All
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#00B330]" />
                <span className="ml-3 text-gray-500">Loading mentors...</span>
              </div>
            ) : recommendations.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900">No mentors found</h3>
                <p className="text-gray-500">Check back later for available mentors</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {recommendations.map((person) => (
                  <div
                    key={person.id}
                    className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
                    onClick={() => navigate(`/profile/${person.id}`)}
                  >
                    {/* Card Header - Avatar & Status */}
                    <div className="relative p-4 pb-0">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            {person.profilePhoto ? (
                              <img 
                                src={person.profilePhoto} 
                                alt={person.name}
                                className="w-14 h-14 rounded-xl object-cover"
                              />
                            ) : (
                              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#00B330] to-[#008A26] flex items-center justify-center text-white font-bold text-xl">
                                {person.initials}
                              </div>
                            )}
                            {person.available && (
                              <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></span>
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 text-base leading-tight">
                              {person.name}
                            </h3>
                            <p className="text-sm text-gray-500">{person.occupation || 'Mentor'}</p>
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

                    {/* Skills Tags */}
                    <div className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {person.skills && person.skills.length > 0 ? (
                          person.skills.slice(0, 3).map((skill) => (
                            <span 
                              key={skill.id}
                              className="px-2.5 py-1 bg-[#00B330]/10 text-[#00B330] text-xs rounded-lg font-medium"
                            >
                              {skill.skill?.name || 'Skill'}
                            </span>
                          ))
                        ) : (
                          <span className="px-2.5 py-1 bg-[#00B330]/10 text-[#00B330] text-xs rounded-lg font-medium">
                            {person.skill}
                          </span>
                        )}
                        {person.skills && person.skills.length > 3 && (
                          <span className="px-2.5 py-1 bg-gray-100 text-gray-500 text-xs rounded-lg font-medium">
                            +{person.skills.length - 3}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Footer - Location, Rating, Action */}
                    <div className="px-4 py-3 border-t border-gray-50 bg-gray-50/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {person.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                            {person.rating.toFixed(1)}
                          </span>
                          {person.available && (
                            <span className="flex items-center gap-1 text-[#00B330] font-medium">
                              <Clock className="w-3.5 h-3.5" />
                              Available
                            </span>
                          )}
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/profile/${person.id}`);
                          }}
                          className="px-4 py-1.5 bg-[#00B330] text-white text-xs font-medium rounded-lg hover:bg-[#009f2b] transition-colors shadow-sm hover:shadow-md"
                        >
                          Connect
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
            <div className="bg-gradient-to-r from-[#00B330] to-[#008A26] rounded-2xl p-6 text-white">
              <h3 className="text-lg font-bold">Become a Mentor</h3>
              <p className="text-sm opacity-90 mt-1">Share your skills and help others grow</p>
              <button 
                onClick={() => navigate('/profile')}
                className="mt-4 px-6 py-2.5 bg-white text-[#00B330] rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
