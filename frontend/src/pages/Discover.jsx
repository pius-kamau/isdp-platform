import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, MapPin, User, Filter, X, Star, Clock, Award, Briefcase, MessageCircle, Heart, Sparkles } from "lucide-react";
import apiClient from "../services/auth.service";
import Sidebar from "../components/Sidebar";
import BottomNav from "../components/BottomNav";
import toast from "react-hot-toast";

export default function Discover() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    skill: searchParams.get("skill") || "",
    county: "",
    isMentor: false,
    isVolunteer: false,
  });

  const handleSearch = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("q", searchQuery);
      if (filters.skill) params.append("skill", filters.skill);
      if (filters.county) params.append("county", filters.county);
      if (filters.isMentor) params.append("isMentor", "true");
      if (filters.isVolunteer) params.append("isVolunteer", "true");

      console.log("Searching with params:", params.toString());
      const response = await apiClient.get(`/search/users?${params.toString()}`);
      console.log("Search response:", response);
      setResults(response.data?.data || []);
    } catch (error) {
      console.error("Search error:", error);
      console.error("Error response:", error.response);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, []);

  const clearFilters = () => {
    setFilters({
      skill: "",
      county: "",
      isMentor: false,
      isVolunteer: false,
    });
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      <Sidebar />

      <div className="flex-1 md:ml-64 pb-20 md:pb-0">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-4 py-3 md:px-8 md:py-4 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="text-lg md:text-xl font-semibold text-gray-900">Discover</h1>
            <p className="text-xs text-gray-500 hidden md:block">Find people with skills you need</p>
          </div>
          <span className="text-sm text-gray-400">
            {!loading && results.length > 0 && `${results.length} results`}
          </span>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-4 md:px-8 md:py-6">
          {/* Search Bar */}
          <div className="relative mb-4">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search for skills, services or people..."
              className="w-full pl-12 pr-24 py-3.5 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#00B330] focus:border-transparent text-sm md:text-base placeholder:text-gray-400 shadow-sm hover:shadow-md transition-shadow"
            />
            <div className="absolute right-2 top-1.5 flex gap-1">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-xl transition-colors ${
                  showFilters 
                    ? 'bg-[#00B330] text-white' 
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Filter className="w-4 h-4 md:w-5 md:h-5" />
              </button>
              <button
                onClick={handleSearch}
                className="px-4 md:px-5 py-2 bg-[#00B330] text-white rounded-xl text-sm font-medium hover:bg-[#009f2b] transition-colors shadow-sm hover:shadow-md"
              >
                Search
              </button>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="bg-white rounded-2xl border border-gray-200 p-4 md:p-6 mb-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#00B330]" />
                  Filters
                </h3>
                <button
                  onClick={clearFilters}
                  className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors"
                >
                  <X className="w-3 h-3" />
                  Clear all
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Skill</label>
                  <input
                    type="text"
                    value={filters.skill}
                    onChange={(e) => setFilters({ ...filters, skill: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00B330] focus:border-transparent"
                    placeholder="e.g., Plumbing"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">County</label>
                  <input
                    type="text"
                    value={filters.county}
                    onChange={(e) => setFilters({ ...filters, county: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00B330] focus:border-transparent"
                    placeholder="e.g., Nairobi"
                  />
                </div>
                <div className="flex items-end gap-4">
                  <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.isMentor}
                      onChange={(e) => setFilters({ ...filters, isMentor: e.target.checked })}
                      className="w-4 h-4 text-[#00B330] focus:ring-[#00B330] rounded"
                    />
                    <span className="text-xs">Mentors</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.isVolunteer}
                      onChange={(e) => setFilters({ ...filters, isVolunteer: e.target.checked })}
                      className="w-4 h-4 text-[#00B330] focus:ring-[#00B330] rounded"
                    />
                    <span className="text-xs">Volunteers</span>
                  </label>
                </div>
              </div>
              <button
                onClick={handleSearch}
                className="mt-4 w-full py-2.5 bg-[#00B330] text-white rounded-xl font-medium hover:bg-[#009f2b] transition-colors text-sm"
              >
                Apply Filters
              </button>
            </div>
          )}

          {/* Results - Cards Layout */}
          {loading ? (
            <div className="text-center py-16">
              <div className="w-10 h-10 border-3 border-[#00B330] border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-gray-500 text-sm">Searching...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No results found</h3>
              <p className="text-sm text-gray-500 mt-1">Try adjusting your search or filters</p>
              <button
                onClick={clearFilters}
                className="mt-4 px-6 py-2 bg-[#00B330] text-white rounded-xl text-sm font-medium hover:bg-[#009f2b] transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
              {results.map((user) => (
                <div
                  key={user.id}
                  className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
                  onClick={() => navigate(`/profile/${user.id}`)}
                >
                  {/* Card Header */}
                  <div className="relative p-4 pb-0">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          {user.profilePhoto ? (
                            <img 
                              src={user.profilePhoto} 
                              alt={user.fullName}
                              className="w-14 h-14 rounded-xl object-cover border-2 border-gray-100"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.parentElement.innerHTML = `<div class="w-14 h-14 rounded-xl bg-gradient-to-br from-[#00B330] to-[#008A26] flex items-center justify-center text-white font-bold text-xl">${user.fullName?.charAt(0) || 'U'}</div>`;
                              }}
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#00B330] to-[#008A26] flex items-center justify-center text-white font-bold text-xl">
                              {user.fullName?.charAt(0) || "U"}
                            </div>
                          )}
                          {user.isMentor && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#00B330] rounded-full flex items-center justify-center border-2 border-white">
                              <Star className="w-3 h-3 text-white fill-white" />
                            </span>
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-base leading-tight">
                            {user.fullName}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {user.occupation || "Community Member"}
                          </p>
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

                  {/* Tags */}
                  <div className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {user.skills?.length > 0 ? (
                        user.skills.slice(0, 3).map((skill) => (
                          <span 
                            key={skill.id}
                            className="px-2.5 py-1 bg-[#00B330]/10 text-[#00B330] text-xs rounded-lg font-medium"
                          >
                            {skill.skill?.name || "Skill"}
                          </span>
                        ))
                      ) : (
                        <span className="px-2.5 py-1 bg-gray-100 text-gray-500 text-xs rounded-lg">
                          No skills listed
                        </span>
                      )}
                      {user.skills?.length > 3 && (
                        <span className="px-2.5 py-1 bg-gray-100 text-gray-500 text-xs rounded-lg font-medium">
                          +{user.skills.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="px-4 py-3 border-t border-gray-50 bg-gray-50/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        {user.county && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {user.county}
                          </span>
                        )}
                        {user.isMentor && (
                          <span className="text-[#00B330] font-medium text-xs">Mentor</span>
                        )}
                        {user.isVolunteer && (
                          <span className="text-blue-500 font-medium text-xs">Volunteer</span>
                        )}
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/profile/${user.id}`);
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
      </div>

      <BottomNav />
    </div>
  );
}
