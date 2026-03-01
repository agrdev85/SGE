# Cronograma de Desarrollo - SygEvent
## Enero - Marzo 2026

---

### Semana 1-2 Ene - Fundación y Eventos
- ✅ Arquitectura React + Vite + Tailwind + TypeScript
- ✅ Autenticación, Dashboard, Sidebar colapsable
- ✅ Jerarquía Macro Eventos → Eventos Simples → Sesiones
- ✅ Editor visual CMS para eventos, filtros y buscadores

### Semana 3-4 Ene - Herramientas y Revisión
- ✅ Form Builder drag-and-drop, plantillas email, jurados, certificados, credenciales
- ✅ Resúmenes, revisión por pares, comité científico, programa automático

### Semana 5 Ene - CMS
- ✅ Páginas, artículos, menús, widgets CMS con páginas públicas

### Semana 1-2 Feb - Módulo Anfitrión
- ✅ Dashboard hotel, salones, receptivos, calendario interactivo
- ✅ Solicitudes, BEOs con versionado, notificaciones

### Semana 3 Feb - UX
- ✅ Scroll-to-Top, botones retroceso CMS, modales globales

### Semana 4 Feb - Documento Maestro de Arquitectura
- ✅ **Nomencladores globales**: Receptivo (siglas únicas), Empresa, Hotel, Tipo Participación, Tipo Transporte, Tipo Habitación
- ✅ **Tablas intermedias**: hoteles_tipos_habitacion, evento_hotel
- ✅ **6 Roles**: SuperAdmin, Admin Receptivo, Admin Empresa, Coordinador Hotel, Lector Receptivo, Lector Empresa
- ✅ **4 Niveles aislamiento**: Global, Receptivo, Empresa, Hotel
- ✅ Panel SuperAdmin con CRUD completo de nomencladores
- ✅ Impersonación (RB-SEG-06) con log de auditoría
- ✅ Sidebar agrupado por secciones, 10 roles soportados

### Marzo 2026 (Planificado)
- [ ] Filtrado automático por rol en todas las vistas
- [ ] Módulo Transporte, Registro público, Alojamiento
- [ ] Migración a backend real, RLS, deploy producción
