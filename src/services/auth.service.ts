import { api, loginApi, getStoredUserName } from '@/lib/api-client';
import type { User, UserRole } from '@/lib/database';

const BASE = '/api/security';

const ADMIN_EMAILS = new Set([
  'admin@sigevent.local',
  'admin@eti.biocubafarma.cu',
]);

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  userName: string;
  isLocal: string;
  refresh_token: string;
}

export interface UserDTO {
  UserGuid?: string;
  FirstName: string;
  LastName: string;
  Email: string;
  PhoneNumber?: string;
  UserName: string;
  IsActive: boolean;
  EmailConfirmed?: boolean;
}

function mapBackendRole(role: string | null): UserRole {
  if (!role) return 'USER';
  switch (role) {
    case 'Administrators':
    case 'Administrator':
    case 'SuperAdmin':
    case 'SuperAdministrator':
      return 'SUPERADMIN';
    default:
      return 'USER';
  }
}

export function mapUserDTO(dto: any): User {
  const name = [dto.FirstName, dto.LastName].filter(Boolean).join(' ') || dto.UserName || '';
  const raw = dto as any;
  let roleName: string | null = null;
  if (raw.UserRoles?.length > 0) {
    roleName = raw.UserRoles[0]?.Role?.Name || null;
  }
  if (!roleName) {
    roleName = raw.RoleName || raw.Role || raw.UserType || null;
  }
  if (!roleName && dto.Email && ADMIN_EMAILS.has(dto.Email)) {
    roleName = 'Administrators';
  }
  return {
    id: dto.UserGuid || dto.Id || '',
    name,
    email: dto.Email || '',
    role: mapBackendRole(roleName),
    country: '',
    affiliation: '',
    isActive: dto.IsActive,
    createdAt: '',
    phone: dto.PhoneNumber,
    userName: dto.UserName,
  };
}

export const authApi = {
  login: (username: string, password: string): Promise<LoginResponse> =>
    loginApi(username, password),

  getUsers: () =>
    api.get<any[]>(`${BASE}/users`).then(users => users.map(mapUserDTO)),

  getCurrentUser: async (): Promise<User | null> => {
    const userName = getStoredUserName();
    if (!userName) return null;
    const users = await api.get<any[]>(`${BASE}/users`);
    const match = users.find(u => u.UserName === userName);
    if (!match) return null;
    try {
      const detailed = await api.get<any>(`${BASE}/users/${match.UserGuid}`);
      return mapUserDTO({ ...match, ...detailed });
    } catch {
      return mapUserDTO(match);
    }
  },

  getUserByUsername: async (username: string): Promise<User | null> => {
    const users = await api.get<any[]>(`${BASE}/users`);
    const match = users.find(u => u.UserName === username);
    return match ? mapUserDTO(match) : null;
  },

  createUser: (data: Partial<UserDTO>) =>
    api.post<any>(`${BASE}/users`, data).then(mapUserDTO),

  updateUser: (hashId: string, data: Partial<UserDTO>) =>
    api.put<any>(`${BASE}/users/${hashId}`, data).then(mapUserDTO),

  deleteUser: (hashId: string) =>
    api.delete(`${BASE}/users/${hashId}`),

  changePassword: (oldPassword: string, newPassword: string) =>
    api.post(`${BASE}/users/changepassword`, { oldPassword, newPassword }),

  completeRegistration: (data: { CompleteRegistrationToken: string; PasswordHash: string; ConfirmPasswordHash: string }) =>
    api.post(`${BASE}/users/completeregistration`, data),

  getRoles: () =>
    api.get<{ Id: string; Name: string; Description?: string }[]>(`${BASE}/roles`),

  createRole: (data: { Name: string; Description?: string }) =>
    api.post<{ Id: string; Name: string }>(`${BASE}/roles`, data),

  updateRole: (hashId: string, data: { Name: string; Description?: string }) =>
    api.put<{ Id: string; Name: string }>(`${BASE}/roles/${hashId}`, data),

  deleteRole: (hashId: string) =>
    api.delete(`${BASE}/roles/${hashId}`),

  addRolePermissions: (hashId: string, permissions: unknown) =>
    api.post(`${BASE}/roles/${hashId}/permissions`, permissions),
};
