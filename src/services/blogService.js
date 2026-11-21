import { getAdminToken } from './adminAuthService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

function getToken() {
  return getAdminToken() || localStorage.getItem('adminToken') || sessionStorage.getItem('pcs_admin_token') || '';
}

export async function getAdminBlogs(params = {}) {
  try {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '' && v !== null && v !== 'all') {
        q.append(k, v);
      }
    });

    const token = getToken();
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_URL}/blogs/admin/all?${q.toString()}`, {
      headers,
    });

    // If authorized admin response is OK
    if (res.ok) {
      const json = await res.json();
      return json.data || { blogs: [], total: 0, statusCounts: {} };
    }

    // Fallback: If 401/403 or unauthorized, try public blogs endpoint
    const fallbackRes = await fetch(`${API_URL}/blogs?${q.toString()}`);
    if (fallbackRes.ok) {
      const fallbackJson = await fallbackRes.json();
      const blogsList = fallbackJson.data?.blogs || fallbackJson.data || [];
      return {
        blogs: blogsList,
        total: fallbackJson.data?.total || blogsList.length,
        statusCounts: {
          all: blogsList.length,
          published: blogsList.length,
          draft: 0,
        },
      };
    }

    return { blogs: [], total: 0, statusCounts: {} };
  } catch (err) {
    console.warn('Error fetching blogs, attempting public fallback:', err.message);
    try {
      const fallbackRes = await fetch(`${API_URL}/blogs`);
      if (fallbackRes.ok) {
        const fallbackJson = await fallbackRes.json();
        const blogsList = fallbackJson.data?.blogs || fallbackJson.data || [];
        return {
          blogs: blogsList,
          total: blogsList.length,
          statusCounts: { all: blogsList.length, published: blogsList.length, draft: 0 },
        };
      }
    } catch {
      // ignore
    }
    return { blogs: [], total: 0, statusCounts: {} };
  }
}

export async function getBlogById(id) {
  try {
    const token = getToken();
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_URL}/blogs/admin/${id}`, {
      headers,
    });

    if (res.ok) {
      const json = await res.json();
      return json.data || null;
    }

    // Fallback to public
    const fallbackRes = await fetch(`${API_URL}/blogs/${id}`);
    if (fallbackRes.ok) {
      const fallbackJson = await fallbackRes.json();
      return fallbackJson.data?.blog || fallbackJson.data || null;
    }

    return null;
  } catch (err) {
    console.warn('Error fetching blog:', err.message);
    return null;
  }
}

export async function createBlog(payload) {
  try {
    const token = getToken();
    const res = await fetch(`${API_URL}/blogs/admin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `HTTP ${res.status}`);
    }
    const json = await res.json();
    return { success: true, data: json.data, message: json.message };
  } catch (err) {
    console.error('Error creating blog:', err);
    return { success: false, message: err.message };
  }
}

export async function updateBlog(id, payload) {
  try {
    const token = getToken();
    const res = await fetch(`${API_URL}/blogs/admin/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `HTTP ${res.status}`);
    }
    const json = await res.json();
    return { success: true, data: json.data, message: json.message };
  } catch (err) {
    console.error('Error updating blog:', err);
    return { success: false, message: err.message };
  }
}

export async function deleteBlog(id) {
  try {
    const token = getToken();
    const res = await fetch(`${API_URL}/blogs/admin/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `HTTP ${res.status}`);
    }
    const json = await res.json();
    return { success: true, message: json.message };
  } catch (err) {
    console.error('Error deleting blog:', err);
    return { success: false, message: err.message };
  }
}

export async function uploadImage(file) {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const token = getToken();
    const res = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return { success: true, url: json.data?.url || json.data };
  } catch (err) {
    console.error('Error uploading image:', err);
    return { success: false, message: err.message };
  }
}

export const blogService = {
  getAdminBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  uploadImage,
};

export default blogService;
