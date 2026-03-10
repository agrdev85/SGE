import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useEventContext } from '@/contexts/EventContext';
import { StatCard } from '@/components/StatCard';
import { StatusBadge } from '@/components/StatusBadge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { statsApi, abstractsApi, eventsApi, Abstract, Event } from '@/lib/mockApi';
import { db, MacroEvent } from '@/lib/database';
import { FileText, CheckCircle, Clock, XCircle, Calendar, Plus, ArrowRight, MapPin, Hotel, Ticket, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();
  const { selectedEvent, userEvents, setSelectedEventId, showEventSelector, setShowEventSelector, isFirstVisit } = useEventContext();
  const [stats, setStats] = useState({ totalAbstracts: 0, pendingReview: 0, approved: 0, rejected: 0, events: 0 });
  const [recentAbstracts, setRecentAbstracts] = useState<Abstract[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      try {
        const [statsData, abstracts] = await Promise.all([
          statsApi.getDashboardStats(user.id, user.role),
          user.role === 'REVIEWER' ? abstractsApi.getPendingReview(user.id) : abstractsApi.getMyAbstracts(user.id),
        ]);
        setStats(statsData);
        setRecentAbstracts(abstracts.slice(0, 5));
      } finally { setIsLoading(false); }
    };
    loadData();
  }, [user]);

  const roleGreetings: Record<string, string> = {
    USER: 'Participante', REVIEWER: 'Revisor', COMMITTEE: 'Miembro del Comité', ADMIN: 'Administrador',
    SUPERADMIN: 'SuperAdmin', ADMIN_RECEPTIVO: 'Admin Receptivo', ADMIN_EMPRESA: 'Admin Empresa',
    COORDINADOR_HOTEL: 'Coordinador Hotel', LECTOR_RECEPTIVO: 'Lector Receptivo', LECTOR_EMPRESA: 'Lector Empresa',
  };

  // EVENT CARDS VIEW (first visit or "Ver todos mis eventos")
  if (showEventSelector || (isFirstVisit && !selectedEvent)) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-display font-bold">👋 Hola, {user?.name?.split(' ')[0]}</h1>
            <p className="text-muted-foreground mt-1">
              {userEvents.length > 0
                ? `Estás registrado en ${userEvents.length} evento${userEvents.length > 1 ? 's' : ''}:`
                : 'No tienes eventos asociados aún.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userEvents.map((me) => {
              const simpleEvents = db.events.getAll().filter(e => e.macroEventId === me.id);
              const startDate = me.startDate ? new Date(me.startDate) : null;
              const endDate = me.endDate ? new Date(me.endDate) : null;
              const now = new Date();
              const daysUntil = startDate ? Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0;

              return (
                <Card
                  key={me.id}
                  className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer border-2 hover:border-primary/50"
                  onClick={() => setSelectedEventId(me.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: (me as any).primaryColor || 'hsl(var(--primary))' }}>
                          {me.acronym?.substring(0, 3) || '🎯'}
                        </div>
                        <div>
                          <CardTitle className="text-lg leading-tight">{me.name}</CardTitle>
                          <Badge variant="outline" className="text-[10px] mt-1">{me.acronym}</Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {startDate && endDate && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {startDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} — {endDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Layers className="h-4 w-4" />{simpleEvents.length} eventos</span>
                    </div>
                    <div className="pt-2">
                      {daysUntil > 0 ? (
                        <Badge variant="secondary" className="text-xs">Faltan {daysUntil} días</Badge>
                      ) : daysUntil === 0 ? (
                        <Badge className="text-xs bg-green-500">¡Hoy!</Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">Finalizado</Badge>
                      )}
                    </div>
                    <Button variant="hero" size="sm" className="w-full mt-2">
                      Ir al Dashboard <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold">
              ¡Hola, {user?.name?.split(' ')[0]}!
            </h1>
            <p className="text-muted-foreground mt-1">
              Panel de {roleGreetings[user?.role || 'USER']}
              {selectedEvent && <> — <strong>{selectedEvent.name}</strong></>}
            </p>
          </div>
          {user?.role === 'USER' && (
            <Button variant="hero" asChild>
              <Link to="/abstracts/new"><Plus className="h-4 w-4" />Nuevo Resumen</Link>
            </Button>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard title="Total Resúmenes" value={stats.totalAbstracts} icon={FileText} variant="primary" />
          <StatCard title="En Proceso" value={stats.pendingReview} icon={Clock} variant="warning" />
          <StatCard title="Aprobados" value={stats.approved} icon={CheckCircle} variant="success" />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Abstracts */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-display">
                  {user?.role === 'REVIEWER' ? 'Pendientes de Revisión' : 'Mis Resúmenes Recientes'}
                </CardTitle>
                <CardDescription>
                  {user?.role === 'REVIEWER' ? 'Resúmenes asignados para tu revisión' : 'Estado actual de tus envíos'}
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to={user?.role === 'REVIEWER' ? '/review' : '/abstracts'}>
                  Ver todos <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />)}</div>
              ) : recentAbstracts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay resúmenes aún</p>
                  {user?.role === 'USER' && (
                    <Button variant="outline" size="sm" className="mt-4" asChild>
                      <Link to="/abstracts/new">Enviar mi primer resumen</Link>
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {recentAbstracts.map(abstract => (
                    <div key={abstract.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                      <div className="flex-1 min-w-0 mr-4">
                        <p className="font-medium truncate">{abstract.title}</p>
                        <p className="text-sm text-muted-foreground">{abstract.keywords.slice(0, 3).join(', ')}</p>
                      </div>
                      <StatusBadge status={abstract.status} size="sm" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Event Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display">Evento Actual</CardTitle>
              <CardDescription>Información del evento seleccionado</CardDescription>
            </CardHeader>
            <CardContent>
              {selectedEvent ? (
                <div className="space-y-4">
                  <div className="rounded-lg overflow-hidden">
                    {(selectedEvent as any).bannerImageUrl ? (
                      <img src={(selectedEvent as any).bannerImageUrl} alt={selectedEvent.name} className="w-full h-24 object-cover" />
                    ) : (
                      <div className="w-full h-24 bg-gradient-to-r from-primary to-info flex items-center justify-center">
                        <span className="text-white font-bold text-lg">{selectedEvent.acronym}</span>
                      </div>
                    )}
                  </div>
                  <h3 className="font-semibold">{selectedEvent.name}</h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(selectedEvent.startDate).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })} - {new Date(selectedEvent.endDate).toLocaleDateString('es-ES', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>
                  {selectedEvent.description && (
                    <p className="text-sm text-muted-foreground line-clamp-3">{selectedEvent.description}</p>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Selecciona un evento</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
