import { BACKEND_BASE_URL, getAdminToken } from './adminAuthService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

/**
 * Get full image URL for uploaded product image
 */
export const getFullProductImageUrl = (imagePath) => {
  if (!imagePath) return '';
  if (
    imagePath.startsWith('http://') ||
    imagePath.startsWith('https://') ||
    imagePath.startsWith('data:')
  ) {
    return imagePath;
  }
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${BACKEND_BASE_URL}${cleanPath}`;
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

export const productService = {
  /**
   * Get all products (all=true fetches all statuses for admin)
   */
  async getAll(params = {}) {
    const searchParams = new URLSearchParams({ all: 'true', limit: '100', ...params });
    return authorizedRequest(`/products?${searchParams.toString()}`, {
      method: 'GET',
    });
  },

  /**
   * Get single product by ID or slug
   */
  async getById(id) {
    return authorizedRequest(`/products/${id}`, {
      method: 'GET',
    });
  },

  /**
   * Create new product (accepts FormData for file upload or plain JSON object)
   */
  async create(formDataOrObject) {
    const isFormData = formDataOrObject instanceof FormData;
    return authorizedRequest('/products', {
      method: 'POST',
      body: isFormData ? formDataOrObject : JSON.stringify(formDataOrObject),
    });
  },

  /**
   * Update existing product
   */
  async update(id, formDataOrObject) {
    const isFormData = formDataOrObject instanceof FormData;
    return authorizedRequest(`/products/${id}`, {
      method: 'PUT',
      body: isFormData ? formDataOrObject : JSON.stringify(formDataOrObject),
    });
  },

  /**
   * Toggle product status (Active <-> Inactive)
   */
  async toggleStatus(id) {
    return authorizedRequest(`/products/${id}/status`, {
      method: 'PATCH',
    });
  },

  /**
   * Adjust product inventory stock with audit record & custom thresholds
   */
  async adjustStock(id, data) {
    return authorizedRequest(`/products/${id}/adjust-stock`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Get product stock adjustment history
   */
  async getStockHistory(id) {
    return authorizedRequest(`/products/${id}/stock-history`, {
      method: 'GET',
    });
  },

  /**
   * Permanently delete a product
   */
  async delete(id) {
    return authorizedRequest(`/products/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Bulk delete products by IDs
   */
  async bulkDelete(ids) {
    return authorizedRequest('/products/bulk-delete', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    });
  },
};

export default productService;