import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('parkflow_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('parkflow_token');
      localStorage.removeItem('parkflow_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data)
};

// Spots
export const spotAPI = {
  getNearby: (params) => api.get('/spots/nearby', { params }),
  getById: (id) => api.get(`/spots/${id}`),
  getMy: () => api.get('/spots/my'),
  create: (data) => api.post('/spots', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.put(`/spots/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/spots/${id}`),
  addReview: (id, data) => api.post(`/spots/${id}/reviews`, data)
};

// Bookings
export const bookingAPI = {
  start: (data) => api.post('/bookings', data),
  end: (id) => api.put(`/bookings/${id}/end`),
  endActive: () => api.put('/bookings/active/end'),
  cancel: (id) => api.put(`/bookings/${id}/cancel`),
  getMy: (params) => api.get('/bookings/my', { params }),
  getActive: () => api.get('/bookings/active'),
  getOwnerBookings: (params) => api.get('/bookings/owner', { params })
};

// Billing
export const billingAPI = {
  getMonthly: (params) => api.get('/billing/monthly', { params }),
  pay: (data) => api.post('/billing/pay', data),
  getOwnerDashboard: () => api.get('/billing/owner/dashboard'),
  getOwnerEarnings: (params) => api.get('/billing/owner/earnings', { params }),
  getSpotBookings: (spotId) => api.get(`/billing/owner/spots/${spotId}/bookings`),
  withdraw: (data) => api.post('/billing/owner/withdraw', data)
};

// Wallet (Razorpay)
export const walletAPI = {
  getBalance: () => api.get('/wallet'),
  getKeyId: () => api.get('/wallet/key'),
  verifyManual: (data) => api.post('/wallet/verify-manual', data),
  createOrder: (data) => api.post('/wallet/create-order', data),
  verifyPayment: (data) => api.post('/wallet/verify-payment', data),
  createParkingOrder: (data) => api.post('/wallet/create-parking-order', data),
  getHistory: (params) => api.get('/wallet/history', { params })
};

// Admin
export const adminAPI = {
  getUsers: (params) => api.get('/admin/users', { params }),
  toggleUser: (id) => api.put(`/admin/users/${id}/toggle`),
  getSpots: (params) => api.get('/admin/spots', { params }),
  approveSpot: (id, action) => api.put(`/admin/spots/${id}/approve`, { action }),
  getTransactions: (params) => api.get('/admin/transactions', { params }),
  getAnalytics: () => api.get('/admin/analytics')
};

export default api;
