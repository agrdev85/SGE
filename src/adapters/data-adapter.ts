import { db } from '@/lib/database';
import { eventosApi } from '@/services/eventos.service';
import { authApi, mapUserDTO } from '@/services/auth.service';
import { handleApiError } from '@/lib/api-client';
import type {
  User, UserRole, MacroEvent, Event, EventSession, SubEvento, Salon,
  NomReceptivo, NomEmpresa, NomHotel, NomTipoHabitacion, NomTipoParticipacion,
  NomTipoTransporte, HotelTipoHabitacion, EventoHotel, NomencladorEvento,
  ActividadSocial, ReservaActividadSocial, RutaTransporte, EventoTipoParticipacion,
  FormField, SessionAttendance, Abstract, Thematic, WorkAssignment,
  Notification, EmailTemplate, AuditLog, WizardProgress, CMSPage, CMSArticle,
  CMSCategory, CMSMenu, CMSMenuItem, CMSWidget, CMSSettings,
} from '@/lib/database';

const USE_API = import.meta.env.VITE_USE_API === 'true';

function wrapDb<T>(fn: () => T): Promise<T> {
  return Promise.resolve(fn());
}

function mapEventoDTOtoMacroEvent(dto: Record<string, unknown>): MacroEvent {
  return {
    id: (dto.hashId || dto.id) as string,
    name: (dto.nombre || dto.name) as string,
    acronym: (dto.siglas || dto.acronym || '') as string,
    description: (dto.descripcion || dto.description || '') as string,
    startDate: (dto.fechaInicio || dto.startDate || '') as string,
    endDate: (dto.fechaFin || dto.endDate || '') as string,
    logoUrl: dto.logoUrl as string | undefined,
    bannerImageUrl: dto.bannerImageUrl as string | undefined,
    backgroundImageUrl: dto.backgroundImageUrl as string | undefined,
    primaryColor: dto.primaryColor as string || '#1e40af',
    secondaryColor: dto.secondaryColor as string || '#059669',
    backgroundColor: dto.backgroundColor as string || '#f0f9ff',
    isActive: (dto.activo ?? dto.isActive ?? true) as boolean,
    createdAt: (dto.createdAt || new Date().toISOString()) as string,
    content: dto.content as string | undefined,
    urlEvento: dto.urlEvento as string | undefined,
    modoCargaTrabajos: dto.modoCargaTrabajos as 'TEMATICA' | 'SUBEVENTO' | undefined,
    tituloPublico: dto.tituloPublico as string | undefined,
    contenidoHtml: dto.contenidoHtml as string | undefined,
    receptivoId: dto.receptivoId as string | undefined,
    empresaId: dto.empresaId as string | undefined,
    registrationFields: dto.registrationFields as FormField[] | undefined,
  };
}

export const adapter = {
  users: {
    getAll: (): Promise<User[]> =>
      USE_API
        ? authApi.getUsers()
        : wrapDb(() => db.users.getAll()),
    getById: (id: string): Promise<User | undefined> =>
      USE_API
        ? authApi.getUsers().then(users => users.find(u => u.id === id))
        : wrapDb(() => db.users.getById(id)),
    create: (data: Partial<User>): Promise<User> =>
      USE_API
        ? authApi.createUser({
            FirstName: data.name || '',
            LastName: '',
            Email: data.email || '',
            UserName: data.email || data.userName || '',
            IsActive: true,
            EmailConfirmed: false,
            UserGuid: crypto.randomUUID?.() || '',
          })
        : wrapDb(() => db.users.create(data as any)),
    update: (id: string, data: Partial<User>): Promise<User> =>
      USE_API
        ? authApi.updateUser(id, {
            FirstName: data.name || '',
            LastName: '',
            Email: data.email || '',
            UserName: data.email || data.userName || '',
            IsActive: data.isActive ?? true,
            EmailConfirmed: true,
          })
        : wrapDb(() => db.users.update(id, data)),
    delete: (id: string): Promise<void> =>
      USE_API
        ? authApi.deleteUser(id)
        : wrapDb(() => db.users.delete(id)),
    getByEmail: (email: string): Promise<User | undefined> =>
      wrapDb(() => db.users.getByEmail(email)),
  },

  macroEvents: {
    getAll: (): Promise<MacroEvent[]> =>
      USE_API
        ? eventosApi.eventos.getAll().then(list => list.map(mapEventoDTOtoMacroEvent))
        : wrapDb(() => db.macroEvents.getAll()),
    getById: (id: string): Promise<MacroEvent | undefined> =>
      USE_API
        ? eventosApi.eventos.getById(id).then(mapEventoDTOtoMacroEvent).catch(() => undefined)
        : wrapDb(() => db.macroEvents.getById(id)),
    create: (data: Partial<MacroEvent>): Promise<MacroEvent> =>
      USE_API
        ? eventosApi.eventos.create(data).then(mapEventoDTOtoMacroEvent)
        : wrapDb(() => db.macroEvents.create(data as any)),
    update: (id: string, data: Partial<MacroEvent>): Promise<MacroEvent> =>
      USE_API
        ? eventosApi.eventos.update(id, data).then(mapEventoDTOtoMacroEvent)
        : wrapDb(() => db.macroEvents.update(id, data)),
    delete: (id: string): Promise<void> =>
      USE_API
        ? eventosApi.eventos.delete(id)
        : wrapDb(() => db.macroEvents.delete(id)),
  },

  events: {
    getAll: (): Promise<Event[]> =>
      USE_API
        ? eventosApi.subEventos.getAll().then(list => list.map((dto: any) => ({
          id: dto.hashId || dto.id,
          name: dto.nombre || dto.name,
          macroEventId: dto.macroEventId || dto.eventoId,
          description: dto.descripcion || dto.description || '',
          startDate: dto.fechaInicio || dto.startDate || '',
          endDate: dto.fechaFin || dto.endDate || '',
          bannerImageUrl: dto.bannerImageUrl || '',
          primaryColor: dto.primaryColor || '#1e40af',
          secondaryColor: dto.secondaryColor || '#059669',
          isActive: dto.activo ?? dto.isActive ?? false,
          createdBy: dto.createdBy || '',
          createdAt: dto.createdAt || new Date().toISOString(),
        } as Event)))
        : wrapDb(() => db.events.getAll()),
    getById: (id: string): Promise<Event | undefined> =>
      USE_API
        ? eventosApi.subEventos.getById(id).then((dto: any) => ({
          id: dto.hashId || dto.id,
          name: dto.nombre || dto.name,
          macroEventId: dto.macroEventId || dto.eventoId,
          description: dto.descripcion || dto.description || '',
          startDate: dto.fechaInicio || dto.startDate || '',
          endDate: dto.fechaFin || dto.endDate || '',
          bannerImageUrl: dto.bannerImageUrl || '',
          primaryColor: dto.primaryColor || '#1e40af',
          secondaryColor: dto.secoNdaryColor || '#059669',
          isActive: dto.activo ?? dto.isActive ?? false,
          createdBy: dto.createdBy || '',
          createdAt: dto.createdAt || new Date().toISOString(),
        } as Event)).catch(() => undefined)
        : wrapDb(() => db.events.getById(id)),
    create: (data: Partial<Event>): Promise<Event> =>
      wrapDb(() => db.events.create(data as any)),
    update: (id: string, data: Partial<Event>): Promise<Event> =>
      wrapDb(() => db.events.update(id, data)),
    delete: (id: string): Promise<void> =>
      wrapDb(() => db.events.delete(id)),
    updateFormFields: (id: string, fields: FormField[]): Promise<void> =>
      wrapDb(() => db.events.updateFormFields(id, fields)),
  },

  eventSessions: {
    getAll: (): Promise<EventSession[]> => wrapDb(() => db.eventSessions.getAll()),
    getByEvent: (eventId: string): Promise<EventSession[]> => wrapDb(() => db.eventSessions.getByEvent(eventId)),
    getById: (id: string): Promise<EventSession | undefined> => wrapDb(() => db.eventSessions.getById(id)),
    create: (data: Partial<EventSession>): Promise<EventSession> => wrapDb(() => db.eventSessions.create(data as any)),
    update: (id: string, data: Partial<EventSession>): Promise<EventSession> => wrapDb(() => db.eventSessions.update(id, data)),
    delete: (id: string): Promise<void> => wrapDb(() => db.eventSessions.delete(id)),
  },

  subEventos: {
    getAll: (): Promise<SubEvento[]> => wrapDb(() => db.subEventos.getAll()),
    getByEvento: (eventoId: string): Promise<SubEvento[]> => wrapDb(() => db.subEventos.getByEvento(eventoId)),
    getById: (id: string): Promise<SubEvento | undefined> => wrapDb(() => db.subEventos.getById(id)),
    create: (data: Partial<SubEvento>): Promise<SubEvento> => wrapDb(() => db.subEventos.create(data as any)),
    update: (id: string, data: Partial<SubEvento>): Promise<SubEvento> => wrapDb(() => db.subEventos.update(id, data)),
    delete: (id: string): Promise<void> => wrapDb(() => db.subEventos.delete(id)),
  },

  sessionAttendance: {
    getBySession: (sessionId: string): Promise<SessionAttendance[]> => wrapDb(() => db.sessionAttendance.getBySession(sessionId)),
    markAttendance: (sessionId: string, eventId: string, userId: string, attended: boolean): Promise<void> =>
      wrapDb(() => db.sessionAttendance.markAttendance(sessionId, eventId, userId, attended)),
  },

  nomencladores: {
    receptivos: {
      getAll: (): Promise<NomReceptivo[]> => wrapDb(() => db.nomencladores.receptivos.getAll()),
      getById: (id: string): Promise<NomReceptivo | undefined> => wrapDb(() => db.nomencladores.receptivos.getById(id)),
      create: (data: Partial<NomReceptivo>): Promise<NomReceptivo> => wrapDb(() => db.nomencladores.receptivos.create(data)),
      update: (id: string, data: Partial<NomReceptivo>): Promise<NomReceptivo> => wrapDb(() => db.nomencladores.receptivos.update(id, data)),
      delete: (id: string): Promise<void> => wrapDb(() => db.nomencladores.receptivos.delete(id)),
    },
    empresas: {
      getAll: (): Promise<NomEmpresa[]> => wrapDb(() => db.nomencladores.empresas.getAll()),
      getById: (id: string): Promise<NomEmpresa | undefined> => wrapDb(() => db.nomencladores.empresas.getById(id)),
      create: (data: Partial<NomEmpresa>): Promise<NomEmpresa> => wrapDb(() => db.nomencladores.empresas.create(data)),
      update: (id: string, data: Partial<NomEmpresa>): Promise<NomEmpresa> => wrapDb(() => db.nomencladores.empresas.update(id, data)),
      delete: (id: string): Promise<void> => wrapDb(() => db.nomencladores.empresas.delete(id)),
    },
    hoteles: {
      getAll: (): Promise<NomHotel[]> => wrapDb(() => db.nomencladores.hoteles.getAll()),
      getById: (id: string): Promise<NomHotel | undefined> => wrapDb(() => db.nomencladores.hoteles.getById(id)),
      create: (data: Partial<NomHotel>): Promise<NomHotel> => wrapDb(() => db.nomencladores.hoteles.create(data)),
      update: (id: string, data: Partial<NomHotel>): Promise<NomHotel> => wrapDb(() => db.nomencladores.hoteles.update(id, data)),
      delete: (id: string): Promise<void> => wrapDb(() => db.nomencladores.hoteles.delete(id)),
    },
  },

  eventSessions_getBySubEvento: (subEventoId: string): Promise<EventSession[]> =>
    wrapDb(() => db.eventSessions.getAll().filter(s => s.subEventoId === subEventoId)),

  getErrorMessage: async (error: unknown): Promise<string> => {
    const { getErrorMessage } = await import('@/lib/api-client');
    return getErrorMessage(error);
  },

  handleError: async (error: unknown, fallback?: string): Promise<void> => {
    await handleApiError(error, fallback);
  },
};

export { USE_API };
