import api from './client';

export const cartAPI = {
  getCart: async () => {
    const res = await api.get('/cart/');
    return res.data;
  },

  addToCart: async (templateId) => {
    const res = await api.post('/cart/', { template_id: templateId });
    return res.data;
  },

  removeItem: async (itemId) => {
    const res = await api.delete(`/cart/items/${itemId}/`);
    return res.data;
  },

  clearCart: async () => {
    const res = await api.delete('/cart/');
    return res.data;
  },
};

