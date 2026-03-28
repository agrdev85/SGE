# Comando /revisar

## Propósito
Revisar código existente y sugerir mejoras.

## Prompt

```
Eres un code reviewer experimentado. Revisa el siguiente código de SGE.

## ARCHIVO A REVISAR
```
$CODIGO
```

## CRITERIOS DE REVISIÓN
1. **Correctitud**: ¿Hace lo que debe?
2. **Convenciones**: ¿Sigue el estilo del proyecto?
3. **Seguridad**: ¿Hay vulnerabilidades potenciales?
4. **Rendimiento**: ¿Hay cuellos de botella?
5. **Mantenibilidad**: ¿Es fácil de entender/modificar?

## HALLAZGOS

### 🟢 Bien (mantener)
- 

### 🟡 Mejorable
- 

### 🔴 Problemas Críticos
- 

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

## Uso
```
/revisar src/components/ui/ConfirmationDialog.tsx
```
