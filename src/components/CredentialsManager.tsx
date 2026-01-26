import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { db, Event, User } from '@/lib/database';
import { IdCard, Download, Users, FileDown, Settings, Eye, Palette, QrCode } from 'lucide-react';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';

export interface CredentialConfig {
  orientation: 'portrait' | 'landscape';
  width: number;
  height: number;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  showPhoto: boolean;
  showQR: boolean;
  showRole: boolean;
  showAffiliation: boolean;
  showCountry: boolean;
  headerText: string;
  footerText: string;
  logoUrl?: string;
}

const defaultCredentialConfig: CredentialConfig = {
  orientation: 'portrait',
  width: 85.6,
  height: 53.98,
  primaryColor: '#1e40af',
  secondaryColor: '#059669',
  backgroundColor: '#ffffff',
  textColor: '#1e293b',
  showPhoto: true,
  showQR: true,
  showRole: true,
  showAffiliation: true,
  showCountry: false,
  headerText: '',
  footerText: '',
};

interface CredentialsManagerProps {
  event: Event;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 30, g: 64, b: 175 };
}

function generateCredential(user: User, event: Event, config: CredentialConfig): jsPDF {
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

  // Event name in header
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  const eventName = event.name.length > 40 ? event.name.substring(0, 37) + '...' : event.name;
  doc.text(eventName, width / 2, 7, { align: 'center' });

  // Photo placeholder area
  if (config.showPhoto) {
    doc.setFillColor(240, 240, 240);
    doc.roundedRect(width / 2 - 10, 15, 20, 24, 2, 2, 'F');
    doc.setDrawColor(secondaryRgb.r, secondaryRgb.g, secondaryRgb.b);
    doc.setLineWidth(0.5);
    doc.roundedRect(width / 2 - 10, 15, 20, 24, 2, 2, 'S');
    
    // If user has avatar, we'd add it here (simplified for demo)
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(5);
    doc.text('FOTO', width / 2, 28, { align: 'center' });
  }

  // Name
  let yPos = config.showPhoto ? 43 : 18;
  doc.setTextColor(textRgb.r, textRgb.g, textRgb.b);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  const name = user.name.length > 25 ? user.name.substring(0, 22) + '...' : user.name;
  doc.text(name, width / 2, yPos, { align: 'center' });

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
    const roleWidth = doc.getTextWidth(roleText) + 4;
    doc.roundedRect(width / 2 - roleWidth / 2, yPos - 3, roleWidth, 5, 1, 1, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(6);
    doc.text(roleText, width / 2, yPos, { align: 'center' });
  }

  // Affiliation
  if (config.showAffiliation && user.affiliation) {
    yPos += 6;
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(6);
    const affiliation = user.affiliation.length > 35 ? user.affiliation.substring(0, 32) + '...' : user.affiliation;
    doc.text(affiliation, width / 2, yPos, { align: 'center' });
  }

  // Country
  if (config.showCountry && user.country) {
    yPos += 4;
    doc.setFontSize(5);
    doc.text(user.country, width / 2, yPos, { align: 'center' });
  }

  // QR Code placeholder
  if (config.showQR) {
    doc.setFillColor(240, 240, 240);
    doc.rect(width - 12, height - 12, 10, 10, 'F');
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(4);
    doc.text('QR', width - 7, height - 6, { align: 'center' });
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
}

function generateAllCredentialsAsPDF(users: User[], event: Event, config: CredentialConfig): void {
  // Create A4 document to fit multiple credentials
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

  users.forEach((user, index) => {
    const pageIndex = Math.floor(index / perPage);
    const posOnPage = index % perPage;
    const col = posOnPage % cols;
    const row = Math.floor(posOnPage / cols);

    if (index > 0 && posOnPage === 0) {
      doc.addPage();
    }

    const x = margin + col * (credWidth + gap);
    const y = margin + row * (credHeight + gap);

    // Draw credential at position
    drawCredentialAt(doc, user, event, config, x, y);
  });

  const fileName = `Credenciales_${event.name.replace(/\s+/g, '_')}.pdf`;
  doc.save(fileName);
}

function drawCredentialAt(doc: jsPDF, user: User, event: Event, config: CredentialConfig, x: number, y: number): void {
  const primaryRgb = hexToRgb(config.primaryColor);
  const secondaryRgb = hexToRgb(config.secondaryColor);
  const textRgb = hexToRgb(config.textColor);
  
  const width = config.width;
  const height = config.height;

  // Border
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.rect(x, y, width, height, 'S');

  // Background
  doc.setFillColor(255, 255, 255);
  doc.rect(x, y, width, height, 'F');

  // Header bar
  doc.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  doc.rect(x, y, width, 12, 'F');

  // Event name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  const eventName = event.name.length > 40 ? event.name.substring(0, 37) + '...' : event.name;
  doc.text(eventName, x + width / 2, y + 7, { align: 'center' });

  // Photo area
  if (config.showPhoto) {
    doc.setFillColor(240, 240, 240);
    doc.roundedRect(x + width / 2 - 10, y + 15, 20, 24, 2, 2, 'F');
    doc.setDrawColor(secondaryRgb.r, secondaryRgb.g, secondaryRgb.b);
    doc.roundedRect(x + width / 2 - 10, y + 15, 20, 24, 2, 2, 'S');
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(5);
    doc.text('FOTO', x + width / 2, y + 28, { align: 'center' });
  }

  // Name
  let yPos = y + (config.showPhoto ? 43 : 18);
  doc.setTextColor(textRgb.r, textRgb.g, textRgb.b);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  const name = user.name.length > 25 ? user.name.substring(0, 22) + '...' : user.name;
  doc.text(name, x + width / 2, yPos, { align: 'center' });

  // Role
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
    doc.roundedRect(x + width / 2 - roleWidth / 2, yPos - 3, roleWidth, 5, 1, 1, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text(roleText, x + width / 2, yPos, { align: 'center' });
  }

  // Affiliation
  if (config.showAffiliation && user.affiliation) {
    yPos += 6;
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(6);
    const affiliation = user.affiliation.length > 35 ? user.affiliation.substring(0, 32) + '...' : user.affiliation;
    doc.text(affiliation, x + width / 2, yPos, { align: 'center' });
  }

  // Footer bar
  doc.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
  doc.rect(x, y + height - 4, width, 4, 'F');

  // ID
  const credentialId = `ID-${user.id.substring(0, 8).toUpperCase()}`;
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(4);
  doc.text(credentialId, x + 3, y + height - 1.5);
}

export function CredentialsManager({ event }: CredentialsManagerProps) {
  const [activeTab, setActiveTab] = useState('config');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  const [config, setConfig] = useState<CredentialConfig>({
    ...defaultCredentialConfig,
    primaryColor: event.primaryColor,
    secondaryColor: event.secondaryColor,
  });

  const allUsers = db.users.getAll();
  const eventAbstracts = db.abstracts.getByEvent(event.id);
  const participantIds = [...new Set(eventAbstracts.map(a => a.userId))];
  const eligibleUsers = allUsers.filter(u => participantIds.includes(u.id) || u.role !== 'USER');

  const handleSelectAll = () => {
    if (selectedUsers.length === eligibleUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(eligibleUsers.map(u => u.id));
    }
  };

  const handleToggleUser = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleGenerateSingle = (user: User) => {
    try {
      const doc = generateCredential(user, event, config);
      doc.save(`Credencial_${user.name.replace(/\s+/g, '_')}.pdf`);
      toast.success(`Credencial generada para ${user.name}`);
    } catch {
      toast.error('Error al generar la credencial');
    }
  };

  const handleExportAll = async () => {
    if (selectedUsers.length === 0) {
      toast.error('Selecciona al menos un usuario');
      return;
    }

    setIsExporting(true);
    try {
      const usersToExport = eligibleUsers.filter(u => selectedUsers.includes(u.id));
      generateAllCredentialsAsPDF(usersToExport, event, config);
      toast.success(`${usersToExport.length} credenciales exportadas en un solo PDF`);
    } catch {
      toast.error('Error al exportar las credenciales');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePreview = () => {
    const sampleUser: User = {
      id: 'preview',
      name: 'Dr. Juan Pérez García',
      email: 'juan@example.com',
      role: 'USER',
      country: 'España',
      affiliation: 'Universidad de Madrid',
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    
    const doc = generateCredential(sampleUser, event, config);
    doc.save('Credencial_Vista_Previa.pdf');
    toast.success('Vista previa generada');
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="config" className="gap-2">
            <Settings className="h-4 w-4" />
            Configuración
          </TabsTrigger>
          <TabsTrigger value="design" className="gap-2">
            <Palette className="h-4 w-4" />
            Diseño
          </TabsTrigger>
          <TabsTrigger value="generate" className="gap-2">
            <Users className="h-4 w-4" />
            Generar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Formato de Credencial</CardTitle>
              <CardDescription>Configura el tamaño y orientación</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Orientación</Label>
                  <Select
                    value={config.orientation}
                    onValueChange={(value: 'portrait' | 'landscape') => setConfig({ ...config, orientation: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="portrait">Vertical</SelectItem>
                      <SelectItem value="landscape">Horizontal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Ancho (mm)</Label>
                  <Input
                    type="number"
                    value={config.width}
                    onChange={(e) => setConfig({ ...config, width: parseFloat(e.target.value) || 85.6 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Alto (mm)</Label>
                  <Input
                    type="number"
                    value={config.height}
                    onChange={(e) => setConfig({ ...config, height: parseFloat(e.target.value) || 53.98 })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Elementos a Mostrar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <Label>Foto del participante</Label>
                  <Switch
                    checked={config.showPhoto}
                    onCheckedChange={(checked) => setConfig({ ...config, showPhoto: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Código QR</Label>
                  <Switch
                    checked={config.showQR}
                    onCheckedChange={(checked) => setConfig({ ...config, showQR: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Rol/Categoría</Label>
                  <Switch
                    checked={config.showRole}
                    onCheckedChange={(checked) => setConfig({ ...config, showRole: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Afiliación</Label>
                  <Switch
                    checked={config.showAffiliation}
                    onCheckedChange={(checked) => setConfig({ ...config, showAffiliation: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>País</Label>
                  <Switch
                    checked={config.showCountry}
                    onCheckedChange={(checked) => setConfig({ ...config, showCountry: checked })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="design" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Colores</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Color Primario</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={config.primaryColor}
                      onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                      className="w-12 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      value={config.primaryColor}
                      onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Color Secundario</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={config.secondaryColor}
                      onChange={(e) => setConfig({ ...config, secondaryColor: e.target.value })}
                      className="w-12 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      value={config.secondaryColor}
                      onChange={(e) => setConfig({ ...config, secondaryColor: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <Button variant="outline" onClick={handlePreview} className="w-full">
                <Eye className="h-4 w-4 mr-2" />
                Generar Vista Previa
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="generate" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Seleccionar Participantes</CardTitle>
                  <CardDescription>{eligibleUsers.length} usuarios disponibles</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleSelectAll}>
                    {selectedUsers.length === eligibleUsers.length ? 'Deseleccionar' : 'Seleccionar'} todos
                  </Button>
                  <Badge variant="secondary">{selectedUsers.length} seleccionados</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {eligibleUsers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay usuarios registrados para este evento</p>
                </div>
              ) : (
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {eligibleUsers.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={selectedUsers.includes(user.id)}
                            onCheckedChange={() => handleToggleUser(user.id)}
                          />
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{user.role}</Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleGenerateSingle(user)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}

              <div className="flex gap-2 mt-4">
                <Button
                  variant="hero"
                  className="flex-1"
                  onClick={handleExportAll}
                  disabled={selectedUsers.length === 0 || isExporting}
                >
                  <FileDown className="h-4 w-4 mr-2" />
                  {isExporting ? 'Exportando...' : `Exportar ${selectedUsers.length} Credenciales (PDF)`}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
