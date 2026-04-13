import React, { useState } from 'react';
import { db, NomencladorEvento } from '@/lib/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, X, Trash2, Edit, Globe, Clock, Save, Layers } from 'lucide-react';
import { useConfirmation } from '@/hooks/useConfirmation';

interface ThematicsManagerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventoId: string;
  onSave: () => void;
}

interface TematicaTemp {
  id: string;
  nombre: string;
  descripcion: string;
  duracion: number;
}

export function ThematicsManagerModal({ open, onOpenChange, eventoId, onSave }: ThematicsManagerModalProps) {
  const { success } = useConfirmation();
  const [tematicasExistentes, setTematicasExistentes] = useState<NomencladorEvento[]>([]);
  const [bufferNuevas, setBufferNuevas] = useState<TematicaTemp[]>([]);
  const [nuevaTematica, setNuevaTematica] = useState({ nombre: '', descripcion: '', duracion: 30 });

  React.useEffect(() => {
    if (open && eventoId) {
      const tematicas = db.nomencladoresEvento.getByEventoAndTipo(eventoId, 'TEMATICA');
      setTematicasExistentes(tematicas);
      setBufferNuevas([]);
    }
  }, [open, eventoId]);

  const handleAgregarALista = () => {
    if (!nuevaTematica.nombre.trim()) return;
    
    const existeEnBD = tematicasExistentes.some(
      t => t.nombre.toLowerCase() === nuevaTematica.nombre.toLowerCase()
    );
    if (existeEnBD) {
      success({ title: 'Atención', description: 'Esta temática ya existe en el evento' });
      return;
    }

    const existeEnBuffer = bufferNuevas.some(
      t => t.nombre.toLowerCase() === nuevaTematica.nombre.toLowerCase()
    );
    if (existeEnBuffer) {
      success({ title: 'Atención', description: 'Esta temática ya está en la lista temporal' });
      return;
    }

    setBufferNuevas(prev => [...prev, {
      id: `temp_${Date.now()}`,
      nombre: nuevaTematica.nombre.trim(),
      descripcion: nuevaTematica.descripcion.trim(),
      duracion: nuevaTematica.duracion,
    }]);
    setNuevaTematica({ nombre: '', descripcion: '', duracion: 30 });
  };

  const handleEliminarBuffer = (id: string) => {
    setBufferNuevas(prev => prev.filter(t => t.id !== id));
  };

  const handleEliminarExistente = async (tematica: NomencladorEvento) => {
    db.nomencladoresEvento.delete(tematica.id);
    setTematicasExistentes(prev => prev.filter(t => t.id !== tematica.id));
    success({ title: '¡Eliminada!', description: `Temática "${tematica.nombre}" eliminada` });
  };

  const handleGuardarTodas = async () => {
    try {
      for (const temp of bufferNuevas) {
        db.nomencladoresEvento.create({
          eventoId,
          tipo: 'TEMATICA',
          nombre: temp.nombre,
          descripcion: temp.descripcion || undefined,
          duracion: temp.duracion,
          activo: true,
        });
      }
      onSave();
      success({ title: '¡Guardadas!', description: `${bufferNuevas.length} temáticas guardadas correctamente` });
      onOpenChange(false);
    } catch (error) {
      console.error('Error guardando temáticas:', error);
    }
  };

  const handleCerrar = () => {
    setBufferNuevas([]);
    setNuevaTematica({ nombre: '', descripcion: '', duracion: 30 });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleCerrar}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Layers className="w-5 h-5" />
            Gestionar Temáticas
          </DialogTitle>
          <DialogDescription>
            Agregue múltiples temáticas de forma rápida. Las nuevas se guardarán cuando haga clic en "Guardar Todas".
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4 min-h-[300px]">
            <Card className="flex flex-col">
              <div className="p-4 border-b">
                <h3 className="font-semibold flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Temáticas Existentes
                  <Badge variant="secondary">{tematicasExistentes.length}</Badge>
                </h3>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-4 space-y-2">
                  {tematicasExistentes.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No hay temáticas configuradas
                    </p>
                  ) : (
                    tematicasExistentes.map(t => (
                      <div key={t.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div>
                          <p className="font-medium">{t.nombre}</p>
                          {t.descripcion && (
                            <p className="text-xs text-muted-foreground">{t.descripcion}</p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              <Clock className="w-3 h-3 mr-1" />
                              {t.duracion || 30} min
                            </Badge>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEliminarExistente(t)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </Card>

            <Card className="flex flex-col">
              <div className="p-4 border-b bg-green-50 dark:bg-green-950/20">
                <h3 className="font-semibold flex items-center gap-2 text-green-700 dark:text-green-400">
                  <Plus className="w-4 h-4" />
                  Nuevas (Pendientes de Guardar)
                  <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                    {bufferNuevas.length}
                  </Badge>
                </h3>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-4 space-y-2">
                  {bufferNuevas.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Use el formulario inferior para agregar temáticas
                    </p>
                  ) : (
                    bufferNuevas.map(t => (
                      <div key={t.id} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
                        <div>
                          <p className="font-medium text-green-700 dark:text-green-400">{t.nombre}</p>
                          {t.descripcion && (
                            <p className="text-xs text-green-600 dark:text-green-500">{t.descripcion}</p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs border-green-300 text-green-700 dark:border-green-700 dark:text-green-400">
                              <Clock className="w-3 h-3 mr-1" />
                              {t.duracion} min
                            </Badge>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEliminarBuffer(t.id)}
                          className="text-green-600 hover:text-green-700 hover:bg-green-100 dark:hover:bg-green-900"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </Card>
          </div>

          <Card className="p-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Agregar Nueva Temática
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Nombre *</Label>
                <Input
                  value={nuevaTematica.nombre}
                  onChange={e => setNuevaTematica(prev => ({ ...prev, nombre: e.target.value }))}
                  placeholder="Ej: Biotecnología Molecular"
                />
              </div>
              <div className="space-y-2">
                <Label>Descripción</Label>
                <Input
                  value={nuevaTematica.descripcion}
                  onChange={e => setNuevaTematica(prev => ({ ...prev, descripcion: e.target.value }))}
                  placeholder="Descripción breve"
                />
              </div>
              <div className="space-y-2">
                <Label>Duración (minutos)</Label>
                <Input
                  type="number"
                  value={nuevaTematica.duracion}
                  onChange={e => setNuevaTematica(prev => ({ ...prev, duracion: parseInt(e.target.value) || 30 }))}
                  min={5}
                  max={180}
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button onClick={handleAgregarALista} disabled={!nuevaTematica.nombre.trim()}>
                <Plus className="w-4 h-4 mr-2" />
                Agregar a la Lista
              </Button>
            </div>
          </Card>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleCerrar}>
            Cancelar
          </Button>
          <Button onClick={handleGuardarTodas} disabled={bufferNuevas.length === 0}>
            <Save className="w-4 h-4 mr-2" />
            Guardar Todas ({bufferNuevas.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import { Card } from '@/components/ui/card';

export default ThematicsManagerModal;
