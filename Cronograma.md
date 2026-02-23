# Cronograma de Desarrollo - SygEvent
## Enero - Febrero 2026

---

## ✅ ENERO 2026

### Semana 1 (6-10 Enero) — Fundación del Proyecto
- [x] Configuración del proyecto React + Vite + Tailwind + TypeScript
- [x] Diseño del sistema de tokens (index.css, tailwind.config.ts)
- [x] Componentes UI base (shadcn/ui)
- [x] Layout principal con Sidebar y DashboardLayout
- [x] Sistema de autenticación mock (AuthContext, login/logout)

### Semana 2 (13-17 Enero) — Gestión de Usuarios y Eventos
- [x] CRUD de usuarios con roles (USER, REVIEWER, COMMITTEE, ADMIN)
- [x] Base de datos localStorage (database.ts) con seed data
- [x] Sistema de notificaciones (NotificationBell)
- [x] Jerarquía de eventos: Macro Eventos → Eventos Simples → Sesiones
- [x] Navegación drill-down con breadcrumbs

### Semana 3 (20-24 Enero) — Resúmenes y Revisiones
- [x] Gestión de abstracts (crear, editar, listar)
- [x] Sistema de revisión con puntuación y comentarios
- [x] Asignación de categorías (Ponencia, Poster, Conferencia)
- [x] Temáticas y asignación de revisores por temática
- [x] Dashboard con estadísticas por rol

### Semana 4 (27-31 Enero) — Herramientas del Evento
- [x] Form Builder con drag-and-drop para formularios de inscripción
- [x] Plantillas de email con variables dinámicas
- [x] Asignación automática y equitativa de jurados
- [x] Gestión de comité científico
- [x] Registro de asistencia por sesión con "Seleccionar todo"

---

## ✅ FEBRERO 2026

### Semana 5 (3-7 Febrero) — Certificados y Credenciales
- [x] Editor de certificados con canvas drag-and-drop
- [x] Posicionamiento porcentual (responsive)
- [x] Generación de QR codes dinámicos
- [x] Exportación PDF individual y masiva (jsPDF)
- [x] Editor de credenciales con diseño personalizable

### Semana 6 (10-14 Febrero) — CMS y Contenidos
- [x] Gestor de páginas CMS (crear, editar, publicar)
- [x] Gestor de artículos con categorías y tags
- [x] Sistema de menús con items anidados
- [x] Widgets configurables (sidebar, footer, header)
- [x] Rutas públicas (/pagina/, /articulo/, /blog, /categoria/)

### Semana 7 (17-21 Febrero) — Editor de Contenido y UX
- [x] Editor de contenido visual para eventos (bloques + HTML)
- [x] Vista previa en tiempo real (split view)
- [x] Colores de branding por macro evento (primario, secundario, fondo)
- [x] Filtros y buscador en listas de eventos
- [x] Botón ScrollToTop con animaciones
- [x] Formulario de registro dinámico según configuración del macro evento

### Semana 8 (24-28 Febrero) — Módulo Anfitrión (Coordinador Hotel)
- [x] Base de datos del módulo anfitrión (hostDatabase.ts)
  - Hoteles, salones, receptivos, solicitudes, eventos confirmados, BEOs
- [x] Dashboard del anfitrión con calendario de ocupación y métricas
- [x] Calendario interactivo (mes, semana, día, timeline por salón)
- [x] Gestión de solicitudes (crear desde email, aceptar, rechazar)
- [x] Verificación de disponibilidad de salones
- [x] Conversión automática solicitud → evento confirmado
- [x] Creación manual de eventos (desde email)
- [x] Editor de BEOs con departamentos y costos
  - Banquetes, Cocina, Informáticos, Mantenimiento, Ama de Llaves
- [x] Versionado de BEOs (borrador → enviado → aprobado → modificado)
- [x] Gestión de salones con capacidades y recursos
- [x] CRUD de receptivos (clientes con contrato / no clientes)
- [x] Configuración del hotel (horarios, prefijos, email)
- [x] Sistema de notificaciones del módulo anfitrión
- [x] Integración en sidebar y rutas del sistema

---

## 📊 RESUMEN DE MÓDULOS

| Módulo | Estado | Páginas | Componentes |
|--------|--------|---------|-------------|
| Autenticación | ✅ Completo | 2 | AuthContext, Login, Register |
| Dashboard | ✅ Completo | 1 | StatCard, Charts |
| Gestión de Eventos | ✅ Completo | 1 | Macro/Simple/Sesiones |
| Resúmenes | ✅ Completo | 3 | Abstracts, NewAbstract, EditAbstract |
| Revisiones | ✅ Completo | 2 | Review, ReviewUpdated |
| Comité | ✅ Completo | 1 | Committee |
| Programa | ✅ Completo | 2 | ProgramManager, MyProgram |
| Certificados | ✅ Completo | 1 | CertificateManager, DesignCanvas |
| Credenciales | ✅ Completo | 1 | CredentialsManager |
| CMS | ✅ Completo | 8 | Pages, Articles, Menus, Widgets + Public |
| Módulo Anfitrión | ✅ Completo | 8 | Dashboard, Calendar, Solicitudes, Eventos, BEOs, Salones, Receptivos, Config |
| SuperAdmin | ✅ Completo | 1 | SuperAdminPanel |
| Configuración | ✅ Completo | 1 | Settings |

---

## 🛠 STACK TECNOLÓGICO

- **Frontend**: React 18 + TypeScript + Vite
- **Estilos**: Tailwind CSS + shadcn/ui + class-variance-authority
- **Estado**: React Context + localStorage (mock database)
- **Routing**: React Router DOM v6
- **Data Fetching**: TanStack React Query
- **PDF**: jsPDF
- **QR**: qrcode
- **DnD**: @dnd-kit
- **Gráficos**: Recharts
- **Animaciones**: CSS animations + Tailwind animate

---

*Documento generado automáticamente por SygEvent*
*Última actualización: Febrero 2026*
