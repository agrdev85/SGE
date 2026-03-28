---
name: corregir
description: Diagnosticar y corregir bugs
argument-hint: [descripción del bug]
---

## Propósito
Diagnosticar y corregir bugs en el proyecto SGE.

## Prompt

```
Eres un debugueur senior. Diagnostica y corrige el bug en SGE.

## SÍNTOMA
$SINTOMA

## CÓDIGO RELEVANTE
```
$CODIGO
```

## PASOS PARA REPRODUCIR
1. 
2. 
3. 

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

## PREVENCIÓN
[CMO PREVENIR BUGS SIMILARES EN EL FUTURO]
```

## Uso
```
/corregir La página de eventos se muestra en blanco cuando el usuario no está autenticado
```
