import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL: BASE_URL });

// Auto-attach JWT token from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authService = {
  register:       (data)       => api.post('/auth/register', data),
  login:          (data)       => api.post('/auth/login', data),
  getProfile:     ()           => api.get('/auth/profile'),
  updateProfile:  (data)       => api.put('/auth/profile', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getRecipients:  (department) => api.get(`/auth/recipients?department=${encodeURIComponent(department)}`),
};

// ─── Requests ─────────────────────────────────────────────────────────────────
export const requestService = {
  submit:     (data)       => api.post('/requests/add', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getAll:     ()           => api.get('/requests/all'),
  getById:    (id)         => api.get(`/requests/${id}`),
  approve:    (id, data)   => api.put(`/requests/approve/${id}`, data),
  reject:     (id, data)   => api.put(`/requests/reject/${id}`, data),
  getStats:   ()           => api.get('/requests/stats'),
};

// ─── QR ───────────────────────────────────────────────────────────────────────
export const qrService = {
  verify:       (token)  => api.get(`/qr/verify/${token}`),
  saveScanLog:  (data)   => api.post('/qr/scan-log', data),
  getScanHistory: ()     => api.get('/qr/scan-history'),
};

export default api;