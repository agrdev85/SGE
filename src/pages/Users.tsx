import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { db, User, Event } from '@/lib/database';
import { Search, Users as UsersIcon, UserCheck, ClipboardCheck, Shield, Plus, Edit, Trash2, FileDown, Award, IdCard } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageUploader } from '@/components/ImageUploader';
import { toast } from 'sonner';
import { 
  generateParticipationCertificate, 
  generateAllCertificatesAsPDF,
  CertificateConfig,
  defaultCertificateConfig,
  generateAndSaveCertificate,
} from '@/lib/certificateGenerator';
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

const roleConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  USER: { label: 'Participante', color: 'bg-primary/10 text-primary', icon: UsersIcon },
  REVIEWER: { label: 'Revisor', color: 'bg-info/10 text-info', icon: ClipboardCheck },
  COMMITTEE: { label: 'Comité', color: 'bg-accent/10 text-accent', icon: UserCheck },
  ADMIN: { label: 'Admin', color: 'bg-warning/10 text-warning', icon: Shield },
};

const countries = ['Cuba', 'México', 'Argentina', 'España', 'Colombia', 'Chile', 'Perú', 'Venezuela', 'Brasil', 'Estados Unidos'];

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : { r: 30, g: 64, b: 175 };
}

async function generateQRDataUrl(data: string): Promise<string> {
  try {
    return await QRCode.toDataURL(data, { width: 100, margin: 1 });
  } catch {
    return '';
  }
}

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

  const getEventAndConfig = (): { event: Event; config: CertificateConfig } | null => {
    const events = db.events.getActive();
    if (events.length === 0) {
      toast.error('No hay eventos activos');
      return null;
    }
    const event = events[0];
    
    // Load saved config for this event
    const savedConfigKey = `certificate_config_${event.id}`;
    const savedConfig = localStorage.getItem(savedConfigKey);
    const config = savedConfig ? JSON.parse(savedConfig) : {
      ...defaultCertificateConfig,
      primaryColor: event.primaryColor,
      secondaryColor: event.secondaryColor,
    };
    
    return { event, config };
  };

  const handleGenerateCertificate = (user: User) => {
    const result = getEventAndConfig();
    if (!result) return;
    
    const { event, config } = result;
    
    generateAndSaveCertificate({
      participantName: user.name,
      eventName: event.name,
      eventDate: `${formatDate(event.startDate)} al ${formatDate(event.endDate)}`,
      certificateType: 'participation',
      primaryColor: config.primaryColor,
      secondaryColor: config.secondaryColor,
      config,
    });
    toast.success('Certificado generado con la configuración guardada');
  };

  const handleGenerateCredential = async (user: User) => {
    const events = db.events.getActive();
    if (events.length === 0) {
      toast.error('No hay eventos activos');
      return;
    }
    const event = events[0];

    // Load saved credential config
    const savedConfigKey = `credential_config_${event.id}`;
    const savedConfig = localStorage.getItem(savedConfigKey);
    const config = savedConfig ? JSON.parse(savedConfig) : {
      orientation: 'portrait',
      width: 85.6,
      height: 53.98,
      primaryColor: event.primaryColor,
      secondaryColor: event.secondaryColor,
      textColor: '#1e293b',
      showPhoto: true,
      showQR: true,
      showRole: true,
      showAffiliation: true,
      showCountry: false,
      qrDataFields: ['name', 'email', 'event'],
    };

    try {
      const doc = await generateSingleCredential(user, event, config);
      doc.save(`Credencial_${user.name.replace(/\s+/g, '_')}.pdf`);
      toast.success('Credencial generada con la configuración guardada');
    } catch {
      toast.error('Error al generar la credencial');
    }
  };

  const generateSingleCredential = async (user: User, event: Event, config: any): Promise<jsPDF> => {
    const primaryRgb = hexToRgb(config.primaryColor);
    const secondaryRgb = hexToRgb(config.secondaryColor);
    const textRgb = hexToRgb(config.textColor);
    
    const doc = new jsPDF({
      orientation: config.orientation,
      unit: 'mm',
      format: [config.width, config.height],
    });

    const width = doc.internal.pageSize.getWidth();
    const height = doc.internal.pageSize.getHeight();

    // Background
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, width, height, 'F');

    // Header bar
    doc.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    doc.rect(0, 0, width, 12, 'F');

    // Event name - FULL
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    const splitName = doc.splitTextToSize(event.name, width - 6);
    doc.text(splitName, width / 2, 5, { align: 'center' });

    // Photo placeholder
    if (config.showPhoto) {
      doc.setFillColor(240, 240, 240);
      doc.roundedRect(width / 2 - 10, 15, 20, 24, 2, 2, 'F');
      doc.setDrawColor(secondaryRgb.r, secondaryRgb.g, secondaryRgb.b);
      doc.setLineWidth(0.5);
      doc.roundedRect(width / 2 - 10, 15, 20, 24, 2, 2, 'S');
      doc.setTextColor(150, 150, 150);
      doc.setFontSize(5);
      doc.text('FOTO', width / 2, 28, { align: 'center' });
    }

    // Name
    let yPos = config.showPhoto ? 43 : 18;
    doc.setTextColor(textRgb.r, textRgb.g, textRgb.b);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(user.name, width / 2, yPos, { align: 'center' });

    // Role badge
    if (config.showRole) {
      yPos += 5;
      const roleLabels: Record<string, string> = {
        USER: 'Participante',
        REVIEWER: 'Revisor',
        COMMITTEE: 'Comité',
        ADMIN: 'Organizador',
      };
      doc.setFillColor(secondaryRgb.r, secondaryRgb.g, secondaryRgb.b);
      const roleText = roleLabels[user.role] || user.role;
      doc.setFontSize(6);
      const roleWidth = doc.getTextWidth(roleText) + 4;
      doc.roundedRect(width / 2 - roleWidth / 2, yPos - 3, roleWidth, 5, 1, 1, 'F');
      doc.setTextColor(255, 255, 255);
      doc.text(roleText, width / 2, yPos, { align: 'center' });
    }

    // Affiliation
    if (config.showAffiliation && user.affiliation) {
      yPos += 6;
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(6);
      doc.text(user.affiliation, width / 2, yPos, { align: 'center' });
    }

    // Country
    if (config.showCountry && user.country) {
      yPos += 4;
      doc.setFontSize(5);
      doc.text(user.country, width / 2, yPos, { align: 'center' });
    }

    // QR Code
    if (config.showQR) {
      const qrData: Record<string, string> = {};
      (config.qrDataFields || ['name', 'email']).forEach((field: string) => {
        switch (field) {
          case 'name': qrData.name = user.name; break;
          case 'email': qrData.email = user.email; break;
          case 'role': qrData.role = user.role; break;
          case 'affiliation': qrData.affiliation = user.affiliation || ''; break;
          case 'country': qrData.country = user.country || ''; break;
          case 'event': qrData.event = event.name; break;
          case 'id': qrData.id = user.id; break;
        }
      });
      
      try {
        const qrDataUrl = await generateQRDataUrl(JSON.stringify(qrData));
        if (qrDataUrl) {
          doc.addImage(qrDataUrl, 'PNG', width - 14, height - 14, 12, 12);
        }
      } catch {
        doc.setFillColor(240, 240, 240);
        doc.rect(width - 12, height - 12, 10, 10, 'F');
      }
    }

    // Footer bar
    doc.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    doc.rect(0, height - 4, width, 4, 'F');

    // Credential ID
    const credentialId = `ID-${user.id.substring(0, 8).toUpperCase()}`;
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(4);
    doc.text(credentialId, 3, height - 1.5);

    return doc;
  };

  const handleExportAllCertificates = () => {
    const result = getEventAndConfig();
    if (!result) return;
    
    const { event, config } = result;
    const activeUsers = users.filter(u => u.isActive);
    
    if (activeUsers.length === 0) {
      toast.error('No hay usuarios activos');
      return;
    }
    
    generateAllCertificatesAsPDF(activeUsers, event, 'participation', undefined, config);
    toast.success(`${activeUsers.length} certificados exportados con la configuración guardada`);
  };

  const handleExportAllCredentials = async () => {
    const events = db.events.getActive();
    if (events.length === 0) {
      toast.error('No hay eventos activos');
      return;
    }
    const event = events[0];

    const savedConfigKey = `credential_config_${event.id}`;
    const savedConfig = localStorage.getItem(savedConfigKey);
    const config = savedConfig ? JSON.parse(savedConfig) : {
      orientation: 'portrait',
      width: 85.6,
      height: 53.98,
      primaryColor: event.primaryColor,
      secondaryColor: event.secondaryColor,
      textColor: '#1e293b',
      showPhoto: true,
      showQR: true,
      showRole: true,
      showAffiliation: true,
      showCountry: false,
      qrDataFields: ['name', 'email', 'event'],
    };

    const activeUsers = users.filter(u => u.isActive);
    if (activeUsers.length === 0) {
      toast.error('No hay usuarios activos');
      return;
    }

    try {
      await generateAllCredentialsPDF(activeUsers, event, config);
      toast.success(`${activeUsers.length} credenciales exportadas con la configuración guardada`);
    } catch {
      toast.error('Error al exportar las credenciales');
    }
  };

  const generateAllCredentialsPDF = async (usersToExport: User[], event: Event, config: any): Promise<void> => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const credWidth = config.width;
    const credHeight = config.height;
    const margin = 10;
    const gap = 5;

    const cols = Math.floor((pageWidth - 2 * margin + gap) / (credWidth + gap));
    const rows = Math.floor((pageHeight - 2 * margin + gap) / (credHeight + gap));
    const perPage = cols * rows;

    const primaryRgb = hexToRgb(config.primaryColor);
    const secondaryRgb = hexToRgb(config.secondaryColor);
    const textRgb = hexToRgb(config.textColor);

    for (let i = 0; i < usersToExport.length; i++) {
      const user = usersToExport[i];
      const posOnPage = i % perPage;
      const col = posOnPage % cols;
      const row = Math.floor(posOnPage / cols);

      if (i > 0 && posOnPage === 0) {
        doc.addPage();
      }

      const x = margin + col * (credWidth + gap);
      const y = margin + row * (credHeight + gap);

      // Draw credential
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.rect(x, y, credWidth, credHeight, 'S');
      doc.setFillColor(255, 255, 255);
      doc.rect(x, y, credWidth, credHeight, 'F');

      // Header
      doc.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
      doc.rect(x, y, credWidth, 12, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(6);
      doc.setFont('helvetica', 'bold');
      const splitName = doc.splitTextToSize(event.name, credWidth - 4);
      doc.text(splitName, x + credWidth / 2, y + 4, { align: 'center' });

      // Photo
      if (config.showPhoto) {
        doc.setFillColor(240, 240, 240);
        doc.roundedRect(x + credWidth / 2 - 10, y + 15, 20, 24, 2, 2, 'F');
        doc.setDrawColor(secondaryRgb.r, secondaryRgb.g, secondaryRgb.b);
        doc.roundedRect(x + credWidth / 2 - 10, y + 15, 20, 24, 2, 2, 'S');
        doc.setTextColor(150, 150, 150);
        doc.setFontSize(5);
        doc.text('FOTO', x + credWidth / 2, y + 28, { align: 'center' });
      }

      // Name
      let yPos = y + (config.showPhoto ? 43 : 18);
      doc.setTextColor(textRgb.r, textRgb.g, textRgb.b);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(user.name, x + credWidth / 2, yPos, { align: 'center' });

      // Role
      if (config.showRole) {
        yPos += 5;
        const roleLabels: Record<string, string> = { USER: 'Participante', REVIEWER: 'Revisor', COMMITTEE: 'Comité', ADMIN: 'Organizador' };
        doc.setFillColor(secondaryRgb.r, secondaryRgb.g, secondaryRgb.b);
        const roleText = roleLabels[user.role] || user.role;
        doc.setFontSize(6);
        const roleWidth = doc.getTextWidth(roleText) + 4;
        doc.roundedRect(x + credWidth / 2 - roleWidth / 2, yPos - 3, roleWidth, 5, 1, 1, 'F');
        doc.setTextColor(255, 255, 255);
        doc.text(roleText, x + credWidth / 2, yPos, { align: 'center' });
      }

      // Affiliation
      if (config.showAffiliation && user.affiliation) {
        yPos += 6;
        doc.setTextColor(100, 100, 100);
        doc.setFontSize(6);
        doc.text(user.affiliation, x + credWidth / 2, yPos, { align: 'center' });
      }

      // QR
      if (config.showQR) {
        const qrData: Record<string, string> = {};
        (config.qrDataFields || ['name', 'email']).forEach((field: string) => {
          switch (field) {
            case 'name': qrData.name = user.name; break;
            case 'email': qrData.email = user.email; break;
            case 'role': qrData.role = user.role; break;
            case 'affiliation': qrData.affiliation = user.affiliation || ''; break;
            case 'country': qrData.country = user.country || ''; break;
            case 'event': qrData.event = event.name; break;
            case 'id': qrData.id = user.id; break;
          }
        });
        
        try {
          const qrDataUrl = await generateQRDataUrl(JSON.stringify(qrData));
          if (qrDataUrl) {
            doc.addImage(qrDataUrl, 'PNG', x + credWidth - 13, y + credHeight - 13, 10, 10);
          }
        } catch {
          doc.setFillColor(240, 240, 240);
          doc.rect(x + credWidth - 12, y + credHeight - 12, 10, 10, 'F');
        }
      }

      // Footer
      doc.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
      doc.rect(x, y + credHeight - 4, credWidth, 4, 'F');
      const credentialId = `ID-${user.id.substring(0, 8).toUpperCase()}`;
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(4);
      doc.text(credentialId, x + 3, y + credHeight - 1.5);
    }

    const fileName = `Credenciales_${event.name.replace(/\s+/g, '_')}.pdf`;
    doc.save(fileName);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold">Gestión de Usuarios</h1>
            <p className="text-muted-foreground mt-1">Administra los usuarios de la plataforma</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={handleExportAllCredentials}>
              <IdCard className="h-4 w-4 mr-1" />
              Exportar Credenciales
            </Button>
            <Button variant="outline" onClick={handleExportAllCertificates}>
              <FileDown className="h-4 w-4 mr-1" />
              Exportar Certificados
            </Button>
            <Button variant="hero" onClick={openCreateDialog}><Plus className="h-4 w-4" />Nuevo Usuario</Button>
          </div>
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
                            <Button variant="ghost" size="icon" onClick={() => openEditDialog(user)} title="Editar">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleGenerateCertificate(user)} title="Generar Certificado">
                              <Award className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleGenerateCredential(user)} title="Generar Credencial">
                              <IdCard className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(user.id)} title="Eliminar">
                              <Trash2 className="h-4 w-4" />
                            </Button>
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

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
}
