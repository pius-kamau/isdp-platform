import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  MapPin, Mail, Phone, Briefcase, ArrowLeft, User, 
  Edit2, Save, X, Clock, Award, Heart, 
  Plus, Trash2, GraduationCap, Sparkles, Camera,
  FileText, CheckCircle, Upload, Calendar,
  Building2, Star, Users
} from "lucide-react";
import { useDropzone } from 'react-dropzone';
import apiClient from "../services/auth.service";
import Sidebar from "../components/Sidebar";
import BottomNav from "../components/BottomNav";
import toast from 'react-hot-toast';

export default function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  
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

  // Dropzone for certifications
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    maxSize: 5242880,
    onDrop: (acceptedFiles) => {
      setNewQualification({ ...newQualification, file: acceptedFiles[0] });
    }
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(`/users/${id}`);
        const userData = response.data.data;
        setUser(userData);
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
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchUser();
    }
  }, [id]);

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSave = async () => {
    try {
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
      
      const response = await apiClient.put(`/users/${id}`, updateData);
      setUser(response.data.data);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error('Failed to update profile');
    }
  };

  const handleProfilePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      setUser(prev => ({ ...prev, profilePhoto: event.target.result }));
      toast.success('Photo updated! (Save to persist)');
    };
    reader.readAsDataURL(file);
  };

  // Experience CRUD
  const handleAddExperience = async () => {
    if (!newExperience.title || !newExperience.company) {
      toast.error('Please fill in title and company');
      return;
    }
    try {
      const response = await apiClient.post('/profile/experience', newExperience);
      setUser(prev => ({
        ...prev,
        experience: [...(prev.experience || []), response.data.data]
      }));
      setNewExperience({ title: "", company: "", years: "" });
      toast.success('Experience added!');
    } catch (err) {
      toast.error('Failed to add experience');
    }
  };

  const handleDeleteExperience = async (expId) => {
    try {
      await apiClient.delete(`/profile/experience/${expId}`);
      setUser(prev => ({
        ...prev,
        experience: prev.experience.filter(e => e.id !== expId)
      }));
      toast.success('Experience deleted');
    } catch (err) {
      toast.error('Failed to delete experience');
    }
  };

  // Qualification CRUD
  const handleAddQualification = async () => {
    if (!newQualification.name || !newQualification.issuer) {
      toast.error('Please fill in name and issuer');
      return;
    }
    try {
      const data = { ...newQualification };
      delete data.file;
      const response = await apiClient.post('/profile/qualification', data);
      setUser(prev => ({
        ...prev,
        qualifications: [...(prev.qualifications || []), response.data.data]
      }));
      setNewQualification({ name: "", issuer: "", year: "", file: null });
      toast.success('Qualification added!');
    } catch (err) {
      toast.error('Failed to add qualification');
    }
  };

  const handleDeleteQualification = async (qualId) => {
    try {
      await apiClient.delete(`/profile/qualification/${qualId}`);
      setUser(prev => ({
        ...prev,
        qualifications: prev.qualifications.filter(q => q.id !== qualId)
      }));
      toast.success('Qualification deleted');
    } catch (err) {
      toast.error('Failed to delete qualification');
    }
  };

  // Volunteering CRUD
  const handleAddVolunteering = async () => {
    if (!newVolunteering.title || !newVolunteering.organization) {
      toast.error('Please fill in title and organization');
      return;
    }
    try {
      const response = await apiClient.post('/profile/volunteering', newVolunteering);
      setUser(prev => ({
        ...prev,
        volunteering: [...(prev.volunteering || []), response.data.data]
      }));
      setNewVolunteering({ title: "", organization: "", hours: "" });
      toast.success('Volunteering added!');
    } catch (err) {
      toast.error('Failed to add volunteering');
    }
  };

  const handleDeleteVolunteering = async (volId) => {
    try {
      await apiClient.delete(`/profile/volunteering/${volId}`);
      setUser(prev => ({
        ...prev,
        volunteering: prev.volunteering.filter(v => v.id !== volId)
      }));
      toast.success('Volunteering deleted');
    } catch (err) {
      toast.error('Failed to delete volunteering');
    }
  };

  // Availability CRUD
  const handleAddAvailability = async () => {
    if (!newAvailability.day || !newAvailability.start || !newAvailability.end) {
      toast.error('Please fill in all availability fields');
      return;
    }
    try {
      const response = await apiClient.post('/profile/availability', newAvailability);
      setUser(prev => ({
        ...prev,
        availability: [...(prev.availability || []), response.data.data]
      }));
      setNewAvailability({ day: "", start: "", end: "" });
      toast.success('Availability added!');
    } catch (err) {
      toast.error('Failed to add availability');
    }
  };

  const handleDeleteAvailability = async (availId) => {
    try {
      await apiClient.delete(`/profile/availability/${availId}`);
      setUser(prev => ({
        ...prev,
        availability: prev.availability.filter(a => a.id !== availId)
      }));
      toast.success('Availability deleted');
    } catch (err) {
      toast.error('Failed to delete availability');
    }
  };

  // Skills CRUD
  const handleAddSkill = async () => {
    if (!newSkill.trim()) {
      toast.error('Please enter a skill name');
      return;
    }
    try {
      const skillResponse = await apiClient.post("/skills", {
        name: newSkill.trim(),
        category: "General"
      });
      const skillId = skillResponse.data.data.id;
      
      await apiClient.post("/skills/user", {
        skillId: skillId,
        proficiencyLevel: "intermediate",
        yearsExperience: 0,
        isMentor: false,
        isVolunteer: false
      });
      
      const response = await apiClient.get(`/users/${id}`);
      setUser(response.data.data);
      setNewSkill("");
      toast.success('Skill added!');
    } catch (err) {
      toast.error('Failed to add skill');
    }
  };

  const handleRemoveSkill = async (skillId) => {
    try {
      await apiClient.delete(`/skills/user/${skillId}`);
      const response = await apiClient.get(`/users/${id}`);
      setUser(response.data.data);
      toast.success('Skill removed');
    } catch (err) {
      toast.error('Failed to remove skill');
    }
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
            <h1 className="text-lg md:text-xl font-semibold text-gray-900">Profile</h1>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2 px-4 py-2 bg-[#00B330] text-white rounded-lg text-sm hover:bg-[#009f2b] transition-colors"
          >
            {isEditing ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
            {isEditing ? "Cancel" : "Edit Profile"}
          </button>
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
                {isEditing && (
                  <>
                    <label className="absolute bottom-0 right-0 p-1.5 bg-[#00B330] rounded-full text-white cursor-pointer hover:bg-[#009f2b] transition-colors shadow-lg">
                      <Camera className="w-4 h-4" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleProfilePhotoUpload}
                      />
                    </label>
                    <p className="text-[10px] text-gray-400 text-center mt-1">Tap to change</p>
                  </>
                )}
              </div>
              <div className="flex-1 text-center md:text-left">
                {isEditing ? (
                  <input
                    name="fullName"
                    value={editForm.fullName}
                    onChange={handleEditChange}
                    className="text-xl md:text-2xl font-semibold text-gray-900 border-b border-gray-200 focus:border-[#00B330] outline-none w-full max-w-xs"
                  />
                ) : (
                  <h2 className="text-xl md:text-2xl font-semibold text-gray-900">{user.fullName}</h2>
                )}
                {isEditing ? (
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
            {isEditing ? (
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

          {/* Edit Mode - Quick Info */}
          {isEditing && (
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
                  <input
                    name="county"
                    value={editForm.county}
                    onChange={handleEditChange}
                    className="w-full p-2 border border-gray-200 rounded-lg focus:border-[#00B330] outline-none text-sm"
                    placeholder="County"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Sub-County</label>
                  <input
                    name="subCounty"
                    value={editForm.subCounty}
                    onChange={handleEditChange}
                    className="w-full p-2 border border-gray-200 rounded-lg focus:border-[#00B330] outline-none text-sm"
                    placeholder="Sub-County"
                  />
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

          {/* Skills */}
          <div className="bg-white rounded-xl md:rounded-2xl border border-gray-100 p-6 md:p-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#00B330]" /> Skills
                <span className="text-xs text-gray-400 font-normal">({user.skills?.length || 0})</span>
              </h3>
              <div className="flex gap-2">
                <input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
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
            </div>
            <div className="flex flex-wrap gap-2">
              {user.skills?.length > 0 ? (
                user.skills.map((skill) => (
                  <span
                    key={skill.id}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm flex items-center gap-1"
                  >
                    {skill.skill?.name || "Skill"}
                    <button
                      onClick={() => handleRemoveSkill(skill.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))
              ) : (
                <p className="text-sm text-gray-400">No skills added yet</p>
              )}
            </div>
          </div>

          {/* Experience */}
          <div className="bg-white rounded-xl md:rounded-2xl border border-gray-100 p-6 md:p-8">
            <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-4">
              <Briefcase className="w-4 h-4 text-[#00B330]" /> Experience
              <span className="text-xs text-gray-400 font-normal">({user.experience?.length || 0})</span>
            </h3>
            <div className="space-y-3">
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
                      <button
                        onClick={() => handleDeleteExperience(exp.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">No experience added yet</p>
              )}
            </div>
          </div>

          {/* Qualifications */}
          <div className="bg-white rounded-xl md:rounded-2xl border border-gray-100 p-6 md:p-8">
            <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-4">
              <Award className="w-4 h-4 text-[#00B330]" /> Qualifications
              <span className="text-xs text-gray-400 font-normal">({user.qualifications?.length || 0})</span>
            </h3>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <input
                  value={newQualification.name}
                  onChange={(e) => setNewQualification({...newQualification, name: e.target.value})}
                  className="flex-1 min-w-[100px] px-3 py-1 border border-gray-200 rounded-lg text-sm focus:border-[#00B330] outline-none"
                  placeholder="Qualification"
                />
                <input
                  value={newQualification.issuer}
                  onChange={(e) => setNewQualification({...newQualification, issuer: e.target.value})}
                  className="flex-1 min-w-[100px] px-3 py-1 border border-gray-200 rounded-lg text-sm focus:border-[#00B330] outline-none"
                  placeholder="Issuer"
                />
                <input
                  value={newQualification.year}
                  onChange={(e) => setNewQualification({...newQualification, year: e.target.value})}
                  className="w-20 px-3 py-1 border border-gray-200 rounded-lg text-sm focus:border-[#00B330] outline-none"
                  placeholder="Year"
                />
                <button
                  onClick={handleAddQualification}
                  className="px-3 py-1 bg-[#00B330] text-white rounded-lg text-sm hover:bg-[#009f2b]"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              
              <div {...getRootProps()} className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center cursor-pointer hover:border-[#00B330] transition-colors">
                <input {...getInputProps()} />
                <Upload className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                <p className="text-xs text-gray-500">Upload certificate (PDF, PNG, JPG)</p>
              </div>

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
                      </div>
                      <button
                        onClick={() => handleDeleteQualification(qual.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">No qualifications added yet</p>
              )}
            </div>
          </div>

          {/* Volunteering */}
          <div className="bg-white rounded-xl md:rounded-2xl border border-gray-100 p-6 md:p-8">
            <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-4">
              <Heart className="w-4 h-4 text-[#00B330]" /> Volunteering
              <span className="text-xs text-gray-400 font-normal">({user.volunteering?.length || 0})</span>
            </h3>
            <div className="space-y-3">
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
                      <button
                        onClick={() => handleDeleteVolunteering(vol.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">No volunteering added yet</p>
              )}
            </div>
          </div>

          {/* Availability */}
          <div className="bg-white rounded-xl md:rounded-2xl border border-gray-100 p-6 md:p-8">
            <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-[#00B330]" /> Availability
              <span className="text-xs text-gray-400 font-normal">({user.availability?.length || 0})</span>
            </h3>
            <div className="space-y-3">
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
              {user.availability?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {user.availability.map((avail) => (
                    <div key={avail.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-sm">{avail.day}</h4>
                        <p className="text-xs text-gray-500">{avail.start} - {avail.end}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteAvailability(avail.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">No availability set</p>
              )}
            </div>
          </div>

          {/* Save Button */}
          {isEditing && (
            <button
              onClick={handleSave}
              className="w-full py-3.5 bg-[#00B330] text-white rounded-xl font-medium hover:bg-[#009f2b] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#00B330]/20"
            >
              <Save className="w-5 h-5" /> Save All Changes
            </button>
          )}
        </div>
      </div>
      <div className="md:hidden"><BottomNav /></div>
    </div>
  );
}