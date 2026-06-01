import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4000') + '/api/v1';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: attach access token ───────────────────────────────
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken || localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: auto-refresh on 401 ─────────────────────────────
let isRefreshing = false;
let refreshQueue: ((token: string) => void)[] = [];

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshQueue.push((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(apiClient(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await apiClient.post('/auth/refresh');
        const newToken = res.data.data.accessToken;
        useAuthStore.getState().setToken(newToken);
        localStorage.setItem('accessToken', newToken);

        refreshQueue.forEach((cb) => cb(newToken));
        refreshQueue = [];

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch {
        // Refresh failed — log out
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ── Typed API methods ──────────────────────────────────────────────────────

export const authAPI = {
  register:      (data: unknown) => apiClient.post('/auth/register', data),
  login:         (email: string, password: string) => apiClient.post('/auth/login', { email, password }),
  googleLogin:   (idToken: string) => apiClient.post('/auth/google', { idToken }),
  logout:        () => apiClient.post('/auth/logout'),
  me:            () => apiClient.get('/auth/me'),
  forgotPassword:(email: string) => apiClient.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) => apiClient.post('/auth/reset-password', { token, password }),
};

export const projectsAPI = {
  list:            (params?: Record<string, string>) => apiClient.get('/projects', { params }),
  listPublic:      (params?: Record<string, string>) => apiClient.get('/projects/public', { params }),
  create:          (data: unknown) => apiClient.post('/projects', data),
  get:             (id: string) => apiClient.get(`/projects/${id}`),
  update:          (id: string, data: unknown) => apiClient.patch(`/projects/${id}`, data),
  delete:          (id: string) => apiClient.delete(`/projects/${id}`),
  fork:            (id: string) => apiClient.post(`/projects/${id}/fork`),
  downloadUrl:     (id: string) => `${BASE_URL}/projects/${id}/download`,
  addCollaborator: (id: string, data: unknown) => apiClient.post(`/projects/${id}/collaborators`, data),
};

export const filesAPI = {
  listForProject: (projectId: string) => apiClient.get(`/files/project/${projectId}`),
  get:            (id: string) => apiClient.get(`/files/${id}`),
  create:         (data: unknown) => apiClient.post('/files', data),
  update:         (id: string, data: unknown) => apiClient.patch(`/files/${id}`, data),
  delete:         (id: string) => apiClient.delete(`/files/${id}`),
};

export const executionAPI = {
  run:     (data: { language: string; code: string; stdin?: string; projectId?: string }) => apiClient.post('/execute', data),
  history: (params?: Record<string, string>) => apiClient.get('/execute/history', { params }),
};

export const aiAPI = {
  explain:  (code: string, language: string) => apiClient.post('/ai/explain', { code, language }),
  debug:    (code: string, language: string, context?: string) => apiClient.post('/ai/debug', { code, language, context }),
  refactor: (code: string, language: string) => apiClient.post('/ai/refactor', { code, language }),
  optimize: (code: string, language: string) => apiClient.post('/ai/optimize', { code, language }),
  generate: (description: string, language: string) => apiClient.post('/ai/generate', { description, language }),
  complete: (prefix: string, suffix: string, language: string) => apiClient.post('/ai/complete', { prefix, suffix, language }),
  chat:     (messages: unknown[], code?: string, language?: string) => apiClient.post('/ai/chat', { messages, code, language }),
};

export const challengesAPI = {
  list:   (params?: Record<string, string>) => apiClient.get('/challenges', { params }),
  get:    (slug: string) => apiClient.get(`/challenges/${slug}`),
  submit: (data: unknown) => apiClient.post('/submissions', data),
  mySubmissions: (challengeId?: string) => apiClient.get('/submissions', { params: challengeId ? { challengeId } : {} }),
};

export const usersAPI = {
  profile: (username: string) => apiClient.get(`/users/${username}/profile`),
  updateProfile: (data: unknown) => apiClient.patch('/users/profile', data),
  myStats: () => apiClient.get('/users/me/stats'),
};

export const adminAPI = {
  stats:        () => apiClient.get('/admin/stats'),
  listUsers:    (params?: Record<string, string>) => apiClient.get('/admin/users', { params }),
  updateUser:   (id: string, data: unknown) => apiClient.patch(`/admin/users/${id}`, data),
  deleteUser:   (id: string) => apiClient.delete(`/admin/users/${id}`),
  executions:   () => apiClient.get('/admin/executions'),
};
