// src/components/DoctorDashboard.jsx
import React, { useEffect, useState } from "react";
import api from "../utils/api";

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [loadingPatients, setLoadingPatients] = useState(true);

  // Fetch data on mount
  useEffect(() => {
    loadAppointments();
    loadPatients();
  }, []);

  // Fetch doctor appointments
  const loadAppointments = async () => {
    try {
      setLoadingAppointments(true);
      const response = await api.get("/api/appointments/my/doctor");
      setAppointments(response.data);
    } catch (error) {
      console.error("Error loading appointments", error);
    } finally {
      setLoadingAppointments(false);
    }
  };

  // Fetch doctor patients
  const loadPatients = async () => {
    try {
      setLoadingPatients(true);
      const response = await api.get("/api/patients/my");
      setPatients(response.data);
    } catch (error) {
      console.error("Error loading patients", error);
    } finally {
      setLoadingPatients(false);
    }
  };

  // Approve appointment
  const approveAppointment = async (id) => {
    try {
      await api.patch(`/api/appointments/${id}/approve`);
      loadAppointments();
    } catch (error) {
      console.error("Error approving appointment", error);
    }
  };

  // Reject appointment
  const rejectAppointment = async (id) => {
    try {
      const reason = prompt("Enter rejection reason:");
      if (!reason) return;
      await api.patch(`/api/appointments/${id}/reject`, null, {
        params: { reason },
      });
      loadAppointments();
    } catch (error) {
      console.error("Error rejecting appointment", error);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Doctor Dashboard</h1>

      {/* Patients Section */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">My Patients</h2>
        {loadingPatients ? (
          <p>Loading patients...</p>
        ) : patients.length === 0 ? (
          <p>No patients have booked with you yet.</p>
        ) : (
          <div className="grid gap-4">
            {patients.map((p) => (
              <div
                key={p.id}
                className="p-4 border rounded-xl shadow-sm bg-white"
              >
                <h3 className="text-lg font-semibold">{p.name}</h3>
                <p>Email: {p.email}</p>
                <p>Phone: {p.phoneNumber}</p>
                <p>DOB: {p.dateOfBirth}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Appointments Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">My Appointments</h2>
        {loadingAppointments ? (
          <p>Loading appointments...</p>
        ) : appointments.length === 0 ? (
          <p>No appointments assigned to you.</p>
        ) : (
          <div className="grid gap-4">
            {appointments.map((appt) => (
              <div
                key={appt.id}
                className="p-4 border rounded-xl shadow-sm bg-white flex justify-between items-center"
              >
                <div>
                  <h3 className="text-lg font-semibold">
                    Patient: {appt.patient.name}
                  </h3>
                  <p>Email: {appt.patient.email}</p>
                  <p>Phone: {appt.patient.phoneNumber}</p>
                  <p className="mt-2">
                    Date: {appt.date} | Time: {appt.time}
                  </p>
                  <p>Reason: {appt.reason}</p>
                  <p>
                    Status:{" "}
                    <span
                      className={`px-2 py-1 rounded text-white ${
                        appt.status === "PENDING"
                          ? "bg-yellow-500"
                          : appt.status === "APPROVED"
                          ? "bg-green-500"
                          : appt.status === "REJECTED"
                          ? "bg-red-500"
                          : "bg-gray-500"
                      }`}
                    >
                      {appt.status}
                    </span>
                  </p>
                </div>

                {appt.status === "PENDING" && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => approveAppointment(appt.id)}
                      className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => rejectAppointment(appt.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
