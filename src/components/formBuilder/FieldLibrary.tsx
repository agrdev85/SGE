import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import {
  Type,
  AlignLeft,
  Mail,
  Phone,
  Hash,
  Calendar,
  ChevronDown,
  CheckSquare,
  Circle,
  Upload,
  Image,
  Minus,
  Heading,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FieldType } from '@/lib/database';
import { cn } from '@/lib/utils';

interface FieldConfig {
  type: FieldType;
  label: string;
  icon: React.ElementType;
  description: string;
}

const fieldTypes: FieldConfig[] = [
  { type: 'heading', label: 'Encabezado', icon: Heading, description: 'Título o sección' },
  { type: 'text', label: 'Texto corto', icon: Type, description: 'Campo de texto simple' },
  { type: 'textarea', label: 'Texto largo', icon: AlignLeft, description: 'Área de texto múltiple líneas' },
  { type: 'email', label: 'Email', icon: Mail, description: 'Campo de correo electrónico' },
  { type: 'phone', label: 'Teléfono', icon: Phone, description: 'Campo de número telefónico' },
  { type: 'number', label: 'Número', icon: Hash, description: 'Campo numérico' },
  { type: 'date', label: 'Fecha', icon: Calendar, description: 'Selector de fecha' },
  { type: 'select', label: 'Selector', icon: ChevronDown, description: 'Menú desplegable' },
  { type: 'checkbox', label: 'Checkbox', icon: CheckSquare, description: 'Casilla de verificación' },
  { type: 'radio', label: 'Radio', icon: Circle, description: 'Opciones únicas' },
  { type: 'file', label: 'Archivo', icon: Upload, description: 'Subida de archivo' },
  { type: 'image', label: 'Imagen', icon: Image, description: 'Subida de imagen' },
  { type: 'separator', label: 'Separador', icon: Minus, description: 'Separador visual' },
];

interface DraggableFieldProps {
  field: FieldConfig;
}

function DraggableField({ field }: DraggableFieldProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `library-${field.type}`,
    data: { type: field.type, isNew: true },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  const Icon = field.icon;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        "p-3 rounded-lg border bg-card cursor-grab active:cursor-grabbing transition-all",
        "hover:border-primary/50 hover:shadow-sm hover:bg-primary/5",
        isDragging && "opacity-50 ring-2 ring-primary"
      )}
    >
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium">{field.label}</p>
          <p className="text-xs text-muted-foreground truncate">{field.description}</p>
        </div>
      </div>
    </div>
  );
}

export function FieldLibrary() {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-display">Campos Disponibles</CardTitle>
        <p className="text-sm text-muted-foreground">
          Arrastra los campos al formulario
        </p>
      </CardHeader>
      <CardContent className="space-y-2 overflow-y-auto max-h-[calc(100vh-300px)]">
        {fieldTypes.map(field => (
          <DraggableField key={field.type} field={field} />
        ))}
      </CardContent>
    </Card>
  );
}

export { fieldTypes };
