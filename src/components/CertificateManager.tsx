import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { db, Event, User, Abstract } from '@/lib/database';
import {
  CertificateConfig,
  defaultCertificateConfig,
  generateAndSaveCertificate,
  generateAllCertificatesAsPDF,
} from '@/lib/certificateGenerator';
import { Award, Download, Users, FileDown, Settings, Eye, Palette } from 'lucide-react';
import { toast } from 'sonner';

interface CertificateManagerProps {
  event: Event;
}

export function CertificateManager({ event }: CertificateManagerProps) {
  const [activeTab, setActiveTab] = useState('config');
  const [certificateType, setCertificateType] = useState<'participation' | 'presentation' | 'reviewer'>('participation');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  const [config, setConfig] = useState<CertificateConfig>({
    ...defaultCertificateConfig,
    primaryColor: event.primaryColor,
    secondaryColor: event.secondaryColor,
  });

  // Get users based on certificate type
  const getEligibleUsers = (): User[] => {
    const allUsers = db.users.getAll();
    const eventAbstracts = db.abstracts.getByEvent(event.id);

    switch (certificateType) {
      case 'participation':
        // All users who have submitted to this event
        const participantIds = [...new Set(eventAbstracts.map(a => a.userId))];
        return allUsers.filter(u => participantIds.includes(u.id));
      case 'presentation':
        // Users with approved abstracts
        const presenterIds = [...new Set(
          eventAbstracts.filter(a => a.status === 'APROBADO').map(a => a.userId)
        )];
        return allUsers.filter(u => presenterIds.includes(u.id));
      case 'reviewer':
        return allUsers.filter(u => u.role === 'REVIEWER');
      default:
        return [];
    }
  };

  const eligibleUsers = getEligibleUsers();
  const eventAbstracts = db.abstracts.getByEvent(event.id);

  const handleSelectAll = () => {
    if (selectedUsers.length === eligibleUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(eligibleUsers.map(u => u.id));
    }
  };

  const handleToggleUser = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleGenerateSingle = (user: User) => {
    try {
      const abstracts = certificateType === 'presentation'
        ? eventAbstracts.filter(a => a.userId === user.id && a.status === 'APROBADO')
        : undefined;

      generateAndSaveCertificate({
        participantName: user.name,
        eventName: event.name,
        eventDate: `${formatDate(event.startDate)} al ${formatDate(event.endDate)}`,
        certificateType,
        abstractTitle: abstracts?.[0]?.title,
        categoryType: abstracts?.[0]?.categoryType,
        primaryColor: config.primaryColor,
        secondaryColor: config.secondaryColor,
        config,
      });

      toast.success(`Certificado generado para ${user.name}`);
    } catch (error) {
      toast.error('Error al generar el certificado');
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
      const abstracts = certificateType === 'presentation' ? eventAbstracts : undefined;

      generateAllCertificatesAsPDF(
        usersToExport,
        event,
        certificateType,
        abstracts,
        config
      );

      toast.success(`${usersToExport.length} certificados exportados en un solo PDF`);
    } catch (error) {
      toast.error('Error al exportar los certificados');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePreview = () => {
    const sampleData = {
      participantName: 'Dr. Juan Pérez García',
      eventName: event.name,
      eventDate: `${formatDate(event.startDate)} al ${formatDate(event.endDate)}`,
      certificateType,
      abstractTitle: certificateType === 'presentation' ? 'Título de ejemplo del trabajo de investigación' : undefined,
      categoryType: certificateType === 'presentation' ? 'Ponencia' : undefined,
      primaryColor: config.primaryColor,
      secondaryColor: config.secondaryColor,
      config,
    };

    generateAndSaveCertificate(sampleData);
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

        {/* Configuration Tab */}
        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tipo de Certificado</CardTitle>
              <CardDescription>Selecciona el tipo de certificado a generar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                {[
                  { value: 'participation', label: 'Participación', desc: 'Para asistentes', icon: Users },
                  { value: 'presentation', label: 'Presentación', desc: 'Para ponentes', icon: Award },
                  { value: 'reviewer', label: 'Revisor', desc: 'Para jurados', icon: FileDown },
                ].map((type) => (
                  <div
                    key={type.value}
                    onClick={() => setCertificateType(type.value as any)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      certificateType === type.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <type.icon className={`h-8 w-8 mb-2 ${
                      certificateType === type.value ? 'text-primary' : 'text-muted-foreground'
                    }`} />
                    <h4 className="font-semibold">{type.label}</h4>
                    <p className="text-xs text-muted-foreground">{type.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contenido del Certificado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Título Principal</Label>
                  <Input
                    value={config.title}
                    onChange={(e) => setConfig({ ...config, title: e.target.value })}
                    placeholder="CERTIFICADO"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Subtítulo (opcional)</Label>
                  <Input
                    value={config.subtitle}
                    onChange={(e) => setConfig({ ...config, subtitle: e.target.value })}
                    placeholder="DE PARTICIPACIÓN"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Texto de encabezado</Label>
                <Input
                  value={config.headerText}
                  onChange={(e) => setConfig({ ...config, headerText: e.target.value })}
                  placeholder="Se certifica que"
                />
              </div>

              <div className="space-y-2">
                <Label>Texto del cuerpo</Label>
                <Textarea
                  value={config.bodyTemplate}
                  onChange={(e) => setConfig({ ...config, bodyTemplate: e.target.value })}
                  placeholder="ha participado en el evento"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Texto del pie de página</Label>
                <Input
                  value={config.footerText}
                  onChange={(e) => setConfig({ ...config, footerText: e.target.value })}
                  placeholder="Este certificado ha sido generado electrónicamente..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nombre del firmante</Label>
                  <Input
                    value={config.signerName || ''}
                    onChange={(e) => setConfig({ ...config, signerName: e.target.value })}
                    placeholder="Dr. Nombre Apellido"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cargo del firmante</Label>
                  <Input
                    value={config.signerTitle || ''}
                    onChange={(e) => setConfig({ ...config, signerTitle: e.target.value })}
                    placeholder="Director del Comité Científico"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Design Tab */}
        <TabsContent value="design" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Colores y Estilo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
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
                <div className="space-y-2">
                  <Label>Color de Texto</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={config.textColor}
                      onChange={(e) => setConfig({ ...config, textColor: e.target.value })}
                      className="w-12 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      value={config.textColor}
                      onChange={(e) => setConfig({ ...config, textColor: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Orientación</Label>
                  <Select
                    value={config.orientation}
                    onValueChange={(value: 'landscape' | 'portrait') => setConfig({ ...config, orientation: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="landscape">Horizontal</SelectItem>
                      <SelectItem value="portrait">Vertical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Formato de Página</Label>
                  <Select
                    value={config.format}
                    onValueChange={(value: 'a4' | 'letter' | 'legal') => setConfig({ ...config, format: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="a4">A4</SelectItem>
                      <SelectItem value="letter">Carta</SelectItem>
                      <SelectItem value="legal">Legal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <Label>Mostrar Borde</Label>
                  <p className="text-xs text-muted-foreground">Añade un borde decorativo al certificado</p>
                </div>
                <Switch
                  checked={config.showBorder}
                  onCheckedChange={(checked) => setConfig({ ...config, showBorder: checked })}
                />
              </div>

              {config.showBorder && (
                <div className="space-y-2">
                  <Label>Estilo del Borde</Label>
                  <Select
                    value={config.borderStyle}
                    onValueChange={(value: 'solid' | 'double' | 'dashed') => setConfig({ ...config, borderStyle: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="solid">Sólido</SelectItem>
                      <SelectItem value="double">Doble</SelectItem>
                      <SelectItem value="dashed">Discontinuo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Button variant="outline" onClick={handlePreview} className="w-full">
                <Eye className="h-4 w-4 mr-2" />
                Generar Vista Previa
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Generate Tab */}
        <TabsContent value="generate" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Seleccionar Destinatarios</CardTitle>
                  <CardDescription>
                    {eligibleUsers.length} usuarios elegibles para certificado de{' '}
                    {certificateType === 'participation' ? 'participación' : 
                     certificateType === 'presentation' ? 'presentación' : 'revisor'}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleSelectAll}>
                    {selectedUsers.length === eligibleUsers.length ? 'Deseleccionar' : 'Seleccionar'} todos
                  </Button>
                  <Badge variant="secondary">
                    {selectedUsers.length} seleccionados
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {eligibleUsers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay usuarios elegibles para este tipo de certificado</p>
                </div>
              ) : (
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {eligibleUsers.map((user) => {
                      const userAbstract = certificateType === 'presentation'
                        ? eventAbstracts.find(a => a.userId === user.id && a.status === 'APROBADO')
                        : null;

                      return (
                        <div
                          key={user.id}
                          className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50"
                        >
                          <div className="flex items-center gap-3">
                            <Checkbox
                              checked={selectedUsers.includes(user.id)}
                              onCheckedChange={() => handleToggleUser(user.id)}
                            />
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              {user.avatar ? (
                                <img src={user.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
                              ) : (
                                <span className="font-semibold text-primary">{user.name.charAt(0)}</span>
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-xs text-muted-foreground">{user.affiliation}</p>
                              {userAbstract && (
                                <Badge variant="outline" className="mt-1 text-xs">
                                  {userAbstract.categoryType}: {userAbstract.title.slice(0, 30)}...
                                </Badge>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleGenerateSingle(user)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button
              className="flex-1"
              size="lg"
              onClick={handleExportAll}
              disabled={selectedUsers.length === 0 || isExporting}
            >
              <FileDown className="h-5 w-5 mr-2" />
              {isExporting
                ? 'Exportando...'
                : `Exportar ${selectedUsers.length} Certificados (PDF único)`}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
