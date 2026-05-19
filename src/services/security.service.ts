import { api } from '@/lib/api-client';

const BASE = '/api/security';

export const securityApi = {
  resources: {
    getAll: () => api.get<Record<string, unknown>[]>(`${BASE}/resources`),
    getById: (hashId: string) =>
      api.get<Record<string, unknown>>(`${BASE}/resources/${hashId}`),
    create: (data: Record<string, unknown>) =>
      api.post<Record<string, unknown>>(`${BASE}/resources`, data),
    update: (hashId: string, data: Record<string, unknown>) =>
      api.put(`${BASE}/resources/${hashId}`, data),
    delete: (hashId: string) => api.delete(`${BASE}/resources/${hashId}`),

    getTree: () => api.get<Record<string, unknown>[]>(`${BASE}/resources/resourcetree`),
    addToGroup: (data: unknown) => api.post(`${BASE}/resources/resourcetree`, data),
    removeFromGroup: (id: string) => api.delete(`${BASE}/resources/resourcetree/${id}`),

    groups: {
      getAll: () => api.get<Record<string, unknown>[]>(`${BASE}/resources/resourcegroups`),
      getList: () => api.get<Record<string, unknown>[]>(`${BASE}/resources/resourcegroups/list`),
      getByRole: (roleId: string) =>
        api.get<Record<string, unknown>[]>(`${BASE}/resources/resourcegroups/byrole/${roleId}`),
      create: (data: Record<string, unknown>) =>
        api.post<Record<string, unknown>>(`${BASE}/resources/resourcegroups`, data),
      update: (id: string, data: Record<string, unknown>) =>
        api.put(`${BASE}/resources/resourcegroups/${id}`, data),
      delete: (id: string) => api.delete(`${BASE}/resources/resourcegroups/${id}`),
    },

    localization: {
      getAll: () => api.get<Record<string, unknown>[]>(`${BASE}/resources/localizationresources`),
      find: (search: string) =>
        api.get<Record<string, unknown>[]>(`${BASE}/resources/localizationresources/find`, {
          params: { search },
        }),
      create: (data: Record<string, unknown>) =>
        api.post<Record<string, unknown>>(`${BASE}/resources/localizationresources`, data),
      update: (id: string, data: Record<string, unknown>) =>
        api.put(`${BASE}/resources/localizationresources/${id}`, data),
      delete: (id: string) => api.delete(`${BASE}/resources/localizationresources/${id}`),
    },
  },
};
