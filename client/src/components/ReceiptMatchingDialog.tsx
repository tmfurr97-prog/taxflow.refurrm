import { useState, useEffect } from 'react';
import { Check, X, AlertCircle, Link as LinkIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface Match {
  transaction: any;
  confidence: number;
  score: number;
  reasons: string[];
  amountDiff: number;
  daysDiff: number;
}

interface ReceiptMatchingDialogProps {
  receipt: any;
  open: boolean;
  onClose: () => void;
  onMatched: () => void;
}

export function ReceiptMatchingDialog({ receipt, open, onClose, onMatched }: ReceiptMatchingDialogProps) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open && receipt) {
      findMatches();
    }
  }, [open, receipt]);

  const findMatches = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase.functions.invoke('match-receipts-to-transactions', {
        body: {
          receiptId: receipt.id,
          receiptAmount: receipt.amount,
          receiptDate: receipt.receipt_date,
          userId: user?.id
        }
      });

      if (error) throw error;
      setMatches(data.matches || []);
    } catch (error: any) {
      toast({
        title: 'Error finding matches',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const confirmMatch = async (match: Match) => {
    try {
      const { error: receiptError } = await supabase
        .from('receipts')
        .update({
          transaction_id: match.transaction.id,
          match_confidence: match.confidence,
          match_status: 'matched',
          match_reasons: match.reasons
        })
        .eq('id', receipt.id);

      if (receiptError) throw receiptError;

      const { error: txnError } = await supabase
        .from('transactions')
        .update({
          receipt_url: receipt.image_url,
          is_tax_deductible: receipt.is_deductible,
          tax_category: receipt.tax_category
        })
        .eq('id', match.transaction.id);

      if (txnError) throw txnError;

      toast({ title: 'Receipt matched successfully' });
      onMatched();
      onClose();
    } catch (error: any) {
      toast({
        title: 'Error confirming match',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const rejectMatch = async () => {
    try {
      const { error } = await supabase
        .from('receipts')
        .update({ match_status: 'no_match' })
        .eq('id', receipt.id);

      if (error) throw error;
      toast({ title: 'Match rejected' });
      onMatched();
      onClose();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Match Receipt to Transaction</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Card className="p-4 bg-blue-50">
            <h3 className="font-semibold mb-2">Receipt Details</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Vendor</p>
                <p className="font-medium">{receipt?.vendor_name}</p>
              </div>
              <div>
                <p className="text-gray-500">Amount</p>
                <p className="font-medium">${receipt?.amount?.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-gray-500">Date</p>
                <p className="font-medium">{receipt?.receipt_date}</p>
              </div>
            </div>
          </Card>

          {loading ? (
            <div className="text-center py-8">Finding matches...</div>
          ) : matches.length === 0 ? (
            <Card className="p-8 text-center">
              <AlertCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 mb-4">No matching transactions found</p>
              <Button onClick={rejectMatch} variant="outline">
                Mark as No Match
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              <h3 className="font-semibold">Suggested Matches</h3>
              {matches.map((match, idx) => (
                <Card key={idx} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={match.confidence > 0.8 ? 'default' : match.confidence > 0.5 ? 'secondary' : 'outline'}>
                          {(match.confidence * 100).toFixed(0)}% Match
                        </Badge>
                        <span className="text-sm font-medium">{match.transaction.name}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm mb-2">
                        <div>
                          <p className="text-gray-500">Amount</p>
                          <p className="font-medium">${Math.abs(match.transaction.amount).toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Date</p>
                          <p className="font-medium">{match.transaction.date}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Merchant</p>
                          <p className="font-medium">{match.transaction.merchant_name || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {match.reasons.map((reason, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {reason}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button size="sm" onClick={() => confirmMatch(match)}>
                        <Check className="w-4 h-4 mr-1" />
                        Confirm
                      </Button>
                      <Button size="sm" variant="outline" onClick={rejectMatch}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}