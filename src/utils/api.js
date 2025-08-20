import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080", // backend base URL
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Attach token before request - FIXED VERSION
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      // FIX: Don't override existing Authorization header
      if (!config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      console.log(`Adding token to ${config.method?.toUpperCase()} ${config.url}`);
      console.log(`Token: ${token.substring(0, 20)}...`);
      console.log(`Full Authorization header: ${config.headers.Authorization?.substring(0, 30)}...`);
    } else {
      console.warn('No token found in localStorage');
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

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
    
    if (error.response?.status === 401) {
      console.warn("Unauthorized - token invalid or expired");
      console.log("Request headers:", error.config?.headers);
      console.log("Response data:", error.response?.data);
    } else if (error.response?.status === 403) {
      console.warn("Forbidden - you don't have permission");
    } else if (error.code === "ECONNABORTED") {
      console.error("Request timeout");
    }
    return Promise.reject(error);
  }
);

export default api;