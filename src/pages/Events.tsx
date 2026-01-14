import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { db, Event } from '@/lib/database';
import { Plus, Calendar, Users, FileText, Edit, Trash2, Settings2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ImageUploader } from '@/components/ImageUploader';
import { FormBuilder } from '@/components/formBuilder/FormBuilder';
import { toast } from 'sonner';

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isFormBuilderOpen, setIsFormBuilderOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [selectedEventForForm, setSelectedEventForForm] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    name: '', description: '', startDate: '', endDate: '', bannerImageUrl: '', primaryColor: '#1e40af', secondaryColor: '#059669',
  });

  useEffect(() => { loadEvents(); }, []);

  const loadEvents = () => { setEvents(db.events.getAll()); setIsLoading(false); };

  const openCreateDialog = () => {
    setEditingEvent(null);
    setFormData({ name: '', description: '', startDate: '', endDate: '', bannerImageUrl: '', primaryColor: '#1e40af', secondaryColor: '#059669' });
    setIsDialogOpen(true);
  };

  const openEditDialog = (event: Event) => {
    setEditingEvent(event);
    setFormData({ name: event.name, description: event.description, startDate: event.startDate, endDate: event.endDate, bannerImageUrl: event.bannerImageUrl, primaryColor: event.primaryColor, secondaryColor: event.secondaryColor });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.startDate || !formData.endDate) { toast.error('Completa los campos requeridos'); return; }
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
    } catch { toast.error('Error al guardar'); }
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Eliminar este evento?')) { db.events.delete(id); toast.success('Evento eliminado'); loadEvents(); }
  };

  const openFormBuilder = (event: Event) => { setSelectedEventForForm(event); setIsFormBuilderOpen(true); };

  const handleSaveFormFields = (fields: any[]) => {
    if (selectedEventForForm) { db.events.updateFormFields(selectedEventForForm.id, fields); loadEvents(); }
  };

  if (isFormBuilderOpen && selectedEventForForm) {
    return (
      <DashboardLayout>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-display font-bold">Formulario: {selectedEventForForm.name}</h1>
              <p className="text-muted-foreground">Configura el formulario de inscripción con drag & drop</p>
            </div>
            <Button variant="outline" onClick={() => setIsFormBuilderOpen(false)}>← Volver a Eventos</Button>
          </div>
          <FormBuilder eventId={selectedEventForForm.id} initialFields={selectedEventForForm.formFields || []} onSave={handleSaveFormFields} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold">Gestión de Eventos</h1>
            <p className="text-muted-foreground mt-1">Administra los eventos científicos de la plataforma</p>
          </div>
          <Button variant="hero" onClick={openCreateDialog}><Plus className="h-4 w-4" />Nuevo Evento</Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{[1, 2, 3].map(i => <div key={i} className="h-72 rounded-xl bg-muted animate-pulse" />)}</div>
        ) : events.length === 0 ? (
          <Card className="text-center py-12"><CardContent><Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" /><h3 className="text-lg font-semibold mb-2">No hay eventos</h3><Button variant="hero" onClick={openCreateDialog}><Plus className="h-4 w-4" />Crear Evento</Button></CardContent></Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map(event => (
              <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-40">
                  <img src={event.bannerImageUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&h=400&fit=crop'} alt={event.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute top-3 right-3 flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 bg-white/20 hover:bg-white/30" onClick={() => openFormBuilder(event)}><Settings2 className="h-4 w-4 text-white" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 bg-white/20 hover:bg-white/30" onClick={() => openEditDialog(event)}><Edit className="h-4 w-4 text-white" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 bg-white/20 hover:bg-white/30" onClick={() => handleDelete(event.id)}><Trash2 className="h-4 w-4 text-white" /></Button>
                  </div>
                  <div className="absolute bottom-3 left-3"><Badge variant="secondary" className="bg-white/20 text-white backdrop-blur-sm">{event.isActive ? 'Activo' : 'Inactivo'}</Badge></div>
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-display line-clamp-2">{event.name}</CardTitle>
                  <CardDescription className="flex items-center gap-2"><Calendar className="h-4 w-4" />{new Date(event.startDate).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })} - {new Date(event.endDate).toLocaleDateString('es-ES', { month: 'short', day: 'numeric', year: 'numeric' })}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{event.description}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Users className="h-4 w-4" />{db.abstracts.getByEvent(event.id).length}</span>
                    <span className="flex items-center gap-1"><FileText className="h-4 w-4" />{event.formFields?.length || 0} campos</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle className="font-display">{editingEvent ? 'Editar Evento' : 'Crear Nuevo Evento'}</DialogTitle></DialogHeader>
            <div className="space-y-4 my-4">
              <ImageUploader value={formData.bannerImageUrl} onChange={(url) => setFormData({ ...formData, bannerImageUrl: url })} aspectRatio="banner" placeholder="Imagen de fondo del evento (aparecerá en emails)" />
              <div className="space-y-2"><Label>Nombre del Evento *</Label><Input placeholder="Congreso Internacional de..." value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
              <div className="space-y-2"><Label>Descripción</Label><Textarea placeholder="Descripción del evento..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Fecha de Inicio *</Label><Input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} /></div>
                <div className="space-y-2"><Label>Fecha de Fin *</Label><Input type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Color Primario</Label><div className="flex gap-2"><Input type="color" value={formData.primaryColor} onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })} className="w-12 h-10 p-1" /><Input value={formData.primaryColor} onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })} className="flex-1" /></div></div>
                <div className="space-y-2"><Label>Color Secundario</Label><div className="flex gap-2"><Input type="color" value={formData.secondaryColor} onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })} className="w-12 h-10 p-1" /><Input value={formData.secondaryColor} onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })} className="flex-1" /></div></div>
              </div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button><Button variant="hero" onClick={handleSave}>Guardar</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
