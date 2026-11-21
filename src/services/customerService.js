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

export const customerService = {
  /**
   * Get all customers with filtering, search, and KPI aggregation
   */
  async getAll(params = {}) {
    const searchParams = new URLSearchParams({ limit: '100', ...params });
    return authorizedRequest(`/customers?${searchParams.toString()}`, {
      method: 'GET',
    });
  },

  /**
   * Get single customer by ID with full order & rental history
   */
  async getById(id) {
    return authorizedRequest(`/customers/${id}`, {
      method: 'GET',
    });
  },

  /**
   * Create a new customer record manually
   */
  async create(customerData) {
    return authorizedRequest('/customers', {
      method: 'POST',
      body: JSON.stringify(customerData),
    });
  },

  /**
   * Update customer profile, segment, KYC status, or account status
   */
  async update(id, updateData) {
    return authorizedRequest(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  },

  /**
   * Delete a customer record
   */
  async delete(id) {
    return authorizedRequest(`/customers/${id}`, {
      method: 'DELETE',
    });
  },
};

export default customerService;
