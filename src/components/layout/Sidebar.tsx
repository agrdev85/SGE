import { Link, useLocation } from 'react-router-dom';
import { useAuth, roleLabels } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { UserRole } from '@/lib/database';
import {
  LayoutDashboard,
  FileText,
  ClipboardCheck,
  Users,
  Calendar,
  Settings,
  LogOut,
  ChevronLeft,
  Beaker,
  CalendarDays,
  CalendarCheck,
  Layout as LayoutIcon,
  Newspaper,
  Menu,
  Shield,
  Package,
  Hotel,
  ClipboardList,
  CalendarRange,
  FileBarChart,
  Building2,
  Handshake,
  Wrench,
  BookOpen,
  Bus,
  BedDouble,
  Briefcase,
  UserCheck,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

interface NavItem {
  label: string;
  icon: React.ElementType;
  href: string;
  roles: UserRole[];
  section?: string;
}

const navItems: NavItem[] = [
  // General
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard', roles: ['USER', 'REVIEWER', 'COMMITTEE', 'ADMIN', 'SUPERADMIN', 'ADMIN_RECEPTIVO', 'ADMIN_EMPRESA', 'COORDINADOR_HOTEL', 'LECTOR_RECEPTIVO', 'LECTOR_EMPRESA'], section: 'Principal' },
  { label: 'Mis Resúmenes', icon: FileText, href: '/abstracts', roles: ['USER'], section: 'Principal' },
  { label: 'Revisar', icon: ClipboardCheck, href: '/review', roles: ['REVIEWER'], section: 'Principal' },
  { label: 'Comité', icon: Users, href: '/committee', roles: ['COMMITTEE', 'ADMIN', 'SUPERADMIN', 'ADMIN_RECEPTIVO', 'ADMIN_EMPRESA', 'COORDINADOR_HOTEL'], section: 'Principal' },
  { label: 'Programa', icon: CalendarDays, href: '/program', roles: ['COMMITTEE', 'ADMIN', 'SUPERADMIN', 'ADMIN_RECEPTIVO', 'ADMIN_EMPRESA'], section: 'Principal' },
  { label: 'Mi Programa', icon: CalendarCheck, href: '/my-program', roles: ['USER', 'REVIEWER'], section: 'Principal' },

  // Gestión
  { label: 'Gestión Eventos', icon: Calendar, href: '/events', roles: ['ADMIN', 'SUPERADMIN', 'ADMIN_RECEPTIVO', 'ADMIN_EMPRESA'], section: 'Gestión' },
  { label: 'Usuarios', icon: Users, href: '/users', roles: ['ADMIN', 'SUPERADMIN', 'ADMIN_RECEPTIVO'], section: 'Gestión' },

  // CMS
  { label: 'Páginas CMS', icon: LayoutIcon, href: '/cms/pages', roles: ['ADMIN', 'SUPERADMIN'], section: 'CMS' },
  { label: 'Artículos', icon: Newspaper, href: '/cms/articles', roles: ['ADMIN', 'SUPERADMIN'], section: 'CMS' },
  { label: 'Menús', icon: Menu, href: '/cms/menus', roles: ['ADMIN', 'SUPERADMIN'], section: 'CMS' },
  { label: 'Widgets', icon: Package, href: '/cms/widgets', roles: ['ADMIN', 'SUPERADMIN'], section: 'CMS' },

  // Nomencladores (SuperAdmin only)
  { label: 'Nomencladores', icon: BookOpen, href: '/superadmin', roles: ['SUPERADMIN'], section: 'SuperAdmin' },

  // Host Module
  { label: 'Anfitrión', icon: Hotel, href: '/host', roles: ['ADMIN', 'SUPERADMIN', 'COORDINADOR_HOTEL'], section: 'Hotel' },
  { label: 'Calendario Hotel', icon: CalendarRange, href: '/host/calendario', roles: ['ADMIN', 'SUPERADMIN', 'COORDINADOR_HOTEL'], section: 'Hotel' },
  { label: 'Solicitudes', icon: ClipboardList, href: '/host/solicitudes', roles: ['ADMIN', 'SUPERADMIN', 'COORDINADOR_HOTEL'], section: 'Hotel' },
  { label: 'Eventos Hotel', icon: Building2, href: '/host/eventos', roles: ['ADMIN', 'SUPERADMIN', 'COORDINADOR_HOTEL'], section: 'Hotel' },
  { label: 'BEOs', icon: FileBarChart, href: '/host/beos', roles: ['ADMIN', 'SUPERADMIN', 'COORDINADOR_HOTEL'], section: 'Hotel' },
  { label: 'Salones', icon: Building2, href: '/host/salones', roles: ['ADMIN', 'SUPERADMIN', 'COORDINADOR_HOTEL'], section: 'Hotel' },
  { label: 'Receptivos', icon: Handshake, href: '/host/receptivos', roles: ['ADMIN', 'SUPERADMIN'], section: 'Hotel' },
  { label: 'Config. Hotel', icon: Wrench, href: '/host/configuracion', roles: ['ADMIN', 'SUPERADMIN'], section: 'Hotel' },

  // Settings
  { label: 'Configuración', icon: Settings, href: '/settings', roles: ['USER', 'REVIEWER', 'COMMITTEE', 'ADMIN', 'SUPERADMIN', 'ADMIN_RECEPTIVO', 'ADMIN_EMPRESA', 'COORDINADOR_HOTEL', 'LECTOR_RECEPTIVO', 'LECTOR_EMPRESA'], section: 'Sistema' },
];

export function Sidebar() {
  const { user, logout, isImpersonating, stopImpersonation, originalUser } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const filteredItems = navItems.filter(item =>
    user && item.roles.includes(user.role as UserRole)
  );

  // Group by section
  const sections = filteredItems.reduce((acc, item) => {
    const section = item.section || 'Otros';
    if (!acc[section]) acc[section] = [];
    acc[section].push(item);
    return acc;
  }, {} as Record<string, NavItem[]>);

  return (
    <aside className={cn(
      "fixed left-0 top-0 z-40 h-screen bg-card border-r border-border transition-all duration-300",
      collapsed ? "w-20" : "w-64"
    )}>
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary shadow-glow-sm">
              <Beaker className="h-5 w-5 text-primary-foreground" />
            </div>
            {!collapsed && (
              <span className="font-display font-bold text-foreground">SciEvent</span>
            )}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8"
          >
            <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
          </Button>
        </div>

        {/* Impersonation Banner */}
        {isImpersonating && !collapsed && (
          <div className="border-b border-warning/30 bg-warning/10 p-3">
            <div className="flex items-center gap-2 text-xs text-warning">
              <Eye className="h-3.5 w-3.5" />
              <span>Impersonando: <strong>{user?.name}</strong></span>
            </div>
            <Button variant="outline" size="sm" className="w-full mt-1.5 h-7 text-xs" onClick={stopImpersonation}>
              Volver a {originalUser?.name}
            </Button>
          </div>
        )}

        {/* User Info */}
        {!collapsed && user && (
          <div className="border-b border-border p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-info flex items-center justify-center text-primary-foreground font-semibold">
                {user.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <Badge variant="outline" className="text-[10px] h-5 mt-0.5">
                  {roleLabels[user.role as UserRole] || user.role}
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3">
          {Object.entries(sections).map(([section, items]) => (
            <div key={section} className="mb-3">
              {!collapsed && (
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-3 mb-1.5">{section}</p>
              )}
              <ul className="space-y-0.5">
                {items.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        to={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                          isActive
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        <item.icon className="h-4.5 w-4.5 flex-shrink-0" />
                        {!collapsed && <span className="text-[13px]">{item.label}</span>}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className="border-t border-border p-4">
          <Button
            variant="ghost"
            className={cn("w-full justify-start text-muted-foreground hover:text-destructive", collapsed && "justify-center")}
            onClick={logout}
          >
            <LogOut className="h-5 w-5" />
            {!collapsed && <span className="ml-3">Cerrar Sesión</span>}
          </Button>
        </div>
      </div>
    </aside>
  );
}
