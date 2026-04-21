# SGE - Sistema de Gestión de Eventos

## 📚 Guía Completa para Entender la Plataforma

*Documento creado con fines didácticos para que cualquier persona pueda comprender el funcionamiento de esta aplicación de gestión de eventos.*

---

## 🎯 Introducción: ¿Qué es SGE?

Imagina que necesitas organizar un congreso científico internacional con cientos de participantes, decenas de ponencias, múltiples hoteles, transporte desde el aeropuerto, actividades sociales, y un sistema de revisión de trabajos por pares. Gestionar todo esto con hojas de cálculo y correos electrónicos sería un caos total.

**SGE (Sistema de Gestión de Eventos)** es una plataforma digital todo-en-uno que permite a organizadores de eventos, hoteles, empresas receptivas y participantes gestionar de forma centralizada y eficiente cualquier tipo de evento: congresos, conferencias, simposios, talleres, seminarios, y más.

**En términos simples**: Es como tener un asistente administrativo digital que automatiza y organiza todo lo relacionado con la planificación y ejecución de un evento.

---

## 🏢 ¿Para quién es SGE?

SGE está diseñado para diferentes tipos de organizaciones y usuarios:

### 1. **Organizadores de Eventos (Admin/Receptivo)**
Instituciones que planifican y ejecutan eventos científicos, académicos o comerciales. Son los "amos y señores" de la plataforma.

### 2. **Empresas y Corporaciones**
Que participan como sponsors o entidades colaboradoras en eventos.

### 3. **Hoteles y Centros de Convenciones**
Que proporcionan hospedaje y espacios para el evento. Necesitan coordinar habitaciones, salones, y atender solicitudes de los huéspedes.

### 4. **Revisores (Reviewers)**
Expertos en diferentes áreas temáticas que evalúan los trabajos científicos (resúmenes/abstracts) enviados por los participantes.

### 5. **Comités Organizadores**
Equipos responsables de la logística y programación científica del evento.

### 6. **Participantes/Usuarios**
Profesionales, investigadores y estudiantes que asisten a los eventos, envían trabajos científicos, se inscriben y asisten a las actividades.

---

## 🔑 Funcionalidades Principales

### 📋 **1. Gestión de Eventos**

Un "Evento" en SGE puede ser:
- Un Congreso Internacional
- Una Conferencia Científica
- Un Simposio
- Un Taller de Capacitación
- Cualquier actividad grupal planificada

Cada evento tiene:
- **Información básica**: Nombre, fechas, descripción, colores institucionales
- **Banner y logo**: Para personalización visual
- **Estado**: Activo/Inactivo (borrador o publicado)

### 🏨 **2. Gestión de Hoteles y Alojamiento**

El sistema permite:
- Registrar hoteles asociados al evento
- Definir tipos de habitaciones (estándar, suite, etc.)
- Establecer precios por noche y moneda
- Controlar disponibilidad de habitaciones
- Asignar habitaciones a participantes

### 🚗 **3. Sistema de Transporte**

Gestiona la logística de transporte:
- Rutas desde/hacia aeropuertos
- Horarios de traslado
- Tipos de vehículos (autobús, van, taxi)
- Precios por ruta

### 🍽️ **4. Programa Social y Actividades**

Coordina las actividades fuera de las sesiones académicas:
- Excursiones turísticas
- Cenas de gala
- Visitas culturales
- Precios,Cupos, incluye transporte/comida

### 📚 **5. Gestión de Temas (Nomencladores)**

Sistema de categorías y tipos configurable:
- **Temáticas**: Temas del evento (ej: "Inteligencia Artificial", "Medicina Nuclear")
- **Áreas de trabajo**: Divisions organizativas
- **Categorías de revisión**: Para clasificar trabajos
- **Tipos de participación**: Asistente, Ponente, Moderador, etc.

### 📝 **6. Envío y Revisión de Trabajos (Abstracts)**

Este es el corazón académico del sistema:

1. **Participante envía trabajo**: Envía un resumen/abstract con título, autores, temática, archivo PDF
2. **Sistema lo recibe**: Lo associa a una temática
3. **Revisores evalúan**: Los expertos revisan según criterios establecidos
4. **Comité decide**: Aprueban o rechazan
5. **Participante recibe notificación**: Por correo electrónico

### 📝 **7. Constructor de Formularios (Drag & Drop)**

Sistema visual para crear formularios de inscripción sin programar:
- Arrastrar campos (texto, email, select, checkbox, etc.)
- Configurar propiedades (requerido, placeholder, ancho)
- Vista previa en tiempo real
- Diseño de 2 columnas por defecto

### 📧 **8. Plantillas de Correo**

Sistema de notificaciones automatizadas:
- Confirmación de inscripción
- Notificación de aprobación/rechazo de trabajos
- Recordatorios de fechas
- Certificados de participación

Editor visual con variables dinámicas como `{{nombre_usuario}}`, `{{titulo_trabajo}}`, etc.

### 🏆 **9. Certificados y Credenciales**

Generación automática de:
- Certificados de participación
- Certificados de presentación de trabajo
- Credenciales de acceso

### 📄 **10. CMS (Gestión de Contenido)**

Para la página pública del evento:
- **Páginas**: Información estática (Acerca de, Cómo llegar)
- **Artículos**: Blog/Noticias
- **Menús**: Navegación del sitio
- **Widgets**: Componentes reutilizables

---

## 🔄 Flujo de Uso: Un Recorrido Typical

### **Escenario: Congreso Internacional de Medicina 2026**

#### Fase 1: Preparación (6 meses antes)

1. **El Administrador crea el evento**
   - Accede a `/events` → "Crear Nuevo Evento"
   - Wizard de 7 pasos:
     - Paso 1: Datos básicos (nombre, fechas, colores)
     - Paso 2: Hoteles y salones
     - Paso 3: Tipos de participación y precios
     - Paso 4: Transporte
     - Paso 5: Programa social
     - Paso 6: Temáticas y categorías
     - Paso 7: Revisión final y publicación

2. **Configura las temáticas**
   - Ej: "Cardiología", "Neurología", "Oncología"
   - Cada temática puede asignarse a un subevento específico
   - Regla: Una temática = un subevento (para evitar confusión)

3. **Crea el formulario de inscripción**
   - Usa el constructor visual
   - Arrastra campos: Nombre, Email, Teléfono, institución
   - Configura qué campos son obligatorios

4. **Configura las plantillas de correo**
   - Plantilla de confirmación de inscripción
   - Plantilla de aceptación de trabajo

#### Fase 2: Inscripción (3 meses antes)

5. **Participante se registra**
   - Entra a la página pública del evento
   - Ve los eventos activos
   - Hace clic en "Inscribirse"
   - Completa el formulario de inscripción
   - Recibe correo de confirmación

6. **Participante envía trabajo**
   - Accede a "Mis Resúmenes"
   - Completa formulario con título, resumen, autores
   - Adjunta PDF
   - Selecciona temática
   - Envía
   - Recibe confirmación por correo

#### Fase 3: Proceso de Revisión

7. **Revisores evalúan**
   - Acceso al módulo "Revisar"
   - Ven los trabajos asignados a sus temáticas
   - Evalúan según criterios (originalidad, calidad, relevancia)
   - Envían recomendación: Aprobar / Rechazar / Modificaciones

8. **Comité toma decisión final**
   - Revisa recomendaciones de revisores
   - Aprueba o rechaza definitivamente
   - Notifica al autor

#### Fase 4: Durante el Evento

9. **Gestión de Hotel**
   - Coordinadores de hotel ven reservas
   - Asignan habitaciones
   - Gestionan check-in/check-out

10. **Programa del Evento**
    - Participantes ven su programa personalizado
    - Acceden a sesiones según sus inscripciones
    - Marcan asistencia

11. **Actividades Sociales**
    - Inscripción a excursiones
    - Control decupos

#### Fase 5: Post-Evento

12. **Certificados**
    - Sistema genera certificados automáticos
    - Participantes pueden descargar desde "Mis Actividades"

---

## 👥 Roles de Usuario en SGE

| Rol | Descripción | Permisos |
|-----|-------------|----------|
| **USER** | Participante regular | Inscribirse, enviar trabajos, ver programa |
| **REVIEWER** | Evaluador de trabajos | Revisar abstracts asignados |
| **COMMITTEE** | Miembro del comité | Aprobar/rechazar, gestionar programa |
| **SUPERADMIN** | Administrador total | Acceso a todo, configurar nomencladores globales |
| **ADMIN_RECEPTIVO** | Admin de agencia receptiva | Gestionar eventos de su agencia |
| **ADMIN_EMPRESA** | Admin empresarial | Gestionar eventos de su empresa |
| **COORDINADOR_HOTEL** | Coordinador de hotel | Gestionar hotel, reservas, salones |
| **LECTOR_RECEPTIVO** | Visualizador de agencia | Solo lectura de datos |
| **LECTOR_EMPRESA** | Visualizador empresarial | Solo lectura de datos |

---

## 🏗️ Arquitectura Técnica (Simplificada)

### Tecnologías Utilizadas

- **Frontend**: React + TypeScript
- **Estilos**: Tailwind CSS + shadcn/ui
- **Build**: Vite
- **Base de datos**: localStorage (simulación)
- **Internationalización**: i18n (Español/Inglés)
- **Drag & Drop**: @dnd-kit

### Estructura de Datos Principal

```
USUARIOS
├── name, email, role, país, institución

EVENTOS (MacroEvent)
├── name, acronym, dates, colors, logo
├── URL pública del evento
├── Modo de carga de trabajos (temática/subevento)

SUB-EVENTOS (dentro de un evento)
├── nombre, tipo (simposio/curso/taller)
├── temáticas asociadas
├── capacidad, precio

TEMÁTICAS
├── nombre, descripción
├── linked a un subevento específico

TRABAJOS (Abstracts)
├── título, resumen, PDF
├── autor(es), temática
├── estado (pendiente/aprobado/rechazado)

INSCRIPCIONES
├── usuario, evento
├── tipo participación, habitación
├── estado de pago

HOTELES
├── nombre, estrellas, ubicación
├── habitaciones (tipos, precios,cupo)

SALONES
├── linked a hotel
├── capacidad, equipamiento

TRANSPORTE
├── rutas, horarios, precios

ACTIVIDADES SOCIALES
├── nombre, fecha, precio
├── incluye transporte, incluye comida
```

---

## 📱 Páginas Principales del Sistema

| Ruta | Página | Descripción |
|------|--------|-------------|
| `/` | Inicio | Landing page pública con eventos activos |
| `/login` | Iniciar Sesión | Autenticación de usuarios |
| `/dashboard` | Panel Principal | Vista personalizada según rol |
| `/events` | Gestión de Eventos | Admin de eventos y sub-eventos |
| `/events/wizard/:id` | Wizard de Evento | Crear/editar evento paso a paso |
| `/abstracts` | Mis Resúmenes | Trabajos enviados por el usuario |
| `/review` | Revisar | Evaluación de trabajos (para reviewers) |
| `/committee` | Comité | Gestión de programa científico |
| `/program` | Programa | Programación oficial del evento |
| `/my-program` | Mi Programa | Programa personalizado del usuario |
| `/settings` | Configuración | Preferencias del usuario |
| `/host` | Módulo Hotel | Gestión de hoteles y reservas |
| `/cms/*` | CMS | Gestión de contenido público |
| `/superadmin` | SuperAdmin | Configuración de nomencladores globales |

---

## 🎓 Ejemplo Concreto: Flujo de un Participante

### Juan, investigador en Medicina

1. **Descubre el evento**: Ve en internet el "Congreso Internacional de Cardiología 2026"
2. **Se informa**: Entra a la página pública, lee sobre el evento, ve hoteles y precios
3. **Se registra**: Crea una cuenta en SGE
4. **Se inscribe**: Completa el formulario, elige "Ponente" como tipo de participación, reserva habitación en el Hotel Nacional
5. **Envía trabajo**: Prepara su investigación "Nuevos tratamientos para insuficiencia cardíaca" y la envía
6. **Espera**: Recibe correos sobre el estado de su trabajo
7. **Recibe acceptación**: Su trabajo es aprobado, recibe certificado de presentación
8. **Asiste al evento**: Obtiene su credencial, asiste a las sesiones, participa en actividades sociales
9. **Post-evento**: Descarga su certificado de participación

---

## 🔗 Prompt para NotebookLM

Para crear una presentación en audio o tarjetas interactivas con NotebookLM, puedes usar este prompt:

---

### 📝 PROMPT PARA NOTEBOOKLM

> "Crea una presentación de audio (podcast) y tarjetas interactivas basadas en el siguiente documento que describe el **SGE - Sistema de Gestión de Eventos**, una plataforma digital completa para organizar congresos, conferencias y eventos científicos.
>
> **El documento incluye:**
>
> - **¿Qué es SGE?**: Una plataforma todo-en-uno para gestionar eventos con múltiples funcionalidades (hoteles, transporte, inscripciones, revisión de trabajos, certificados, etc.)
>
> - **Tipos de usuarios**: Participantes, Revisores, Comités, Administradores de hoteles, Administradores de agencias receptivas
>
> - **Funcionalidades principales**: 
>   - Gestión de eventos con wizard de 7 pasos
>   - Sistema de hoteles y habitaciones
>   - Transporte y logística  
>   - Programa social y actividades
>   - Envío y revisión de trabajos científicos (abstracts)
>   - Constructor visual de formularios (drag & drop)
>   - Plantillas de correo automatizadas
>   - Generación de certificados
>   - CMS para páginas públicas
>
> - **Flujo de uso**: Desde la creación del evento hasta la entrega de certificados, pasando por inscripciones, envío de trabajos, revisión por pares, y asistencia al evento
>
> - **Roles disponibles**: USER, REVIEWER, COMMITTEE, SUPERADMIN, ADMIN_RECEPTIVO, ADMIN_EMPRESA, COORDINADOR_HOTEL
>
> - **Ejemplo concreto**: Juan, un investigador que se inscribe a un congreso, envía su trabajo, es aprobado y asiste al evento
>
> **Instrucciones especiales:**
> - Explica los conceptos de forma sencilla y didáctica
> - Usa analogías de la vida cotidiana
> - Haz énfasis en cómo cada tipo de usuario interactúa con el sistema
> - El audio debe ser conversacional y entretenido
> - Las tarjetas deben tener preguntas frecuentes con respuestas claras"

---

## ✅ Resumen

**SGE es una plataforma integral que digitaliza y automatiza toda la gestión de eventos**, desde la planificación inicial hasta la entrega de certificados finales. 

Su kekuatan radica en:
- ✅ **Centralización**: Todo en un solo lugar
- ✅ **Automatización**: Notificaciones, certificados, programación
- ✅ **Flexibilidad**: Múltiples tipos de eventos y configuraciones
- ✅ **Escalabilidad**: Desde pequeños talleres hasta grandes congresos internacionales
- ✅ **Accesibilidad**: Interfaz web accesible desde cualquier dispositivo

**En esencia**: Si necesitas organizar cualquier tipo de evento con participantes, sesiones, hoteles y logística, SGE te ayuda a hacerlo de manera eficiente, organizada y profesional.

---

*Documento generado para fines educativos y de documentación del proyecto SGE.*
