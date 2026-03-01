# Documento Maestro de Arquitectura del Sistema

## 1. Introducción

### 1.1. Objetivo
Este documento constituye la especificación técnica y funcional definitiva para el desarrollo del sistema de gestión de eventos. Su propósito es establecer de manera unificada y detallada el **catálogo de nomencladores (tablas maestras)** y la **matriz de roles, permisos y aislamiento de datos**.

Sirve como la única fuente de verdad para el equipo de desarrollo, testers, administradores de base de datos y auditores, asegurando la estandarización de datos, la integridad referencial y un control de acceso riguroso en todos los módulos (Eventos, Programa, Comité, Transporte, Participantes y Nomencladores).

### 1.2. Convenciones del Documento
- **`PK`** : Clave Primaria.
- **`FK`** : Clave Foránea.
- **`Global`**: Entidad gestionada únicamente por Superadmin y visible en todo el sistema.
- **`Por Evento`**: Entidad que puede ser personalizada o gestionada en el contexto de un evento específico.
- **`RB-XX`**: Regla de Negocio, numerada para su fácil trazabilidad.

---

## 2. Módulo de Nomencladores (Tablas Maestras)

Este módulo gestiona los catálogos del sistema. Es crucial para mantener la consistencia de los datos.

### 2.1. Tipos de Nomencladores

| Tipo | Descripción | Ejemplo |
| :--- | :--- | :--- |
| **Global** | Aplica a todo el sistema. Solo el rol **Superadmin** puede modificar estos catálogos. | `Receptivo`, `Hotel`, `Tipo de Participación`, `Tipo de Transporte`, `Tipo de Habitación`. |
| **Por Evento** | Son instancias o asignaciones que se realizan en el contexto de un evento específico. | La asignación de `Hotel` a un `Evento` (`evento_hotel`), el precio de una habitación para un evento. |

### 2.2. Catálogo: `Receptivo`
Representa las agencias o grupos turísticos grandes (e.g., Havanatur, Gaviota).

| Campo | Tipo | PK | FK | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| `id` | INT | ✅ | ❌ | Identificador único autogenerado. |
| `siglas` | VARCHAR(20) | ❌ | ❌ | Código interno único (HAV, GAV). |
| `nombre` | VARCHAR(100) | ❌ | ❌ | Nombre comercial. |
| `pais_id` | INT | ❌ | ✅ | FK a tabla `paises`. |
| `contacto_email` | VARCHAR(100) | ❌ | ❌ | Email corporativo general. |
| `contacto_telefono` | VARCHAR(20) | ❌ | ❌ | Teléfono de contacto. |
| `activo` | BOOLEAN | ❌ | ❌ | Estado del receptivo (activo/inactivo). |

**Reglas de Negocio:**
- **RB-NOM-01:** El campo `siglas` debe ser único en todo el sistema.
- **RB-NOM-02:** Solo el rol **Superadmin** puede crear, editar o desactivar receptivos.
- **RB-NOM-03:** No se puede eliminar (o desactivar) un receptivo si tiene empresas asociadas (`Empresa`).

### 2.3. Catálogo: `Empresa`
Empresas o agencias más pequeñas que pertenecen a un receptivo.

| Campo | Tipo | PK | FK | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| `id` | INT | ✅ | ❌ | Identificador único. |
| `receptivo_id` | INT | ❌ | ✅ | FK a `receptivos(id)`. **Clave de aislamiento.** |
| `codigo` | VARCHAR(20) | ❌ | ❌ | Código interno único por receptivo. |
| `nombre` | VARCHAR(100) | ❌ | ❌ | Razón social. |
| `nit_rfc` | VARCHAR(50) | ❌ | ❌ | Identificación fiscal. |
| `contacto_principal` | VARCHAR(100) | ❌ | ❌ | Persona de contacto. |
| `contacto_email` | VARCHAR(100) | ❌ | ❌ | Email de contacto. |
| `contacto_telefono` | VARCHAR(20) | ❌ | ❌ | Teléfono de contacto. |
| `direccion` | TEXT | ❌ | ❌ | Dirección física. |
| `activo` | BOOLEAN | ❌ | ❌ | Estado de la empresa. |

**Reglas de Negocio:**
- **RB-NOM-04:** El `codigo` debe ser único dentro del mismo `receptivo_id`.
- **RB-NOM-05:** No se puede eliminar una empresa si tiene eventos asociados.

### 2.4. Catálogo: `Tipo de Participación`

| Campo | Tipo | PK | FK | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| `id` | INT | ✅ | ❌ | Identificador único. |
| `nombre` | VARCHAR(50) | ❌ | ❌ | Nombre descriptivo (ASISTENTE, PONENTE). |
| `descripcion` | TEXT | ❌ | ❌ | Detalle del tipo. |
| `requiere_pago` | BOOLEAN | ❌ | ❌ | Define si el tipo de participante debe pagar inscripción. |
| `aparece_en_listado_publico`| BOOLEAN | ❌ | ❌ | Control de visibilidad en agendas públicas. |
| `activo` | BOOLEAN | ❌ | ❌ | Estado. |

### 2.5. Catálogo: `Tipo de Transporte`

| Campo | Tipo | PK | FK | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| `id` | INT | ✅ | ❌ | Identificador único. |
| `nombre` | VARCHAR(50) | ❌ | ❌ | Nombre descriptivo (Autobús, Minivan). |
| `descripcion` | TEXT | ❌ | ❌ | Detalle. |
| `capacidad_min` | INT | ❌ | ❌ | Capacidad mínima de pasajeros. |
| `capacidad_max` | INT | ❌ | ❌ | Capacidad máxima de pasajeros. |
| `requiere_chofer` | BOOLEAN | ❌ | ❌ | Si necesita un conductor asignado sí o sí. |
| `requiere_licencia_especial`| BOOLEAN | ❌ | ❌ | Si se necesita un tipo de licencia especial. |
| `costo_por_persona` | BOOLEAN | ❌ | ❌ | Si el costo del servicio se calcula por persona. |
| `activo` | BOOLEAN | ❌ | ❌ | Estado. |

### 2.6. Catálogo: `Hotel`
Entidad global que representa un alojamiento.

| Campo | Tipo | PK | FK | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| `id` | INT | ✅ | ❌ | Identificador único. |
| `nombre` | VARCHAR(100) | ❌ | ❌ | Nombre comercial. |
| `cadena_hotelera` | VARCHAR(50) | ❌ | ❌ | Cadena a la que pertenece. |
| `categoria_estrellas` | INT | ❌ | ❌ | Categoría (1 a 5). |
| `ciudad` | VARCHAR(50) | ❌ | ❌ | Ciudad. |
| `direccion` | TEXT | ❌ | ❌ | Dirección física completa. |
| `telefono` | VARCHAR(20) | ❌ | ❌ | Teléfono de contacto. |
| `email` | VARCHAR(100) | ❌ | ❌ | Email de contacto. |
| `activo` | BOOLEAN | ❌ | ❌ | Estado. |

**Reglas de Negocio:**
- **RB-NOM-06:** Solo Superadmin puede crear hoteles globales.
- **RB-NOM-07:** No se puede eliminar un hotel si hay eventos usándolo (ver tabla `evento_hotel`).

### 2.7. Catálogo: `Tipo de Habitación`

| Campo | Tipo | PK | FK | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| `id` | INT | ✅ | ❌ | Identificador único. |
| `nombre` | VARCHAR(50) | ❌ | ❌ | Nombre (Estándar, Suite, Doble). |
| `descripcion` | TEXT | ❌ | ❌ | Detalle del tipo. |
| `capacidad_max_personas` | INT | ❌ | ❌ | Capacidad máxima. |
| `activo` | BOOLEAN | ❌ | ❌ | Estado. |

### 2.8. Tabla Intermedia: `hoteles_tipos_habitacion`
Relaciona hoteles con tipos de habitación y define precios base.

| Campo | Tipo | PK | FK | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| `id` | INT | ✅ | ❌ | Identificador único. |
| `hotel_id` | INT | ❌ | ✅ | FK a `hoteles`. |
| `tipo_habitacion_id` | INT | ❌ | ✅ | FK a `tipos_habitacion`. |
| `precio_con_desayuno` | DECIMAL(10,2) | ❌ | ❌ | Precio base con desayuno. |
| `precio_con_todo_incluido`| DECIMAL(10,2) | ❌ | ❌ | Precio base todo incluido. |
| `activo` | BOOLEAN | ❌ | ❌ | Estado de la relación. |

**Reglas de Negocio:**
- **RB-NOM-08:** Un hotel puede tener múltiples tipos de habitación y viceversa (relación muchos a muchos).
- **RB-NOM-09:** Los precios aquí son referenciales. Pueden variar por evento (se sobrescriben en la tabla `evento_hotel`).

### 2.9. Tabla de Asignación: `evento_hotel`
Asigna hoteles a un evento específico, heredando o sobrescribiendo precios.

| Campo | Tipo | PK | FK | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| `id` | INT | ✅ | ❌ | Identificador único. |
| `evento_id` | INT | ❌ | ✅ | FK al evento. |
| `hotel_id` | INT | ❌ | ✅ | FK al hotel. |
| `fecha_checkin` | DATE | ❌ | ❌ | Fecha de entrada para el bloque de habitaciones. |
| `fecha_checkout` | DATE | ❌ | ❌ | Fecha de salida. |
| ... | ... | ... | ... | (Puede incluir sobreescritura de precios, etc.) |

---

## 3. Módulo de Seguridad: Roles, Permisos y Aislamiento de Datos

### 3.1. Definición de Roles

| ID Rol | Nombre del Rol | Descripción | Alcance de Datos |
| :--- | :--- | :--- | :--- |
| **R01** | **SuperAdmin** | Control total sobre la plataforma. | **Global:** Todos los datos de todos los receptivos, empresas y eventos. |
| **R02** | **Admin Receptivo** | Gestiona todos los eventos y datos de una agencia específica (receptivo). | **Receptivo:** Solo datos donde `receptivo_id` = ID de su receptivo. No ve otros receptivos. |
| **R03** | **Admin Empresa** | Gestiona los eventos de UNA sola empresa. | **Empresa:** Solo datos de eventos donde `empresa_id` = ID de su empresa (pero dentro de su `receptivo_id`). |
| **R04** | **Coordinador de Eventos del Hotel (Nuevo Rol)** | Usuario de un hotel específico. Gestiona la logística **solo de los eventos** que se celebran en su hotel. | **Hotel-Evento:** Solo puede ver y gestionar la información de los eventos asignados a su `hotel_id` en la tabla `evento_hotel`. |
| **R05** | **Lector / Colaborador Receptivo** | Visualiza los eventos de un receptivo. | **Receptivo (Solo Lectura):** Solo datos de su `receptivo_id`. |
| **R06** | **Lector / Colaborador Empresa** | Visualiza los eventos de una sola empresa. | **Empresa (Solo Lectura):** Solo datos de su `empresa_id`. |

### 3.2. Matriz de Permisos Detallada

| Funcionalidad / Módulo | SuperAdmin (R01) | Admin Receptivo (R02) | Admin Empresa (R03) | Coordinador Hotel (R04) |
| :--- | :--- | :--- | :--- | :--- |
| **CONFIGURACIÓN Y SEGURIDAD** | | | | |
| Configuración Global del Sistema | ✅ (Editar todo) | ❌ | ❌ | ❌ |
| Gestión de Usuarios (Crear/Editar) | ✅ (Cualquier rol) | ✅ (Solo R02, R03, R04, R05, R06 de su receptivo) | ❌ | ❌ |
| Gestión de Roles y Permisos | ✅ | ❌ | ❌ | ❌ |
| **MÓDULO DE NOMENCLADORES** | | | | |
| Gestionar Catálogos Globales (Hoteles, Tipos Hab, etc.) | ✅ | ❌ | ❌ | ❌ |
| Ver Catálogos Globales | ✅ | ✅ | ✅ | ✅ |
| **MÓDULO DE EVENTOS** | | | | |
| Crear Evento | ✅ | ✅ (Asigna su `receptivo_id`) | ✅ (Asigna su `empresa_id`) | ❌ |
| Ver Lista de Eventos | ✅ (Todos) | ✅ (Solo de su receptivo) | ✅ (Solo de su empresa) | ✅ (Solo eventos en su hotel) |
| Editar / Eliminar Evento | ✅ (Todos) | ✅ (Solo de su receptivo) | ✅ (Solo de su empresa) | ❌ |
| Publicar / Despublicar Evento | ✅ | ✅ (Solo de su receptivo) | ✅ (Solo de su empresa) | ❌ |
| Dashboard / Estadísticas | ✅ (Consolidado Global) | ✅ (Solo su receptivo) | ✅ (Solo su empresa) | ✅ (Solo su hotel) |
| **MÓDULO: COMITÉ ORGANIZADOR** | | | | |
| Ver miembros del comité | ✅ (Todos) | ✅ (Solo de sus eventos) | ✅ (Solo de su empresa) | ✅ (Solo de sus eventos) |
| Agregar/Editar miembros | ✅ | ✅ (Solo de sus eventos) | ✅ (Solo de su empresa) | ❌ |
| Asignar roles en el comité | ✅ | ✅ (Solo de sus eventos) | ✅ (Solo de su empresa) | ❌ |
| **MÓDULO: TRANSPORTE** | | | | |
| Ver solicitudes de transporte | ✅ (Todas) | ✅ (Solo de su receptivo) | ✅ (Solo de su empresa) | ✅ (Solo de sus eventos) |
| Aprobar/Rechazar/Asignar | ✅ | ✅ (Solo de su receptivo) | ✅ (Solo de su empresa) | ❌ |
| Ver mapa en tiempo real | ✅ (Todos) | ✅ (Solo de su receptivo) | ✅ (Solo de su empresa) | ✅ (Solo de sus eventos) |
| **MÓDULO: PARTICIPANTES** | | | | |
| Ver listado de participantes | ✅ (Todos) | ✅ (Solo de su receptivo) | ✅ (Solo de su empresa) | ✅ (Solo de sus eventos) |
| Registrar / Editar participante | ✅ | ✅ (Solo de su receptivo) | ✅ (Solo de su empresa) | ❌ (Solo lectura) |
| Exportar lista de participantes | ✅ | ✅ | ✅ | ✅ (Solo de sus eventos) |
| Ver historial de participación | ✅ (Todos) | ✅ (Solo de su receptivo) | ✅ (Solo de su empresa) | ✅ (Solo de sus eventos) |
| **AUDITORÍA Y LOGS** | | | | |
| Ver logs de actividad del sistema | ✅ (Todos) | ❌ | ❌ | ❌ |
| Ver logs de un receptivo/empresa | ✅ | ✅ (Solo su receptivo) | ❌ | ❌ |
| **MÓDULO: PROGRAMA DEL EVENTO** | | | | |
| Ver programa de cualquier evento | ✅ | ✅ (Solo de su receptivo) | ✅ (Solo de su empresa) | ✅ (Solo de sus eventos) |
| Crear/Editar sesiones del programa | ✅ | ✅ (Solo de sus eventos) | ✅ (Solo de su empresa) | ❌ |
| Publicar programa | ✅ | ✅ | ✅ | ❌ |
| **ACCESO A API** | ✅ (Sin filtros) | ✅ (Filtrado x `receptivo_id`) | ✅ (Filtrado x `receptivo_id` y `empresa_id`) | ✅ (Filtrado x `hotel_id` en `evento_hotel`) |

### 3.3. Reglas de Negocio de Aislamiento (4 Niveles)

| ID | Regla | Descripción | Aplica A |
| :--- | :--- | :--- | :--- |
| **RB-SEG-01** | **Aislamiento por Receptivo** | Un usuario con rol de receptivo NO puede ver datos de otro receptivo. | R02, R05 |
| **RB-SEG-02** | **Aislamiento por Empresa** | Un usuario con rol de empresa NO puede ver datos de otra empresa, incluso si es del mismo receptivo. | R03, R06 |
| **RB-SEG-03** | **Aislamiento por Hotel (Nuevo)** | Un Coordinador de Hotel SOLO puede ver la información de los eventos que están asignados a su hotel. No ve el resto de eventos del sistema. | R04 |
| **RB-SEG-04** | **Herencia de Permisos** | Todos los submódulos (Programa, Comité, Transporte, Participantes) heredan el aislamiento del evento padre. | Todos |
| **RB-SEG-05** | **Validación de Propiedad** | Cualquier acceso por URL directa o consulta a API debe validar los IDs de aislamiento (`receptivo_id`, `empresa_id`, `hotel_id`) contra la sesión del usuario. | Sistema/Backend |
| **RB-SEG-06** | **Superadmin Impersonar** | El Superadmin puede tener una funcionalidad para "actuar como" cualquier otro rol para fines de soporte. Cada acción en este modo debe quedar registrada en un log de auditoría. | R01 |

---

## 4. Glosario de Términos

-   **Receptivo:** Agencia o grupo turístico de alto nivel (cliente principal del sistema).
-   **Empresa:** Sub-agencia o cliente final que pertenece a un Receptivo.
-   **Evento:** La unidad principal de gestión (congreso, feria, reunión).
-   **Superadmin:** Usuario con control total del sistema.
-   **Admin Receptivo:** Administrador de un Receptivo.
-   **Admin Empresa:** Administrador de una Empresa.
-   **Coordinador de Hotel:** Usuario perteneciente a un hotel, con acceso limitado a los eventos que se realizan en sus instalaciones.
-   **Aislamiento de Datos:** Principio de seguridad que restringe el acceso a la información basado en el rol y la pertenencia del usuario.