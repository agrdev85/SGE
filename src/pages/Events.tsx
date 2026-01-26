import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { db, Event, FormField } from '@/lib/database';
import { Plus, Calendar, Users, FileText, Edit, Trash2, Settings2, Mail, Image, Palette, ArrowLeft, Wand2, Award, IdCard } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { ImageUploader } from '@/components/ImageUploader';
import { FormBuilderWithPreview } from '@/components/formBuilder/FormBuilderWithPreview';
import { EmailTemplateManager } from '@/components/EmailTemplateManager';
import { JuryAssignment } from '@/components/JuryAssignment';
import { CertificateManager } from '@/components/CertificateManager';
import { CredentialsManager } from '@/components/CredentialsManager';
import { toast } from 'sonner';

type ViewMode = 'list' | 'form-builder' | 'email-templates' | 'jury-assignment' | 'certificates' | 'credentials';

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [formBuilderType, setFormBuilderType] = useState<'event' | 'user'>('event');
  const [activeDialogTab, setActiveDialogTab] = useState('basic');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    bannerImageUrl: '',
    backgroundImageUrl: '',
    primaryColor: '#1e40af',
    secondaryColor: '#059669',
    backgroundColor: '#f0f9ff',
  });

  useEffect(() => { loadEvents(); }, []);

  const loadEvents = () => {
    setEvents(db.events.getAll());
    setIsLoading(false);
  };

  const openCreateDialog = () => {
    setEditingEvent(null);
    setFormData({
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      bannerImageUrl: '',
      backgroundImageUrl: '',
      primaryColor: '#1e40af',
      secondaryColor: '#059669',
      backgroundColor: '#f0f9ff',
    });
    setActiveDialogTab('basic');
    setIsDialogOpen(true);
  };

  const openEditDialog = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      name: event.name,
      description: event.description,
      startDate: event.startDate,
      endDate: event.endDate,
      bannerImageUrl: event.bannerImageUrl,
      backgroundImageUrl: event.backgroundImageUrl || '',
      primaryColor: event.primaryColor,
      secondaryColor: event.secondaryColor,
      backgroundColor: event.backgroundColor || '#f0f9ff',
    });
    setActiveDialogTab('basic');
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.startDate || !formData.endDate) {
      toast.error('Completa los campos requeridos');
      return;
    }
    try {
      if (editingEvent) {
        db.events.update(editingEvent.id, formData);
        toast.success('Evento actualizado');
      } else {
        db.events.create({ ...formData, isActive: true, createdBy: '4' });
        toast.success('Evento creado');
      }
      setIsDialogOpen(false);
      loadEvents();
    } catch {
      toast.error('Error al guardar');
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Eliminar este evento?')) {
      db.events.delete(id);
      toast.success('Evento eliminado');
      loadEvents();
    }
  };

  const openFormBuilder = (event: Event, type: 'event' | 'user') => {
    setSelectedEvent(event);
    setFormBuilderType(type);
    setViewMode('form-builder');
  };

  const openEmailTemplates = (event: Event) => {
    setSelectedEvent(event);
    setViewMode('email-templates');
  };

  const openJuryAssignment = (event: Event) => {
    setSelectedEvent(event);
    setViewMode('jury-assignment');
  };

  const openCertificates = (event: Event) => {
    setSelectedEvent(event);
    setViewMode('certificates');
  };

  const openCredentials = (event: Event) => {
    setSelectedEvent(event);
    setViewMode('credentials');
  };

  const handleSaveFormFields = (fields: FormField[]) => {
    if (selectedEvent) {
      if (formBuilderType === 'event') {
        db.events.updateFormFields(selectedEvent.id, fields);
      } else {
        db.events.updateUserFormFields(selectedEvent.id, fields);
      }
      loadEvents();
    }
  };

  const goBackToList = () => {
    setViewMode('list');
    setSelectedEvent(null);
  };

  // Form Builder View
  if (viewMode === 'form-builder' && selectedEvent) {
    const updatedEvent = db.events.getById(selectedEvent.id);
    return (
      <DashboardLayout>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-display font-bold">
                {formBuilderType === 'event' ? 'Formulario de Inscripción' : 'Formulario de Usuarios'}
              </h1>
              <p className="text-muted-foreground">{selectedEvent.name}</p>
            </div>
            <Button variant="outline" onClick={goBackToList}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Eventos
            </Button>
          </div>
          <FormBuilderWithPreview
            eventId={selectedEvent.id}
            event={updatedEvent || selectedEvent}
            initialFields={formBuilderType === 'event' ? selectedEvent.formFields : selectedEvent.userFormFields}
            onSave={handleSaveFormFields}
            type={formBuilderType}
          />
        </div>
      </DashboardLayout>
    );
  }

  // Email Templates View
  if (viewMode === 'email-templates' && selectedEvent) {
    return (
      <DashboardLayout>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-display font-bold">Plantillas de Email</h1>
              <p className="text-muted-foreground">{selectedEvent.name}</p>
            </div>
            <Button variant="outline" onClick={goBackToList}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Eventos
            </Button>
          </div>
          <EmailTemplateManager event={selectedEvent} />
        </div>
      </DashboardLayout>
    );
  }

  // Jury Assignment View
  if (viewMode === 'jury-assignment' && selectedEvent) {
    return (
      <DashboardLayout>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-display font-bold">Asignación de Jurados</h1>
              <p className="text-muted-foreground">{selectedEvent.name}</p>
            </div>
            <Button variant="outline" onClick={goBackToList}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Eventos
            </Button>
          </div>
          <JuryAssignment event={selectedEvent} />
        </div>
      </DashboardLayout>
    );
  }

  // Certificates View
  if (viewMode === 'certificates' && selectedEvent) {
    return (
      <DashboardLayout>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-display font-bold">Gestión de Certificados</h1>
              <p className="text-muted-foreground">{selectedEvent.name}</p>
            </div>
            <Button variant="outline" onClick={goBackToList}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Eventos
            </Button>
          </div>
          <CertificateManager event={selectedEvent} />
        </div>
      </DashboardLayout>
    );
  }

  // Credentials View
  if (viewMode === 'credentials' && selectedEvent) {
    return (
      <DashboardLayout>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-display font-bold">Gestión de Credenciales</h1>
              <p className="text-muted-foreground">{selectedEvent.name}</p>
            </div>
            <Button variant="outline" onClick={goBackToList}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Eventos
            </Button>
          </div>
          <CredentialsManager event={selectedEvent} />
        </div>
      </DashboardLayout>
    );
  }

  // List View
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold">Gestión de Eventos</h1>
            <p className="text-muted-foreground mt-1">Administra eventos científicos con formularios personalizados</p>
          </div>
          <Button variant="hero" onClick={openCreateDialog}>
            <Plus className="h-4 w-4" />
            Nuevo Evento
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <div key={i} className="h-72 rounded-xl bg-muted animate-pulse" />)}
          </div>
        ) : events.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-semibold mb-2">No hay eventos</h3>
              <Button variant="hero" onClick={openCreateDialog}>
                <Plus className="h-4 w-4" />
                Crear Evento
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map(event => (
              <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                <div className="relative h-40">
                  <img
                    src={event.bannerImageUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&h=400&fit=crop'}
                    alt={event.name}
                    className="w-full h-full object-cover"
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(to top, ${event.primaryColor}cc, transparent)`,
                    }}
                  />
                  
                  {/* Action Buttons */}
                  <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 bg-white/20 hover:bg-white/30 backdrop-blur-sm"
                      onClick={() => openFormBuilder(event, 'event')}
                      title="Formulario de Evento"
                    >
                      <Settings2 className="h-4 w-4 text-white" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 bg-white/20 hover:bg-white/30 backdrop-blur-sm"
                      onClick={() => openFormBuilder(event, 'user')}
                      title="Formulario de Usuarios"
                    >
                      <Users className="h-4 w-4 text-white" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 bg-white/20 hover:bg-white/30 backdrop-blur-sm"
                      onClick={() => openEmailTemplates(event)}
                      title="Plantillas de Email"
                    >
                      <Mail className="h-4 w-4 text-white" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 bg-white/20 hover:bg-white/30 backdrop-blur-sm"
                      onClick={() => openJuryAssignment(event)}
                      title="Asignar Jurados"
                    >
                      <Wand2 className="h-4 w-4 text-white" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 bg-white/20 hover:bg-white/30 backdrop-blur-sm"
                      onClick={() => openCertificates(event)}
                      title="Certificados"
                    >
                      <Award className="h-4 w-4 text-white" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 bg-white/20 hover:bg-white/30 backdrop-blur-sm"
                      onClick={() => openCredentials(event)}
                      title="Credenciales"
                    >
                      <IdCard className="h-4 w-4 text-white" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 bg-white/20 hover:bg-white/30 backdrop-blur-sm"
                      onClick={() => openEditDialog(event)}
                      title="Editar Evento"
                    >
                      <Edit className="h-4 w-4 text-white" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 bg-white/20 hover:bg-white/30 backdrop-blur-sm"
                      onClick={() => handleDelete(event.id)}
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4 text-white" />
                    </Button>
                  </div>

                  <div className="absolute bottom-3 left-3">
                    <Badge variant="secondary" className="bg-white/20 text-white backdrop-blur-sm">
                      {event.isActive ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                </div>

                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-display line-clamp-2">{event.name}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {new Date(event.startDate).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })} -{' '}
                    {new Date(event.endDate).toLocaleDateString('es-ES', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{event.description}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {db.abstracts.getByEvent(event.id).length} trabajos
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      {event.formFields?.length || 0} campos
                    </span>
                    <div className="flex items-center gap-1 ml-auto">
                      <div
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: event.primaryColor }}
                        title="Color primario"
                      />
                      <div
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: event.secondaryColor }}
                        title="Color secundario"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Create/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display">
                {editingEvent ? 'Editar Evento' : 'Crear Nuevo Evento'}
              </DialogTitle>
              <DialogDescription>
                Configura los detalles del evento, imágenes y colores personalizados
              </DialogDescription>
            </DialogHeader>

            <Tabs value={activeDialogTab} onValueChange={setActiveDialogTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Información
                </TabsTrigger>
                <TabsTrigger value="images" className="gap-2">
                  <Image className="h-4 w-4" />
                  Imágenes
                </TabsTrigger>
                <TabsTrigger value="colors" className="gap-2">
                  <Palette className="h-4 w-4" />
                  Colores
                </TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Nombre del Evento *</Label>
                  <Input
                    placeholder="Congreso Internacional de..."
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Descripción</Label>
                  <Textarea
                    placeholder="Descripción del evento..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Fecha de Inicio *</Label>
                    <Input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Fecha de Fin *</Label>
                    <Input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="images" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Banner del Evento</Label>
                  <p className="text-xs text-muted-foreground">
                    Imagen principal que aparecerá en la cabecera del evento
                  </p>
                  <ImageUploader
                    value={formData.bannerImageUrl}
                    onChange={(url) => setFormData({ ...formData, bannerImageUrl: url })}
                    aspectRatio="banner"
                    placeholder="Arrastra o haz clic para subir el banner"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Imagen de Fondo</Label>
                  <p className="text-xs text-muted-foreground">
                    Esta imagen se usará en los emails personalizados
                  </p>
                  <ImageUploader
                    value={formData.backgroundImageUrl}
                    onChange={(url) => setFormData({ ...formData, backgroundImageUrl: url })}
                    aspectRatio="banner"
                    placeholder="Arrastra o haz clic para subir imagen de fondo"
                  />
                </div>
              </TabsContent>

              <TabsContent value="colors" className="space-y-4 mt-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Color Primario</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={formData.primaryColor}
                        onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                        className="w-12 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        value={formData.primaryColor}
                        onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Color Secundario</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={formData.secondaryColor}
                        onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                        className="w-12 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        value={formData.secondaryColor}
                        onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Color de Fondo</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={formData.backgroundColor}
                        onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                        className="w-12 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        value={formData.backgroundColor}
                        onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Color Preview */}
                <div className="mt-6">
                  <Label className="mb-2 block">Vista Previa de Colores</Label>
                  <div
                    className="rounded-lg overflow-hidden h-32"
                    style={{ backgroundColor: formData.backgroundColor }}
                  >
                    <div
                      className="h-16 flex items-center justify-center text-white font-semibold"
                      style={{
                        background: `linear-gradient(135deg, ${formData.primaryColor}, ${formData.secondaryColor})`,
                      }}
                    >
                      {formData.name || 'Nombre del Evento'}
                    </div>
                    <div className="p-4 flex gap-2">
                      <button
                        className="px-4 py-2 rounded text-white text-sm"
                        style={{ backgroundColor: formData.primaryColor }}
                      >
                        Botón Primario
                      </button>
                      <button
                        className="px-4 py-2 rounded text-white text-sm"
                        style={{ backgroundColor: formData.secondaryColor }}
                      >
                        Botón Secundario
                      </button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button variant="hero" onClick={handleSave}>
                {editingEvent ? 'Actualizar' : 'Crear Evento'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
