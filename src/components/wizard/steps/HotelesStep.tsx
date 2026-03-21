import React, { useState, useEffect } from 'react';
import { useWizard } from '@/contexts/WizardContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { db, NomHotel, NomTipoHabitacion, Salon, EventoHotel } from '@/lib/database';
import { Search, Building2, MapPin, Phone, Check, X, Plus, ChevronRight, Save, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface HabitacionPrecio {
  tipoHabitacionId: string;
  tipoHabitacionNombre: string;
  precioCUP: number;
  precioMoneda: number;
  moneda: string;
  cupo: number;
}

interface HotelSeleccionado {
  eventoHotelId: string;
  hotelId: string;
  hotel: NomHotel;
}

export function HotelesStep() {
  const { evento, guardarPaso, state } = useWizard();
  const { canManageNomencladores } = useAuth();
  const [activeTab, setActiveTab] = useState('hoteles');
  
  const [hotelesDisponibles, setHotelesDisponibles] = useState<NomHotel[]>([]);
  const [hotelesSeleccionados, setHotelesSeleccionados] = useState<HotelSeleccionado[]>([]);
  const [salonesDisponibles, setSalonesDisponibles] = useState<Salon[]>([]);
  const [salonesSeleccionados, setSalonesSeleccionados] = useState<string[]>([]);
  const [selectedHotelId, setSelectedHotelId] = useState<string>('');
  const [tiposHabitacion, setTiposHabitacion] = useState<NomTipoHabitacion[]>([]);
  const [habitacionesPorHotel, setHabitacionesPorHotel] = useState<Record<string, HabitacionPrecio[]>>({});
  
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ ciudad: '', estrellas: '' });
  const [isSaving, setIsSaving] = useState(false);

  const [isHotelDialogOpen, setIsHotelDialogOpen] = useState(false);
  const [isSalonDialogOpen, setIsSalonDialogOpen] = useState(false);
  const [isTipoHabitacionDialogOpen, setIsTipoHabitacionDialogOpen] = useState(false);

  const [hotelForm, setHotelForm] = useState({
    nombre: '', cadenaHotelera: '', categoriaEstrellas: 3, ciudad: '', direccion: '', telefono: '', email: '',
  });

  const [salonForm, setSalonForm] = useState({
    codigo: '', nombre: '', ubicacion: '', capacidadMaxima: 100,
  });

  const [tipoHabitacionForm, setTipoHabitacionForm] = useState({
    nombre: '', descripcion: '', capacidadMaxPersonas: 2,
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedHotelId) {
      const salonesHotel = db.salones.getActivosByHotel(selectedHotelId);
      setSalonesDisponibles(salonesHotel);
    }
  }, [selectedHotelId]);

  const loadData = () => {
    const hoteles = db.nomHoteles.getAll().filter(h => h.activo);
    setHotelesDisponibles(hoteles);
    setTiposHabitacion(db.nomTiposHabitacion.getAll());

    const eventosHoteles = db.eventoHoteles.getByEvento(evento?.id || '');
    const hotelSeleccionadosData: HotelSeleccionado[] = eventosHoteles.map(eh => {
      const hotel = hoteles.find(h => h.id === eh.hotelId);
      return {
        eventoHotelId: eh.id,
        hotelId: eh.hotelId,
        hotel: hotel!,
      };
    }).filter(h => h.hotel);
    setHotelesSeleccionados(hotelSeleccionadosData);

    const eventoSalones = db.eventoSalones.getByEvento(evento?.id || '');
    setSalonesSeleccionados(eventoSalones.map(es => es.salonId));

    const habitacionesExistentes = db.eventoHotelHabitaciones.getByEvento(evento?.id || '');
    const habitaciones: Record<string, HabitacionPrecio[]> = {};
    
    eventosHoteles.forEach(eh => {
      const tiposDelHotel = db.hotelTiposHabitacion.getByHotel(eh.hotelId);
      const habitacionesDelEventoHotel = habitacionesExistentes.filter(h => h.eventoHotelId === eh.id);
      
      habitaciones[eh.hotelId] = tiposDelHotel.map(th => {
        const existente = habitacionesDelEventoHotel.find(he => he.tipoHabitacionId === th.tipoHabitacionId);
        const tipoHabitacion = db.nomTiposHabitacion.getAll().find(t => t.id === th.tipoHabitacionId);
        return {
          tipoHabitacionId: th.tipoHabitacionId,
          tipoHabitacionNombre: tipoHabitacion?.nombre || 'Sin nombre',
          precioCUP: existente?.precioCUP || 0,
          precioMoneda: existente?.precioMoneda || 0,
          moneda: existente?.moneda || 'USD',
          cupo: existente?.cupo || 0,
        };
      });
    });
    setHabitacionesPorHotel(habitaciones);

    if (hotelSeleccionadosData.length > 0 && !selectedHotelId) {
      setSelectedHotelId(hotelSeleccionadosData[0].hotelId);
    }
  };

  const handleCrearHotel = () => {
    if (!hotelForm.nombre) {
      toast.error('El nombre del hotel es obligatorio');
      return;
    }
    if (!hotelForm.ciudad) {
      toast.error('La ciudad es obligatoria');
      return;
    }
    try {
      const nuevoHotel = db.nomHoteles.create({
        ...hotelForm,
        activo: true,
      });
      toast.success('Hotel creado exitosamente');
      setIsHotelDialogOpen(false);
      setHotelForm({ nombre: '', cadenaHotelera: '', categoriaEstrellas: 3, ciudad: '', direccion: '', telefono: '', email: '' });
      loadData();
    } catch (error) {
      toast.error('Error al crear el hotel');
    }
  };

  const handleCrearSalon = () => {
    if (!salonForm.codigo || !salonForm.nombre) {
      toast.error('El código y nombre del salón son obligatorios');
      return;
    }
    if (!selectedHotelId) {
      toast.error('Seleccione un hotel primero');
      return;
    }
    try {
      db.salones.create({
        hotelId: selectedHotelId,
        codigo: salonForm.codigo,
        nombre: salonForm.nombre,
        ubicacion: salonForm.ubicacion,
        capacidadMaxima: salonForm.capacidadMaxima,
        estado: 'ACTIVO',
        imagenes: [],
      });
      toast.success('Salón creado exitosamente');
      setIsSalonDialogOpen(false);
      setSalonForm({ codigo: '', nombre: '', ubicacion: '', capacidadMaxima: 100 });
      loadData();
      const salonesHotel = db.salones.getActivosByHotel(selectedHotelId);
      setSalonesDisponibles(salonesHotel);
    } catch (error) {
      toast.error('Error al crear el salón');
    }
  };

  const handleCrearTipoHabitacion = () => {
    if (!tipoHabitacionForm.nombre) {
      toast.error('El nombre del tipo de habitación es obligatorio');
      return;
    }
    if (!selectedHotelId) {
      toast.error('Seleccione un hotel primero');
      return;
    }
    try {
      const nuevoTipo = db.nomTiposHabitacion.create({
        ...tipoHabitacionForm,
        activo: true,
      });
      db.hotelTiposHabitacion.create({
        hotelId: selectedHotelId,
        tipoHabitacionId: nuevoTipo.id,
        precioConDesayuno: 0,
        precioConTodoIncluido: 0,
        activo: true,
      });
      toast.success('Tipo de habitación creado y asociado al hotel');
      setIsTipoHabitacionDialogOpen(false);
      setTipoHabitacionForm({ nombre: '', descripcion: '', capacidadMaxPersonas: 2 });
      loadData();
      setTiposHabitacion(db.nomTiposHabitacion.getAll());
    } catch (error) {
      toast.error('Error al crear el tipo de habitación');
    }
  };

  const toggleHotel = (hotelId: string) => {
    const hotel = hotelesDisponibles.find(h => h.id === hotelId);
    if (!hotel) return;

    const yaSeleccionado = hotelesSeleccionados.find(h => h.hotelId === hotelId);
    
    if (yaSeleccionado) {
      setHotelesSeleccionados(prev => prev.filter(h => h.hotelId !== hotelId));
      setHabitacionesPorHotel(prev => {
        const newHab = { ...prev };
        delete newHab[hotelId];
        return newHab;
      });
    } else {
      const tiposDelHotel = db.hotelTiposHabitacion.getByHotel(hotelId);
      const nuevoHotel: HotelSeleccionado = {
        eventoHotelId: '',
        hotelId,
        hotel,
      };
      
      setHotelesSeleccionados(prev => [...prev, nuevoHotel]);
      
      setHabitacionesPorHotel(prev => ({
        ...prev,
        [hotelId]: tiposDelHotel.map(th => {
          const tipoHabitacion = db.nomTiposHabitacion.getAll().find(t => t.id === th.tipoHabitacionId);
          return {
            tipoHabitacionId: th.tipoHabitacionId,
            tipoHabitacionNombre: tipoHabitacion?.nombre || 'Sin nombre',
            precioCUP: th.precioConDesayuno || 0,
            precioMoneda: th.precioConTodoIncluido || 0,
            moneda: 'USD',
            cupo: 0,
          };
        }),
      }));
    }
  };

  const toggleSalon = (salonId: string) => {
    setSalonesSeleccionados(prev =>
      prev.includes(salonId)
        ? prev.filter(id => id !== salonId)
        : [...prev, salonId]
    );
  };

  const updateHabitacion = (hotelId: string, tipoId: string, field: keyof HabitacionPrecio, value: any) => {
    setHabitacionesPorHotel(prev => ({
      ...prev,
      [hotelId]: prev[hotelId].map(h =>
        h.tipoHabitacionId === tipoId ? { ...h, [field]: value } : h
      ),
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const eventoId = evento?.id || '';
      
      for (const hotelSel of hotelesSeleccionados) {
        let eventoHotelId = hotelSel.eventoHotelId;
        
        if (!eventoHotelId) {
          const nuevoEventoHotel = db.eventoHoteles.create({
            eventoId,
            hotelId: hotelSel.hotelId,
            fechaCheckin: evento?.startDate || '',
            fechaCheckout: evento?.endDate || '',
          });
          eventoHotelId = nuevoEventoHotel.id;
        }

        db.eventoHotelHabitaciones.deleteByEventoHotel(eventoHotelId);
        
        const habitaciones = habitacionesPorHotel[hotelSel.hotelId] || [];
        for (const hab of habitaciones) {
          if (hab.precioCUP > 0 || hab.precioMoneda > 0 || hab.cupo > 0) {
            db.eventoHotelHabitaciones.create({
              eventoHotelId,
              tipoHabitacionId: hab.tipoHabitacionId,
              precioCUP: hab.precioCUP,
              precioMoneda: hab.precioMoneda,
              moneda: hab.moneda as any,
              cupo: hab.cupo,
            });
          }
        }
      }

      for (const salonId of salonesSeleccionados) {
        const existente = db.eventoSalones.getAll().find(
          es => es.eventoId === eventoId && es.salonId === salonId
        );
        if (!existente) {
          db.eventoSalones.create({
            eventoId,
            salonId,
            disponible: true,
          });
        }
      }

      const salonesActuales = db.eventoSalones.getAll().filter(es => es.eventoId === eventoId);
      for (const es of salonesActuales) {
        if (!salonesSeleccionados.includes(es.salonId)) {
          db.eventoSalones.delete(es.id);
        }
      }

      await guardarPaso(2, {} as any);
      toast.success('Hoteles y alojamientos guardados');
    } catch (error) {
      toast.error('Error al guardar');
      console.error(error);
    }
    setIsSaving(false);
  };

  const filteredHoteles = hotelesDisponibles.filter(h => {
    const q = search.toLowerCase();
    const matchSearch = !q || h.nombre.toLowerCase().includes(q) || h.ciudad.toLowerCase().includes(q);
    const matchCiudad = !filters.ciudad || filters.ciudad === 'all' || h.ciudad === filters.ciudad;
    const matchEstrellas = !filters.estrellas || filters.estrellas === 'all' || h.categoriaEstrellas === parseInt(filters.estrellas);
    return matchSearch && matchCiudad && matchEstrellas;
  });

  const ciudades = [...new Set(hotelesDisponibles.map(h => h.ciudad))];

  const tiposHabitacionHotel = selectedHotelId 
    ? db.hotelTiposHabitacion.getByHotel(selectedHotelId)
    : [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Hoteles, Salones y Habitaciones</CardTitle>
          <CardDescription>
            Configure los hoteles, salones y tipos de habitación para este evento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="hoteles" className="gap-2">
                <Building2 className="w-4 h-4" />
                Hoteles
                <Badge variant="secondary" className="ml-1">{hotelesSeleccionados.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="salones" className="gap-2">
                <MapPin className="w-4 h-4" />
                Salones
                <Badge variant="secondary" className="ml-1">{salonesSeleccionados.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="habitaciones" className="gap-2">
                <Building2 className="w-4 h-4" />
                Habitaciones
              </TabsTrigger>
            </TabsList>

            {/* Tab Hoteles */}
            <TabsContent value="hoteles" className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nombre o ciudad..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={filters.ciudad} onValueChange={v => setFilters({ ...filters, ciudad: v })}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Ciudad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las ciudades</SelectItem>
                    {ciudades.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={filters.estrellas} onValueChange={v => setFilters({ ...filters, estrellas: v })}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Estrellas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="3">3 Estrellas</SelectItem>
                    <SelectItem value="4">4 Estrellas</SelectItem>
                    <SelectItem value="5">5 Estrellas</SelectItem>
                  </SelectContent>
                </Select>
                {canManageNomencladores && (
                  <Button variant="outline" onClick={() => setIsHotelDialogOpen(true)} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Crear Hotel
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                {filteredHoteles.map(hotel => {
                  const salonesCount = db.salones.getActivosByHotel(hotel.id).length;
                  const habitacionesCount = db.hotelTiposHabitacion.getByHotel(hotel.id).length;
                  const isSelected = hotelesSeleccionados.some(h => h.hotelId === hotel.id);
                  return (
                    <div
                      key={hotel.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-primary bg-primary/5 ring-2 ring-primary' 
                          : 'hover:border-primary/50'
                      }`}
                      onClick={() => toggleHotel(hotel.id)}
                    >
                      <div className="flex items-start gap-4">
                        <Checkbox 
                          checked={isSelected} 
                          onCheckedChange={() => toggleHotel(hotel.id)} 
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{hotel.nombre}</h4>
                            <span className="text-yellow-500">{'⭐'.repeat(hotel.categoriaEstrellas)}</span>
                          </div>
                          <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                            <MapPin className="w-3 h-3" />
                            {hotel.ciudad}
                            <Phone className="w-3 h-3 ml-2" />
                            {hotel.telefono}
                          </p>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="outline">
                              {salonesCount} salones
                            </Badge>
                            <Badge variant="outline">
                              {habitacionesCount} tipos habitación
                            </Badge>
                          </div>
                        </div>
                        <Button variant={isSelected ? "default" : "outline"} size="sm">
                          {isSelected ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {hotelesSeleccionados.length > 0 && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-2">Hoteles seleccionados:</p>
                  <div className="flex flex-wrap gap-2">
                    {hotelesSeleccionados.map(h => (
                      <Badge key={h.hotelId} variant="default" className="gap-1">
                        {h.hotel.nombre}
                        <X 
                          className="w-3 h-3 cursor-pointer" 
                          onClick={(e) => { e.stopPropagation(); toggleHotel(h.hotelId); }}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Tab Salones */}
            <TabsContent value="salones" className="space-y-4">
              {hotelesSeleccionados.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Seleccione primero hoteles en la pestaña anterior</p>
                </div>
              ) : (
                <>
                  <Select value={selectedHotelId} onValueChange={setSelectedHotelId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar hotel" />
                    </SelectTrigger>
                    <SelectContent>
                      {hotelesSeleccionados.map(h => (
                        <SelectItem key={h.hotelId} value={h.hotelId}>{h.hotel.nombre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      {salonesDisponibles.length} salón(es) disponibles
                    </p>
                    {canManageNomencladores && selectedHotelId && (
                      <Button variant="outline" size="sm" onClick={() => setIsSalonDialogOpen(true)} className="gap-2">
                        <Plus className="w-4 h-4" />
                        Crear Salón
                      </Button>
                    )}
                  </div>

                  {selectedHotelId && (
                    <div className="space-y-2">
                      {salonesDisponibles.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <p>No hay salones configurados para este hotel</p>
                        </div>
                      ) : (
                        salonesDisponibles.map(salon => {
                          const isSelected = salonesSeleccionados.includes(salon.id);
                          return (
                            <div
                              key={salon.id}
                              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                                isSelected 
                                  ? 'border-primary bg-primary/5 ring-2 ring-primary' 
                                  : 'hover:border-primary/50'
                              }`}
                              onClick={() => toggleSalon(salon.id)}
                            >
                              <div className="flex items-center gap-4">
                                <Checkbox 
                                  checked={isSelected} 
                                  onCheckedChange={() => toggleSalon(salon.id)} 
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-medium">{salon.nombre}</h4>
                                    <Badge variant="outline">{salon.codigo}</Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    {salon.ubicacion} • Capacidad: {salon.capacidadMaxima} personas
                                  </p>
                                  {salon.imagenes && salon.imagenes.length > 0 && (
                                    <Badge variant="secondary" className="mt-1 gap-1">
                                      <ImageIcon className="w-3 h-3" />
                                      {salon.imagenes.length} imágenes
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            {/* Tab Habitaciones */}
            <TabsContent value="habitaciones" className="space-y-4">
              {hotelesSeleccionados.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Seleccione primero hoteles en la pestaña de Hoteles</p>
                </div>
              ) : (
                <>
                  <Select value={selectedHotelId} onValueChange={setSelectedHotelId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar hotel" />
                    </SelectTrigger>
                    <SelectContent>
                      {hotelesSeleccionados.map(h => (
                        <SelectItem key={h.hotelId} value={h.hotelId}>{h.hotel.nombre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      {tiposHabitacionHotel.length} tipo(s) de habitación
                    </p>
                    {canManageNomencladores && selectedHotelId && (
                      <Button variant="outline" size="sm" onClick={() => setIsTipoHabitacionDialogOpen(true)} className="gap-2">
                        <Plus className="w-4 h-4" />
                        Crear Tipo Habitación
                      </Button>
                    )}
                  </div>

                  {selectedHotelId && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          {hotelesDisponibles.find(h => h.id === selectedHotelId)?.nombre}
                        </CardTitle>
                        <CardDescription>
                          Configure precios y cupos para cada tipo de habitación de este hotel
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {tiposHabitacionHotel.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            <p>No hay tipos de habitación configurados para este hotel</p>
                            <p className="text-xs mt-1">Los tipos de habitación se configuran en el módulo de Hotel</p>
                          </div>
                        ) : (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Tipo de Habitación</TableHead>
                                <TableHead>Precio CUP</TableHead>
                                <TableHead>Precio (USD)</TableHead>
                                <TableHead>Cupo</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {tiposHabitacionHotel.map(th => {
                                const tipoHabitacion = db.nomTiposHabitacion.getAll().find(t => t.id === th.tipoHabitacionId);
                                const habitacion = habitacionesPorHotel[selectedHotelId]?.find(
                                  h => h.tipoHabitacionId === th.tipoHabitacionId
                                );
                                return (
                                  <TableRow key={th.id}>
                                    <TableCell>
                                      <div>
                                        <p className="font-medium">{tipoHabitacion?.nombre || 'Sin nombre'}</p>
                                        <p className="text-xs text-muted-foreground">
                                          Cap. máx: {tipoHabitacion?.capacidadMaxPersonas || 0}
                                        </p>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <Input
                                        type="number"
                                        value={habitacion?.precioCUP || 0}
                                        onChange={e => updateHabitacion(
                                          selectedHotelId,
                                          th.tipoHabitacionId,
                                          'precioCUP',
                                          parseFloat(e.target.value) || 0
                                        )}
                                        className="w-24"
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <Input
                                        type="number"
                                        value={habitacion?.precioMoneda || 0}
                                        onChange={e => updateHabitacion(
                                          selectedHotelId,
                                          th.tipoHabitacionId,
                                          'precioMoneda',
                                          parseFloat(e.target.value) || 0
                                        )}
                                        className="w-24"
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <Input
                                        type="number"
                                        value={habitacion?.cupo || 0}
                                        onChange={e => updateHabitacion(
                                          selectedHotelId,
                                          th.tipoHabitacionId,
                                          'cupo',
                                          parseInt(e.target.value) || 0
                                        )}
                                        className="w-24"
                                      />
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} size="lg">
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Guardando...' : 'Guardar Hoteles y Alojamiento'}
        </Button>
      </div>

      <Dialog open={isHotelDialogOpen} onOpenChange={setIsHotelDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Hotel</DialogTitle>
            <DialogDescription>Agregue un nuevo hotel al nomenclador general</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre del Hotel *</Label>
              <Input value={hotelForm.nombre} onChange={e => setHotelForm({ ...hotelForm, nombre: e.target.value })} placeholder="Ej: Hotel Nacional" />
            </div>
            <div className="space-y-2">
              <Label>Cadena Hotelera</Label>
              <Input value={hotelForm.cadenaHotelera} onChange={e => setHotelForm({ ...hotelForm, cadenaHotelera: e.target.value })} placeholder="Ej: Iberostar" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ciudad *</Label>
                <Input value={hotelForm.ciudad} onChange={e => setHotelForm({ ...hotelForm, ciudad: e.target.value })} placeholder="Ej: La Habana" />
              </div>
              <div className="space-y-2">
                <Label>Estrellas</Label>
                <Select value={String(hotelForm.categoriaEstrellas)} onValueChange={v => setHotelForm({ ...hotelForm, categoriaEstrellas: parseInt(v) })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 Estrellas</SelectItem>
                    <SelectItem value="4">4 Estrellas</SelectItem>
                    <SelectItem value="5">5 Estrellas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Dirección</Label>
              <Input value={hotelForm.direccion} onChange={e => setHotelForm({ ...hotelForm, direccion: e.target.value })} placeholder="Dirección completa" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input value={hotelForm.telefono} onChange={e => setHotelForm({ ...hotelForm, telefono: e.target.value })} placeholder="+53 7 ..." />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={hotelForm.email} onChange={e => setHotelForm({ ...hotelForm, email: e.target.value })} placeholder="info@hotel.com" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsHotelDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleCrearHotel}>Crear Hotel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isSalonDialogOpen} onOpenChange={setIsSalonDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Salón</DialogTitle>
            <DialogDescription>Agregue un nuevo salón para {hotelesDisponibles.find(h => h.id === selectedHotelId)?.nombre}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Código *</Label>
                <Input value={salonForm.codigo} onChange={e => setSalonForm({ ...salonForm, codigo: e.target.value })} placeholder="Ej: SAL-001" />
              </div>
              <div className="space-y-2">
                <Label>Nombre *</Label>
                <Input value={salonForm.nombre} onChange={e => setSalonForm({ ...salonForm, nombre: e.target.value })} placeholder="Ej: Salón Convenciones" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Ubicación</Label>
              <Input value={salonForm.ubicacion} onChange={e => setSalonForm({ ...salonForm, ubicacion: e.target.value })} placeholder="Ej: Piso 2, Ala Norte" />
            </div>
            <div className="space-y-2">
              <Label>Capacidad Máxima</Label>
              <Input type="number" value={salonForm.capacidadMaxima} onChange={e => setSalonForm({ ...salonForm, capacidadMaxima: parseInt(e.target.value) || 0 })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSalonDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleCrearSalon}>Crear Salón</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isTipoHabitacionDialogOpen} onOpenChange={setIsTipoHabitacionDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Crear Tipo de Habitación</DialogTitle>
            <DialogDescription>Agregue un nuevo tipo de habitación para {hotelesDisponibles.find(h => h.id === selectedHotelId)?.nombre}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre *</Label>
              <Input value={tipoHabitacionForm.nombre} onChange={e => setTipoHabitacionForm({ ...tipoHabitacionForm, nombre: e.target.value })} placeholder="Ej: Individual Estándar" />
            </div>
            <div className="space-y-2">
              <Label>Descripción</Label>
              <Input value={tipoHabitacionForm.descripcion} onChange={e => setTipoHabitacionForm({ ...tipoHabitacionForm, descripcion: e.target.value })} placeholder="Breve descripción" />
            </div>
            <div className="space-y-2">
              <Label>Capacidad Máxima de Personas</Label>
              <Input type="number" value={tipoHabitacionForm.capacidadMaxPersonas} onChange={e => setTipoHabitacionForm({ ...tipoHabitacionForm, capacidadMaxPersonas: parseInt(e.target.value) || 1 })} min={1} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTipoHabitacionDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleCrearTipoHabitacion}>Crear Tipo Habitación</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {!canManageNomencladores && (
        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg text-sm text-muted-foreground">
          <AlertCircle className="w-4 h-4" />
          Solo los administradores pueden crear nomencladores
        </div>
      )}
    </div>
  );
}

export default HotelesStep;
