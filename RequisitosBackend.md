# Requisitos Backend - SGE (Sistema de Gestión de Eventos)

## 1. Introducción

### 1.1. Propósito
Este documento establece los requisitos técnicos y funcionales para el desarrollo del backend del Sistema de Gestión de Eventos (SGE). El backend debe proporcionar una API REST robusta, segura y escalable que soporte todas las funcionalidades del frontend React/TypeScript.

### 1.2. Arquitectura General
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Frontend SPA  │────▶│   API REST      │────▶│   Base de Datos │
│   (React/Vite)  │◀────│   (Node/Express)│◀────│   (PostgreSQL)  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │
        │                       ▼
        │               ┌─────────────────┐
        │               │   Email Service │
        │               │   (SMTP/SES)   │
        └──────────────▶└─────────────────┘
```

### 1.3. Stack Tecnológico Recomendado
- **Runtime**: Node.js 20 LTS o superior
- **Framework**: Express.js o Fastify
- **Base de Datos**: PostgreSQL 15+ con Prisma ORM
- **Autenticación**: JWT (JSON Web Tokens)
- **Email**: Nodemailer con SMTP/SES
- **Validación**: Zod o Yup
- **Documentación API**: OpenAPI/Swagger
- **Contenedores**: Docker + Docker Compose

---

## 2. Base de Datos

### 2.1. Sistema Gestor de BD
- **PostgreSQL 15+** con soporte para JSONB
- Permisos por rol de base de datos
- Backups automáticos diarios
- Replicación para alta disponibilidad

### 2.2. Esquema de Colecciones/Entidades

#### 2.2.1. Tablas de Nomencladores (Globales)

##### `receptivos`
| Campo | Tipo | Constraints | Descripción |
|-------|------|-------------|-------------|
| id | UUID | PK | Identificador único |
| siglas | VARCHAR(20) | UNIQUE, NOT NULL | Código interno único |
| nombre | VARCHAR(100) | NOT NULL | Nombre comercial |
| pais_id | UUID | FK → paises | País del receptivo |
| contacto_email | VARCHAR(100) | | Email corporativo |
| contacto_telefono | VARCHAR(20) | | Teléfono |
| activo | BOOLEAN | DEFAULT true | Estado |
| created_at | TIMESTAMP | | Fecha creación |
| updated_at | TIMESTAMP | | Última modificación |

##### `empresas`
| Campo | Tipo | Constraints | Descripción |
|-------|------|-------------|-------------|
| id | UUID | PK | Identificador único |
| receptivo_id | UUID | FK → receptivos | Receptivo padre |
| codigo | VARCHAR(20) | NOT NULL | Código interno único por receptivo |
| nombre | VARCHAR(100) | NOT NULL | Razón social |
| nit_rfc | VARCHAR(50) | | Identificación fiscal |
| contacto_principal | VARCHAR(100) | | Persona de contacto |
| contacto_email | VARCHAR(100) | | Email |
| contacto_telefono | VARCHAR(20) | | Teléfono |
| direccion | TEXT | | Dirección |
| activo | BOOLEAN | DEFAULT true | Estado |
| created_at | TIMESTAMP | | Fecha creación |
| updated_at | TIMESTAMP | | Última modificación |

##### `hoteles`
| Campo | Tipo | Constraints | Descripción |
|-------|------|-------------|-------------|
| id | UUID | PK | Identificador único |
| nombre | VARCHAR(100) | NOT NULL | Nombre comercial |
| cadena_hotelera | VARCHAR(50) | | Cadena hotelera |
| categoria_estrellas | INT | CHECK (1-5) | Estrellas |
| ciudad | VARCHAR(50) | | Ciudad |
| direccion | TEXT | | Dirección |
| telefono | VARCHAR(20) | | Teléfono |
| email | VARCHAR(100) | | Email |
| activo | BOOLEAN | DEFAULT true | Estado |
| created_at | TIMESTAMP | | Fecha creación |
| updated_at | TIMESTAMP | | Última modificación |

##### `tipos_participacion`
| Campo | Tipo | Constraints | Descripción |
|-------|------|-------------|-------------|
| id | UUID | PK | Identificador único |
| nombre | VARCHAR(50) | UNIQUE, NOT NULL | Nombre |
| descripcion | TEXT | | Descripción |
| requiere_pago | BOOLEAN | DEFAULT true | Requiere pago |
| aparece_en_listado_publico | BOOLEAN | DEFAULT true | Visibilidad pública |
| activo | BOOLEAN | DEFAULT true | Estado |

##### `tipos_transporte`
| Campo | Tipo | Constraints | Descripción |
|-------|------|-------------|-------------|
| id | UUID | PK | Identificador único |
| nombre | VARCHAR(50) | NOT NULL | Nombre |
| descripcion | TEXT | | Descripción |
| capacidad_min | INT | | Capacidad mínima |
| capacidad_max | INT | | Capacidad máxima |
| requiere_chofer | BOOLEAN | DEFAULT true | Necesita chofer |
| requiere_licencia_especial | BOOLEAN | DEFAULT false | Licencia especial |
| costo_por_persona | BOOLEAN | DEFAULT true | Costo por persona |
| activo | BOOLEAN | DEFAULT true | Estado |

##### `tipos_habitacion`
| Campo | Tipo | Constraints | Descripción |
|-------|------|-------------|-------------|
| id | UUID | PK | Identificador único |
| nombre | VARCHAR(50) | NOT NULL | Nombre |
| descripcion | TEXT | | Descripción |
| capacidad_max_personas | INT | | Capacidad máxima |
| activo | BOOLEAN | DEFAULT true | Estado |

##### `hoteles_tipos_habitacion`
| Campo | Tipo | Constraints | Descripción |
|-------|------|-------------|-------------|
| id | UUID | PK | Identificador único |
| hotel_id | UUID | FK → hoteles | Hotel |
| tipo_habitacion_id | UUID | FK → tipos_habitacion | Tipo habitación |
| precio_con_desayuno | DECIMAL(10,2) | | Precio con desayuno |
| precio_con_todo_incluido | DECIMAL(10,2) | | Precio todo incluido |
| activo | BOOLEAN | DEFAULT true | Estado |

##### `salones`
| Campo | Tipo | Constraints | Descripción |
|-------|------|-------------|-------------|
| id | UUID | PK | Identificador único |
| hotel_id | UUID | FK → hoteles | Hotel |
| codigo | VARCHAR(20) | UNIQUE | Código del salón |
| nombre | VARCHAR(100) | NOT NULL | Nombre |
| ubicacion | VARCHAR(100) | | Ubicación dentro del hotel |
| capacidad_maxima | INT | | Capacidad máxima |
| estado | VARCHAR(20) | DEFAULT 'ACTIVO' | Estado (ACTIVO/INACTIVO) |
| imagenes | JSONB | DEFAULT '[]' | URLs de imágenes |
| created_at | TIMESTAMP | | Fecha creación |
| updated_at | TIMESTAMP | | Última modificación |

#### 2.2.2. Tablas de Eventos

##### `macro_eventos`
| Campo | Tipo | Constraints | Descripción |
|-------|------|-------------|-------------|
| id | UUID | PK | Identificador único |
| name | VARCHAR(200) | NOT NULL | Nombre del evento |
| acronym | VARCHAR(20) | UNIQUE, NOT NULL | Siglas únicas |
| description | TEXT | | Descripción |
| start_date | TIMESTAMP | | Fecha inicio |
| end_date | TIMESTAMP | | Fecha fin |
| logo_url | VARCHAR(500) | | URL del logo |
| banner_image_url | VARCHAR(500) | | URL del banner |
| background_image_url | VARCHAR(500) | | URL imagen fondo |
| content | TEXT | | Contenido HTML |
| primary_color | VARCHAR(7) | | Color primario |
| secondary_color | VARCHAR(7) | | Color secundario |
| background_color | VARCHAR(7) | | Color fondo |
| registration_fields | JSONB | DEFAULT '[]' | Campos de registro |
| receptivo_id | UUID | FK → receptivos | Receptivo (aislamiento) |
| empresa_id | UUID | FK → empresas | Empresa (aislamiento) |
| moneda_principal | VARCHAR(3) | DEFAULT 'USD' | Moneda |
| tasas_cambio | JSONB | | Tasas de cambio |
| estado_configuracion | VARCHAR(20) | DEFAULT 'BORRADOR' | Estado |
| paso_actual | INT | DEFAULT 0 | Paso actual wizard |
| is_active | BOOLEAN | DEFAULT true | Estado |
| created_at | TIMESTAMP | | Fecha creación |

##### `eventos`
| Campo | Tipo | Constraints | Descripción |
|-------|------|-------------|-------------|
| id | UUID | PK | Identificador único |
| name | VARCHAR(200) | NOT NULL | Nombre |
| name_en | VARCHAR(200) | | Nombre en inglés |
| description | TEXT | | Descripción |
| macro_evento_id | UUID | FK → macro_eventos | Macro evento padre |
| start_date | DATE | | Fecha inicio |
| end_date | DATE | | Fecha fin |
| banner_image_url | VARCHAR(500) | | Banner |
| background_image_url | VARCHAR(500) | | Imagen fondo |
| primary_color | VARCHAR(7) | | Color primario |
| secondary_color | VARCHAR(7) | | Color secundario |
| background_color | VARCHAR(7) | | Color fondo |
| form_fields | JSONB | | Campos de formulario |
| user_form_fields | JSONB | | Campos de formulario usuario |
| is_active | BOOLEAN | DEFAULT true | Estado |
| created_by | UUID | FK → users | Creador |
| created_at | TIMESTAMP | | Fecha creación |

##### `event_sessions`
| Campo | Tipo | Constraints | Descripción |
|-------|------|-------------|-------------|
| id | UUID | PK | Identificador único |
| event_id | UUID | FK → eventos | Evento |
| date | DATE | NOT NULL | Fecha |
| start_time | TIME | NOT NULL | Hora inicio |
| end_time | TIME | NOT NULL | Hora fin |
| salon_id | UUID | FK → salones | Salón |
| is_active | BOOLEAN | DEFAULT true | Estado |
| created_at | TIMESTAMP | | Fecha creación |

##### `session_attendance`
| Campo | Tipo | Constraints | Descripción |
|-------|------|-------------|-------------|
| id | UUID | PK | Identificador único |
| session_id | UUID | FK → event_sessions | Sesión |
| event_id | UUID | FK → eventos | Evento |
| user_id | UUID | FK → users | Usuario |
| attended | BOOLEAN | DEFAULT false | Asistió |
| marked_at | TIMESTAMP | | Fecha marcación |

#### 2.2.3. Tablas de hoteles y habitaciones por evento

##### `evento_hoteles`
| Campo | Tipo | Constraints | Descripción |
|-------|------|-------------|-------------|
| id | UUID | PK | Identificador único |
| evento_id | UUID | FK → macro_eventos | Evento |
| hotel_id | UUID | FK → hoteles | Hotel |
| fecha_checkin | DATE | | Fecha check-in |
| fecha_checkout | DATE | | Fecha check-out |
| precio_override | JSONB | | Override de precios |

##### `evento_hotel_habitaciones`
| Campo | Tipo | Constraints | Descripción |
|-------|------|-------------|-------------|
| id | UUID | PK | Identificador único |
| evento_hotel_id | UUID | FK → evento_hoteles | Evento-Hotel |
| tipo_habitacion_id | UUID | FK → tipos_habitacion | Tipo habitación |
| precio_cup | DECIMAL(10,2) | | Precio CUP |
| precio_moneda | DECIMAL(10,2) | | Precio en moneda selecteda |
| moneda | VARCHAR(3) | | Moneda |
| cupo | INT | | Cupo disponible |

##### `evento_salones`
| Campo | Tipo | Constraints | Descripción |
|-------|------|-------------|-------------|
| id | UUID | PK | Identificador único |
| evento_id | UUID | FK → macro_eventos | Evento |
| salon_id | UUID | FK → salones | Salón |
| disponible | BOOLEAN | DEFAULT true | Disponible |

##### `evento_tipos_participacion`
| Campo | Tipo | Constraints | Descripción |
|-------|------|-------------|-------------|
| id | UUID | PK | Identificador único |
| evento_id | UUID | FK → macro_eventos | Evento |
| tipo_participacion_id | UUID | FK → tipos_participacion | Tipo participación |
| precio_cup | DECIMAL(10,2) | | Precio CUP |
| precio_moneda | DECIMAL(10,2) | | Precio |
| moneda | VARCHAR(3) | | Moneda |
| capacidad | INT | | Capacidad |
| aparece_en_listado_publico | BOOLEAN | DEFAULT true | Visibilidad |

#### 2.2.4. Tablas de transporte

##### `rutas_transporte`
| Campo | Tipo | Constraints | Descripción |
|-------|------|-------------|-------------|
| id | UUID | PK | Identificador único |
| evento_id | UUID | FK → macro_eventos | Evento |
| nombre | VARCHAR(100) | NOT NULL | Nombre ruta |
| origen | VARCHAR(200) | | Origen |
| destino | VARCHAR(200) | | Destino |
| tipo_vehiculo_id | UUID | FK → tipos_transporte | Tipo vehículo |
| precio_cup | DECIMAL(10,2) | | Precio CUP |
| precio_moneda | DECIMAL(10,2) | | Precio |
| moneda | VARCHAR(3) | | Moneda |
| activo | BOOLEAN | DEFAULT true | Estado |
| created_at | TIMESTAMP | | Fecha creación |

##### `reservas_transporte`
| Campo | Tipo | Constraints | Descripción |
|-------|------|-------------|-------------|
| id | UUID | PK | Identificador único |
| ruta_id | UUID | FK → rutas_transporte | Ruta |
| usuario_id | UUID | FK → users | Usuario |
| fecha | DATE | NOT NULL | Fecha |
| cantidad_personas | INT | NOT NULL | Cantidad personas |
| estado | VARCHAR(20) | DEFAULT 'PENDIENTE' | Estado |
| created_at | TIMESTAMP | | Fecha creación |

#### 2.2.5. Tablas de actividades sociales

##### `actividades_sociales`
| Campo | Tipo | Constraints | Descripción |
|-------|------|-------------|-------------|
| id | UUID | PK | Identificador único |
| evento_id | UUID | FK → macro_eventos | Evento |
| nombre | VARCHAR(200) | NOT NULL | Nombre |
| descripcion | TEXT | | Descripción |
| fecha | DATE | | Fecha |
| hora_inicio | TIME | | Hora inicio |
| hora_fin | TIME | | Hora fin |
| punto_encuentro | VARCHAR(200) | | Punto encuentro |
| hora_encuentro | TIME | | Hora reunión |
| destino | VARCHAR(200) | | Destino |
| direccion_exacta | TEXT | | Dirección exacta |
| es_gratuita | BOOLEAN | DEFAULT false | Gratuita |
| precio_cup | DECIMAL(10,2) | | Precio CUP |
| precio_moneda | DECIMAL(10,2) | | Precio |
| moneda | VARCHAR(3) | | Moneda |
| cupo_maximo | INT | | Cupo máximo |
| cupo_minimo | INT | | Cupo mínimo |
| fecha_limite_reserva | DATE | | Fecha límite |
| requiere_transporte | BOOLEAN | DEFAULT false | Requiere transporte |
| tipo_vehiculo | VARCHAR(50) | | Tipo vehículo |
| guia_incluido | BOOLEAN | DEFAULT false | Guía incluido |
| idioma_guia | JSONB | DEFAULT '[]' | Idiomas guía |
| imagenes | JSONB | DEFAULT '[]' | Imágenes |
| estado | VARCHAR(20) | DEFAULT 'ACTIVO' | Estado |
| created_at | TIMESTAMP | | Fecha creación |

##### `reservas_actividades`
| Campo | Tipo | Constraints | Descripción |
|-------|------|-------------|-------------|
| id | UUID | PK | Identificador único |
| actividad_id | UUID | FK → actividades_sociales | Actividad |
| usuario_id | UUID | FK → users | Usuario |
| estado_pago | VARCHAR(20) | DEFAULT 'PENDIENTE' | Estado pago |
| monto_pagado | DECIMAL(10,2) | | Monto pagado |
| fecha_reserva | TIMESTAMP | | Fecha reserva |
| fecha_pago | TIMESTAMP | | Fecha pago |

#### 2.2.6. Tablas de usuarios y autenticación

##### `users`
| Campo | Tipo | Constraints | Descripción |
|-------|------|-------------|-------------|
| id | UUID | PK | Identificador único |
| name | VARCHAR(100) | NOT NULL | Nombre |
| email | VARCHAR(100) | UNIQUE, NOT NULL | Email |
| password_hash | VARCHAR(255) | NOT NULL | Hash contraseña |
| role | VARCHAR(50) | NOT NULL | Rol |
| country | VARCHAR(50) | | País |
| affiliation | VARCHAR(200) | | Afiliación |
| avatar | VARCHAR(500) | | URL avatar |
| phone | VARCHAR(20) | | Teléfono |
| id_document | VARCHAR(50) | | Documento ID |
| affiliation_type | VARCHAR(50) | | Tipo afiliación |
| economic_sector | VARCHAR(100) | | Sector económico |
| participation_type | VARCHAR(50) | | Tipo participación |
| scientific_level | VARCHAR(50) | | Nivel científico |
| educational_level | VARCHAR(50) | | Nivel educacional |
| gender | VARCHAR(20) | | Género |
| specialization | VARCHAR(100) | | Especialización |
| reviewer_thematics | JSONB | | Temáticas revisor |
| is_participant | BOOLEAN | DEFAULT false | Es participante |
| receptivo_id | UUID | FK → receptivos | Aislamiento receptivo |
| empresa_id | UUID | FK → empresas | Aislamiento empresa |
| hotel_id | UUID | FK → hoteles | Aislamiento hotel |
| is_active | BOOLEAN | DEFAULT true | Estado |
| created_at | TIMESTAMP | | Fecha creación |

#### 2.2.7. Tablas de abstracts y revisión

##### `abstracts`
| Campo | Tipo | Constraints | Descripción |
|-------|------|-------------|-------------|
| id | UUID | PK | Identificador único |
| user_id | UUID | FK → users | Autor principal |
| event_id | UUID | FK → macro_eventos | Evento |
| title | VARCHAR(500) | NOT NULL | Título |
| summary_text | TEXT | | Resumen |
| keywords | JSONB | | Palabras clave |
| authors | JSONB | | Lista de autores |
| main_author_id | VARCHAR(50) | | ID autor principal |
| status | VARCHAR(30) | DEFAULT 'EN_PROCESO' | Estado |
| version | INT | DEFAULT 1 | Versión |
| category_type | VARCHAR(30) | | Categoría |
| thematic_id | UUID | FK → thematics | Temática |
| assigned_reviewer_id | UUID | FK → users | Revisor asignado |
| session_id | UUID | FK → event_sessions | Sesión asignada |
| created_at | TIMESTAMP | | Fecha creación |
| updated_at | TIMESTAMP | | Última modificación |

##### `reviews`
| Campo | Tipo | Constraints | Descripción |
|-------|------|-------------|-------------|
| id | UUID | PK | Identificador único |
| abstract_id | UUID | FK → abstracts | Abstract |
| reviewer_id | UUID | FK → users | Revisor |
| decision | VARCHAR(30) | NOT NULL | Decisión |
| comment | TEXT | | Comentario |
| score | INT | CHECK (0-100) | Puntuación |
| reviewed_at | TIMESTAMP | | Fecha revisión |

##### `work_assignments`
| Campo | Tipo | Constraints | Descripción |
|-------|------|-------------|-------------|
| id | UUID | PK | Identificador único |
| abstract_id | UUID | FK → abstracts | Abstract |
| reviewer_id | UUID | FK → users | Revisor |
| assigned_by | UUID | FK → users | Asignado por |
| assigned_at | TIMESTAMP | | Fecha asignación |
| status | VARCHAR(20) | DEFAULT 'pending' | Estado |

##### `jury_assignments`
| Campo | Tipo | Constraints | Descripción |
|-------|------|-------------|-------------|
| id | UUID | PK | Identificador único |
| event_id | UUID | FK → macro_eventos | Evento |
| reviewer_id | UUID | FK → users | Revisor |
| abstract_id | UUID | FK → abstracts | Abstract |
| assigned_at | TIMESTAMP | | Fecha asignación |
| status | VARCHAR(20) | DEFAULT 'pending' | Estado |

##### `thematics`
| Campo | Tipo | Constraints | Descripción |
|-------|------|-------------|-------------|
| id | UUID | PK | Identificador único |
| event_id | UUID | FK → macro_eventos | Evento |
| name | VARCHAR(100) | NOT NULL | Nombre |
| description | TEXT | | Descripción |
| duration | INT | | Duración (minutos) |
| created_at | TIMESTAMP | | Fecha creación |

##### `committee_members`
| Campo | Tipo | Constraints | Descripción |
|-------|------|-------------|-------------|
| id | UUID | PK | Identificador único |
| user_id | UUID | FK → users | Usuario |
| event_id | UUID | FK → macro_eventos | Evento |
| role | VARCHAR(30) | NOT NULL | Rol en comité |
| thematic | VARCHAR(100) | | Temática asignada |
| assigned_at | TIMESTAMP | | Fecha asignación |

##### `program_sessions`
| Campo | Tipo | Constraints | Descripción |
|-------|------|-------------|-------------|
| id | UUID | PK | Identificador único |
| event_id | UUID | FK → macro_eventos | Evento |
| title | VARCHAR(200) | NOT NULL | Título |
| thematic_id | UUID | FK → thematics | Temática |
| date | DATE | NOT NULL | Fecha |
| start_time | TIME | NOT NULL | Hora inicio |
| end_time | TIME | NOT NULL | Hora fin |
| location | VARCHAR(100) | | Ubicación |
| type | VARCHAR(30) | | Tipo sesión |
| abstracts | JSONB | DEFAULT '[]' | IDs de abstracts |
| moderator | VARCHAR(100) | | Moderador |
| order_index | INT | | Orden |

##### `delegate_programs`
| Campo | Tipo | Constraints | Descripción |
|-------|------|-------------|-------------|
| id | UUID | PK | Identificador único |
| user_id | UUID | FK → users | Usuario |
| event_id | UUID | FK → macro_eventos | Evento |
| session_ids | JSONB | | IDs de sesiones |
| created_at | TIMESTAMP | | Fecha creación |
| updated_at | TIMESTAMP | | Última modificación |

#### 2.2.8. Tablas de registros y notificaciones

##### `event_registrations`
| Campo | Tipo | Constraints | Descripción |
|-------|------|-------------|-------------|
| id | UUID | PK | Identificador único |
| event_id | UUID | FK → macro_eventos | Evento |
| user_id | UUID | FK → users | Usuario (nullable para invitados) |
| form_data | JSONB | NOT NULL | Datos del formulario |
| email | VARCHAR(100) | | Email invitado |
| first_name | VARCHAR(100) | | Nombre |
| last_name | VARCHAR(100) | | Apellido |
| status | VARCHAR(20) | DEFAULT 'registered' | Estado |
| registered_at | TIMESTAMP | | Fecha registro |

##### `notifications`
| Campo | Tipo | Constraints | Descripción |
|-------|------|-------------|-------------|
| id | UUID | PK | Identificador único |
| user_id | UUID | FK → users | Usuario |
| type | VARCHAR(30) | | Tipo notificación |
| title | VARCHAR(200) | | Título |
| message | TEXT | | Mensaje |
| read | BOOLEAN | DEFAULT false | Leída |
| link | VARCHAR(500) | | Enlace |
| created_at | TIMESTAMP | | Fecha creación |

##### `email_templates`
| Campo | Tipo | Constraints | Descripción |
|-------|------|-------------|-------------|
| id | UUID | PK | Identificador único |
| event_id | UUID | FK → macro_eventos | Evento |
| type | VARCHAR(30) | NOT NULL | Tipo plantilla |
| name | VARCHAR(100) | | Nombre |
| subject | VARCHAR(500) | NOT NULL | Asunto |
| html_body | TEXT | NOT NULL | Cuerpo HTML |

##### `sent_emails`
| Campo | Tipo | Constraints | Descripción |
|-------|------|-------------|-------------|
| id | UUID | PK | Identificador único |
| event_id | UUID | FK → macro_eventos | Evento |
| template_id | UUID | FK → email_templates | Plantilla |
| recipient_id | UUID | FK → users | Destinatario |
| recipient_email | VARCHAR(100) | NOT NULL | Email |
| subject | VARCHAR(500) | | Asunto |
| sent_at | TIMESTAMP | | Fecha envío |
| status | VARCHAR(20) | | Estado |

#### 2.2.9. Tablas de CMS

##### `cms_pages`
| Campo | Tipo | Constraints | Descripción |
|-------|------|-------------|-------------|
| id | UUID | PK | Identificador único |
| title | VARCHAR(200) | NOT NULL | Título |
| slug | VARCHAR(200) | UNIQUE | Slug URL |
| content | TEXT | | Contenido HTML |
| excerpt | TEXT | | Extracto |
| featured_image | VARCHAR(500) | | Imagen destacada |
| status | VARCHAR(20) | DEFAULT 'draft' | Estado |
| author | UUID | FK → users | Autor |
| template | VARCHAR(50) | DEFAULT 'default' | Plantilla |
| order_index | INT | | Orden |
| meta_title | VARCHAR(200) | | Meta título |
| meta_description | TEXT | | Meta descripción |
| published_at | TIMESTAMP | | Fecha publicación |
| created_at | TIMESTAMP | | Fecha creación |
| updated_at | TIMESTAMP | | Última modificación |

##### `cms_articles`
| Campo | Tipo | Constraints | Descripción |
|-------|------|-------------|-------------|
| id | UUID | PK | Identificador único |
| title | VARCHAR(200) | NOT NULL | Título |
| slug | VARCHAR(200) | UNIQUE | Slug URL |
| content | TEXT | | Contenido HTML |
| excerpt | TEXT | | Extracto |
| featured_image | VARCHAR(500) | | Imagen |
| category_id | UUID | FK → cms_categories | Categoría |
| tags | JSONB | DEFAULT '[]' | Etiquetas |
| status | VARCHAR(20) | DEFAULT 'draft' | Estado |
| author | UUID | FK → users | Autor |
| featured | BOOLEAN | DEFAULT false | Destacado |
| views | INT | DEFAULT 0 | Vistas |
| meta_title | VARCHAR(200) | | Meta título |
| meta_description | TEXT | | Meta descripción |
| published_at | TIMESTAMP | | Fecha publicación |
| created_at | TIMESTAMP | | Fecha creación |
| updated_at | TIMESTAMP | | Última modificación |

##### `cms_categories`
| Campo | Tipo | Constraints | Descripción |
|-------|------|-------------|-------------|
| id | UUID | PK | Identificador único |
| name | VARCHAR(100) | NOT NULL | Nombre |
| slug | VARCHAR(100) | UNIQUE | Slug |
| description | TEXT | | Descripción |
| parent_id | UUID | FK → cms_categories | Categoría padre |
| order_index | INT | DEFAULT 0 | Orden |
| created_at | TIMESTAMP | | Fecha creación |

##### `cms_menus`
| Campo | Tipo | Constraints | Descripción |
|-------|------|-------------|-------------|
| id | UUID | PK | Identificador único |
| name | VARCHAR(100) | NOT NULL | Nombre |
| location | VARCHAR(20) | | Ubicación |
| items | JSONB | DEFAULT '[]' | Elementos del menú |
| is_active | BOOLEAN | DEFAULT true | Activo |
| created_at | TIMESTAMP | | Fecha creación |
| updated_at | TIMESTAMP | | Última modificación |

##### `cms_widgets`
| Campo | Tipo | Constraints | Descripción |
|-------|------|-------------|-------------|
| id | UUID | PK | Identificador único |
| name | VARCHAR(100) | NOT NULL | Nombre |
| type | VARCHAR(30) | | Tipo |
| content | TEXT | | Contenido |
| location | VARCHAR(20) | | Ubicación |
| settings | JSONB | | Configuración |
| is_active | BOOLEAN | DEFAULT true | Activo |
| order_index | INT | DEFAULT 0 | Orden |

##### `cms_settings`
| Campo | Tipo | Constraints | Descripción |
|-------|------|-------------|-------------|
| id | UUID | PK | Identificador único |
| site_name | VARCHAR(200) | NOT NULL | Nombre del sitio |
| site_description | TEXT | | Descripción |
| logo | VARCHAR(500) | | Logo URL |
| favicon | VARCHAR(500) | | Favicon URL |
| primary_color | VARCHAR(7) | DEFAULT '#3b82f6' | Color primario |
| secondary_color | VARCHAR(7) | DEFAULT '#10b981' | Color secundario |
| accent_color | VARCHAR(7) | DEFAULT '#f59e0b' | Color acento |
| font_family | VARCHAR(100) | DEFAULT 'Inter' | Fuente |
| header_style | VARCHAR(20) | DEFAULT 'default' | Estilo header |
| footer_style | VARCHAR(20) | DEFAULT 'default' | Estilo footer |
| social_links | JSONB | | Redes sociales |
| contact_info | JSONB | | Info contacto |
| seo_settings | JSONB | | Config SEO |
| maintenance_mode | BOOLEAN | DEFAULT false | Modo mantenimiento |
| allow_registration | BOOLEAN | DEFAULT true | Permitir registro |
| moderate_comments | BOOLEAN | DEFAULT false | Moderar comentarios |

#### 2.2.10. Tablas de nomencladores por evento

##### `nomencladores_evento`
| Campo | Tipo | Constraints | Descripción |
|-------|------|-------------|-------------|
| id | UUID | PK | Identificador único |
| evento_id | UUID | FK → macro_eventos | Evento |
| tipo | VARCHAR(30) | NOT NULL | Tipo (TEMATICA, AREA_TEMATICA, etc.) |
| nombre | VARCHAR(100) | NOT NULL | Nombre |
| descripcion | TEXT | | Descripción |
| duracion | INT | | Duración minutos |
| color | VARCHAR(7) | | Color |
| tipo_sesion | VARCHAR(30) | | Tipo sesión |
| incluye_transporte | BOOLEAN | | Incluye transporte |
| incluye_comida | BOOLEAN | | Incluye comida |
| activo | BOOLEAN | DEFAULT true | Estado |
| created_at | TIMESTAMP | | Fecha creación |

#### 2.2.11. Tablas de auditoría

##### `audit_log`
| Campo | Tipo | Constraints | Descripción |
|-------|------|-------------|-------------|
| id | UUID | PK | Identificador único |
| user_id | UUID | FK → users | Usuario |
| action | VARCHAR(50) | NOT NULL | Acción |
| entity | VARCHAR(100) | NOT NULL | Entidad |
| entity_id | UUID | | ID de entidad |
| details | TEXT | | Detalles |
| impersonated_by | UUID | FK → users | Impersonado por |
| timestamp | TIMESTAMP | DEFAULT NOW() | Fecha/hora |

##### `wizard_progress`
| Campo | Tipo | Constraints | Descripción |
|-------|------|-------------|-------------|
| id | UUID | PK | Identificador único |
| evento_id | UUID | FK → macro_eventos | Evento |
| paso_actual | INT | DEFAULT 0 | Paso actual |
| pasos_completados | JSONB | DEFAULT '[]' | Pasos completados |
| ultima_modificacion | TIMESTAMP | | Última modificación |
| modificado_por | UUID | FK → users | Usuario modificador |

---

## 3. API REST

### 3.1. Base URL
```
Desarrollo: http://localhost:3000/api/v1
Producción: https://api.sge.example.com/api/v1
```

### 3.2. Autenticación

#### POST /auth/login
```json
Request:
{
  "email": "string",
  "password": "string"
}

Response (200):
{
  "token": "jwt_token",
  "user": {
    "id": "uuid",
    "name": "string",
    "email": "string",
    "role": "string",
    "receptivoId": "uuid",
    "empresaId": "uuid",
    "hotelId": "uuid"
  }
}
```

#### POST /auth/register
```json
Request:
{
  "name": "string",
  "email": "string",
  "password": "string",
  "country": "string",
  "affiliation": "string"
}

Response (201):
{
  "token": "jwt_token",
  "user": { ... }
}
```

#### POST /auth/refresh
```json
Request:
{
  "refreshToken": "string"
}

Response (200):
{
  "token": "new_jwt_token"
}
```

### 3.3. Endpoints de Usuarios

#### GET /users
Lista usuarios (filtrado por rol del solicitante)

#### GET /users/:id
Detalle usuario

#### POST /users
Crear usuario (Solo ADMIN+)

#### PUT /users/:id
Actualizar usuario

#### DELETE /users/:id
Desactivar usuario (soft delete)

#### PUT /users/:id/role
Cambiar rol (Solo SUPERADMIN)

### 3.4. Endpoints de Eventos

#### GET /events
Lista eventos (filtrado por aislamiento)

#### GET /events/:id
Detalle evento

#### POST /events
Crear evento

#### PUT /events/:id
Actualizar evento

#### DELETE /events/:id
Eliminar evento

#### POST /events/:id/publish
Publicar evento

#### POST /events/:id/unpublish
Despublicar evento

### 3.5. Endpoints de Nomencladores

#### GET /nomenclators/receptivos
Lista receptivos

#### POST /nomenclators/receptivos
Crear receptivo

#### PUT /nomenclators/receptivos/:id
Actualizar receptivo

#### DELETE /nomenclators/receptivos/:id
Eliminar receptivo (con validación RB-NOM-03)

#### GET /nomenclators/empresas
Lista empresas

#### POST /nomenclators/empresas
Crear empresa

#### GET /nomenclators/hoteles
Lista hoteles

#### POST /nomenclators/hoteles
Crear hotel

#### GET /nomenclators/hoteles/:id/rooms
Habitaciones del hotel

#### POST /nomenclators/hoteles/:id/rooms
Agregar tipo de habitación

### 3.6. Endpoints de Abstracts

#### GET /abstracts
Lista abstracts (filtrado por evento)

#### GET /abstracts/:id
Detalle abstract

#### POST /abstracts
Crear abstract

#### PUT /abstracts/:id
Actualizar abstract

#### POST /abstracts/:id/submit
Enviar abstract para revisión

#### POST /abstracts/:id/review
Registrar revisión

### 3.7. Endpoints de Programa

#### GET /program/sessions
Sesiones del programa

#### POST /program/sessions
Crear sesión

#### PUT /program/sessions/:id
Actualizar sesión

#### POST /program/generate
Generar programa automáticamente

### 3.8. Endpoints de Email

#### GET /email/templates
Lista plantillas

#### POST /email/templates
Crear plantilla

#### PUT /email/templates/:id
Actualizar plantilla

#### POST /email/send
Enviar email individual

#### POST /email/send-bulk
Enviar email masivo

### 3.9. Endpoints de CMS

#### GET /cms/pages
Lista páginas

#### GET /cms/pages/:slug
Página por slug

#### POST /cms/pages
Crear página

#### PUT /cms/pages/:id
Actualizar página

#### DELETE /cms/pages/:id
Eliminar página

### 3.10. Endpoints de Dashboard

#### GET /dashboard/stats
Estadísticas generales

#### GET /dashboard/events/:id/stats
Estadísticas de evento

### 3.11. Headers de Autenticación
```
Authorization: Bearer <jwt_token>
```

### 3.12. Formato de Respuestas

#### Éxito
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

#### Error
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": { ... }
  }
}
```

---

## 4. Autenticación y Autorización

### 4.1. JWT Token
- **Algoritmo**: RS256 o HS256
- **Tiempo de expiración**: 15 minutos (access token)
- **Refresh token**: 7 días
- **Claims requeridos**:
```json
{
  "sub": "user_id",
  "email": "user@example.com",
  "role": "ADMIN_RECEPTIVO",
  "receptivoId": "uuid",
  "empresaId": "uuid",
  "hotelId": "uuid",
  "iat": 1234567890,
  "exp": 1234568790
}
```

### 4.2. Middleware de Autenticación
```javascript
// Verificar token JWT
// Extraer usuario del token
// Adjuntar usuario a req.user
```

### 4.3. Middleware de Autorización
```javascript
// Verificar rol del usuario
// Verificar permisos específicos
// Verificar aislamiento de datos
```

### 4.4. Permisos por Rol

| Recurso | SUPERADMIN | ADMIN_RECEPTIVO | ADMIN_EMPRESA | COORDINADOR_HOTEL | LECTOR_* |
|---------|------------|-----------------|---------------|-------------------|----------|
| Users | CRUD | CRUD (propio nivel) | ❌ | ❌ | ❌ |
| Eventos | CRUD (todos) | CRUD (propio) | CRUD (propio) | ❌ | R (propio) |
| Hoteles | CRUD | R | R | R (propio) | R |
| Abstracts | CRUD | CRUD | CRUD | R | R |
| Reviews | CRUD | CRUD | CRUD | ❌ | ❌ |
| CMS | CRUD | R | R | ❌ | R |

---

## 5. Validaciones y Reglas de Negocio

### 5.1. Reglas de Nomencladores
- **RB-NOM-01**: `siglas` de receptivo debe ser único globalmente
- **RB-NOM-02**: Solo SUPERADMIN puede modificar receptivos
- **RB-NOM-03**: No eliminar receptivo con empresas asociadas
- **RB-NOM-04**: `codigo` de empresa único dentro del receptivo
- **RB-NOM-05**: No eliminar empresa con eventos asociados
- **RB-NOM-06**: Solo SUPERADMIN puede crear hoteles globales
- **RB-NOM-07**: No eliminar hotel con eventos asociados
- **RB-NOM-08**: Relación muchos-a-muchos hotel-tipo_habitacion
- **RB-NOM-09**: Precios en `hoteles_tipos_habitacion` son referenciales

### 5.2. Reglas de Aislamiento
- **RB-SEG-01**: Aislamiento por receptivo para R02, R05
- **RB-SEG-02**: Aislamiento por empresa para R03, R06
- **RB-SEG-03**: Aislamiento por hotel para R04
- **RB-SEG-04**: Submódulos heredan aislamiento del evento padre
- **RB-SEG-05**: Validar IDs de aislamiento en cada request
- **RB-SEG-06**: Superadmin puede impersonar (logged)

### 5.3. Reglas de Eventos
- **RB-EVT-01**: No publicar evento sin wizard completo
- **RB-EVT-02**: No eliminar evento publicado
- **RB-EVT-03**: `acronym` de macro_evento único globalmente

### 5.4. Reglas de Abstracts
- **RB-ABS-01**: Abstract en `EN_PROCESO` puede editarsi
- **RB-ABS-02**: No cambiar categoría después de aprobación
- **RB-ABS-03**: Un revisor no puede revisar sus propios trabajos

---

## 6. Servicios Externos

### 6.1. Servicio de Email
```typescript
interface EmailService {
  sendEmail(to: string, subject: string, html: string): Promise<void>;
  sendTemplatedEmail(to: string, templateId: string, variables: Record<string, string>): Promise<void>;
  sendBulkEmail(recipients: string[], templateId: string, variables: Record<string, string>): Promise<void>;
}
```

### 6.2. Almacenamiento de Archivos
```typescript
interface FileStorage {
  upload(file: Buffer, folder: string, filename: string): Promise<string>; // Returns URL
  delete(url: string): Promise<void>;
}
```
- Usar S3, GCS, o servicio similar
- Max tamaño archivo: 10MB
- Formatos permitidos: jpg, png, pdf, doc, docx

### 6.3. Notificaciones Push (Opcional)
```typescript
interface PushNotification {
  send(userId: string, title: string, body: string, data?: Record<string, string>): Promise<void>;
}
```

---

## 7. Requisitos No Funcionales

### 7.1. Performance
- Tiempo de respuesta < 200ms (p95)
- Soportar 1000 usuarios concurrentes
- Paginación en todos los endpoints de lista

### 7.2. Seguridad
- HTTPS obligatorio
- Rate limiting: 100 requests/min por IP
- CORS configurado
- Helmet.js para headers de seguridad
- SQL injection prevention (ORM)
- XSS prevention
- CSRF tokens para mutaciones

### 7.3. Disponibilidad
- SLO: 99.9% uptime
- Health check endpoint: `GET /health`
- Graceful shutdown

### 7.4. Logging
- Request/Response logging
- Error tracking (Sentry, etc.)
- Audit log de todas las mutaciones

### 7.5. Testing
- Unit tests: > 80% coverage
- Integration tests para endpoints críticos
- E2E tests para flujos principales

---

## 8. Deployment

### 8.1. Docker
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### 8.2. Variables de Entorno
```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://...
JWT_SECRET=...
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=...
REFRESH_TOKEN_EXPIRES_IN=7d
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=...
```

### 8.3. CI/CD
- GitHub Actions o similar
- Stages: lint, test, build, deploy
- Despliegue a Staging automático en PR
- Despliegue a Producción con approval

---

## 9. Migración desde Frontend

### 9.1. Estrategia
1. Crear API REST completa
2. Migrar autenticación primero
3. Migrar CRUD de nomencladores
4. Migrar gestión de eventos
5. Migrar abstracts y reviews
6. Migrar CMS
7. Migrar wizard de eventos

### 9.2. Compatibilidad
- Mantener localStorage como cache opcional
- API debe ser compatible con consumidores existentes
- Versionar API (v1, v2, etc.)

---

## 10. Documentación Adicional

### 10.1. Swagger/OpenAPI
- Documentar todos los endpoints
- Incluir ejemplos de request/response
- Mantener actualizado

### 10.2. README
- Setup local
- Variables de entorno
- Scripts disponibles
- Arquitectura

### 10.3. Diagrama ER
- Crear diagrama entidad-relación
- Mantener actualizado con cambios

---

## Anexo A: Códigos de Error

| Código | Descripción |
|--------|-------------|
| AUTH_INVALID_CREDENTIALS | Credenciales inválidas |
| AUTH_TOKEN_EXPIRED | Token expirado |
| AUTH_UNAUTHORIZED | No autorizado |
| VALIDATION_ERROR | Error de validación |
| NOT_FOUND | Recurso no encontrado |
| DUPLICATE_ENTRY | Entrada duplicada |
| RB_NOM_03_VIOLATION | Receptivo tiene empresas |
| RB_NOM_07_VIOLATION | Hotel tiene eventos |
| RB_SEG_05_VIOLATION | Aislamiento violado |
| INTERNAL_ERROR | Error interno |

---

## Anexo B: Colecciones Frontend vs Tablas Backend

| Frontend Collection | Backend Table |
|---------------------|---------------|
| users | users |
| macroEvents | macro_eventos |
| events | eventos |
| eventSessions | event_sessions |
| sessionAttendance | session_attendance |
| abstracts | abstracts |
| reviews | reviews |
| workAssignments | work_assignments |
| juryAssignments | jury_assignments |
| thematics | thematics |
| committeeMembers | committee_members |
| programSessions | program_sessions |
| delegatePrograms | delegate_programs |
| notifications | notifications |
| emailTemplates | email_templates |
| sentEmails | sent_emails |
| eventRegistrations | event_registrations |
| cmsPages | cms_pages |
| cmsArticles | cms_articles |
| cmsCategories | cms_categories |
| cmsMenus | cms_menus |
| cmsWidgets | cms_widgets |
| cmsSettings | cms_settings |
| nomencladores_receptivos | receptivos |
| nomencladores_empresas | empresas |
| nomencladores_hoteles | hoteles |
| nomencladores_tiposParticipacion | tipos_participacion |
| nomencladores_tiposTransporte | tipos_transporte |
| nomencladores_tiposHabitacion | tipos_habitacion |
| nomencladores_hotelTiposHabitacion | hoteles_tipos_habitacion |
| nomencladores_eventoHotel | evento_hoteles |
| eventoHotelHabitaciones | evento_hotel_habitaciones |
| salones | salones |
| subEventos | No aplica (simplificado) |
| actividadesSociales | actividades_sociales |
| reservasActividades | reservas_actividades |
| eventoSalones | evento_salones |
| eventoTiposParticipacion | evento_tipos_participacion |
| rutasTransporte | rutas_transporte |
| reservasTransporte | reservas_transporte |
| nomencladoresEvento | nomencladores_evento |
| wizardProgress | wizard_progress |
| auditLog | audit_log |

---

*Documento creado: 2024*
*Versión: 1.0*
