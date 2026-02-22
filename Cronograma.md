# Cronograma de Desarrollo — Sistema de Gestión de Eventos Científicos (SGE)

## Enero 2026

### Semana 1 (5–9 Enero)
- [x] Diseño de arquitectura general (React + Vite + Tailwind + TypeScript)
- [x] Estructura de base de datos simulada (localStorage)
- [x] Módulo de autenticación (Login / Registro)
- [x] Layout del Dashboard con Sidebar y roles

### Semana 2 (12–16 Enero)
- [x] CRUD de Eventos (crear, editar, eliminar, activar/desactivar)
- [x] Landing pública por evento con banner, descripción y formulario
- [x] Gestión de Resúmenes (envío, edición, listado)
- [x] Sistema de Autores (principal y coautores)

### Semana 3 (19–23 Enero)
- [x] Módulo de Revisión por Pares (asignación, evaluación, puntuación)
- [x] Panel del Comité Científico
- [x] Temáticas y categorización de trabajos
- [x] Sistema de Notificaciones (campana + badge)

### Semana 4 (26–30 Enero)
- [x] Gestión de Programa Científico (sesiones, horarios, ponencias)
- [x] "Mi Programa" para participantes
- [x] Plantillas de Email personalizables
- [x] Asignación de Jurados / Árbitros

## Febrero 2026

### Semana 1 (2–6 Febrero)
- [x] Certificados digitales (diseñador visual con QR)
- [x] Credenciales de participante (diseñador visual)
- [x] Constructor de Formularios drag-and-drop (inscripción evento + usuarios)
- [x] ImageUploader para banners, logos y fotos de perfil

### Semana 2 (9–13 Febrero)
- [x] Jerarquía de Eventos: Macro Eventos → Eventos Simples → Sesiones
- [x] Navegación drill-down con breadcrumbs
- [x] Registro de Asistencia por sesión (con "Seleccionar Todo")
- [x] Editor de Contenido visual CMS para eventos (bloques HTML)

### Semana 3 (16–20 Febrero)
- [x] CMS completo: Páginas, Artículos, Categorías, Menús, Widgets
- [x] Vistas públicas: Blog, Artículos, Páginas, Categorías
- [x] Header y Footer dinámicos desde CMS
- [x] Panel SuperAdmin

### Semana 4 (22–28 Febrero)
- [x] Herramientas del evento movidas al nivel de Macro Evento
- [x] Formulario de inscripción único (configurable por macro evento)
- [x] Registro de usuario vinculado a inscripción de evento
- [x] Filtros y buscador en listados de macro eventos y eventos simples
- [x] Campo "Descripción General" en eventos simples
- [x] Botón Scroll-to-Top animado en todas las páginas
- [x] Pruebas integrales de flujo completo
- [ ] Ajustes de UX finales y pulido visual

## Marzo 2026 — Módulo Anfitrión y Gestión de Sedes

### Semana 1 (2–6 Marzo)
- [ ] **Modelo de datos para Sedes/Espacios**: Crear entidades para hoteles, salones, capacidades, recursos disponibles.
- [ ] **CRUD de Sedes y Salones**: Administración de espacios físicos (nombre, capacidad, ubicación, recursos técnicos).
- [ ] **CRUD de Receptivos/Organizadores**: Gestión de empresas como Havanatur (diferenciar entre clientes con contrato y otros).
- [ ] **Dashboard del Anfitrión (Coordinador Hotel)**: Vista general con calendario de ocupación y solicitudes pendientes.

### Semana 2 (9–13 Marzo)
- [ ] **Sistema de Solicitudes de Evento (Receptivo a Anfitrión)**:
    - [ ] Formulario para que el receptivo cree una solicitud (fechas, tipo de evento, necesidades de espacio).
    - [ ] Notificación en tiempo real (campana + badge) al anfitrión cuando llegue una nueva solicitud.
    - [ ] Listado de solicitudes pendientes, aceptadas y rechazadas.
- [ ] **Calendario Visual de Ocupación (Vista Semanal/Mensual)**:
    - [ ] Integración de librería de calendario (ej. FullCalendar).
    - [ ] Visualización de eventos confirmados y solicitudes en el calendario.
    - [ ] Filtro por salón/espacio.

### Semana 3 (16–20 Marzo)
- [ ] **Gestor de Capacidad y Disponibilidad**:
    - [ ] Lógica para validar solapamiento de eventos en un mismo salón/espacio.
    - [ ] Indicador visual de ocupación en el calendario.
    - [ ] Vista de disponibilidad por fecha y salón.
- [ ] **Flujo de Aprobación de Solicitudes**:
    - [ ] Botones "Aceptar" y "Rechazar" en cada solicitud (desde el calendario o desde el detalle).
    - [ ] Al aceptar, conversión automática de solicitud a evento confirmado en el calendario.
    - [ ] Al rechazar, campo para motivo y notificación al receptivo.

### Semana 4 (23–27 Marzo)
- [ ] **Creación Manual de Eventos por el Anfitrión**:
    - [ ] Formulario rápido para que la coordinadora registre eventos de receptivos no clientes (basado en correos).
    - [ ] Vinculación del evento a un receptivo existente o genérico.
- [ ] **Detalle de Evento (Vista Anfitrión)**:
    - [ ] Información completa del evento (fechas, salón, contacto del receptivo, estado).
    - [ ] Historial de cambios y comunicaciones.
- [ ] **Pruebas del flujo completo**: Desde la solicitud del receptivo hasta la confirmación en el calendario.

## Abril 2026 — Refinamientos y Finalización

### Semana 1 (30 Marzo – 3 Abril)
- [ ] **Notificaciones por Email**:
    - [ ] Plantilla de email para cuando una solicitud es aceptada.
    - [ ] Plantilla de email para cuando una solicitud es rechazada (con motivo).
- [ ] **Panel de Control para el Receptivo (ej. Havanatur)**:
    - [ ] Ver historial de sus solicitudes y eventos.
    - [ ] Estado actual de cada solicitud (pendiente, aceptada, rechazada).

### Semana 2 (6–10 Abril)
- [ ] **Exportación de Datos**: Generar reporte de ocupación del hotel (para el anfitrión) en PDF/Excel.
- [ ] **Ajustes de UX**: Mejoras en la usabilidad del calendario, filtros y búsquedas.
- [ ] **Pruebas de estrés y carga**: Simular múltiples solicitudes simultáneas.

### Semana 3 (13–17 Abril)
- [ ] **Corrección de bugs y pulido visual**.
- [ ] **Documentación del módulo anfitrión** para usuarios finales.
- [ ] **Preparación para despliegue**: Configuración de variables de entorno, build de producción.

### Semana 4 (20–24 Abril)
- [ ] **Despliegue en entorno de producción**.
- [ ] **Capacitación a usuario piloto** (la coordinadora del Melian y un receptivo de prueba).
- [ ] **Ajustes finales basados en feedback**.
- [ ] **Entrega oficial del Módulo Anfitrión**.
