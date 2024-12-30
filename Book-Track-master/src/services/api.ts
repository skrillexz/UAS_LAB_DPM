// @ts-ignore
import axios, { AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { getAuthToken } from '../utils/auth';

const API_URL = 'https://backendbooktrack-production.up.railway.app'; // Ganti APInya

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      const token = await getAuthToken();
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

export const login = async (username: string, password: string) => {
  try {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  } catch (error) {
    const apiError = error as any;
    throw apiError.response?.data || { message: 'Network error' };
  }
};

export const register = async (username: string, password: string, email: string) => {
  try {
    const response = await api.post('/auth/register', { username, password, email });
    return response.data;
  } catch (error) {
    const apiError = error as any;
    throw apiError.response?.data || { message: 'Network error' };
  }
};

export const fetchUserProfile = async () => {
  try {
    const response = await api.get('/profile');
    // @ts-ignore
    return response.data.data;
  } catch (error) {
    const apiError = error as any;
    throw apiError.response?.data || { message: 'Network error' };
  }
};