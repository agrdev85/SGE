// Database simulation (localStorage-based persistence)
// Simulates SQLite/backend database with full CRUD operations

import { toast } from "sonner";

// Types
export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash?: string;
  role: 'USER' | 'REVIEWER' | 'COMMITTEE' | 'ADMIN';
  country: string;
  affiliation: string;
  createdAt: string;
  isActive: boolean;
  avatar?: string;
}

export interface Event {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  bannerImageUrl: string;
  primaryColor: string;
  secondaryColor: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  formFields?: FormField[];
}

export interface FormField {
  id: string;
  eventId: string;
  fieldType: FieldType;
  label: string;
  isRequired: boolean;
  orderIndex: number;
  options?: string[];
  placeholder?: string;
}

export type FieldType = 
  | 'text' 
  | 'textarea' 
  | 'email' 
  | 'phone' 
  | 'number' 
  | 'date' 
  | 'select' 
  | 'checkbox' 
  | 'radio' 
  | 'file' 
  | 'image'
  | 'separator';

export type AbstractStatus = 'EN_PROCESO' | 'APROBADO' | 'APROBADO_CON_CAMBIOS' | 'RECHAZADO';

export interface Abstract {
  id: string;
  userId: string;
  eventId: string;
  title: string;
  summaryText: string;
  keywords: string[];
  authors: string[];
  status: AbstractStatus;
  version: number;
  createdAt: string;
  updatedAt: string;
  categoryType?: 'Ponencia' | 'Poster' | 'Conferencia';
}

export interface Review {
  id: string;
  abstractId: string;
  reviewerId: string;
  decision: 'APROBADO' | 'APROBADO_CON_CAMBIOS' | 'RECHAZADO';
  comment: string;
  score: number;
  reviewedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'abstract_status' | 'review_assigned' | 'event_update' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface EmailTemplate {
  id: string;
  eventId: string;
  type: 'INSCRIPCION' | 'ASIGNACION_JURADO' | 'APROBADO' | 'RECHAZADO' | 'CERTIFICADO';
  subject: string;
  htmlBody: string;
}

// Database class
class Database {
  private getCollection<T>(key: string): T[] {
    const data = localStorage.getItem(`db_${key}`);
    return data ? JSON.parse(data) : [];
  }

  private setCollection<T>(key: string, data: T[]): void {
    localStorage.setItem(`db_${key}`, JSON.stringify(data));
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Initialize with seed data if empty
  init() {
    if (this.getCollection<User>('users').length === 0) {
      this.seedData();
    }
  }

  private seedData() {
    // Seed Users
    const users: User[] = [
      {
        id: '1',
        name: 'Dr. María García',
        email: 'maria@example.com',
        passwordHash: 'demo',
        role: 'USER',
        country: 'Cuba',
        affiliation: 'Universidad de La Habana',
        createdAt: '2024-01-15',
        isActive: true,
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
      },
      {
        id: '2',
        name: 'Dr. Carlos Rodríguez',
        email: 'carlos@example.com',
        passwordHash: 'demo',
        role: 'REVIEWER',
        country: 'Cuba',
        affiliation: 'CIGB',
        createdAt: '2024-01-10',
        isActive: true,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      },
      {
        id: '3',
        name: 'Dra. Ana Martínez',
        email: 'ana@example.com',
        passwordHash: 'demo',
        role: 'COMMITTEE',
        country: 'Cuba',
        affiliation: 'BioCubaFarma',
        createdAt: '2024-01-05',
        isActive: true,
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
      },
      {
        id: '4',
        name: 'Admin Sistema',
        email: 'admin@example.com',
        passwordHash: 'demo',
        role: 'ADMIN',
        country: 'Cuba',
        affiliation: 'Sistema',
        createdAt: '2024-01-01',
        isActive: true,
      },
    ];
    this.setCollection('users', users);

    // Seed Events
    const events: Event[] = [
      {
        id: '1',
        name: 'Congreso Internacional de Biotecnología 2024',
        description: 'El evento más importante del sector biotecnológico en América Latina.',
        startDate: '2024-06-15',
        endDate: '2024-06-20',
        bannerImageUrl: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=1200&h=400&fit=crop',
        primaryColor: '#1e40af',
        secondaryColor: '#059669',
        isActive: true,
        createdBy: '4',
        createdAt: '2024-01-01',
        formFields: [
          { id: 'f1', eventId: '1', fieldType: 'text', label: 'Nombre Completo', isRequired: true, orderIndex: 0 },
          { id: 'f2', eventId: '1', fieldType: 'email', label: 'Correo Electrónico', isRequired: true, orderIndex: 1 },
          { id: 'f3', eventId: '1', fieldType: 'text', label: 'Institución', isRequired: true, orderIndex: 2 },
          { id: 'f4', eventId: '1', fieldType: 'select', label: 'País', isRequired: true, orderIndex: 3, options: ['Cuba', 'México', 'España', 'Argentina'] },
        ],
      },
      {
        id: '2',
        name: 'Simposio de Nanociencias 2024',
        description: 'Explorando las fronteras de la nanotecnología aplicada.',
        startDate: '2024-09-10',
        endDate: '2024-09-12',
        bannerImageUrl: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=1200&h=400&fit=crop',
        primaryColor: '#7c3aed',
        secondaryColor: '#ec4899',
        isActive: true,
        createdBy: '4',
        createdAt: '2024-02-15',
      },
    ];
    this.setCollection('events', events);

    // Seed Abstracts
    const abstracts: Abstract[] = [
      {
        id: '1',
        userId: '1',
        eventId: '1',
        title: 'Nuevos avances en terapia génica para enfermedades raras',
        summaryText: 'Este trabajo presenta los últimos avances en el desarrollo de vectores virales para terapia génica.',
        keywords: ['terapia génica', 'vectores virales', 'enfermedades raras'],
        authors: ['Dr. María García', 'Dr. Juan Pérez'],
        status: 'EN_PROCESO',
        version: 1,
        createdAt: '2024-03-01',
        updatedAt: '2024-03-01',
      },
      {
        id: '2',
        userId: '1',
        eventId: '1',
        title: 'Desarrollo de vacunas de nueva generación contra COVID-19',
        summaryText: 'Presentamos el desarrollo de una vacuna basada en ARNm de tercera generación.',
        keywords: ['vacunas', 'ARNm', 'COVID-19'],
        authors: ['Dr. María García', 'Dra. Laura Sánchez'],
        status: 'APROBADO',
        version: 1,
        createdAt: '2024-02-15',
        updatedAt: '2024-02-28',
        categoryType: 'Ponencia',
      },
    ];
    this.setCollection('abstracts', abstracts);

    // Seed Reviews
    const reviews: Review[] = [
      {
        id: '1',
        abstractId: '2',
        reviewerId: '2',
        decision: 'APROBADO',
        comment: 'Excelente trabajo. La metodología es sólida.',
        score: 95,
        reviewedAt: '2024-02-25',
      },
    ];
    this.setCollection('reviews', reviews);

    // Seed Notifications
    const notifications: Notification[] = [
      {
        id: '1',
        userId: '1',
        type: 'abstract_status',
        title: 'Resumen Aprobado',
        message: 'Tu resumen "Desarrollo de vacunas..." ha sido aprobado.',
        read: false,
        createdAt: new Date().toISOString(),
        link: '/abstracts',
      },
    ];
    this.setCollection('notifications', notifications);
  }

  // USERS CRUD
  users = {
    getAll: (): User[] => this.getCollection<User>('users'),
    
    getById: (id: string): User | undefined => 
      this.getCollection<User>('users').find(u => u.id === id),
    
    getByEmail: (email: string): User | undefined => 
      this.getCollection<User>('users').find(u => u.email === email),
    
    getByRole: (role: User['role']): User[] => 
      this.getCollection<User>('users').filter(u => u.role === role),
    
    create: (data: Omit<User, 'id' | 'createdAt'>): User => {
      const users = this.getCollection<User>('users');
      const newUser: User = {
        ...data,
        id: this.generateId(),
        createdAt: new Date().toISOString().split('T')[0],
      };
      users.push(newUser);
      this.setCollection('users', users);
      return newUser;
    },
    
    update: (id: string, data: Partial<User>): User => {
      const users = this.getCollection<User>('users');
      const index = users.findIndex(u => u.id === id);
      if (index === -1) throw new Error('Usuario no encontrado');
      users[index] = { ...users[index], ...data };
      this.setCollection('users', users);
      return users[index];
    },
    
    delete: (id: string): void => {
      const users = this.getCollection<User>('users').filter(u => u.id !== id);
      this.setCollection('users', users);
    },
  };

  // EVENTS CRUD
  events = {
    getAll: (): Event[] => this.getCollection<Event>('events'),
    
    getById: (id: string): Event | undefined => 
      this.getCollection<Event>('events').find(e => e.id === id),
    
    getActive: (): Event[] => 
      this.getCollection<Event>('events').filter(e => e.isActive),
    
    create: (data: Omit<Event, 'id' | 'createdAt'>): Event => {
      const events = this.getCollection<Event>('events');
      const newEvent: Event = {
        ...data,
        id: this.generateId(),
        createdAt: new Date().toISOString().split('T')[0],
      };
      events.push(newEvent);
      this.setCollection('events', events);
      return newEvent;
    },
    
    update: (id: string, data: Partial<Event>): Event => {
      const events = this.getCollection<Event>('events');
      const index = events.findIndex(e => e.id === id);
      if (index === -1) throw new Error('Evento no encontrado');
      events[index] = { ...events[index], ...data };
      this.setCollection('events', events);
      return events[index];
    },
    
    delete: (id: string): void => {
      const events = this.getCollection<Event>('events').filter(e => e.id !== id);
      this.setCollection('events', events);
    },

    updateFormFields: (eventId: string, fields: FormField[]): Event => {
      const events = this.getCollection<Event>('events');
      const index = events.findIndex(e => e.id === eventId);
      if (index === -1) throw new Error('Evento no encontrado');
      events[index].formFields = fields;
      this.setCollection('events', events);
      return events[index];
    },
  };

  // ABSTRACTS CRUD
  abstracts = {
    getAll: (): Abstract[] => this.getCollection<Abstract>('abstracts'),
    
    getById: (id: string): Abstract | undefined => 
      this.getCollection<Abstract>('abstracts').find(a => a.id === id),
    
    getByUser: (userId: string): Abstract[] => 
      this.getCollection<Abstract>('abstracts').filter(a => a.userId === userId),
    
    getByEvent: (eventId: string): Abstract[] => 
      this.getCollection<Abstract>('abstracts').filter(a => a.eventId === eventId),
    
    getApproved: (eventId: string): Abstract[] => 
      this.getCollection<Abstract>('abstracts').filter(a => a.eventId === eventId && a.status === 'APROBADO'),
    
    getPending: (): Abstract[] => 
      this.getCollection<Abstract>('abstracts').filter(a => a.status === 'EN_PROCESO'),
    
    create: (data: Omit<Abstract, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'status'>): Abstract => {
      const abstracts = this.getCollection<Abstract>('abstracts');
      const newAbstract: Abstract = {
        ...data,
        id: this.generateId(),
        status: 'EN_PROCESO',
        version: 1,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
      };
      abstracts.push(newAbstract);
      this.setCollection('abstracts', abstracts);
      return newAbstract;
    },
    
    update: (id: string, data: Partial<Abstract>): Abstract => {
      const abstracts = this.getCollection<Abstract>('abstracts');
      const index = abstracts.findIndex(a => a.id === id);
      if (index === -1) throw new Error('Resumen no encontrado');
      abstracts[index] = { 
        ...abstracts[index], 
        ...data,
        updatedAt: new Date().toISOString().split('T')[0],
        version: abstracts[index].version + 1,
      };
      this.setCollection('abstracts', abstracts);
      return abstracts[index];
    },

    assignCategory: (id: string, categoryType: 'Ponencia' | 'Poster' | 'Conferencia'): Abstract => {
      return this.abstracts.update(id, { categoryType });
    },
  };

  // REVIEWS CRUD
  reviews = {
    getAll: (): Review[] => this.getCollection<Review>('reviews'),
    
    getByAbstract: (abstractId: string): Review[] => 
      this.getCollection<Review>('reviews').filter(r => r.abstractId === abstractId),
    
    getByReviewer: (reviewerId: string): Review[] => 
      this.getCollection<Review>('reviews').filter(r => r.reviewerId === reviewerId),
    
    create: (data: Omit<Review, 'id' | 'reviewedAt'>): Review => {
      const reviews = this.getCollection<Review>('reviews');
      const newReview: Review = {
        ...data,
        id: this.generateId(),
        reviewedAt: new Date().toISOString().split('T')[0],
      };
      reviews.push(newReview);
      this.setCollection('reviews', reviews);
      
      // Update abstract status
      this.abstracts.update(data.abstractId, { status: data.decision });
      
      return newReview;
    },
  };

  // NOTIFICATIONS CRUD
  notifications = {
    getByUser: (userId: string): Notification[] => 
      this.getCollection<Notification>('notifications')
        .filter(n => n.userId === userId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    
    getUnread: (userId: string): Notification[] => 
      this.notifications.getByUser(userId).filter(n => !n.read),
    
    create: (data: Omit<Notification, 'id' | 'createdAt' | 'read'>): Notification => {
      const notifications = this.getCollection<Notification>('notifications');
      const newNotification: Notification = {
        ...data,
        id: this.generateId(),
        read: false,
        createdAt: new Date().toISOString(),
      };
      notifications.push(newNotification);
      this.setCollection('notifications', notifications);
      return newNotification;
    },
    
    markAsRead: (id: string): void => {
      const notifications = this.getCollection<Notification>('notifications');
      const index = notifications.findIndex(n => n.id === id);
      if (index !== -1) {
        notifications[index].read = true;
        this.setCollection('notifications', notifications);
      }
    },
    
    markAllAsRead: (userId: string): void => {
      const notifications = this.getCollection<Notification>('notifications');
      notifications.forEach(n => {
        if (n.userId === userId) n.read = true;
      });
      this.setCollection('notifications', notifications);
    },
  };

  // EMAIL TEMPLATES
  emailTemplates = {
    getByEvent: (eventId: string): EmailTemplate[] => 
      this.getCollection<EmailTemplate>('emailTemplates').filter(t => t.eventId === eventId),
    
    create: (data: Omit<EmailTemplate, 'id'>): EmailTemplate => {
      const templates = this.getCollection<EmailTemplate>('emailTemplates');
      const newTemplate: EmailTemplate = {
        ...data,
        id: this.generateId(),
      };
      templates.push(newTemplate);
      this.setCollection('emailTemplates', templates);
      return newTemplate;
    },
    
    update: (id: string, data: Partial<EmailTemplate>): EmailTemplate => {
      const templates = this.getCollection<EmailTemplate>('emailTemplates');
      const index = templates.findIndex(t => t.id === id);
      if (index === -1) throw new Error('Plantilla no encontrada');
      templates[index] = { ...templates[index], ...data };
      this.setCollection('emailTemplates', templates);
      return templates[index];
    },
  };

  // STATS
  stats = {
    getDashboard: (userId: string, role: string) => {
      const abstracts = role === 'ADMIN' || role === 'COMMITTEE' 
        ? this.abstracts.getAll() 
        : this.abstracts.getByUser(userId);
      
      return {
        totalAbstracts: abstracts.length,
        pendingReview: abstracts.filter(a => a.status === 'EN_PROCESO').length,
        approved: abstracts.filter(a => a.status === 'APROBADO').length,
        rejected: abstracts.filter(a => a.status === 'RECHAZADO').length,
        events: this.events.getActive().length,
      };
    },
  };
}

export const db = new Database();
db.init();
