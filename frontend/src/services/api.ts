import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL !== undefined ? import.meta.env.VITE_API_URL : 'http://localhost:8000',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
