import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, MapPin, User, Filter, X, Star } from "lucide-react";
import apiClient from "../services/auth.service";
import Sidebar from "../components/Sidebar";
import BottomNav from "../components/BottomNav";

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
    <div className="min-h-screen bg-[#f7f8f7] flex flex-col md:flex-row">
      {/* Sidebar - Desktop only */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 md:ml-64">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-4 py-3 md:px-6 md:py-4 flex items-center justify-between sticky top-0 z-10">
          <h1 className="text-lg md:text-xl font-semibold text-gray-900">Discover</h1>
          <span className="text-sm text-gray-500 hidden md:inline">Find people with skills you need</span>
        </div>

        <div className="flex-1 px-4 py-4 md:px-8 md:py-6 max-w-4xl mx-auto w-full">
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search for skills, services or people..."
              className="w-full pl-10 md:pl-12 pr-24 py-3 md:py-3.5 bg-white border border-gray-200 rounded-xl md:rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#00B330] focus:border-transparent text-sm md:text-base placeholder:text-gray-400"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50"
              >
                <Filter className="w-4 h-4 md:w-5 md:h-5" />
              </button>
              <button
                onClick={handleSearch}
                className="px-4 md:px-5 py-1.5 md:py-2 bg-[#00B330] text-white rounded-lg text-sm font-medium hover:bg-[#009f2b]"
              >
                Search
              </button>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="bg-white rounded-xl md:rounded-2xl border border-gray-200 p-4 md:p-5 mb-4 space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium text-gray-700">Filters</h3>
                <button
                  onClick={clearFilters}
                  className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  Clear all
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Skill</label>
                  <input
                    type="text"
                    value={filters.skill}
                    onChange={(e) => setFilters({ ...filters, skill: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#00B330]"
                    placeholder="e.g., Plumbing"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">County</label>
                  <input
                    type="text"
                    value={filters.county}
                    onChange={(e) => setFilters({ ...filters, county: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#00B330]"
                    placeholder="e.g., Nairobi"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={filters.isMentor}
                    onChange={(e) => setFilters({ ...filters, isMentor: e.target.checked })}
                    className="w-4 h-4 text-[#00B330] focus:ring-[#00B330] rounded"
                  />
                  Mentors only
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={filters.isVolunteer}
                    onChange={(e) => setFilters({ ...filters, isVolunteer: e.target.checked })}
                    className="w-4 h-4 text-[#00B330] focus:ring-[#00B330] rounded"
                  />
                  Volunteers only
                </label>
              </div>
              <button
                onClick={handleSearch}
                className="w-full py-2 bg-[#00B330] text-white rounded-lg font-medium hover:bg-[#009f2b] text-sm"
              >
                Apply Filters
              </button>
            </div>
          )}

          {/* Results Count */}
          {!loading && results.length > 0 && (
            <p className="text-sm text-gray-500 mb-3">
              {results.length} {results.length === 1 ? "result" : "results"} found
            </p>
          )}

          {/* Results */}
          {loading ? (
            <div className="text-center py-10">
              <div className="w-8 h-8 border-2 border-[#00B330] border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-gray-500 text-sm">Searching...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <User className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p>No results found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {results.map((user) => (
                <div
                  key={user.id}
                  className="bg-white rounded-xl md:rounded-2xl border border-gray-100 p-3.5 md:p-5 hover:shadow-sm transition-shadow cursor-pointer"
                  onClick={() => {
                    console.log("Navigating to profile with ID:", user.id);
                    navigate(`/profile/${user.id}`);
                  }}
                >
                  <div className="flex items-start gap-3 md:gap-4">
                    <div className="w-11 h-11 md:w-14 md:h-14 rounded-full bg-[#00B330]/10 flex items-center justify-center text-[#00B330] font-semibold text-sm md:text-lg flex-shrink-0">
                      {user.fullName?.charAt(0) || "U"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 text-sm md:text-base">{user.fullName}</h3>
                      <p className="text-xs md:text-sm text-gray-500">
                        {user.occupation || "Community Member"}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-1 text-xs md:text-sm text-gray-500">
                        {user.county && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 md:w-4 md:h-4" />
                            {user.county}
                          </span>
                        )}
                        {user.isMentor && (
                          <span className="text-[#00B330] font-medium">Mentor</span>
                        )}
                        {user.isVolunteer && (
                          <span className="text-blue-500 font-medium">Volunteer</span>
                        )}
                      </div>
                      {user.skills?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {user.skills.slice(0, 3).map((skill) => (
                            <span
                              key={skill.id}
                              className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
                            >
                              {skill.skill?.name || "Skill"}
                            </span>
                          ))}
                          {user.skills.length > 3 && (
                            <span className="text-xs text-gray-400">
                              +{user.skills.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <button className="flex-shrink-0 text-xs md:text-sm text-[#00B330] font-medium hover:underline">
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation - Mobile only */}
      <div className="md:hidden">
        <BottomNav />
      </div>
    </div>
  );
}