import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, FileText, AlertTriangle, Users } from 'lucide-react';
import { AuditTrailViewer } from './AuditTrailViewer';
import { IRSCorrespondenceTracker } from './IRSCorrespondenceTracker';
import { AuditRiskDashboard } from './AuditRiskDashboard';
import { TaxProfessionalCollaboration } from './TaxProfessionalCollaboration';

export function AuditDefenseHub() {
  const [activeTab, setActiveTab] = useState('trail');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Audit Defense Center</h2>
          <p className="text-muted-foreground mt-1">
            Complete audit trail and IRS correspondence management
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trail" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Audit Trail
          </TabsTrigger>
          <TabsTrigger value="correspondence" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            IRS Correspondence
          </TabsTrigger>
          <TabsTrigger value="risk" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Risk Analysis
          </TabsTrigger>
          <TabsTrigger value="professionals" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Tax Professionals
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trail" className="mt-6">
          <AuditTrailViewer />
        </TabsContent>

        <TabsContent value="correspondence" className="mt-6">
          <IRSCorrespondenceTracker />
        </TabsContent>

        <TabsContent value="risk" className="mt-6">
          <AuditRiskDashboard />
        </TabsContent>

        <TabsContent value="professionals" className="mt-6">
          <TaxProfessionalCollaboration />
        </TabsContent>
      </Tabs>
    </div>
  );
}
