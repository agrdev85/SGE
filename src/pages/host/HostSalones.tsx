import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { hostDb, Salon } from '@/lib/hostDatabase';
import { Plus, Edit, Trash2, ArrowLeft, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const ALL_RECURSOS = ['proyector', 'pantalla', 'wifi', 'audio', 'tv', 'microfonos', 'podio', 'traduccion', 'vista_al_mar', 'exterior'];

export default function HostSalones() {
  const navigate = useNavigate();
  const [salones, setSalones] = useState<Salon[]>([]);
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Salon | null>(null);
  const [form, setForm] = useState({
    nombre: '', capacidadTeatro: 0, capacidadEscuela: 0, capacidadBanquete: 0, capacidadCoctel: 0,
    recursos: [] as string[], ubicacion: '', color: '#3b82f6', activo: true,
  });

  useEffect(() => { loadData(); }, []);
  const loadData = () => setSalones(hostDb.salones.getAllIncludingInactive());

  const filtered = salones.filter(s => {
    const q = search.toLowerCase();
    return !q || s.nombre.toLowerCase().includes(q) || s.ubicacion.toLowerCase().includes(q);
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ nombre: '', capacidadTeatro: 0, capacidadEscuela: 0, capacidadBanquete: 0, capacidadCoctel: 0, recursos: [], ubicacion: '', color: '#3b82f6', activo: true });
    setIsDialogOpen(true);
  };

  const openEdit = (s: Salon) => {
    setEditing(s);
    setForm({ nombre: s.nombre, capacidadTeatro: s.capacidadTeatro, capacidadEscuela: s.capacidadEscuela, capacidadBanquete: s.capacidadBanquete, capacidadCoctel: s.capacidadCoctel, recursos: s.recursos, ubicacion: s.ubicacion, color: s.color || '#3b82f6', activo: s.activo });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.nombre) { toast.error('El nombre es obligatorio'); return; }
    const hotel = hostDb.hoteles.getFirst();
    try {
      if (editing) {
        hostDb.salones.update(editing.id, form);
        toast.success('Salón actualizado');
      } else {
        hostDb.salones.create({ ...form, hotelId: hotel?.id || 'h1' });
        toast.success('Salón creado');
      }
      setIsDialogOpen(false);
      loadData();
    } catch (e: any) { toast.error(e.message); }
  };

  const handleDelete = (s: Salon) => {
    const eventCount = hostDb.eventosConfirmados.getBySalon(s.id).length;
    if (eventCount > 0) { toast.error(`No se puede eliminar: tiene ${eventCount} evento(s) asociado(s)`); return; }
    if (confirm('¿Eliminar este salón?')) {
      hostDb.salones.delete(s.id);
      toast.success('Salón eliminado');
      loadData();
    }
  };

  const toggleRecurso = (recurso: string) => {
    setForm(prev => ({
      ...prev,
      recursos: prev.recursos.includes(recurso) ? prev.recursos.filter(r => r !== recurso) : [...prev.recursos, recurso],
    }));
  };

  const getOcupacion = (salonId: string) => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    return hostDb.eventosConfirmados.getBySalon(salonId).filter(e => e.fechaInicio <= monthEnd && e.fechaFin >= monthStart).length;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold">Salones</h1>
            <p className="text-muted-foreground mt-1">Gestión de espacios y capacidades</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/host')}><ArrowLeft className="h-4 w-4 mr-2" />Dashboard</Button>
            <Button variant="hero" onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Nuevo Salón</Button>
          </div>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar salones..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(salon => (
            <Card key={salon.id} className={`${!salon.activo ? 'opacity-60' : ''}`}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: salon.color }} />
                    <CardTitle className="text-lg">{salon.nombre}</CardTitle>
                  </div>
                  <Badge variant={salon.activo ? 'default' : 'secondary'}>{salon.activo ? 'Activo' : 'Inactivo'}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground">{salon.ubicacion}</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-muted-foreground">Teatro:</span> {salon.capacidadTeatro}</div>
                  <div><span className="text-muted-foreground">Escuela:</span> {salon.capacidadEscuela}</div>
                  <div><span className="text-muted-foreground">Banquete:</span> {salon.capacidadBanquete}</div>
                  <div><span className="text-muted-foreground">Coctel:</span> {salon.capacidadCoctel}</div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {salon.recursos.map(r => <Badge key={r} variant="outline" className="text-[10px]">{r}</Badge>)}
                </div>
                <div className="text-xs text-muted-foreground">Eventos este mes: {getOcupacion(salon.id)}</div>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => openEdit(salon)}><Edit className="h-3 w-3 mr-1" />Editar</Button>
                  <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(salon)}><Trash2 className="h-3 w-3" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar Salón' : 'Nuevo Salón'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 items-end">
              <div className="col-span-2 space-y-2"><Label>Nombre *</Label><Input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} /></div>
              <div className="space-y-2">
                <Label>Color</Label>
                <Input type="color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} className="h-10 cursor-pointer" />
              </div>
            </div>
            <div className="space-y-2"><Label>Ubicación</Label><Input value={form.ubicacion} onChange={e => setForm({ ...form, ubicacion: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Cap. Teatro</Label><Input type="number" value={form.capacidadTeatro} onChange={e => setForm({ ...form, capacidadTeatro: parseInt(e.target.value) || 0 })} /></div>
              <div className="space-y-2"><Label>Cap. Escuela</Label><Input type="number" value={form.capacidadEscuela} onChange={e => setForm({ ...form, capacidadEscuela: parseInt(e.target.value) || 0 })} /></div>
              <div className="space-y-2"><Label>Cap. Banquete</Label><Input type="number" value={form.capacidadBanquete} onChange={e => setForm({ ...form, capacidadBanquete: parseInt(e.target.value) || 0 })} /></div>
              <div className="space-y-2"><Label>Cap. Coctel</Label><Input type="number" value={form.capacidadCoctel} onChange={e => setForm({ ...form, capacidadCoctel: parseInt(e.target.value) || 0 })} /></div>
            </div>
            <div className="space-y-2">
              <Label>Recursos</Label>
              <div className="grid grid-cols-2 gap-2">
                {ALL_RECURSOS.map(r => (
                  <div key={r} className="flex items-center gap-2">
                    <Checkbox checked={form.recursos.includes(r)} onCheckedChange={() => toggleRecurso(r)} />
                    <span className="text-sm capitalize">{r.replace('_', ' ')}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.activo} onCheckedChange={v => setForm({ ...form, activo: v })} />
              <Label>Activo</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
            <Button variant="hero" onClick={handleSave}>{editing ? 'Actualizar' : 'Crear'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
