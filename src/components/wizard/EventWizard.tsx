import React, { useEffect, useState } from 'react';
import { useWizard, WizardProvider } from '@/contexts/WizardContext';
import { WizardProgress } from './WizardProgress';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, ArrowLeft, ArrowRight, Save, Rocket } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FloatingActionBar } from '@/components/ui/floating-action-bar';
import { toast } from 'sonner';
import { db } from '@/lib/database';

import { BasicInfoStep } from './steps/BasicInfoStep';
import { HotelesStep } from './steps/HotelesStep';
import { ParticipacionStep } from './steps/ParticipacionStep';
import { TransporteStep } from './steps/TransporteStep';
import { ProgramaSocialStep } from './steps/ProgramaSocialStep';
import { NomencladoresStep } from './steps/NomencladoresStep';
import { FinalStep } from './steps/FinalStep';

function EventWizardContent() {
  const { eventoId } = useParams<{ eventoId?: string }>();
  const navigate = useNavigate();
  const { state, evento, cargarEvento, crearNuevoEvento, siguientePaso, pasoAnterior } = useWizard();
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const pasosRequeridos = [1, 2, 3, 4, 5, 6, 7];
  const pasosFaltantes = pasosRequeridos.filter(p => !state.pasosCompletados.includes(p));

  useEffect(() => {
    if (eventoId) {
      cargarEvento(eventoId);
    }
  }, [eventoId, cargarEvento]);

  const handleCrearNuevo = async () => {
    const id = await crearNuevoEvento({ name: 'Nuevo Evento' });
    navigate(`/events/wizard/${id}`);
  };

  const handleSiguiente = () => {
    if (state.pasoActual < 7) {
      siguientePaso();
    }
  };

  const handleAnterior = () => {
    if (state.pasoActual > 1) {
      pasoAnterior();
    }
  };

  const handleGuardarProgreso = async () => {
    setIsSaving(true);
    try {
      toast.success('Progreso guardado correctamente');
    } catch (error) {
      toast.error('Error al guardar');
    }
    setIsSaving(false);
  };

  const handlePublicar = async () => {
    if (pasosFaltantes.length > 0) {
      toast.error('Complete todos los pasos antes de publicar');
      return;
    }

    setIsPublishing(true);
    try {
      if (evento?.id) {
        db.macroEvents.update(evento.id, { isActive: true } as any);
      }
      toast.success('¡Evento publicado exitosamente!');
      navigate('/events');
    } catch (error) {
      toast.error('Error al publicar');
    }
    setIsPublishing(false);
  };

  if (state.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!eventoId && !evento) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/events')}
          className="mb-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a Eventos
        </Button>
        
        <Card>
          <CardHeader>
            <CardTitle>Configurar Eventos</CardTitle>
            <CardDescription>
              Usa el asistente paso a paso para configurar un nuevo evento
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            <Button onClick={handleCrearNuevo} size="lg">
              <Plus className="w-5 h-5 mr-2" />
              Crear Nuevo Evento
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Vista Previa del Wizard</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              El asistente de configuración incluye 7 pasos:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li><strong>Información Básica:</strong> Nombre, fechas, logo, colores</li>
              <li><strong>Hoteles y Alojamiento:</strong> Hoteles, salones y habitaciones</li>
              <li><strong>Tipos de Participación:</strong> Categorías y precios</li>
              <li><strong>Transporte y Logística:</strong> Rutas y vehículos</li>
              <li><strong>Programa Social:</strong> Excursiones y actividades</li>
              <li><strong>Nomencladores:</strong> Temáticas, áreas, categorías</li>
              <li><strong>Configuración Final:</strong> Publicación del evento</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      <Button
        variant="ghost"
        onClick={() => navigate('/events')}
        className="mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Volver a Eventos
      </Button>

      <Card>
        <CardContent className="pt-6">
          <WizardProgress />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contenido del Paso {state.pasoActual}</CardTitle>
          <CardDescription>
            Completa la información requerida para este paso
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-8">
          <StepContent paso={state.pasoActual} />
        </CardContent>
      </Card>

      <FloatingActionBar
        leftContent={
          <>
            <Button
              variant="outline"
              onClick={handleAnterior}
              disabled={state.pasoActual === 1 || isSaving}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Anterior
            </Button>
            <Button
              variant="outline"
              onClick={handleGuardarProgreso}
              disabled={isSaving || isPublishing}
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Guardando...' : 'Guardar'}
            </Button>
          </>
        }
        rightContent={
          state.pasoActual < 7 ? (
            <Button onClick={handleSiguiente}>
              Siguiente
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : state.pasoActual === 7 ? (
            <Button
              onClick={handlePublicar}
              disabled={isPublishing || pasosFaltantes.length > 0}
              className="bg-green-600 hover:bg-green-700"
            >
              <Rocket className="w-4 h-4 mr-2" />
              {isPublishing ? 'Publicando...' : 'Publicar Evento'}
            </Button>
          ) : null
        }
      />
    </div>
  );
}

function StepContent({ paso }: { paso: number }) {
  switch (paso) {
    case 1:
      return <BasicInfoStep />;
    case 2:
      return <HotelesStep />;
    case 3:
      return <ParticipacionStep />;
    case 4:
      return <TransporteStep />;
    case 5:
      return <ProgramaSocialStep />;
    case 6:
      return <NomencladoresStep />;
    case 7:
      return <FinalStep />;
    default:
      return <p>Paso no encontrado</p>;
  }
}

export function EventWizard() {
  return (
    <WizardProvider>
      <EventWizardContent />
    </WizardProvider>
  );
}

export default EventWizard;
