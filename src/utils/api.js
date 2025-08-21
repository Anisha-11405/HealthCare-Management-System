// import axios from "axios";

// const api = axios.create({
//   baseURL: "http://localhost:8080", // backend base URL
//   headers: {
//     "Content-Type": "application/json",
//   },
//   timeout: 10000,
// });

// // Attach token before request - FIXED VERSION
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem("authToken"); // or wherever you store it
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// // Handle errors with better logging
// api.interceptors.response.use(
//   (response) => {
//     console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
//     return response;
//   },
//   (error) => {
//     const method = error.config?.method?.toUpperCase();
//     const url = error.config?.url;
//     const status = error.response?.status;
    
//     console.error(`❌ ${method} ${url} - ${status}`);
    
//     if (error.response?.status === 401) {
//       console.warn("Unauthorized - token invalid or expired");
//       console.log("Request headers:", error.config?.headers);
//       console.log("Response data:", error.response?.data);
//     } else if (error.response?.status === 403) {
//       console.warn("Forbidden - you don't have permission");
//     } else if (error.code === "ECONNABORTED") {
//       console.error("Request timeout");
//     }
//     return Promise.reject(error);
//   }
// );

// export default api;

import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080", // backend base URL
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Attach token before request - FIXED VERSION
api.interceptors.request.use((config) => {
  // Try multiple possible token storage keys
  const token = localStorage.getItem("jwtToken") || 
                localStorage.getItem("authToken") || 
                localStorage.getItem("token");
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log(`🔑 Adding auth token to ${config.method?.toUpperCase()} ${config.url}`);
  } else {
    console.warn(`⚠️ No auth token found for ${config.method?.toUpperCase()} ${config.url}`);
  }
  return config;
});

// Handle errors with better logging
api.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    return response;
  },
  (error) => {
    const method = error.config?.method?.toUpperCase();
    const url = error.config?.url;
    const status = error.response?.status;
    
    console.error(`❌ ${method} ${url} - ${status}`);
    console.error("Error details:", error.response?.data);
    
    if (error.response?.status === 401) {
      console.warn("🔐 Unauthorized - token invalid or expired");
      console.log("Request headers:", error.config?.headers);
      console.log("Response data:", error.response?.data);
      
      // Optionally clear invalid token and redirect to login
      localStorage.removeItem("jwtToken");
      localStorage.removeItem("authToken");
      localStorage.removeItem("token");
      
      // Uncomment if you want automatic redirect to login
      // window.location.href = '/login';
      
    } else if (error.response?.status === 403) {
      console.warn("🚫 Forbidden - you don't have permission");
      console.log("User role might be insufficient for:", url);
    } else if (error.response?.status === 500) {
      console.error("💥 Server error:", error.response?.data);
    } else if (error.code === "ECONNABORTED") {
      console.error("⏰ Request timeout");
    }
    
    return Promise.reject(error);
  }
);

export default api;