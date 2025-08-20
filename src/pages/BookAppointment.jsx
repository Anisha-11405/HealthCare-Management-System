import React, { useState, useEffect } from "react";
import { useUser } from "../App";
import api from "../utils/api";

const BookAppointment = () => {
  const { user } = useUser();
  const [form, setForm] = useState({
    patientId: "",
    doctorId: "",
    appointmentDate: "",
    appointmentTime: "",
    reason: ""
  });
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [preSelectedDoctor, setPreSelectedDoctor] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        let patientsData = [];
        let doctorsData = [];

        if (user?.role === "PATIENT") {
          patientsData = [user];
          setForm(prev => ({ ...prev, patientId: user.id }));
        } else if (user?.role === "ADMIN") {
          const patientsRes = await api.get("/api/patients");
          patientsData = patientsRes.data || [];
        }

        const doctorsRes = await api.get("/api/doctors");
        doctorsData = doctorsRes.data || [];

        setPatients(patientsData);
        setDoctors(doctorsData);

        // Check for pre-selected doctor from URL parameter
        const urlParams = new URLSearchParams(window.location.search);
        const doctorId = urlParams.get('doctorId');
        if (doctorId && doctorsData.length > 0) {
          const selectedDoctor = doctorsData.find(doctor => doctor.id.toString() === doctorId);
          if (selectedDoctor) {
            setForm(prev => ({ ...prev, doctorId: doctorId }));
            setPreSelectedDoctor(selectedDoctor);
          }
        }

      } catch (error) {
        console.error("Failed to load patients/doctors:", error);
        alert("Failed to load required data. Please refresh the page.");
      } finally {
        setLoadingData(false);
      }
    };
    loadData();
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (e.target.name === 'doctorId') {
      const selectedDoctor = doctors.find(doctor => doctor.id.toString() === e.target.value);
      setPreSelectedDoctor(selectedDoctor || null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const appointmentData = {
        patientId: user?.role === "PATIENT" ? user.id : parseInt(form.patientId),
        doctorId: parseInt(form.doctorId),
        appointmentDate: form.appointmentDate,
        appointmentTime: form.appointmentTime,
        reason: form.reason,
        status: 'PENDING'
      };

      const response = await api.post("/api/appointments", appointmentData);
      alert("Appointment booked successfully!");

      setForm({
        patientId: user?.role === "PATIENT" ? user.id : "",
        doctorId: "",
        appointmentDate: "",
        appointmentTime: "",
        reason: ""
      });
      setPreSelectedDoctor(null);

      // Clear URL parameters
      const url = new URL(window.location);
      url.searchParams.delete('doctorId');
      window.history.replaceState({}, '', url);

    } catch (error) {
      console.error("Failed to book appointment:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to book appointment";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const clearDoctorSelection = () => {
    setForm(prev => ({ ...prev, doctorId: "", appointmentDate: "", appointmentTime: "" }));
    setPreSelectedDoctor(null);
    const url = new URL(window.location);
    url.searchParams.delete('doctorId');
    window.history.replaceState({}, '', url);
  };

  if (loadingData) {
    return (
      <div className="page-container">
        <div className="loading-message">Loading appointment booking form...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Book Appointment</h1>
        <p>{user?.role === "PATIENT" ? "Schedule your appointment with a doctor" : "Create a new appointment for a patient"}</p>
        {preSelectedDoctor && (
          <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#e8f4fd', borderRadius: '6px', border: '1px solid #bee5eb' }}>
            <strong>Selected Doctor:</strong> Dr. {preSelectedDoctor.name} - {preSelectedDoctor.specialization}
            <button onClick={clearDoctorSelection} style={{ marginLeft: '10px', padding: '4px 8px', fontSize: '0.8em', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              Change Doctor
            </button>
          </div>
        )}
      </div>

      <div className="form-container">
        <div className="form-header">
          <h2>New Appointment</h2>
          <p>Please fill in all the required information</p>
        </div>

        <form onSubmit={handleSubmit} className="appointment-form">
          <div className="form-row">
            {user?.role === "PATIENT" ? (
              <div className="form-group">
                <label className="form-label">Patient <span className="required">*</span></label>
                <div className="patient-info-display">
                  <div style={{ padding: "12px", backgroundColor: "#e9ecef", borderRadius: "4px", border: "1px solid #ced4da" }}>
                    <strong>{user.name}</strong>
                    <div className="subtle">ID: {user.id}</div>
                    <div className="subtle">Email: {user.email}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="form-group">
                <label className="form-label">Patient <span className="required">*</span></label>
                <select name="patientId" value={form.patientId} onChange={handleChange} className="form-input" required>
                  <option value="">Select Patient</option>
                  {patients.map(patient => (
                    <option key={patient.id} value={patient.id}>{patient.name} (ID: {patient.id}) - {patient.email}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Doctor <span className="required">*</span></label>
              <select name="doctorId" value={form.doctorId} onChange={handleChange} className="form-input" required>
                <option value="">Select Doctor</option>
                {doctors.map(doctor => (
                  <option key={doctor.id} value={doctor.id}>
                    Dr. {doctor.name} - {doctor.specialization || "General"} (ID: {doctor.id})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Appointment Date <span className="required">*</span></label>
              <input
                type="date"
                name="appointmentDate"
                value={form.appointmentDate}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Appointment Time <span className="required">*</span></label>
              <input
                type="time"
                name="appointmentTime"
                value={form.appointmentTime}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="form-group full-width">
            <label className="form-label">Reason for Appointment <span className="required">*</span></label>
            <textarea
              name="reason"
              value={form.reason}
              onChange={handleChange}
              className="form-textarea"
              rows="4"
              required
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Booking..." : "Book Appointment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookAppointment;
