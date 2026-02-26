import { MessageSquare, FileText, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Activity {
  id: string;
  type: 'comment' | 'request' | 'approval' | 'document';
  user: string;
  message: string;
  timestamp: Date;
  status?: string;
}

export function CollaborationActivity({ activities }: { activities: Activity[] }) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'comment': return <MessageSquare className="h-4 w-4" />;
      case 'request': return <AlertCircle className="h-4 w-4" />;
      case 'approval': return <CheckCircle className="h-4 w-4" />;
      case 'document': return <FileText className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <Card key={activity.id}>
          <CardContent className="pt-4">
            <div className="flex gap-3">
              <div className="text-[#50E3E3]">{getIcon(activity.type)}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">{activity.user}</span>
                  <span className="text-xs text-muted-foreground">
                    {activity.timestamp.toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{activity.message}</p>
                {activity.status && (
                  <Badge variant="outline" className="mt-2">{activity.status}</Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
