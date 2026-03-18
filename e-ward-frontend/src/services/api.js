import axios from "axios";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8080/api";

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json"
  }
});

// Auth token handling
api.interceptors.request.use(config => {
  const token = localStorage.getItem("eward_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => Promise.reject(error));

// Simple response interceptor to unwrap data or return errors uniformly
api.interceptors.response.use(
  response => response.data,
  error => {
    const err = error?.response?.data?.message || error.message || "Network error";
    return Promise.reject(new Error(err));
  }
);

export default api;
