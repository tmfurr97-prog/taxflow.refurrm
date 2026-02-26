import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { CheckCircle2, Clock, XCircle, Loader2, Download, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface EFileStatus {
  id: string;
  submission_id: string;
  status: string;
  submission_type: string;
  state_code?: string;
  irs_acknowledgment?: string;
  state_acknowledgment?: string;
  submission_date: string;
  acknowledgment_date?: string;
  rejection_reason?: string;
  tax_forms: {
    form_type: string;
    tax_year: number;
  };
}

export function EFileStatusTracker() {
  const [submissions, setSubmissions] = useState<EFileStatus[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from('efile_submissions')
        .select(`
          *,
          tax_forms (
            form_type,
            tax_year
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error: any) {
      toast.error('Failed to load e-file submissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'submitted':
      case 'processing':
        return <Clock className="h-5 w-5 text-blue-600" />;
      default:
        return <Loader2 className="h-5 w-5 text-gray-600 animate-spin" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: any = {
      accepted: 'default',
      rejected: 'destructive',
      submitted: 'secondary',
      processing: 'secondary',
      pending: 'outline'
    };
    return <Badge variant={variants[status] || 'outline'}>{status.toUpperCase()}</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>E-File Status</CardTitle>
            <CardDescription>Track your electronic filing submissions</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={loadSubmissions}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {submissions.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No e-file submissions yet</p>
        ) : (
          <div className="space-y-4">
            {submissions.map((submission) => (
              <div key={submission.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(submission.status)}
                    <div>
                      <div className="font-medium">
                        {submission.tax_forms.form_type} - {submission.tax_forms.tax_year}
                      </div>
                      <div className="text-sm text-gray-500">
                        {submission.submission_id}
                      </div>
                    </div>
                  </div>
                  {getStatusBadge(submission.status)}
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Type:</span>{' '}
                    <span className="font-medium">{submission.submission_type}</span>
                  </div>
                  {submission.state_code && (
                    <div>
                      <span className="text-gray-500">State:</span>{' '}
                      <span className="font-medium">{submission.state_code}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-500">Submitted:</span>{' '}
                    <span>{new Date(submission.submission_date).toLocaleDateString()}</span>
                  </div>
                  {submission.acknowledgment_date && (
                    <div>
                      <span className="text-gray-500">Acknowledged:</span>{' '}
                      <span>{new Date(submission.acknowledgment_date).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                {submission.irs_acknowledgment && (
                  <div className="text-xs text-gray-600">
                    IRS ACK: {submission.irs_acknowledgment}
                  </div>
                )}

                {submission.rejection_reason && (
                  <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                    {submission.rejection_reason}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
