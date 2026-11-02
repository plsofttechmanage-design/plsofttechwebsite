import api from './client';

export const authAPI = {
  login: async (email, password) => {
    const res = await api.post('/auth/login/', { email, password });
    return res.data;
  },

  logout: async (refreshToken) => {
    try {
      const res = await api.post('/auth/logout/', { refresh: refreshToken });
      return res.data;
    } catch {
      // Graceful fallback if token is already expired
      return null;
    }
  },

  register: async (userData) => {
    const res = await api.post('/auth/register/', userData);
    return res.data;
  },

  requestPasswordReset: async (email) => {
    const res = await api.post('/auth/password-reset/', { email });
    return res.data;
  },

  confirmPasswordReset: async (data) => {
    const res = await api.post('/auth/password-reset-confirm/', data);
    return res.data;
  },

  getProfile: async () => {
    const res = await api.get('/auth/profile/');
    return res.data;
  },

  updateProfile: async (data) => {
    const res = await api.patch('/auth/profile/', data);
    return res.data;
  },

  changePassword: async (passwords) => {
    const res = await api.post('/auth/change-password/', passwords);
    return res.data;
  },

  // Admin customer management
  getAdminUsers: async (params = {}) => {
    const res = await api.get('/auth/admin/users/', { params });
    return res.data;
  },

  updateAdminUser: async (id, data) => {
    const res = await api.patch(`/auth/admin/users/${id}/`, data);
    return res.data;
  },
};
