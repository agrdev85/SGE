import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { usersApi, User } from '@/lib/mockApi';
import { Search, Users as UsersIcon, UserCheck, ClipboardCheck, Shield } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const roleConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  USER: { label: 'Participante', color: 'bg-primary/10 text-primary', icon: UsersIcon },
  REVIEWER: { label: 'Revisor', color: 'bg-info/10 text-info', icon: ClipboardCheck },
  COMMITTEE: { label: 'Comité', color: 'bg-accent/10 text-accent', icon: UserCheck },
  ADMIN: { label: 'Admin', color: 'bg-warning/10 text-warning', icon: Shield },
};

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await usersApi.getAll();
      setUsers(data);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'all' || u.role === activeTab;
    return matchesSearch && matchesTab;
  });

  const counts = {
    all: users.length,
    USER: users.filter(u => u.role === 'USER').length,
    REVIEWER: users.filter(u => u.role === 'REVIEWER').length,
    COMMITTEE: users.filter(u => u.role === 'COMMITTEE').length,
    ADMIN: users.filter(u => u.role === 'ADMIN').length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-display font-bold">Gestión de Usuarios</h1>
          <p className="text-muted-foreground mt-1">
            Administra los usuarios de la plataforma
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(roleConfig).map(([role, config]) => (
            <Card key={role} className="bg-gradient-to-br from-muted/50 to-transparent">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${config.color}`}>
                    <config.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold font-display">{counts[role as keyof typeof counts]}</p>
                    <p className="text-xs text-muted-foreground">{config.label}s</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader className="pb-3">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">Todos ({counts.all})</TabsTrigger>
                <TabsTrigger value="USER">Participantes ({counts.USER})</TabsTrigger>
                <TabsTrigger value="REVIEWER">Revisores ({counts.REVIEWER})</TabsTrigger>
                <TabsTrigger value="COMMITTEE">Comité ({counts.COMMITTEE})</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
                ))}
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <UsersIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>No se encontraron usuarios</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Usuario</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Email</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Rol</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">País</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Afiliación</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(user => {
                      const config = roleConfig[user.role];
                      return (
                        <tr key={user.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={user.avatar} />
                                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                  {user.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{user.name}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-muted-foreground">
                            {user.email}
                          </td>
                          <td className="py-4 px-4">
                            <Badge variant="secondary" className={config.color}>
                              {config.label}
                            </Badge>
                          </td>
                          <td className="py-4 px-4 text-muted-foreground">
                            {user.country}
                          </td>
                          <td className="py-4 px-4 text-muted-foreground">
                            {user.affiliation}
                          </td>
                          <td className="py-4 px-4">
                            <Badge variant={user.isActive ? 'default' : 'secondary'}>
                              {user.isActive ? 'Activo' : 'Inactivo'}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
