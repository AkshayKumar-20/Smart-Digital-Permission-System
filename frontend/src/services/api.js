import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create an axios instance that automatically attaches the token
const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
};

export const requestService = {
  submit: (data) => api.post('/requests/add', data),
  getAll: (role, userId) => api.get(`/requests/all?role=${role}&userId=${userId}`),
  updateStatus: (id, status) => api.put(`/requests/update/${id}`, { status }),
};

export default api;