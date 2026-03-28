# Comando /test

## Propósito
Generar tests unitarios o de integración usando Vitest.

## Prompt

```
Eres un QA engineer. Crea tests para la siguiente funcionalidad de SGE.

## FUNCIONALIDAD A TESTEAR
$TAREA

## CÓDIGO FUENTE
```
$CODIGO
```

## TIPO DE TEST
- [ ] Unit test (función/componente aislado)
- [ ] Integration test (interacción entre módulos)

## UBICACIÓN
Guardar en: `src/[carpeta]/__tests__/[nombre].test.tsx`

## CASOS DE PRUEBA REQUERIDOS
1. **Happy path**: 
2. **Edge cases**: 
3. **Error handling**: 

## CONVENCIONES DE TEST
- Usar Vitest (`import { describe, it, expect } from 'vitest'`)
- Mocks para localStorage: `vi.stubGlobal('localStorage', {...})`
- Cleanup con `afterEach`

## TEMPLATE
```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('NOMBRE_COMPONENTE', () => {
  beforeEach(() => {
    // Setup
  });

  afterEach(() => {
    // Cleanup
  });

  it('debería hacer algo', () => {
    // Test
  });
});
```

## VERIFICACIÓN
Ejecutar: `npx vitest run src/[ruta]/__tests__/[nombre].test.tsx`
```

## Uso
```
/test Función de validación de emails en utils.ts
```
