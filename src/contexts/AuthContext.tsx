import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { db, User, UserRole } from '@/lib/database';
import { toast } from 'sonner';

const USE_API = import.meta.env.VITE_USE_API === 'true';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: Omit<User, 'id' | 'createdAt' | 'isActive'>) => Promise<void>;
  logout: () => void;
  // Role helpers
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isAdminReceptivo: boolean;
  isAdminEmpresa: boolean;
  isCoordinadorHotel: boolean;
  isLector: boolean;
  canManageNomencladores: boolean;
  canCreateEvents: boolean;
  canManageUsers: boolean;
  // Impersonation
  impersonateUser: (userId: string) => void;
  stopImpersonation: () => void;
  isImpersonating: boolean;
  originalUser: User | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const roleLabels: Record<UserRole, string> = {
  USER: 'Participante',
  REVIEWER: 'Revisor',
  COMMITTEE: 'Comité',
  SUPERADMIN: 'SuperAdmin',
  ADMIN_RECEPTIVO: 'Admin Receptivo',
  ADMIN_EMPRESA: 'Admin Empresa',
  COORDINADOR_HOTEL: 'Coordinador Hotel',
  LECTOR_RECEPTIVO: 'Lector Receptivo',
  LECTOR_EMPRESA: 'Lector Empresa',
};

export { roleLabels };

const loadUserFromApi = async (): Promise<User | null> => {
  try {
    const { getAccessToken } = await import('@/lib/api-client');
    const token = getAccessToken();
    if (!token) return null;

    const { authApi } = await import('@/services/auth.service');
    const user = await authApi.getCurrentUser();
    return user;
  } catch {
    localStorage.removeItem('auth_token');
    return null;
  }
};

const loadUserFromLocalDb = (token: string): User | null => {
  try {
    const { userId } = JSON.parse(atob(token));
    return db.users.getById(userId) || null;
  } catch {
    localStorage.removeItem('auth_token');
    return null;
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [originalUser, setOriginalUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) { setIsLoading(false); return; }
      const u = USE_API ? await loadUserFromApi() : loadUserFromLocalDb(token);
      if (u) setUser(u);
      setIsLoading(false);
    })();
  }, []);

  useEffect(() => {
    const handleAuthRefresh = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) return;
      const u = USE_API ? await loadUserFromApi() : loadUserFromLocalDb(token);
      if (u) setUser(u);
    };

    const handleAuthExpired = () => {
      localStorage.removeItem('auth_token');
      setUser(null);
      setOriginalUser(null);
      toast.error('Sesión expirada. Inicia sesión nuevamente.');
    };

    window.addEventListener('sge-auth-refresh', handleAuthRefresh);
    window.addEventListener('sge-auth-expired', handleAuthExpired);
    return () => {
      window.removeEventListener('sge-auth-refresh', handleAuthRefresh);
      window.removeEventListener('sge-auth-expired', handleAuthExpired);
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      if (USE_API) {
        const { loginApi } = await import('@/lib/api-client');
        const { authApi } = await import('@/services/auth.service');
        await loginApi(email, password);
        const userData = await authApi.getCurrentUser();
        if (!userData) {
          throw new Error('No se pudo obtener la información del usuario');
        }
        setUser(userData);
        toast.success(`¡Bienvenido, ${userData.name}!`);
      } else {
        await new Promise(r => setTimeout(r, 300));
        const found = db.users.getByEmail(email);
        if (!found) throw new Error('Usuario no encontrado');
        if (!found.isActive) throw new Error('Usuario desactivado');
        const token = btoa(JSON.stringify({ userId: found.id, role: found.role }));
        localStorage.setItem('auth_token', token);
        setUser(found);
        toast.success(`¡Bienvenido, ${found.name}!`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al iniciar sesión');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: Omit<User, 'id' | 'createdAt' | 'isActive'>) => {
    setIsLoading(true);
    try {
      if (USE_API) {
        const { authApi } = await import('@/services/auth.service');
        const userData = await authApi.createUser({
          FirstName: data.name,
          LastName: '',
          Email: data.email,
          UserName: data.email,
          IsActive: true,
          EmailConfirmed: false,
          UserGuid: crypto.randomUUID?.() || '',
        });
        setUser(userData);
        toast.success('¡Cuenta creada exitosamente!');
      } else {
        await new Promise(r => setTimeout(r, 300));
        if (db.users.getByEmail(data.email)) throw new Error('El email ya está registrado');
        const newUser = db.users.create({ ...data, isActive: true });
        const token = btoa(JSON.stringify({ userId: newUser.id, role: newUser.role }));
        localStorage.setItem('auth_token', token);
        setUser(newUser);
        toast.success('¡Cuenta creada exitosamente!');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al registrarse');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    setOriginalUser(null);
    toast.success('Sesión cerrada');
  };

  const impersonateUser = (userId: string) => {
    if (!user || user.role !== 'SUPERADMIN') return;
    const target = db.users.getById(userId);
    if (!target) { toast.error('Usuario no encontrado'); return; }
    db.auditLog.create({
      userId: user.id,
      action: 'IMPERSONATE',
      entity: 'user',
      entityId: userId,
      details: `SuperAdmin "${user.name}" impersonando a "${target.name}" (${target.role})`,
      impersonatedBy: user.id,
    });
    setOriginalUser(user);
    setUser(target);
    toast.info(`Actuando como: ${target.name} (${roleLabels[target.role]})`);
  };

  const stopImpersonation = () => {
    if (originalUser) {
      setUser(originalUser);
      setOriginalUser(null);
      toast.info('Impersonación finalizada');
    }
  };

  const role = user?.role;
  const isSuperAdmin = role === 'SUPERADMIN';
  const isAdmin = isSuperAdmin; // ADMIN role removed, SuperAdmin has full control
  const isAdminReceptivo = role === 'ADMIN_RECEPTIVO';
  const isAdminEmpresa = role === 'ADMIN_EMPRESA';
  const isCoordinadorHotel = role === 'COORDINADOR_HOTEL';
  const isLector = role === 'LECTOR_RECEPTIVO' || role === 'LECTOR_EMPRESA';

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      isSuperAdmin,
      isAdmin,
      isAdminReceptivo,
      isAdminEmpresa,
      isCoordinadorHotel,
      isLector,
      canManageNomencladores: isSuperAdmin || isAdminReceptivo,
      canCreateEvents: isAdmin || isAdminReceptivo || isAdminEmpresa,
      canManageUsers: isSuperAdmin || isAdminReceptivo,
      impersonateUser,
      stopImpersonation,
      isImpersonating: !!originalUser,
      originalUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
