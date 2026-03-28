# AGENTS.md - SGE (Sistema de Gestión de Eventos)

## Project Overview

SGE is a comprehensive event management platform built with React, TypeScript, Vite, and shadcn/ui. It manages conferences, abstracts, users, hotels, transportation, and CMS content.

## Build Commands

```bash
# Development
npm run dev              # Start dev server on port 8082
npm run build            # Production build
npm run build:dev        # Development build

# Testing
npm run test             # Run all tests (vitest)
npm run test:watch       # Run tests in watch mode

# Code Quality
npm run lint             # ESLint
npx tsc --noEmit        # TypeScript check
```

## Architecture

### Directory Structure
```
src/
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── layout/          # Layout components
│   ├── wizard/          # Event creation wizard
│   └── ...
├── contexts/            # React contexts (AuthContext, EventContext)
├── hooks/               # Custom hooks
├── lib/                 # Core libraries (database.ts, utils.ts)
├── pages/               # Page components
└── types/               # TypeScript types
```

### Database Pattern (localStorage)
- `src/lib/database.ts` - Central database using localStorage with prefix `sge_`
- Collections: users, macroEvents, events, eventSessions, nomReceptivos, nomEmpresas, nomHoteles, salones, abstracts, etc.
- CRUD operations: `.getAll()`, `.getById(id)`, `.create(data)`, `.update(id, data)`, `.delete(id)`
- Broadcast changes: `broadcastDataChange(collection)` dispatches `sge-data-change` event

### Authentication
- `AuthContext` provides user state, roles, and auth methods
- Token stored in localStorage: `auth_token`
- Roles: USER, REVIEWER, COMMITTEE, SUPERADMIN, ADMIN_RECEPTIVO, ADMIN_EMPRESA, COORDINADOR_HOTEL, LECTOR_RECEPTIVO, LECTOR_EMPRESA
- Refresh user state: dispatch `sge-auth-refresh` event

### Dialog System
- `DialogProvider` wraps the app for confirmation dialogs
- Use `useConfirmation()` hook to get `confirm()` and `success()` functions
- `ConfirmationDialog.show()` - Promise-based confirmation (returns boolean)
- `SuccessDialog.show()` - Auto-closing success message (autoClose: 2000ms default)

## Code Style Guidelines

### Imports
```typescript
// Order: React, external libs, internal imports, types
import React from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { db, User } from '@/lib/database';
import { cn } from '@/lib/utils';

// Type imports
import type { SomeType } from '@/types';
```

### Naming Conventions
- **Components**: PascalCase (`EventWizard`, `NomencladorTable`)
- **Hooks**: camelCase with `use` prefix (`useAuth`, `useWallpaperConfig`)
- **Types/Interfaces**: PascalCase (`UserRole`, `MacroEvent`)
- **Variables/Functions**: camelCase (`handleSave`, `isLoading`)
- **Constants**: SCREAMING_SNAKE_CASE for config values
- **Files**: kebab-case (`event-wizard.tsx`, `use-auth.tsx`)

### React Patterns
```typescript
// Default exports for pages
export default function Events() { ... }

// Named exports for reusable components
export function NomencladorTable({ items, columns, onEdit, onDelete }: Props) { ... }

// Function components use React.FC (deprecated but accepted here)
const SuperAdminPanel: React.FC = () => { ... }

// Use hook early, avoid conditional calls
export default function Page() {
  const { user } = useAuth();  // Always at top level
  if (!user) return <div>Loading...</div>;
  // ...
}
```

### TypeScript
```typescript
// Interface for component props
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

// Use explicit types, avoid `any`
const [items, setItems] = useState<Item[]>([]);

// Optional chaining and nullish coalescing
const name = user?.name ?? 'Anonymous';

// Type guards when needed
if ('id' in item) { ... }
```

### CSS & Styling
- Uses Tailwind CSS with shadcn/ui
- Use `cn()` utility for conditional classes: `cn('base-class', condition && 'conditional-class')`
- Component variants via CVA (class-variance-authority)
- Avoid inline styles except for dynamic values

### Error Handling
```typescript
// Try-catch with toast notifications
try {
  await db.users.update(id, data);
  toast.success('Guardado correctamente');
} catch (error) {
  toast.error(error instanceof Error ? error.message : 'Error al guardar');
}

// Async handlers
const handleSubmit = async () => {
  try {
    // async operations
  } finally {
    setIsLoading(false);  // Always clean up loading state
  }
};
```

### State Management
- Prefer React state (`useState`) for local state
- Context for global state (auth, events, wallpapers)
- localStorage for persistence (via database.ts)
- Avoid prop drilling - use context or lift state appropriately

## Common Patterns

### Role-Based Rendering
```typescript
const { isSuperAdmin, isAdmin, isAdminReceptivo } = useAuth();
if (isSuperAdmin || isAdmin) { /* show admin features */ }
```

### CRUD with Confirmation
```typescript
const { confirm, success } = useConfirmation();

const handleDelete = async (item) => {
  const confirmed = await confirm({
    title: `¿Eliminar ${item.name}?`,
    description: 'Esta acción no se puede deshacer.',
    variant: 'danger',
    confirmText: 'Eliminar',
  });
  
  if (confirmed) {
    db.items.delete(item.id);
    await success({
      title: '¡Eliminado!',
      autoClose: 2000,
    });
  }
};
```

### Data Loading
```typescript
useEffect(() => {
  const data = db.collection.getAll();
  setState(data);
  
  const handleChange = () => loadData();
  window.addEventListener('sge-data-change', handleChange);
  return () => window.removeEventListener('sge-data-change', handleChange);
}, []);
```

## Testing

Tests use Vitest. Test files should be next to their source files:
```
src/hooks/useAuth.tsx
src/hooks/__tests__/useAuth.test.tsx
```

Run a single test:
```bash
npx vitest run src/hooks/__tests__/useAuth.test.tsx
```

## Notes for AI Agents

1. **DO NOT break existing functionality** - Always verify changes compile and work
2. **Use the Dialog system** - Don't use native `confirm()` or `alert()`
3. **Database changes broadcast** - When modifying collections, call `broadcastDataChange('collection')`
4. **Auth refresh** - After user updates, dispatch `sge-auth-refresh` event
5. **TypeScript strictness** - `noImplicitAny: false`, `strictNullChecks: false` - partial types acceptable
6. **Imports** - Always use path aliases (`@/components/...`, `@/lib/...`)
