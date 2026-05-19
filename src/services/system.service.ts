import { api } from '@/lib/api-client';

const BASE = '/api/system';

export const systemApi = {
  scheduledTasks: {
    getAll: () => api.get<Record<string, unknown>[]>(`${BASE}/scheduledtasks`),
    create: (data: Record<string, unknown>) =>
      api.post<Record<string, unknown>>(`${BASE}/scheduledtasks`, data),
    update: (hashId: string, data: Record<string, unknown>) =>
      api.put(`${BASE}/scheduledtasks/${hashId}`, data),
    delete: (hashId: string) => api.delete(`${BASE}/scheduledtasks/${hashId}`),
  },

  dbLogs: {
    getPage: (params: { page?: number; limit?: number }) =>
      api.get<{ data: unknown[]; total: number }>(`${BASE}/dblogs`, { params }),
    deleteAll: () => api.delete(`${BASE}/dblogs`),
  },

  logs: {
    getPage: (params: { page?: number; limit?: number }) =>
      api.get<{ data: unknown[]; total: number }>(`${BASE}/logs`, { params }),
    deleteAll: () => api.delete(`${BASE}/logs`),
    getLevels: () => api.get<string[]>(`${BASE}/logs/loglevels`),
  },
};
