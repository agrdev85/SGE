import { api } from '@/lib/api-client';

const BASE = '/api/configuration';

export const configurationApi = {
  settings: {
    getAll: () => api.get<Record<string, string>[]>(`${BASE}/settings`),
    getById: (hashId: string) => api.get<Record<string, string>>(`${BASE}/settings/${hashId}`),
    saveAll: (data: Record<string, string>[]) => api.post(`${BASE}/settings`, data),
    update: (hashId: string, data: Record<string, string>) =>
      api.put(`${BASE}/settings/${hashId}`, data),
  },

  languages: {
    getAll: () => api.get<Record<string, string>[]>(`${BASE}/languages`),
    getById: (hashId: string) => api.get<Record<string, string>>(`${BASE}/languages/${hashId}`),
    create: (data: Record<string, string>) =>
      api.post<Record<string, string>>(`${BASE}/languages`, data),
    update: (hashId: string, data: Record<string, string>) =>
      api.put(`${BASE}/languages/${hashId}`, data),
    delete: (hashId: string) => api.delete(`${BASE}/languages/${hashId}`),
    getCultures: () => api.get<string[]>(`${BASE}/languages/cultures`),
  },

  emails: {
    getAll: () => api.get<Record<string, unknown>[]>(`${BASE}/emails`),
    create: (data: Record<string, unknown>) =>
      api.post<Record<string, unknown>>(`${BASE}/emails`, data),
    update: (hashId: string, data: Record<string, unknown>) =>
      api.put(`${BASE}/emails/${hashId}`, data),
    delete: (hashId: string) => api.delete(`${BASE}/emails/${hashId}`),
    getProtocols: () => api.get<string[]>(`${BASE}/emails/protocols`),
    getQueued: () => api.get<unknown[]>(`${BASE}/emails/queued`),

    templates: {
      getAll: () => api.get<Record<string, unknown>[]>(`${BASE}/emails/templates`),
      create: (data: Record<string, unknown>) =>
        api.post<Record<string, unknown>>(`${BASE}/emails/templates`, data),
      update: (hashId: string, data: Record<string, unknown>) =>
        api.put(`${BASE}/emails/templates/${hashId}`, data),
      delete: (hashId: string) => api.delete(`${BASE}/emails/templates/${hashId}`),
    },
  },
};
