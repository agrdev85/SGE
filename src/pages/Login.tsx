import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Beaker, Loader2, Mail, Lock, ArrowRight } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch {
      // Error handled in AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  const demoAccounts = [
    { email: 'maria@example.com', role: 'Participante', color: 'bg-primary' },
    { email: 'carlos@example.com', role: 'Revisor', color: 'bg-info' },
    { email: 'ana@example.com', role: 'Comité', color: 'bg-accent' },
    { email: 'admin@example.com', role: 'Admin', color: 'bg-warning' },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md animate-slide-up">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary shadow-glow">
              <Beaker className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold">SciEvent</h1>
              <p className="text-sm text-muted-foreground">Gestión de Eventos Científicos</p>
            </div>
          </div>

          <Card className="border-0 shadow-xl">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-display">Iniciar Sesión</CardTitle>
              <CardDescription>
                Ingresa tus credenciales para acceder al sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" variant="hero" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Iniciar Sesión
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6">
                <p className="text-center text-sm text-muted-foreground mb-4">
                  ¿No tienes cuenta?{' '}
                  <Link to="/register" className="font-medium text-primary hover:underline">
                    Regístrate
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Demo Accounts */}
          <div className="mt-6 p-4 rounded-xl bg-muted/50 border border-border">
            <p className="text-xs font-medium text-muted-foreground mb-3">
              Cuentas de demostración (clic para usar):
            </p>
            <div className="grid grid-cols-2 gap-2">
              {demoAccounts.map((account) => (
                <button
                  key={account.email}
                  onClick={() => setEmail(account.email)}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-background transition-colors text-left"
                >
                  <div className={`h-2 w-2 rounded-full ${account.color}`} />
                  <div>
                    <p className="text-xs font-medium">{account.role}</p>
                    <p className="text-xs text-muted-foreground truncate">{account.email}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Hero */}
      <div className="hidden lg:flex flex-1 gradient-hero items-center justify-center p-12">
        <div className="max-w-lg text-center text-primary-foreground animate-fade-in">
          <h2 className="text-4xl font-display font-bold mb-6">
            Gestiona tus eventos científicos de forma eficiente
          </h2>
          <p className="text-lg opacity-90 mb-8">
            Plataforma integral para la gestión de congresos, conferencias y eventos académicos.
            Desde el envío de resúmenes hasta la emisión de certificados.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            {['Registro Online', 'Revisión por Pares', 'Gestión de Programa', 'Certificados'].map((feature) => (
              <span key={feature} className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm">
                {feature}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
