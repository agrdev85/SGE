import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost';
const API_CLIENT_ID = import.meta.env.VITE_API_CLIENT_ID || 'extApp';
const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export interface TokenData {
  access_token: string;
  userName?: string;
}

export function getAccessToken(): string | null {
  const raw = localStorage.getItem(TOKEN_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(atob(raw));
    return parsed.access_token || null;
  } catch {
    return null;
  }
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(accessToken: string, refreshToken?: string, userName?: string): void {
  const data: TokenData = { access_token: accessToken, userName };
  localStorage.setItem(TOKEN_KEY, btoa(JSON.stringify(data)));
  if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function getStoredUserName(): string | null {
  const raw = localStorage.getItem(TOKEN_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(atob(raw));
    return parsed.userName || null;
  } catch {
    return null;
  }
}

export function clearTokens(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

const client: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else if (token) prom.resolve(token);
  });
  failedQueue = [];
};

client.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(client(originalRequest));
            },
            reject,
          });
        });
      }
      originalRequest._retry = true;
      isRefreshing = true;
      try {
        const refreshToken = getRefreshToken();
        if (!refreshToken) throw new Error('No refresh token');
        const res = await axios.post(`${API_URL}/api/Account/Login`,
          new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
            client_id: API_CLIENT_ID,
          }),
          { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );
        const { access_token, refresh_token, userName } = res.data;
        setTokens(access_token, refresh_token, userName);
        processQueue(null, access_token);
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return client(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearTokens();
        window.dispatchEvent(new CustomEvent('sge-auth-expired'));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export async function loginApi(username: string, password: string) {
  const res = await axios.post(`${API_URL}/api/Account/Login`,
    new URLSearchParams({
      grant_type: 'password',
      username, password,
      client_id: API_CLIENT_ID,
    }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );
  const data = res.data;
  setTokens(data.access_token, data.refresh_token, data.userName);
  return data;
}

export async function apiPost<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const res = await client.post<T>(url, data, config);
  return res.data;
}

export const api = {
  get: <T = unknown>(url: string, config?: AxiosRequestConfig) =>
    client.get<T>(url, config).then(r => r.data),
  post: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    client.post<T>(url, data, config).then(r => r.data),
  put: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    client.put<T>(url, data, config).then(r => r.data),
  delete: <T = unknown>(url: string, config?: AxiosRequestConfig) =>
    client.delete<T>(url, config).then(r => r.data),
};

export async function getErrorMessage(error: unknown): Promise<string> {
  if (axios.isAxiosError(error)) {
    if (error.response?.data) {
      const d = error.response.data as Record<string, unknown>;
      return (d.message || d.error || d.title || JSON.stringify(d)) as string;
    }
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return 'Error desconocido';
}

export async function handleApiError(error: unknown, fallback = 'Error de conexión'): Promise<void> {
  const msg = await getErrorMessage(error);
  toast.error(msg || fallback);
}
