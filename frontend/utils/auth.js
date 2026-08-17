// Check if current user is admin
export const isAdmin = () => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return false;
    const user = JSON.parse(userStr);
    return user.role === 'admin' || user.email === 'piusmwangi611@gmail.com';
  } catch (e) {
    return false;
  }
};

// Get current user
export const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    return JSON.parse(userStr);
  } catch (e) {
    return null;
  }
};
