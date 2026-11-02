import api from './client';

export const ordersAPI = {
  applyCoupon: async (code) => {
    const res = await api.post('/orders/apply-coupon/', { code });
    return res.data;
  },

  checkout: async (paymentMethod = 'MOCK', couponCode = '') => {
    const res = await api.post('/orders/checkout/', {
      payment_method: paymentMethod,
      coupon_code: couponCode,
    });
    return res.data;
  },

  verifyPayment: async (verificationPayload) => {
    const res = await api.post('/orders/verify-payment/', verificationPayload);
    return res.data;
  },

  getMyOrders: async () => {
    const res = await api.get('/orders/my-orders/');
    return res.data;
  },

  getMyOrderDetail: async (orderNumber) => {
    const res = await api.get(`/orders/my-orders/${orderNumber}/`);
    return res.data;
  },

  // Admin orders & metrics
  getAdminOrders: async (params = {}) => {
    const res = await api.get('/orders/admin/orders/', { params });
    return res.data;
  },

  getAdminDashboardSummary: async () => {
    const res = await api.get('/orders/admin/dashboard-summary/');
    return res.data;
  },

  // Admin coupon management
  getAdminCoupons: async (params = {}) => {
    const res = await api.get('/orders/admin/coupons/', { params });
    return res.data;
  },

  createAdminCoupon: async (data) => {
    const res = await api.post('/orders/admin/coupons/', data);
    return res.data;
  },

  updateAdminCoupon: async (id, data) => {
    const res = await api.patch(`/orders/admin/coupons/${id}/`, data);
    return res.data;
  },

  // Admin audit trail
  getAdminAuditLogs: async (params = {}) => {
    const res = await api.get('/audit/admin/logs/', { params });
    return res.data;
  },
};
