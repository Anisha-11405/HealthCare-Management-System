import React, { useState, useEffect } from "react";
import { useUser } from "../App";
import api from "../utils/api";

export default function DoctorProfileManagement() {
  const { user } = useUser();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    clinicName: "",
    phoneNumber: "",
    address: "",
    bio: "",
    experienceYears: "",
    qualifications: "",
    consultationFee: ""
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/doctors/my-profile");
      setProfile(response.data);
      setFormData({
        name: response.data.name || "",
        clinicName: response.data.clinicName || "",
        phoneNumber: response.data.phoneNumber || "",
        address: response.data.address || "",
        bio: response.data.bio || "",
        experienceYears: response.data.experienceYears || "",
        qualifications: response.data.qualifications || "",
        consultationFee: response.data.consultationFee || ""
      });
      setError("");
    } catch (err) {
      console.error("Failed to load profile:", err);
      setError(err.response?.data || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError("");
      setSuccess("");
      
      await api.put("/api/doctors/my-profile", formData);
      
      setSuccess("Profile updated successfully!");
      setIsEditing(false);
      loadProfile(); // Refresh the profile data
    } catch (err) {
      console.error("Failed to update profile:", err);
      setError(err.response?.data || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: profile.name || "",
      clinicName: profile.clinicName || "",
      phoneNumber: profile.phoneNumber || "",
      address: profile.address || "",
      bio: profile.bio || "",
      experienceYears: profile.experienceYears || "",
      qualifications: profile.qualifications || "",
      consultationFee: profile.consultationFee || ""
    });
    setIsEditing(false);
    setError("");
    setSuccess("");
  };

  if (loading) {
    return (
      <div className="container">
        <div className="header">
          <h1>My Profile</h1>
        </div>
        <div className="card">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container">
        <div className="header">
          <h1>My Profile</h1>
        </div>
        <div className="card feedback error">
          Profile not found. Please contact administrator.
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <h1>My Profile</h1>
        <div className="subtle">View and manage your doctor profile information</div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="card feedback success" style={{ marginBottom: '20px' }}>
          {success}
        </div>
      )}
      
      {error && (
        <div className="card feedback error" style={{ marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {/* Profile Information Card */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: '0' }}>Profile Information</h2>
          <div>
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)} 
                className="btn btn-primary"
              >
                ✏️ Edit Profile
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  type="submit" 
                  form="profile-form"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : '💾 Save Changes'}
                </button>
                <button 
                  onClick={handleCancel} 
                  className="btn btn-secondary"
                  disabled={saving}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Profile Display/Edit Form */}
        {isEditing ? (
          <form id="profile-form" onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label style={labelStyle}><strong>Name *</strong></label>
                <input
                  style={inputStyle}
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  minLength="3"
                  maxLength="50"
                />
              </div>
              <div>
                <label style={labelStyle}><strong>Phone Number *</strong></label>
                <input
                  style={inputStyle}
                  type="text"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  pattern="[0-9]{10}"
                  title="10 digit phone number"
                  required
                />
              </div>
              <div>
                <label style={labelStyle}><strong>Clinic Name</strong></label>
                <input
                  style={inputStyle}
                  type="text"
                  name="clinicName"
                  value={formData.clinicName}
                  onChange={handleInputChange}
                  maxLength="100"
                />
              </div>
              <div>
                <label style={labelStyle}><strong>Experience (Years)</strong></label>
                <input
                  style={inputStyle}
                  type="number"
                  name="experienceYears"
                  value={formData.experienceYears}
                  onChange={handleInputChange}
                  min="0"
                  max="50"
                />
              </div>
              <div>
                <label style={labelStyle}><strong>Consultation Fee</strong></label>
                <input
                  style={inputStyle}
                  type="number"
                  name="consultationFee"
                  value={formData.consultationFee}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  placeholder="Enter fee amount"
                />
              </div>
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={labelStyle}><strong>Address</strong></label>
              <input
                style={inputStyle}
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                maxLength="200"
                placeholder="Your clinic/practice address"
              />
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={labelStyle}><strong>Qualifications</strong></label>
              <input
                style={inputStyle}
                type="text"
                name="qualifications"
                value={formData.qualifications}
                onChange={handleInputChange}
                maxLength="300"
                placeholder="e.g., MBBS, MD, Specialization certificates"
              />
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={labelStyle}><strong>Bio</strong></label>
              <textarea
                style={{...inputStyle, resize: 'vertical'}}
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                maxLength="500"
                rows="4"
                placeholder="Tell patients about yourself, your expertise, and approach to healthcare..."
              />
              <div className="subtle" style={{ fontSize: '0.8em', marginTop: '5px' }}>
                {formData.bio.length}/500 characters
              </div>
            </div>
          </form>
        ) : (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label style={labelStyle}><strong>Name</strong></label>
                <div style={profileValueStyle}>Dr. {profile.name}</div>
              </div>
              <div>
                <label style={labelStyle}><strong>Email</strong></label>
                <div style={profileValueStyle}>{profile.email}</div>
                <div className="subtle small">Cannot be changed</div>
              </div>
              <div>
                <label style={labelStyle}><strong>Specialization</strong></label>
                <div style={profileValueStyle}>{profile.specialization}</div>
                <div className="subtle small">Cannot be changed</div>
              </div>
              <div>
                <label style={labelStyle}><strong>Phone Number</strong></label>
                <div style={profileValueStyle}>{profile.phoneNumber || 'Not provided'}</div>
              </div>
              <div>
                <label style={labelStyle}><strong>Clinic Name</strong></label>
                <div style={profileValueStyle}>{profile.clinicName || 'Not provided'}</div>
              </div>
              <div>
                <label style={labelStyle}><strong>Experience</strong></label>
                <div style={profileValueStyle}>
                  {profile.experienceYears ? `${profile.experienceYears} years` : 'Not specified'}
                </div>
              </div>
              <div>
                <label style={labelStyle}><strong>Consultation Fee</strong></label>
                <div style={profileValueStyle}>
                  {profile.consultationFee ? `$${profile.consultationFee}` : 'Not specified'}
                </div>
              </div>
              <div>
                <label style={labelStyle}><strong>Profile Status</strong></label>
                <div style={profileValueStyle}>
                  <span className={`badge ${
                    profile.status === 'ACTIVE' ? 'badge-success' : 
                    profile.status === 'PENDING' ? 'badge-warning' : 
                    'badge-secondary'
                  }`}>
                    {profile.status}
                  </span>
                </div>
              </div>
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={labelStyle}><strong>Address</strong></label>
              <div style={profileValueStyle}>{profile.address || 'Not provided'}</div>
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={labelStyle}><strong>Qualifications</strong></label>
              <div style={profileValueStyle}>{profile.qualifications || 'Not provided'}</div>
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={labelStyle}><strong>Bio</strong></label>
              <div style={{ 
                ...profileValueStyle,
                whiteSpace: 'pre-wrap',
                backgroundColor: '#f8f9fa',
                padding: '10px',
                borderRadius: '5px',
                minHeight: '60px'
              }}>
                {profile.bio || 'No bio provided yet. Click "Edit Profile" to add information about yourself.'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Profile Statistics Card */}
      <div className="card">
        <h3 style={{ marginBottom: '15px' }}>Profile Statistics</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div style={{ 
            padding: '15px', 
            backgroundColor: '#e8f4f8', 
            borderRadius: '8px', 
            textAlign: 'center' 
          }}>
            <div style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#007bff' }}>
              {profile.appointments?.length || 0}
            </div>
            <div className="subtle">Total Appointments</div>
          </div>
          <div style={{ 
            padding: '15px', 
            backgroundColor: '#e8f8e8', 
            borderRadius: '8px', 
            textAlign: 'center' 
          }}>
            <div style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#28a745' }}>
              {profile.experienceYears || 0}
            </div>
            <div className="subtle">Years of Experience</div>
          </div>
          <div style={{ 
            padding: '15px', 
            backgroundColor: '#fff3cd', 
            borderRadius: '8px', 
            textAlign: 'center' 
          }}>
            <div style={{ fontSize: '1.2em', fontWeight: 'bold', color: '#856404' }}>
              {profile.status}
            </div>
            <div className="subtle">Profile Status</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Inline styles to replace styled-jsx
const profileValueStyle = {
  padding: '8px 0',
  fontSize: '1.1em',
  borderBottom: '1px solid #eee',
  minHeight: '24px'
};

const labelStyle = {
  display: 'block',
  fontWeight: 'bold',
  marginBottom: '5px',
  color: '#333'
};

const inputStyle = {
  width: '100%',
  padding: '8px 12px',
  border: '1px solid #ddd',
  borderRadius: '4px',
  fontSize: '1em'
};