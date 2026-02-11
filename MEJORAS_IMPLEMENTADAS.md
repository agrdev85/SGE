# Sistema de Gestión de Eventos - Mejoras Implementadas

## Resumen Ejecutivo

Se ha implementado un sistema integral de gestión de eventos científicos que integra todas las funcionalidades previamente dispersas en Drupal y la aplicación SuperAdmin de .NET Framework/Sencha, ahora unificadas en una sola plataforma moderna y cohesiva.

## Nuevo Sistema CMS Completo - Tipo Drupal

### Vista General
Se ha implementado un sistema de gestión de contenidos (CMS) completo similar a Drupal, permitiendo crear y administrar páginas, artículos, menús y widgets de forma visual sin necesidad de programar. Este sistema incluye interfaces públicas y de administración completamente funcionales.

### Componentes del CMS

#### 1. Gestor de Páginas (CMSPagesManager)
- **Ubicación**: `/cms/pages`
- **Funcionalidades**:
  - Creación de páginas con editor visual y HTML
  - 4 plantillas disponibles: Default, Full Width, Sidebar, Landing Page
  - Sistema de slugs automáticos para URLs amigables
  - Control de estado: borrador, publicado, archivado
  - Configuración SEO completa (título, descripción, keywords)
  - Herramientas de inserción HTML rápida
  - Vista previa antes de publicar

#### 2. Gestor de Artículos/Blog (CMSArticlesManager)
- **Ubicación**: `/cms/articles`
- **Funcionalidades**:
  - Sistema completo de blog con categorías
  - Editor de artículos con excerpt y contenido completo
  - Gestión de imágenes destacadas
  - Sistema de etiquetas (tags)
  - Artículos destacados (featured)
  - Contador de vistas
  - Gestión de categorías integrada
  - Filtrado por categoría y estado
  - Asignación de múltiples etiquetas

#### 3. Gestor de Menús (CMSMenuManager)
- **Ubicación**: `/cms/menus`
- **Funcionalidades**:
  - Creación de múltiples menús
  - 5 tipos de enlaces: Página CMS, Artículo, Categoría, URL Personalizada, Enlace Externo
  - Menús anidados (sub-menús)
  - Reordenamiento con drag & drop visual
  - Posiciones: Header, Footer, Sidebar
  - Control de estado activo/inactivo
  - CSS classes personalizadas

#### 4. Gestor de Widgets (CMSWidgetsManager)
- **Ubicación**: `/cms/widgets`
- **Funcionalidades**:
  - 6 tipos de widgets predefinidos:
    - Texto simple
    - HTML personalizado
    - Artículos recientes automático
    - Categorías con contador
    - Búsqueda
    - Widget personalizado
  - Ubicación flexible: Sidebar, Header, Footer
  - Control de orden de aparición
  - Estado activo/inactivo
  - Vista organizada por ubicación

#### 5. Panel SuperAdmin
- **Ubicación**: `/superadmin`
- **6 Pestañas principales**:

##### General
- Configuración del sitio (nombre, descripción, email)
- Logo y favicon
- Configuración regional (zona horaria, idioma, formato de fecha)
- Información de contacto

##### Apariencia
- Colores primarios y secundarios
- Personalización del header y footer
- Fuentes del sitio
- Estilos de botones

##### SEO
- Configuración de meta tags predeterminados
- Integración Google Analytics
- Configuración sitemap.xml y robots.txt
- Meta imagen por defecto

##### Usuarios
- Gestión completa de usuarios
- Asignación de roles (User, Reviewer, Committee, Admin)
- Activación/desactivación de cuentas
- Estadísticas de usuarios por rol

##### Eventos
- Vista de todos los eventos
- Estado de resúmenes por evento
- Estadísticas de autores
- Configuración de eventos activos

##### Avanzado
- Exportación de datos (JSON)
- Limpieza de datos antiguos
- Modo mantenimiento
- Registro de actividades del sistema
- Copias de seguridad

### Interfaces Públicas

#### PublicPage
- **Ruta**: `/pagina/:slug`
- Renderiza páginas CMS con plantillas configurables
- Sistema de breadcrumbs
- Manejo de errores 404
- Soporte para widgets en sidebar

#### PublicArticle
- **Ruta**: `/articulo/:slug`
- Vista completa de artículos con:
  - Imagen destacada
  - Información del autor y categoría
  - Contador de vistas (incremental)
  - Etiquetas del artículo
  - Widgets en sidebar
  - Artículos relacionados
- Sistema de breadcrumbs

#### PublicBlog
- **Ruta**: `/blog`
- Listado completo de artículos con:
  - Sección de artículos destacados
  - Búsqueda por título/contenido
  - Filtro por categoría
  - Cards con información completa
  - Widgets en sidebar
  - Diseño responsive

#### PublicCategory
- **Ruta**: `/categoria/:slug`
- Vista de artículos por categoría
- Descripción de la categoría
- Contador de artículos
- Filtrado y ordenamiento
- Widgets en sidebar

#### PublicHeader (Componente)
- Navegación dinámica desde CMS
- Renderiza menús de posición "header" y "footer"
- Soporte para menús anidados
- Enlaces externos y personalizados
- Footer con información de contacto

#### WidgetRenderer (Componente)
- Sistema de renderizado dinámico de widgets
- Soporte para múltiples ubicaciones
- Widgets automáticos (recent-articles, categories, search)
- Widgets personalizados (HTML, texto)

### Estructura de Datos

#### CMSPage
```typescript
interface CMSPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  template: 'default' | 'full-width' | 'sidebar' | 'landing';
  status: 'draft' | 'published' | 'archived';
  featuredImage?: string;
  author: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}
```

#### CMSArticle
```typescript
interface CMSArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  categoryId?: string;
  tags: string[];
  featuredImage?: string;
  author: string;
  status: 'draft' | 'published' | 'archived';
  isFeatured: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}
```

#### CMSMenu & CMSMenuItem
```typescript
interface CMSMenu {
  id: string;
  name: string;
  location: 'header' | 'footer' | 'sidebar';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CMSMenuItem {
  id: string;
  menuId: string;
  label: string;
  type: 'page' | 'article' | 'category' | 'custom' | 'external';
  url?: string;
  pageId?: string;
  articleId?: string;
  categoryId?: string;
  parentId?: string;
  order: number;
  cssClass?: string;
  isActive: boolean;
}
```

#### CMSWidget
```typescript
interface CMSWidget {
  id: string;
  name: string;
  type: 'text' | 'html' | 'recent-articles' | 'categories' | 'search' | 'custom';
  location: 'sidebar' | 'footer' | 'header';
  content?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

#### CMSCategory & CMSSettings
```typescript
interface CMSCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

interface CMSSettings {
  id: string;
  key: string;
  value: any;
  updatedAt: string;
}
```

### Métodos de Database (database.ts)

#### Páginas CMS
- `cmsPages.create()`, `update()`, `delete()`, `getAll()`
- `cmsPages.getBySlug(slug)` - Obtener página por URL
- `cmsPages.getPublished()` - Solo páginas publicadas
- `cmsPages.getByAuthor(authorId)` - Páginas de un autor

#### Artículos
- `cmsArticles.create()`, `update()`, `delete()`, `getAll()`
- `cmsArticles.getBySlug(slug)` - Obtener artículo por URL
- `cmsArticles.getPublished()` - Solo publicados
- `cmsArticles.getByCategory(categoryId)` - Por categoría
- `cmsArticles.getFeatured()` - Artículos destacados
- `cmsArticles.incrementViews(id)` - Contador de visitas

#### Menús
- `cmsMenus.create()`, `update()`, `delete()`, `getAll()`
- `cmsMenus.getByLocation(location)` - Por ubicación
- `cmsMenuItems.create()`, `update()`, `delete()`
- `cmsMenuItems.getByMenu(menuId)` - Items de un menú
- `cmsMenuItems.getTopLevel(menuId)` - Items sin padre
- `cmsMenuItems.getChildren(parentId)` - Sub-items

#### Categorías
- `cmsCategories.create()`, `update()`, `delete()`, `getAll()`
- `cmsCategories.getBySlug(slug)` - Por URL

#### Widgets
- `cmsWidgets.create()`, `update()`, `delete()`, `getAll()`
- `cmsWidgets.getByLocation(location)` - Por ubicación
- `cmsWidgets.getActive()` - Solo activos

#### Configuración
- `cmsSettings.get(key)` - Obtener valor
- `cmsSettings.set(key, value)` - Establecer valor
- `cmsSettings.getAll()` - Todas las configuraciones

### Flujo de Trabajo CMS

#### Para crear una página:
1. Ir a `/cms/pages`
2. Clic en "Nueva Página"
3. Escribir título (slug se genera automático)
4. Seleccionar plantilla
5. Agregar contenido (editor visual o HTML)
6. Configurar SEO (opcional)
7. Cambiar estado a "published"
8. La página estará disponible en `/pagina/slug-de-la-pagina`

#### Para crear un artículo de blog:
1. Ir a `/cms/articles`
2. Clic en "Nuevo Artículo"
3. Crear/seleccionar categoría
4. Escribir título, excerpt y contenido
5. Agregar imagen destacada y etiquetas
6. Marcar como destacado (opcional)
7. Publicar
8. El artículo aparecerá en `/blog` y `/articulo/slug-del-articulo`

#### Para crear un menú:
1. Ir a `/cms/menus`
2. Crear nuevo menú y seleccionar ubicación (header/footer)
3. Agregar items al menú:
   - Enlaces a páginas CMS creadas
   - Enlaces a artículos o categorías
   - URLs personalizadas
   - Enlaces externos
4. Crear sub-menús arrastrando items
5. Activar el menú
6. El menú aparecerá automáticamente en la ubicación seleccionada

#### Para agregar widgets al sidebar:
1. Ir a `/cms/widgets`
2. Clic en "Nuevo Widget"
3. Seleccionar tipo (texto, HTML, artículos recientes, etc.)
4. Seleccionar ubicación (sidebar, header, footer)
5. Configurar contenido si aplica
6. Establecer orden de aparición
7. Activar el widget
8. El widget aparecerá en todas las páginas públicas que tengan sidebar

### Rutas del Sistema

#### Administración (requiere role ADMIN)
- `/cms/pages` - Gestor de Páginas
- `/cms/articles` - Gestor de Artículos
- `/cms/menus` - Gestor de Menús
- `/cms/widgets` - Gestor de Widgets
- `/superadmin` - Panel SuperAdmin

#### Público (sin autenticación)
- `/pagina/:slug` - Vista de página CMS
- `/articulo/:slug` - Vista de artículo
- `/blog` - Listado de blog
- `/categoria/:slug` - Artículos por categoría

### Ventajas del Sistema CMS

1. **No requiere programación**: Todo se gestiona desde interfaces visuales
2. **SEO Optimizado**: Control completo de meta tags y URLs amigables
3. **Flexible**: Plantillas y widgets configurables
4. **Escalable**: Fácil agregar nuevos tipos de contenido
5. **Unificado**: Todo en una sola aplicación (no más Drupal + SuperAdmin separados)
6. **Modern Stack**: React + TypeScript + Tailwind CSS
7. **Persistencia Local**: Todos los datos se guardan en LocalStorage (puede migrarse a backend real fácilmente)

---

## 1. Gestión del Comité Organizador

### Implementación
- **Estructura de datos**: `CommitteeMember` con roles jerárquicos
- **Roles disponibles**:
  - COORDINADOR: Administrador principal del evento
  - COORDINADOR_CIENTIFICO: Responsable científico
  - RESPONSABLE_ASIGNACIONES: Encargado de asignar trabajos a árbitros
  - MIEMBRO: Miembro general del comité

### Características
- Asignación de roles específicos a usuarios
- Gestión de temáticas por miembro
- Tracking de fechas de asignación
- Conversión automática de rol USER a COMMITTEE cuando se asigna

## 2. Sistema de Temáticas

### Implementación
- **Estructura**: `Thematic` con información detallada
- Campos incluyen: nombre, descripción, duración para ponencias
- Asociación a eventos específicos

### Funcionalidades
- Creación y gestión de temáticas
- Asignación de duración predeterminada para tipos de presentación
- Filtrado y búsqueda por temática

## 3. Sistema de Autores Principal y Co-autores

### Mejora Crítica
**Problema anterior**: El usuario que subía el trabajo automáticamente se convertía en autor principal.

**Solución implementada**:
- Estructura `Author` con datos completos (nombre, email, afiliación, isMainAuthor)
- Interface durante la creación del trabajo permite:
  - Seleccionar mediante radio buttons quién es el autor principal
  - Agregar múltiples co-autores con sus datos
  - Modificar la designación del autor principal en cualquier momento
  - Eliminar co-autores (excepto el principal)
- Validación: Siempre debe existir un autor principal

### Componente
- [NewAbstract.tsx](src/pages/NewAbstract.tsx): Formulario completo con gestión de autores

## 4. Sistema de Asignación de Árbitros

### Problema Anterior
- Todos los árbitros revisaban TODOS los trabajos de su temática
- Sin control de asignaciones específicas
- Sobrecarga de trabajo desigual

### Solución Implementada
**Estructura**: `WorkAssignment` con asignaciones específicas

### Características Clave
- **Asignación individual**: Cada trabajo se asigna a UN árbitro específico
- **Validación de unicidad**: Un trabajo no puede estar asignado a múltiples árbitros
- **Carga de trabajo visible**: Dashboard muestra cuántos trabajos tiene cada árbitro
- **Filtros por temática**: Solo árbitros de la temática correspondiente
- **Reasignación**: Si no hay trabajos asignados explícitamente, el árbitro revisa todos de su temática (comportamiento legacy)

### Componente
- [JuryAssignmentManager.tsx](src/components/JuryAssignmentManager.tsx): Interface completa de asignación

### Funcionalidades
```typescript
// Asignar trabajo a árbitro
db.workAssignments.create({
  abstractId: '123',
  reviewerId: '456',
  assignedBy: 'coordinator_id'
});

// Ver carga de trabajo
const assignments = db.workAssignments.getByReviewer(reviewerId);
```

## 5. Cambio de Temática por Árbitros

### Flujo Implementado
1. **Árbitro detecta temática incorrecta**
2. **Cambia la temática** desde su panel de revisión
3. **Sistema verifica**:
   - ¿Hay múltiples árbitros para la nueva temática?
   - Si SÍ: Notifica al coordinador para reasignación
   - Si NO: El mismo árbitro continúa la revisión
4. **Actualización automática** de asignaciones

### Componente
- [ReviewUpdated.tsx](src/pages/ReviewUpdated.tsx): Panel de revisión con cambio de temática

### Código de Ejemplo
```typescript
const handleChangeThematic = () => {
  db.abstracts.update(abstractId, { thematicId: newThematicId });
  
  if (hasMultipleReviewersForThematic) {
    // Notificar coordinador
    db.notifications.create({
      userId: coordinatorId,
      type: 'system',
      title: 'Trabajo requiere reasignación',
      message: `El trabajo cambió de temática y necesita ser reasignado.`
    });
  }
};
```

## 6. Generador Automático de Programa

### Funcionalidad
El sistema genera automáticamente una propuesta de programa basada en:
- Trabajos aprobados
- Temáticas asignadas
- Duración por tipo de presentación
- Distribución en días del evento

### Algoritmo
```typescript
db.programSessions.generateProposal(eventId);
```

**Pasos del algoritmo**:
1. Agrupa trabajos por temática
2. Calcula sesiones necesarias según cantidad de trabajos
3. Distribuye sesiones en días del evento
4. Asigna horarios (mañana: 9:00-12:00, tarde: 14:00-17:00)
5. Incluye breaks automáticos
6. Asigna ubicaciones (salas A, B, C, etc.)

### Parámetros considerables
- Ponencia: 20 minutos
- Poster: sesión específica
- Conferencia: 45-60 minutos
- Plenaria: 90 minutos

## 7. Editor de Programa para Coordinador

### Componente Principal
- [ProgramManager.tsx](src/pages/ProgramManager.tsx)

### Funcionalidades
1. **Vista de Calendario**: Organización por días
2. **Gestión de Sesiones**:
   - Crear nueva sesión manual
   - Editar horarios
   - Cambiar ubicación
   - Eliminar sesiones
   - Reorganizar trabajos entre sesiones

3. **Trabajos Sin Asignar**: Lista separada de trabajos aprobados no incluidos

4. **Drag & Drop** (futuro): Reorganizar trabajos arrastrando

### Interface Amigable
- Filtros por día, tipo de sesión
- Vista consolidada con estadísticas
- Indicadores visuales de conflictos
- Gestión de bloques de tiempo

### Ejemplo de Uso
```typescript
// Crear sesión
db.programSessions.create({
  eventId: '1',
  title: 'Sesión de Inmunología',
  date: '2024-06-15',
  startTime: '09:00',
  endTime: '12:00',
  location: 'Sala A',
  type: 'SESION_ORAL',
  abstracts: ['id1', 'id2', 'id3']
});

// Agregar trabajo a sesión
db.programSessions.addAbstract(sessionId, abstractId);
```

## 8. Programa Personalizado para Delegados

### Concepto
Cada asistente puede armar su agenda personal seleccionando las sesiones a las que asistirá.

### Componente
- [MyProgram.tsx](src/pages/MyProgram.tsx)

### Funcionalidades
1. **Selección de Sesiones**: Checkboxes para cada sesión
2. **Detección de Conflictos**: Alertas visuales si sesiones se solapan
3. **Vista Personalizada**: Solo muestra las sesiones seleccionadas
4. **Exportación**: (futuro) PDF/iCal de programa personal
5. **Actualización en Tiempo Real**: Cambios en el programa oficial se reflejan

### Validaciones
- No permitir selección de sesiones simultáneas
- Mostrar advertencias de conflictos de horario
- Guardar preferencias del usuario

### Ejemplo de Uso
```typescript
// Guardar programa personal
db.delegatePrograms.update(userId, eventId, [
  'session1_id',
  'session3_id',
  'session5_id'
]);

// Verificar conflictos
const hasConflict = (sessionId) => {
  const session = findSession(sessionId);
  return selectedSessions.some(otherId => {
    const other = findSession(otherId);
    return timeOverlap(session, other);
  });
};
```

## 9. Sistema CMS Completo tipo Drupal

### Introducción
Se ha implementado un **Sistema de Gestión de Contenidos (CMS)** completo al estilo de Drupal que permite a los administradores crear y gestionar todo el contenido del sitio web de forma visual e intuitiva.

### 9.1 Gestión de Páginas CMS

**Componente**: [CMSPagesManager.tsx](src/pages/CMSPagesManager.tsx)

#### Funcionalidades
- ✅ **Crear páginas** con editor visual y HTML
- ✅ **Plantillas predefinidas**: Default, Landing Page, Full Width, Con Sidebar
- ✅ **Editor WYSIWYG** con elementos predefinidos (H1, H2, Párrafos, Imágenes, Botones, Grid, etc.)
- ✅ **Generación automática de URL** (slug) desde el título
- ✅ **Estados de publicación**: Borrador, Publicado, Archivado
- ✅ **Extractos y descripciones** para SEO
- ✅ **Meta tags personalizados** (título, descripción)
- ✅ **Orden personalizado** de páginas
- ✅ **Vista previa** antes de publicar

#### Elementos HTML Disponibles
```typescript
- Heading 1, Heading 2
- Párrafos de texto
- Imágenes con clases Tailwind
- Botones personalizados
- Separadores (HR)
- Containers responsivos
- Grid de 2 columnas
```

#### Estructura de Datos
```typescript
interface CMSPage {
  id: string;
  title: string;
  slug: string; // URL amigable
  content: string; // HTML
  excerpt?: string;
  featuredImage?: string;
  status: 'draft' | 'published' | 'archived';
  author: string;
  template?: 'default' | 'landing' | 'full-width' | 'sidebar';
  metaTitle?: string;
  metaDescription?: string;
  orderIndex?: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}
```

### 9.2 Gestión de Artículos y Blog

**Componente**: [CMSArticlesManager.tsx](src/pages/CMSArticlesManager.tsx)

#### Funcionalidades
- ✅ **Crear artículos** con editor HTML
- ✅ **Sistema de categorías** anidadas
- ✅ **Tags/Etiquetas** múltiples por artículo
- ✅ **Artículos destacados** (featured)
- ✅ **Contador de vistas** automático
- ✅ **Imagen destacada** por artículo
- ✅ **Extracto/Resumen** personalizado
- ✅ **Filtrado por categoría y tags**
- ✅ **Estados de publicación**
- ✅ **Gestión de categorías integrada**

#### Categorías
```typescript
interface CMSCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string; // Para categorías anidadas
  orderIndex: number;
  createdAt: string;
}
```

#### Artículos
```typescript
interface CMSArticle {
  id: string;
  title: string;
  slug: string;
  content: string; // HTML
  excerpt?: string;
  featuredImage?: string;
  categoryId?: string;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  author: string;
  views: number;
  featured: boolean; // Destacado
  metaTitle?: string;
  metaDescription?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}
```

### 9.3 Gestión de Menús

**Componente**: [CMSMenuManager.tsx](src/pages/CMSMenuManager.tsx)

#### Funcionalidades
- ✅ **Crear menús múltiples** (Header, Footer, Sidebar, Custom)
- ✅ **Elementos de menú** con varios tipos de enlace:
  - 🔗 Enlace a Página interna
  - 📰 Enlace a Artículo
  - 🏷️ Enlace a Categoría
  - 🔗 Enlace personalizado
  - 🌐 Enlace externo
- ✅ **Menús anidados** (submenús)
- ✅ **Reordenar elementos** con flechas arriba/abajo
- ✅ **Drag & Drop** visual (preparado)
- ✅ **Abrir en nueva pestaña**
- ✅ **Clases CSS personalizadas** por elemento
- ✅ **Iconos** opcionales
- ✅ **Vista previa en tiempo real**

#### Estructura de Menús
```typescript
interface CMSMenu {
  id: string;
  name: string;
  location: 'header' | 'footer' | 'sidebar' | 'custom';
  items: CMSMenuItem[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CMSMenuItem {
  id: string;
  label: string;
  type: 'page' | 'article' | 'category' | 'custom' | 'external';
  url?: string;
  pageId?: string;
  articleId?: string;
  categoryId?: string;
  parentId?: string; // Para submenús
  orderIndex: number;
  openInNewTab: boolean;
  cssClass?: string;
  icon?: string;
}
```

### 9.4 Panel de SuperAdmin

**Componente**: [SuperAdminPanel.tsx](src/pages/SuperAdminPanel.tsx)

#### Descripción
Panel completo de administración del sistema según el Manual de Rol SuperAdmin, con control total sobre configuraciones globales, usuarios, contenido y sistema.

#### Pestañas Principales

##### 1. General
- ⚙️ Nombre y descripción del sitio
- 📧 Información de contacto (email, teléfono, dirección)
- 🛠️ Modo mantenimiento
- 👥 Permitir/bloquear registro de usuarios
- 💬 Moderación de comentarios

##### 2. Apariencia
- 🎨 **Colores del tema**:
  - Color primario
  - Color secundario
  - Color de acento
- 🔤 **Familia de fuentes**: Inter, Roboto, Open Sans, Lato, Montserrat, Poppins
- 📐 **Estilos de layout**:
  - Header: Default, Centrado, Minimalista, Mega Menú
  - Footer: Default, Minimalista, Extendido
- 🌐 **Redes sociales**: Facebook, Twitter, LinkedIn, Instagram, YouTube

##### 3. SEO
- 📝 Meta título por defecto
- 📄 Meta descripción por defecto
- 📊 Google Analytics ID
- ✅ Google Site Verification

##### 4. Usuarios
- 👤 **Gestión de usuarios**:
  - Ver lista completa de usuarios
  - Cambiar rol (USER, REVIEWER, COMMITTEE, ADMIN)
  - Activar/desactivar usuarios
  - Ver información detallada
  
##### 5. Eventos
- 📅 Vista general de todos los eventos
- 🟢 Estado (Activo/Inactivo)
- 📊 Estadísticas por evento

##### 6. Avanzado
- ⚠️ **Zona de peligro**:
  - 💾 Exportar todos los datos (JSON)
  - 🔄 Restablecer sistema completo
- ℹ️ Información del sistema:
  - Versión actual
  - Última actualización
  - Tipo de base de datos

#### Estadísticas en Dashboard
```typescript
📊 Total de Usuarios
📆 Total de Eventos
📄 Total de Páginas
📰 Total de Artículos
✅ Usuarios Activos
```

#### Configuración del Sistema
```typescript
interface CMSSettings {
  id: string;
  siteName: string;
  siteDescription: string;
  logo?: string;
  favicon?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  headerStyle: 'default' | 'centered' | 'minimal' | 'mega';
  footerStyle: 'default' | 'minimal' | 'extended';
  socialLinks: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
    youtube?: string;
  };
  contactInfo: {
    email?: string;
    phone?: string;
    address?: string;
  };
  seoSettings: {
    defaultMetaTitle?: string;
    defaultMetaDescription?: string;
    googleAnalytics?: string;
    googleSiteVerification?: string;
  };
  maintenanceMode: boolean;
  allowRegistration: boolean;
  moderateComments: boolean;
}
```

### 9.5 Widgets y Componentes Reutilizables

#### Widgets Disponibles
```typescript
interface CMSWidget {
  id: string;
  name: string;
  type: 'text' | 'html' | 'recent-articles' | 'categories' | 'search' | 'custom';
  content?: string;
  location: 'sidebar' | 'footer' | 'header';
  settings?: Record<string, any>;
  isActive: boolean;
  orderIndex: number;
}
```

**Tipos de widgets**:
- 📝 Texto simple
- 🔧 HTML personalizado
- 📰 Artículos recientes
- 🏷️ Lista de categorías
- 🔍 Búsqueda
- ⚙️ Widget personalizado

### 9.6 Métodos de la Base de Datos CMS

#### Páginas
```typescript
db.cmsPages.getAll()
db.cmsPages.getById(id)
db.cmsPages.getBySlug(slug)
db.cmsPages.getPublished()
db.cmsPages.create(data)
db.cmsPages.update(id, data)
db.cmsPages.delete(id)
db.cmsPages.publish(id)
```

#### Artículos
```typescript
db.cmsArticles.getAll()
db.cmsArticles.getById(id)
db.cmsArticles.getBySlug(slug)
db.cmsArticles.getPublished()
db.cmsArticles.getByCategory(categoryId)
db.cmsArticles.getByTag(tag)
db.cmsArticles.getFeatured()
db.cmsArticles.create(data)
db.cmsArticles.update(id, data)
db.cmsArticles.delete(id)
db.cmsArticles.incrementViews(id)
```

#### Menús
```typescript
db.cmsMenus.getAll()
db.cmsMenus.getById(id)
db.cmsMenus.getByLocation(location)
db.cmsMenus.create(data)
db.cmsMenus.update(id, data)
db.cmsMenus.delete(id)
```

#### Configuración
```typescript
db.cmsSettings.get()
db.cmsSettings.update(data)
```

### 9.7 Rutas del CMS

```typescript
/cms/pages         → Gestión de Páginas
/cms/articles      → Gestión de Artículos
/cms/menus         → Gestión de Menús
/superadmin        → Panel SuperAdmin
```

### 9.8 Permisos y Roles

El CMS está disponible solo para usuarios con rol **ADMIN**. Las opciones aparecen automáticamente en el sidebar cuando el usuario tiene los permisos necesarios.

### 9.9 Flujo de Trabajo CMS

#### Crear una Página
1. Ir a **CMS > Páginas**
2. Click en **Nueva Página**
3. Rellenar título (URL se genera automática)
4. Seleccionar plantilla
5. Usar editor visual o HTML
6. Insertar elementos (títulos, párrafos, imágenes, etc.)
7. Configurar SEO (meta tags)
8. Guardar como borrador o publicar

#### Crear un Artículo
1. Ir a **CMS > Artículos**
2. Click en **Nuevo Artículo**
3. Agregar título y contenido
4. Seleccionar o crear categoría
5. Agregar tags relevantes
6. Marcar como destacado (opcional)
7. Configurar imagen destacada
8. Publicar

#### Gestionar Menús
1. Ir a **CMS > Menús**
2. Crear nuevo menú (Header, Footer, etc.)
3. Agregar elementos:
   - Seleccionar tipo de enlace
   - Elegir página/artículo o URL personalizada
   - Configurar si abre en nueva pestaña
4. Reordenar elementos con flechas
5. Crear submenús (elementos hijos)
6. Guardar cambios

### 9.10 Características Destacadas del CMS

✅ **Editor Visual** con elementos predefinidos
✅ **Modo HTML** para desarrolladores
✅ **Generación automática de slugs** SEO-friendly
✅ **Sistema de plantillas** personalizable
✅ **Categorías anidadas** ilimitadas
✅ **Tags múltiples** por contenido
✅ **Menús jerárquicos** con submenús
✅ **Widgets personalizables** por ubicación
✅ **Configuración global** centralizada
✅ **Exportación de datos** completa
✅ **Modo mantenimiento** con un click
✅ **Gestión de usuarios** desde SuperAdmin
✅ **Estadísticas en tiempo real**
✅ **Responsive por defecto** (Tailwind CSS)

### 9.11 Próximas Mejoras del CMS

🔮 **Planeadas**:
- 📦 Sistema de medios/biblioteca de imágenes
- 🎨 Editor WYSIWYG más avanzado (TinyMCE/CKEditor)
- 🔍 Búsqueda de contenido en frontend
- 💬 Sistema de comentarios para artículos
- 📅 Programación de publicaciones
- 🌍 Multiidioma
- 📱 Vista previa responsive
- 🔐 Roles personalizados de CMS
- 📊 Analytics de contenido
- 🔗 Gestión de redirecciones 301
- 🎨 Constructor de páginas drag & drop

## 10. Estructura de Datos Completa

### Nuevos Modelos CMS (ya implementados)

```typescript
interface CMSPage { ... }          // Páginas del sitio
interface CMSArticle { ... }       // Artículos/Blog
interface CMSCategory { ... }      // Categorías
interface CMSMenu { ... }          // Menús de navegación
interface CMSMenuItem { ... }      // Elementos de menú
interface CMSWidget { ... }        // Widgets
interface CMSSettings { ... }      // Configuración global
```

## 11. Resumen de Rutas Actualizadas

```typescript
// Rutas Originales
/dashboard              → Dashboard principal
/abstracts              → Mis resúmenes
/abstracts/new          → Nuevo resumen
/review                 → Panel de revisión
/committee              → Gestión de comité
/program                → Gestor de programa
/my-program             → Mi programa personal
/events                 → Gestión de eventos
/users                  → Gestión de usuarios

// Nuevas Rutas CMS
/cms/pages              → Gestión de páginas
/cms/articles           → Gestión de artículos
/cms/menus              → Gestión de menús
/superadmin             → Panel SuperAdmin
```

## 12. Navegación Actualizada en Sidebar

**Para Administradores (ADMIN)**:
- Dashboard
- Comité
- Programa
- Eventos
- Usuarios
- **Páginas CMS** 📄 (NUEVO)
- **Artículos** 📰 (NUEVO)
- **Menús** 🍔 (NUEVO)
- **SuperAdmin** 🛡️ (NUEVO)
- Configuración

## 13. Conclusión Final

El sistema ahora cuenta con:

✅ **Gestión de Eventos Científicos Completa**
✅ **Sistema CMS tipo Drupal** para contenido web
✅ **Panel SuperAdmin** con control total
✅ **Gestión de páginas, artículos y menús**
✅ **Editor visual HTML**
✅ **Sistema de categorías y tags**
✅ **Menús jerárquicos personalizables**
✅ **Configuración global centralizada**
✅ **Gestión de usuarios y permisos**
✅ **SEO optimizado**
✅ **Exportación de datos**
✅ **Modo mantenimiento**

El sistema está preparado para funcionar como una **plataforma completa de gestión de eventos + CMS**, similar a Drupal pero especializada en eventos científicos, con una interfaz moderna y amigable basada en React + Tailwind CSS.

**Total de componentes creados**: 4 nuevos (CMSPagesManager, CMSArticlesManager, CMSMenuManager, SuperAdminPanel)
**Total de interfaces agregadas**: 8 nuevas en database.ts
**Total de rutas agregadas**: 4 nuevas
**Total de métodos CRUD**: 30+ nuevos métodos en database.ts

### Nuevos Modelos

```typescript
interface Author {
  id: string;
  name: string;
  email?: string;
  affiliation?: string;
  isMainAuthor: boolean;
}

interface CommitteeMember {
  id: string;
  userId: string;
  eventId: string;
  role: 'COORDINADOR' | 'COORDINADOR_CIENTIFICO' | 'RESPONSABLE_ASIGNACIONES' | 'MIEMBRO';
  thematic?: string;
  assignedAt: string;
}

interface Thematic {
  id: string;
  eventId: string;
  name: string;
  description?: string;
  duration: number; // minutos
  createdAt: string;
}

interface WorkAssignment {
  id: string;
  abstractId: string;
  reviewerId: string;
  assignedBy: string;
  assignedAt: string;
  status: 'pending' | 'in_review' | 'completed';
}

interface ProgramSession {
  id: string;
  eventId: string;
  title: string;
  thematicId?: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  type: 'CONFERENCIA' | 'SESION_ORAL' | 'POSTER' | 'PLENARIA' | 'BREAK';
  abstracts: string[];
  moderator?: string;
  orderIndex: number;
}

interface DelegateProgram {
  id: string;
  userId: string;
  eventId: string;
  sessionIds: string[];
  createdAt: string;
  updatedAt: string;
}
```

### Modelo Abstract Actualizado
```typescript
interface Abstract {
  id: string;
  userId: string; // Usuario que subió
  eventId: string;
  title: string;
  summaryText: string;
  keywords: string[];
  authors: Author[]; // Array completo de autores
  mainAuthorId: string; // ID del autor principal
  status: AbstractStatus;
  version: number;
  createdAt: string;
  updatedAt: string;
  categoryType?: 'Ponencia' | 'Poster' | 'Conferencia';
  thematicId?: string; // Temática asignada
  assignedReviewerId?: string; // Árbitro específico
  sessionId?: string; // Sesión del programa
}
```

## 10. Flujos de Trabajo Completos

### Flujo 1: Envío y Revisión de Trabajo
1. **Autor** crea trabajo, define autor principal y co-autores
2. **Sistema** asigna temática
3. **Coordinador** asigna árbitro específico de esa temática
4. **Árbitro** revisa y puede cambiar temática si es incorrecta
5. **Sistema** reasigna si es necesario
6. **Árbitro** aprueba/rechaza trabajo

### Flujo 2: Generación de Programa
1. **Coordinador** aprueba trabajos finales
2. **Sistema** genera propuesta de programa automática
3. **Coordinador (Melisa)** ajusta horarios, elimina/mueve trabajos
4. **Sistema** publica programa
5. **Delegados** crean sus programas personales

### Flujo 3: Participación del Delegado
1. **Delegado** se registra al evento
2. **Delegado** accede al programa publicado
3. **Delegado** selecciona sesiones de interés
4. **Sistema** valida conflictos de horario
5. **Delegado** guarda su programa personal
6. **Delegado** accede a su agenda durante el evento

## 11. Rutas y Navegación

### Rutas Nuevas
- `/program` - Gestor de programa (Coordinador)
- `/my-program` - Programa personal (Delegados)

### Menú Actualizado
**Coordinador/Comité**:
- Dashboard
- Comité (con pestañas: Asignaciones, Categorías)
- Programa
- Eventos
- Usuarios
- Configuración

**Árbitros**:
- Dashboard
- Revisar (con opción de cambiar temática)
- Mi Programa
- Configuración

**Participantes/Delegados**:
- Dashboard
- Mis Resúmenes
- Mi Programa
- Configuración

## 12. Notificaciones y Comunicación

### Sistema de Notificaciones
- Asignación de trabajos a árbitros
- Cambios de temática que requieren reasignación
- Aprobación/rechazo de trabajos
- Cambios en el programa publicado
- Recordatorios de sesiones (futuro)

## 13. Próximos Pasos y Mejoras Futuras

### Funcionalidades Sugeridas
1. **Gestión de Certificados**: Generación automática para participantes
2. **Sistema de QR**: Check-in en sesiones
3. **Encuestas de Evaluación**: Feedback de participantes sobre sesiones
4. **Chat en Vivo**: Comunicación durante el evento
5. **Grabaciones**: Links a grabaciones de sesiones virtuales
6. **Networking**: Matchmaking entre participantes por intereses
7. **Gamificación**: Puntos por asistencia y participación
8. **App Móvil**: Versión nativa para iOS/Android
9. **Modo Offline**: Acceso al programa sin internet
10. **Exportar Programa**: PDF, iCal, Google Calendar

### Optimizaciones Técnicas
1. **Performance**: Implementar paginación en listas largas
2. **Cache**: Redis para datos frecuentemente accedidos
3. **Backend Real**: Migrar de localStorage a API REST
4. **Base de Datos**: PostgreSQL con índices optimizados
5. **Búsqueda**: Elasticsearch para búsquedas avanzadas
6. **Tiempo Real**: WebSockets para actualizaciones live
7. **Tests**: Suite completa de tests unitarios e integración

## 14. Conclusión

Se ha implementado exitosamente un sistema integral que unifica todas las funcionalidades previamente dispersas, con las siguientes mejoras clave:

✅ **Comité Organizador**: Estructura jerárquica con roles definidos
✅ **Asignación de Árbitros**: Control granular con validación de unicidad
✅ **Autor Principal**: Gestión correcta de autoría
✅ **Cambio de Temática**: Flujo completo con reasignación inteligente
✅ **Generador de Programa**: Propuesta automática basada en datos reales
✅ **Editor de Programa**: Interface amigable para coordinador
✅ **Programa Personal**: Delegados crean su propia agenda
✅ **Notificaciones**: Sistema de comunicación integrado

El sistema está ahora preparado para manejar eventos científicos de cualquier escala, desde pequeños simposios hasta grandes congresos internacionales, con una experiencia de usuario moderna y flujos de trabajo optimizados.
