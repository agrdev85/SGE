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
  phone?: string;
  specialization?: string;
}

export interface Event {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  bannerImageUrl: string;
  backgroundImageUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor?: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  formFields?: FormField[];
  userFormFields?: FormField[];
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
  width?: 'full' | 'half';
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
  | 'separator'
  | 'heading';

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
  assignedReviewers?: string[];
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
  type: 'abstract_status' | 'review_assigned' | 'event_update' | 'system' | 'email_sent';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface EmailTemplate {
  id: string;
  eventId: string;
  type: 'INSCRIPCION' | 'ASIGNACION_JURADO' | 'APROBADO' | 'RECHAZADO' | 'CERTIFICADO' | 'CUSTOM';
  subject: string;
  htmlBody: string;
  name?: string;
}

export interface SentEmail {
  id: string;
  eventId: string;
  templateId?: string;
  recipientId: string;
  recipientEmail: string;
  subject: string;
  sentAt: string;
  status: 'sent' | 'failed';
}

export interface JuryAssignment {
  id: string;
  eventId: string;
  reviewerId: string;
  abstractId: string;
  assignedAt: string;
  status: 'pending' | 'completed';
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
        specialization: 'Biotecnología',
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
        specialization: 'Genética Molecular',
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
        specialization: 'Farmacología',
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
      {
        id: '5',
        name: 'Dr. Pedro López',
        email: 'pedro@example.com',
        passwordHash: 'demo',
        role: 'REVIEWER',
        country: 'México',
        affiliation: 'UNAM',
        createdAt: '2024-01-12',
        isActive: true,
        specialization: 'Bioinformática',
      },
      {
        id: '6',
        name: 'Dra. Laura Sánchez',
        email: 'laura@example.com',
        passwordHash: 'demo',
        role: 'REVIEWER',
        country: 'España',
        affiliation: 'CSIC',
        createdAt: '2024-01-14',
        isActive: true,
        specialization: 'Inmunología',
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
        backgroundImageUrl: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=1920&h=1080&fit=crop',
        primaryColor: '#1e40af',
        secondaryColor: '#059669',
        backgroundColor: '#f0f9ff',
        isActive: true,
        createdBy: '4',
        createdAt: '2024-01-01',
        formFields: [
          { id: 'f1', eventId: '1', fieldType: 'text', label: 'Nombre Completo', isRequired: true, orderIndex: 0, width: 'full' },
          { id: 'f2', eventId: '1', fieldType: 'email', label: 'Correo Electrónico', isRequired: true, orderIndex: 1, width: 'half' },
          { id: 'f3', eventId: '1', fieldType: 'phone', label: 'Teléfono', isRequired: false, orderIndex: 2, width: 'half' },
          { id: 'f4', eventId: '1', fieldType: 'text', label: 'Institución', isRequired: true, orderIndex: 3, width: 'full' },
          { id: 'f5', eventId: '1', fieldType: 'select', label: 'País', isRequired: true, orderIndex: 4, options: ['Cuba', 'México', 'España', 'Argentina'], width: 'half' },
          { id: 'f6', eventId: '1', fieldType: 'select', label: 'Tipo de Participación', isRequired: true, orderIndex: 5, options: ['Ponente', 'Asistente', 'Poster'], width: 'half' },
        ],
      },
      {
        id: '2',
        name: 'Simposio de Nanociencias 2024',
        description: 'Explorando las fronteras de la nanotecnología aplicada.',
        startDate: '2024-09-10',
        endDate: '2024-09-12',
        bannerImageUrl: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=1200&h=400&fit=crop',
        backgroundImageUrl: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=1920&h=1080&fit=crop',
        primaryColor: '#7c3aed',
        secondaryColor: '#ec4899',
        backgroundColor: '#fdf4ff',
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
      {
        id: '3',
        userId: '1',
        eventId: '1',
        title: 'Bioinformática aplicada al diseño de fármacos',
        summaryText: 'Utilizando técnicas de inteligencia artificial para acelerar el descubrimiento de nuevos fármacos.',
        keywords: ['bioinformática', 'IA', 'diseño de fármacos'],
        authors: ['Dr. María García'],
        status: 'EN_PROCESO',
        version: 1,
        createdAt: '2024-02-20',
        updatedAt: '2024-02-20',
      },
      {
        id: '4',
        userId: '1',
        eventId: '1',
        title: 'Nanotecnología en sistemas de liberación de fármacos',
        summaryText: 'Desarrollo de nanopartículas para la entrega dirigida de medicamentos.',
        keywords: ['nanotecnología', 'drug delivery', 'nanopartículas'],
        authors: ['Dr. María García', 'Dr. Pedro López'],
        status: 'EN_PROCESO',
        version: 1,
        createdAt: '2024-02-25',
        updatedAt: '2024-02-25',
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
      {
        id: '2',
        userId: '2',
        type: 'review_assigned',
        title: 'Nuevos trabajos asignados',
        message: 'Se te han asignado 3 trabajos para revisar.',
        read: false,
        createdAt: new Date().toISOString(),
        link: '/review',
      },
    ];
    this.setCollection('notifications', notifications);

    // Seed Email Templates
    const emailTemplates: EmailTemplate[] = [
      {
        id: '1',
        eventId: '1',
        type: 'INSCRIPCION',
        name: 'Confirmación de Inscripción',
        subject: 'Confirmación de inscripción - {{eventName}}',
        htmlBody: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, {{primaryColor}}, {{secondaryColor}}); padding: 40px; text-align: center;">
              <img src="{{bannerImage}}" alt="{{eventName}}" style="max-width: 100%; height: auto; border-radius: 8px;">
            </div>
            <div style="padding: 30px; background: #ffffff;">
              <h1 style="color: {{primaryColor}};">¡Bienvenido, {{userName}}!</h1>
              <p>Tu inscripción al evento <strong>{{eventName}}</strong> ha sido confirmada.</p>
              <p><strong>Fecha:</strong> {{eventDate}}</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="{{eventLink}}" style="background: {{primaryColor}}; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px;">Ver Detalles del Evento</a>
              </div>
            </div>
          </div>
        `,
      },
      {
        id: '2',
        eventId: '1',
        type: 'ASIGNACION_JURADO',
        name: 'Asignación de Trabajos',
        subject: 'Nuevos trabajos asignados para revisión - {{eventName}}',
        htmlBody: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, {{primaryColor}}, {{secondaryColor}}); padding: 40px; text-align: center;">
              <h1 style="color: white;">{{eventName}}</h1>
            </div>
            <div style="padding: 30px; background: #ffffff;">
              <h2 style="color: {{primaryColor}};">Hola {{userName}},</h2>
              <p>Se te han asignado <strong>{{workCount}}</strong> trabajos para revisar.</p>
              <p>Por favor, completa las revisiones antes del <strong>{{deadline}}</strong>.</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="{{reviewLink}}" style="background: {{primaryColor}}; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px;">Ir a Revisiones</a>
              </div>
            </div>
          </div>
        `,
      },
      {
        id: '3',
        eventId: '1',
        type: 'APROBADO',
        name: 'Trabajo Aprobado',
        subject: '¡Felicidades! Tu trabajo ha sido aprobado - {{eventName}}',
        htmlBody: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, {{primaryColor}}, {{secondaryColor}}); padding: 40px; text-align: center;">
              <h1 style="color: white;">🎉 ¡Felicidades!</h1>
            </div>
            <div style="padding: 30px; background: #ffffff;">
              <h2 style="color: {{primaryColor}};">Hola {{userName}},</h2>
              <p>Nos complace informarte que tu trabajo <strong>"{{abstractTitle}}"</strong> ha sido <span style="color: green; font-weight: bold;">APROBADO</span>.</p>
              <p><strong>Categoría:</strong> {{categoryType}}</p>
              <p>Pronto recibirás más información sobre la presentación.</p>
            </div>
          </div>
        `,
      },
    ];
    this.setCollection('emailTemplates', emailTemplates);
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

    getReviewers: (): User[] => 
      this.getCollection<User>('users').filter(u => u.role === 'REVIEWER' && u.isActive),
    
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

    updatePassword: (id: string, newPassword: string): void => {
      const users = this.getCollection<User>('users');
      const index = users.findIndex(u => u.id === id);
      if (index === -1) throw new Error('Usuario no encontrado');
      users[index].passwordHash = newPassword;
      this.setCollection('users', users);
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

    updateUserFormFields: (eventId: string, fields: FormField[]): Event => {
      const events = this.getCollection<Event>('events');
      const index = events.findIndex(e => e.id === eventId);
      if (index === -1) throw new Error('Evento no encontrado');
      events[index].userFormFields = fields;
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

    getPendingByEvent: (eventId: string): Abstract[] => 
      this.getCollection<Abstract>('abstracts').filter(a => a.eventId === eventId && a.status === 'EN_PROCESO'),
    
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

    assignReviewers: (id: string, reviewerIds: string[]): Abstract => {
      return this.abstracts.update(id, { assignedReviewers: reviewerIds });
    },
  };

  // REVIEWS CRUD
  reviews = {
    getAll: (): Review[] => this.getCollection<Review>('reviews'),
    
    getByAbstract: (abstractId: string): Review[] => 
      this.getCollection<Review>('reviews').filter(r => r.abstractId === abstractId),
    
    getByReviewer: (reviewerId: string): Review[] => 
      this.getCollection<Review>('reviews').filter(r => r.reviewerId === reviewerId),

    getCountByReviewer: (reviewerId: string): number =>
      this.getCollection<Review>('reviews').filter(r => r.reviewerId === reviewerId).length,
    
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

    getUnreadCount: (userId: string): number =>
      this.notifications.getUnread(userId).length,
    
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

    delete: (id: string): void => {
      const notifications = this.getCollection<Notification>('notifications').filter(n => n.id !== id);
      this.setCollection('notifications', notifications);
    },
  };

  // EMAIL TEMPLATES
  emailTemplates = {
    getByEvent: (eventId: string): EmailTemplate[] => 
      this.getCollection<EmailTemplate>('emailTemplates').filter(t => t.eventId === eventId),

    getById: (id: string): EmailTemplate | undefined =>
      this.getCollection<EmailTemplate>('emailTemplates').find(t => t.id === id),
    
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

    delete: (id: string): void => {
      const templates = this.getCollection<EmailTemplate>('emailTemplates').filter(t => t.id !== id);
      this.setCollection('emailTemplates', templates);
    },
  };

  // SENT EMAILS
  sentEmails = {
    getByEvent: (eventId: string): SentEmail[] =>
      this.getCollection<SentEmail>('sentEmails').filter(e => e.eventId === eventId),

    create: (data: Omit<SentEmail, 'id'>): SentEmail => {
      const emails = this.getCollection<SentEmail>('sentEmails');
      const newEmail: SentEmail = { ...data, id: this.generateId() };
      emails.push(newEmail);
      this.setCollection('sentEmails', emails);
      return newEmail;
    },
  };

  // JURY ASSIGNMENTS
  juryAssignments = {
    getByEvent: (eventId: string): JuryAssignment[] =>
      this.getCollection<JuryAssignment>('juryAssignments').filter(a => a.eventId === eventId),

    getByReviewer: (reviewerId: string): JuryAssignment[] =>
      this.getCollection<JuryAssignment>('juryAssignments').filter(a => a.reviewerId === reviewerId),

    create: (data: Omit<JuryAssignment, 'id'>): JuryAssignment => {
      const assignments = this.getCollection<JuryAssignment>('juryAssignments');
      const newAssignment: JuryAssignment = { ...data, id: this.generateId() };
      assignments.push(newAssignment);
      this.setCollection('juryAssignments', assignments);
      return newAssignment;
    },

    deleteByEvent: (eventId: string): void => {
      const assignments = this.getCollection<JuryAssignment>('juryAssignments').filter(a => a.eventId !== eventId);
      this.setCollection('juryAssignments', assignments);
    },

    // Automatic equitable assignment of abstracts to reviewers
    autoAssign: (eventId: string): { assignments: JuryAssignment[]; stats: { reviewerId: string; count: number }[] } => {
      const reviewers = this.users.getReviewers();
      const pendingAbstracts = this.abstracts.getPendingByEvent(eventId);
      
      if (reviewers.length === 0) {
        throw new Error('No hay revisores disponibles');
      }
      
      if (pendingAbstracts.length === 0) {
        throw new Error('No hay trabajos pendientes para asignar');
      }

      // Delete existing assignments for this event
      this.juryAssignments.deleteByEvent(eventId);

      // Calculate equitable distribution
      const abstractsPerReviewer = Math.floor(pendingAbstracts.length / reviewers.length);
      const remainder = pendingAbstracts.length % reviewers.length;

      const assignments: JuryAssignment[] = [];
      const stats: { reviewerId: string; count: number }[] = [];
      let abstractIndex = 0;

      reviewers.forEach((reviewer, reviewerIndex) => {
        // Some reviewers get one extra if there's a remainder
        const count = abstractsPerReviewer + (reviewerIndex < remainder ? 1 : 0);
        
        for (let i = 0; i < count && abstractIndex < pendingAbstracts.length; i++) {
          const assignment = this.juryAssignments.create({
            eventId,
            reviewerId: reviewer.id,
            abstractId: pendingAbstracts[abstractIndex].id,
            assignedAt: new Date().toISOString(),
            status: 'pending',
          });
          
          // Update abstract with assigned reviewer
          const abstract = pendingAbstracts[abstractIndex];
          const currentReviewers = abstract.assignedReviewers || [];
          this.abstracts.assignReviewers(abstract.id, [...currentReviewers, reviewer.id]);
          
          assignments.push(assignment);
          abstractIndex++;
        }

        stats.push({ reviewerId: reviewer.id, count });

        // Create notification for reviewer
        this.notifications.create({
          userId: reviewer.id,
          type: 'review_assigned',
          title: 'Nuevos trabajos asignados',
          message: `Se te han asignado ${count} trabajo(s) para revisar.`,
          link: '/review',
        });
      });

      return { assignments, stats };
    },
  };

  // EMAIL SERVICE (simulated)
  emailService = {
    sendEmail: (
      eventId: string,
      templateId: string,
      recipientId: string,
      variables: Record<string, string>
    ): SentEmail => {
      const template = this.emailTemplates.getById(templateId);
      const user = this.users.getById(recipientId);
      const event = this.events.getById(eventId);

      if (!template || !user || !event) {
        throw new Error('Datos incompletos para enviar email');
      }

      // Replace variables in template
      let subject = template.subject;
      let body = template.htmlBody;

      const allVariables = {
        ...variables,
        userName: user.name,
        userEmail: user.email,
        eventName: event.name,
        primaryColor: event.primaryColor,
        secondaryColor: event.secondaryColor,
        bannerImage: event.bannerImageUrl,
        backgroundImage: event.backgroundImageUrl || event.bannerImageUrl,
      };

      Object.entries(allVariables).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        subject = subject.replace(regex, value);
        body = body.replace(regex, value);
      });

      // Simulate sending
      const sentEmail = this.sentEmails.create({
        eventId,
        templateId,
        recipientId,
        recipientEmail: user.email,
        subject,
        sentAt: new Date().toISOString(),
        status: 'sent',
      });

      // Create notification
      this.notifications.create({
        userId: recipientId,
        type: 'email_sent',
        title: 'Nuevo correo recibido',
        message: subject,
      });

      return sentEmail;
    },

    sendBulkEmail: (
      eventId: string,
      templateId: string,
      recipientIds: string[],
      variables: Record<string, string>
    ): SentEmail[] => {
      return recipientIds.map(recipientId => 
        this.emailService.sendEmail(eventId, templateId, recipientId, variables)
      );
    },
  };
}

// Export singleton instance
export const db = new Database();

// Initialize on import
db.init();
