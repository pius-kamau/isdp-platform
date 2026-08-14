import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  MapPin, Mail, Phone, Briefcase, ArrowLeft, User, 
  Edit2, Save, X, Clock, Award, Heart, 
  Plus, Trash2, GraduationCap, Sparkles, Camera,
  FileText, Upload, Calendar,
  Star, Users, MessageCircle
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import BottomNav from "../components/BottomNav";
import toast from 'react-hot-toast';
import { COUNTIES, SUB_COUNTIES } from "../data/counties";

const API_URL = 'https://isdp-backend.onrender.com/api';

export default function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  
  console.log('isEditing state:', isEditing);
  
  const [editForm, setEditForm] = useState({
    fullName: "",
    bio: "",
    occupation: "",
    phone: "",
    county: "",
    subCounty: "",
    isMentor: false,
    isVolunteer: false,
  });
  
  const [newSkill, setNewSkill] = useState("");
  const [newExperience, setNewExperience] = useState({ title: "", company: "", years: "" });
  const [newQualification, setNewQualification] = useState({ name: "", issuer: "", year: "", file: null });
  const [newVolunteering, setNewVolunteering] = useState({ title: "", organization: "", hours: "" });
  const [newAvailability, setNewAvailability] = useState({ day: "", start: "", end: "" });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
        
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        const currentUserId = storedUser.id;
        
        const response = await fetch(`${API_URL}/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        const userData = data.data;
        setUser(userData);
        
        setIsOwnProfile(currentUserId === id || currentUserId === userData.id);
        
        setEditForm({
          fullName: userData.fullName || "",
          bio: userData.bio || "",
          occupation: userData.occupation || "",
          phone: userData.phone || "",
          county: userData.county || "",
          subCounty: userData.subCounty || "",
          isMentor: userData.isMentor || false,
          isVolunteer: userData.isVolunteer || false,
        });
      } catch (err) {
        console.error("Error fetching user:", err);
        setError("Failed to load profile");
        if (err.response?.status === 401) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchUser();
    }
  }, [id, navigate]);

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      const updateData = {
        fullName: editForm.fullName,
        bio: editForm.bio,
        occupation: editForm.occupation,
        phone: editForm.phone,
        county: editForm.county,
        subCounty: editForm.subCounty,
        isMentor: editForm.isMentor,
        isVolunteer: editForm.isVolunteer,
      };
      
      const response = await fetch(`${API_URL}/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });
      const data = await response.json();
      setUser(data.data);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
      
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = { ...storedUser, ...updateData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
    } catch (err) {
      console.error('Error saving profile:', err);
      toast.error(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleProfilePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        setUser(prev => ({ ...prev, profilePhoto: event.target.result }));
        
        await fetch(`${API_URL}/users/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ profilePhoto: event.target.result })
        });
        
        toast.success('Profile photo updated!');
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Error uploading photo:', err);
      toast.error('Failed to upload photo');
    }
  };

  const handleAddSkill = async () => {
    if (!newSkill.trim()) {
      toast.error('Please enter a skill name');
      return;
    }

    try {
      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      
      let skillId;
      let skillName = newSkill.trim();
      try {
        const skillResponse = await fetch(`${API_URL}/skills`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ name: skillName, category: "General" })
        });
        const skillData = await skillResponse.json();
        skillId = skillData.data.id;
      } catch (createError) {
        if (createError.response?.data?.message === "Skill already exists") {
          const skillsResponse = await fetch(`${API_URL}/skills`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const skillsData = await skillsResponse.json();
          const existingSkill = skillsData.data.find(
            s => s.name.toLowerCase() === skillName.toLowerCase()
          );
          if (existingSkill) {
            skillId = existingSkill.id;
          } else {
            throw createError;
          }
        } else {
          throw createError;
        }
      }

      const response = await fetch(`${API_URL}/skills/user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          skillId: skillId,
          proficiencyLevel: "intermediate",
          yearsExperience: 0,
          isMentor: false,
          isVolunteer: false
        })
      });
      const data = await response.json();

      const newSkillObj = {
        id: data.data.id,
        skillId: skillId,
        skill: {
          id: skillId,
          name: skillName,
          category: "General"
        },
        proficiencyLevel: "intermediate",
        yearsExperience: 0,
        isMentor: false,
        isVolunteer: false,
        verificationStatus: "pending"
      };

      setUser(prev => ({
        ...prev,
        skills: [...(prev.skills || []), newSkillObj]
      }));
      
      setNewSkill("");
      toast.success('Skill added!');
    } catch (err) {
      console.error('Error adding skill:', err);
      toast.error(err.response?.data?.message || 'Failed to add skill');
    }
  };

  const handleRemoveSkill = async (skillId) => {
    try {
      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      
      await fetch(`${API_URL}/skills/user/${skillId}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setUser(prev => ({
        ...prev,
        skills: prev.skills.filter(s => s.id !== skillId)
      }));
      
      toast.success('Skill removed');
    } catch (err) {
      console.error('Error removing skill:', err);
      toast.error('Failed to remove skill');
    }
  };

  const handleAddExperience = async () => {
    if (!newExperience.title || !newExperience.company) {
      toast.error('Please fill in title and company');
      return;
    }
    try {
      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      
      const response = await fetch(`${API_URL}/profile/experience`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newExperience.title,
          company: newExperience.company,
          years: newExperience.years || '0'
        })
      });
      const data = await response.json();
      
      setUser(prev => ({
        ...prev,
        experience: [...(prev.experience || []), data.data]
      }));
      setNewExperience({ title: "", company: "", years: "" });
      toast.success('Experience added!');
    } catch (err) {
      console.error('Error adding experience:', err);
      toast.error(err.response?.data?.message || 'Failed to add experience');
    }
  };

  const handleDeleteExperience = async (expId) => {
    try {
      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      
      await fetch(`${API_URL}/profile/experience/${expId}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setUser(prev => ({
        ...prev,
        experience: prev.experience.filter(e => e.id !== expId)
      }));
      toast.success('Experience deleted');
    } catch (err) {
      console.error('Error deleting experience:', err);
      toast.error('Failed to delete experience');
    }
  };

  const handleAddQualification = async () => {
    console.log('=== ADD QUALIFICATION ===');
    console.log('newQualification:', newQualification);
    
    if (!newQualification.name || !newQualification.issuer) {
      toast.error('Please fill in name and issuer');
      return;
    }
    
    try {
      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      
      let fileUrl = null;
      
      if (newQualification.file) {
        console.log('Uploading file:', newQualification.file);
        const formData = new FormData();
        formData.append('file', newQualification.file);
        
        const uploadResponse = await fetch(`${API_URL}/profile/upload`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });
        
        const uploadData = await uploadResponse.json();
        console.log('Upload response:', uploadData);
        fileUrl = uploadData.data.fileUrl;
      } else {
        console.log('No file to upload');
      }
      
      const response = await fetch(`${API_URL}/profile/qualification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newQualification.name,
          issuer: newQualification.issuer,
          year: newQualification.year || '',
          fileUrl: fileUrl
        })
      });
      
      const data = await response.json();
      console.log('Qualification response:', data);
      
      setUser(prev => ({
        ...prev,
        qualifications: [...(prev.qualifications || []), data.data]
      }));
      setNewQualification({ name: "", issuer: "", year: "", file: null });
      toast.success('Qualification added successfully!');
    } catch (err) {
      console.error('Error adding qualification:', err);
      console.error('Error response:', err.response);
      toast.error(err.response?.data?.message || 'Failed to add qualification');
    }
  };

  const handleDeleteQualification = async (qualId) => {
    try {
      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      
      await fetch(`${API_URL}/profile/qualification/${qualId}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setUser(prev => ({
        ...prev,
        qualifications: prev.qualifications.filter(q => q.id !== qualId)
      }));
      toast.success('Qualification deleted');
    } catch (err) {
      console.error('Error deleting qualification:', err);
      toast.error('Failed to delete qualification');
    }
  };

  const handleAddVolunteering = async () => {
    if (!newVolunteering.title || !newVolunteering.organization) {
      toast.error('Please fill in title and organization');
      return;
    }
    try {
      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      
      const response = await fetch(`${API_URL}/profile/volunteering`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newVolunteering.title,
          organization: newVolunteering.organization,
          hours: newVolunteering.hours || '0'
        })
      });
      const data = await response.json();
      
      setUser(prev => ({
        ...prev,
        volunteering: [...(prev.volunteering || []), data.data]
      }));
      setNewVolunteering({ title: "", organization: "", hours: "" });
      toast.success('Volunteering added!');
    } catch (err) {
      console.error('Error adding volunteering:', err);
      toast.error(err.response?.data?.message || 'Failed to add volunteering');
    }
  };

  const handleDeleteVolunteering = async (volId) => {
    try {
      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      
      await fetch(`${API_URL}/profile/volunteering/${volId}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setUser(prev => ({
        ...prev,
        volunteering: prev.volunteering.filter(v => v.id !== volId)
      }));
      toast.success('Volunteering deleted');
    } catch (err) {
      console.error('Error deleting volunteering:', err);
      toast.error('Failed to delete volunteering');
    }
  };

  const handleAddAvailability = async () => {
    if (!newAvailability.day || !newAvailability.start || !newAvailability.end) {
      toast.error('Please fill in all availability fields');
      return;
    }
    try {
      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      
      const response = await fetch(`${API_URL}/profile/availability`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          day: newAvailability.day,
          start: newAvailability.start,
          end: newAvailability.end
        })
      });
      const data = await response.json();
      
      setUser(prev => ({
        ...prev,
        availability: [...(prev.availability || []), data.data]
      }));
      setNewAvailability({ day: "", start: "", end: "" });
      toast.success('Availability added!');
    } catch (err) {
      console.error('Error adding availability:', err);
      toast.error(err.response?.data?.message || 'Failed to add availability');
    }
  };

  const handleDeleteAvailability = async (availId) => {
    try {
      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      
      await fetch(`${API_URL}/profile/availability/${availId}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setUser(prev => ({
        ...prev,
        availability: prev.availability.filter(a => a.id !== availId)
      }));
      toast.success('Availability deleted');
    } catch (err) {
      console.error('Error deleting availability:', err);
      toast.error('Failed to delete availability');
    }
  };

  const handleSendMessage = () => {
    navigate(`/messages?userId=${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f8f7] flex flex-col md:flex-row">
        <Sidebar />
        <div className="flex-1 md:ml-64 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[#00B330] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading profile...</p>
          </div>
        </div>
        <div className="md:hidden"><BottomNav /></div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-[#f7f8f7] flex flex-col md:flex-row">
        <Sidebar />
        <div className="flex-1 md:ml-64 flex items-center justify-center px-4">
          <div className="text-center">
            <User className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">{error || "User not found"}</p>
            <button onClick={() => navigate(-1)} className="mt-4 text-[#00B330] hover:underline">
              Go Back
            </button>
          </div>
        </div>
        <div className="md:hidden"><BottomNav /></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f8f7] flex flex-col md:flex-row">
      <Sidebar />
      <div className="flex-1 md:ml-64">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-4 py-3 md:px-6 md:py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-1 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-lg md:text-xl font-semibold text-gray-900">
              {isOwnProfile ? 'My Profile' : `${user.fullName?.split(' ')[0] || 'User'}'s Profile`}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {!isOwnProfile && (
              <button
                onClick={handleSendMessage}
                className="flex items-center gap-2 px-4 py-2 bg-[#00B330] text-white rounded-lg text-sm hover:bg-[#009f2b] transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Message
              </button>
            )}
            {isOwnProfile && (
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-2 px-4 py-2 bg-[#00B330] text-white rounded-lg text-sm hover:bg-[#009f2b] transition-colors"
              >
                {isEditing ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                {isEditing ? "Cancel" : "Edit Profile"}
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 px-4 py-4 md:px-8 md:py-6 max-w-4xl mx-auto w-full space-y-4">
          {/* Profile Header */}
          <div className="bg-gradient-to-br from-white to-[#f7f8f7] rounded-xl md:rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="relative flex-shrink-0">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-[#00B330]/20 to-[#00B330]/5 flex items-center justify-center text-[#00B330] text-3xl md:text-4xl font-bold border-4 border-white shadow-lg overflow-hidden">
                  {user.profilePhoto ? (
                    <img src={user.profilePhoto} alt={user.fullName} className="w-full h-full object-cover" />
                  ) : (
                    user.fullName?.charAt(0) || "U"
                  )}
                </div>
                {isEditing && isOwnProfile && (
                  <label className="absolute bottom-0 right-0 p-1.5 bg-[#00B330] rounded-full text-white cursor-pointer hover:bg-[#009f2b] transition-colors shadow-lg">
                    <Camera className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleProfilePhotoUpload}
                    />
                  </label>
                )}
              </div>
              <div className="flex-1 text-center md:text-left">
                {isEditing && isOwnProfile ? (
                  <input
                    name="fullName"
                    value={editForm.fullName}
                    onChange={handleEditChange}
                    className="text-xl md:text-2xl font-semibold text-gray-900 border-b border-gray-200 focus:border-[#00B330] outline-none w-full max-w-xs"
                  />
                ) : (
                  <h2 className="text-xl md:text-2xl font-semibold text-gray-900">{user.fullName}</h2>
                )}
                {isEditing && isOwnProfile ? (
                  <input
                    name="occupation"
                    value={editForm.occupation}
                    onChange={handleEditChange}
                    className="text-gray-500 border-b border-gray-200 focus:border-[#00B330] outline-none w-full max-w-xs mt-1"
                    placeholder="Your occupation"
                  />
                ) : (
                  <p className="text-gray-500">{user.occupation || "Community Member"}</p>
                )}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-2">
                  {user.county && (
                    <span className="text-sm text-gray-400 flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded-full">
                      <MapPin className="w-3 h-3" /> {user.county}
                    </span>
                  )}
                  {user.isMentor && (
                    <span className="px-2 py-0.5 bg-[#00B330]/10 text-[#00B330] text-xs font-medium rounded-full flex items-center gap-1">
                      <GraduationCap className="w-3 h-3" /> Mentor
                    </span>
                  )}
                  {user.isVolunteer && (
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs font-medium rounded-full flex items-center gap-1">
                      <Heart className="w-3 h-3" /> Volunteer
                    </span>
                  )}
                  <span className="text-xs text-gray-400 flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded-full">
                    <Users className="w-3 h-3" /> Member since {new Date(user.createdAt).getFullYear()}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-gray-50 px-3 py-1.5 rounded-full">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium text-gray-900">4.8</span>
                <span className="text-xs text-gray-400">(24 reviews)</span>
              </div>
            </div>
            {isEditing && isOwnProfile ? (
              <textarea
                name="bio"
                value={editForm.bio}
                onChange={handleEditChange}
                rows={3}
                className="w-full mt-4 p-3 border border-gray-200 rounded-lg focus:border-[#00B330] outline-none text-sm"
                placeholder="Tell us about yourself..."
              />
            ) : user.bio ? (
              <p className="mt-4 text-sm text-gray-600 leading-relaxed">{user.bio}</p>
            ) : null}
          </div>

          {/* Edit Mode - Quick Info (only for own profile) */}
          {isEditing && isOwnProfile && (
            <div className="bg-white rounded-xl md:rounded-2xl border border-gray-100 p-6 md:p-8 space-y-4">
              <h3 className="text-sm font-medium text-gray-900">Quick Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Phone</label>
                  <input
                    name="phone"
                    value={editForm.phone}
                    onChange={handleEditChange}
                    className="w-full p-2 border border-gray-200 rounded-lg focus:border-[#00B330] outline-none text-sm"
                    placeholder="Phone number"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">County</label>
                  <select
                    name="county"
                    value={editForm.county}
                    onChange={handleEditChange}
                    className="w-full p-2 border border-gray-200 rounded-lg focus:border-[#00B330] outline-none text-sm bg-white"
                  >
                    <option value="">Select your county</option>
                    {COUNTIES.map((county) => (
                      <option key={county} value={county}>{county}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Sub-County</label>
                  <select
                    name="subCounty"
                    value={editForm.subCounty}
                    onChange={handleEditChange}
                    className="w-full p-2 border border-gray-200 rounded-lg focus:border-[#00B330] outline-none text-sm bg-white"
                    disabled={!editForm.county}
                  >
                    <option value="">
                      {editForm.county ? 'Select your sub-county' : 'Select county first'}
                    </option>
                    {(SUB_COUNTIES[editForm.county] || []).map((subCounty) => (
                      <option key={subCounty} value={subCounty}>{subCounty}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isMentor"
                    checked={editForm.isMentor}
                    onChange={handleEditChange}
                    className="w-4 h-4 text-[#00B330] focus:ring-[#00B330] rounded"
                  />
                  Available as Mentor
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isVolunteer"
                    checked={editForm.isVolunteer}
                    onChange={handleEditChange}
                    className="w-4 h-4 text-[#00B330] focus:ring-[#00B330] rounded"
                  />
                  Available to Volunteer
                </label>
              </div>
            </div>
          )}

          {/* Skills - Only show add button for own profile */}
          <div className="bg-white rounded-xl md:rounded-2xl border border-gray-100 p-6 md:p-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#00B330]" /> Skills
                <span className="text-xs text-gray-400 font-normal">({user.skills?.length || 0})</span>
              </h3>
              {isOwnProfile && (
                <div className="flex gap-2">
                  <input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddSkill()}
                    className="px-3 py-1 border border-gray-200 rounded-lg text-sm focus:border-[#00B330] outline-none"
                    placeholder="Add skill..."
                  />
                  <button
                    onClick={handleAddSkill}
                    className="px-3 py-1 bg-[#00B330] text-white rounded-lg text-sm hover:bg-[#009f2b]"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {user.skills?.length > 0 ? (
                user.skills.map((skill) => (
                  <span
                    key={skill.id}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm flex items-center gap-1"
                  >
                    {skill.skill?.name || "Skill"}
                    {isOwnProfile && (
                      <button
                        onClick={() => handleRemoveSkill(skill.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </span>
                ))
              ) : (
                <p className="text-sm text-gray-400">No skills added yet</p>
              )}
            </div>
          </div>

          {/* Experience - Only show add/delete for own profile */}
          <div className="bg-white rounded-xl md:rounded-2xl border border-gray-100 p-6 md:p-8">
            <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-4">
              <Briefcase className="w-4 h-4 text-[#00B330]" /> Experience
              <span className="text-xs text-gray-400 font-normal">({user.experience?.length || 0})</span>
            </h3>
            <div className="space-y-3">
              {isOwnProfile && (
                <div className="flex flex-wrap gap-2">
                  <input
                    value={newExperience.title}
                    onChange={(e) => setNewExperience({...newExperience, title: e.target.value})}
                    className="flex-1 min-w-[100px] px-3 py-1 border border-gray-200 rounded-lg text-sm focus:border-[#00B330] outline-none"
                    placeholder="Title"
                  />
                  <input
                    value={newExperience.company}
                    onChange={(e) => setNewExperience({...newExperience, company: e.target.value})}
                    className="flex-1 min-w-[100px] px-3 py-1 border border-gray-200 rounded-lg text-sm focus:border-[#00B330] outline-none"
                    placeholder="Company"
                  />
                  <input
                    value={newExperience.years}
                    onChange={(e) => setNewExperience({...newExperience, years: e.target.value})}
                    className="w-20 px-3 py-1 border border-gray-200 rounded-lg text-sm focus:border-[#00B330] outline-none"
                    placeholder="Years"
                  />
                  <button
                    onClick={handleAddExperience}
                    className="px-3 py-1 bg-[#00B330] text-white rounded-lg text-sm hover:bg-[#009f2b]"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              )}
              {user.experience?.length > 0 ? (
                <div className="space-y-3">
                  {user.experience.map((exp) => (
                    <div key={exp.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-[#00B330]/10 flex items-center justify-center flex-shrink-0">
                        <Briefcase className="w-4 h-4 text-[#00B330]" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{exp.title}</h4>
                        <p className="text-sm text-gray-600">{exp.company}</p>
                        <p className="text-xs text-gray-400">{exp.years} years</p>
                      </div>
                      {isOwnProfile && (
                        <button
                          onClick={() => handleDeleteExperience(exp.id)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">No experience added yet</p>
              )}
            </div>
          </div>

          {/* Qualifications - Only show add/delete for own profile */}
          <div className="bg-white rounded-xl md:rounded-2xl border border-gray-100 p-6 md:p-8">
            <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-4">
              <Award className="w-4 h-4 text-[#00B330]" /> Qualifications
              <span className="text-xs text-gray-400 font-normal">({user.qualifications?.length || 0})</span>
            </h3>
            <div className="space-y-4">
              {isOwnProfile && (
                <>
                  <div className="flex flex-wrap gap-2">
                    <input
                      value={newQualification.name}
                      onChange={(e) => setNewQualification({...newQualification, name: e.target.value})}
                      className="flex-1 min-w-[100px] px-3 py-1 border border-gray-200 rounded-lg text-sm focus:border-[#00B330] outline-none"
                      placeholder="Qualification *"
                    />
                    <input
                      value={newQualification.issuer}
                      onChange={(e) => setNewQualification({...newQualification, issuer: e.target.value})}
                      className="flex-1 min-w-[100px] px-3 py-1 border border-gray-200 rounded-lg text-sm focus:border-[#00B330] outline-none"
                      placeholder="Issuer *"
                    />
                    <input
                      value={newQualification.year}
                      onChange={(e) => setNewQualification({...newQualification, year: e.target.value})}
                      className="w-20 px-3 py-1 border border-gray-200 rounded-lg text-sm focus:border-[#00B330] outline-none"
                      placeholder="Year"
                    />
                    <button
                      onClick={() => {
                        console.log('Add qualification button clicked');
                        handleAddQualification();
                      }}
                      className="px-3 py-1 bg-[#00B330] text-white rounded-lg text-sm hover:bg-[#009f2b]"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* File Upload with Drag and Drop */}
                  <div 
                    className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                      newQualification.file ? 'border-[#00B330] bg-[#00B330]/5' : 'border-gray-300 hover:border-[#00B330]'
                    }`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      e.currentTarget.classList.add('border-[#00B330]', 'bg-[#00B330]/5');
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      e.currentTarget.classList.remove('border-[#00B330]', 'bg-[#00B330]/5');
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      e.currentTarget.classList.remove('border-[#00B330]', 'bg-[#00B330]/5');
                      const files = e.dataTransfer.files;
                      if (files && files.length > 0) {
                        const file = files[0];
                        console.log('File dropped:', file);
                        setNewQualification({...newQualification, file: file});
                        toast.success(`File selected: ${file.name}`);
                      }
                    }}
                  >
                    <input
                      type="file"
                      id="certificate-upload"
                      accept=".pdf,.png,.jpg,.jpeg"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const file = e.target.files[0];
                          console.log('File selected via input:', file);
                          setNewQualification({...newQualification, file: file});
                          toast.success(`File selected: ${file.name}`);
                        }
                      }}
                    />
                    <label
                      htmlFor="certificate-upload"
                      className="cursor-pointer block"
                    >
                      <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Drag and drop or click to upload certificate</p>
                      <p className="text-xs text-gray-400">PDF, PNG, JPG (Max 5MB)</p>
                      {newQualification.file && (
                        <p className="mt-2 text-sm text-[#00B330]">✅ {newQualification.file.name}</p>
                      )}
                    </label>
                  </div>
                </>
              )}

              {user.qualifications?.length > 0 ? (
                <div className="space-y-3">
                  {user.qualifications.map((qual) => (
                    <div key={qual.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-4 h-4 text-blue-500" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{qual.name}</h4>
                        <p className="text-sm text-gray-600">{qual.issuer}</p>
                        <p className="text-xs text-gray-400">{qual.year}</p>
                        {qual.fileUrl && (
                          <a 
                            href={`https://isdp-backend.onrender.com${qual.fileUrl}`}
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-xs text-[#00B330] hover:underline flex items-center gap-1 mt-1"
                          >
                            <FileText className="w-3 h-3" /> View Certificate
                          </a>
                        )}
                      </div>
                      {isOwnProfile && (
                        <button
                          onClick={() => handleDeleteQualification(qual.id)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">No qualifications added yet</p>
              )}
            </div>
          </div>

          {/* Volunteering - Only show add/delete for own profile */}
          <div className="bg-white rounded-xl md:rounded-2xl border border-gray-100 p-6 md:p-8">
            <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-4">
              <Heart className="w-4 h-4 text-[#00B330]" /> Volunteering
              <span className="text-xs text-gray-400 font-normal">({user.volunteering?.length || 0})</span>
            </h3>
            <div className="space-y-3">
              {isOwnProfile && (
                <div className="flex flex-wrap gap-2">
                  <input
                    value={newVolunteering.title}
                    onChange={(e) => setNewVolunteering({...newVolunteering, title: e.target.value})}
                    className="flex-1 min-w-[100px] px-3 py-1 border border-gray-200 rounded-lg text-sm focus:border-[#00B330] outline-none"
                    placeholder="Opportunity"
                  />
                  <input
                    value={newVolunteering.organization}
                    onChange={(e) => setNewVolunteering({...newVolunteering, organization: e.target.value})}
                    className="flex-1 min-w-[100px] px-3 py-1 border border-gray-200 rounded-lg text-sm focus:border-[#00B330] outline-none"
                    placeholder="Organization"
                  />
                  <input
                    value={newVolunteering.hours}
                    onChange={(e) => setNewVolunteering({...newVolunteering, hours: e.target.value})}
                    className="w-20 px-3 py-1 border border-gray-200 rounded-lg text-sm focus:border-[#00B330] outline-none"
                    placeholder="Hours"
                  />
                  <button
                    onClick={handleAddVolunteering}
                    className="px-3 py-1 bg-[#00B330] text-white rounded-lg text-sm hover:bg-[#009f2b]"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              )}
              {user.volunteering?.length > 0 ? (
                <div className="space-y-3">
                  {user.volunteering.map((vol) => (
                    <div key={vol.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center flex-shrink-0">
                        <Heart className="w-4 h-4 text-pink-500" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{vol.title}</h4>
                        <p className="text-sm text-gray-600">{vol.organization}</p>
                        <p className="text-xs text-gray-400">{vol.hours} hours</p>
                      </div>
                      {isOwnProfile && (
                        <button
                          onClick={() => handleDeleteVolunteering(vol.id)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">No volunteering added yet</p>
              )}
            </div>
          </div>

          {/* Availability - Only show add/delete for own profile */}
          <div className="bg-white rounded-xl md:rounded-2xl border border-gray-100 p-6 md:p-8">
            <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-[#00B330]" /> Availability
              <span className="text-xs text-gray-400 font-normal">({user.availability?.length || 0})</span>
            </h3>
            <div className="space-y-3">
              {isOwnProfile && (
                <div className="flex flex-wrap gap-2">
                  <select
                    value={newAvailability.day}
                    onChange={(e) => setNewAvailability({...newAvailability, day: e.target.value})}
                    className="px-3 py-1 border border-gray-200 rounded-lg text-sm focus:border-[#00B330] outline-none"
                  >
                    <option value="">Day</option>
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                    <option value="Saturday">Saturday</option>
                    <option value="Sunday">Sunday</option>
                  </select>
                  <input
                    value={newAvailability.start}
                    onChange={(e) => setNewAvailability({...newAvailability, start: e.target.value})}
                    className="w-20 px-3 py-1 border border-gray-200 rounded-lg text-sm focus:border-[#00B330] outline-none"
                    placeholder="Start"
                  />
                  <input
                    value={newAvailability.end}
                    onChange={(e) => setNewAvailability({...newAvailability, end: e.target.value})}
                    className="w-20 px-3 py-1 border border-gray-200 rounded-lg text-sm focus:border-[#00B330] outline-none"
                    placeholder="End"
                  />
                  <button
                    onClick={handleAddAvailability}
                    className="px-3 py-1 bg-[#00B330] text-white rounded-lg text-sm hover:bg-[#009f2b]"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              )}
              {user.availability?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {user.availability.map((avail) => (
                    <div key={avail.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-sm">{avail.day}</h4>
                        <p className="text-xs text-gray-500">{avail.start} - {avail.end}</p>
                      </div>
                      {isOwnProfile && (
                        <button
                          onClick={() => handleDeleteAvailability(avail.id)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">No availability set</p>
              )}
            </div>
          </div>

          {/* Save Button - Only for own profile */}
          {isEditing && isOwnProfile && (
            <div className="sticky bottom-0 pb-4 pt-2 bg-[#f7f8f7] z-10">
              <button
                onClick={handleSave}
                className="w-full py-3.5 bg-[#00B330] text-white rounded-xl font-medium hover:bg-[#009f2b] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#00B330]/20"
              >
                <Save className="w-5 h-5" /> Save All Changes
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="md:hidden"><BottomNav /></div>
    </div>
  );
}
