import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Upload } from 'lucide-react';

interface Request {
  id: string;
  from: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'completed';
  dueDate: string;
}

export function InformationRequests({ onRespond }: { onRespond: (id: string) => void }) {
  const requests: Request[] = [
    { id: '1', from: 'Sarah Johnson, CPA', title: 'Missing Q3 Mileage Logs', description: 'Please upload mileage logs for July-September 2024', priority: 'high', status: 'pending', dueDate: '2024-11-15' },
    { id: '2', from: 'Sarah Johnson, CPA', title: 'Home Office Documentation', description: 'Need proof of home office square footage and utility bills', priority: 'medium', status: 'pending', dueDate: '2024-11-20' },
    { id: '3', from: 'Sarah Johnson, CPA', title: '1099 Forms', description: 'Upload all 1099-NEC forms received', priority: 'high', status: 'completed', dueDate: '2024-11-10' },
  ];

  return (
    <div className="space-y-3">
      {requests.map((req) => (
        <Card key={req.id} className={req.status === 'completed' ? 'opacity-60' : ''}>
          <CardContent className="pt-4">
            <div className="flex gap-3">
              {req.status === 'pending' ? (
                <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5" />
              ) : (
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-medium">{req.title}</h4>
                    <p className="text-xs text-muted-foreground">From: {req.from}</p>
                  </div>
                  <Badge variant={req.priority === 'high' ? 'destructive' : 'outline'}>
                    {req.priority}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{req.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Due: {req.dueDate}</span>
                  {req.status === 'pending' && (
                    <Button size="sm" onClick={() => onRespond(req.id)}>
                      <Upload className="h-4 w-4 mr-1" />
                      Respond
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
