const API_URL = 'https://isdp-backend.onrender.com/api';

// Get stored token
export const getToken = () => {
  return localStorage.getItem('accessToken');
};

// Set auth headers
export const authHeader = () => {
  const token = getToken();
  if (token) {
    return { 'Authorization': `Bearer ${token}` };
  }
  return {};
};

// Generic fetch with auth
export const fetchWithAuth = async (url, options = {}) => {
  const token = getToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers,
  });
  
  if (response.status === 401) {
    localStorage.clear();
    window.location.href = '/login';
    throw new Error('Session expired');
  }
  
  return response;
};

// Login user
export const loginUser = async (email, password) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return response.json();
};

// Register user
export const registerUser = async (userData) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  return response.json();
};

// Forgot password
export const forgotPassword = async (email) => {
  const response = await fetch(`${API_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  return response.json();
};

// Reset password
export const resetPassword = async (token, newPassword) => {
  const response = await fetch(`${API_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, newPassword }),
  });
  return response.json();
};

// Get profile
export const getProfile = async () => {
  const response = await fetchWithAuth('/users/me');
  return response.json();
};

// Update profile
export const updateProfile = async (data) => {
  const response = await fetchWithAuth('/users/update', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return response.json();
};

// Default export
const authService = {
  getToken,
  authHeader,
  fetchWithAuth,
  loginUser,
  registerUser,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
};

export default authService;
