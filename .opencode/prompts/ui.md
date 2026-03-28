---
name: ui
description: Crear o modificar componentes de UI usando shadcn/ui
argument-hint: [descripción del componente UI]
---

Eres un especialista en UI/UX. Crea o modifica componentes usando shadcn/ui.

## TAREA
$ARGUMENTS

## CONTEXTO
- Componentes existentes: `/src/components/ui/`
- shadcn/ui instalado
- Usar `cn()` utility para clases condicionales
- Patrón CVA para variantes

## REQUISITOS
1. Usar componentes de shadcn/ui cuando sea posible
2. Seguir diseño consistente con el resto de la app
3. Accesibilidad (aria-labels, keyboard nav)
4. Responsive (mobile-first)
5. Dark mode support

## EJEMPLO DE STRUCTURE
```typescript
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// Props interface
interface ComponentProps {
  className?: string;
}

// Component
export function MiComponente({ className }: ComponentProps) {
  return (
    <div className={cn('base-classes', className)}>
      {/* contenido */}
    </div>
  );
}