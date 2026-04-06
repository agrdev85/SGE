import React, { useState, useEffect } from 'react';
import { useWizard } from '@/contexts/WizardContext';
import { db, NomencladorEvento, TipoNomencladorEvento } from '@/lib/database';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Pencil, Trash2, Save, Globe, Layers, Target, Activity, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { useConfirmation } from '@/hooks/useConfirmation';

const TIPOS_NOMENCLADORES = [
  { tipo: 'TEMATICA' as TipoNomencladorEvento, label: 'Temáticas', icon: Globe },
  { tipo: 'AREA_TEMATICA' as TipoNomencladorEvento, label: 'Áreas Temáticas', icon: Layers },
  { tipo: 'CATEGORIA_SESION' as TipoNomencladorEvento, label: 'Categorías de Sesión', icon: Target },
  { tipo: 'TIPO_ACTIVIDAD' as TipoNomencladorEvento, label: 'Tipos de Actividad', icon: Activity },
];

const TIPOS_SESION = [
  { value: 'CONFERENCIA', label: 'Conferencia' },
  { value: 'SESION_ORAL', label: 'Sesión Oral' },
  { value: 'POSTER', label: 'Póster' },
  { value: 'PLENARIA', label: 'Plenaria' },
  { value: 'BREAK', label: 'Break' },
  { value: 'WORKSHOP', label: 'Workshop' },
];

interface NomencladorFormData {
  tipo: TipoNomencladorEvento;
  nombre: string;
  descripcion: string;
  duracion: number;
  color: string;
  tipoSesion: string;
  incluyeTransporte: boolean;
  incluyeComida: boolean;
  activo: boolean;
}

export function NomencladoresStep() {
  const { evento, guardarPaso, state } = useWizard();
  const { confirm, success } = useConfirmation();
  const [nomencladores, setNomencladores] = useState<NomencladorEvento[]>([]);
  const [activeTab, setActiveTab] = useState<TipoNomencladorEvento>('TEMATICA');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<NomencladorEvento | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const emptyForm: NomencladorFormData = {
    tipo: 'TEMATICA',
    nombre: '',
    descripcion: '',
    duracion: 30,
    color: '#3b82f6',
    tipoSesion: 'SESION_ORAL',
    incluyeTransporte: false,
    incluyeComida: false,
    activo: true,
  };

  const [form, setForm] = useState<NomencladorFormData>(emptyForm);

  useEffect(() => {
    loadData();
  }, [evento?.id, activeTab]);

  const loadData = () => {
    if (evento?.id) {
      setNomencladores(db.nomencladoresEvento.getByEvento(evento.id));
    }
  };

  const getByTipo = (tipo: TipoNomencladorEvento) => {
    return nomencladores.filter(n => n.tipo === tipo);
  };

  const openCreate = (tipo: TipoNomencladorEvento) => {
    setEditing(null);
    setForm({ ...emptyForm, tipo });
    setIsDialogOpen(true);
  };

  const openEdit = (n: NomencladorEvento) => {
    setEditing(n);
    setForm({
      tipo: n.tipo,
      nombre: n.nombre,
      descripcion: n.descripcion || '',
      duracion: n.duracion || 30,
      color: n.color || '#3b82f6',
      tipoSesion: n.tipoSesion || 'SESION_ORAL',
      incluyeTransporte: n.incluyeTransporte || false,
      incluyeComida: n.incluyeComida || false,
      activo: n.activo,
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.nombre) { toast.error('El nombre es obligatorio'); return; }

    try {
      const data = {
        eventoId: evento?.id || '',
        tipo: form.tipo,
        nombre: form.nombre,
        descripcion: form.descripcion || undefined,
        duracion: form.tipo === 'TEMATICA' ? form.duracion : undefined,
        color: form.tipo === 'AREA_TEMATICA' ? form.color : undefined,
        tipoSesion: form.tipo === 'CATEGORIA_SESION' ? form.tipoSesion as any : undefined,
        incluyeTransporte: form.tipo === 'TIPO_ACTIVIDAD' ? form.incluyeTransporte : undefined,
        incluyeComida: form.tipo === 'TIPO_ACTIVIDAD' ? form.incluyeComida : undefined,
        activo: form.activo,
      };

      if (editing) {
        db.nomencladoresEvento.update(editing.id, data);
        toast.success('Nomenclador actualizado');
        success({ title: '¡Guardado!', description: 'Nomenclador actualizado correctamente' });
      } else {
        db.nomencladoresEvento.create(data);
        toast.success('Nomenclador creado');
        success({ title: '¡Guardado!', description: 'Nomenclador creado correctamente' });
      }
      setIsDialogOpen(false);
      loadData();
    } catch (e: any) {
      toast.error(e.message || 'Error al guardar');
    }
  };

  const handleDelete = async (n: NomencladorEvento) => {
    await confirm({
      title: `¿Eliminar ${n.tipo}?`,
      description: `¿Está seguro de que desea eliminar "${n.nombre}"? Esta acción no se puede deshacer.`,
      variant: 'danger',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      onConfirm: async () => {
        db.nomencladoresEvento.delete(n.id);
        loadData();
      },
      successMessage: `"${n.nombre}" ha sido eliminado correctamente.`,
    });
  };

  const handleGuardarPaso = async () => {
    setIsSaving(true);
    try {
      await guardarPaso(6, {} as any);
      toast.success('Nomencladores guardados');
      success({ title: '¡Guardado!', description: 'Nomencladores guardados correctamente' });
    } catch (error) {
      toast.error('Error al guardar');
    }
    setIsSaving(false);
  };

  const getTipoSesionLabel = (value: string) => {
    return TIPOS_SESION.find(t => t.value === value)?.label || value;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Nomencladores del Evento</CardTitle>
          <CardDescription>
            Configure las temáticas, áreas, categorías de sesión y tipos de actividad
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={v => setActiveTab(v as TipoNomencladorEvento)}>
            <TabsList className="grid w-full grid-cols-4">
              {TIPOS_NOMENCLADORES.map(t => {
                const Icon = t.icon;
                const count = getByTipo(t.tipo).length;
                return (
                  <TabsTrigger key={t.tipo} value={t.tipo} className="gap-2">
                    <Icon className="w-4 h-4" />
                    {t.label}
                    <Badge variant="secondary" className="ml-1">{count}</Badge>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {TIPOS_NOMENCLADORES.map(t => {
              const items = getByTipo(t.tipo);
              return (
                <TabsContent key={t.tipo} value={t.tipo} className="space-y-4 mt-4">
                  <div className="flex justify-end">
                    <Button onClick={() => openCreate(t.tipo)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar {t.label}
                    </Button>
                  </div>

                  {items.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No hay {t.label.toLowerCase()} configuradas</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nombre</TableHead>
                          <TableHead>Descripción</TableHead>
                          {t.tipo === 'TEMATICA' && <TableHead className="text-center">Duración (min)</TableHead>}
                          {t.tipo === 'AREA_TEMATICA' && <TableHead>Color</TableHead>}
                          {t.tipo === 'CATEGORIA_SESION' && <TableHead>Tipo de Sesión</TableHead>}
                          {t.tipo === 'TIPO_ACTIVIDAD' && <TableHead>Incluye</TableHead>}
                          <TableHead>Estado</TableHead>
                          <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {items.map(item => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.nombre}</TableCell>
                            <TableCell>{item.descripcion || '-'}</TableCell>
                            {t.tipo === 'TEMATICA' && (
                              <TableCell className="text-center">{item.duracion}</TableCell>
                            )}
                            {t.tipo === 'AREA_TEMATICA' && (
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded" style={{ backgroundColor: item.color }} />
                                  {item.color}
                                </div>
                              </TableCell>
                            )}
                            {t.tipo === 'CATEGORIA_SESION' && (
                              <TableCell>{getTipoSesionLabel(item.tipoSesion || '')}</TableCell>
                            )}
                            {t.tipo === 'TIPO_ACTIVIDAD' && (
                              <TableCell>
                                <div className="flex gap-2">
                                  {item.incluyeTransporte && <Badge variant="outline">Transporte</Badge>}
                                  {item.incluyeComida && <Badge variant="outline">Comida</Badge>}
                                </div>
                              </TableCell>
                            )}
                            <TableCell>
                              <Badge variant={item.activo ? 'default' : 'secondary'}>
                                {item.activo ? 'Activo' : 'Inactivo'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button variant="ghost" size="icon" onClick={() => openEdit(item)}>
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDelete(item)}>
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </TabsContent>
              );
            })}
          </Tabs>
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? 'Editar' : 'Agregar'} {TIPOS_NOMENCLADORES.find(t => t.tipo === form.tipo)?.label}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre *</Label>
              <Input
                value={form.nombre}
                onChange={e => setForm({ ...form, nombre: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Descripción</Label>
              <Input
                value={form.descripcion}
                onChange={e => setForm({ ...form, descripcion: e.target.value })}
              />
            </div>

            {form.tipo === 'TEMATICA' && (
              <div className="space-y-2">
                <Label>Duración (minutos)</Label>
                <Input
                  type="number"
                  value={form.duracion}
                  onChange={e => setForm({ ...form, duracion: parseInt(e.target.value) || 0 })}
                />
              </div>
            )}

            {form.tipo === 'AREA_TEMATICA' && (
              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={form.color}
                    onChange={e => setForm({ ...form, color: e.target.value })}
                    className="w-14 h-10"
                  />
                  <Input
                    value={form.color}
                    onChange={e => setForm({ ...form, color: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>
            )}

            {form.tipo === 'CATEGORIA_SESION' && (
              <div className="space-y-2">
                <Label>Tipo de Sesión</Label>
                <select
                  value={form.tipoSesion}
                  onChange={e => setForm({ ...form, tipoSesion: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                  {TIPOS_SESION.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
            )}

            {form.tipo === 'TIPO_ACTIVIDAD' && (
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="incluyeTransporte"
                    checked={form.incluyeTransporte}
                    onChange={e => setForm({ ...form, incluyeTransporte: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="incluyeTransporte">Incluye Transporte</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="incluyeComida"
                    checked={form.incluyeComida}
                    onChange={e => setForm({ ...form, incluyeComida: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="incluyeComida">Incluye Comida</label>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="activo"
                checked={form.activo}
                onChange={e => setForm({ ...form, activo: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="activo">Activo</label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave}>{editing ? 'Actualizar' : 'Crear'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex justify-end">
        <Button onClick={handleGuardarPaso} disabled={isSaving} size="lg">
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Guardando...' : 'Guardar Nomencladores'}
        </Button>
      </div>
    </div>
  );
}

export default NomencladoresStep;
