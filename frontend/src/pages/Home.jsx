import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Bell, User as UserIcon, MapPin, Star } from "lucide-react";
import BottomNav from "../components/BottomNav";
import Sidebar from "../components/Sidebar";

export default function Home() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const popularSkills = ["Technology", "Farming", "Teaching", "Repair", "Cooking", "Design"];

  const recommendations = [
    {
      id: 1,
      name: "John Kamau",
      skill: "Plumbing",
      location: "Nairobi",
      rating: 4.8,
      available: true,
      initials: "JK",
    },
    {
      id: 2,
      name: "Grace Wanjiru",
      skill: "Farming",
      location: "Kiambu",
      rating: 4.9,
      available: true,
      initials: "GW",
    },
    {
      id: 3,
      name: "Peter Ochieng",
      skill: "Teaching",
      location: "Kisumu",
      rating: 4.7,
      available: false,
      initials: "PO",
    },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/discover?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f8f7] flex flex-col md:flex-row">
      {/* Sidebar - Desktop only */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 md:ml-64">
        {/* Header - Mobile First */}
        <header className="bg-white border-b border-gray-100 px-4 py-3 flex justify-between items-center sticky top-0 z-10 md:px-6 md:py-4">
          <div className="flex items-center gap-2 md:hidden">
            <div className="h-8 w-8 rounded-lg bg-[#00B330] flex items-center justify-center text-white font-bold text-sm">
              I
            </div>
            <span className="text-base font-bold text-[#00B330]">ISDP</span>
          </div>
          <div className="hidden md:flex md:items-center md:gap-2">
            <span className="text-sm text-gray-500">Welcome back,</span>
            <span className="text-sm font-medium text-gray-900">Pius</span>
          </div>
          <div className="flex items-center gap-3 md:gap-4">
            <button className="text-gray-400 hover:text-gray-600 p-1">
              <Bell className="w-5 h-5 md:w-5 md:h-5" />
            </button>
            <button className="text-gray-400 hover:text-gray-600 p-1 md:hidden">
              <UserIcon className="w-5 h-5" />
            </button>
          </div>
        </header>

        <div className="flex-1 px-4 py-4 md:px-8 md:py-6 max-w-4xl mx-auto w-full">
          {/* Welcome Section */}
          <div className="mb-5 md:mb-8">
            <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Good morning 👋</h1>
            <p className="text-sm md:text-base text-gray-500 mt-0.5">Discover skills around you</p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-5 md:mb-8">
            <div className="relative max-w-2xl">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search skills..."
                className="w-full pl-10 md:pl-12 pr-4 py-3 md:py-3.5 bg-white border border-gray-200 rounded-xl md:rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#00B330] focus:border-transparent text-sm md:text-base placeholder:text-gray-400"
              />
            </div>
          </form>

          {/* Popular Skills */}
          <div className="mb-6 md:mb-8">
            <h2 className="text-xs md:text-sm font-medium text-gray-400 uppercase tracking-wider mb-3 md:mb-4">
              Popular Skills
            </h2>
            <div className="flex flex-wrap gap-2 md:gap-3">
              {popularSkills.map((skill) => (
                <button
                  key={skill}
                  onClick={() => navigate(`/discover?skill=${encodeURIComponent(skill)}`)}
                  className="px-3.5 md:px-5 py-1.5 md:py-2 bg-white border border-gray-200 rounded-full text-sm md:text-base text-gray-600 hover:border-[#00B330] hover:text-[#00B330] transition-colors active:scale-95 touch-manipulation"
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div>
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <h2 className="text-xs md:text-sm font-medium text-gray-400 uppercase tracking-wider">
                Recommended
              </h2>
              <button className="text-xs md:text-sm text-[#00B330] font-medium hover:underline">
                See All
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              {recommendations.map((person) => (
                <div
                  key={person.id}
                  className="bg-white rounded-xl md:rounded-2xl border border-gray-100 p-3.5 md:p-5 flex items-center gap-3 md:gap-4 hover:shadow-sm transition-shadow cursor-pointer active:bg-gray-50 touch-manipulation"
                  onClick={() => navigate(`/profile/${person.id}`)}
                >
                  <div className="w-11 h-11 md:w-14 md:h-14 rounded-full bg-[#00B330]/10 flex items-center justify-center text-[#00B330] font-semibold text-sm md:text-lg flex-shrink-0">
                    {person.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 text-sm md:text-base">{person.name}</h3>
                    <p className="text-xs md:text-sm text-gray-500">{person.skill}</p>
                    <div className="flex items-center gap-2 md:gap-3 mt-0.5 text-xs md:text-sm text-gray-500">
                      <span className="flex items-center gap-0.5">
                        <MapPin className="w-3 h-3 md:w-4 md:h-4" />
                        {person.location}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <Star className="w-3 h-3 md:w-4 md:h-4 fill-yellow-400 text-yellow-400" />
                        {person.rating}
                      </span>
                      {person.available && (
                        <span className="text-[#00B330] font-medium text-[10px] md:text-xs">Available</span>
                      )}
                    </div>
                  </div>
                  <button className="flex-shrink-0 text-xs md:text-sm text-[#00B330] font-medium hover:underline active:text-[#008A26] touch-manipulation px-2 py-1">
                    View
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation - Mobile only */}
      <div className="md:hidden">
        <BottomNav />
      </div>
    </div>
  );
}