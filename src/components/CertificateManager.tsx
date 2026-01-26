import { useState, useEffect, useRef } from 'react';
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
import { db, Event, User } from '@/lib/database';
import {
  CertificateConfig,
  defaultCertificateConfig,
  generateAndSaveCertificate,
  generateAllCertificatesAsPDF,
} from '@/lib/certificateGenerator';
import { Award, Download, Users, FileDown, Settings, Palette, GripVertical, Image, Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { ImageUploader } from './ImageUploader';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface CertificateManagerProps {
  event: Event;
}

interface CertificateField {
  id: string;
  type: 'title' | 'subtitle' | 'header' | 'body' | 'footer' | 'signer_name' | 'signer_title' | 'logo';
  label: string;
  value: string;
  position: 'header' | 'body' | 'footer';
  enabled: boolean;
}

const defaultFields: CertificateField[] = [
  { id: 'title', type: 'title', label: 'Título Principal', value: 'CERTIFICADO', position: 'header', enabled: true },
  { id: 'subtitle', type: 'subtitle', label: 'Subtítulo', value: '', position: 'header', enabled: true },
  { id: 'logo_header', type: 'logo', label: 'Logo en Encabezado', value: '', position: 'header', enabled: false },
  { id: 'header_text', type: 'header', label: 'Texto de Encabezado', value: 'Se certifica que', position: 'body', enabled: true },
  { id: 'body_text', type: 'body', label: 'Texto del Cuerpo', value: 'ha participado en el evento', position: 'body', enabled: true },
  { id: 'logo_body', type: 'logo', label: 'Logo en Cuerpo', value: '', position: 'body', enabled: false },
  { id: 'signer_name', type: 'signer_name', label: 'Nombre del Firmante', value: '', position: 'footer', enabled: true },
  { id: 'signer_title', type: 'signer_title', label: 'Cargo del Firmante', value: '', position: 'footer', enabled: true },
  { id: 'footer_text', type: 'footer', label: 'Texto de Pie', value: 'Este certificado ha sido generado electrónicamente y es válido sin firma.', position: 'footer', enabled: true },
  { id: 'logo_footer', type: 'logo', label: 'Logo en Pie', value: '', position: 'footer', enabled: false },
];

function SortableField({ field, onUpdate, onRemove }: { 
  field: CertificateField; 
  onUpdate: (id: string, updates: Partial<CertificateField>) => void;
  onRemove: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: field.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-3 rounded-lg border transition-all ${field.enabled ? 'bg-card' : 'bg-muted/50 opacity-60'}`}
    >
      <div className="flex items-start gap-3">
        <div {...attributes} {...listeners} className="cursor-grab mt-1">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">{field.label}</Label>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {field.position === 'header' ? 'Encabezado' : field.position === 'body' ? 'Cuerpo' : 'Pie'}
              </Badge>
              <Switch
                checked={field.enabled}
                onCheckedChange={(checked) => onUpdate(field.id, { enabled: checked })}
              />
            </div>
          </div>
          {field.enabled && (
            field.type === 'logo' ? (
              <ImageUploader
                value={field.value}
                onChange={(url) => onUpdate(field.id, { value: url })}
                aspectRatio="auto"
                className="max-w-[200px]"
                placeholder="Subir logo"
              />
            ) : field.type === 'body' || field.type === 'footer' ? (
              <Textarea
                value={field.value}
                onChange={(e) => onUpdate(field.id, { value: e.target.value })}
                rows={2}
                className="text-sm"
              />
            ) : (
              <Input
                value={field.value}
                onChange={(e) => onUpdate(field.id, { value: e.target.value })}
                className="text-sm"
              />
            )
          )}
        </div>
      </div>
    </div>
  );
}

export function CertificateManager({ event }: CertificateManagerProps) {
  const [activeTab, setActiveTab] = useState('config');
  const [certificateType, setCertificateType] = useState<'participation' | 'presentation' | 'reviewer'>('participation');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [isSaved, setIsSaved] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Load saved config from localStorage
  const savedConfigKey = `certificate_config_${event.id}`;
  const savedFieldsKey = `certificate_fields_${event.id}`;

  const [config, setConfig] = useState<CertificateConfig>(() => {
    const saved = localStorage.getItem(savedConfigKey);
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      ...defaultCertificateConfig,
      primaryColor: event.primaryColor,
      secondaryColor: event.secondaryColor,
    };
  });

  const [fields, setFields] = useState<CertificateField[]>(() => {
    const saved = localStorage.getItem(savedFieldsKey);
    if (saved) {
      return JSON.parse(saved);
    }
    return defaultFields;
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Update config when fields change
  useEffect(() => {
    const titleField = fields.find(f => f.id === 'title');
    const subtitleField = fields.find(f => f.id === 'subtitle');
    const headerField = fields.find(f => f.id === 'header_text');
    const bodyField = fields.find(f => f.id === 'body_text');
    const footerField = fields.find(f => f.id === 'footer_text');
    const signerNameField = fields.find(f => f.id === 'signer_name');
    const signerTitleField = fields.find(f => f.id === 'signer_title');
    const logoHeaderField = fields.find(f => f.id === 'logo_header');

    setConfig(prev => ({
      ...prev,
      title: titleField?.enabled ? titleField.value : prev.title,
      subtitle: subtitleField?.enabled ? subtitleField.value : '',
      headerText: headerField?.enabled ? headerField.value : prev.headerText,
      bodyTemplate: bodyField?.enabled ? bodyField.value : prev.bodyTemplate,
      footerText: footerField?.enabled ? footerField.value : prev.footerText,
      signerName: signerNameField?.enabled ? signerNameField.value : '',
      signerTitle: signerTitleField?.enabled ? signerTitleField.value : '',
      logoUrl: logoHeaderField?.enabled ? logoHeaderField.value : undefined,
    }));
    setIsSaved(false);
  }, [fields]);

  // Draw real-time preview
  useEffect(() => {
    if (activeTab !== 'design') return;
    drawPreview();
  }, [config, activeTab, certificateType]);

  const drawPreview = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isLandscape = config.orientation === 'landscape';
    const width = isLandscape ? 842 : 595;
    const height = isLandscape ? 595 : 842;
    canvas.width = width;
    canvas.height = height;

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Header bar
    ctx.fillStyle = config.primaryColor;
    ctx.fillRect(0, 0, width, height * 0.15);

    // Secondary accent
    ctx.fillStyle = config.secondaryColor;
    ctx.fillRect(0, height * 0.14, width, height * 0.02);

    // Footer bar
    ctx.fillStyle = config.primaryColor;
    ctx.fillRect(0, height - height * 0.08, width, height * 0.08);
    ctx.fillStyle = config.secondaryColor;
    ctx.fillRect(0, height - height * 0.1, width, height * 0.02);

    // Border
    if (config.showBorder) {
      ctx.strokeStyle = config.primaryColor;
      ctx.lineWidth = config.borderStyle === 'double' ? 4 : 2;
      if (config.borderStyle === 'dashed') {
        ctx.setLineDash([10, 5]);
      } else {
        ctx.setLineDash([]);
      }
      ctx.strokeRect(30, height * 0.18, width - 60, height * 0.7);
    }

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(config.title, width / 2, height * 0.08);

    // Certificate type
    const typeLabel = {
      'participation': 'DE PARTICIPACIÓN',
      'presentation': 'DE PRESENTACIÓN',
      'reviewer': 'DE REVISOR CIENTÍFICO',
      'custom': config.subtitle || 'ESPECIAL',
    }[certificateType];
    ctx.font = '20px Arial';
    ctx.fillText(typeLabel, width / 2, height * 0.12);

    // Header text
    ctx.fillStyle = config.textColor;
    ctx.font = '18px Arial';
    ctx.fillText(config.headerText, width / 2, height * 0.25);

    // Sample name
    ctx.fillStyle = config.primaryColor;
    ctx.font = 'bold 36px Arial';
    ctx.fillText('Dr. Juan Pérez García', width / 2, height * 0.33);

    // Body text
    ctx.fillStyle = config.textColor;
    ctx.font = '18px Arial';
    ctx.fillText(config.bodyTemplate, width / 2, height * 0.42);

    // Event name
    ctx.fillStyle = config.primaryColor;
    ctx.font = 'bold 24px Arial';
    const eventName = event.name.length > 50 ? event.name.substring(0, 47) + '...' : event.name;
    ctx.fillText(eventName, width / 2, height * 0.52);

    // Date
    ctx.fillStyle = '#64748b';
    ctx.font = '16px Arial';
    ctx.fillText(`Celebrado del ${formatDate(event.startDate)} al ${formatDate(event.endDate)}`, width / 2, height * 0.58);

    // Signature line
    if (config.signerName) {
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(width / 2 - 100, height * 0.72);
      ctx.lineTo(width / 2 + 100, height * 0.72);
      ctx.stroke();

      ctx.fillStyle = config.textColor;
      ctx.font = 'bold 14px Arial';
      ctx.fillText(config.signerName, width / 2, height * 0.76);

      if (config.signerTitle) {
        ctx.font = '12px Arial';
        ctx.fillText(config.signerTitle, width / 2, height * 0.79);
      }
    }

    // Footer text
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Arial';
    const footerText = config.footerText.length > 80 ? config.footerText.substring(0, 77) + '...' : config.footerText;
    ctx.fillText(footerText, width / 2, height * 0.96);

    // Certificate ID
    ctx.font = '10px Arial';
    ctx.textAlign = 'right';
    ctx.fillText('ID: CERT-PREVIEW', width - 20, height * 0.98);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setFields((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleFieldUpdate = (id: string, updates: Partial<CertificateField>) => {
    setFields(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const handleSaveConfig = () => {
    localStorage.setItem(savedConfigKey, JSON.stringify(config));
    localStorage.setItem(savedFieldsKey, JSON.stringify(fields));
    setIsSaved(true);
    toast.success('Configuración guardada correctamente');
  };

  // Get users based on certificate type
  const getEligibleUsers = (): User[] => {
    const allUsers = db.users.getAll();
    const eventAbstracts = db.abstracts.getByEvent(event.id);

    switch (certificateType) {
      case 'participation':
        const participantIds = [...new Set(eventAbstracts.map(a => a.userId))];
        return allUsers.filter(u => participantIds.includes(u.id));
      case 'presentation':
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
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleGenerateSingle = (user: User) => {
    // Always save config first
    localStorage.setItem(savedConfigKey, JSON.stringify(config));
    localStorage.setItem(savedFieldsKey, JSON.stringify(fields));

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
  };

  const handleExportAll = async () => {
    if (selectedUsers.length === 0) {
      toast.error('Selecciona al menos un usuario');
      return;
    }

    // Save config before export
    localStorage.setItem(savedConfigKey, JSON.stringify(config));
    localStorage.setItem(savedFieldsKey, JSON.stringify(fields));

    setIsExporting(true);
    try {
      const usersToExport = eligibleUsers.filter(u => selectedUsers.includes(u.id));
      const abstracts = certificateType === 'presentation' ? eventAbstracts : undefined;

      generateAllCertificatesAsPDF(usersToExport, event, certificateType, abstracts, config);
      toast.success(`${usersToExport.length} certificados exportados en un solo PDF`);
    } catch {
      toast.error('Error al exportar los certificados');
    } finally {
      setIsExporting(false);
    }
  };

  const headerFields = fields.filter(f => f.position === 'header');
  const bodyFields = fields.filter(f => f.position === 'body');
  const footerFields = fields.filter(f => f.position === 'footer');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Generador de Certificados</h2>
          <p className="text-muted-foreground">Configura y genera certificados personalizados</p>
        </div>
        <Button onClick={handleSaveConfig} variant={isSaved ? 'outline' : 'hero'}>
          <Save className="h-4 w-4 mr-2" />
          {isSaved ? 'Guardado' : 'Guardar Cambios'}
        </Button>
      </div>

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
              <CardTitle className="flex items-center gap-2">
                <GripVertical className="h-5 w-5" />
                Campos del Certificado
              </CardTitle>
              <CardDescription>Arrastra para reordenar, activa/desactiva los campos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Header Section */}
                <div>
                  <h4 className="font-medium text-sm mb-2 text-primary">📌 Encabezado</h4>
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={headerFields.map(f => f.id)} strategy={verticalListSortingStrategy}>
                      <div className="space-y-2">
                        {headerFields.map(field => (
                          <SortableField
                            key={field.id}
                            field={field}
                            onUpdate={handleFieldUpdate}
                            onRemove={() => {}}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                </div>

                {/* Body Section */}
                <div>
                  <h4 className="font-medium text-sm mb-2 text-primary">📄 Cuerpo</h4>
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={bodyFields.map(f => f.id)} strategy={verticalListSortingStrategy}>
                      <div className="space-y-2">
                        {bodyFields.map(field => (
                          <SortableField
                            key={field.id}
                            field={field}
                            onUpdate={handleFieldUpdate}
                            onRemove={() => {}}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                </div>

                {/* Footer Section */}
                <div>
                  <h4 className="font-medium text-sm mb-2 text-primary">📎 Pie de Página</h4>
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={footerFields.map(f => f.id)} strategy={verticalListSortingStrategy}>
                      <div className="space-y-2">
                        {footerFields.map(field => (
                          <SortableField
                            key={field.id}
                            field={field}
                            onUpdate={handleFieldUpdate}
                            onRemove={() => {}}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Design Tab */}
        <TabsContent value="design" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Colores y Estilo</CardTitle>
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
                    <p className="text-xs text-muted-foreground">Añade un borde decorativo</p>
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Vista Previa en Tiempo Real</CardTitle>
                <CardDescription>Los cambios se reflejan automáticamente</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden bg-muted/50 flex items-center justify-center p-4">
                  <canvas
                    ref={canvasRef}
                    className="max-w-full max-h-[400px] shadow-lg rounded"
                    style={{ 
                      aspectRatio: config.orientation === 'landscape' ? '842/595' : '595/842',
                      width: '100%',
                      height: 'auto'
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
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
                          <Button variant="ghost" size="sm" onClick={() => handleGenerateSingle(user)}>
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
              {isExporting ? 'Exportando...' : `Exportar ${selectedUsers.length} Certificados (PDF único)`}
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
