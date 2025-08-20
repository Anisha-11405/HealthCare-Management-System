import React, { useState, useEffect, createContext, useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import BookAppointment from "./pages/BookAppointment";
import Appointments from "./pages/Appointments";
import Doctors from "./pages/Doctors";
import Patients from "./pages/Patients";
import DoctorPatients from "./pages/DoctorPatients"; // ✅ NEW import
// import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import SetAvailability from "./pages/SetAvailability";
import AdminDoctorManagement from "./pages/AdminDoctorManagement";
import DoctorProfileManagement from "./pages/DoctorProfileManagement";
import api from "./utils/api";
import "./App.css";

// Create User Context for role-based access
const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

// Role-based route protection component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="access-denied">
        <div className="access-denied-content">
          <h2>Access Denied</h2>
          <p>You don't have permission to access this page.</p>
          <p>Your role: <strong>{user.role}</strong></p>
          <p>Required roles: <strong>{allowedRoles.join(", ")}</strong></p>
          <button onClick={() => window.history.back()}>Go Back</button>
        </div>
      </div>
    );
  }

  return children;
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem("token");
        const isLoggedIn = localStorage.getItem("isAuthenticated");

        if (token && token.trim() !== "" && isLoggedIn === "true") {
          try {
            api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
            const userResponse = await api.get("/auth/me");
            setUser(userResponse.data);
            setIsAuthenticated(true);
          } catch (error) {
            localStorage.removeItem("token");
            localStorage.removeItem("isAuthenticated");
            setIsAuthenticated(false);
            setUser(null);
          }
        } else {
          localStorage.removeItem("token");
          localStorage.removeItem("isAuthenticated");
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        localStorage.removeItem("token");
        localStorage.removeItem("isAuthenticated");
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const handleLogin = async (token) => {
    if (token) {
      localStorage.setItem("token", token);
      localStorage.setItem("isAuthenticated", "true");
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      try {
        const userResponse = await api.get("/auth/me");
        setUser(userResponse.data);
        setIsAuthenticated(true);
      } catch (error) {
        setIsAuthenticated(true);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
    setIsAuthenticated(false);
    setUser(null);
  };

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <Router>
        {isAuthenticated ? (
          <div className="app-layout">
            <Navbar onLogout={handleLogout} />
            <div className="app-body">
              <Sidebar />
              <main className="main-content">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/dashboard" element={<Home />} />

                  {/* Patient + Admin → book appointment */}
                  <Route
                    path="/book"
                    element={
                      <ProtectedRoute allowedRoles={["PATIENT", "ADMIN"]}>
                        <BookAppointment />
                      </ProtectedRoute>
                    }
                  />

                  {/* All roles → appointments */}
                  <Route
                    path="/appointments"
                    element={
                      <ProtectedRoute allowedRoles={["PATIENT", "DOCTOR", "ADMIN"]}>
                        <Appointments />
                      </ProtectedRoute>
                    }
                  />

                  {/* Patient + Admin → find/manage doctors */}
                  <Route
                    path="/doctors"
                    element={
                      <ProtectedRoute allowedRoles={["PATIENT", "ADMIN"]}>
                        <Doctors />
                      </ProtectedRoute>
                    }
                  />

                  {/* Admin → manage patients */}
                  <Route
                    path="/patients"
                    element={
                      <ProtectedRoute allowedRoles={["ADMIN"]}>
                        <Patients />
                      </ProtectedRoute>
                    }
                  />

                  {/* Doctor → only their patients */}
                  <Route
                    path="/my-patients"
                    element={
                      <ProtectedRoute allowedRoles={["DOCTOR"]}>
                        <DoctorPatients />
                      </ProtectedRoute>
                    }
                  />

                  {/* Doctor → set availability */}
                  <Route
                    path="/set-availability"
                    element={
                      <ProtectedRoute allowedRoles={["DOCTOR"]}>
                        <SetAvailability />
                      </ProtectedRoute>
                    }
                  />

                  {/* All roles → profile */}
                  {/* <Route path="/profile" element={<Profile />} /> */}

                  <Route path="/admin/doctors" element={<AdminDoctorManagement />} />
  
                  <Route path="/doctor/profile" element={<DoctorProfileManagement />} />

                  {/* Prevent auth pages when logged in */}
                  <Route path="/login" element={<Navigate to="/" replace />} />
                  <Route path="/register" element={<Navigate to="/" replace />} />

                  {/* Catch-all */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
            </div>
          </div>
        ) : (
          <Routes>
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/register" element={<Register onLogin={handleLogin} />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        )}
      </Router>
    </UserContext.Provider>
  );
}
