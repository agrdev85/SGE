import { useState, useEffect, useRef } from 'react';
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
import { IdCard, Download, Users, FileDown, Settings, Palette, GripVertical, Save, QrCode } from 'lucide-react';
import { toast } from 'sonner';
import { ImageUploader } from './ImageUploader';
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
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
  qrDataFields: string[];
}

interface CredentialField {
  id: string;
  type: 'text' | 'logo' | 'photo' | 'qr' | 'role' | 'affiliation' | 'country' | 'event_name';
  label: string;
  value: string;
  enabled: boolean;
}

const defaultFields: CredentialField[] = [
  { id: 'event_name', type: 'event_name', label: 'Nombre del Evento', value: '', enabled: true },
  { id: 'logo', type: 'logo', label: 'Logo del Evento', value: '', enabled: false },
  { id: 'photo', type: 'photo', label: 'Foto del Participante', value: '', enabled: true },
  { id: 'role', type: 'role', label: 'Rol/Categoría', value: '', enabled: true },
  { id: 'affiliation', type: 'affiliation', label: 'Afiliación/Institución', value: '', enabled: true },
  { id: 'country', type: 'country', label: 'País', value: '', enabled: false },
  { id: 'qr', type: 'qr', label: 'Código QR', value: '', enabled: true },
];

const qrDataOptions = [
  { id: 'name', label: 'Nombre' },
  { id: 'email', label: 'Email' },
  { id: 'role', label: 'Rol' },
  { id: 'affiliation', label: 'Afiliación' },
  { id: 'country', label: 'País' },
  { id: 'event', label: 'Nombre del Evento' },
  { id: 'id', label: 'ID de Usuario' },
];

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
  qrDataFields: ['name', 'email', 'event'],
};

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

function SortableCredentialField({ field, onUpdate }: { 
  field: CredentialField; 
  onUpdate: (id: string, updates: Partial<CredentialField>) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: field.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-3 rounded-lg border transition-all ${field.enabled ? 'bg-card' : 'bg-muted/50 opacity-60'}`}
    >
      <div className="flex items-center gap-3">
        <div {...attributes} {...listeners} className="cursor-grab">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex-1 flex items-center justify-between">
          <Label className="text-sm font-medium">{field.label}</Label>
          <Switch
            checked={field.enabled}
            onCheckedChange={(checked) => onUpdate(field.id, { enabled: checked })}
          />
        </div>
        {field.enabled && field.type === 'logo' && (
          <div className="ml-8">
            <ImageUploader
              value={field.value}
              onChange={(url) => onUpdate(field.id, { value: url })}
              aspectRatio="auto"
              className="max-w-[150px]"
              placeholder="Logo"
            />
          </div>
        )}
      </div>
    </div>
  );
}

interface CredentialsManagerProps {
  event: Event;
}

async function generateQRDataUrl(data: string): Promise<string> {
  try {
    return await QRCode.toDataURL(data, { width: 100, margin: 1 });
  } catch {
    return '';
  }
}

export function CredentialsManager({ event }: CredentialsManagerProps) {
  const [activeTab, setActiveTab] = useState('config');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [isSaved, setIsSaved] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Load saved config from localStorage
  const savedConfigKey = `credential_config_${event.id}`;
  const savedFieldsKey = `credential_fields_${event.id}`;

  const [config, setConfig] = useState<CredentialConfig>(() => {
    const saved = localStorage.getItem(savedConfigKey);
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      ...defaultCredentialConfig,
      primaryColor: event.primaryColor,
      secondaryColor: event.secondaryColor,
    };
  });

  const [fields, setFields] = useState<CredentialField[]>(() => {
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
    const photoField = fields.find(f => f.id === 'photo');
    const qrField = fields.find(f => f.id === 'qr');
    const roleField = fields.find(f => f.id === 'role');
    const affiliationField = fields.find(f => f.id === 'affiliation');
    const countryField = fields.find(f => f.id === 'country');
    const logoField = fields.find(f => f.id === 'logo');

    setConfig(prev => ({
      ...prev,
      showPhoto: photoField?.enabled ?? true,
      showQR: qrField?.enabled ?? true,
      showRole: roleField?.enabled ?? true,
      showAffiliation: affiliationField?.enabled ?? true,
      showCountry: countryField?.enabled ?? false,
      logoUrl: logoField?.enabled ? logoField.value : undefined,
    }));
    setIsSaved(false);
  }, [fields]);

  // Draw real-time preview
  useEffect(() => {
    if (activeTab !== 'design') return;
    drawPreview();
  }, [config, activeTab]);

  const drawPreview = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scale = 4;
    const width = config.width * scale;
    const height = config.height * scale;
    canvas.width = width;
    canvas.height = height;

    const primaryRgb = hexToRgb(config.primaryColor);
    const secondaryRgb = hexToRgb(config.secondaryColor);
    const textRgb = hexToRgb(config.textColor);

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Header bar
    ctx.fillStyle = config.primaryColor;
    ctx.fillRect(0, 0, width, height * 0.22);

    // Event name - FULL NAME, no truncation
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${12 * scale / 4}px Arial`;
    ctx.textAlign = 'center';
    
    // Word wrap for long event names
    const maxWidth = width - 20;
    const words = event.name.split(' ');
    let lines: string[] = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const testLine = currentLine + ' ' + words[i];
      const metrics = ctx.measureText(testLine);
      if (metrics.width < maxWidth) {
        currentLine = testLine;
      } else {
        lines.push(currentLine);
        currentLine = words[i];
      }
    }
    lines.push(currentLine);

    const lineHeight = 14 * scale / 4;
    const startY = height * 0.08 + ((2 - lines.length) * lineHeight / 2);
    lines.forEach((line, index) => {
      ctx.fillText(line, width / 2, startY + index * lineHeight);
    });

    // Photo placeholder
    if (config.showPhoto) {
      const photoSize = 24 * scale / 4;
      const photoX = width / 2 - photoSize / 2;
      const photoY = height * 0.28;
      
      ctx.fillStyle = '#f0f0f0';
      ctx.beginPath();
      ctx.roundRect(photoX, photoY, photoSize, photoSize * 1.2, 4);
      ctx.fill();
      
      ctx.strokeStyle = config.secondaryColor;
      ctx.lineWidth = 2;
      ctx.stroke();
      
      ctx.fillStyle = '#999';
      ctx.font = `${8 * scale / 4}px Arial`;
      ctx.fillText('FOTO', width / 2, photoY + photoSize * 0.7);
    }

    // Name
    let yPos = config.showPhoto ? height * 0.68 : height * 0.35;
    ctx.fillStyle = config.textColor;
    ctx.font = `bold ${14 * scale / 4}px Arial`;
    ctx.fillText('Dr. Juan Pérez García', width / 2, yPos);

    // Role badge
    if (config.showRole) {
      yPos += 10 * scale / 4;
      const roleText = 'Participante';
      const roleWidth = ctx.measureText(roleText).width + 16;
      
      ctx.fillStyle = config.secondaryColor;
      ctx.beginPath();
      ctx.roundRect(width / 2 - roleWidth / 2, yPos - 6, roleWidth, 12, 4);
      ctx.fill();
      
      ctx.fillStyle = '#ffffff';
      ctx.font = `${8 * scale / 4}px Arial`;
      ctx.fillText(roleText, width / 2, yPos + 2);
    }

    // Affiliation
    if (config.showAffiliation) {
      yPos += 12 * scale / 4;
      ctx.fillStyle = '#666';
      ctx.font = `${8 * scale / 4}px Arial`;
      ctx.fillText('Universidad de Madrid', width / 2, yPos);
    }

    // Country
    if (config.showCountry) {
      yPos += 8 * scale / 4;
      ctx.font = `${7 * scale / 4}px Arial`;
      ctx.fillText('España', width / 2, yPos);
    }

    // QR Code
    if (config.showQR) {
      const qrSize = 12 * scale / 4;
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(width - qrSize - 8, height - qrSize - 16, qrSize, qrSize);
      ctx.fillStyle = '#666';
      ctx.font = `${5 * scale / 4}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText('QR', width - qrSize / 2 - 8, height - qrSize / 2 - 12);
    }

    // Footer bar
    ctx.fillStyle = config.primaryColor;
    ctx.fillRect(0, height - height * 0.08, width, height * 0.08);

    // ID
    ctx.fillStyle = '#ffffff';
    ctx.font = `${5 * scale / 4}px Arial`;
    ctx.textAlign = 'left';
    ctx.fillText('ID-PREVIEW123', 4, height - 4);
  };

  const handleDragEnd = (eventDrag: DragEndEvent) => {
    const { active, over } = eventDrag;
    if (over && active.id !== over.id) {
      setFields((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleFieldUpdate = (id: string, updates: Partial<CredentialField>) => {
    setFields(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const handleSaveConfig = () => {
    localStorage.setItem(savedConfigKey, JSON.stringify(config));
    localStorage.setItem(savedFieldsKey, JSON.stringify(fields));
    setIsSaved(true);
    toast.success('Configuración de credenciales guardada');
  };

  const toggleQrField = (fieldId: string) => {
    setConfig(prev => {
      const current = prev.qrDataFields || [];
      if (current.includes(fieldId)) {
        return { ...prev, qrDataFields: current.filter(f => f !== fieldId) };
      } else {
        return { ...prev, qrDataFields: [...current, fieldId] };
      }
    });
    setIsSaved(false);
  };

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

  const generateQrData = (user: User): string => {
    const data: Record<string, string> = {};
    (config.qrDataFields || []).forEach(field => {
      switch (field) {
        case 'name': data.name = user.name; break;
        case 'email': data.email = user.email; break;
        case 'role': data.role = user.role; break;
        case 'affiliation': data.affiliation = user.affiliation || ''; break;
        case 'country': data.country = user.country || ''; break;
        case 'event': data.event = event.name; break;
        case 'id': data.id = user.id; break;
      }
    });
    return JSON.stringify(data);
  };

  const handleGenerateSingle = async (user: User) => {
    // Save config first
    localStorage.setItem(savedConfigKey, JSON.stringify(config));
    localStorage.setItem(savedFieldsKey, JSON.stringify(fields));

    try {
      const doc = await generateCredentialPDF(user, event, config);
      doc.save(`Credencial_${user.name.replace(/\s+/g, '_')}.pdf`);
      toast.success(`Credencial generada para ${user.name}`);
    } catch {
      toast.error('Error al generar la credencial');
    }
  };

  const generateCredentialPDF = async (user: User, evt: Event, cfg: CredentialConfig): Promise<jsPDF> => {
    const primaryRgb = hexToRgb(cfg.primaryColor);
    const secondaryRgb = hexToRgb(cfg.secondaryColor);
    const textRgb = hexToRgb(cfg.textColor);
    
    const doc = new jsPDF({
      orientation: cfg.orientation,
      unit: 'mm',
      format: [cfg.width, cfg.height],
    });

    const width = doc.internal.pageSize.getWidth();
    const height = doc.internal.pageSize.getHeight();

    // Background
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, width, height, 'F');

    // Header bar
    doc.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    doc.rect(0, 0, width, 12, 'F');

    // Event name - FULL, wrapped
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    const splitName = doc.splitTextToSize(evt.name, width - 6);
    doc.text(splitName, width / 2, 5, { align: 'center' });

    // Photo placeholder area
    if (cfg.showPhoto) {
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
    let yPos = cfg.showPhoto ? 43 : 18;
    doc.setTextColor(textRgb.r, textRgb.g, textRgb.b);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(user.name, width / 2, yPos, { align: 'center' });

    // Role badge
    if (cfg.showRole) {
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
    if (cfg.showAffiliation && user.affiliation) {
      yPos += 6;
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(6);
      doc.text(user.affiliation, width / 2, yPos, { align: 'center' });
    }

    // Country
    if (cfg.showCountry && user.country) {
      yPos += 4;
      doc.setFontSize(5);
      doc.text(user.country, width / 2, yPos, { align: 'center' });
    }

    // QR Code with real data
    if (cfg.showQR) {
      const qrData = generateQrData(user);
      try {
        const qrDataUrl = await generateQRDataUrl(qrData);
        if (qrDataUrl) {
          doc.addImage(qrDataUrl, 'PNG', width - 14, height - 14, 12, 12);
        }
      } catch {
        // Fallback placeholder
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

  const handleExportAll = async () => {
    if (selectedUsers.length === 0) {
      toast.error('Selecciona al menos un usuario');
      return;
    }

    // Save config first
    localStorage.setItem(savedConfigKey, JSON.stringify(config));
    localStorage.setItem(savedFieldsKey, JSON.stringify(fields));

    setIsExporting(true);
    try {
      const usersToExport = eligibleUsers.filter(u => selectedUsers.includes(u.id));
      await generateAllCredentialsAsPDF(usersToExport, event, config);
      toast.success(`${usersToExport.length} credenciales exportadas en un solo PDF`);
    } catch {
      toast.error('Error al exportar las credenciales');
    } finally {
      setIsExporting(false);
    }
  };

  const generateAllCredentialsAsPDF = async (users: User[], evt: Event, cfg: CredentialConfig): Promise<void> => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const credWidth = cfg.width;
    const credHeight = cfg.height;
    const margin = 10;
    const gap = 5;

    const cols = Math.floor((pageWidth - 2 * margin + gap) / (credWidth + gap));
    const rows = Math.floor((pageHeight - 2 * margin + gap) / (credHeight + gap));
    const perPage = cols * rows;

    const primaryRgb = hexToRgb(cfg.primaryColor);
    const secondaryRgb = hexToRgb(cfg.secondaryColor);
    const textRgb = hexToRgb(cfg.textColor);

    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const pageIndex = Math.floor(i / perPage);
      const posOnPage = i % perPage;
      const col = posOnPage % cols;
      const row = Math.floor(posOnPage / cols);

      if (i > 0 && posOnPage === 0) {
        doc.addPage();
      }

      const x = margin + col * (credWidth + gap);
      const y = margin + row * (credHeight + gap);

      // Draw credential at position
      await drawCredentialAt(doc, user, evt, cfg, x, y, primaryRgb, secondaryRgb, textRgb);
    }

    const fileName = `Credenciales_${evt.name.replace(/\s+/g, '_')}.pdf`;
    doc.save(fileName);
  };

  const drawCredentialAt = async (
    doc: jsPDF, 
    user: User, 
    evt: Event, 
    cfg: CredentialConfig, 
    x: number, 
    y: number,
    primaryRgb: { r: number; g: number; b: number },
    secondaryRgb: { r: number; g: number; b: number },
    textRgb: { r: number; g: number; b: number }
  ): Promise<void> => {
    const width = cfg.width;
    const height = cfg.height;

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

    // Event name - FULL with wrap
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(6);
    doc.setFont('helvetica', 'bold');
    const splitName = doc.splitTextToSize(evt.name, width - 4);
    doc.text(splitName, x + width / 2, y + 4, { align: 'center' });

    // Photo area
    if (cfg.showPhoto) {
      doc.setFillColor(240, 240, 240);
      doc.roundedRect(x + width / 2 - 10, y + 15, 20, 24, 2, 2, 'F');
      doc.setDrawColor(secondaryRgb.r, secondaryRgb.g, secondaryRgb.b);
      doc.roundedRect(x + width / 2 - 10, y + 15, 20, 24, 2, 2, 'S');
      doc.setTextColor(150, 150, 150);
      doc.setFontSize(5);
      doc.text('FOTO', x + width / 2, y + 28, { align: 'center' });
    }

    // Name
    let yPos = y + (cfg.showPhoto ? 43 : 18);
    doc.setTextColor(textRgb.r, textRgb.g, textRgb.b);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(user.name, x + width / 2, yPos, { align: 'center' });

    // Role
    if (cfg.showRole) {
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
    if (cfg.showAffiliation && user.affiliation) {
      yPos += 6;
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(6);
      doc.text(user.affiliation, x + width / 2, yPos, { align: 'center' });
    }

    // QR Code
    if (cfg.showQR) {
      const qrData = generateQrData(user);
      try {
        const qrDataUrl = await generateQRDataUrl(qrData);
        if (qrDataUrl) {
          doc.addImage(qrDataUrl, 'PNG', x + width - 13, y + height - 13, 10, 10);
        }
      } catch {
        doc.setFillColor(240, 240, 240);
        doc.rect(x + width - 12, y + height - 12, 10, 10, 'F');
      }
    }

    // Footer bar
    doc.setFillColor(primaryRgb.r, primaryRgb.g, primaryRgb.b);
    doc.rect(x, y + height - 4, width, 4, 'F');

    // ID
    const credentialId = `ID-${user.id.substring(0, 8).toUpperCase()}`;
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(4);
    doc.text(credentialId, x + 3, y + height - 1.5);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Credenciales</h2>
          <p className="text-muted-foreground">Configura y genera credenciales personalizadas</p>
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
                    onValueChange={(value: 'portrait' | 'landscape') => {
                      setConfig({ ...config, orientation: value });
                      setIsSaved(false);
                    }}
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
                    onChange={(e) => {
                      setConfig({ ...config, width: parseFloat(e.target.value) || 85.6 });
                      setIsSaved(false);
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Alto (mm)</Label>
                  <Input
                    type="number"
                    value={config.height}
                    onChange={(e) => {
                      setConfig({ ...config, height: parseFloat(e.target.value) || 53.98 });
                      setIsSaved(false);
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GripVertical className="h-5 w-5" />
                Campos de la Credencial
              </CardTitle>
              <CardDescription>Arrastra para reordenar, activa/desactiva los campos</CardDescription>
            </CardHeader>
            <CardContent>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={fields.map(f => f.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2">
                    {fields.map(field => (
                      <SortableCredentialField
                        key={field.id}
                        field={field}
                        onUpdate={handleFieldUpdate}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                Datos del Código QR
              </CardTitle>
              <CardDescription>Selecciona qué información incluir en el QR</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {qrDataOptions.map(option => (
                  <div
                    key={option.id}
                    onClick={() => toggleQrField(option.id)}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all text-center ${
                      (config.qrDataFields || []).includes(option.id)
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <Checkbox
                      checked={(config.qrDataFields || []).includes(option.id)}
                      className="mx-auto mb-1"
                    />
                    <span className="text-sm font-medium">{option.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="design" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                        onChange={(e) => {
                          setConfig({ ...config, primaryColor: e.target.value });
                          setIsSaved(false);
                        }}
                        className="w-12 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        value={config.primaryColor}
                        onChange={(e) => {
                          setConfig({ ...config, primaryColor: e.target.value });
                          setIsSaved(false);
                        }}
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
                        onChange={(e) => {
                          setConfig({ ...config, secondaryColor: e.target.value });
                          setIsSaved(false);
                        }}
                        className="w-12 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        value={config.secondaryColor}
                        onChange={(e) => {
                          setConfig({ ...config, secondaryColor: e.target.value });
                          setIsSaved(false);
                        }}
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
                      onChange={(e) => {
                        setConfig({ ...config, textColor: e.target.value });
                        setIsSaved(false);
                      }}
                      className="w-12 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      value={config.textColor}
                      onChange={(e) => {
                        setConfig({ ...config, textColor: e.target.value });
                        setIsSaved(false);
                      }}
                      className="flex-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Vista Previa en Tiempo Real</CardTitle>
                <CardDescription>Los cambios se reflejan automáticamente</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden bg-muted/50 flex items-center justify-center p-6">
                  <canvas
                    ref={canvasRef}
                    className="shadow-lg rounded"
                    style={{ 
                      maxWidth: '100%',
                      maxHeight: '300px',
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
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
