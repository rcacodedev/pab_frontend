import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Importante para cookies
});

// Obtener y enviar CSRF token
const getCsrfToken = () => {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrftoken="))
    ?.split("=")[1];
};

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    const csrfToken = getCsrfToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (
      csrfToken &&
      ["post", "put", "patch", "delete"].includes(config.method?.toLowerCase())
    ) {
      config.headers["X-CSRFToken"] = csrfToken;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
