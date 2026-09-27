import axios from "axios";

// Read the backend URL from the environment variable.
// This way we never hard-code the URL in multiple places.
// Change VITE_API_BASE_URL in the .env file when the backend is deployed.
const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api",
  withCredentials: true,
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

// ---- Video endpoints ----

/** Upload a video file to the backend */
export function uploadVideo(file, options = {}) {
  const formData = new FormData();
  formData.append("video", file);

  return API.post("/videos/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: options.onUploadProgress,
  });
}

/** Start processing a video that was already uploaded */
export function processVideo(videoId) {
  return API.post(`/videos/${videoId}/process`);
}

/** Get all results for a specific video */
export function getVideoResults(videoId) {
  return API.get(`/videos/${videoId}/results`);
}

// ---- Search endpoints ----

/** Search inside a video using a text query */
export function searchText(videoId, query) {
  return API.post("/search/text", { videoId, query });
}

/** Search inside a video using a reference photo */
export function searchPhoto(videoId, photoFile) {
  const formData = new FormData();
  formData.append("videoId", videoId);
  formData.append("photo", photoFile);

  return API.post("/search/photo", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export default API;
