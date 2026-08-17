import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, UserPlus, Clock, CheckCircle, XCircle, 
  Calendar, MapPin, MessageCircle, Search, Filter,
  Star, Briefcase, Award, ChevronRight, Video,
  Phone, Mail, Loader2, Plus, BookOpen, UserCheck,
  CalendarPlus, VideoIcon, PhoneCall, Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = 'https://isdp-backend.onrender.com/api';

// Helper functions
const getStatusBadge = (status) => {
  const styles = {
    pending: 'bg-yellow-100 text-yellow-800',
    accepted: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800',
    completed: 'bg-blue-100 text-blue-800',
    scheduled: 'bg-purple-100 text-purple-800',
  };
  return styles[status] || 'bg-gray-100 text-gray-800';
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'pending': return <Clock className="w-4 h-4" />;
    case 'accepted': return <CheckCircle className="w-4 h-4 text-green-600" />;
    case 'rejected': return <XCircle className="w-4 h-4 text-red-500" />;
    case 'completed': return <CheckCircle className="w-4 h-4 text-blue-600" />;
    case 'scheduled': return <Calendar className="w-4 h-4 text-purple-600" />;
    default: return null;
  }
};

export default function Mentorship() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('search');
  const [requests, setRequests] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [requestMessage, setRequestMessage] = useState('');
  const [selectedSkillIds, setSelectedSkillIds] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Session scheduling state
  const [sessionData, setSessionData] = useState({
    date: '',
    time: '',
    duration: '60',
    type: 'video',
    notes: '',
  });

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const userId = user?.id;

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/login');
      return;
    }
    setIsAuthenticated(true);
  }, [navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAllData();
    }
  }, [activeTab, isAuthenticated]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        navigate('/login');
        return;
      }

      let usersData = [];
      try {
        const response = await fetch(`${API_URL}/users`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (response.ok) {
          const data = await response.json();
          if (data.status === 'success' && data.data) {
            usersData = data.data;
          }
        }
      } catch (e) {
        console.log('Error fetching users:', e);
      }

      if (usersData.length === 0) {
        try {
          const response = await fetch(`${API_URL}/admin/users`, {
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          if (response.ok) {
            const data = await response.json();
            if (data.status === 'success' && data.data) {
              usersData = data.data;
            }
          }
        } catch (e) {
          console.log('Error fetching admin users:', e);
        }
      }

      setAllUsers(usersData);
      
      const mentorUsers = usersData.filter(u => u.isMentor === true);
      setMentors(mentorUsers);
      
      setStats({
        totalMentors: mentorUsers.length,
        totalUsers: usersData.length
      });

      // Fetch mentorship requests
      try {
        const requestsRes = await fetch(`${API_URL}/mentorship/requests`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (requestsRes.ok) {
          const requestsData = await requestsRes.json();
          setRequests(requestsData.data || []);
        }
      } catch (e) {
        console.log('Requests endpoint not available yet');
      }

      // Fetch sessions
      try {
        const sessionsRes = await fetch(`${API_URL}/mentorship/sessions`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (sessionsRes.ok) {
          const sessionsData = await sessionsRes.json();
          setSessions(sessionsData.data || []);
        }
      } catch (e) {
        console.log('Sessions endpoint not available yet');
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load mentorship data');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      const mentorUsers = allUsers.filter(u => u.isMentor === true);
      setMentors(mentorUsers);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = allUsers.filter(u => 
      u.isMentor === true && (
        u.fullName?.toLowerCase().includes(query) ||
        u.occupation?.toLowerCase().includes(query) ||
        u.county?.toLowerCase().includes(query) ||
        u.skills?.some(s => s.skill?.name?.toLowerCase().includes(query))
      )
    );
    setMentors(filtered);
  };

  const handleSendRequest = async () => {
    if (!selectedMentor) {
      toast.error('Please select a mentor');
      return;
    }

    let skillIds = selectedSkillIds;
    if (skillIds.length === 0 && selectedMentor.skills && selectedMentor.skills.length > 0) {
      const firstSkill = selectedMentor.skills[0];
      skillIds = [firstSkill.skill?.id || firstSkill.id];
    }

    const payload = {
      mentorId: selectedMentor.id,
      skillIds: skillIds,
      message: requestMessage || 'I would like to request mentorship',
      availability: 'Flexible'
    };

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        navigate('/login');
        return;
      }

      console.log('📤 Sending mentorship request:', JSON.stringify(payload, null, 2));

      const response = await fetch(`${API_URL}/mentorship/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const responseData = await response.json();
      console.log('📥 Response:', responseData);

      if (response.ok) {
        toast.success('Mentorship request sent successfully!');
        setShowRequestModal(false);
        setSelectedMentor(null);
        setRequestMessage('');
        setSelectedSkillIds([]);
        fetchAllData();
      } else {
        toast.error(responseData.message || 'Failed to send mentorship request');
      }
    } catch (error) {
      console.error('Send request error:', error);
      toast.error('Failed to send request');
    }
  };

  const handleUpdateRequest = async (requestId, status) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_URL}/mentorship/requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        toast.success(`Request ${status}`);
        fetchAllData();
      } else {
        toast.error('Failed to update request');
      }
    } catch (error) {
      console.error('Update request error:', error);
      toast.error('Failed to update request');
    }
  };

  // ============ SESSION SCHEDULING ============
  const openSessionModal = (request) => {
    setSelectedRequest(request);
    setSessionData({
      date: '',
      time: '',
      duration: '60',
      type: 'video',
      notes: '',
    });
    setShowSessionModal(true);
  };

  const handleScheduleSession = async () => {
    if (!selectedRequest) {
      toast.error('No request selected');
      return;
    }

    if (!sessionData.date || !sessionData.time) {
      toast.error('Please select date and time');
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        navigate('/login');
        return;
      }

      // Combine date and time
      const scheduledAt = new Date(`${sessionData.date}T${sessionData.time}`);

      const payload = {
        requestId: selectedRequest.id,
        scheduledAt: scheduledAt.toISOString(),
        duration: parseInt(sessionData.duration),
        type: sessionData.type,
        notes: sessionData.notes || '',
      };

      console.log('📤 Scheduling session:', JSON.stringify(payload, null, 2));

      const response = await fetch(`${API_URL}/mentorship/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const responseData = await response.json();
      console.log('📥 Session response:', responseData);

      if (response.ok) {
        toast.success('Session scheduled successfully!');
        setShowSessionModal(false);
        setSelectedRequest(null);
        fetchAllData();
      } else {
        toast.error(responseData.message || 'Failed to schedule session');
      }
    } catch (error) {
      console.error('Schedule session error:', error);
      toast.error('Failed to schedule session');
    }
  };

  const handleUpdateSessionStatus = async (sessionId, status) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_URL}/mentorship/sessions/${sessionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        toast.success(`Session ${status}`);
        fetchAllData();
      } else {
        toast.error('Failed to update session');
      }
    } catch (error) {
      console.error('Update session error:', error);
      toast.error('Failed to update session');
    }
  };

  const tabs = [
    { id: 'search', label: 'Find Mentors', icon: Search },
    { id: 'requests', label: 'Requests', icon: UserCheck },
    { id: 'sessions', label: 'Sessions', icon: Calendar },
  ];

  if (!isAuthenticated || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#00B330] mx-auto" />
            <p className="mt-4 text-gray-500">Loading mentorship...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      <div className="flex-1 pb-20 md:pb-0">
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
                  <span className="font-semibold text-[#00B330]">{stats.totalMentors || 0}</span> mentors
                </span>
                <span className="text-gray-300">|</span>
                <span className="text-gray-500">
                  <span className="font-semibold text-[#00B330]">{requests.filter(r => r.status === 'pending').length || 0}</span> pending
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
                setSelectedSkillIds([]);
                setShowRequestModal(true);
              }}
              loading={loading}
            />
          )}

          {activeTab === 'requests' && (
            <RequestsTab 
              requests={requests} 
              onUpdate={handleUpdateRequest}
              onSchedule={openSessionModal}
              userId={userId}
            />
          )}

          {activeTab === 'sessions' && (
            <SessionsTab 
              sessions={sessions} 
              userId={userId}
              onUpdateStatus={handleUpdateSessionStatus}
            />
          )}
        </div>
      </div>

      {/* Request Modal */}
      {showRequestModal && selectedMentor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Request Mentorship</h2>
              <button 
                onClick={() => {
                  setShowRequestModal(false);
                  setSelectedMentor(null);
                  setSelectedSkillIds([]);
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
              </div>
            </div>

            {/* Skills Selection */}
            {selectedMentor.skills && selectedMentor.skills.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Skills You Want to Learn
                </label>
                <div className="flex flex-wrap gap-2">
                  {selectedMentor.skills.map((skill) => {
                    const skillId = skill.skill?.id || skill.id;
                    const skillName = skill.skill?.name || skill.name;
                    const isSelected = selectedSkillIds.includes(skillId);
                    return (
                      <button
                        key={skillId}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedSkillIds(selectedSkillIds.filter(id => id !== skillId));
                          } else {
                            setSelectedSkillIds([...selectedSkillIds, skillId]);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-full text-sm transition ${
                          isSelected
                            ? 'bg-[#00B330] text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {skillName}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {(!selectedMentor.skills || selectedMentor.skills.length === 0) && (
              <div className="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-sm text-yellow-700">
                  This mentor hasn't added any skills yet. You can still send a request.
                </p>
              </div>
            )}

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
              onClick={handleSendRequest}
              className="w-full py-2.5 bg-[#00B330] text-white rounded-lg hover:bg-[#009f2b] transition font-medium"
            >
              Send Request
            </button>
          </div>
        </div>
      )}

      {/* Session Scheduling Modal */}
      {showSessionModal && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Schedule Session</h2>
              <button 
                onClick={() => {
                  setShowSessionModal(false);
                  setSelectedRequest(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-[#00B330]/10 flex items-center justify-center text-[#00B330] font-bold">
                {selectedRequest.mentor?.fullName?.charAt(0) || 'M'}
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {selectedRequest.mentor?.fullName || 'Mentor'}
                </p>
                <p className="text-sm text-gray-500">
                  {selectedRequest.mentee?.fullName || 'Mentee'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  value={sessionData.date}
                  onChange={(e) => setSessionData({...sessionData, date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00B330] focus:border-transparent"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time *
                </label>
                <input
                  type="time"
                  value={sessionData.time}
                  onChange={(e) => setSessionData({...sessionData, time: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00B330] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration
                </label>
                <select
                  value={sessionData.duration}
                  onChange={(e) => setSessionData({...sessionData, duration: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00B330] focus:border-transparent"
                >
                  <option value="30">30 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="90">1.5 hours</option>
                  <option value="120">2 hours</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Session Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['video', 'phone', 'in-person'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setSessionData({...sessionData, type: type})}
                      className={`px-3 py-2 rounded-lg border text-sm capitalize transition ${
                        sessionData.type === type
                          ? 'bg-[#00B330] text-white border-[#00B330]'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {type === 'video' && <VideoIcon className="w-4 h-4 inline mr-1" />}
                      {type === 'phone' && <PhoneCall className="w-4 h-4 inline mr-1" />}
                      {type === 'in-person' && <MapPin className="w-4 h-4 inline mr-1" />}
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  value={sessionData.notes}
                  onChange={(e) => setSessionData({...sessionData, notes: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00B330] focus:border-transparent"
                  rows={2}
                  placeholder="Any additional notes..."
                />
              </div>

              <button
                onClick={handleScheduleSession}
                className="w-full py-2.5 bg-[#00B330] text-white rounded-lg hover:bg-[#009f2b] transition font-medium flex items-center justify-center gap-2"
              >
                <CalendarPlus className="w-5 h-5" />
                Schedule Session
              </button>
            </div>
          </div>
        </div>
      )}
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
          <p className="text-gray-500">No users have been designated as mentors yet.</p>
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
                  {mentor.skills && mentor.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {mentor.skills.slice(0, 3).map((skill) => (
                        <span key={skill.id} className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-full">
                          {skill.skill?.name}
                        </span>
                      ))}
                      {mentor.skills.length > 3 && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">
                          +{mentor.skills.length - 3}
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
function RequestsTab({ requests, onUpdate, onSchedule, userId }) {
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
                  {request.skills && request.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {request.skills.map((skill, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-full">
                          {skill.name || skill}
                        </span>
                      ))}
                    </div>
                  )}
                  {request.message && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{request.message}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(request.requestedAt || request.createdAt).toLocaleDateString()}
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
                    <button
                      onClick={() => onSchedule(request)}
                      className="px-3 py-1 bg-purple-500 text-white text-xs rounded-lg hover:bg-purple-600 flex items-center gap-1"
                    >
                      <CalendarPlus className="w-3 h-3" />
                      Schedule
                    </button>
                  </div>
                )}
                {request.status === 'accepted' && (
                  <button
                    onClick={() => onSchedule(request)}
                    className="px-3 py-1 bg-[#00B330] text-white text-xs rounded-lg hover:bg-[#009f2b] flex items-center gap-1"
                  >
                    <CalendarPlus className="w-3 h-3" />
                    Schedule Session
                  </button>
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
function SessionsTab({ sessions, userId, onUpdateStatus }) {
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
        const canAct = session.status === 'scheduled';

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
                  {session.type && (
                    <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                      {session.type === 'video' && <VideoIcon className="w-3 h-3" />}
                      {session.type === 'phone' && <PhoneCall className="w-3 h-3" />}
                      {session.type === 'in-person' && <MapPin className="w-3 h-3" />}
                      {session.type}
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
                    {session.duration && (
                      <span className="text-xs text-gray-400">{session.duration} min</span>
                    )}
                  </div>
                  {session.notes && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">{session.notes}</p>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusBadge(session.status)}`}>
                  {getStatusIcon(session.status)}
                  {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                </span>
                {canAct && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => onUpdateStatus(session.id, 'completed')}
                      className="px-3 py-1 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600 flex items-center gap-1"
                    >
                      <CheckCircle className="w-3 h-3" />
                      Complete
                    </button>
                    <button
                      onClick={() => onUpdateStatus(session.id, 'cancelled')}
                      className="px-3 py-1 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600 flex items-center gap-1"
                    >
                      <XCircle className="w-3 h-3" />
                      Cancel
                    </button>
                  </div>
                )}
                {session.status === 'scheduled' && (
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      onClick={() => window.open(`https://meet.google.com`, '_blank')}
                      className="text-xs text-[#00B330] hover:underline flex items-center gap-1"
                    >
                      <Video className="w-3 h-3" />
                      Join Meeting
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
