import React, { useEffect, useState } from "react";
import api from "../utils/api";

const Card = ({ children }) => (
  <div
    style={{
      border: "1px solid #ddd",
      borderRadius: "10px",
      padding: "16px",
      margin: "12px 0",
      boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
      backgroundColor: "#fff",
    }}
  >
    {children}
  </div>
);

const CardContent = ({ children }) => <div>{children}</div>;

export default function DoctorPatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      const response = await api.get("/api/patients/my");

      console.log("Patients API response:", response.data);

      const data = response.data;
      setPatients(Array.isArray(data) ? data : [data]);

    } catch (error) {
      console.error("Error fetching patients", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ fontSize: "24px", marginBottom: "20px" }}>My Patients</h1>

      {loading ? (
        <p>Loading patients...</p>
      ) : patients.length === 0 ? (
        <p style={{ color: "#666" }}>
          No patients have booked appointments with you yet.
        </p>
      ) : (
        <div style={{ display: "grid", gap: "16px" }}>
          {patients.map((patient) => (
            <Card key={patient.id}>
              <CardContent>
                <h2 style={{ fontSize: "18px", fontWeight: "bold" }}>
                  {patient.name || "Unknown"}
                </h2>
                <p><strong>Email:</strong> {patient.email || "N/A"}</p>
                <p><strong>Phone:</strong> {patient.phoneNumber || "N/A"}</p>
                <p><strong>DOB:</strong> {patient.dateOfBirth || "N/A"}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
