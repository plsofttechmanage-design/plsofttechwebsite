import api from './client';

export const catalogAPI = {
  // Categories & Tags
  getCategories: async () => {
    const res = await api.get('/catalog/categories/');
    return res.data;
  },

  getTags: async () => {
    const res = await api.get('/catalog/tags/');
    return res.data;
  },

  // Templates public browsing
  getTemplates: async (params = {}) => {
    const res = await api.get('/catalog/templates/', { params });
    return res.data;
  },

  getTemplateDetails: async (slug) => {
    const res = await api.get(`/catalog/templates/${slug}/`);
    return res.data;
  },

  // Template Reviews
  getTemplateReviews: async (slug) => {
    const res = await api.get(`/catalog/templates/${slug}/reviews/`);
    return res.data;
  },

  postTemplateReview: async (slug, reviewData) => {
    const res = await api.post(`/catalog/templates/${slug}/reviews/`, reviewData);
    return res.data;
  },

  // Customization drafts
  getCustomizations: async () => {
    const res = await api.get('/catalog/customizations/');
    return res.data;
  },

  saveCustomization: async (payload) => {
    if (payload.id) {
      const res = await api.patch(`/catalog/customizations/${payload.id}/`, payload);
      return res.data;
    }
    const res = await api.post('/catalog/customizations/', payload);
    return res.data;
  },

  // Wishlist
  getWishlist: async () => {
    const res = await api.get('/catalog/wishlist/');
    return res.data;
  },

  toggleWishlist: async (templateId) => {
    const res = await api.post('/catalog/wishlist/toggle/', { template_id: templateId });
    return res.data;
  },

  // Admin template management
  getAdminTemplates: async (params = {}) => {
    const res = await api.get('/catalog/admin/templates/', { params });
    return res.data;
  },

  createAdminTemplate: async (formData) => {
    const res = await api.post('/catalog/admin/templates/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  updateAdminTemplate: async (id, data) => {
    const isFormData = data instanceof FormData;
    const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
    const res = await api.patch(`/catalog/admin/templates/${id}/`, data, config);
    return res.data;
  },

  deleteAdminTemplate: async (id) => {
    const res = await api.delete(`/catalog/admin/templates/${id}/`);
    return res.data;
  },

  publishTemplate: async (id) => {
    const res = await api.post(`/catalog/admin/templates/${id}/publish/`);
    return res.data;
  },

  unpublishTemplate: async (id) => {
    const res = await api.post(`/catalog/admin/templates/${id}/unpublish/`);
    return res.data;
  },

  toggleFeaturedTemplate: async (id) => {
    const res = await api.post(`/catalog/admin/templates/${id}/toggle_featured/`);
    return res.data;
  },
};
