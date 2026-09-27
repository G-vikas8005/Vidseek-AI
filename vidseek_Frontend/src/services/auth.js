import axios from "axios";

// Read the backend URL from the environment variable.
const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api",
  withCredentials: true, // for cookie-based sessions if used by backend
});

// Centralized request interceptor to attach JWT token if present in localStorage
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("vidseek_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ---- Authentication endpoints ----

/** Register a new user */
export function registerUser(userData) {
  return API.post("/auth/register", userData);
}

/** Login an existing user */
export function loginUser(credentials) {
  return API.post("/auth/login", credentials);
}

/** Get currently authenticated user profile */
export function getCurrentUser() {
  return API.get("/auth/me");
}

/** Logout the user */
export function logoutUser() {
  return API.post("/auth/logout");
}

export default API;
