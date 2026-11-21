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

export const paymentService = {
  /**
   * Get all payments with filters, search, and live KPIs
   */
  async getAll(params = {}) {
    const searchParams = new URLSearchParams({ limit: '100', ...params });
    return authorizedRequest(`/payments?${searchParams.toString()}`, {
      method: 'GET',
    });
  },

  /**
   * Get single payment by ID or transactionId
   */
  async getById(id) {
    return authorizedRequest(`/payments/${id}`, {
      method: 'GET',
    });
  },

  /**
   * Record a new manual payment (Admin)
   */
  async create(paymentData) {
    return authorizedRequest('/payments', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  },

  /**
   * Update payment status (Completed, Pending, Refunded, Failed)
   */
  async updateStatus(id, updateData) {
    return authorizedRequest(`/payments/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  },

  /**
   * Delete payment transaction (Admin)
   */
  async delete(id) {
    return authorizedRequest(`/payments/${id}`, {
      method: 'DELETE',
    });
  },
};

export default paymentService;
