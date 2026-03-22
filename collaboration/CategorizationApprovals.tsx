import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Tag } from 'lucide-react';

interface Categorization {
  id: string;
  document: string;
  suggestedCategory: string;
  currentCategory: string;
  amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
}

export function CategorizationApprovals() {
  const [items, setItems] = useState<Categorization[]>([
    { id: '1', document: 'Amazon Purchase', suggestedCategory: 'Office Supplies', currentCategory: 'Miscellaneous', amount: 145.00, reason: 'Items appear to be office supplies based on description', status: 'pending' },
    { id: '2', document: 'Starbucks Receipt', suggestedCategory: 'Meals & Entertainment', currentCategory: 'Office Expenses', amount: 12.50, reason: 'Coffee purchases should be categorized as meals', status: 'pending' },
  ]);

  const handleApprove = (id: string) => {
    setItems(items.map(i => i.id === id ? { ...i, status: 'approved' as const } : i));
  };

  const handleReject = (id: string) => {
    setItems(items.map(i => i.id === id ? { ...i, status: 'rejected' as const } : i));
  };

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <Card key={item.id}>
          <CardContent className="pt-4">
            <div className="flex gap-3">
              <Tag className="h-5 w-5 text-[#50E3E3] mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium mb-1">{item.document}</h4>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">${item.amount.toFixed(2)}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {item.currentCategory} → {item.suggestedCategory}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{item.reason}</p>
                {item.status === 'pending' ? (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleApprove(item.id)}>
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleReject(item.id)}>
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                ) : (
                  <Badge variant={item.status === 'approved' ? 'default' : 'secondary'}>
                    {item.status}
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
