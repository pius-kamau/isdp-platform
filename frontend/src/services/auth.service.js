import axios from "axios";

// Use environment variable or fallback to Render backend
const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://isdp-backend.onrender.com/api";

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      sessionStorage.removeItem("accessToken");
      sessionStorage.removeItem("refreshToken");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth functions
export const registerUser = async (userData) => {
  return apiClient.post("/auth/register", userData);
};

export const loginUser = async (credentials) => {
  return apiClient.post("/auth/login", credentials);
};

export const forgotPassword = async (email) => {
  return apiClient.post("/auth/forgot-password", { email });
};

export const verifyEmail = async (token) => {
  return apiClient.post("/auth/verify-email", { token });
};

export const resetPassword = async (token, password) => {
  return apiClient.post("/auth/reset-password", { token, password });
};

export const refreshToken = async (refreshTokenValue) => {
  return apiClient.post("/auth/refresh-token", { refreshToken: refreshTokenValue });
};

export const logoutUser = async () => {
  const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
  return apiClient.post(
    "/auth/logout",
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

// Export the apiClient for other API calls
export default apiClient;