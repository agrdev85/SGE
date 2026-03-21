import React, { useState } from 'react';
import { useWizard } from '@/contexts/WizardContext';
import { db } from '@/lib/database';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, AlertCircle, Globe, Building2, MapPin, Users, Bus, Calendar, Layers, Save, Rocket } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export function FinalStep() {
  const { evento, guardarPaso, state, getPasosInfo } = useWizard();
  const navigate = useNavigate();
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const pasosInfo = getPasosInfo();
  const pasosRequeridos = [1, 2, 3, 4, 5, 6, 7];
  const pasosFaltantes = pasosRequeridos.filter(p => !state.pasosCompletados.includes(p));

  const getResumen = () => {
    if (!evento?.id) return null;

    return {
      hoteles: db.eventoHoteles.getByEvento(evento.id).length,
      salones: db.eventoSalones.getByEvento(evento.id).length,
      tiposParticipacion: db.eventoTiposParticipacion.getByEvento(evento.id).length,
      rutasTransporte: db.rutasTransporte.getByEvento(evento.id).length,
      actividadesSociales: db.actividadesSociales.getByEvento(evento.id).length,
      subEventos: db.subEventos.getByEvento(evento.id).length,
      tematicas: db.nomencladoresEvento.getByEventoAndTipo(evento.id, 'TEMATICA').length,
    };
  };

  const resumen = getResumen();

  const handleGuardar = async () => {
    setIsSaving(true);
    try {
      await guardarPaso(7, {} as any);
      toast.success('Configuración guardada');
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
      await guardarPaso(7, {} as any);
      toast.success('¡Evento publicado exitosamente!');
      navigate('/events');
    } catch (error) {
      toast.error('Error al publicar');
    }
    setIsPublishing(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Resumen de Configuración</CardTitle>
          <CardDescription>
            Revise el resumen de la configuración de su evento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {evento && (
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-medium text-lg">{evento.name}</h3>
              {evento.acronym && <Badge variant="outline">{evento.acronym}</Badge>}
              <p className="text-sm text-muted-foreground mt-2">
                {evento.startDate && evento.endDate && (
                  <span>
                    <Calendar className="w-4 h-4 inline mr-1" />
                    {evento.startDate} - {evento.endDate}
                  </span>
                )}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg border">
              <div className="p-2 bg-blue-500/10 rounded">
                <Building2 className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{resumen?.hoteles || 0}</p>
                <p className="text-xs text-muted-foreground">Hoteles</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg border">
              <div className="p-2 bg-purple-500/10 rounded">
                <MapPin className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{resumen?.salones || 0}</p>
                <p className="text-xs text-muted-foreground">Salones</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg border">
              <div className="p-2 bg-green-500/10 rounded">
                <Users className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{resumen?.tiposParticipacion || 0}</p>
                <p className="text-xs text-muted-foreground">Tipos Participación</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg border">
              <div className="p-2 bg-yellow-500/10 rounded">
                <Bus className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{resumen?.rutasTransporte || 0}</p>
                <p className="text-xs text-muted-foreground">Rutas Transporte</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg border">
              <div className="p-2 bg-pink-500/10 rounded">
                <Calendar className="w-5 h-5 text-pink-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{resumen?.actividadesSociales || 0}</p>
                <p className="text-xs text-muted-foreground">Actividades</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg border">
              <div className="p-2 bg-orange-500/10 rounded">
                <Globe className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{resumen?.subEventos || 0}</p>
                <p className="text-xs text-muted-foreground">SubEventos</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg border">
              <div className="p-2 bg-teal-500/10 rounded">
                <Layers className="w-5 h-5 text-teal-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{resumen?.tematicas || 0}</p>
                <p className="text-xs text-muted-foreground">Temáticas</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estado de Pasos */}
      <Card>
        <CardHeader>
          <CardTitle>Estado de Configuración</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pasosInfo.filter(p => p.numero <= 7).map(paso => (
              <div
                key={paso.numero}
                className={`flex items-center gap-3 p-3 rounded-lg ${
                  paso.estado === 'completado' ? 'bg-green-500/10' : 'bg-muted'
                }`}
              >
                {paso.estado === 'completado' ? (
                  <Check className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-muted-foreground" />
                )}
                <span className={paso.estado === 'completado' ? '' : 'text-muted-foreground'}>
                  {paso.numero}. {paso.titulo}
                </span>
                <Badge
                  variant={paso.estado === 'completado' ? 'default' : 'secondary'}
                  className="ml-auto"
                >
                  {paso.estado === 'completado' ? 'Completado' : 'Pendiente'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alertas */}
      {pasosFaltantes.length > 0 && (
        <Card className="border-yellow-500">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3 text-yellow-700">
              <AlertCircle className="w-5 h-5 mt-0.5" />
              <div>
                <p className="font-medium">Pasos incompletos</p>
                <p className="text-sm">
                  Complete los siguientes pasos antes de publicar el evento:
                </p>
                <ul className="list-disc list-inside text-sm mt-2">
                  {pasosFaltantes.map(p => (
                    <li key={p}>{pasosInfo.find(pi => pi.numero === p)?.titulo}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Acciones */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={handleGuardar} disabled={isSaving}>
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Guardando...' : 'Guardar Progreso'}
        </Button>
        
        <Button
          onClick={handlePublicar}
          disabled={isPublishing || pasosFaltantes.length > 0}
          size="lg"
        >
          <Rocket className="w-4 h-4 mr-2" />
          {isPublishing ? 'Publicando...' : 'Publicar Evento'}
        </Button>
      </div>
    </div>
  );
}

export default FinalStep;
