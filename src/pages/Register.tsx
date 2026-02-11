import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Beaker, Loader2, ArrowRight, ArrowLeft, Upload, User } from 'lucide-react';
import { toast } from 'sonner';

const countries = [
  'Cuba', 'México', 'Argentina', 'España', 'Colombia', 'Chile', 'Perú', 'Venezuela', 'Brasil', 'Estados Unidos',
  'Ecuador', 'Bolivia', 'Uruguay', 'Paraguay', 'Costa Rica', 'Panamá', 'Guatemala', 'Honduras', 'El Salvador',
  'Nicaragua', 'República Dominicana', 'Puerto Rico', 'Canadá', 'Francia', 'Alemania', 'Italia', 'Portugal', 'Reino Unido'
];

const affiliations = [
  'Universidad', 'Centro de Investigación', 'Hospital', 'Empresa Privada', 'Gobierno', 'ONG',
  'Institución Educativa', 'Laboratorio', 'Fundación', 'Organismo Internacional', 'Otro'
];

const affiliationTypes = [
  'Entidad Presupuestada',
  'Empresa Estatal',
  'Empresa Mixta',
  'Empresa Privada',
  'Cooperativa',
  'Organismo Internacional',
  'ONG',
  'Institución Académica',
  'Centro de Investigación',
  'Otro'
];

const economicSectors = [
  'Educación',
  'Salud',
  'Tecnología',
  'Agricultura',
  'Industria',
  'Comercio',
  'Turismo',
  'Construcción',
  'Transporte',
  'Telecomunicaciones',
  'Energía',
  'Finanzas',
  'Servicios',
  'Otro'
];

const participationTypes = [
  'Ponente',
  'Coautor',
  'Asistente',
  'Organizador',
  'Patrocinador',
  'Invitado Especial',
  'Otro'
];

const scientificLevels = [
  'Estudiante de Pregrado',
  'Estudiante de Posgrado',
  'Especialista',
  'Máster',
  'Doctor',
  'Investigador Titular',
  'Profesor Titular',
  'Académico',
  'Otro'
];

const educationalLevels = [
  'Técnico Medio',
  'Técnico Superior',
  'Universitario',
  'Posgrado',
  'Máster',
  'Doctor',
  'Postdoctorado'
];

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    idDocument: '',
    country: '',
    affiliation: '',
    affiliationType: '',
    economicSector: '',
    participationType: '',
    scientificLevel: '',
    educationalLevel: '',
    gender: 'Masculino',
    profilePhoto: null as File | null,
  });
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    setIsLoading(true);
    try {
      await register({
        name: formData.name,
        email: formData.email,
        role: 'USER',
        country: formData.country,
        affiliation: formData.affiliation,
        idDocument: formData.idDocument,
        affiliationType: formData.affiliationType,
        economicSector: formData.economicSector,
        participationType: formData.participationType,
        scientificLevel: formData.scientificLevel,
        educationalLevel: formData.educationalLevel,
        gender: formData.gender,
        avatar: photoPreview,
      } as any);
      navigate('/dashboard');
    } catch {
      // Error handled in AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  const updateForm = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, profilePhoto: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f4c5c 100%)' }}>
      {/* Left Panel - Hero */}
      <div className="hidden lg:flex flex-1 items-center justify-center p-12">
        <div className="max-w-lg text-center text-white animate-fade-in">
          <div className="mb-8">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-500 shadow-lg mb-4">
              <Beaker className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-4xl font-display font-bold mb-4">
              Crear Nueva Cuenta
            </h2>
            <div className="h-1 w-32 bg-green-500 mx-auto mb-6"></div>
          </div>
          <p className="text-lg opacity-90 mb-8">
            Regístrate para participar en eventos científicos, enviar tus investigaciones
            y conectar con otros profesionales del sector.
          </p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {[
              { title: 'Envía Resúmenes', desc: 'Presenta tus investigaciones' },
              { title: 'Revisión por Pares', desc: 'Feedback de expertos' },
              { title: 'Networking', desc: 'Conecta con colegas' },
              { title: 'Certificados', desc: 'Reconocimiento oficial' },
            ].map((item) => (
              <div key={item.title} className="p-4 rounded-xl bg-white/10 backdrop-blur-sm text-left border border-green-500/20">
                <p className="font-semibold text-green-400">{item.title}</p>
                <p className="text-sm opacity-80">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-2xl animate-slide-up my-8">
          <Link to="/login" className="inline-flex items-center gap-2 text-sm text-gray-300 hover:text-white mb-8">
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>

          <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
            <CardHeader className="space-y-1 border-b-2 border-green-500">
              <CardTitle className="text-3xl font-display text-center" style={{ color: '#0f172a' }}>
                Crear Nueva Cuenta
              </CardTitle>
              <CardDescription className="text-center">
                Completa tus datos para registrarte
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Foto de Perfil */}
                <div className="flex flex-col items-center space-y-3 pb-5 border-b">
                  <Label className="text-base font-semibold" style={{ color: '#0f172a' }}>Foto de Perfil</Label>
                  <div className="relative">
                    <div className="h-24 w-24 rounded-full border-4 border-green-500 overflow-hidden bg-gray-100 flex items-center justify-center">
                      {photoPreview ? (
                        <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
                      ) : (
                        <User className="h-12 w-12 text-gray-400" />
                      )}
                    </div>
                  </div>
                  <Label htmlFor="photo" className="cursor-pointer">
                    <div className="px-6 py-2 rounded-lg text-white font-medium flex items-center gap-2 hover:opacity-90 transition-opacity" style={{ background: '#1e40af' }}>
                      <Upload className="h-4 w-4" />
                      Seleccionar Archivo
                    </div>
                    <Input
                      id="photo"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </Label>
                </div>

                {/* Nombre y Teléfono */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium" style={{ color: '#0f172a' }}>
                      Nombre(s) y Apellidos <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => updateForm('name', e.target.value)}
                      required
                      className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium" style={{ color: '#0f172a' }}>
                      Teléfono
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => updateForm('phone', e.target.value)}
                      className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                    />
                  </div>
                </div>

                {/* Carné de Identidad/Pasaporte */}
                <div className="space-y-2">
                  <Label htmlFor="idDocument" className="text-sm font-medium" style={{ color: '#0f172a' }}>
                    Carné de Identidad / Pasaporte <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="idDocument"
                    type="text"
                    value={formData.idDocument}
                    onChange={(e) => updateForm('idDocument', e.target.value)}
                    required
                    className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium" style={{ color: '#0f172a' }}>
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateForm('email', e.target.value)}
                    required
                    className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                  />
                </div>

                {/* Contraseñas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium" style={{ color: '#0f172a' }}>
                      Contraseña <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => updateForm('password', e.target.value)}
                      required
                      className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium" style={{ color: '#0f172a' }}>
                      Confirmar contraseña <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => updateForm('confirmPassword', e.target.value)}
                      required
                      className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                    />
                  </div>
                </div>

                {/* Afiliación y Tipo de Afiliación */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium" style={{ color: '#0f172a' }}>
                      Afiliación <span className="text-red-500">*</span>
                    </Label>
                    <Select value={formData.affiliation} onValueChange={(v) => updateForm('affiliation', v)} required>
                      <SelectTrigger className="border-gray-300 focus:border-green-500 focus:ring-green-500">
                        <SelectValue placeholder="Seleccione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {affiliations.map(aff => (
                          <SelectItem key={aff} value={aff}>{aff}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium" style={{ color: '#0f172a' }}>
                      Tipo de Afiliación <span className="text-red-500">*</span>
                    </Label>
                    <Select value={formData.affiliationType} onValueChange={(v) => updateForm('affiliationType', v)} required>
                      <SelectTrigger className="border-gray-300 focus:border-green-500 focus:ring-green-500">
                        <SelectValue placeholder="Seleccione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {affiliationTypes.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* País */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium" style={{ color: '#0f172a' }}>
                    País <span className="text-red-500">*</span>
                  </Label>
                  <Select value={formData.country} onValueChange={(v) => updateForm('country', v)} required>
                    <SelectTrigger className="border-gray-300 focus:border-green-500 focus:ring-green-500">
                      <SelectValue placeholder="Seleccione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map(country => (
                        <SelectItem key={country} value={country}>{country}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Sector Económico y Tipo de Participación */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium" style={{ color: '#0f172a' }}>
                      Sector Económico <span className="text-red-500">*</span>
                    </Label>
                    <Select value={formData.economicSector} onValueChange={(v) => updateForm('economicSector', v)} required>
                      <SelectTrigger className="border-gray-300 focus:border-green-500 focus:ring-green-500">
                        <SelectValue placeholder="Seleccione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {economicSectors.map(sector => (
                          <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium" style={{ color: '#0f172a' }}>
                      Tipo de Participación <span className="text-red-500">*</span>
                    </Label>
                    <Select value={formData.participationType} onValueChange={(v) => updateForm('participationType', v)} required>
                      <SelectTrigger className="border-gray-300 focus:border-green-500 focus:ring-green-500">
                        <SelectValue placeholder="Seleccione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {participationTypes.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Nivel Científico y Nivel Educacional */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium" style={{ color: '#0f172a' }}>
                      Nivel Científico
                    </Label>
                    <Select value={formData.scientificLevel} onValueChange={(v) => updateForm('scientificLevel', v)}>
                      <SelectTrigger className="border-gray-300 focus:border-green-500 focus:ring-green-500">
                        <SelectValue placeholder="Seleccione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {scientificLevels.map(level => (
                          <SelectItem key={level} value={level}>{level}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium" style={{ color: '#0f172a' }}>
                      Nivel Educacional <span className="text-red-500">*</span>
                    </Label>
                    <Select value={formData.educationalLevel} onValueChange={(v) => updateForm('educationalLevel', v)} required>
                      <SelectTrigger className="border-gray-300 focus:border-green-500 focus:ring-green-500">
                        <SelectValue placeholder="Seleccione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {educationalLevels.map(level => (
                          <SelectItem key={level} value={level}>{level}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Género */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium" style={{ color: '#0f172a' }}>
                    Género <span className="text-red-500">*</span>
                  </Label>
                  <RadioGroup value={formData.gender} onValueChange={(v) => updateForm('gender', v)} className="flex gap-6">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Masculino" id="masculino" className="border-green-500 text-green-500" />
                      <Label htmlFor="masculino" className="cursor-pointer font-normal">Masculino</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Femenino" id="femenino" className="border-green-500 text-green-500" />
                      <Label htmlFor="femenino" className="cursor-pointer font-normal">Femenino</Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Botón de Registro */}
                <div className="pt-4">
                  <Button 
                    type="submit" 
                    className="w-full text-lg py-6 text-white font-bold hover:opacity-90 transition-opacity" 
                    style={{ background: '#1e40af' }}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        REGÍSTRESE
                        <ArrowRight className="h-5 w-5 ml-2" />
                      </>
                    )}
                  </Button>
                </div>

                <p className="text-center text-sm text-gray-600 pt-2">
                  ¿Ya tienes cuenta?{' '}
                  <Link to="/login" className="font-medium hover:underline" style={{ color: '#1e40af' }}>
                    Inicia Sesión
                  </Link>
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
