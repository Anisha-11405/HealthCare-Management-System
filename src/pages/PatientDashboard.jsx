import React, { useState, useEffect } from "react";
import { useUser } from "../App";
import api from "../utils/api";

export default function PatientDashboard() {
  const { user } = useUser();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    loadMyAppointments();
  }, []);

  const loadMyAppointments = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/api/appointments/my/patient");
      setAppointments(response.data || []);
    } catch (err) {
      console.error("Failed to load appointments:", err);
      if (err.response?.status === 401) {
        setError("Session expired. Please login again.");
      } else {
        setError(err.response?.data?.error || "Failed to load appointments");
      }
    } finally {
      setLoading(false);
    }
  };

  const cancelAppointment = async (appointmentId) => {
    if (window.confirm("Are you sure you want to cancel this appointment?")) {
      try {
        await api.patch(`/api/appointments/${appointmentId}/cancel`);
        loadMyAppointments(); // Refresh the list
      } catch (err) {
        alert("Failed to cancel appointment: " + (err.response?.data || err.message));
      }
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    if (filter === "all") return true;
    return appointment.status?.toLowerCase() === filter.toLowerCase();
  });

  const getStatusBadge = (status) => {
    const statusClasses = {
      SCHEDULED: "bg-yellow-100 text-yellow-800",
      PENDING: "bg-yellow-100 text-yellow-800", 
      CONFIRMED: "bg-green-100 text-green-800",
      CANCELLED: "bg-red-100 text-red-800",
      COMPLETED: "bg-blue-100 text-blue-800"
    };
    return statusClasses[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusText = (status) => {
    const statusTexts = {
      SCHEDULED: "Pending Doctor Approval",
      PENDING: "Pending Doctor Approval",
      CONFIRMED: "Confirmed",
      CANCELLED: "Cancelled",
      COMPLETED: "Completed"
    };
    return statusTexts[status] || status;
  };

  const canCancelAppointment = (appointment) => {
    return appointment.status !== 'COMPLETED' && appointment.status !== 'CANCELLED';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error Loading Appointments</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
                <div className="mt-4">
                  <button
                    onClick={loadMyAppointments}
                    className="bg-red-100 hover:bg-red-200 text-red-800 font-medium py-2 px-4 rounded"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
          <p className="mt-2 text-gray-600">View and manage your healthcare appointments</p>
          <div className="mt-4 text-sm text-gray-500">
            Welcome back, <span className="font-medium">{user?.name || user?.email}</span>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">Filter by status:</label>
              <select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Appointments</option>
                <option value="scheduled">Pending Approval</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={loadMyAppointments}
                className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-2 px-4 rounded-md transition-colors duration-200"
              >
                🔄 Refresh
              </button>
              <div className="text-sm text-gray-500">
                Showing {filteredAppointments.length} of {appointments.length} appointments
              </div>
            </div>
          </div>
        </div>

        {/* Appointments List */}
        {filteredAppointments.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 012-2h3z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Appointments Found</h3>
            <p className="text-gray-600">
              {filter === "all" 
                ? "You haven't booked any appointments yet. Contact your healthcare provider to schedule an appointment."
                : `No ${filter} appointments found.`
              }
            </p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {filteredAppointments.map((appointment) => (
              <div key={appointment.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Appointment #{appointment.id}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Booked on {new Date(appointment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(appointment.status)}`}>
                      {getStatusText(appointment.status)}
                    </span>
                  </div>

                  {/* Doctor Information */}
                  <div className="mb-4">
                    <div className="flex items-center mb-2">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          Dr. {appointment.doctor?.name || 'Unknown Doctor'}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {appointment.doctor?.specialization || 'General Medicine'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Appointment Details */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="flex items-center text-sm text-gray-600 mb-1">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 012-2h3z" />
                        </svg>
                        Date
                      </div>
                      <div className="font-medium text-gray-900">
                        {new Date(appointment.appointmentDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center text-sm text-gray-600 mb-1">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Time
                      </div>
                      <div className="font-medium text-gray-900">
                        {appointment.appointmentTime}
                      </div>
                    </div>
                  </div>

                  {/* Reason */}
                  <div className="mb-4">
                    <div className="text-sm text-gray-600 mb-1">Reason for Visit</div>
                    <div className="text-gray-900">
                      {appointment.reason || 'No reason specified'}
                    </div>
                  </div>

                  {/* Status Information */}
                  {appointment.status === 'SCHEDULED' && (
                    <div className="mb-4 p-3 bg-yellow-50 rounded-lg">
                      <div className="flex items-start">
                        <svg className="w-5 h-5 text-yellow-400 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-yellow-800">Waiting for Doctor Approval</p>
                          <p className="text-sm text-yellow-700">Your appointment has been submitted and is pending approval from Dr. {appointment.doctor?.name}.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {appointment.status === 'CONFIRMED' && (
                    <div className="mb-4 p-3 bg-green-50 rounded-lg">
                      <div className="flex items-start">
                        <svg className="w-5 h-5 text-green-400 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-green-800">Appointment Confirmed</p>
                          <p className="text-sm text-green-700">Your appointment has been approved. Please arrive 15 minutes early.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {appointment.status === 'CANCELLED' && (
                    <div className="mb-4 p-3 bg-red-50 rounded-lg">
                      <div className="flex items-start">
                        <svg className="w-5 h-5 text-red-400 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-red-800">Appointment Cancelled</p>
                          <p className="text-sm text-red-700">This appointment has been cancelled. Contact your healthcare provider to reschedule.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {appointment.status === 'COMPLETED' && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-start">
                        <svg className="w-5 h-5 text-blue-400 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-blue-800">Consultation Completed</p>
                          <p className="text-sm text-blue-700">Your appointment has been completed successfully.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex justify-end">
                    {canCancelAppointment(appointment) && (
                      <button
                        onClick={() => cancelAppointment(appointment.id)}
                        className="bg-red-50 hover:bg-red-100 text-red-700 font-medium py-2 px-4 rounded-md transition-colors duration-200"
                      >
                        Cancel Appointment
                      </button>
                    )}
                    {!canCancelAppointment(appointment) && (
                      <span className="text-sm text-gray-500">No actions available</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-2">Understanding Appointment Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center">
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mr-3">Pending Approval</span>
              <span className="text-blue-800">Waiting for doctor to approve your request</span>
            </div>
            <div className="flex items-center">
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-3">Confirmed</span>
              <span className="text-blue-800">Appointment approved and scheduled</span>
            </div>
            <div className="flex items-center">
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-3">Completed</span>
              <span className="text-blue-800">Consultation has been finished</span>
            </div>
            <div className="flex items-center">
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 mr-3">Cancelled</span>
              <span className="text-blue-800">Appointment was cancelled or rejected</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}