
import React, { useState, useEffect } from "react";
import api from "../utils/api"; // Import your existing API utility
import { useUser } from "../App"; // Import your existing useUser hook

export default function DoctorSearch() {
  const { user } = useUser();
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [specializationFilter, setSpecializationFilter] = useState("");
  const [clinicFilter, setClinicFilter] = useState("");
  const [availableSpecializations, setAvailableSpecializations] = useState([]);
  const [availableClinics, setAvailableClinics] = useState([]);

  useEffect(() => {
    loadDoctors();
    loadSpecializations();
  }, []);

  useEffect(() => {
    filterDoctors();
  }, [doctors, searchTerm, specializationFilter, clinicFilter]);

  const loadDoctors = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/doctors");
      const activeDoctors = response.data.filter(doctor => 
        doctor.status === 'ACTIVE' || !doctor.status
      );
      setDoctors(activeDoctors);
      
      // Extract unique clinic names for filter dropdown
      const clinics = [...new Set(
        activeDoctors
          .filter(doctor => doctor.clinicName)
          .map(doctor => doctor.clinicName)
      )].sort();
      setAvailableClinics(clinics);
      
      // Extract unique specializations from doctors data
      const specializations = [...new Set(
        activeDoctors
          .filter(doctor => doctor.specialization)
          .map(doctor => doctor.specialization)
      )].sort();
      setAvailableSpecializations(specializations);
      
      setError("");
    } catch (err) {
      console.error("Failed to load doctors:", err);
      setError(err.response?.data?.error || "Failed to load doctors. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadSpecializations = async () => {
    // Specializations are now loaded directly from doctors data in loadDoctors()
    // This function is kept for compatibility but can be removed if not needed elsewhere
  };

  const filterDoctors = () => {
    let filtered = doctors;

    // Search by name
    if (searchTerm.trim()) {
      filtered = filtered.filter(doctor =>
        doctor.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by specialization
    if (specializationFilter) {
      filtered = filtered.filter(doctor =>
        doctor.specialization === specializationFilter
      );
    }

    // Filter by clinic
    if (clinicFilter) {
      filtered = filtered.filter(doctor =>
        doctor.clinicName === clinicFilter
      );
    }

    setFilteredDoctors(filtered);
  };

  const bookAppointment = (doctorId) => {
    if (user?.role === 'PATIENT') {
      // Navigate to booking page with doctor pre-selected
      // You can pass the doctorId as state or URL parameter
      window.location.href = `/book?doctorId=${doctorId}`;
      // Or if using React Router: navigate(`/book?doctorId=${doctorId}`);
    } else if (user?.role === 'ADMIN') {
      // Admin can book for any patient
      window.location.href = `/book?doctorId=${doctorId}`;
    } else {
      alert("Please log in as a patient to book appointments");
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSpecializationFilter("");
    setClinicFilter("");
  };

  const getDoctorCardStyle = (doctor) => ({
    border: '1px solid #e0e0e0',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '20px',
    backgroundColor: '#fff',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'pointer'
  });

  if (loading) {
    return (
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ fontSize: '2.5em', marginBottom: '10px', color: '#2c3e50' }}>Find Doctors</h1>
          <div style={{ color: '#7f8c8d' }}>Search and book appointments with healthcare professionals</div>
        </div>
        <div style={{ 
          border: '1px solid #e0e0e0', 
          borderRadius: '8px', 
          padding: '20px', 
          backgroundColor: '#fff' 
        }}>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div>🔍 Loading doctors...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '30px' }}>
          <h1>Find Doctors</h1>
        </div>
        <div style={{ 
          border: '1px solid #e74c3c', 
          borderRadius: '8px', 
          padding: '20px', 
          backgroundColor: '#fdf2f2',
          color: '#c0392b'
        }}>
          {error}
          <button 
            onClick={loadDoctors} 
            style={{ 
              marginLeft: '10px',
              padding: '5px 10px',
              backgroundColor: '#e74c3c',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2.5em', marginBottom: '10px', color: '#2c3e50' }}>Find Doctors</h1>
        <div style={{ color: '#7f8c8d' }}>Search by name, specialization, or clinic to find the right healthcare professional</div>
      </div>

      {/* Search and Filter Section */}
      <div style={{ 
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '30px',
        backgroundColor: '#f8f9fa'
      }}>
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '1.2em' }}>Search & Filter</h3>
          
          {/* Search by name */}
          <div style={{ marginBottom: '15px' }}>
            <input
              type="text"
              placeholder="🔍 Search doctors by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 15px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Filter dropdowns */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Specialization</label>
              <select
                value={specializationFilter}
                onChange={(e) => setSpecializationFilter(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  border: '1px solid #ddd', 
                  borderRadius: '6px',
                  boxSizing: 'border-box'
                }}
              >
                <option value="">All Specializations</option>
                {availableSpecializations.map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Clinic</label>
              <select
                value={clinicFilter}
                onChange={(e) => setClinicFilter(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  border: '1px solid #ddd', 
                  borderRadius: '6px',
                  boxSizing: 'border-box'
                }}
              >
                <option value="">All Clinics</option>
                {availableClinics.map(clinic => (
                  <option key={clinic} value={clinic}>{clinic}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'end', gap: '10px' }}>
              <button 
                onClick={clearFilters}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Clear Filters
              </button>
              <button 
                onClick={loadDoctors}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                🔄 Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Results summary */}
        <div style={{ 
          padding: '10px 15px', 
          backgroundColor: '#e9ecef', 
          borderRadius: '6px',
          fontSize: '0.9em'
        }}>
          <strong>{filteredDoctors.length}</strong> doctors found
          {searchTerm && ` matching "${searchTerm}"`}
          {specializationFilter && ` in ${specializationFilter}`}
          {clinicFilter && ` at ${clinicFilter}`}
        </div>
      </div>

      {/* No doctors found */}
      {filteredDoctors.length === 0 && (
        <div style={{ 
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          padding: '20px',
          backgroundColor: '#fff'
        }}>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '3em', marginBottom: '15px' }}>🔍</div>
            <h3>No doctors found</h3>
            <p style={{ color: '#7f8c8d' }}>
              {searchTerm || specializationFilter || clinicFilter 
                ? "Try adjusting your search criteria or clear filters to see all doctors."
                : "No doctors are currently available in the system."}
            </p>
            {(searchTerm || specializationFilter || clinicFilter) && (
              <button 
                onClick={clearFilters} 
                style={{
                  marginTop: '15px',
                  padding: '10px 20px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Clear All Filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Doctors Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
        {filteredDoctors.map((doctor) => (
          <div 
            key={doctor.id}
            style={getDoctorCardStyle(doctor)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
            }}
          >
            {/* Doctor Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
              <div>
                <h3 style={{ margin: '0 0 5px 0', color: '#2c3e50' }}>
                  Dr. {doctor.name}
                </h3>
                <div style={{ color: '#3498db', fontWeight: 'bold', marginBottom: '5px' }}>
                  {doctor.specialization}
                </div>
                {doctor.qualifications && (
                  <div style={{ color: '#7f8c8d', fontSize: '0.9em' }}>{doctor.qualifications}</div>
                )}
              </div>
              <div style={{ textAlign: 'right' }}>
                {doctor.consultationFee && (
                  <div style={{ fontSize: '1.2em', fontWeight: 'bold', color: '#27ae60' }}>
                    ${doctor.consultationFee}
                  </div>
                )}
                {doctor.experienceYears && (
                  <div style={{ color: '#7f8c8d', fontSize: '0.9em' }}>
                    {doctor.experienceYears} years exp.
                  </div>
                )}
              </div>
            </div>

            {/* Doctor Details */}
            <div style={{ marginBottom: '15px' }}>
              {doctor.clinicName && (
                <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🏥</span>
                  <span><strong>{doctor.clinicName}</strong></span>
                </div>
              )}
              
              {doctor.address && (
                <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>📍</span>
                  <span style={{ color: '#7f8c8d' }}>{doctor.address}</span>
                </div>
              )}
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span>📧</span>
                <span style={{ color: '#7f8c8d' }}>{doctor.email}</span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📞</span>
                <span style={{ color: '#7f8c8d' }}>{doctor.phoneNumber}</span>
              </div>
            </div>

            {/* Doctor Bio */}
            {doctor.bio && (
              <div style={{ 
                marginBottom: '15px', 
                padding: '10px', 
                backgroundColor: '#f8f9fa', 
                borderRadius: '6px',
                borderLeft: '3px solid #3498db'
              }}>
                <div style={{ color: '#7f8c8d', fontSize: '0.9em', lineHeight: '1.4' }}>
                  {doctor.bio.length > 150 
                    ? doctor.bio.substring(0, 150) + '...' 
                    : doctor.bio}
                </div>
              </div>
            )}

            {/* Book Appointment Button */}
            <div style={{ textAlign: 'center' }}>
              <button
                onClick={() => bookAppointment(doctor.id)}
                style={{ 
                  width: '100%',
                  padding: '12px',
                  fontSize: '1.1em',
                  fontWeight: 'bold',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#0056b3';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#007bff';
                }}
              >
                📅 Book Appointment
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Stats */}
      {filteredDoctors.length > 0 && (
        <div style={{ 
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          padding: '20px',
          marginTop: '30px',
          backgroundColor: '#f8f9fa'
        }}>
          <h3 style={{ marginBottom: '15px' }}>Quick Stats</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px', textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#3498db' }}>
                {filteredDoctors.length}
              </div>
              <div style={{ color: '#7f8c8d' }}>Available Doctors</div>
            </div>
            <div>
              <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#e74c3c' }}>
                {new Set(filteredDoctors.map(d => d.specialization)).size}
              </div>
              <div style={{ color: '#7f8c8d' }}>Specializations</div>
            </div>
            <div>
              <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#f39c12' }}>
                {new Set(filteredDoctors.filter(d => d.clinicName).map(d => d.clinicName)).size}
              </div>
              <div style={{ color: '#7f8c8d' }}>Clinics</div>
            </div>
            <div>
              <div style={{ fontSize: '2em', fontWeight: 'bold', color: '#27ae60' }}>
                {Math.round(filteredDoctors.filter(d => d.experienceYears).reduce((acc, d) => acc + d.experienceYears, 0) / filteredDoctors.filter(d => d.experienceYears).length) || 0}
              </div>
              <div style={{ color: '#7f8c8d' }}>Avg. Experience (years)</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}