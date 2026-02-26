import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { AlertTriangle, Trash2, Merge, X, Calendar, DollarSign, Store } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface DuplicateMatch {
  receiptId: string;
  matchScore: number;
  reasons: string[];
  receipt: {
    id: string;
    amount: number;
    date: string;
    merchantName: string;
    category: string;
    imageUrl: string;
    createdAt: string;
  };
}

interface DuplicateReceiptsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentReceiptId: string;
  duplicates: DuplicateMatch[];
  onResolved: () => void;
}

export function DuplicateReceiptsDialog({
  open,
  onOpenChange,
  currentReceiptId,
  duplicates,
  onResolved
}: DuplicateReceiptsDialogProps) {
  const [processing, setProcessing] = useState(false);

  const handleDelete = async (duplicateId: string) => {
    setProcessing(true);
    try {
      const { error } = await supabase
        .from('receipts')
        .delete()
        .eq('id', duplicateId);

      if (error) throw error;

      toast.success('Duplicate receipt deleted');
      onResolved();
    } catch (error) {
      toast.error('Failed to delete receipt');
      console.error(error);
    } finally {
      setProcessing(false);
    }
  };

  const handleKeepBoth = () => {
    toast.info('Keeping both receipts');
    onOpenChange(false);
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return 'bg-red-500';
    if (score >= 60) return 'bg-orange-500';
    return 'bg-yellow-500';
  };

  const getConfidenceLabel = (score: number) => {
    if (score >= 80) return 'High';
    if (score >= 60) return 'Medium';
    return 'Low';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-orange-500" />
            <DialogTitle>Potential Duplicate Receipts Detected</DialogTitle>
          </div>
          <DialogDescription>
            We found {duplicates.length} receipt{duplicates.length > 1 ? 's' : ''} that may be duplicates.
            Review and choose to keep or delete them.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {duplicates.map((duplicate) => (
            <Card key={duplicate.receiptId} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge className={getConfidenceColor(duplicate.matchScore)}>
                      {getConfidenceLabel(duplicate.matchScore)} Match ({duplicate.matchScore}%)
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Uploaded {new Date(duplicate.receipt.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold">${duplicate.receipt.amount.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{new Date(duplicate.receipt.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Store className="h-4 w-4 text-muted-foreground" />
                      <span>{duplicate.receipt.merchantName}</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-1">Match Reasons:</p>
                    <div className="flex flex-wrap gap-2">
                      {duplicate.reasons.map((reason, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {reason}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {duplicate.receipt.imageUrl && (
                    <img
                      src={duplicate.receipt.imageUrl}
                      alt="Receipt"
                      className="w-32 h-32 object-cover rounded border"
                    />
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(duplicate.receiptId)}
                    disabled={processing}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
          <Button variant="outline" onClick={handleKeepBoth}>
            <X className="h-4 w-4 mr-1" />
            Keep All
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}