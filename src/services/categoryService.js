import { BACKEND_BASE_URL, getAdminToken } from './adminAuthService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

/**
 * Get full image URL for category image
 */
export const getFullCategoryImageUrl = (imagePath) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:')) {
    return imagePath;
  }
  return `${BACKEND_BASE_URL}${imagePath}`;
};

/**
 * Helper to execute authorized admin API calls
 */
async function authorizedRequest(endpoint, options = {}) {
  const token = getAdminToken();
  const headers = {
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
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

export const categoryService = {
  /**
   * Get all categories (all=true fetches both active and hidden for admin)
   */
  async getAll(params = {}) {
    const searchParams = new URLSearchParams({ all: 'true', ...params });
    return authorizedRequest(`/categories?${searchParams.toString()}`, {
      method: 'GET',
    });
  },

  /**
   * Get category by ID
   */
  async getById(id) {
    return authorizedRequest(`/categories/${id}`, {
      method: 'GET',
    });
  },

  /**
   * Create new category (FormData for image upload or plain object)
   */
  async create(formDataOrObject) {
    const isFormData = formDataOrObject instanceof FormData;
    return authorizedRequest('/categories', {
      method: 'POST',
      body: isFormData ? formDataOrObject : JSON.stringify(formDataOrObject),
    });
  },

  /**
   * Update category
   */
  async update(id, formDataOrObject) {
    const isFormData = formDataOrObject instanceof FormData;
    return authorizedRequest(`/categories/${id}`, {
      method: 'PUT',
      body: isFormData ? formDataOrObject : JSON.stringify(formDataOrObject),
    });
  },

  /**
   * Delete category
   */
  async delete(id) {
    return authorizedRequest(`/categories/${id}`, {
      method: 'DELETE',
    });
  },
};

export default categoryService;
