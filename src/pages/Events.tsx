import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { db, Event, MacroEvent, EventSession, FormField, SessionAttendance } from '@/lib/database';
import {
  Plus, Calendar, Users, FileText, Edit, Trash2, Settings2, Mail, Image, Palette,
  ArrowLeft, Wand2, Award, IdCard, Search, Eye, Clock, CheckSquare, Layers, CalendarDays
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ImageUploader } from '@/components/ImageUploader';
import { FormBuilderWithPreview } from '@/components/formBuilder/FormBuilderWithPreview';
import { EmailTemplateManager } from '@/components/EmailTemplateManager';
import { JuryAssignment } from '@/components/JuryAssignment';
import { CertificateManager } from '@/components/CertificateManager';
import { CredentialsManager } from '@/components/CredentialsManager';
import { toast } from 'sonner';

type ViewMode = 'list' | 'form-builder' | 'email-templates' | 'jury-assignment' | 'certificates' | 'credentials' | 'sessions' | 'attendance';
type MainTab = 'macro' | 'simple' | 'sessions';

export default function Events() {
  const [mainTab, setMainTab] = useState<MainTab>('macro');
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  // Macro Events
  const [macroEvents, setMacroEvents] = useState<MacroEvent[]>([]);
  const [isMacroDialogOpen, setIsMacroDialogOpen] = useState(false);
  const [editingMacro, setEditingMacro] = useState<MacroEvent | null>(null);
  const [macroSearch, setMacroSearch] = useState('');
  const [macroForm, setMacroForm] = useState({
    name: '', acronym: '', description: '', startDate: '', endDate: '', logoUrl: '',
  });

  // Simple Events
  const [events, setEvents] = useState<Event[]>([]);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [eventSearch, setEventSearch] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [formBuilderType, setFormBuilderType] = useState<'event' | 'user'>('event');
  const [eventForm, setEventForm] = useState({
    name: '', nameEn: '', description: '', macroEventId: '',
    bannerImageUrl: '', backgroundImageUrl: '', primaryColor: '#1e40af', secondaryColor: '#059669', backgroundColor: '#f0f9ff',
  });
  const [activeEventTab, setActiveEventTab] = useState('basic');

  // Sessions
  const [sessions, setSessions] = useState<EventSession[]>([]);
  const [isSessionDialogOpen, setIsSessionDialogOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<EventSession | null>(null);
  const [sessionEventFilter, setSessionEventFilter] = useState('');
  const [sessionSearch, setSessionSearch] = useState('');
  const [sessionForm, setSessionForm] = useState({
    eventId: '', date: '', startTime: '', endTime: '',
  });

  // Attendance
  const [attendanceSession, setAttendanceSession] = useState<EventSession | null>(null);
  const [attendanceData, setAttendanceData] = useState<SessionAttendance[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { loadAll(); }, []);

  const loadAll = () => {
    setMacroEvents(db.macroEvents.getAll());
    setEvents(db.events.getAll());
    setSessions(db.eventSessions.getAll());
    setIsLoading(false);
  };

  // ===== MACRO EVENT HANDLERS =====
  const openCreateMacro = () => {
    setEditingMacro(null);
    setMacroForm({ name: '', acronym: '', description: '', startDate: '', endDate: '', logoUrl: '' });
    setIsMacroDialogOpen(true);
  };

  const openEditMacro = (me: MacroEvent) => {
    setEditingMacro(me);
    setMacroForm({
      name: me.name, acronym: me.acronym, description: me.description,
      startDate: me.startDate, endDate: me.endDate, logoUrl: me.logoUrl || '',
    });
    setIsMacroDialogOpen(true);
  };

  const handleSaveMacro = () => {
    if (!macroForm.name || !macroForm.acronym || !macroForm.startDate || !macroForm.endDate) {
      toast.error('Completa los campos obligatorios'); return;
    }
    if (new Date(macroForm.endDate) < new Date(macroForm.startDate)) {
      toast.error('La fecha de fin no puede ser anterior a la de inicio'); return;
    }
    try {
      if (editingMacro) {
        db.macroEvents.update(editingMacro.id, macroForm);
        toast.success('Macro evento actualizado');
      } else {
        db.macroEvents.create({ ...macroForm, isActive: false });
        toast.success('Macro evento creado (estado: Inactivo)');
      }
      setIsMacroDialogOpen(false);
      loadAll();
    } catch (e: any) {
      toast.error(e.message || 'Error al guardar');
    }
  };

  const handleDeleteMacro = (me: MacroEvent) => {
    if (me.isActive) { toast.error('Solo se puede eliminar macro eventos inactivos'); return; }
    if (confirm('¿Eliminar este macro evento?')) {
      db.macroEvents.delete(me.id);
      toast.success('Macro evento eliminado');
      loadAll();
    }
  };

  const toggleMacroStatus = (me: MacroEvent) => {
    db.macroEvents.update(me.id, { isActive: !me.isActive });
    loadAll();
  };

  // ===== SIMPLE EVENT HANDLERS =====
  const openCreateEvent = () => {
    setEditingEvent(null);
    setEventForm({
      name: '', nameEn: '', description: '', macroEventId: '',
      bannerImageUrl: '', backgroundImageUrl: '', primaryColor: '#1e40af', secondaryColor: '#059669', backgroundColor: '#f0f9ff',
    });
    setActiveEventTab('basic');
    setIsEventDialogOpen(true);
  };

  const openEditEvent = (event: Event) => {
    setEditingEvent(event);
    const sessionsCount = db.eventSessions.getByEvent(event.id).length;
    setEventForm({
      name: event.name, nameEn: event.nameEn || '', description: event.description,
      macroEventId: event.macroEventId,
      bannerImageUrl: event.bannerImageUrl, backgroundImageUrl: event.backgroundImageUrl || '',
      primaryColor: event.primaryColor, secondaryColor: event.secondaryColor,
      backgroundColor: event.backgroundColor || '#f0f9ff',
    });
    setActiveEventTab('basic');
    setIsEventDialogOpen(true);
  };

  const handleSaveEvent = () => {
    if (!eventForm.name || !eventForm.nameEn || !eventForm.macroEventId) {
      toast.error('Completa los campos obligatorios'); return;
    }
    const macro = db.macroEvents.getById(eventForm.macroEventId);
    if (!macro) { toast.error('Macro evento no encontrado'); return; }
    try {
      if (editingEvent) {
        db.events.update(editingEvent.id, {
          ...eventForm,
          startDate: macro.startDate, endDate: macro.endDate,
        });
        toast.success('Evento simple actualizado');
      } else {
        db.events.create({
          ...eventForm, isActive: false, createdBy: '4',
          startDate: macro.startDate, endDate: macro.endDate,
        } as any);
        toast.success('Evento simple creado (estado: Inactivo)');
      }
      setIsEventDialogOpen(false);
      loadAll();
    } catch (e: any) {
      toast.error(e.message || 'Error al guardar');
    }
  };

  const handleDeleteEvent = (event: Event) => {
    if (event.isActive) { toast.error('Solo se puede eliminar eventos inactivos'); return; }
    if (confirm('¿Eliminar este evento simple?')) {
      db.events.delete(event.id);
      toast.success('Evento eliminado');
      loadAll();
    }
  };

  const toggleEventStatus = (event: Event) => {
    // Can't activate if no sessions
    if (!event.isActive) {
      const sesCount = db.eventSessions.getByEvent(event.id).length;
      if (sesCount === 0) {
        toast.error('El evento necesita al menos una sesión para activarse');
        return;
      }
    }
    db.events.update(event.id, { isActive: !event.isActive });
    loadAll();
  };

  // ===== SESSION HANDLERS =====
  const openCreateSession = () => {
    setEditingSession(null);
    setSessionForm({ eventId: '', date: '', startTime: '', endTime: '' });
    setIsSessionDialogOpen(true);
  };

  const openEditSession = (session: EventSession) => {
    setEditingSession(session);
    setSessionForm({
      eventId: session.eventId, date: session.date,
      startTime: session.startTime, endTime: session.endTime,
    });
    setIsSessionDialogOpen(true);
  };

  const handleSaveSession = () => {
    if (!sessionForm.eventId || !sessionForm.date || !sessionForm.startTime || !sessionForm.endTime) {
      toast.error('Completa todos los campos'); return;
    }
    if (sessionForm.endTime <= sessionForm.startTime) {
      toast.error('La hora de fin debe ser posterior a la de inicio'); return;
    }
    // Validate session date within macro event range
    const event = db.events.getById(sessionForm.eventId);
    if (event) {
      const macro = db.macroEvents.getById(event.macroEventId);
      if (macro) {
        const sessionDate = new Date(sessionForm.date);
        const macroStart = new Date(macro.startDate.split('T')[0]);
        const macroEnd = new Date(macro.endDate.split('T')[0]);
        if (sessionDate < macroStart || sessionDate > macroEnd) {
          toast.error('La fecha de la sesión debe estar dentro del rango del macro evento');
          return;
        }
      }
    }
    try {
      if (editingSession) {
        db.eventSessions.update(editingSession.id, sessionForm);
        toast.success('Sesión actualizada');
      } else {
        db.eventSessions.create({ ...sessionForm, isActive: true });
        toast.success('Sesión creada');
      }
      setIsSessionDialogOpen(false);
      loadAll();
    } catch (e: any) {
      toast.error(e.message || 'Error');
    }
  };

  const handleDeleteSession = (session: EventSession) => {
    if (confirm('¿Eliminar esta sesión? Se eliminará también la asistencia asociada.')) {
      db.eventSessions.delete(session.id);
      toast.success('Sesión eliminada');
      loadAll();
    }
  };

  // ===== ATTENDANCE =====
  const openAttendance = (session: EventSession) => {
    setAttendanceSession(session);
    setAttendanceData(db.sessionAttendance.getBySession(session.id));
    setViewMode('attendance');
  };

  const toggleAttendance = (userId: string) => {
    if (!attendanceSession) return;
    const event = db.events.getById(attendanceSession.eventId);
    if (!event || !event.isActive) { toast.error('El evento debe estar activo'); return; }
    if (!attendanceSession.isActive) { toast.error('La sesión debe estar activa'); return; }
    const existing = attendanceData.find(a => a.userId === userId);
    const newVal = existing ? !existing.attended : true;
    db.sessionAttendance.markAttendance(attendanceSession.id, attendanceSession.eventId, userId, newVal);
    setAttendanceData(db.sessionAttendance.getBySession(attendanceSession.id));
  };

  // ===== SUB-VIEW HANDLERS =====
  const openFormBuilder = (event: Event, type: 'event' | 'user') => {
    setSelectedEvent(event); setFormBuilderType(type); setViewMode('form-builder');
  };
  const openEmailTemplates = (event: Event) => { setSelectedEvent(event); setViewMode('email-templates'); };
  const openJuryAssignment = (event: Event) => { setSelectedEvent(event); setViewMode('jury-assignment'); };
  const openCertificates = (event: Event) => { setSelectedEvent(event); setViewMode('certificates'); };
  const openCredentials = (event: Event) => { setSelectedEvent(event); setViewMode('credentials'); };

  const handleSaveFormFields = (fields: FormField[]) => {
    if (selectedEvent) {
      if (formBuilderType === 'event') db.events.updateFormFields(selectedEvent.id, fields);
      else db.events.updateUserFormFields(selectedEvent.id, fields);
      loadAll();
    }
  };

  const goBackToList = () => { setViewMode('list'); setSelectedEvent(null); setAttendanceSession(null); };

  // ===== FILTER HELPERS =====
  const filteredMacros = macroEvents.filter(me =>
    me.name.toLowerCase().includes(macroSearch.toLowerCase()) ||
    me.acronym.toLowerCase().includes(macroSearch.toLowerCase())
  );

  const filteredEvents = events.filter(e =>
    e.name.toLowerCase().includes(eventSearch.toLowerCase()) ||
    (e.nameEn || '').toLowerCase().includes(eventSearch.toLowerCase())
  );

  const filteredSessions = sessions.filter(s => {
    if (sessionEventFilter && s.eventId !== sessionEventFilter) return false;
    if (sessionSearch) {
      const event = db.events.getById(s.eventId);
      return event?.name.toLowerCase().includes(sessionSearch.toLowerCase()) || s.date.includes(sessionSearch);
    }
    return true;
  });

  const getSimpleEventCount = (macroId: string) => events.filter(e => e.macroEventId === macroId).length;
  const getSessionCount = (eventId: string) => sessions.filter(s => s.eventId === eventId).length;
  const getMacroName = (macroId: string) => db.macroEvents.getById(macroId)?.name || 'Sin macro evento';
  const getEventName = (eventId: string) => db.events.getById(eventId)?.name || 'Sin evento';

  // ===== SPECIAL VIEWS =====
  if (viewMode === 'attendance' && attendanceSession) {
    const users = db.users.getAll();
    const event = db.events.getById(attendanceSession.eventId);
    const isEditable = attendanceSession.isActive && event?.isActive;
    return (
      <DashboardLayout>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-display font-bold">Registro de Asistencia</h1>
              <p className="text-muted-foreground">
                {getEventName(attendanceSession.eventId)} — {attendanceSession.date} ({attendanceSession.startTime} - {attendanceSession.endTime})
              </p>
            </div>
            <Button variant="outline" onClick={goBackToList}><ArrowLeft className="h-4 w-4 mr-2" />Volver</Button>
          </div>
          {!isEditable && (
            <div className="bg-muted rounded-lg p-3 text-sm text-muted-foreground">
              ⚠️ Solo lectura — el evento o la sesión están inactivos.
            </div>
          )}
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Participante</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Afiliación</TableHead>
                  <TableHead className="text-center">Asistió</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map(user => {
                  const att = attendanceData.find(a => a.userId === user.id);
                  return (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.affiliation}</TableCell>
                      <TableCell className="text-center">
                        <Checkbox
                          checked={att?.attended || false}
                          onCheckedChange={() => isEditable && toggleAttendance(user.id)}
                          disabled={!isEditable}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

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
            <Button variant="outline" onClick={goBackToList}><ArrowLeft className="h-4 w-4 mr-2" />Volver a Eventos</Button>
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

  if (viewMode === 'email-templates' && selectedEvent) {
    return (
      <DashboardLayout>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div><h1 className="text-2xl font-display font-bold">Plantillas de Email</h1><p className="text-muted-foreground">{selectedEvent.name}</p></div>
            <Button variant="outline" onClick={goBackToList}><ArrowLeft className="h-4 w-4 mr-2" />Volver</Button>
          </div>
          <EmailTemplateManager event={selectedEvent} />
        </div>
      </DashboardLayout>
    );
  }

  if (viewMode === 'jury-assignment' && selectedEvent) {
    return (
      <DashboardLayout>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div><h1 className="text-2xl font-display font-bold">Asignación de Jurados</h1><p className="text-muted-foreground">{selectedEvent.name}</p></div>
            <Button variant="outline" onClick={goBackToList}><ArrowLeft className="h-4 w-4 mr-2" />Volver</Button>
          </div>
          <JuryAssignment event={selectedEvent} />
        </div>
      </DashboardLayout>
    );
  }

  if (viewMode === 'certificates' && selectedEvent) {
    return (
      <DashboardLayout>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div><h1 className="text-2xl font-display font-bold">Gestión de Certificados</h1><p className="text-muted-foreground">{selectedEvent.name}</p></div>
            <Button variant="outline" onClick={goBackToList}><ArrowLeft className="h-4 w-4 mr-2" />Volver</Button>
          </div>
          <CertificateManager event={selectedEvent} />
        </div>
      </DashboardLayout>
    );
  }

  if (viewMode === 'credentials' && selectedEvent) {
    return (
      <DashboardLayout>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div><h1 className="text-2xl font-display font-bold">Gestión de Credenciales</h1><p className="text-muted-foreground">{selectedEvent.name}</p></div>
            <Button variant="outline" onClick={goBackToList}><ArrowLeft className="h-4 w-4 mr-2" />Volver</Button>
          </div>
          <CredentialsManager event={selectedEvent} />
        </div>
      </DashboardLayout>
    );
  }

  // ===== MAIN LIST VIEW =====
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold">Gestión de Eventos</h1>
          <p className="text-muted-foreground mt-1">Macro eventos, eventos simples y sesiones</p>
        </div>

        <Tabs value={mainTab} onValueChange={(v) => setMainTab(v as MainTab)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="macro" className="gap-2"><Layers className="h-4 w-4" />Macro Eventos</TabsTrigger>
            <TabsTrigger value="simple" className="gap-2"><Calendar className="h-4 w-4" />Eventos Simples</TabsTrigger>
            <TabsTrigger value="sessions" className="gap-2"><Clock className="h-4 w-4" />Sesiones</TabsTrigger>
          </TabsList>

          {/* ===== MACRO EVENTS TAB ===== */}
          <TabsContent value="macro" className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar macro eventos..." value={macroSearch} onChange={e => setMacroSearch(e.target.value)} className="pl-9" />
              </div>
              <Button variant="hero" onClick={openCreateMacro}><Plus className="h-4 w-4" />Nuevo Macro Evento</Button>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Siglas</TableHead>
                    <TableHead>Fecha Inicio</TableHead>
                    <TableHead>Fecha Fin</TableHead>
                    <TableHead className="text-center">Eventos Simples</TableHead>
                    <TableHead className="text-center">Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMacros.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No hay macro eventos</TableCell></TableRow>
                  ) : filteredMacros.map(me => (
                    <TableRow key={me.id}>
                      <TableCell className="font-medium">{me.name}</TableCell>
                      <TableCell><Badge variant="outline">{me.acronym}</Badge></TableCell>
                      <TableCell>{new Date(me.startDate).toLocaleDateString('es-ES')}</TableCell>
                      <TableCell>{new Date(me.endDate).toLocaleDateString('es-ES')}</TableCell>
                      <TableCell className="text-center">{getSimpleEventCount(me.id)}</TableCell>
                      <TableCell className="text-center">
                        <Switch checked={me.isActive} onCheckedChange={() => toggleMacroStatus(me)} />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEditMacro(me)} title="Editar"><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteMacro(me)} title="Eliminar" disabled={me.isActive}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* ===== SIMPLE EVENTS TAB ===== */}
          <TabsContent value="simple" className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar eventos..." value={eventSearch} onChange={e => setEventSearch(e.target.value)} className="pl-9" />
              </div>
              <Button variant="hero" onClick={openCreateEvent}><Plus className="h-4 w-4" />Nuevo Evento Simple</Button>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre (ES)</TableHead>
                    <TableHead>Nombre (EN)</TableHead>
                    <TableHead>Macro Evento</TableHead>
                    <TableHead className="text-center">Sesiones</TableHead>
                    <TableHead className="text-center">Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvents.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No hay eventos simples</TableCell></TableRow>
                  ) : filteredEvents.map(event => (
                    <TableRow key={event.id}>
                      <TableCell className="font-medium">{event.name}</TableCell>
                      <TableCell className="text-muted-foreground">{event.nameEn || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{getMacroName(event.macroEventId)}</Badge>
                      </TableCell>
                      <TableCell className="text-center">{getSessionCount(event.id)}</TableCell>
                      <TableCell className="text-center">
                        <Switch checked={event.isActive} onCheckedChange={() => toggleEventStatus(event)} />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          <Button variant="ghost" size="icon" onClick={() => openFormBuilder(event, 'event')} title="Formulario Evento"><Settings2 className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => openFormBuilder(event, 'user')} title="Formulario Usuarios"><Users className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => openEmailTemplates(event)} title="Emails"><Mail className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => openJuryAssignment(event)} title="Jurados"><Wand2 className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => openCertificates(event)} title="Certificados"><Award className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => openCredentials(event)} title="Credenciales"><IdCard className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => openEditEvent(event)} title="Editar"><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteEvent(event)} title="Eliminar" disabled={event.isActive}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* ===== SESSIONS TAB ===== */}
          <TabsContent value="sessions" className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex gap-2 flex-1">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Buscar sesiones..." value={sessionSearch} onChange={e => setSessionSearch(e.target.value)} className="pl-9" />
                </div>
                <Select value={sessionEventFilter} onValueChange={setSessionEventFilter}>
                  <SelectTrigger className="w-[200px]"><SelectValue placeholder="Filtrar por evento" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los eventos</SelectItem>
                    {events.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button variant="hero" onClick={openCreateSession}><Plus className="h-4 w-4" />Nueva Sesión</Button>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Evento Simple</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Hora Inicio</TableHead>
                    <TableHead>Hora Fin</TableHead>
                    <TableHead className="text-center">Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSessions.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No hay sesiones</TableCell></TableRow>
                  ) : filteredSessions.map(session => (
                    <TableRow key={session.id}>
                      <TableCell className="font-medium">{getEventName(session.eventId)}</TableCell>
                      <TableCell>{session.date}</TableCell>
                      <TableCell>{session.startTime}</TableCell>
                      <TableCell>{session.endTime}</TableCell>
                      <TableCell className="text-center">
                        <Switch checked={session.isActive} onCheckedChange={() => {
                          db.eventSessions.update(session.id, { isActive: !session.isActive });
                          loadAll();
                        }} />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openAttendance(session)} title="Asistencia"><CheckSquare className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => openEditSession(session)} title="Editar"><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteSession(session)} title="Eliminar"><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>

        {/* ===== MACRO EVENT DIALOG ===== */}
        <Dialog open={isMacroDialogOpen} onOpenChange={setIsMacroDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingMacro ? 'Editar Macro Evento' : 'Crear Macro Evento'}</DialogTitle>
              <DialogDescription>Contenedor principal que agrupa eventos simples</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2"><Label>Nombre *</Label><Input value={macroForm.name} onChange={e => setMacroForm({ ...macroForm, name: e.target.value })} /></div>
              <div className="space-y-2"><Label>Siglas (único) *</Label><Input value={macroForm.acronym} onChange={e => setMacroForm({ ...macroForm, acronym: e.target.value })} placeholder="Ej: CIB2024" /></div>
              <div className="space-y-2"><Label>Descripción</Label><Textarea value={macroForm.description} onChange={e => setMacroForm({ ...macroForm, description: e.target.value })} rows={2} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Fecha/Hora Inicio *</Label><Input type="datetime-local" value={macroForm.startDate} onChange={e => setMacroForm({ ...macroForm, startDate: e.target.value })} /></div>
                <div className="space-y-2"><Label>Fecha/Hora Fin *</Label><Input type="datetime-local" value={macroForm.endDate} onChange={e => setMacroForm({ ...macroForm, endDate: e.target.value })} /></div>
              </div>
              <div className="space-y-2">
                <Label>Logotipo</Label>
                <ImageUploader value={macroForm.logoUrl} onChange={url => setMacroForm({ ...macroForm, logoUrl: url })} aspectRatio="square" placeholder="Subir logotipo" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsMacroDialogOpen(false)}>Cancelar</Button>
              <Button variant="hero" onClick={handleSaveMacro}>{editingMacro ? 'Actualizar' : 'Crear'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ===== SIMPLE EVENT DIALOG ===== */}
        <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingEvent ? 'Editar Evento Simple' : 'Crear Evento Simple'}</DialogTitle>
              <DialogDescription>Actividad concreta asociada a un macro evento</DialogDescription>
            </DialogHeader>
            <Tabs value={activeEventTab} onValueChange={setActiveEventTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic"><FileText className="h-4 w-4 mr-1" />Información</TabsTrigger>
                <TabsTrigger value="images"><Image className="h-4 w-4 mr-1" />Imágenes</TabsTrigger>
                <TabsTrigger value="colors"><Palette className="h-4 w-4 mr-1" />Colores</TabsTrigger>
              </TabsList>
              <TabsContent value="basic" className="space-y-4 mt-4">
                <div className="space-y-2"><Label>Nombre en Español *</Label><Input value={eventForm.name} onChange={e => setEventForm({ ...eventForm, name: e.target.value })} /></div>
                <div className="space-y-2"><Label>Nombre en Inglés *</Label><Input value={eventForm.nameEn} onChange={e => setEventForm({ ...eventForm, nameEn: e.target.value })} /></div>
                <div className="space-y-2"><Label>Descripción</Label><Textarea value={eventForm.description} onChange={e => setEventForm({ ...eventForm, description: e.target.value })} rows={2} /></div>
                <div className="space-y-2">
                  <Label>Macro Evento Asociado *</Label>
                  <Select value={eventForm.macroEventId} onValueChange={v => setEventForm({ ...eventForm, macroEventId: v })}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar macro evento" /></SelectTrigger>
                    <SelectContent>
                      {macroEvents.filter(me => me.isActive).map(me => (
                        <SelectItem key={me.id} value={me.id}>{me.name} ({me.acronym})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
              <TabsContent value="images" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Banner del Evento</Label>
                  <ImageUploader value={eventForm.bannerImageUrl} onChange={url => setEventForm({ ...eventForm, bannerImageUrl: url })} aspectRatio="banner" placeholder="Subir banner" />
                </div>
                <div className="space-y-2">
                  <Label>Imagen de Fondo</Label>
                  <ImageUploader value={eventForm.backgroundImageUrl} onChange={url => setEventForm({ ...eventForm, backgroundImageUrl: url })} aspectRatio="banner" placeholder="Subir fondo" />
                </div>
              </TabsContent>
              <TabsContent value="colors" className="space-y-4 mt-4">
                <div className="grid grid-cols-3 gap-4">
                  {(['primaryColor', 'secondaryColor', 'backgroundColor'] as const).map(key => (
                    <div key={key} className="space-y-2">
                      <Label>{key === 'primaryColor' ? 'Color Primario' : key === 'secondaryColor' ? 'Color Secundario' : 'Color de Fondo'}</Label>
                      <div className="flex gap-2">
                        <Input type="color" value={eventForm[key]} onChange={e => setEventForm({ ...eventForm, [key]: e.target.value })} className="w-12 h-10 p-1 cursor-pointer" />
                        <Input value={eventForm[key]} onChange={e => setEventForm({ ...eventForm, [key]: e.target.value })} className="flex-1" />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-lg overflow-hidden h-24" style={{ backgroundColor: eventForm.backgroundColor }}>
                  <div className="h-12 flex items-center justify-center text-white font-semibold" style={{ background: `linear-gradient(135deg, ${eventForm.primaryColor}, ${eventForm.secondaryColor})` }}>
                    {eventForm.name || 'Vista previa'}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEventDialogOpen(false)}>Cancelar</Button>
              <Button variant="hero" onClick={handleSaveEvent}>{editingEvent ? 'Actualizar' : 'Crear'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ===== SESSION DIALOG ===== */}
        <Dialog open={isSessionDialogOpen} onOpenChange={setIsSessionDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingSession ? 'Editar Sesión' : 'Crear Sesión'}</DialogTitle>
              <DialogDescription>Ocurrencia temporal de un evento simple</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Evento Simple *</Label>
                <Select value={sessionForm.eventId} onValueChange={v => setSessionForm({ ...sessionForm, eventId: v })} disabled={!!editingSession}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar evento" /></SelectTrigger>
                  <SelectContent>
                    {events.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Fecha *</Label><Input type="date" value={sessionForm.date} onChange={e => setSessionForm({ ...sessionForm, date: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Hora Inicio *</Label><Input type="time" value={sessionForm.startTime} onChange={e => setSessionForm({ ...sessionForm, startTime: e.target.value })} /></div>
                <div className="space-y-2"><Label>Hora Fin *</Label><Input type="time" value={sessionForm.endTime} onChange={e => setSessionForm({ ...sessionForm, endTime: e.target.value })} /></div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsSessionDialogOpen(false)}>Cancelar</Button>
              <Button variant="hero" onClick={handleSaveSession}>{editingSession ? 'Actualizar' : 'Crear'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
