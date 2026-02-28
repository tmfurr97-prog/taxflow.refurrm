import { AuditDefenseHub } from '@/components/AuditDefenseHub';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, FileText, AlertTriangle } from 'lucide-react';
import { FeatureGate } from '@/components/FeatureGate';
import { trpc } from '@/lib/trpc';

export default function AuditDefense() {
  const { data: auditItems = [] } = trpc.audit.list.useQuery();
  const { data: receipts = [] } = trpc.receipts.list.useQuery({});

  const irsLetters = auditItems.filter((a: any) => a.type === 'irs_letter').length;
  const docCount = receipts.length;

  return (
    <FeatureGate feature="audit_defense" fullPage upgradeMessage="Audit Defense is available on the Pro plan. Get IRS correspondence tracking, audit trail, and professional support.">
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">IRS Audit Defense</h1>
          <p className="text-gray-600">Complete audit trail, IRS correspondence tracking, and professional collaboration</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-600" />
                Audit Risk
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-400">—</div>
              <p className="text-xs text-muted-foreground">Add documents to calculate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4 text-purple-600" />
                Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{docCount}</div>
              <p className="text-xs text-muted-foreground">Audit-ready docs</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                IRS Letters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{irsLetters}</div>
              <p className="text-xs text-muted-foreground">Active correspondence</p>
            </CardContent>
          </Card>
        </div>

        <AuditDefenseHub />
      </div>
    </div>
    </FeatureGate>
  );
}
