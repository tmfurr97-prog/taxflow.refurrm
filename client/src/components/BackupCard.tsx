import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Database, Calendar, HardDrive } from 'lucide-react';

interface BackupCardProps {
  backup: {
    id: string;
    backup_date: string;
    backup_type: string;
    tables_included: string[];
    total_records: number;
    file_paths: Record<string, string>;
    status: string;
  };
  onDownload: (filePath: string, fileName: string) => void;
}

export function BackupCard({ backup, onDownload }: BackupCardProps) {
  const date = new Date(backup.backup_date);
  const formattedDate = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Database className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Backup {backup.id.slice(0, 8)}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
              <Calendar className="h-4 w-4" />
              {formattedDate}
            </div>
          </div>
        </div>
        <Badge variant={backup.backup_type === 'automatic' ? 'default' : 'secondary'}>
          {backup.backup_type}
        </Badge>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <HardDrive className="h-4 w-4 text-gray-500" />
          <span className="text-gray-600">
            {backup.total_records} records across {backup.tables_included.length} tables
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {Object.entries(backup.file_paths).map(([name, path]) => (
            <Button
              key={name}
              size="sm"
              variant="outline"
              onClick={() => onDownload(path, `${name}.csv`)}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              {name}.csv
            </Button>
          ))}
        </div>
      </div>
    </Card>
  );
}
