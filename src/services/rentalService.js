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

export const rentalService = {
  /**
   * Get all rentals with KPIs, search, and status filter
   */
  async getAll(params = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== '' &&
        value !== 'undefined' &&
        value !== 'null' &&
        value !== 'All'
      ) {
        searchParams.append(key, value);
      }
    });

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/rentals?${queryString}` : '/rentals';
    return authorizedRequest(endpoint, {
      method: 'GET',
    });
  },

  /**
   * Get single rental by ID
   */
  async getById(id) {
    return authorizedRequest(`/rentals/${id}`, {
      method: 'GET',
    });
  },

  /**
   * Update rental status, KYC, deposit, and asset serial number
   */
  async updateStatus(id, updateData) {
    return authorizedRequest(`/rentals/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  },

  /**
   * Delete rental agreement
   */
  async delete(id) {
    return authorizedRequest(`/rentals/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Get all rental duration plans (active & inactive)
   */
  async getRentalPlans() {
    return authorizedRequest('/rentals/admin/plans', {
      method: 'GET',
    });
  },

  /**
   * Create a new rental duration plan
   */
  async createRentalPlan(planData) {
    return authorizedRequest('/rentals/admin/plans', {
      method: 'POST',
      body: JSON.stringify(planData),
    });
  },

  /**
   * Update an existing rental duration plan
   */
  async updateRentalPlan(id, planData) {
    return authorizedRequest(`/rentals/admin/plans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(planData),
    });
  },

  /**
   * Delete a rental duration plan
   */
  async deleteRentalPlan(id) {
    return authorizedRequest(`/rentals/admin/plans/${id}`, {
      method: 'DELETE',
    });
  },
};

export default rentalService;
