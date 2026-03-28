---
name: explicar
description: Explicar código complejo de forma clara
argument-hint: [código o archivo a explicar]
---

## Propósito
Explicar código complejo de forma clara.

## Prompt

```
Explica el siguiente código de SGE de forma clara y concisa.

## CÓDIGO
```
$CODIGO
```

## ASPECTOS A CUBRIR
- Qué hace el código (resumen en 1-2 oraciones)
- Cómo funciona (flujo principal)
- Dependencias externas
- Posibles problemas o limitaciones
- Contexto (por qué está implementado así)

## NIVEL DE DETALLE
- Resumen ejecutivo (para stakeholders)
- Conceptos principales (para otros devs)
- Línea por línea (para onboarding)

## FORMATO
Usa:
- Encabezados ## para secciones
- Listas para puntos clave
- Código con labels para referencias
- Ejemplos si es útil

## EXPLICACIÓN
```

## OPCIONAL: SUGERENCIAS
Si hay formas de mejorar o simplificar, inclúyelas al final bajo "## Sugerencias de mejora"
```

## Uso
```
/explicar src/hooks/useWallpaperConfig.tsx
```
