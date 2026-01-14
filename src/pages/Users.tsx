import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { db, User } from '@/lib/database';
import { Search, Users as UsersIcon, UserCheck, ClipboardCheck, Shield, Plus, Edit, Trash2, X } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageUploader } from '@/components/ImageUploader';
import { toast } from 'sonner';
import { generateParticipationCertificate } from '@/lib/certificateGenerator';

const roleConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  USER: { label: 'Participante', color: 'bg-primary/10 text-primary', icon: UsersIcon },
  REVIEWER: { label: 'Revisor', color: 'bg-info/10 text-info', icon: ClipboardCheck },
  COMMITTEE: { label: 'Comité', color: 'bg-accent/10 text-accent', icon: UserCheck },
  ADMIN: { label: 'Admin', color: 'bg-warning/10 text-warning', icon: Shield },
};

const countries = ['Cuba', 'México', 'Argentina', 'España', 'Colombia', 'Chile', 'Perú', 'Venezuela', 'Brasil', 'Estados Unidos'];

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '', email: '', role: 'USER' as User['role'], country: '', affiliation: '', avatar: '', isActive: true,
  });

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = () => setUsers(db.users.getAll());

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase());
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

  const openCreateDialog = () => {
    setEditingUser(null);
    setFormData({ name: '', email: '', role: 'USER', country: '', affiliation: '', avatar: '', isActive: true });
    setIsDialogOpen(true);
  };

  const openEditDialog = (user: User) => {
    setEditingUser(user);
    setFormData({ name: user.name, email: user.email, role: user.role, country: user.country, affiliation: user.affiliation, avatar: user.avatar || '', isActive: user.isActive });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.email) { toast.error('Nombre y email son requeridos'); return; }
    try {
      if (editingUser) {
        db.users.update(editingUser.id, formData);
        toast.success('Usuario actualizado');
      } else {
        db.users.create(formData);
        toast.success('Usuario creado');
      }
      setIsDialogOpen(false);
      loadUsers();
    } catch { toast.error('Error al guardar'); }
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Eliminar este usuario?')) {
      db.users.delete(id);
      toast.success('Usuario eliminado');
      loadUsers();
    }
  };

  const handleGenerateCertificate = (user: User) => {
    const events = db.events.getActive();
    if (events.length > 0) {
      generateParticipationCertificate(user, events[0]);
      toast.success('Certificado generado');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold">Gestión de Usuarios</h1>
            <p className="text-muted-foreground mt-1">Administra los usuarios de la plataforma</p>
          </div>
          <Button variant="hero" onClick={openCreateDialog}><Plus className="h-4 w-4" />Nuevo Usuario</Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(roleConfig).map(([role, config]) => (
            <Card key={role} className="bg-gradient-to-br from-muted/50 to-transparent">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${config.color}`}><config.icon className="h-5 w-5" /></div>
                  <div>
                    <p className="text-2xl font-bold font-display">{counts[role as keyof typeof counts]}</p>
                    <p className="text-xs text-muted-foreground">{config.label}s</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar por nombre o email..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
          </div>
        </div>

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
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Usuario</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Rol</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">País</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Estado</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Acciones</th>
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
                              <AvatarFallback className="bg-primary/10 text-primary font-medium">{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <span className="font-medium">{user.name}</span>
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4"><Badge variant="secondary" className={config.color}>{config.label}</Badge></td>
                        <td className="py-4 px-4 text-muted-foreground">{user.country}</td>
                        <td className="py-4 px-4"><Badge variant={user.isActive ? 'default' : 'secondary'}>{user.isActive ? 'Activo' : 'Inactivo'}</Badge></td>
                        <td className="py-4 px-4">
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openEditDialog(user)}><Edit className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => handleGenerateCertificate(user)} title="Generar Certificado">📄</Button>
                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(user.id)}><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle className="font-display">{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</DialogTitle></DialogHeader>
            <div className="space-y-4 my-4">
              <div className="flex justify-center">
                <ImageUploader value={formData.avatar} onChange={(url) => setFormData({ ...formData, avatar: url })} aspectRatio="square" className="w-32" placeholder="Foto" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Nombre *</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
                <div className="space-y-2"><Label>Email *</Label><Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Rol</Label><Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v as User['role'] })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{Object.entries(roleConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-2"><Label>País</Label><Select value={formData.country} onValueChange={(v) => setFormData({ ...formData, country: v })}><SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger><SelectContent>{countries.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
              </div>
              <div className="space-y-2"><Label>Afiliación</Label><Input value={formData.affiliation} onChange={(e) => setFormData({ ...formData, affiliation: e.target.value })} /></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button><Button variant="hero" onClick={handleSave}>Guardar</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
