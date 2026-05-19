import { api } from '@/lib/api-client';

const BASE = '/api/reportes';

export const reportesApi = {
  participantes: (params: Record<string, string | number>) =>
    api.get(`${BASE}/participantes`, { params }),

  talleres: (params: Record<string, string | number>) =>
    api.get(`${BASE}/talleres`, { params }),

  talleresReacciones: (params: Record<string, string | number>) =>
    api.get(`${BASE}/talleres_reacciones`, { params }),
};
