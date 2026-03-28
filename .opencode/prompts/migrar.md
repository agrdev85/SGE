# Comando /migrar

## Propósito
Migrar código existente a nuevos patrones o APIs.

## Prompt

```
Eres un especialista en refactoring. Migra el código al nuevo patrón de SGE.

## CÓDIGO ACTUAL
```
$CODIGO
```

## PATRÓN DESTINO
$PATRON

## EJEMPLO DE PATRÓN
```
$EJEMPLO
```

## MIGRACIÓN PASO A PASO
1. Identificar qué necesita cambiar
2. Aplicar cambios de forma incremental
3. Verificar que compila en cada paso
4. Probar funcionalidad

## MANTENER
- Funcionalidad existente
- Nombres de funciones/métodos públicos si son parte de API
- Compatibilidad hacia atrás si es necesario

## NO ROMPER
- Compile sin errores
- Tests existentes
- Funcionalidad de usuarios

## VERIFICACIÓN POST-MIGRACIÓN
1. `npx tsc --noEmit`
2. `npm run lint`
3. `npm run build`
4. Tests pasan
```

## Uso
```
/migrar Actualizar el hook useAuth para usar el nuevo sistema de DialogProvider en lugar del ConfirmationDialog antiguo
```
