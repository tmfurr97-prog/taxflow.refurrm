import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { BackupCard } from '@/components/BackupCard';
import { useToast } from '@/hooks/use-toast';
import { Download, RefreshCw, Database, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function Backups() {
  const [backups, setBackups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchBackups();
  }, []);

  const fetchBackups = async () => {
    try {
      const { data, error } = await supabase
        .from('backup_history')
        .select('*')
        .order('backup_date', { ascending: false });

      if (error) throw error;
      setBackups(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const createBackup = async () => {
    setCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-database-backup', {
        body: { backupType: 'manual' }
      });

      if (error) throw error;

      toast({
        title: 'Backup Created',
        description: `Successfully backed up ${data.totalRecords} records`
      });

      fetchBackups();
    } catch (error: any) {
      toast({
        title: 'Backup Failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setCreating(false);
    }
  };

  const downloadFile = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('database-backups')
        .download(filePath);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: 'Download Started',
        description: `Downloading ${fileName}`
      });
    } catch (error: any) {
      toast({
        title: 'Download Failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Database className="h-8 w-8 text-blue-600" />
            Database Backups
          </h1>
          <p className="text-gray-600 mt-2">
            Export and download your tax data as CSV files
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={fetchBackups} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={createBackup} disabled={creating}>
            <Download className="h-4 w-4 mr-2" />
            {creating ? 'Creating...' : 'Create Backup'}
          </Button>
        </div>
      </div>

      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Backups include all your receipts, vehicles, estimated tax payments, and tax forms.
          Files are stored securely and only accessible by you.
        </AlertDescription>
      </Alert>

      {loading ? (
        <div className="text-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400" />
        </div>
      ) : backups.length === 0 ? (
        <div className="text-center py-12">
          <Database className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No backups yet</h3>
          <p className="text-gray-600 mb-4">Create your first backup to get started</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {backups.map((backup) => (
            <BackupCard
              key={backup.id}
              backup={backup}
              onDownload={downloadFile}
            />
          ))}
        </div>
      )}
    </div>
  );
}
