# Prompts de Código Mejorado para SGE

## Principios Básicos (basados en Anthropic Context Engineering)

1. **Sé específico y da contexto claro** - El modelo funciona mejor con instrucciones precisas
2. **Establece criterios de éxito** - Define qué significa "bien hecho"
3. **Usa estructura clara** - Separa información en secciones lógicas
4. **Minimiza el contexto** - Solo incluye lo necesario
5. **Proporciona ejemplos** - Los ejemplos valen más que mil palabras

---

## /codificar

**Propósito**: Crear nuevo código siguiendo las convenciones del proyecto

```
Eres un desarrollador senior de React/TypeScript en el proyecto SGE.

## CONTEXTO
- Proyecto: Sistema de Gestión de Eventos con React, TypeScript, Vite, Tailwind, shadcn/ui
- Base de datos: localStorage con prefijo `sge_`
- Patrón de imports: @/components, @/lib, @/contexts, @/hooks
- Convenciones: camelCase variables, PascalCase componentes, kebab-case archivos

## TAREA
[DESCRIBE LA FUNCIONALIDAD A IMPLEMENTAR]

## REQUISITOS
1. Seguir las convenciones del proyecto (ver AGENTS.md)
2. Usar `db.collection.metodo()` para operaciones de BD
3. Usar `toast.success/error()` de sonner para feedback
4. Llamar `broadcastDataChange('collection')` tras modificar datos
5. Dispatch `sge-auth-refresh` tras actualizar usuario
6. Usar `useConfirmation()` para diálogos de confirmación
7. NO usar `confirm()` ni `alert()` nativos
8. NO romper funcionalidad existente

## CRITERIOS DE ÉXITO
- [ ] Compila sin errores de TypeScript
- [ ] Pasa `npm run lint`
- [ ] Sigue patrones existentes del codebase
- [ ] No introduce regresiones

## EJEMPLO DE SALIDA
```typescript
// Código bien estructurado con imports, tipos, lógica y exportación
```

После выполнения запусти `npm run build` para verificar que compila.
```

---

## /corregir

**Propósito**: Diagnosticar y corregir bugs

```
Eres un debugueur senior. Diagnostica y corrige el bug en SGE.

## SÍNTOMA
[DESCRIBE EL COMPORTAMIENTO INCORRECTO]

## CÓDIGO RELEVANTE
[INCLUYE EL ARCHIVO/LÍNEA PROBLEMÁTICA]

## PASOS PARA REPRODUCIR
1. [PASO 1]
2. [PASO 2]
3. [ERROR OBSERVADO]

## ANÁLISIS
Basado en:
- El código proporcionado
- Las convenciones de SGE (ver AGENTS.md)
- El flujo de datos actual

## HIPÓTESIS
[QUÉ CREES QUE CAUSA EL BUG]

## CORRECCIÓN
```typescript
// Código corregido con explicación
```

## VERIFICACIÓN
Después de aplicar:
1. `npx tsc --noEmit` - debe pasar
2. `npm run build` - debe compilar
3. [PASOS DE PRUEBA]

## PREVENCIÓN
[CMO PREVENIR BUGS SIMILARES EN EL FUTURO]
```

---

## /revisar

**Propósito**: Revisar código existente y sugerir mejoras

```
Eres un code reviewer experimentado. Revisa el siguiente código de SGE.

## ARCHIVO A REVISAR
```
[PEGAR CÓDIGO AQUÍ]
```

## CRITERIOS DE REVISIÓN
1. **Correctitud**: ¿Hace lo que debe?
2. **Convenciones**: ¿Sigue el estilo del proyecto?
3. **Seguridad**: ¿Hay vulnerabilidades potenciales?
4. **Rendimiento**: ¿Hay cuellos de botella?
5. **Mantenibilidad**: ¿Es fácil de entender/modificar?

## HALLAZGOS

### 🟢 Bien (mantener)
- [PUNTOS POSITIVOS]

### 🟡 Mejorable
- [SUGERENCIAS DE MEJORA]

### 🔴 Problemas Críticos
- [BUGS O VULNERABILIDADES]

## SUGERENCIAS ESPECÍFICAS
```typescript
// Código mejorado si aplica
```

## PRIORIDAD
- [ ] Crítico (arreglar inmediatamente)
- [ ] Alto (arreglar pronto)
- [ ] Medio (considerar en siguiente sprint)
- [ ] Bajo (nice-to-have)
```

---

## /migrar

**Propósito**: Migrar código a nuevos patrones o APIs

```
Eres un especialista en refactoring. Migra el código al nuevo patrón de SGE.

## CÓDIGO ACTUAL
```
[PEGAR CÓDIGO A MIGRAR]
```

## PATRÓN DESTINO
[DESCRIBE EL NUEVO PATRÓN A SEGUIR]

## EJEMPLO DE PATRÓN
```
[EJEMPLO DE CÓDIGO QUE USA EL NUEVO PATRÓN]
```

## MIGRACIÓN PASO A PASO
1. [PRIMER PASO]
2. [SEGUNDO PASO]
3. ...

## CÓDIGO MIGRADO
```typescript
// Código refactorizado
```

## VERIFICACIÓN
- [ ] Tests pasan
- [ ] Build compila
- [ ] Funcionalidad intacta
```

---

## /test

**Propósito**: Generar tests para código existente

```
Eres un QA engineer. Crea tests para la siguiente funcionalidad.

## FUNCIONALIDAD A TESTEAR
[DESCRIBE LO QUE HACE EL CÓDIGO]

## CÓDIGO FUENTE
```
[PEGAR CÓDIGO]
```

## TIPO DE TEST
- [ ] Unit test (función/componente aislado)
- [ ] Integration test (interacción entre módulos)
- [ ] E2E test (flujo completo de usuario)

## CASOS DE PRUEBA REQUERIDOS
1. **Happy path**: [ESCENARIO PRINCIPAL]
2. **Edge cases**: [CASOS LÍMITE]
3. **Error handling**: [CMO MANEJA ERRORES]

## ARCHIVO DE TEST
Ubicación: `src/[carpeta]/__tests__/[nombre].test.tsx`

```typescript
// Tests usando Vitest
```

## COBERTURA MÍNIMA
- [ ] Happy path
- [ ] Casos de error
- [ ] Edge cases
```

---

## /explicar

**Propósito**: Explicar código complejo

```
Explica el siguiente código de SGE de forma clara.

## CÓDIGO
```
[PEGAR CÓDIGO]
```

## NIVEL DE DETALLE
- [ ] Alto (línea por línea)
- [ ] Medio (conceptos principales)
- [ ] Bajo (resumen ejecutivo)

## ASPECTOS A CUBRIR
- Qué hace el código
- Por qué está implementado así
- Dependencias externas
- Posibles problemas
- Alternativas

## EXPLICACIÓN
```

---

## /arquitectura

**Propósito**: Analizar o diseñar arquitectura de features

```
Diseña la arquitectura para: [FEATURE NAME]

## REQUISITOS
1. [REQUISITO 1]
2. [REQUISITO 2]

## CONTEXTO ACTUAL
- [EXPLICAR EL SISTEMA EXISTENTE]
- [DEPENDENCIAS EXISTENTES]

## DIAGRAMA DE ARQUITECTURA
```
[ASCII DIAGRAM O DESCRIPCIÓN]
```

## COMPONENTES
1. **Componente A**: [DESCRIPCIÓN]
2. **Componente B**: [DESCRIPCIÓN]

## FLUJO DE DATOS
1. [PASO 1]
2. [PASO 2]

## CONSIDERACIONES
- [ ] Escalabilidad
- [ ] Seguridad
- [ ] Rendimiento
- [ ] Mantenibilidad

## RIESGOS Y MITIGACIONES
| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| [RISK] | [IMPACT] | [MITIGATION] |

## PRÓXIMOS PASOS
1. [ ]
2. [ ]
```

---

## /doc

**Propósito**: Generar documentación

```
Genera documentación para: [COMPONENTE/FUNCIÓN]

## TIPO DE DOC
- [ ] JSDoc (comentarios en código)
- [ ] README (documentación general)
- [ ] API docs (endpoints/interfaces)
- [ ] Architecture decision (ADR)

## AUDIENCIA
- [ ] Desarrolladores (implementación)
- [ ] Usuarios finales (cómo usar)
- [ ] DevOps (deployment)

## FORMATO
[DESCRIBE EL FORMATO DESEADO]

## DOCUMENTACIÓN
```
[GENERAR CONTENIDO]
```
```
