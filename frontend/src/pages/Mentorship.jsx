import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, UserPlus, Clock, CheckCircle, XCircle, 
  Calendar, MapPin, MessageCircle, Search, Filter,
  Star, Briefcase, Award, ChevronRight, Video,
  Phone, Mail, Loader2, Plus, BookOpen, UserCheck
} from 'lucide-react';
import apiClient from '../services/auth.service';
import Sidebar from '../components/Sidebar';
import BottomNav from '../components/BottomNav';
import toast from 'react-hot-toast';

export default function Mentorship() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('search');
  const [requests, setRequests] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [requestMessage, setRequestMessage] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const userId = JSON.parse(localStorage.getItem('user') || '{}')?.id;

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    console.log('🔑 Token found:', token ? 'Yes' : 'No');
    console.log('🔑 Token value:', token ? token.substring(0, 50) + '...' : 'None');
    console.log('👤 User ID:', userId);
    
    if (!token) {
      console.log('❌ No token found, redirecting to login');
      navigate('/login');
      return;
    }
    setIsAuthenticated(true);
  }, [navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      console.log('✅ Authenticated, fetching data...');
      fetchData();
    }
  }, [activeTab, isAuthenticated]);

  const fetchData = async () => {
    setLoading(true);
    console.log('📡 Fetching mentorship data...');
    try {
      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      if (!token) {
        console.log('❌ No token during fetch');
        navigate('/login');
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };
      console.log('📡 Headers:', headers);

      if (activeTab === 'requests' || activeTab === 'sessions') {
        try {
          console.log('📡 Fetching requests, sessions, stats...');
          const [requestsRes, sessionsRes, statsRes] = await Promise.all([
            apiClient.get('/mentorship/requests', { headers }),
            apiClient.get('/mentorship/sessions', { headers }),
            apiClient.get('/mentorship/stats', { headers })
          ]);

          console.log('📡 Requests response:', requestsRes.data);
          console.log('📡 Sessions response:', sessionsRes.data);
          console.log('📡 Stats response:', statsRes.data);

          setRequests(requestsRes.data.data || []);
          setSessions(sessionsRes.data.data || []);
          setStats(statsRes.data.data);
        } catch (err) {
          console.error('❌ Fetch error:', err);
          console.error('❌ Error status:', err.response?.status);
          console.error('❌ Error data:', err.response?.data);
          if (err.response?.status === 401) {
            console.log('🔑 Token expired, clearing storage...');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            navigate('/login');
            return;
          }
        }
      }

      if (activeTab === 'search') {
        try {
          console.log('📡 Searching mentors...');
          const mentorsRes = await apiClient.get('/mentorship/search', { 
            headers,
            params: { limit: 50 }
          });
          console.log('📡 Mentors found:', mentorsRes.data.data?.length || 0);
          setMentors(mentorsRes.data.data || []);
        } catch (err) {
          console.error('❌ Search error:', err);
          if (err.response?.status === 401) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            navigate('/login');
            return;
          }
        }
      }
    } catch (error) {
      console.error('❌ Fetch error:', error);
      toast.error('Failed to load mentorship data');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      if (!token) {
        navigate('/login');
        return;
      }
      
      const headers = { Authorization: `Bearer ${token}` };
      const params = { limit: 50 };
      if (searchQuery.trim()) {
        params.query = searchQuery.trim();
      }
      
      const response = await apiClient.get('/mentorship/search', { headers, params });
      setMentors(response.data.data || []);
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        navigate('/login');
        return;
      }
      console.error('Search error:', error);
      toast.error('Failed to search mentors');
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (mentorId, skillId) => {
    try {
      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await apiClient.post('/mentorship/requests', {
        mentorId,
        skillId,
        message: requestMessage || 'I would like to request mentorship'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Mentorship request sent!');
      setShowRequestModal(false);
      setSelectedMentor(null);
      setRequestMessage('');
      await fetchData();
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        navigate('/login');
        return;
      }
      console.error('Send request error:', error);
      toast.error(error.response?.data?.message || 'Failed to send request');
    }
  };

  const handleUpdateRequest = async (requestId, status) => {
    try {
      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      if (!token) {
        navigate('/login');
        return;
      }

      await apiClient.put(`/mentorship/requests/${requestId}`, {
        status
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success(`Request ${status}`);
      await fetchData();
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        navigate('/login');
        return;
      }
      console.error('Update request error:', error);
      toast.error('Failed to update request');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
      completed: 'bg-blue-100 text-blue-800',
      scheduled: 'bg-purple-100 text-purple-800',
      'no-show': 'bg-red-100 text-red-800',
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'accepted': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-blue-600" />;
      default: return null;
    }
  };

  const tabs = [
    { id: 'search', label: 'Find Mentors', icon: Search },
    { id: 'requests', label: 'Requests', icon: UserCheck },
    { id: 'sessions', label: 'Sessions', icon: Calendar },
  ];

  // Show loading while checking authentication
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
        <Sidebar />
        <div className="flex-1 md:ml-64 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#00B330] mx-auto" />
            <p className="mt-4 text-gray-500">Checking authentication...</p>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
        <Sidebar />
        <div className="flex-1 md:ml-64 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#00B330] mx-auto" />
            <p className="mt-4 text-gray-500">Loading mentorship...</p>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      <Sidebar />
      <div className="flex-1 md:ml-64 pb-20 md:pb-0">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-4 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div className="flex items-center gap-3">
              <BookOpen className="w-6 h-6 text-[#00B330]" />
              <h1 className="text-xl font-semibold text-gray-900">Mentorship</h1>
            </div>
            {stats && (
              <div className="flex items-center gap-3 text-sm">
                <span className="text-gray-500">
                  <span className="font-semibold text-[#00B330]">{stats.asMentor?.pending || 0}</span> pending
                </span>
                <span className="text-gray-300">|</span>
                <span className="text-gray-500">
                  <span className="font-semibold text-[#00B330]">{stats.sessions?.upcoming || 0}</span> upcoming
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 bg-white">
          <div className="max-w-4xl mx-auto px-4 flex gap-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-[#00B330] text-[#00B330]'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 py-6">
          {activeTab === 'search' && (
            <SearchTab
              mentors={mentors}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onSearch={handleSearch}
              onSelectMentor={(mentor) => {
                setSelectedMentor(mentor);
                setShowRequestModal(true);
              }}
              loading={loading}
            />
          )}

          {activeTab === 'requests' && (
            <RequestsTab 
              requests={requests} 
              onUpdate={handleUpdateRequest}
              userId={userId}
            />
          )}

          {activeTab === 'sessions' && (
            <SessionsTab 
              sessions={sessions} 
              userId={userId}
            />
          )}
        </div>
      </div>

      {/* Request Modal */}
      {showRequestModal && selectedMentor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Request Mentorship</h2>
              <button 
                onClick={() => {
                  setShowRequestModal(false);
                  setSelectedMentor(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-[#00B330]/10 flex items-center justify-center text-[#00B330] font-bold text-lg">
                {selectedMentor.fullName?.charAt(0) || 'M'}
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{selectedMentor.fullName}</h3>
                <p className="text-sm text-gray-500">{selectedMentor.occupation || 'Mentor'}</p>
                {selectedMentor.mentorSkills && selectedMentor.mentorSkills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedMentor.mentorSkills.slice(0, 2).map((skill) => (
                      <span key={skill.id} className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-full">
                        {skill.skill?.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message (Optional)
              </label>
              <textarea
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00B330] focus:border-transparent"
                rows={3}
                placeholder="Tell them why you'd like mentorship..."
              />
            </div>

            <button
              onClick={() => {
                const skillId = selectedMentor.mentorSkills?.[0]?.skillId || selectedMentor.skills?.[0]?.skillId;
                if (!skillId) {
                  toast.error('No skill found for this mentor');
                  return;
                }
                handleSendRequest(selectedMentor.id, skillId);
              }}
              className="w-full py-2.5 bg-[#00B330] text-white rounded-lg hover:bg-[#009f2b] transition font-medium"
            >
              Send Request
            </button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}

// ============ SEARCH TAB ============
function SearchTab({ mentors, searchQuery, setSearchQuery, onSearch, onSelectMentor, loading }) {
  return (
    <div>
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSearch()}
          placeholder="Search mentors by name, skill, or expertise..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00B330] focus:border-transparent"
        />
        <button
          onClick={onSearch}
          className="px-4 py-2 bg-[#00B330] text-white rounded-lg hover:bg-[#009f2b] transition flex items-center gap-2"
        >
          <Search className="w-4 h-4" />
          Search
        </button>
      </div>

      {mentors.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No Mentors Found</h3>
          <p className="text-gray-500">Try adjusting your search criteria or check back later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mentors.map((mentor) => (
            <div key={mentor.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-[#00B330]/10 flex items-center justify-center text-[#00B330] font-bold text-lg flex-shrink-0">
                  {mentor.fullName?.charAt(0) || 'M'}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 truncate">{mentor.fullName}</h4>
                  <p className="text-sm text-gray-500 truncate">{mentor.occupation || 'Mentor'}</p>
                  {mentor.mentorSkills && mentor.mentorSkills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {mentor.mentorSkills.slice(0, 3).map((skill) => (
                        <span key={skill.id} className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-full">
                          {skill.skill?.name}
                        </span>
                      ))}
                      {mentor.mentorSkills.length > 3 && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">
                          +{mentor.mentorSkills.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => onSelectMentor(mentor)}
                  className="px-3 py-1.5 bg-[#00B330]/10 text-[#00B330] text-sm rounded-lg hover:bg-[#00B330] hover:text-white transition flex items-center gap-1"
                >
                  <UserPlus className="w-4 h-4" />
                  Request
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============ REQUESTS TAB ============
function RequestsTab({ requests, onUpdate, userId }) {
  if (requests.length === 0) {
    return (
      <div className="text-center py-12">
        <UserCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">No Requests</h3>
        <p className="text-gray-500">You don't have any mentorship requests yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => {
        const isMentor = request.mentorId === userId;
        const otherPerson = isMentor ? request.mentee : request.mentor;
        const canAct = isMentor && request.status === 'pending';

        return (
          <div key={request.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-lg flex-shrink-0">
                  {otherPerson?.fullName?.charAt(0) || 'U'}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{otherPerson?.fullName || 'Unknown'}</h4>
                  <p className="text-sm text-gray-500">{isMentor ? 'Requested mentorship from you' : 'You requested mentorship from'}</p>
                  {request.skill && (
                    <span className="inline-block mt-1 px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-full">
                      {request.skill.name}
                    </span>
                  )}
                  {request.message && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{request.message}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(request.requestedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusBadge(request.status)}`}>
                  {getStatusIcon(request.status)}
                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                </span>
                {canAct && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => onUpdate(request.id, 'accepted')}
                      className="px-3 py-1 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => onUpdate(request.id, 'rejected')}
                      className="px-3 py-1 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600"
                    >
                      Decline
                    </button>
                  </div>
                )}
                {request.status === 'pending' && !isMentor && (
                  <button
                    onClick={() => onUpdate(request.id, 'cancelled')}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============ SESSIONS TAB ============
function SessionsTab({ sessions, userId }) {
  if (sessions.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">No Sessions</h3>
        <p className="text-gray-500">You don't have any mentorship sessions scheduled.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sessions.map((session) => {
        const isMentor = session.mentorId === userId;
        const otherPerson = isMentor ? session.mentee : session.mentor;

        return (
          <div key={session.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-lg flex-shrink-0">
                  {otherPerson?.fullName?.charAt(0) || 'U'}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">
                    {isMentor ? 'With ' : 'With '} {otherPerson?.fullName || 'Unknown'}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {isMentor ? 'You are mentoring' : 'Being mentored by'}
                  </p>
                  {session.request?.skill && (
                    <span className="inline-block mt-1 px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-full">
                      {session.request.skill.name}
                    </span>
                  )}
                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(session.scheduledAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(session.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span>{session.durationMinutes} min</span>
                  </div>
                  {session.locationDetail && (
                    <p className="text-xs text-gray-400 mt-1">{session.locationType}: {session.locationDetail}</p>
                  )}
                  {session.notes && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{session.notes}</p>
                  )}
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusBadge(session.status)}`}>
                {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
