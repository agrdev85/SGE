import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { abstractsApi } from '@/lib/mockApi';
import { ArrowLeft, Loader2, Send, X, Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function NewAbstract() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    summaryText: '',
    eventId: '1',
  });
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState('');
  const [authors, setAuthors] = useState<string[]>([user?.name || '']);
  const [authorInput, setAuthorInput] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (keywords.length < 3) {
      toast.error('Añade al menos 3 palabras clave');
      return;
    }
    if (formData.summaryText.length < 100) {
      toast.error('El resumen debe tener al menos 100 caracteres');
      return;
    }
    setIsLoading(true);
    try {
      await abstractsApi.create({
        ...formData,
        keywords,
        authors,
        userId: user!.id,
      });
      navigate('/abstracts');
    } catch {
      toast.error('Error al enviar el resumen');
    } finally {
      setIsLoading(false);
    }
  };

  const addKeyword = () => {
    if (keywordInput.trim() && !keywords.includes(keywordInput.trim())) {
      setKeywords([...keywords, keywordInput.trim()]);
      setKeywordInput('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setKeywords(keywords.filter(k => k !== keyword));
  };

  const addAuthor = () => {
    if (authorInput.trim() && !authors.includes(authorInput.trim())) {
      setAuthors([...authors, authorInput.trim()]);
      setAuthorInput('');
    }
  };

  const removeAuthor = (author: string) => {
    if (authors.length > 1) {
      setAuthors(authors.filter(a => a !== author));
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate('/abstracts')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Mis Resúmenes
        </Button>

        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-display">Enviar Nuevo Resumen</CardTitle>
            <CardDescription>
              Completa el formulario para enviar tu trabajo científico a revisión
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Event Selection */}
              <div className="space-y-2">
                <Label>Evento *</Label>
                <Select
                  value={formData.eventId}
                  onValueChange={(v) => setFormData({ ...formData, eventId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un evento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Congreso Internacional de Biotecnología 2024</SelectItem>
                    <SelectItem value="2">Simposio de Nanociencias 2024</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Título del Trabajo *</Label>
                <Input
                  id="title"
                  placeholder="Ingresa el título de tu investigación"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              {/* Authors */}
              <div className="space-y-2">
                <Label>Autores *</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {authors.map((author, index) => (
                    <Badge key={author} variant="secondary" className="pl-3 pr-1 py-1">
                      {author}
                      {authors.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeAuthor(author)}
                          className="ml-1 p-0.5 hover:bg-muted-foreground/20 rounded"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Añadir coautor"
                    value={authorInput}
                    onChange={(e) => setAuthorInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAuthor())}
                  />
                  <Button type="button" variant="outline" onClick={addAuthor}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Summary */}
              <div className="space-y-2">
                <Label htmlFor="summary">Resumen *</Label>
                <Textarea
                  id="summary"
                  placeholder="Escribe el resumen de tu investigación (mínimo 100 caracteres)"
                  value={formData.summaryText}
                  onChange={(e) => setFormData({ ...formData, summaryText: e.target.value })}
                  className="min-h-[200px]"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  {formData.summaryText.length} / 100 caracteres mínimo
                </p>
              </div>

              {/* Keywords */}
              <div className="space-y-2">
                <Label>Palabras Clave * (mínimo 3)</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {keywords.map(keyword => (
                    <Badge key={keyword} variant="outline" className="pl-3 pr-1 py-1">
                      {keyword}
                      <button
                        type="button"
                        onClick={() => removeKeyword(keyword)}
                        className="ml-1 p-0.5 hover:bg-muted-foreground/20 rounded"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Añadir palabra clave"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                  />
                  <Button type="button" variant="outline" onClick={addKeyword}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/abstracts')}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button type="submit" variant="hero" className="flex-1" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Enviar Resumen
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
