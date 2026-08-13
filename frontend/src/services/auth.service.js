import axios from 'axios';

// API base URL
const API_URL = import.meta.env.VITE_API_URL || 'https://isdp-backend.onrender.com/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ============ AUTH FUNCTIONS ============

// Login user
export const loginUser = async (credentials) => {
  try {
    const response = await apiClient.post('/auth/login', credentials);
    
    // Store user data if available
    if (response.data?.data?.user) {
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    
    return response;
  } catch (error) {
    throw error;
  }
};

// Register user
export const registerUser = async (userData) => {
  try {
    const response = await apiClient.post('/auth/register', userData);
    return response;
  } catch (error) {
    throw error;
  }
};

// Forgot password - request reset link
export const forgotPassword = async (email) => {
  try {
    const response = await apiClient.post('/auth/password/forgot-password', { email });
    return response;
  } catch (error) {
    throw error;
  }
};

// Reset password with token
export const resetPassword = async (token, newPassword) => {
  try {
    const response = await apiClient.post('/auth/password/reset-password', {
      token,
      newPassword
    });
    return response;
  } catch (error) {
    throw error;
  }
};

// Get current user
export const getCurrentUser = async () => {
  try {
    const response = await apiClient.get('/users/me');
    return response;
  } catch (error) {
    throw error;
  }
};

// Update user profile
export const updateUser = async (userId, data) => {
  try {
    const response = await apiClient.put(`/users/${userId}`, data);
    return response;
  } catch (error) {
    throw error;
  }
};

// Logout
export const logoutUser = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  sessionStorage.removeItem('accessToken');
  sessionStorage.removeItem('refreshToken');
  sessionStorage.removeItem('user');
};

// Get stored user
export const getStoredUser = () => {
  try {
    const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
  } catch (e) {
    console.error('Error parsing stored user:', e);
  }
  return null;
};

export default apiClient;
