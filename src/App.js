// import React, { useState, useEffect, createContext, useContext } from "react";
// import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
// import Navbar from "./components/Navbar";
// import Sidebar from "./components/Sidebar";
// import Home from "./pages/Home";
// import BookAppointment from "./pages/BookAppointment";
// import Appointments from "./pages/Appointments";
// import Doctors from "./pages/Doctors";
// import Patients from "./pages/Patients";
// import DoctorPatients from "./pages/DoctorPatients"; // ✅ NEW import
// // import Profile from "./pages/Profile";
// import Login from "./pages/Login";
// import Register from "./pages/Register";
// import SetAvailability from "./pages/SetAvailability";
// import AdminDoctorManagement from "./pages/AdminDoctorManagement";
// import DoctorProfileManagement from "./pages/DoctorProfileManagement";
// import api from "./utils/api";
// import "./App.css";

// // Create User Context for role-based access
// const UserContext = createContext();

// export const useUser = () => {
//   const context = useContext(UserContext);
//   if (!context) {
//     throw new Error("useUser must be used within a UserProvider");
//   }
//   return context;
// };

// // Role-based route protection component
// const ProtectedRoute = ({ children, allowedRoles }) => {
//   const { user } = useUser();

//   if (!user) {
//     return <Navigate to="/login" replace />;
//   }

//   if (allowedRoles && !allowedRoles.includes(user.role)) {
//     return (
//       <div className="access-denied">
//         <div className="access-denied-content">
//           <h2>Access Denied</h2>
//           <p>You don't have permission to access this page.</p>
//           <p>Your role: <strong>{user.role}</strong></p>
//           <p>Required roles: <strong>{allowedRoles.join(", ")}</strong></p>
//           <button onClick={() => window.history.back()}>Go Back</button>
//         </div>
//       </div>
//     );
//   }

//   return children;
// };

// export default function App() {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);
//   const [user, setUser] = useState(null);

//   useEffect(() => {
//     const checkAuthStatus = async () => {
//       try {
//         const token = localStorage.getItem("token");
//         const isLoggedIn = localStorage.getItem("isAuthenticated");

//         if (token && token.trim() !== "" && isLoggedIn === "true") {
//           try {
//             api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
//             const userResponse = await api.get("/auth/me");
//             setUser(userResponse.data);
//             setIsAuthenticated(true);
//           } catch (error) {
//             localStorage.removeItem("token");
//             localStorage.removeItem("isAuthenticated");
//             setIsAuthenticated(false);
//             setUser(null);
//           }
//         } else {
//           localStorage.removeItem("token");
//           localStorage.removeItem("isAuthenticated");
//           setIsAuthenticated(false);
//           setUser(null);
//         }
//       } catch (error) {
//         localStorage.removeItem("token");
//         localStorage.removeItem("isAuthenticated");
//         setIsAuthenticated(false);
//         setUser(null);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     checkAuthStatus();
//   }, []);

//   const handleLogin = async (token) => {
//     if (token) {
//       localStorage.setItem("token", token);
//       localStorage.setItem("isAuthenticated", "true");
//       api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
//       try {
//         const userResponse = await api.get("/auth/me");
//         setUser(userResponse.data);
//         setIsAuthenticated(true);
//       } catch (error) {
//         setIsAuthenticated(true);
//       }
//     }
//   };

//   const handleLogout = () => {
//     localStorage.removeItem("isAuthenticated");
//     localStorage.removeItem("token");
//     delete api.defaults.headers.common["Authorization"];
//     setIsAuthenticated(false);
//     setUser(null);
//   };

//   if (isLoading) {
//     return (
//       <div className="loading-screen">
//         <div className="loading-spinner"></div>
//         <p>Loading...</p>
//       </div>
//     );
//   }

//   return (
//     <UserContext.Provider value={{ user, setUser }}>
//       <Router>
//         {isAuthenticated ? (
//           <div className="app-layout">
//             <Navbar onLogout={handleLogout} />
//             <div className="app-body">
//               <Sidebar />
//               <main className="main-content">
//                 <Routes>
//                   <Route path="/" element={<Home />} />
//                   <Route path="/dashboard" element={<Home />} />

//                   {/* Patient + Admin → book appointment */}
//                   <Route
//                     path="/book"
//                     element={
//                       <ProtectedRoute allowedRoles={["PATIENT", "ADMIN"]}>
//                         <BookAppointment />
//                       </ProtectedRoute>
//                     }
//                   />

//                   {/* All roles → appointments */}
//                   <Route
//                     path="/appointments"
//                     element={
//                       <ProtectedRoute allowedRoles={["PATIENT", "DOCTOR", "ADMIN"]}>
//                         <Appointments />
//                       </ProtectedRoute>
//                     }
//                   />

//                   {/* Patient + Admin → find/manage doctors */}
//                   <Route
//                     path="/doctors"
//                     element={
//                       <ProtectedRoute allowedRoles={["PATIENT", "ADMIN"]}>
//                         <Doctors />
//                       </ProtectedRoute>
//                     }
//                   />

//                   {/* Admin → manage patients */}
//                   <Route
//                     path="/patients"
//                     element={
//                       <ProtectedRoute allowedRoles={["ADMIN"]}>
//                         <Patients />
//                       </ProtectedRoute>
//                     }
//                   />

//                   {/* Doctor → only their patients */}
//                   <Route
//                     path="/my-patients"
//                     element={
//                       <ProtectedRoute allowedRoles={["DOCTOR"]}>
//                         <DoctorPatients />
//                       </ProtectedRoute>
//                     }
//                   />

//                   {/* Doctor → set availability */}
//                   <Route
//                     path="/set-availability"
//                     element={
//                       <ProtectedRoute allowedRoles={["DOCTOR"]}>
//                         <SetAvailability />
//                       </ProtectedRoute>
//                     }
//                   />

//                   {/* All roles → profile */}
//                   {/* <Route path="/profile" element={<Profile />} /> */}

//                   <Route path="/admin/doctors" element={<AdminDoctorManagement />} />
  
//                   <Route path="/doctor/profile" element={<DoctorProfileManagement />} />

//                   {/* Prevent auth pages when logged in */}
//                   <Route path="/login" element={<Navigate to="/" replace />} />
//                   <Route path="/register" element={<Navigate to="/" replace />} />

//                   {/* Catch-all */}
//                   <Route path="*" element={<Navigate to="/" replace />} />
//                 </Routes>
//               </main>
//             </div>
//           </div>
//         ) : (
//           <Routes>
//             <Route path="/login" element={<Login onLogin={handleLogin} />} />
//             <Route path="/register" element={<Register onLogin={handleLogin} />} />
//             <Route path="*" element={<Navigate to="/login" replace />} />
//           </Routes>
//         )}
//       </Router>
//     </UserContext.Provider>
//   );
// }

import React, { useState, useEffect, createContext, useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
// UPDATED: Import role-specific dashboards
import AdminDashboard from "./pages/AdminDashboard";
import PatientDashboard from "./pages/PatientDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
// Other imports
import BookAppointment from "./pages/BookAppointment";
import Appointments from "./pages/Appointments";
import Doctors from "./pages/Doctors";
import Patients from "./pages/Patients";
import DoctorPatients from "./pages/DoctorPatients";
import Login from "./pages/Login";
import Register from "./pages/Register";
import SetAvailability from "./pages/SetAvailability";
import AdminDoctorManagement from "./pages/AdminDoctorManagement";
import DoctorProfileManagement from "./pages/DoctorProfileManagement";
import api from "./utils/api";
import "./App.css";
import "./Dashboard.css"; // Import the new professional dashboard CSS

// Create User Context for role-based access and real-time updates
const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

// Token validation utility function
const validateToken = (token) => {
  if (!token || token.trim() === "") {
    console.log("❌ No token provided");
    return { isValid: false, reason: "No token" };
  }

  try {
    // Check if it's a JWT token (has 3 parts separated by dots)
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.log("❌ Token is not a valid JWT format");
      return { isValid: false, reason: "Invalid JWT format" };
    }

    // Decode the payload (middle part)
    const payload = JSON.parse(atob(parts[1]));
    console.log("🔍 Token payload:", {
      sub: payload.sub,
      role: payload.role,
      iat: payload.iat ? new Date(payload.iat * 1000) : 'N/A',
      exp: payload.exp ? new Date(payload.exp * 1000) : 'N/A'
    });

    // Check if token has expiration
    if (!payload.exp) {
      console.log("⚠️ Token has no expiration date");
      return { isValid: true, payload, reason: "No expiration" };
    }

    // Check if token is expired
    const currentTime = Math.floor(Date.now() / 1000);
    const isExpired = payload.exp < currentTime;
    
    if (isExpired) {
      const expiredSince = currentTime - payload.exp;
      console.log(`❌ Token expired ${expiredSince} seconds ago`);
      console.log(`Expired at: ${new Date(payload.exp * 1000)}`);
      console.log(`Current time: ${new Date()}`);
      return { isValid: false, reason: "Token expired", payload };
    }

    const timeUntilExpiry = payload.exp - currentTime;
    console.log(`✅ Token is valid. Expires in ${timeUntilExpiry} seconds (${Math.round(timeUntilExpiry / 60)} minutes)`);
    
    return { isValid: true, payload, timeUntilExpiry };
  } catch (error) {
    console.error("❌ Error validating token:", error);
    return { isValid: false, reason: "Token parsing error", error };
  }
};

// Enhanced error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Dashboard Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="dashboard-container">
          <div className="dashboard-card" style={{ maxWidth: '600px', margin: '2rem auto' }}>
            <div className="dashboard-card-content">
              <div className="empty-state">
                <div className="empty-state-icon">⚠️</div>
                <h3 className="empty-state-title">Something went wrong</h3>
                <p className="empty-state-text">
                  The dashboard encountered an error. Please refresh the page or try again later.
                </p>
                <button 
                  className="dashboard-btn primary"
                  onClick={() => window.location.reload()}
                >
                  Refresh Page
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Role-based route protection component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useUser();

  // Show loading while user data is being fetched
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Verifying access permissions...</p>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check role-based access
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="dashboard-container">
        <div className="access-denied">
          <div className="access-denied-content dashboard-card" style={{ 
            maxWidth: '500px', 
            margin: '2rem auto', 
            padding: '2rem',
            textAlign: 'center'
          }}>
            <div className="empty-state-icon">🚫</div>
            <h2 className="empty-state-title">Access Denied</h2>
            <p className="empty-state-text">
              You don't have permission to access this page.
            </p>
            <div style={{ marginBottom: '1rem' }}>
              <p><strong>Your role:</strong> <span className="status-badge secondary">{user.role}</span></p>
              <p><strong>Required roles:</strong> 
                {allowedRoles.map((role, index) => (
                  <span key={role} className="status-badge primary" style={{ marginLeft: '0.5rem' }}>
                    {role}
                  </span>
                ))}
              </p>
            </div>
            <button 
              className="dashboard-btn secondary" 
              onClick={() => window.history.back()}
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <ErrorBoundary>{children}</ErrorBoundary>;
};

// Enhanced Dashboard Router Component with error handling
const DashboardRouter = () => {
  const { user, loading } = useUser();
  
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  switch (user.role) {
    case 'ADMIN':
      return <AdminDashboard />;
    case 'DOCTOR':
      return <DoctorDashboard />;
    case 'PATIENT':
      return <PatientDashboard />;
    default:
      console.warn(`Unknown role: ${user.role}, defaulting to Patient dashboard`);
      return <PatientDashboard />;
  }
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(false);
  const [connectionError, setConnectionError] = useState(false);

  // Helper function to clear authentication data
  const clearAuthData = () => {
    console.log("🧹 Clearing authentication data");
    localStorage.removeItem("authToken");
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userRole");
    delete api.defaults.headers.common["Authorization"];
    setIsAuthenticated(false);
    setUser(null);
  };

  // Enhanced authentication check with better error handling and retry logic
  useEffect(() => {
    const checkAuthStatus = async (retryCount = 0) => {
      try {
        setIsLoading(true);
        setConnectionError(false);
        
        const token = localStorage.getItem("authToken");
        const isLoggedIn = localStorage.getItem("isAuthenticated");

        console.log("🔍 Checking auth status...");
        console.log("Token exists:", !!token);
        console.log("IsLoggedIn flag:", isLoggedIn);

        if (token && token.trim() !== "" && isLoggedIn === "true") {
          // VALIDATE TOKEN BEFORE MAKING API CALLS
          const validation = validateToken(token);
          
          if (!validation.isValid) {
            console.log(`❌ Token validation failed: ${validation.reason}`);
            clearAuthData();
            return;
          }

          // Warn if token expires soon (less than 5 minutes)
          if (validation.timeUntilExpiry && validation.timeUntilExpiry < 300) {
            console.warn(`⚠️ Token expires in ${Math.round(validation.timeUntilExpiry / 60)} minutes`);
          }

          try {
            // Set authorization header
            api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
            
            console.log("🔑 Fetching user data from backend...");
            
            // Fetch user data from backend with timeout
            const userResponse = await Promise.race([
              api.get("/auth/me"),
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Request timeout')), 10000)
              )
            ]);
            
            console.log("👤 User data received:", userResponse.data);
            
            setUser(userResponse.data);
            setIsAuthenticated(true);
            setConnectionError(false);
            
            console.log("✅ Authentication successful");
          } catch (error) {
            console.error("❌ Auth verification failed:", error.response?.data || error.message);
            
            // Handle different error types
            if (error.response?.status === 401 || error.response?.status === 403) {
              console.log("🚪 Token expired or invalid, clearing credentials");
              clearAuthData();
            } else if (error.message === 'Request timeout' || !error.response) {
              console.log("🔄 Network error, retrying...");
              setConnectionError(true);
              
              // Retry logic for network errors
              if (retryCount < 3) {
                setTimeout(() => checkAuthStatus(retryCount + 1), 2000);
                return;
              }
              
              // Keep user logged in but show connection error
              console.log("⚠️ Max retries reached, keeping current auth state");
            } else {
              setConnectionError(true);
            }
          }
        } else {
          console.log("🚪 No valid credentials found");
          clearAuthData();
        }
      } catch (error) {
        console.error("❌ Auth check error:", error);
        setConnectionError(true);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Enhanced login handler with proper token management
  const handleLogin = async (token) => {
    try {
      if (!token) {
        throw new Error("No token provided");
      }

      console.log("🔐 Processing login...");
      
      // VALIDATE TOKEN BEFORE STORING
      const validation = validateToken(token);
      if (!validation.isValid) {
        throw new Error(`Invalid token: ${validation.reason}`);
      }

      setUserLoading(true);
      setConnectionError(false);

      // Store credentials
      localStorage.setItem("authToken", token);
      localStorage.setItem("isAuthenticated", "true");
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      try {
        // Fetch user data with timeout
        console.log("👤 Fetching user profile...");
        const userResponse = await Promise.race([
          api.get("/auth/me"),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Request timeout')), 8000)
          )
        ]);
        
        console.log("✅ Login successful, user data:", userResponse.data);
        
        setUser(userResponse.data);
        setIsAuthenticated(true);
        setConnectionError(false);
        
        // Optional: Store user role for quick access
        localStorage.setItem("userRole", userResponse.data.role);
        
      } catch (userError) {
        console.error("⚠️ Failed to fetch user data after login:", userError);
        
        if (userError.message === 'Request timeout') {
          setConnectionError(true);
          // Still set authenticated, data can be fetched later
          setIsAuthenticated(true);
        } else {
          throw userError; // Re-throw other errors
        }
      }
    } catch (error) {
      console.error("❌ Login processing failed:", error);
      
      // Clear credentials on error
      clearAuthData();
      setConnectionError(true);
      
      throw error; // Re-throw for login component to handle
    } finally {
      setUserLoading(false);
    }
  };

  // Enhanced logout handler
  const handleLogout = async () => {
    try {
      console.log("🚪 Logging out...");
      
      // Optional: Call logout endpoint if you have one
      try {
        await api.post("/auth/logout");
      } catch (logoutError) {
        console.warn("Logout endpoint failed (non-critical):", logoutError);
      }
      
      // Clear all stored data
      clearAuthData();
      setConnectionError(false);
      
      console.log("✅ Logout successful");
    } catch (error) {
      console.error("❌ Logout error:", error);
      
      // Force logout even if there's an error
      localStorage.clear();
      delete api.defaults.headers.common["Authorization"];
      setIsAuthenticated(false);
      setUser(null);
      setConnectionError(false);
    }
  };

  // Connection retry handler
  const retryConnection = () => {
    window.location.reload();
  };

  // Loading screen component
  if (isLoading) {
    return (
      <div className="loading-container" style={{ 
        height: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
      }}>
        <div className="loading-spinner" style={{ 
          width: '3rem', 
          height: '3rem', 
          marginBottom: '1rem' 
        }}></div>
        <p style={{ 
          color: '#64748b', 
          fontSize: '1.125rem',
          fontWeight: '500'
        }}>
          Loading Healthcare System...
        </p>
        <p style={{ 
          color: '#94a3b8', 
          fontSize: '0.875rem',
          marginTop: '0.5rem'
        }}>
          Please wait while we verify your credentials
        </p>
        {connectionError && (
          <div style={{ marginTop: '1rem', textAlign: 'center' }}>
            <p style={{ color: '#dc2626', fontSize: '0.875rem' }}>
              Connection issue detected. Retrying...
            </p>
            <button 
              onClick={retryConnection}
              style={{
                marginTop: '0.5rem',
                padding: '0.5rem 1rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer'
              }}
            >
              Retry Now
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <UserContext.Provider value={{ 
      user, 
      setUser, 
      loading: userLoading,
      connectionError,
      refreshUser: async () => {
        try {
          setUserLoading(true);
          
          // Check token validity before making request
          const token = localStorage.getItem("authToken");
          const validation = validateToken(token);
          
          if (!validation.isValid) {
            console.log("Token invalid during refresh, logging out");
            clearAuthData();
            throw new Error("Token invalid");
          }
          
          const response = await api.get("/auth/me");
          setUser(response.data);
          setConnectionError(false);
          return response.data;
        } catch (error) {
          console.error("Failed to refresh user data:", error);
          if (error.response?.status === 401) {
            clearAuthData();
          }
          setConnectionError(true);
          throw error;
        } finally {
          setUserLoading(false);
        }
      }
    }}>
      <Router>
        {isAuthenticated ? (
          <div className="app-layout">
            <Navbar onLogout={handleLogout} user={user} />
            <div className="app-body">
              <Sidebar user={user} />
              <main className="main-content">
                {connectionError && (
                  <div style={{
                    background: '#fef3c7',
                    border: '1px solid #f59e0b',
                    borderRadius: '0.5rem',
                    padding: '0.75rem 1rem',
                    margin: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ color: '#92400e' }}>⚠️</span>
                      <span style={{ color: '#92400e', fontSize: '0.875rem' }}>
                        Connection issues detected. Some data may not be up to date.
                      </span>
                    </div>
                    <button 
                      onClick={retryConnection}
                      style={{
                        padding: '0.25rem 0.75rem',
                        backgroundColor: '#f59e0b',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.25rem',
                        fontSize: '0.75rem',
                        cursor: 'pointer'
                      }}
                    >
                      Retry
                    </button>
                  </div>
                )}
                <Routes>
                  {/* UPDATED: Role-based dashboard routing */}
                  <Route path="/" element={<DashboardRouter />} />
                  <Route path="/dashboard" element={<DashboardRouter />} />

                  {/* ADMIN-ONLY: Admin Dashboard (legacy route for direct access) */}
                  <Route
                    path="/admin-dashboard"
                    element={
                      <ProtectedRoute allowedRoles={["ADMIN"]}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />

                  {/* PATIENT-ONLY: Patient Dashboard (direct access) */}
                  <Route
                    path="/patient-dashboard"
                    element={
                      <ProtectedRoute allowedRoles={["PATIENT"]}>
                        <PatientDashboard />
                      </ProtectedRoute>
                    }
                  />

                  {/* DOCTOR-ONLY: Doctor Dashboard (direct access) */}
                  <Route
                    path="/doctor-dashboard"
                    element={
                      <ProtectedRoute allowedRoles={["DOCTOR"]}>
                        <DoctorDashboard />
                      </ProtectedRoute>
                    }
                  />

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

                  {/* Admin → doctor management */}
                  <Route 
                    path="/admin/doctors" 
                    element={
                      <ProtectedRoute allowedRoles={["ADMIN"]}>
                        <AdminDoctorManagement />
                      </ProtectedRoute>
                    } 
                  />

                  {/* Doctor → profile management */}
                  <Route 
                    path="/doctor/profile" 
                    element={
                      <ProtectedRoute allowedRoles={["DOCTOR"]}>
                        <DoctorProfileManagement />
                      </ProtectedRoute>
                    } 
                  />

                  {/* Prevent auth pages when logged in */}
                  <Route path="/login" element={<Navigate to="/" replace />} />
                  <Route path="/register" element={<Navigate to="/" replace />} />

                  {/* Catch-all - redirect to dashboard */}
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