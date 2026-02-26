import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { FileText, Eye, MessageSquare, Download } from 'lucide-react';

interface Document {
  id: string;
  name: string;
  category: string;
  amount: number;
  date: string;
  shared: boolean;
  comments: number;
}

export function SharedDocuments({ onComment }: { onComment: (docId: string) => void }) {
  const [docs, setDocs] = useState<Document[]>([
    { id: '1', name: 'Office Supplies Receipt', category: 'Office Expenses', amount: 127.50, date: '2024-11-01', shared: true, comments: 2 },
    { id: '2', name: 'Software Subscription', category: 'Software', amount: 299.00, date: '2024-11-03', shared: true, comments: 0 },
    { id: '3', name: 'Client Lunch', category: 'Meals & Entertainment', amount: 85.00, date: '2024-11-05', shared: false, comments: 1 },
  ]);

  const toggleShare = (id: string) => {
    setDocs(docs.map(d => d.id === id ? { ...d, shared: !d.shared } : d));
  };

  return (
    <div className="space-y-3">
      {docs.map((doc) => (
        <Card key={doc.id}>
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <Checkbox checked={doc.shared} onCheckedChange={() => toggleShare(doc.id)} />
              <FileText className="h-5 w-5 text-[#50E3E3] mt-0.5" />
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium">{doc.name}</h4>
                    <p className="text-sm text-muted-foreground">{doc.category}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">${doc.amount.toFixed(2)}</Badge>
                      <span className="text-xs text-muted-foreground">{doc.date}</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => onComment(doc.id)}>
                      <MessageSquare className="h-4 w-4" />
                      {doc.comments > 0 && <span className="ml-1 text-xs">{doc.comments}</span>}
                    </Button>
                    <Button variant="ghost" size="sm"><Download className="h-4 w-4" /></Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
