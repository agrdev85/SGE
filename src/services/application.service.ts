import { api } from '@/lib/api-client';

export interface AppSettingDTO {
  hashId?: string;
  key: string;
  value: string;
}

export interface DesktopShortcutDTO {
  id?: string;
  name: string;
  url: string;
  icon?: string;
}

export const applicationApi = {
  getSettings: () => api.get<AppSettingDTO[]>('/api/application'),
  getShortcuts: () => api.get<DesktopShortcutDTO[]>('/api/application/shortcuts'),
  getAppSettings: () => api.get<Record<string, string>>('/api/application/settings'),

  createSetting: (data: Partial<AppSettingDTO>) =>
    api.post<AppSettingDTO>('/api/application', data),
  deleteSetting: (hashId: string) => api.delete(`/api/application/${hashId}`),

  createShortcut: (data: Partial<DesktopShortcutDTO>) =>
    api.post<DesktopShortcutDTO>('/api/application/desktopshortcut', data),
  updateShortcut: (data: Partial<DesktopShortcutDTO>) =>
    api.put<DesktopShortcutDTO>('/api/application/desktopshortcut', data),
  deleteShortcut: (id: string) => api.delete(`/api/application/desktopshortcut/${id}`),

  getMenu: () => api.post('/Home/GetMenu'),
};
