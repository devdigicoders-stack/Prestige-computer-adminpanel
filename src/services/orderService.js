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

export const orderService = {
  /**
   * Get all orders with filtering and search
   */
  async getAll(params = {}) {
    const searchParams = new URLSearchParams({ limit: '100', ...params });
    return authorizedRequest(`/orders?${searchParams.toString()}`, {
      method: 'GET',
    });
  },

  /**
   * Get single order by MongoDB ID or orderNumber
   */
  async getById(id) {
    return authorizedRequest(`/orders/${id}`, {
      method: 'GET',
    });
  },

  /**
   * Create a new order (Store checkout or Admin manual)
   */
  async create(orderData) {
    return authorizedRequest('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  /**
   * Update order status, courier info, tracking number, and payment status
   */
  async updateStatus(id, updateData) {
    return authorizedRequest(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  },

  /**
   * Delete an order
   */
  async delete(id) {
    return authorizedRequest(`/orders/${id}`, {
      method: 'DELETE',
    });
  },
};

export default orderService;
