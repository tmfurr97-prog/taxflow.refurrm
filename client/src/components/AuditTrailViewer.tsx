import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function AuditTrailViewer() {
  const [documentation, setDocumentation] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const { toast } = useToast();

  useEffect(() => {
    loadAuditTrail();
  }, [selectedYear]);

  const loadAuditTrail = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('audit_documentation')
        .select('*, receipts(*)')
        .eq('user_id', user.id)
        .eq('tax_year', selectedYear)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocumentation(data || []);
    } catch (error: any) {
      toast({
        title: 'Error loading audit trail',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const exportAuditPackage = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('export-audit-package', {
        body: { taxYear: selectedYear },
      });

      if (error) throw error;

      toast({
        title: 'Audit package generated',
        description: 'Your audit-ready documentation package is ready for download.',
      });
    } catch (error: any) {
      toast({
        title: 'Export failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const categoryTotals = documentation.reduce((acc, doc) => {
    acc[doc.category] = (acc[doc.category] || 0) + parseFloat(doc.amount);
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          {[2024, 2023, 2022].map((year) => (
            <Button
              key={year}
              variant={selectedYear === year ? 'default' : 'outline'}
              onClick={() => setSelectedYear(year)}
            >
              {year}
            </Button>
          ))}
        </div>
        <Button onClick={exportAuditPackage}>
          <Download className="h-4 w-4 mr-2" />
          Export Audit Package
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {Object.entries(categoryTotals).map(([category, total]) => (
          <Card key={category}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">{category}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${(total as any).toFixed(2)}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Deduction Documentation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {documentation.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{doc.description}</p>
                    <p className="text-sm text-muted-foreground">{doc.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold">${parseFloat(doc.amount).toFixed(2)}</p>
                    {doc.risk_score > 70 && (
                      <Badge variant="destructive" className="mt-1">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        High Risk
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
