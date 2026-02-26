import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, XCircle, Loader2 } from 'lucide-react';

interface EFileRealtimeStatusProps {
  submissionId: string;
}

export function EFileRealtimeStatus({ submissionId }: EFileRealtimeStatusProps) {
  const [status, setStatus] = useState<any>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      const { data } = await supabase
        .from('efile_submissions')
        .select('*')
        .eq('submission_id', submissionId)
        .single();
      if (data) setStatus(data);
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);

    const channel = supabase
      .channel('efile-status')
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'efile_submissions', filter: `submission_id=eq.${submissionId}` },
        (payload: any) => setStatus(payload.new)
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      channel.unsubscribe();
    };
  }, [submissionId]);

  if (!status) return <Loader2 className="h-4 w-4 animate-spin" />;

  const getIcon = () => {
    switch (status.status) {
      case 'accepted': return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'rejected': return <XCircle className="h-5 w-5 text-red-600" />;
      default: return <Clock className="h-5 w-5 text-blue-600" />;
    }
  };

  return (
    <div className="flex items-center gap-2">
      {getIcon()}
      <Badge>{status.status.toUpperCase()}</Badge>
    </div>
  );
}
