/**
 * Prestige Computers Admin Authentication API Service
 * Fast, lightweight Fetch API wrapper with automatic JWT token management
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
export const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

/**
 * Get stored JWT auth token
 */
export const getAdminToken = () => {
  return localStorage.getItem('pcs_admin_token') || sessionStorage.getItem('pcs_admin_token') || '';
};

/**
 * Set stored JWT auth token
 */
export const setAdminToken = (token, rememberMe = true) => {
  if (rememberMe) {
    localStorage.setItem('pcs_admin_token', token);
  } else {
    sessionStorage.setItem('pcs_admin_token', token);
  }
};

/**
 * Clear stored JWT auth token & user
 */
export const clearAdminAuth = () => {
  localStorage.removeItem('pcs_admin_token');
  localStorage.removeItem('pcs_admin_user');
  localStorage.removeItem('pcs_admin_authenticated');
  sessionStorage.removeItem('pcs_admin_token');
  sessionStorage.removeItem('pcs_admin_user');
};

/**
 * Helper to get full avatar image URL
 */
export const getFullAvatarUrl = (avatarPath) => {
  if (!avatarPath) return '';
  if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) {
    return avatarPath;
  }
  return `${BACKEND_BASE_URL}${avatarPath}`;
};

/**
 * Perform HTTP request with error handling & performance optimization
 */
async function apiRequest(endpoint, options = {}) {
  const token = getAdminToken();
  const headers = {
    ...(options.headers || {}),
  };

  // Attach Bearer token if present
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Set default JSON Content-Type only if not FormData
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMessage =
        data.message || data.error || `Request failed with status ${response.status}`;
      const error = new Error(errorMessage);
      error.statusCode = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    // If unauthorized/token expired, clear auth
    if (error.statusCode === 401 && endpoint !== '/admin/auth/login') {
      clearAdminAuth();
    }
    throw error;
  }
}

/**
 * Admin Auth API Methods
 */
export const adminAuthService = {
  /**
   * Admin Login
   */
  async login(email, password) {
    return apiRequest('/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  /**
   * Admin Register
   */
  async register({ name, email, password, phone, role = 'admin' }) {
    return apiRequest('/admin/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, phone, role }),
    });
  },

  /**
   * Get Current Admin Profile
   */
  async getProfile() {
    return apiRequest('/admin/auth/profile', {
      method: 'GET',
    });
  },

  /**
   * Update Admin Profile (JSON or Multipart FormData for image upload)
   */
  async updateProfile(formDataOrObject) {
    const isFormData = formDataOrObject instanceof FormData;
    return apiRequest('/admin/auth/profile', {
      method: 'PUT',
      body: isFormData ? formDataOrObject : JSON.stringify(formDataOrObject),
    });
  },

  /**
   * Change Admin Password
   */
  async changePassword(currentPassword, newPassword) {
    return apiRequest('/admin/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },
};

export default adminAuthService;
