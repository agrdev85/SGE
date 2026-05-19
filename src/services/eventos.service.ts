import { api } from '@/lib/api-client';

const BASE = '/api/eventos';

export interface EventoDTO {
  hashId?: string;
  id?: string;
  nombre: string;
  descripcion?: string;
  fechaInicio?: string;
  fechaFin?: string;
  activo?: boolean;
  [key: string]: unknown;
}

export interface PageResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const eventosApi = {
  eventos: {
    getAll: () => api.get<EventoDTO[]>(`${BASE}/eventos`),
    getPage: (params: { page?: number; limit?: number; sort?: string; filter?: string }) =>
      api.get<PageResponse<EventoDTO>>(`${BASE}/eventos/page`, { params }),
    getById: (hashId: string) => api.get<EventoDTO>(`${BASE}/eventos/${hashId}`),
    create: (data: Partial<EventoDTO>) => api.post<EventoDTO>(`${BASE}/eventos`, data),
    update: (hashId: string, data: Partial<EventoDTO>) =>
      api.put<EventoDTO>(`${BASE}/eventos/${hashId}`, data),
    delete: (hashId: string) => api.delete(`${BASE}/eventos/${hashId}`),
  },

  hoteles: {
    getAll: () => api.get<EventoDTO[]>(`${BASE}/hoteles`),
    getPage: (params: { page?: number; limit?: number }) =>
      api.get<PageResponse<EventoDTO>>(`${BASE}/hoteles/page`, { params }),
    getById: (hashId: string) => api.get<EventoDTO>(`${BASE}/hoteles/${hashId}`),
    create: (data: Partial<EventoDTO>) => api.post<EventoDTO>(`${BASE}/hoteles`, data),
    update: (hashId: string, data: Partial<EventoDTO>) =>
      api.put<EventoDTO>(`${BASE}/hoteles/${hashId}`, data),
    delete: (hashId: string) => api.delete(`${BASE}/hoteles/${hashId}`),
  },

  idiomas: {
    getAll: () => api.get<EventoDTO[]>(`${BASE}/idiomas`),
    getPage: (params: { page?: number; limit?: number }) =>
      api.get<PageResponse<EventoDTO>>(`${BASE}/idiomas/page`, { params }),
    getById: (hashId: string) => api.get<EventoDTO>(`${BASE}/idiomas/${hashId}`),
    create: (data: Partial<EventoDTO>) => api.post<EventoDTO>(`${BASE}/idiomas`, data),
    update: (hashId: string, data: Partial<EventoDTO>) =>
      api.put<EventoDTO>(`${BASE}/idiomas/${hashId}`, data),
    delete: (hashId: string) => api.delete(`${BASE}/idiomas/${hashId}`),
  },

  monedas: {
    getAll: () => api.get<EventoDTO[]>(`${BASE}/monedas`),
    getPage: (params: { page?: number; limit?: number }) =>
      api.get<PageResponse<EventoDTO>>(`${BASE}/monedas/page`, { params }),
    getById: (hashId: string) => api.get<EventoDTO>(`${BASE}/monedas/${hashId}`),
    create: (data: Partial<EventoDTO>) => api.post<EventoDTO>(`${BASE}/monedas`, data),
    update: (hashId: string, data: Partial<EventoDTO>) =>
      api.put<EventoDTO>(`${BASE}/monedas/${hashId}`, data),
    delete: (hashId: string) => api.delete(`${BASE}/monedas/${hashId}`),
  },

  salones: {
    getAll: () => api.get<EventoDTO[]>(`${BASE}/salones`),
    getPage: (params: { page?: number; limit?: number }) =>
      api.get<PageResponse<EventoDTO>>(`${BASE}/salones/page`, { params }),
    getById: (hashId: string) => api.get<EventoDTO>(`${BASE}/salones/${hashId}`),
    create: (data: Partial<EventoDTO>) => api.post<EventoDTO>(`${BASE}/salones`, data),
    update: (hashId: string, data: Partial<EventoDTO>) =>
      api.put<EventoDTO>(`${BASE}/salones/${hashId}`, data),
    delete: (hashId: string) => api.delete(`${BASE}/salones/${hashId}`),
  },

  tematicas: {
    getAll: () => api.get<EventoDTO[]>(`${BASE}/tematicas`),
    getPage: (params: { page?: number; limit?: number }) =>
      api.get<PageResponse<EventoDTO>>(`${BASE}/tematicas/page`, { params }),
    getById: (hashId: string) => api.get<EventoDTO>(`${BASE}/tematicas/${hashId}`),
    create: (data: Partial<EventoDTO>) => api.post<EventoDTO>(`${BASE}/tematicas`, data),
    update: (hashId: string, data: Partial<EventoDTO>) =>
      api.put<EventoDTO>(`${BASE}/tematicas/${hashId}`, data),
    delete: (hashId: string) => api.delete(`${BASE}/tematicas/${hashId}`),
  },

  tiposHabitacion: {
    getAll: () => api.get<EventoDTO[]>(`${BASE}/tipos-habitacion`),
    getPage: (params: { page?: number; limit?: number }) =>
      api.get<PageResponse<EventoDTO>>(`${BASE}/tipos-habitacion/page`, { params }),
    getById: (hashId: string) => api.get<EventoDTO>(`${BASE}/tipos-habitacion/${hashId}`),
    create: (data: Partial<EventoDTO>) => api.post<EventoDTO>(`${BASE}/tipos-habitacion`, data),
    update: (hashId: string, data: Partial<EventoDTO>) =>
      api.put<EventoDTO>(`${BASE}/tipos-habitacion/${hashId}`, data),
    delete: (hashId: string) => api.delete(`${BASE}/tipos-habitacion/${hashId}`),
  },

  tiposParticipacion: {
    getAll: () => api.get<EventoDTO[]>(`${BASE}/tipos-participacion`),
    getPage: (params: { page?: number; limit?: number }) =>
      api.get<PageResponse<EventoDTO>>(`${BASE}/tipos-participacion/page`, { params }),
    getById: (hashId: string) => api.get<EventoDTO>(`${BASE}/tipos-participacion/${hashId}`),
    create: (data: Partial<EventoDTO>) => api.post<EventoDTO>(`${BASE}/tipos-participacion`, data),
    update: (hashId: string, data: Partial<EventoDTO>) =>
      api.put<EventoDTO>(`${BASE}/tipos-participacion/${hashId}`, data),
    delete: (hashId: string) => api.delete(`${BASE}/tipos-participacion/${hashId}`),
  },

  tiposSubEvento: {
    getAll: () => api.get<EventoDTO[]>(`${BASE}/tipos-sub-evento`),
    getPage: (params: { page?: number; limit?: number }) =>
      api.get<PageResponse<EventoDTO>>(`${BASE}/tipos-sub-evento/page`, { params }),
    getById: (hashId: string) => api.get<EventoDTO>(`${BASE}/tipos-sub-evento/${hashId}`),
    create: (data: Partial<EventoDTO>) => api.post<EventoDTO>(`${BASE}/tipos-sub-evento`, data),
    update: (hashId: string, data: Partial<EventoDTO>) =>
      api.put<EventoDTO>(`${BASE}/tipos-sub-evento/${hashId}`, data),
    delete: (hashId: string) => api.delete(`${BASE}/tipos-sub-evento/${hashId}`),
  },

  tiposVehiculo: {
    getAll: () => api.get<EventoDTO[]>(`${BASE}/tipos-vehiculo`),
    getPage: (params: { page?: number; limit?: number }) =>
      api.get<PageResponse<EventoDTO>>(`${BASE}/tipos-vehiculo/page`, { params }),
    getById: (hashId: string) => api.get<EventoDTO>(`${BASE}/tipos-vehiculo/${hashId}`),
    create: (data: Partial<EventoDTO>) => api.post<EventoDTO>(`${BASE}/tipos-vehiculo`, data),
    update: (hashId: string, data: Partial<EventoDTO>) =>
      api.put<EventoDTO>(`${BASE}/tipos-vehiculo/${hashId}`, data),
    delete: (hashId: string) => api.delete(`${BASE}/tipos-vehiculo/${hashId}`),
  },

  subEventos: {
    getAll: () => api.get<EventoDTO[]>(`${BASE}/sub-eventos`),
    getPage: (params: { page?: number; limit?: number }) =>
      api.get<PageResponse<EventoDTO>>(`${BASE}/sub-eventos/page`, { params }),
    getById: (hashId: string) => api.get<EventoDTO>(`${BASE}/sub-eventos/${hashId}`),
    create: (data: Partial<EventoDTO>) => api.post<EventoDTO>(`${BASE}/sub-eventos`, data),
    update: (hashId: string, data: Partial<EventoDTO>) =>
      api.put<EventoDTO>(`${BASE}/sub-eventos/${hashId}`, data),
    delete: (hashId: string) => api.delete(`${BASE}/sub-eventos/${hashId}`),
  },
};
