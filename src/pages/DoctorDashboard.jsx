"use client"

import { useState } from "react"

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState([
    {
      id: 1,
      patient: { name: "Anisha", email: "anr118@example.com", phoneNumber: "860250964" },
      appointmentDate: "2025-08-19",
      appointmentTime: "11:44",
      reason: "check-up",
      status: "CANCELLED",
    },
    {
      id: 2,
      patient: { name: "Anisha", email: "anr118@example.com", phoneNumber: "860250964" },
      appointmentDate: "2025-08-20",
      appointmentTime: "10:30",
      reason: "General consultation",
      status: "COMPLETED",
    },
    {
      id: 3,
      patient: { name: "Anisha", email: "anr118@example.com", phoneNumber: "860250964" },
      appointmentDate: "2025-08-20",
      appointmentTime: "18:00",
      reason: "General Check Up",
      status: "CONFIRMED",
    },
  ])

  const [patients, setPatients] = useState([
    {
      id: 1,
      name: "Anisha",
      email: "anr118@example.com",
      phoneNumber: "860250964",
      dateOfBirth: "2005-01-01",
    },
  ])

  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState({})
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [refreshing, setRefreshing] = useState(false)

  const user = { name: "Dr. Smith", specialization: "Cardiology" }

  // Complete appointment function
  const completeAppointment = async (appointmentId) => {
    if (!window.confirm("Mark this appointment as completed?")) {
      return
    }

    try {
      setActionLoading((prev) => ({ ...prev, [appointmentId]: "completing" }))

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setAppointments((prev) => prev.map((apt) => (apt.id === appointmentId ? { ...apt, status: "COMPLETED" } : apt)))

      setLastUpdate(new Date())
      console.log("✅ Appointment completed successfully")
    } catch (error) {
      console.error("❌ Failed to complete appointment:", error)
      alert(`Failed to complete appointment: ${error.message}`)
    } finally {
      setActionLoading((prev) => ({ ...prev, [appointmentId]: null }))
    }
  }

  // Manual refresh
  const handleRefresh = async () => {
    setRefreshing(true)
    setLastUpdate(new Date())
    setTimeout(() => setRefreshing(false), 500)
  }

  // Calculate stats
  const stats = {
    totalAppointments: appointments.length,
    pendingAppointments: appointments.filter((a) => a.status === "PENDING" || a.status === "SCHEDULED").length,
    todaysAppointments: appointments.filter((a) => {
      const today = new Date().toISOString().split("T")[0]
      return a.appointmentDate === today
    }).length,
    totalPatients: patients.length,
    completedToday: appointments.filter((a) => {
      const today = new Date().toISOString().split("T")[0]
      return a.status === "COMPLETED" && a.appointmentDate === today
    }).length,
  }

  // Get status badge
  const getStatusBadge = (status) => {
    const statusClasses = {
      PENDING: "status-badge pending",
      SCHEDULED: "status-badge pending",
      CONFIRMED: "status-badge confirmed",
      REJECTED: "status-badge cancelled",
      COMPLETED: "status-badge completed",
      CANCELLED: "status-badge cancelled",
    }
    return statusClasses[status] || "status-badge"
  }

  // Format date and time
  const formatDate = (dateString) => {
    if (!dateString) return "TBD"
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const formatTime = (timeString) => {
    if (!timeString) return "TBD"

    try {
      const [hours, minutes] = timeString.split(":")
      const hour = Number.parseInt(hours)
      const ampm = hour >= 12 ? "PM" : "AM"
      const displayHour = hour % 12 || 12
      return `${displayHour}:${minutes} ${ampm}`
    } catch {
      return timeString
    }
  }

  // Calculate patient age
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return "N/A"

    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }

    return age
  }

  // Stats cards configuration
  const statsCards = [
    {
      title: "Total Appointments",
      value: stats.totalAppointments,
      icon: "📅",
      colorClass: "blue",
    },
    {
      title: "Pending Approval",
      value: stats.pendingAppointments,
      icon: "⏳",
      colorClass: "amber",
    },
    {
      title: "Today's Schedule",
      value: stats.todaysAppointments,
      icon: "🗓️",
      colorClass: "green",
    },
    {
      title: "Total Patients",
      value: stats.totalPatients,
      icon: "👥",
      colorClass: "purple",
    },
    {
      title: "Completed Today",
      value: stats.completedToday,
      icon: "✅",
      colorClass: "teal",
    },
  ]

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading doctor dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="dashboard-header-content">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            <div>
              <h1 className="dashboard-title">Doctor Dashboard</h1>
              <p className="dashboard-subtitle">
                Welcome back, <strong>{user?.name || "Doctor"}</strong>
                {user?.specialization && <span> - {user.specialization}</span>}
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div className="dashboard-user-info">
                <div style={{ fontSize: "0.875rem", color: "#64748b" }}>Today</div>
                <div style={{ fontWeight: "600", color: "#1e293b" }}>
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>
              <div style={{ fontSize: "0.75rem", color: "#94a3b8", textAlign: "right" }}>
                <div>Last updated</div>
                <div>{lastUpdate.toLocaleTimeString()}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Stats Cards */}
        <div className="stats-grid">
          {statsCards.map((card, index) => (
            <div key={index} className={`stat-card ${card.colorClass}`}>
              <div className="stat-card-header">
                <div className="stat-card-icon">{card.icon}</div>
              </div>
              <div className="stat-card-value">{card.value}</div>
              <div className="stat-card-title">{card.title}</div>
            </div>
          ))}
        </div>

        <div className="dashboard-grid two-col">
          {/* Appointments Section */}
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h2 className="dashboard-card-title">My Appointments</h2>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <span
                    style={{
                      background: "#3b82f6",
                      color: "white",
                      padding: "0.375rem 0.75rem",
                      borderRadius: "9999px",
                      fontSize: "0.875rem",
                      fontWeight: "500",
                    }}
                  >
                    {appointments.length} Total
                  </span>
                  <button className="dashboard-btn secondary" onClick={handleRefresh} disabled={refreshing}>
                    {refreshing ? "Refreshing..." : "Refresh"}
                  </button>
                </div>
              </div>
            </div>
            <div className="dashboard-card-content">
              {appointments.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">📅</div>
                  <h3 className="empty-state-title">No appointments yet</h3>
                  <p className="empty-state-text">Appointments will appear here once patients book with you.</p>
                </div>
              ) : (
                <div className="item-list">
                  {appointments.slice(0, 8).map((appointment) => (
                    <div key={appointment.id} className="list-item">
                      <div className="item-header">
                        <div>
                          <h3 className="item-title">{appointment.patient?.name || "Patient Name"}</h3>
                          <div style={{ fontSize: "0.875rem", color: "#64748b", marginTop: "0.25rem" }}>
                            <div>{appointment.patient?.email || "patient@email.com"}</div>
                            <div>{appointment.patient?.phoneNumber || "Phone not available"}</div>
                          </div>
                        </div>
                        <span className={getStatusBadge(appointment.status)}>{appointment.status}</span>
                      </div>

                      <div className="item-details">
                        <div className="detail-item">
                          <div className="detail-label">Date:</div>
                          <div className="detail-value">{formatDate(appointment.appointmentDate)}</div>
                        </div>
                        <div className="detail-item">
                          <div className="detail-label">Time:</div>
                          <div className="detail-value">{formatTime(appointment.appointmentTime)}</div>
                        </div>
                      </div>

                      <div style={{ marginBottom: "1rem" }}>
                        <div className="detail-label">Reason:</div>
                        <p style={{ color: "#1e293b", margin: "0.25rem 0 0 0" }}>
                          {appointment.reason || "General consultation"}
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                        {appointment.status === "CONFIRMED" && (
                          <button
                            className="dashboard-btn primary"
                            onClick={() => completeAppointment(appointment.id)}
                            disabled={actionLoading[appointment.id] === "completing"}
                          >
                            {actionLoading[appointment.id] === "completing" ? "Completing..." : "Mark Complete"}
                          </button>
                        )}

                        {appointment.status === "COMPLETED" && (
                          <button className="dashboard-btn secondary">Add Notes</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Patients Section */}
          <div className="dashboard-card">
            <div className="dashboard-card-header">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h2 className="dashboard-card-title">My Patients</h2>
                <span
                  style={{
                    background: "#8b5cf6",
                    color: "white",
                    padding: "0.375rem 0.75rem",
                    borderRadius: "9999px",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                  }}
                >
                  {patients.length} Total
                </span>
              </div>
            </div>
            <div className="dashboard-card-content">
              {patients.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">👥</div>
                  <h3 className="empty-state-title">No patients yet</h3>
                  <p className="empty-state-text">Patients who book appointments with you will appear here.</p>
                </div>
              ) : (
                <div className="item-list">
                  {patients.slice(0, 8).map((patient) => (
                    <div key={patient.id} className="list-item">
                      <div className="item-header">
                        <div>
                          <h3 className="item-title">{patient.name}</h3>
                          <div style={{ fontSize: "0.875rem", color: "#64748b", marginTop: "0.25rem" }}>
                            <div>{patient.email}</div>
                            <div>{patient.phoneNumber || "Phone not available"}</div>
                          </div>
                        </div>
                        <button
                          className="dashboard-btn primary"
                          onClick={() => console.log(`View history for patient ${patient.id}`)}
                        >
                          View History
                        </button>
                      </div>

                      <div className="item-details">
                        <div className="detail-item">
                          <div className="detail-label">Age:</div>
                          <div className="detail-value">{calculateAge(patient.dateOfBirth)} years</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h3 className="quick-actions-title">Quick Actions</h3>
          <div className="quick-actions-grid">
            <div className="quick-action-item" onClick={() => console.log("Set availability")}>
              <div className="quick-action-icon">⏰</div>
              <div className="quick-action-text">Set Availability</div>
            </div>
            <div className="quick-action-item" onClick={() => console.log("Update profile")}>
              <div className="quick-action-icon">👤</div>
              <div className="quick-action-text">Update Profile</div>
            </div>
            <div className="quick-action-item" onClick={() => console.log("All patients")}>
              <div className="quick-action-icon">👥</div>
              <div className="quick-action-text">All Patients</div>
            </div>
            <div className="quick-action-item" onClick={handleRefresh}>
              <div className="quick-action-icon">🔄</div>
              <div className="quick-action-text">Refresh Data</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
