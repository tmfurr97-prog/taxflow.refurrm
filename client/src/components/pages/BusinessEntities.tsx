import { useMemo } from 'react';
import EntityDashboard from '@/components/EntityDashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, AlertCircle } from 'lucide-react';
import { FeatureGate } from '@/components/FeatureGate';
import { trpc } from '@/lib/trpc';

export default function BusinessEntities() {
  const { data: entities = [] } = trpc.entities.list.useQuery();

  const entityCount = entities.length;
  const upcomingDeadlines = entities.filter((e: any) =>
    e.nextFilingDate && new Date(e.nextFilingDate) > new Date()
  ).length;

  return (
    <FeatureGate feature="business_entities" fullPage upgradeMessage="Business Entity Management is available on the Pro plan. Manage LLCs, S-Corps, and multi-entity compliance.">
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Business Entity Management</h1>
          <p className="text-gray-600">Manage your business entities, compliance, and tax optimization</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Building2 className="h-4 w-4 text-blue-600" />
                Entities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{entityCount}</div>
              <p className="text-xs text-muted-foreground">Active entities</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                Upcoming Deadlines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingDeadlines}</div>
              <p className="text-xs text-muted-foreground">Filing deadlines ahead</p>
            </CardContent>
          </Card>
        </div>

        <EntityDashboard />
      </div>
    </div>
    </FeatureGate>
  );
}
