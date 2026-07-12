import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const api = axios.create({ baseURL: API_URL });

const getAccessToken = () => localStorage.getItem('streamhub_access_token');
const getRefreshToken = () => localStorage.getItem('streamhub_refresh_token');

export const setTokens = (accessToken: string, refreshToken?: string) => {
  localStorage.setItem('streamhub_access_token', accessToken);
  if (refreshToken) localStorage.setItem('streamhub_refresh_token', refreshToken);
};

export const clearTokens = () => {
  localStorage.removeItem('streamhub_access_token');
  localStorage.removeItem('streamhub_refresh_token');
};

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let pendingQueue: Array<() => void> = [];

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status !== 401 || original?._retry) {
      throw error;
    }

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      clearTokens();
      throw error;
    }

    original._retry = true;

    if (isRefreshing) {
      await new Promise<void>((resolve) => pendingQueue.push(resolve));
      return api(original);
    }

    isRefreshing = true;
    try {
      const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
      setTokens(data.accessToken);
      pendingQueue.forEach((resolve) => resolve());
      pendingQueue = [];
      return api(original);
    } catch (refreshError) {
      clearTokens();
      window.location.href = '/login';
      throw refreshError;
    } finally {
      isRefreshing = false;
    }
  }
);
