import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { useUser } from "../App";

export default function PatientDashboard() {
  const { user } = useUser();
  const navigate = useNavigate();
  
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [filter, setFilter] = useState("all");
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connected');

  // Enhanced fetch appointments with better error handling and debugging
  const fetchAppointments = useCallback(async () => {
    if (!user?.id) {
      console.log("👤 No user ID available, skipping fetch");
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setConnectionStatus('connecting');
      
      console.log("📅 Fetching patient appointments for user:", {
        id: user.id,
        email: user.email,
        role: user.role,
        timestamp: new Date().toISOString()
      });

      // Primary endpoint - try the main patient appointments endpoint
      let response;
      let appointmentsData = [];

      try {
        // Method 1: Use the dedicated patient endpoint
        response = await api.get('/api/appointments/my/patient');
        appointmentsData = response.data || [];
        console.log("✅ Successfully fetched from /api/appointments/my/patient:", appointmentsData.length, "appointments");
      } catch (primaryError) {
        console.warn("⚠️ Primary endpoint failed, trying alternatives:", primaryError.response?.status);
        
        // Method 2: Try alternative endpoint structure
        try {
          response = await api.get(`/api/appointments/patient/${user.id}`);
          appointmentsData = response.data || [];
          console.log("✅ Fallback successful with /api/appointments/patient/:id");
        } catch (fallbackError) {
          console.warn("⚠️ Fallback also failed:", fallbackError.response?.status);
          
          // Method 3: Try stats endpoint to verify connectivity
          try {
            const statsResponse = await api.get('/api/patients/dashboard/my-stats');
            console.log("✅ Stats endpoint working, but appointments endpoint failing");
            console.log("📊 Stats data:", statsResponse.data);
            
            // If stats work but appointments don't, it's likely a backend issue
            throw new Error("Appointments endpoint unavailable, but patient service is running");
          } catch (statsError) {
            console.error("❌ All endpoints failing, likely auth issue:", statsError.response?.status);
            throw primaryError; // Re-throw the original error
          }
        }
      }
      
      // Process and sort appointments
      const processedAppointments = appointmentsData.map(appointment => ({
        ...appointment,
        // Ensure all required fields are present
        id: appointment.id || Math.random(), // Fallback ID
        status: appointment.status || 'PENDING',
        appointmentDate: appointment.appointmentDate || new Date().toISOString().split('T')[0],
        appointmentTime: appointment.appointmentTime || '09:00',
        doctor: appointment.doctor || { name: 'Unknown Doctor', specialization: 'General' },
        patient: appointment.patient || { name: user.name },
        reason: appointment.reason || 'General consultation',
        createdAt: appointment.createdAt || appointment.appointmentDate
      }));
      
      // Sort appointments by date and time (most recent first)
      const sortedAppointments = processedAppointments.sort((a, b) => {
        const dateA = new Date(`${a.appointmentDate}T${a.appointmentTime || '00:00'}`);
        const dateB = new Date(`${b.appointmentDate}T${b.appointmentTime || '00:00'}`);
        return dateB - dateA;
      });

      setAppointments(sortedAppointments);
      setLastUpdate(new Date());
      setConnectionStatus('connected');
      
      console.log("📋 Final processed appointments:", {
        total: sortedAppointments.length,
        pending: sortedAppointments.filter(a => ['PENDING', 'SCHEDULED'].includes(a.status)).length,
        confirmed: sortedAppointments.filter(a => a.status === 'CONFIRMED').length,
        completed: sortedAppointments.filter(a => a.status === 'COMPLETED').length,
        cancelled: sortedAppointments.filter(a => a.status === 'CANCELLED').length
      });

    } catch (error) {
      console.error("❌ Failed to fetch appointments:", error);
      setError(error);
      setConnectionStatus('error');
      
      // Enhanced error handling with user feedback
      if (error.response?.status === 403 || error.response?.status === 401) {
        console.log("🔐 Authentication issue detected");
        setError(new Error("Authentication failed. Please log in again."));
        
        // Don't redirect immediately, let user decide
        setTimeout(() => {
          if (window.confirm("Your session has expired. Would you like to log in again?")) {
            localStorage.clear();
            navigate('/login');
          }
        }, 2000);
      } else if (error.response?.status === 404) {
        console.log("📋 No appointments found for patient");
        setAppointments([]);
        setError(null); // Don't treat "no data" as an error
        setConnectionStatus('connected');
      } else if (error.response?.status >= 500) {
        setError(new Error("Server error. Please try again later."));
        setConnectionStatus('server_error');
      } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        setError(new Error("Request timed out. Please check your connection."));
        setConnectionStatus('timeout');
      } else {
        setError(new Error(`Failed to load appointments: ${error.message}`));
        setConnectionStatus('error');
      }
      
      console.log("⚠️ Using empty appointments list due to error");
      if (error.response?.status !== 404) {
        setAppointments([]); // Only clear if it's a real error, not "no data"
      }
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?.email, user?.name, user?.role, navigate]);

  // Cancel appointment with enhanced feedback
  const cancelAppointment = async (appointmentId) => {
    const appointment = appointments.find(apt => apt.id === appointmentId);
    
    if (!window.confirm(`Are you sure you want to cancel your appointment with ${appointment?.doctor?.name || 'the doctor'}?`)) {
      return;
    }

    try {
      setActionLoading(prev => ({ ...prev, [appointmentId]: 'cancelling' }));
      
      console.log("🚫 Cancelling appointment:", appointmentId);
      await api.patch(`/api/appointments/${appointmentId}/cancel`);
      
      console.log("✅ Appointment cancelled successfully");
      
      // Immediate local update for better UX
      setAppointments(prev => prev.map(apt => 
        apt.id === appointmentId 
          ? { ...apt, status: 'CANCELLED' }
          : apt
      ));
      
      // Then refresh to get server state
      setTimeout(() => fetchAppointments(), 500);

    } catch (error) {
      console.error("❌ Failed to cancel appointment:", error);
      
      let errorMessage = "Failed to cancel appointment";
      if (error.response?.status === 403) {
        errorMessage = "You don't have permission to cancel this appointment";
      } else if (error.response?.status === 404) {
        errorMessage = "Appointment not found";
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      alert(errorMessage);
    } finally {
      setActionLoading(prev => ({ ...prev, [appointmentId]: null }));
    }
  };

  // Reschedule appointment (navigate to booking page with reschedule data)
  const rescheduleAppointment = (appointmentId) => {
    navigate('/book', { state: { rescheduleId: appointmentId } });
  };

  // Enhanced manual refresh with status feedback
  const handleRefresh = async () => {
    console.log("🔄 Manual refresh triggered");
    setRefreshing(true);
    setError(null);
    await fetchAppointments();
    setTimeout(() => setRefreshing(false), 500);
  };

  // Filter appointments
  const filteredAppointments = appointments.filter(appointment => {
    if (filter === "all") return true;
    return appointment.status?.toLowerCase() === filter.toLowerCase();
  });

  // Calculate stats
  const stats = {
    total: appointments.length,
    upcoming: appointments.filter(a => ['CONFIRMED', 'SCHEDULED', 'PENDING'].includes(a.status)).length,
    completed: appointments.filter(a => a.status === 'COMPLETED').length,
    pending: appointments.filter(a => a.status === 'SCHEDULED' || a.status === 'PENDING').length
  };

  // Get status badge class
  const getStatusBadge = (status) => {
    const statusClasses = {
      SCHEDULED: "status-badge pending",
      PENDING: "status-badge pending", 
      CONFIRMED: "status-badge confirmed",
      CANCELLED: "status-badge cancelled",
      COMPLETED: "status-badge completed",
      REJECTED: "status-badge cancelled"
    };
    return statusClasses[status] || "status-badge";
  };

  // Get status text
  const getStatusText = (status) => {
    const statusTexts = {
      SCHEDULED: "Pending Approval",
      PENDING: "Pending Approval",
      CONFIRMED: "Confirmed",
      CANCELLED: "Cancelled",
      COMPLETED: "Completed",
      REJECTED: "Rejected"
    };
    return statusTexts[status] || status;
  };

  // Check if appointment can be cancelled
  const canCancelAppointment = (appointment) => {
    return ['SCHEDULED', 'PENDING', 'CONFIRMED'].includes(appointment.status);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'TBD';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Format time
  const formatTime = (timeString) => {
    if (!timeString) return 'TBD';
    
    try {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch {
      return timeString;
    }
  };

  // Enhanced useEffect with better real-time capabilities
  useEffect(() => {
    if (user?.id) {
      console.log("🔄 Setting up real-time data fetching for user:", user.id);
      
      // Initial fetch
      fetchAppointments();
      
      // Set up periodic refresh every 30 seconds (more frequent for better real-time feel)
      const refreshInterval = setInterval(() => {
        console.log("⏰ Auto-refresh triggered");
        fetchAppointments();
      }, 30 * 1000);
      
      // Set up page visibility API for refresh on focus
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          console.log("👁️ Page became visible, refreshing data");
          fetchAppointments();
        }
      };
      
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      // Cleanup
      return () => {
        clearInterval(refreshInterval);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    } else {
      console.log("👤 No user available, skipping real-time setup");
    }
  }, [fetchAppointments, user?.id]);

  // Stats cards configuration
  const statsCards = [
    {
      title: 'Total Appointments',
      value: stats.total,
      icon: '📅',
      colorClass: 'blue'
    },
    {
      title: 'Upcoming',
      value: stats.upcoming,
      icon: '✅',
      colorClass: 'green'
    },
    {
      title: 'Completed',
      value: stats.completed,
      icon: '🏥',
      colorClass: 'purple'
    },
    {
      title: 'Pending',
      value: stats.pending,
      icon: '⏳',
      colorClass: 'amber'
    }
  ];

  // Connection status indicator
  const getConnectionStatusBadge = () => {
    const statusConfig = {
      connected: { color: 'green', text: 'Connected', icon: '🟢' },
      connecting: { color: 'yellow', text: 'Connecting...', icon: '🟡' },
      error: { color: 'red', text: 'Connection Error', icon: '🔴' },
      server_error: { color: 'red', text: 'Server Error', icon: '⚠️' },
      timeout: { color: 'orange', text: 'Timeout', icon: '⏱️' }
    };
    
    const status = statusConfig[connectionStatus] || statusConfig.error;
    
    return (
      <div style={{ 
        fontSize: '0.75rem', 
        color: status.color === 'green' ? '#10b981' : status.color === 'yellow' ? '#f59e0b' : '#ef4444',
        display: 'flex',
        alignItems: 'center',
        gap: '0.25rem'
      }}>
        <span>{status.icon}</span>
        <span>{status.text}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your appointments...</p>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
            Connecting to server...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="dashboard-header-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 className="dashboard-title">My Health Dashboard</h1>
              <p className="dashboard-subtitle">
                Welcome back, <strong>{user?.name || 'Patient'}</strong>
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div className="dashboard-user-info">
                <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Patient ID</div>
                <div style={{ fontWeight: '600', color: '#3b82f6' }}>
                  #PAT-{user?.id?.toString().padStart(4, '0') || '0001'}
                </div>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', textAlign: 'right' }}>
                <div>Last updated</div>
                <div>{lastUpdate.toLocaleTimeString()}</div>
                {getConnectionStatusBadge()}
              </div>
              <button 
                className="dashboard-btn primary"
                onClick={() => navigate('/book')}
              >
                Book New Appointment
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Error Banner */}
        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '0.5rem',
            padding: '1rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <span style={{ fontSize: '1.5rem' }}>⚠️</span>
            <div>
              <h4 style={{ color: '#dc2626', fontWeight: '600', margin: '0 0 0.25rem 0' }}>
                Connection Issue
              </h4>
              <p style={{ color: '#7f1d1d', fontSize: '0.875rem', margin: 0 }}>
                {error.message}
              </p>
            </div>
            <button 
              onClick={handleRefresh}
              style={{
                marginLeft: 'auto',
                padding: '0.5rem 1rem',
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}
            >
              Retry
            </button>
          </div>
        )}

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

        {/* Filters and Controls */}
        <div className="dashboard-filters">
          <div className="filters-header">
            <div className="filter-group">
              <h2 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1e293b', margin: 0 }}>
                My Appointments
              </h2>
              <select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="scheduled">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div className="filter-count">
                Showing {filteredAppointments.length} of {appointments.length}
              </div>
              <button 
                className="dashboard-btn secondary"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                {refreshing ? (
                  <>
                    <span style={{ marginRight: '0.5rem' }}>🔄</span>
                    Refreshing...
                  </>
                ) : (
                  <>
                    <span style={{ marginRight: '0.5rem' }}>🔄</span>
                    Refresh
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Appointments List */}
        {filteredAppointments.length === 0 ? (
          <div className="dashboard-card">
            <div className="dashboard-card-content">
              <div className="empty-state">
                <div className="empty-state-icon">📅</div>
                <h3 className="empty-state-title">No Appointments Found</h3>
                <p className="empty-state-text">
                  {filter === "all" 
                    ? error
                      ? "Unable to load appointments. Please try again."
                      : "You haven't booked any appointments yet." 
                    : `No ${filter} appointments found.`}
                </p>
                <button 
                  className="dashboard-btn primary"
                  onClick={() => navigate('/book')}
                >
                  Book Your First Appointment
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="item-list">
            {filteredAppointments.map((appointment) => (
              <div key={appointment.id} className="list-item">
                {/* Header */}
                <div className="item-header">
                  <div>
                    <h3 className="item-title">
                      Appointment #{appointment.id.toString().padStart(4, '0')}
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: '#64748b', margin: '0.25rem 0 0 0' }}>
                      Booked on {new Date(appointment.createdAt || appointment.appointmentDate).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  <span className={getStatusBadge(appointment.status)}>
                    {getStatusText(appointment.status)}
                  </span>
                </div>

                {/* Content Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '1.5rem' }}>
                  
                  {/* Doctor Info */}
                  <div style={{ 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '0.75rem', 
                    padding: '1.25rem',
                    background: '#f8fafc'
                  }}>
                    <h4 style={{ fontWeight: '600', color: '#374151', marginBottom: '1rem' }}>
                      Doctor Information
                    </h4>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div style={{ 
                        width: '2.5rem', 
                        height: '2.5rem', 
                        backgroundColor: '#3b82f6', 
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '1rem',
                        color: 'white',
                        fontWeight: '600',
                        fontSize: '0.875rem'
                      }}>
                        {appointment.doctor?.name ? 
                          appointment.doctor.name.split(' ').map(n => n[0]).join('') : 
                          'Dr'
                        }
                      </div>
                      <div>
                        <p style={{ fontWeight: '600', color: '#1e293b', margin: 0 }}>
                          {appointment.doctor?.name || 'Doctor Name'}
                        </p>
                        <p style={{ fontSize: '0.875rem', color: '#64748b', margin: '0.25rem 0' }}>
                          {appointment.doctor?.specialization || 'General Medicine'}
                        </p>
                        {appointment.doctor?.email && (
                          <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>
                            {appointment.doctor.email}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Appointment Details */}
                  <div style={{ 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '0.75rem', 
                    padding: '1.25rem',
                    background: '#f8fafc'
                  }}>
                    <h4 style={{ fontWeight: '600', color: '#374151', marginBottom: '1rem' }}>
                      Appointment Details
                    </h4>
                    <div className="detail-item">
                      <div className="detail-label">Date:</div>
                      <div className="detail-value">{formatDate(appointment.appointmentDate)}</div>
                    </div>
                    <div className="detail-item">
                      <div className="detail-label">Time:</div>
                      <div className="detail-value">{formatTime(appointment.appointmentTime)}</div>
                    </div>
                    <div className="detail-item">
                      <div className="detail-label">Reason:</div>
                      <div className="detail-value">{appointment.reason || 'General consultation'}</div>
                    </div>
                    {appointment.fee && (
                      <div className="detail-item">
                        <div className="detail-label">Fee:</div>
                        <div className="detail-value">${appointment.fee}</div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '0.75rem', 
                    padding: '1.25rem',
                    background: '#f8fafc'
                  }}>
                    <h4 style={{ fontWeight: '600', color: '#374151', marginBottom: '1rem' }}>
                      Actions
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      
                      {appointment.status === 'CONFIRMED' && (
                        <button className="dashboard-btn success" style={{ width: '100%' }}>
                          Join Video Call
                        </button>
                      )}
                      
                      {appointment.status === 'COMPLETED' && (
                        <button className="dashboard-btn primary" style={{ width: '100%' }}>
                          View Report
                        </button>
                      )}
                      
                      {canCancelAppointment(appointment) && (
                        <button 
                          className="dashboard-btn secondary"
                          style={{ width: '100%' }}
                          onClick={() => rescheduleAppointment(appointment.id)}
                        >
                          Reschedule
                        </button>
                      )}
                      
                      {canCancelAppointment(appointment) && (
                        <button 
                          className="dashboard-btn danger"
                          style={{ width: '100%' }}
                          onClick={() => cancelAppointment(appointment.id)}
                          disabled={actionLoading[appointment.id] === 'cancelling'}
                        >
                          {actionLoading[appointment.id] === 'cancelling' ? 'Cancelling...' : 'Cancel'}
                        </button>
                      )}
                      
                      {appointment.status === 'REJECTED' && appointment.rejectionReason && (
                        <div style={{ 
                          padding: '0.75rem', 
                          backgroundColor: '#fef2f2', 
                          border: '1px solid #fecaca',
                          borderRadius: '0.5rem',
                          fontSize: '0.875rem'
                        }}>
                          <strong style={{ color: '#dc2626' }}>Rejection Reason:</strong>
                          <p style={{ margin: '0.25rem 0 0 0', color: '#7f1d1d' }}>
                            {appointment.rejectionReason}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className="quick-actions" style={{ marginTop: '2rem' }}>
          <h3 className="quick-actions-title">Quick Actions</h3>
          <div className="quick-actions-grid">
            <div className="quick-action-item" onClick={() => navigate('/book')}>
              <div className="quick-action-icon">📅</div>
              <div className="quick-action-text">Book Appointment</div>
            </div>
            <div className="quick-action-item" onClick={() => navigate('/doctors')}>
              <div className="quick-action-icon">👨‍⚕️</div>
              <div className="quick-action-text">Find Doctors</div>
            </div>
            <div className="quick-action-item" onClick={handleRefresh}>
              <div className="quick-action-icon">🔄</div>
              <div className="quick-action-text">Refresh Data</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}