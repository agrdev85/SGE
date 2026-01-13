import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Mail, MapPin, Building, Bell, Shield, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';

const countries = [
  'Cuba', 'México', 'Argentina', 'España', 'Colombia', 'Chile', 'Perú', 'Venezuela', 'Brasil', 'Estados Unidos'
];

export default function Settings() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    country: user?.country || '',
    affiliation: user?.affiliation || '',
  });
  const [notifications, setNotifications] = useState({
    email: true,
    abstracts: true,
    reviews: true,
    events: false,
  });

  const handleSave = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success('Configuración guardada correctamente');
    setIsLoading(false);
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-display font-bold">Configuración</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona tu perfil y preferencias
          </p>
        </div>

        {/* Profile Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <CardTitle className="font-display">Perfil</CardTitle>
            </div>
            <CardDescription>
              Información personal y datos de contacto
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-semibold">
                  {user?.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <Button variant="outline" size="sm">
                  Cambiar foto
                </Button>
                <p className="text-xs text-muted-foreground mt-1">
                  JPG, PNG o GIF. Máximo 2MB.
                </p>
              </div>
            </div>

            <Separator />

            {/* Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre Completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>País</Label>
                <Select
                  value={formData.country}
                  onValueChange={(v) => setFormData({ ...formData, country: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona tu país" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map(country => (
                      <SelectItem key={country} value={country}>{country}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="affiliation">Afiliación</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="affiliation"
                    value={formData.affiliation}
                    onChange={(e) => setFormData({ ...formData, affiliation: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <CardTitle className="font-display">Notificaciones</CardTitle>
            </div>
            <CardDescription>
              Configura cómo quieres recibir las notificaciones
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Notificaciones por Email</p>
                <p className="text-sm text-muted-foreground">Recibe actualizaciones por correo</p>
              </div>
              <Switch
                checked={notifications.email}
                onCheckedChange={(checked) => setNotifications({ ...notifications, email: checked })}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Estado de Resúmenes</p>
                <p className="text-sm text-muted-foreground">Cambios en el estado de tus trabajos</p>
              </div>
              <Switch
                checked={notifications.abstracts}
                onCheckedChange={(checked) => setNotifications({ ...notifications, abstracts: checked })}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Revisiones Asignadas</p>
                <p className="text-sm text-muted-foreground">Nuevos trabajos para revisar</p>
              </div>
              <Switch
                checked={notifications.reviews}
                onCheckedChange={(checked) => setNotifications({ ...notifications, reviews: checked })}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Nuevos Eventos</p>
                <p className="text-sm text-muted-foreground">Anuncios de nuevos eventos</p>
              </div>
              <Switch
                checked={notifications.events}
                onCheckedChange={(checked) => setNotifications({ ...notifications, events: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle className="font-display">Seguridad</CardTitle>
            </div>
            <CardDescription>
              Gestiona tu contraseña y seguridad de la cuenta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Cambiar Contraseña</p>
                <p className="text-sm text-muted-foreground">Última actualización hace 30 días</p>
              </div>
              <Button variant="outline">Cambiar</Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Sesiones Activas</p>
                <p className="text-sm text-muted-foreground">Gestiona los dispositivos conectados</p>
              </div>
              <Button variant="outline">Ver Sesiones</Button>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button variant="hero" onClick={handleSave} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Save className="h-4 w-4" />
                Guardar Cambios
              </>
            )}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
