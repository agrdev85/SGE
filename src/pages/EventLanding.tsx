import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { db, Event, FormField } from '@/lib/database';
import { Calendar, MapPin, Users, ArrowLeft, Beaker } from 'lucide-react';
import { toast } from 'sonner';

export default function EventLanding() {
  const { eventId } = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (eventId) {
      const ev = db.events.getById(eventId);
      if (ev) {
        setEvent(ev);
      }
    }
  }, [eventId]);

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Evento no encontrado</h2>
          <Button asChild>
            <Link to="/">Volver al inicio</Link>
          </Button>
        </div>
      </div>
    );
  }

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormValues(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate required fields
    const requiredFields = event.formFields?.filter(f => f.isRequired) || [];
    const missingFields = requiredFields.filter(f => !formValues[f.id]);

    if (missingFields.length > 0) {
      toast.error(`Por favor completa los campos requeridos: ${missingFields.map(f => f.label).join(', ')}`);
      setIsSubmitting(false);
      return;
    }

    // Simulate registration
    setTimeout(() => {
      toast.success('¡Inscripción completada exitosamente!');
      setFormValues({});
      setIsSubmitting(false);
    }, 1000);
  };

  const renderField = (field: FormField) => {
    const baseProps = {
      id: field.id,
      placeholder: field.placeholder || '',
      required: field.isRequired,
    };

    switch (field.fieldType) {
      case 'heading':
        return (
          <h3 className="text-lg font-semibold text-foreground border-b pb-2">{field.label}</h3>
        );
      case 'separator':
        return <hr className="border-border" />;
      case 'text':
      case 'email':
      case 'phone':
        return (
          <div className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label} {field.isRequired && <span className="text-destructive">*</span>}
            </Label>
            <Input
              {...baseProps}
              type={field.fieldType === 'email' ? 'email' : field.fieldType === 'phone' ? 'tel' : 'text'}
              value={formValues[field.id] || ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
            />
          </div>
        );
      case 'number':
        return (
          <div className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label} {field.isRequired && <span className="text-destructive">*</span>}
            </Label>
            <Input
              {...baseProps}
              type="number"
              value={formValues[field.id] || ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
            />
          </div>
        );
      case 'textarea':
        return (
          <div className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label} {field.isRequired && <span className="text-destructive">*</span>}
            </Label>
            <Textarea
              {...baseProps}
              value={formValues[field.id] || ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              rows={4}
            />
          </div>
        );
      case 'date':
        return (
          <div className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label} {field.isRequired && <span className="text-destructive">*</span>}
            </Label>
            <Input
              {...baseProps}
              type="date"
              value={formValues[field.id] || ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
            />
          </div>
        );
      case 'select':
        return (
          <div className="space-y-2">
            <Label>
              {field.label} {field.isRequired && <span className="text-destructive">*</span>}
            </Label>
            <Select
              value={formValues[field.id] || ''}
              onValueChange={(value) => handleFieldChange(field.id, value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar..." />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((opt) => (
                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={field.id}
              checked={formValues[field.id] || false}
              onCheckedChange={(checked) => handleFieldChange(field.id, checked)}
            />
            <Label htmlFor={field.id}>{field.label}</Label>
          </div>
        );
      case 'radio':
        return (
          <div className="space-y-2">
            <Label>
              {field.label} {field.isRequired && <span className="text-destructive">*</span>}
            </Label>
            <RadioGroup
              value={formValues[field.id] || ''}
              onValueChange={(value) => handleFieldChange(field.id, value)}
            >
              {field.options?.map((opt) => (
                <div key={opt} className="flex items-center space-x-2">
                  <RadioGroupItem value={opt} id={`${field.id}-${opt}`} />
                  <Label htmlFor={`${field.id}-${opt}`}>{opt}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );
      default:
        return null;
    }
  };

  const sortedFields = [...(event.formFields || [])].sort((a, b) => a.orderIndex - b.orderIndex);

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: event.backgroundColor || '#f0f9ff' }}
    >
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl shadow-md"
              style={{ background: `linear-gradient(135deg, ${event.primaryColor}, ${event.secondaryColor})` }}
            >
              <Beaker className="h-5 w-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl">SciEvent</span>
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link to="/login">Iniciar Sesión</Link>
            </Button>
            <Button
              asChild
              style={{ backgroundColor: event.primaryColor }}
              className="text-white hover:opacity-90"
            >
              <Link to="/register">Registrarse</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="relative pt-16">
        <div className="relative h-80 overflow-hidden">
          <img
            src={event.backgroundImageUrl || event.bannerImageUrl}
            alt={event.name}
            className="w-full h-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to top, ${event.primaryColor}dd, ${event.primaryColor}55 50%, transparent)`,
            }}
          />
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="container mx-auto">
              <Badge
                className="mb-4"
                style={{ backgroundColor: event.secondaryColor }}
              >
                {event.isActive ? 'Inscripciones Abiertas' : 'Próximamente'}
              </Badge>
              <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4 max-w-3xl">
                {event.name}
              </h1>
              <div className="flex flex-wrap gap-6 text-white/90">
                <span className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {new Date(event.startDate).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'long',
                  })} - {new Date(event.endDate).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
                <span className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {db.abstracts.getByEvent(event.id).length} trabajos recibidos
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Event Info */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle style={{ color: event.primaryColor }}>Sobre el Evento</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{event.description}</p>
                </CardContent>
              </Card>

              {/* Registration Form */}
              {event.formFields && event.formFields.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle style={{ color: event.primaryColor }}>Formulario de Inscripción</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {sortedFields.map((field) => (
                          <div
                            key={field.id}
                            className={field.width === 'full' || field.fieldType === 'heading' || field.fieldType === 'separator' ? 'md:col-span-2' : ''}
                          >
                            {renderField(field)}
                          </div>
                        ))}
                      </div>
                      <Button
                        type="submit"
                        size="lg"
                        disabled={isSubmitting}
                        style={{ backgroundColor: event.primaryColor }}
                        className="w-full text-white hover:opacity-90"
                      >
                        {isSubmitting ? 'Procesando...' : 'Completar Inscripción'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle style={{ color: event.primaryColor }}>Fechas Importantes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm text-muted-foreground">Inicio del evento</span>
                    <span className="font-medium">
                      {new Date(event.startDate).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm text-muted-foreground">Fin del evento</span>
                    <span className="font-medium">
                      {new Date(event.endDate).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card
                style={{
                  background: `linear-gradient(135deg, ${event.primaryColor}, ${event.secondaryColor})`,
                }}
              >
                <CardContent className="py-6 text-center text-white">
                  <h3 className="text-xl font-bold mb-2">¿Necesitas ayuda?</h3>
                  <p className="text-white/80 text-sm mb-4">Contáctanos si tienes alguna duda</p>
                  <Button variant="secondary" asChild>
                    <a href="mailto:info@scievent.com">Contactar</a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t bg-background/50">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>© 2024 SciEvent. Sistema de Gestión de Eventos Científicos.</p>
        </div>
      </footer>
    </div>
  );
}
