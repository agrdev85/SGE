import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Beaker, 
  ArrowRight, 
  CheckCircle, 
  Users, 
  FileText, 
  Calendar,
  Award,
  Globe,
  Zap
} from 'lucide-react';

const features = [
  {
    icon: FileText,
    title: 'Gestión de Resúmenes',
    description: 'Envía y gestiona tus trabajos científicos con seguimiento en tiempo real del proceso de revisión.',
  },
  {
    icon: Users,
    title: 'Revisión por Pares',
    description: 'Sistema de evaluación transparente con árbitros especializados en cada área temática.',
  },
  {
    icon: Calendar,
    title: 'Múltiples Eventos',
    description: 'Participa en diferentes congresos y conferencias desde una única plataforma.',
  },
  {
    icon: Award,
    title: 'Certificados Digitales',
    description: 'Recibe certificados de participación y presentación verificables digitalmente.',
  },
];

const stats = [
  { value: '500+', label: 'Investigadores' },
  { value: '150+', label: 'Trabajos Presentados' },
  { value: '25+', label: 'Instituciones' },
  { value: '10+', label: 'Países' },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary shadow-glow-sm">
              <Beaker className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl">SciEvent</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Características
            </a>
            <a href="#events" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Eventos
            </a>
            <a href="#about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Nosotros
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link to="/login">Iniciar Sesión</Link>
            </Button>
            <Button variant="hero" asChild>
              <Link to="/register">
                Registrarse
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-5" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Globe className="h-4 w-4" />
              Plataforma de Eventos Científicos
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-tight mb-6">
              Gestiona tus{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-info">
                eventos científicos
              </span>{' '}
              de forma eficiente
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Desde el envío de resúmenes hasta la emisión de certificados. Una plataforma integral
              para congresos, conferencias y simposios científicos.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button variant="hero" size="xl" asChild>
                <Link to="/register">
                  Comenzar Ahora
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="xl" asChild>
                <Link to="/login">
                  Ya tengo cuenta
                </Link>
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 max-w-3xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <p className="text-3xl md:text-4xl font-display font-bold text-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Todo lo que necesitas
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Una plataforma completa para la gestión integral de eventos científicos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-lg font-display font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              ¿Cómo funciona?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Un proceso simple y transparente para participar en eventos científicos
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { step: '01', title: 'Regístrate', desc: 'Crea tu cuenta con tus datos profesionales' },
                { step: '02', title: 'Envía tu trabajo', desc: 'Sube tu resumen con título, autores y palabras clave' },
                { step: '03', title: 'Recibe feedback', desc: 'Los revisores evalúan y el comité clasifica tu trabajo' },
              ].map((item, index) => (
                <div key={index} className="relative">
                  <div className="text-6xl font-display font-bold text-primary/10 mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-display font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                  {index < 2 && (
                    <div className="hidden md:block absolute top-8 right-0 translate-x-1/2">
                      <ArrowRight className="h-6 w-6 text-primary/30" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-hero text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <Zap className="h-12 w-12 mx-auto mb-6 opacity-80" />
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            ¿Listo para participar?
          </h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            Únete a cientos de investigadores que ya utilizan SciEvent para gestionar sus eventos científicos
          </p>
          <Button size="xl" variant="secondary" asChild className="bg-white text-primary hover:bg-white/90">
            <Link to="/register">
              Crear mi cuenta gratis
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-muted/50 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary">
                <Beaker className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold">SciEvent</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 SciEvent. Sistema de Gestión de Eventos Científicos.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
