import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:8080/api',
});

// Intercepta as requisições para injetar o token JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@DeliveryApp:token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});