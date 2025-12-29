// C:\Users\LaboranD2K\Downloads\server\PMI-FE-Call-Master\axios.jsx
import axios from "axios";

// Pastikan NEXT_PUBLIC_API_URL sudah benar di .env.local
const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL,
  withCredentials: true, // perlu kalau backend kirim cookie (opsional)
  headers: {
    "Content-Type": "application/json",
  },
});

// Optional: intercept request untuk debug
api.interceptors.request.use(
  (config) => {
    console.log("[API REQUEST]", config.method.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Optional: intercept response untuk debug
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("[API ERROR]", error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

export default api;
