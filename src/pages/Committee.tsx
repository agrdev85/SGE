import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatusBadge } from '@/components/StatusBadge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { abstractsApi, Abstract } from '@/lib/mockApi';
import { Users, FileText, Presentation, Image, Mic } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

const categories = [
  { value: 'Ponencia', label: 'Ponencia', icon: Presentation, description: 'Presentación oral de 20 minutos' },
  { value: 'Poster', label: 'Poster', icon: Image, description: 'Presentación en formato póster' },
  { value: 'Conferencia', label: 'Conferencia', icon: Mic, description: 'Charla magistral invitada' },
] as const;

export default function Committee() {
  const [abstracts, setAbstracts] = useState<Abstract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAbstract, setSelectedAbstract] = useState<Abstract | null>(null);

  useEffect(() => {
    loadAbstracts();
  }, []);

  const loadAbstracts = async () => {
    try {
      const data = await abstractsApi.getApproved('1');
      setAbstracts(data);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignCategory = async (category: 'Ponencia' | 'Poster' | 'Conferencia') => {
    if (!selectedAbstract) return;
    try {
      await abstractsApi.assignCategory(selectedAbstract.id, category);
      setSelectedAbstract(null);
      await loadAbstracts();
    } catch {
      toast.error('Error al asignar categoría');
    }
  };

  const categorizedCount = abstracts.filter(a => a.categoryType).length;
  const pendingCount = abstracts.filter(a => !a.categoryType).length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-display font-bold">Panel del Comité</h1>
          <p className="text-muted-foreground mt-1">
            Asigna categorías a los trabajos aprobados
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-primary/10 to-info/10 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/20">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-3xl font-bold font-display">{abstracts.length}</p>
                  <p className="text-sm text-muted-foreground">Total aprobados</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-warning/20">
                  <Users className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <p className="text-3xl font-bold font-display">{pendingCount}</p>
                  <p className="text-sm text-muted-foreground">Sin categorizar</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-accent/20">
                  <Presentation className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-3xl font-bold font-display">{categorizedCount}</p>
                  <p className="text-sm text-muted-foreground">Categorizados</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Abstracts Table */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Trabajos Aprobados</CardTitle>
            <CardDescription>
              Asigna el tipo de presentación para cada trabajo
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
                ))}
              </div>
            ) : abstracts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>No hay trabajos aprobados pendientes de categorizar</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Título</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Autores</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Estado</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Categoría</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {abstracts.map(abstract => (
                      <tr key={abstract.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                        <td className="py-4 px-4">
                          <p className="font-medium line-clamp-1">{abstract.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {abstract.keywords.slice(0, 2).join(', ')}
                          </p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-sm">{abstract.authors[0]}</p>
                          {abstract.authors.length > 1 && (
                            <p className="text-xs text-muted-foreground">
                              +{abstract.authors.length - 1} más
                            </p>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <StatusBadge status={abstract.status} size="sm" />
                        </td>
                        <td className="py-4 px-4">
                          {abstract.categoryType ? (
                            <Badge variant="outline">{abstract.categoryType}</Badge>
                          ) : (
                            <span className="text-sm text-muted-foreground">Sin asignar</span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <Button
                            variant={abstract.categoryType ? 'ghost' : 'default'}
                            size="sm"
                            onClick={() => setSelectedAbstract(abstract)}
                          >
                            {abstract.categoryType ? 'Cambiar' : 'Asignar'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category Assignment Dialog */}
        <Dialog open={!!selectedAbstract} onOpenChange={() => setSelectedAbstract(null)}>
          <DialogContent className="max-w-lg">
            {selectedAbstract && (
              <>
                <DialogHeader>
                  <DialogTitle className="font-display">Asignar Categoría</DialogTitle>
                  <DialogDescription>
                    {selectedAbstract.title}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 my-4">
                  {categories.map(cat => (
                    <button
                      key={cat.value}
                      onClick={() => handleAssignCategory(cat.value)}
                      className="w-full p-4 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all flex items-center gap-4 text-left"
                    >
                      <div className="p-3 rounded-xl bg-primary/10">
                        <cat.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{cat.label}</p>
                        <p className="text-sm text-muted-foreground">{cat.description}</p>
                      </div>
                    </button>
                  ))}
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setSelectedAbstract(null)}>
                    Cancelar
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
