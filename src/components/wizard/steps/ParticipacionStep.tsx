import React, { useState, useEffect } from 'react';
import { useWizard } from '@/contexts/WizardContext';
import { db, NomTipoParticipacion, EventoTipoParticipacion } from '@/lib/database';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Save, Users, DollarSign, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

interface TipoParticipacionConfig {
  tipoId: string;
  nombre: string;
  precioCUP: number;
  precioMoneda: number;
  moneda: 'CUP' | 'USD' | 'EUR';
  capacidad: number;
  apareceEnListadoPublico: boolean;
}

export function ParticipacionStep() {
  const { evento, guardarPaso, state } = useWizard();
  const [tiposGlobales, setTiposGlobales] = useState<NomTipoParticipacion[]>([]);
  const [tiposConfigurados, setTiposConfigurados] = useState<TipoParticipacionConfig[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<TipoParticipacionConfig | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const emptyForm: TipoParticipacionConfig = {
    tipoId: '',
    nombre: '',
    precioCUP: 0,
    precioMoneda: 0,
    moneda: 'USD',
    capacidad: 0,
    apareceEnListadoPublico: true,
  };
  
  const [form, setForm] = useState<TipoParticipacionConfig>(emptyForm);

  useEffect(() => {
    loadData();
  }, [evento?.id]);

  const loadData = () => {
    setTiposGlobales(db.nomTiposParticipacion.getAll());
    
    if (evento?.id) {
      const configurados = db.eventoTiposParticipacion.getByEvento(evento.id);
      setTiposConfigurados(
        configurados.map(etp => {
          const tipo = db.nomTiposParticipacion.getById(etp.tipoParticipacionId);
          return {
            tipoId: etp.tipoParticipacionId,
            nombre: tipo?.nombre || 'Desconocido',
            precioCUP: etp.precioCUP,
            precioMoneda: etp.precioMoneda,
            moneda: etp.moneda,
            capacidad: etp.capacidad,
            apareceEnListadoPublico: etp.apareceEnListadoPublico,
          };
        })
      );
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setIsDialogOpen(true);
  };

  const openEdit = (t: TipoParticipacionConfig) => {
    setEditing(t);
    setForm(t);
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.tipoId) { toast.error('Seleccione un tipo'); return; }
    if (form.capacidad <= 0) { toast.error('La capacidad debe ser mayor a 0'); return; }

    if (editing) {
      setTiposConfigurados(prev =>
        prev.map(t => t.tipoId === editing.tipoId ? form : t)
      );
    } else {
      if (tiposConfigurados.some(t => t.tipoId === form.tipoId)) {
        toast.error('Este tipo ya está configurado');
        return;
      }
      setTiposConfigurados(prev => [...prev, form]);
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (tipoId: string) => {
    setTiposConfigurados(prev => prev.filter(t => t.tipoId !== tipoId));
  };

  const handleGuardarPaso = async () => {
    setIsSaving(true);
    try {
      if (evento?.id) {
        db.eventoTiposParticipacion.deleteByEvento(evento.id);
        tiposConfigurados.forEach(t => {
          db.eventoTiposParticipacion.create({
            eventoId: evento.id,
            tipoParticipacionId: t.tipoId,
            precioCUP: t.precioCUP,
            precioMoneda: t.precioMoneda,
            moneda: t.moneda,
            capacidad: t.capacidad,
            apareceEnListadoPublico: t.apareceEnListadoPublico,
          });
        });
      }
      await guardarPaso(3, {} as any);
      toast.success('Tipos de participación guardados');
    } catch (error) {
      toast.error('Error al guardar');
    }
    setIsSaving(false);
  };

  const disponibles = tiposGlobales.filter(t => t.activo && !tiposConfigurados.some(c => c.tipoId === t.id));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Tipos de Participación</CardTitle>
              <CardDescription>
                Configure las categorías de participantes y sus precios
              </CardDescription>
            </div>
            <Button onClick={openCreate} disabled={disponibles.length === 0}>
              <Plus className="w-4 h-4 mr-2" />
              Agregar Tipo
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {tiposConfigurados.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No hay tipos de participación configurados</p>
              <p className="text-sm">Haga clic en "Agregar Tipo" para comenzar</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-center">Cuota CUP</TableHead>
                  <TableHead className="text-center">Cuota Moneda</TableHead>
                  <TableHead className="text-center">Capacidad</TableHead>
                  <TableHead className="text-center">Público</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tiposConfigurados.map(tipo => (
                  <TableRow key={tipo.tipoId}>
                    <TableCell>
                      <Badge variant="outline">{tipo.nombre}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-medium">{tipo.precioCUP} CUP</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span>${tipo.precioMoneda} {tipo.moneda}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">
                        <Users className="w-3 h-3 mr-1" />
                        {tipo.capacidad}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {tipo.apareceEnListadoPublico ? (
                        <Eye className="w-4 h-4 text-green-500 mx-auto" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-muted-foreground mx-auto" />
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(tipo)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(tipo.tipoId)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{tiposConfigurados.length}</p>
                <p className="text-xs text-muted-foreground">Tipos Configurados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {tiposConfigurados.reduce((sum, t) => sum + t.capacidad, 0)}
                </p>
                <p className="text-xs text-muted-foreground">Capacidad Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-500/10 rounded-lg">
                <DollarSign className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {tiposConfigurados.filter(t => t.precioMoneda > 0).length}
                </p>
                <p className="text-xs text-muted-foreground">Con Costo</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar' : 'Agregar'} Tipo de Participación</DialogTitle>
            <DialogDescription>
              Configure precio y capacidad para este tipo de participante
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {!editing && (
              <div className="space-y-2">
                <Label>Tipo *</Label>
                <select
                  value={form.tipoId}
                  onChange={e => {
                    const tipo = tiposGlobales.find(t => t.id === e.target.value);
                    setForm({ ...form, tipoId: e.target.value, nombre: tipo?.nombre || '' });
                  }}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                  <option value="">Seleccionar tipo...</option>
                  {disponibles.map(t => (
                    <option key={t.id} value={t.id}>{t.nombre}</option>
                  ))}
                </select>
              </div>
            )}
            {editing && (
              <div>
                <Label>Tipo</Label>
                <p className="font-medium">{editing.nombre}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Precio CUP</Label>
                <Input
                  type="number"
                  value={form.precioCUP}
                  onChange={e => setForm({ ...form, precioCUP: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Precio Moneda ({form.moneda})</Label>
                <Input
                  type="number"
                  value={form.precioMoneda}
                  onChange={e => setForm({ ...form, precioMoneda: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Moneda</Label>
              <select
                value={form.moneda}
                onChange={e => setForm({ ...form, moneda: e.target.value as any })}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="CUP">CUP</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Capacidad *</Label>
              <Input
                type="number"
                value={form.capacidad}
                onChange={e => setForm({ ...form, capacidad: parseInt(e.target.value) || 0 })}
                placeholder="Número máximo de participantes"
              />
            </div>

            <div className="flex items-center gap-4">
              <Switch
                checked={form.apareceEnListadoPublico}
                onCheckedChange={v => setForm({ ...form, apareceEnListadoPublico: v })}
              />
              <Label>Aparece en listado público de registro</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave}>{editing ? 'Actualizar' : 'Agregar'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex justify-end">
        <Button onClick={handleGuardarPaso} disabled={isSaving} size="lg">
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Guardando...' : 'Guardar Tipos de Participación'}
        </Button>
      </div>
    </div>
  );
}

export default ParticipacionStep;
