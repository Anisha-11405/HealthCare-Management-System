import React, { useState, useEffect } from "react";
import api from "../utils/api";

export default function AdminDoctorManagement() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    specialization: "",
    clinicName: "",
    email: "",
    phoneNumber: "",
    address: "",
    bio: "",
    experienceYears: "",
    qualifications: "",
    consultationFee: "",
    password: "",
    status: "ACTIVE"
  });
  const [filters, setFilters] = useState({
    specialization: "",
    status: "",
    clinicName: ""
  });

  useEffect(() => {
    loadDoctors();
  }, [filters]);

  const loadDoctors = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.specialization) params.append("specialization", filters.specialization);
      if (filters.status) params.append("status", filters.status);
      if (filters.clinicName) params.append("clinicName", filters.clinicName);
      
      const response = await api.get(`/api/doctors/profiles?${params.toString()}`);
      setDoctors(response.data || []);
      setError("");
    } catch (err) {
      console.error("Failed to load doctors:", err);
      setError(err.response?.data || "Failed to load doctors");
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

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      specialization: "",
      clinicName: "",
      email: "",
      phoneNumber: "",
      address: "",
      bio: "",
      experienceYears: "",
      qualifications: "",
      consultationFee: "",
      password: "",
      status: "ACTIVE"
    });
    setEditingDoctor(null);
    setShowCreateForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDoctor) {
        // Update existing doctor
        await api.put(`/api/doctors/profile/${editingDoctor.id}`, formData);
        alert("Doctor profile updated successfully!");
      } else {
        // Create new doctor
        await api.post("/api/doctors/profile", formData);
        alert("Doctor profile created successfully!");
      }
      resetForm();
      loadDoctors();
    } catch (err) {
      console.error("Failed to save doctor:", err);
      alert(err.response?.data || "Failed to save doctor profile");
    }
  };

  const handleEdit = (doctor) => {
    setFormData({
      name: doctor.name || "",
      specialization: doctor.specialization || "",
      clinicName: doctor.clinicName || "",
      email: doctor.email || "",
      phoneNumber: doctor.phoneNumber || "",
      address: doctor.address || "",
      bio: doctor.bio || "",
      experienceYears: doctor.experienceYears || "",
      qualifications: doctor.qualifications || "",
      consultationFee: doctor.consultationFee || "",
      password: "", // Don't pre-fill password
      status: doctor.status || "ACTIVE"
    });
    setEditingDoctor(doctor);
    setShowCreateForm(true);
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      ACTIVE: "badge badge-success",
      INACTIVE: "badge badge-secondary",
      PENDING: "badge badge-warning",
      SUSPENDED: "badge badge-danger"
    };
    return statusClasses[status] || "badge";
  };

  if (loading) {
    return (
      <div className="container">
        <div className="header">
          <h1>Doctor Management</h1>
        </div>
        <div className="card">Loading doctors...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <h1>Doctor Management</h1>
        <div className="subtle">Create and manage doctor profiles</div>
      </div>

      {/* Controls */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '15px' }}>
          <button 
            onClick={() => setShowCreateForm(true)} 
            className="btn btn-primary"
          >
            + Create New Doctor
          </button>
          <button onClick={loadDoctors} className="btn">🔄 Refresh</button>
          <div style={{ marginLeft: 'auto' }}>
            Total Doctors: {doctors.length}
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span>Filters:</span>
          <select 
            name="specialization"
            value={filters.specialization} 
            onChange={handleFilterChange}
          >
            <option value="">All Specializations</option>
            <option value="Cardiology">Cardiology</option>
            <option value="Dermatology">Dermatology</option>
            <option value="Neurology">Neurology</option>
            <option value="Pediatrics">Pediatrics</option>
            <option value="General Medicine">General Medicine</option>
          </select>
          <select 
            name="status"
            value={filters.status} 
            onChange={handleFilterChange}
          >
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="PENDING">Pending</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
          <input
            type="text"
            name="clinicName"
            placeholder="Filter by clinic name..."
            value={filters.clinicName}
            onChange={handleFilterChange}
            style={{ padding: '5px' }}
          />
        </div>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <div className="card" style={{ marginBottom: '20px', border: '2px solid #007bff' }}>
          <h3>{editingDoctor ? 'Edit Doctor Profile' : 'Create New Doctor Profile'}</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
              <div>
                <label>Name *</label>
                <input
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
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label>Specialization *</label>
                <select
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Specialization</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Dermatology">Dermatology</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="General Medicine">General Medicine</option>
                </select>
              </div>
              <div>
                <label>Phone Number *</label>
                <input
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
                <label>Clinic Name</label>
                <input
                  type="text"
                  name="clinicName"
                  value={formData.clinicName}
                  onChange={handleInputChange}
                  maxLength="100"
                />
              </div>
              <div>
                <label>Experience (Years)</label>
                <input
                  type="number"
                  name="experienceYears"
                  value={formData.experienceYears}
                  onChange={handleInputChange}
                  min="0"
                  max="50"
                />
              </div>
              <div>
                <label>Consultation Fee</label>
                <input
                  type="number"
                  name="consultationFee"
                  value={formData.consultationFee}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label>Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="PENDING">Pending</option>
                  <option value="SUSPENDED">Suspended</option>
                </select>
              </div>
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label>Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                maxLength="200"
              />
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label>Qualifications</label>
              <input
                type="text"
                name="qualifications"
                value={formData.qualifications}
                onChange={handleInputChange}
                maxLength="300"
                placeholder="e.g., MBBS, MD"
              />
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label>Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                maxLength="500"
                rows="3"
                placeholder="Brief description about the doctor..."
              />
            </div>
            
            {!editingDoctor && (
              <div style={{ marginBottom: '15px' }}>
                <label>Password *</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  minLength="6"
                />
              </div>
            )}
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn btn-primary">
                {editingDoctor ? 'Update Doctor' : 'Create Doctor'}
              </button>
              <button type="button" onClick={resetForm} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="card feedback error" style={{ marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {/* Doctors Table */}
      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Specialization</th>
              <th>Clinic</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Experience</th>
              <th>Fee</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {doctors.map((doctor) => (
              <tr key={doctor.id}>
                <td>{doctor.id}</td>
                <td>
                  <strong>Dr. {doctor.name}</strong>
                  {doctor.qualifications && (
                    <div className="subtle small">{doctor.qualifications}</div>
                  )}
                </td>
                <td>{doctor.specialization}</td>
                <td>{doctor.clinicName || '-'}</td>
                <td>{doctor.email}</td>
                <td>{doctor.phoneNumber}</td>
                <td>{doctor.experienceYears ? `${doctor.experienceYears} years` : '-'}</td>
                <td>{doctor.consultationFee ? `$${doctor.consultationFee}` : '-'}</td>
                <td>
                  <span className={getStatusBadge(doctor.status)}>
                    {doctor.status}
                  </span>
                  {doctor.userId && (
                    <div className="subtle small">User ID: {doctor.userId}</div>
                  )}
                </td>
                <td>
                  <button 
                    onClick={() => handleEdit(doctor)}
                    className="btn btn-sm btn-primary"
                    title="Edit doctor profile"
                  >
                    ✏️ Edit
                  </button>
                </td>
              </tr>
            ))}
            {doctors.length === 0 && (
              <tr>
                <td colSpan="10" style={{ textAlign: 'center', padding: '20px' }} className="subtle">
                  No doctors found matching current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}