# API Backend - SIGEVENT2

**Backend URL:** `http://localhost` (puerto 80, IIS)
**Frontend URL:** `http://localhost:8082`

> **Nota:** Todos los endpoints de API requieren autenticación via **Bearer Token** (OAuth 2.0), excepto los marcados como `[Público]`.

---

## Autenticación

### Login (Público)
```
POST http://localhost/api/Account/Login
Content-Type: application/x-www-form-urlencoded

grant_type=password&username=USUARIO&password=CONTRASEÑA&client_id=extApp
```

**Respuesta:**
```json
{
  "access_token": "token_jwt_aqui",
  "token_type": "bearer",
  "expires_in": 3600,
  "userName": "usuario",
  "isLocal": true,
  "refresh_token": "refresh_token_aqui"
}
```

Guardar el `access_token` y enviarlo en todas las peticiones autenticadas como header:
```
Authorization: Bearer eyJhbGciOi...
```

---

## Módulo: Aplicación

### Obtener configuraciones generales
```
GET http://localhost/api/application
Authorization: Bearer {token}
```

### Obtener recursos de localización
```
GET http://localhost/api/application/localizationresources
Authorization: Bearer {token}
```

### Obtener accesos directos del escritorio
```
GET http://localhost/api/application/shortcuts
Authorization: Bearer {token}
```

### Obtener settings de la aplicación
```
GET http://localhost/api/application/settings
Authorization: Bearer {token}
```

### Generar código de licencia (Público)
```
GET http://localhost/api/application/licenserequest
```

### Guardar licencia (Público)
```
POST http://localhost/api/application/license
Content-Type: application/json

{
  "RequestCode": "codigo",
  "EncryptedLicense": "licencia_encriptada"
}
```

### Crear setting
```
POST http://localhost/api/application
Authorization: Bearer {token}
Content-Type: application/json

{ ... }
```

### Eliminar setting
```
DELETE http://localhost/api/application/{hashId}
Authorization: Bearer {token}
```

### Accesos directos - Insertar
```
POST http://localhost/api/application/desktopshortcut
Authorization: Bearer {token}
Content-Type: application/json

{ ... }
```

### Accesos directos - Actualizar
```
PUT http://localhost/api/application/desktopshortcut
Authorization: Bearer {token}
Content-Type: application/json

{ ... }
```

### Accesos directos - Eliminar
```
DELETE http://localhost/api/application/desktopshortcut/{id}
Authorization: Bearer {token}
```

---

## Módulo: Eventos

Base path: `http://localhost/api/eventos`

### CRUD Eventos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/eventos/eventos` | Listar todos |
| `GET` | `/api/eventos/eventos/page?page=1&limit=25&sort=...&filter=...` | Paginados |
| `GET` | `/api/eventos/eventos/{hashId}` | Obtener uno |
| `POST` | `/api/eventos/eventos` | Crear |
| `PUT` | `/api/eventos/eventos/{hashId}` | Actualizar |
| `DELETE` | `/api/eventos/eventos/{hashId}` | Eliminar |

### CRUD Hoteles

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/eventos/hoteles` | Listar todos |
| `GET` | `/api/eventos/hoteles/page?page=1&limit=25` | Paginados |
| `GET` | `/api/eventos/hoteles/{hashId}` | Obtener uno |
| `POST` | `/api/eventos/hoteles` | Crear |
| `PUT` | `/api/eventos/hoteles/{hashId}` | Actualizar |
| `DELETE` | `/api/eventos/hoteles/{hashId}` | Eliminar |

### CRUD Idiomas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/eventos/idiomas` | Listar todos |
| `GET` | `/api/eventos/idiomas/page?page=1&limit=25` | Paginados |
| `GET` | `/api/eventos/idiomas/{hashId}` | Obtener uno |
| `POST` | `/api/eventos/idiomas` | Crear |
| `PUT` | `/api/eventos/idiomas/{hashId}` | Actualizar |
| `DELETE` | `/api/eventos/idiomas/{hashId}` | Eliminar |

### CRUD Monedas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/eventos/monedas` | Listar todas |
| `GET` | `/api/eventos/monedas/page?page=1&limit=25` | Paginadas |
| `GET` | `/api/eventos/monedas/{hashId}` | Obtener una |
| `POST` | `/api/eventos/monedas` | Crear |
| `PUT` | `/api/eventos/monedas/{hashId}` | Actualizar |
| `DELETE` | `/api/eventos/monedas/{hashId}` | Eliminar |

### CRUD Salones

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/eventos/salones` | Listar todos |
| `GET` | `/api/eventos/salones/page?page=1&limit=25` | Paginados |
| `GET` | `/api/eventos/salones/{hashId}` | Obtener uno |
| `POST` | `/api/eventos/salones` | Crear |
| `PUT` | `/api/eventos/salones/{hashId}` | Actualizar |
| `DELETE` | `/api/eventos/salones/{hashId}` | Eliminar |

### CRUD Sub-Eventos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/eventos/sub-eventos` | Listar todos |
| `GET` | `/api/eventos/sub-eventos/page?page=1&limit=25` | Paginados |
| `GET` | `/api/eventos/sub-eventos/{hashId}` | Obtener uno |
| `POST` | `/api/eventos/sub-eventos` | Crear |
| `PUT` | `/api/eventos/sub-eventos/{hashId}` | Actualizar |
| `DELETE` | `/api/eventos/sub-eventos/{hashId}` | Eliminar |

### CRUD Temáticas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/eventos/tematicas` | Listar todas |
| `GET` | `/api/eventos/tematicas/page?page=1&limit=25` | Paginadas |
| `GET` | `/api/eventos/tematicas/{hashId}` | Obtener una |
| `POST` | `/api/eventos/tematicas` | Crear |
| `PUT` | `/api/eventos/tematicas/{hashId}` | Actualizar |
| `DELETE` | `/api/eventos/tematicas/{hashId}` | Eliminar |

### CRUD Tipos de Habitación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/eventos/tipos-habitacion` | Listar todos |
| `GET` | `/api/eventos/tipos-habitacion/page?page=1&limit=25` | Paginados |
| `GET` | `/api/eventos/tipos-habitacion/{hashId}` | Obtener uno |
| `POST` | `/api/eventos/tipos-habitacion` | Crear |
| `PUT` | `/api/eventos/tipos-habitacion/{hashId}` | Actualizar |
| `DELETE` | `/api/eventos/tipos-habitacion/{hashId}` | Eliminar |

### CRUD Tipos de Participación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/eventos/tipos-participacion` | Listar todos |
| `GET` | `/api/eventos/tipos-participacion/page?page=1&limit=25` | Paginados |
| `GET` | `/api/eventos/tipos-participacion/{hashId}` | Obtener uno |
| `POST` | `/api/eventos/tipos-participacion` | Crear |
| `PUT` | `/api/eventos/tipos-participacion/{hashId}` | Actualizar |
| `DELETE` | `/api/eventos/tipos-participacion/{hashId}` | Eliminar |

### CRUD Tipos de Participación Globales

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/eventos/tipos-participacion-globales` | Listar todos |
| `GET` | `/api/eventos/tipos-participacion-globales/page?page=1&limit=25` | Paginados |
| `GET` | `/api/eventos/tipos-participacion-globales/{hashId}` | Obtener uno |
| `POST` | `/api/eventos/tipos-participacion-globales` | Crear |
| `PUT` | `/api/eventos/tipos-participacion-globales/{hashId}` | Actualizar |
| `DELETE` | `/api/eventos/tipos-participacion-globales/{hashId}` | Eliminar |

### CRUD Tipos de Sub-Evento

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/eventos/tipos-sub-evento` | Listar todos |
| `GET` | `/api/eventos/tipos-sub-evento/page?page=1&limit=25` | Paginados |
| `GET` | `/api/eventos/tipos-sub-evento/{hashId}` | Obtener uno |
| `POST` | `/api/eventos/tipos-sub-evento` | Crear |
| `PUT` | `/api/eventos/tipos-sub-evento/{hashId}` | Actualizar |
| `DELETE` | `/api/eventos/tipos-sub-evento/{hashId}` | Eliminar |

### CRUD Tipos de Vehículo

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/eventos/tipos-vehiculo` | Listar todos |
| `GET` | `/api/eventos/tipos-vehiculo/page?page=1&limit=25` | Paginados |
| `GET` | `/api/eventos/tipos-vehiculo/{hashId}` | Obtener uno |
| `POST` | `/api/eventos/tipos-vehiculo` | Crear |
| `PUT` | `/api/eventos/tipos-vehiculo/{hashId}` | Actualizar |
| `DELETE` | `/api/eventos/tipos-vehiculo/{hashId}` | Eliminar |

---

## Módulo: Seguridad

Base path: `http://localhost/api/security`

### CRUD Usuarios

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/security/users` | Listar todos |
| `GET` | `/api/security/users/{hashId}` | Obtener uno |
| `POST` | `/api/security/users` | Crear |
| `PUT` | `/api/security/users/{hashId}` | Actualizar |
| `DELETE` | `/api/security/users/{hashId}` | Eliminar |

### Cambiar contraseña
```
POST http://localhost/api/security/users/changepassword
Authorization: Bearer {token}
Content-Type: application/json

{
  "oldPassword": "actual",
  "newPassword": "nueva"
}
```

### Completar registro
```
POST http://localhost/api/security/users/completeregistration
Authorization: Bearer {token}
Content-Type: application/json

{ ... }
```

### CRUD Roles

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/security/roles` | Listar todos |
| `GET` | `/api/security/roles/{hashId}` | Obtener uno |
| `POST` | `/api/security/roles` | Crear |
| `PUT` | `/api/security/roles/{hashId}` | Actualizar |
| `DELETE` | `/api/security/roles/{hashId}` | Eliminar |

### Agregar permisos a un rol
```
POST http://localhost/api/security/roles/{hashId}/permissions
Authorization: Bearer {token}
Content-Type: application/json

{ ... }
```

### CRUD Recursos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/security/resources` | Listar todos |
| `GET` | `/api/security/resources/{hashId}` | Obtener uno |
| `POST` | `/api/security/resources` | Crear |
| `PUT` | `/api/security/resources/{hashId}` | Actualizar |
| `DELETE` | `/api/security/resources/{hashId}` | Eliminar |

### Árbol de recursos
```
GET http://localhost/api/security/resources/resourcetree
Authorization: Bearer {token}
```

### Agregar recurso a grupo
```
POST http://localhost/api/security/resources/resourcetree
Authorization: Bearer {token}
Content-Type: application/json

{ ... }
```

### Eliminar recurso de grupo
```
DELETE http://localhost/api/security/resources/resourcetree/{id}
Authorization: Bearer {token}
```

### CRUD Grupos de Recursos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/security/resources/resourcegroups` | Listar todos |
| `GET` | `/api/security/resources/resourcegroups/list` | Lista plana |
| `GET` | `/api/security/resources/resourcegroups/byrole/{roleId}` | Por rol |
| `POST` | `/api/security/resources/resourcegroups` | Crear |
| `PUT` | `/api/security/resources/resourcegroups/{id}` | Actualizar |
| `DELETE` | `/api/security/resources/resourcegroups/{id}` | Eliminar |

### Recursos de Localización

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/security/resources/localizationresources` | Listar |
| `GET` | `/api/security/resources/localizationresources/find?search=texto` | Buscar |
| `POST` | `/api/security/resources/localizationresources` | Crear |
| `PUT` | `/api/security/resources/localizationresources/{id}` | Actualizar |
| `DELETE` | `/api/security/resources/localizationresources/{id}` | Eliminar |
| `GET` | `/api/security/resources/localizationresources/export` | Exportar (XML) |
| `POST` | `/api/security/resources/localizationresources/import` | Importar (archivo) |

---

## Módulo: Configuración

Base path: `http://localhost/api/configuration`

### CRUD Settings

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/configuration/settings` | Listar todos |
| `GET` | `/api/configuration/settings/{hashId}` | Obtener uno |
| `POST` | `/api/configuration/settings` | Guardar todos |
| `PUT` | `/api/configuration/settings/{hashId}` | Actualizar |

### CRUD Idiomas (Configuración)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/configuration/languages` | Listar todos |
| `GET` | `/api/configuration/languages/{hashId}` | Obtener uno |
| `POST` | `/api/configuration/languages` | Crear |
| `PUT` | `/api/configuration/languages/{hashId}` | Actualizar |
| `DELETE` | `/api/configuration/languages/{hashId}` | Eliminar |
| `GET` | `/api/configuration/languages/cultures` | Listar culturas |

### CRUD Cuentas de Email

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/configuration/emails` | Listar cuentas |
| `POST` | `/api/configuration/emails` | Crear cuenta |
| `PUT` | `/api/configuration/emails/{hashId}` | Actualizar |
| `DELETE` | `/api/configuration/emails/{hashId}` | Eliminar |

### Plantillas de Email

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/configuration/emails/templates` | Listar plantillas |
| `POST` | `/api/configuration/emails/templates` | Crear |
| `PUT` | `/api/configuration/emails/templates/{hashId}` | Actualizar |
| `DELETE` | `/api/configuration/emails/templates/{hashId}` | Eliminar |

### Otros Email
```
GET http://localhost/api/configuration/emails/protocols
GET http://localhost/api/configuration/emails/queued
```

---

## Módulo: Sistema

Base path: `http://localhost/api/system`

### Tareas Programadas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/system/scheduledtasks` | Listar |
| `POST` | `/api/system/scheduledtasks` | Crear |
| `PUT` | `/api/system/scheduledtasks/{hashId}` | Actualizar |
| `DELETE` | `/api/system/scheduledtasks/{hashId}` | Eliminar |

### Logs de Base de Datos
```
GET http://localhost/api/system/dblogs?page=1&limit=25
DELETE http://localhost/api/system/dblogs
```

### Logs del Sistema
```
GET http://localhost/api/system/logs?page=1&limit=25
DELETE http://localhost/api/system/logs
GET http://localhost/api/system/logs/loglevels
```

---

## Reportes

```
GET http://localhost/api/reportes/participantes?parametro=valor
GET http://localhost/api/reportes/talleres?parametro=valor
GET http://localhost/api/reportes/talleres_reacciones?parametro=valor
```

---

## Documentación / Swagger

```
GET http://localhost/api/documentation
GET http://localhost/api/documentation/openapi.json
```

---

## Menú del Usuario (MVC)
```
POST http://localhost/Home/GetMenu
Authorization: Bearer {token}
```

---

## Instalador (MVC - Público)

```
GET  http://localhost/Installer/Install/Index
POST http://localhost/Installer/Install/Index
GET  http://localhost/Installer/Install/ReinstallLocalizationResources
GET  http://localhost/Installer/Install/ReinstallResourceGroup
```

---

## Ejemplo de uso desde Frontend (localhost:8082)

```javascript
// 1. Login
const loginResponse = await fetch('http://localhost/api/Account/Login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: 'grant_type=password&username=admin&password=123&client_id=extApp'
});
const { access_token } = await loginResponse.json();

// 2. Petición autenticada
const eventos = await fetch('http://localhost/api/eventos/eventos', {
  headers: { 'Authorization': `Bearer ${access_token}` }
});
const data = await eventos.json();
```

> **IMPORTANTE:** Si el backend está en otro puerto (no 80) o en otro dominio, puede haber problemas de CORS. El backend ya tiene CORS habilitado para todos los orígenes, así que funcionará sin problemas desde `localhost:8082`.
