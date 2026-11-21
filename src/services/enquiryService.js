import { getAdminToken } from './adminAuthService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

async function authorizedRequest(endpoint, options = {}) {
  const token = getAdminToken();
  const headers = {
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data.message || data.error || `Request failed (${response.status})`;
    const error = new Error(message);
    error.statusCode = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const enquiryService = {
  /**
   * Get all inquiries with search, filter, and KPI stats
   */
  async getAll(params = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        searchParams.append(key, val);
      }
    });
    return authorizedRequest(`/enquiries?${searchParams.toString()}`, {
      method: 'GET',
    });
  },

  /**
   * Get single inquiry by ID
   */
  async getById(id) {
    return authorizedRequest(`/enquiries/${id}`, {
      method: 'GET',
    });
  },

  /**
   * Update inquiry status and/or admin notes
   */
  async update(id, payload) {
    return authorizedRequest(`/enquiries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Delete inquiry
   */
  async delete(id) {
    return authorizedRequest(`/enquiries/${id}`, {
      method: 'DELETE',
    });
  },
};

export default enquiryService;
