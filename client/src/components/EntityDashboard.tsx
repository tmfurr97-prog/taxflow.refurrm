import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, Plus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import EntityFormation from './EntityFormation';
import ComplianceTracker from './ComplianceTracker';
import SCorpOptimizer from './SCorpOptimizer';

interface Entity {
  id: string;
  entity_name: string;
  entity_type: string;
  state: string;
  status: string;
  formation_date: string;
}

export default function EntityDashboard() {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [showFormation, setShowFormation] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadEntities();
  }, []);

  const loadEntities = async () => {
    try {
      const { data, error } = await supabase
        .from('business_entities')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEntities(data || []);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const getEntityTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      sole_proprietorship: 'Sole Proprietorship',
      llc: 'LLC',
      s_corp: 'S-Corp',
      c_corp: 'C-Corp',
      partnership: 'Partnership'
    };
    return labels[type] || type;
  };

  if (showFormation) {
    return <EntityFormation onComplete={() => { setShowFormation(false); loadEntities(); }} />;
  }

  if (selectedEntity) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{selectedEntity.entity_name}</h2>
            <p className="text-muted-foreground">{getEntityTypeLabel(selectedEntity.entity_type)} • {selectedEntity.state}</p>
          </div>
          <Button variant="outline" onClick={() => setSelectedEntity(null)}>Back to All Entities</Button>
        </div>
        
        <ComplianceTracker entityId={selectedEntity.id} />
        
        {selectedEntity.entity_type === 's_corp' && (
          <SCorpOptimizer entityId={selectedEntity.id} />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Building2 className="h-6 w-6" />
          Business Entities
        </h2>
        <Button onClick={() => setShowFormation(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Form New Entity
        </Button>
      </div>

      {loading ? (
        <p>Loading entities...</p>
      ) : entities.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Business Entities</h3>
            <p className="text-muted-foreground mb-4">Get started by forming your first business entity</p>
            <Button onClick={() => setShowFormation(true)}>Form New Entity</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {entities.map(entity => (
            <Card key={entity.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedEntity(entity)}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{entity.entity_name}</span>
                  <Badge variant={entity.status === 'active' ? 'default' : 'secondary'}>
                    {entity.status}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p><strong>Type:</strong> {getEntityTypeLabel(entity.entity_type)}</p>
                  <p><strong>State:</strong> {entity.state}</p>
                  <p><strong>Formed:</strong> {new Date(entity.formation_date).toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}