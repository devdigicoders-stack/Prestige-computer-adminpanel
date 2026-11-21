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

export const dashboardService = {
  /**
   * Fetch comprehensive dynamic dashboard statistics, charts, and activity
   * @param {string} range - e.g. 'Last 7 Days', 'Last 30 Days', 'Last 90 Days', 'This Year'
   */
  async getStats(range = 'Last 30 Days') {
    const query = new URLSearchParams({ range });
    return authorizedRequest(`/dashboard/stats?${query.toString()}`, {
      method: 'GET',
    });
  },
};

export default dashboardService;
