import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, FileText, CreditCard, RefreshCw } from 'lucide-react';
import { MatchedPairCard } from './MatchedPairCard';
import { matchTransactionsWithReceipts, type Transaction, type Receipt, type MatchedPair } from '@/utils/transactionMatching';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function TransactionMatching() {
  const [matched, setMatched] = useState<MatchedPair[]>([]);
  const [unmatchedTransactions, setUnmatchedTransactions] = useState<Transaction[]>([]);
  const [unmatchedReceipts, setUnmatchedReceipts] = useState<Receipt[]>([]);
  const [isMatching, setIsMatching] = useState(false);

  // Mock data - replace with real data from Supabase
  const mockTransactions: Transaction[] = [
    { id: '1', date: '2024-11-01', amount: 45.99, merchant: 'Office Depot', description: 'Office supplies', source: 'Chase' },
    { id: '2', date: '2024-11-02', amount: 125.50, merchant: 'Amazon', description: 'Business equipment', source: 'PayPal' },
    { id: '3', date: '2024-11-03', amount: 89.00, merchant: 'Staples', description: 'Printer paper', source: 'Cash App' },
    { id: '4', date: '2024-11-04', amount: 250.00, merchant: 'Dell', description: 'Computer parts', source: 'Chase' },
  ];

  const mockReceipts: Receipt[] = [
    { id: 'r1', date: '2024-11-01', amount: 45.99, merchant: 'Office Depot', category: 'Office Supplies' },
    { id: 'r2', date: '2024-11-02', amount: 125.50, merchant: 'Amazon', category: 'Equipment' },
    { id: 'r3', date: '2024-11-05', amount: 75.00, merchant: 'FedEx', category: 'Shipping' },
  ];

  const runMatching = () => {
    setIsMatching(true);
    setTimeout(() => {
      const results = matchTransactionsWithReceipts(mockTransactions, mockReceipts);
      setMatched(results);
      setUnmatchedTransactions([]);
      setUnmatchedReceipts([]);
      setIsMatching(false);
    }, 1000);
  };

  useEffect(() => {
    runMatching();
  }, []);

  const handleUnmatch = (transactionId: string) => {
    const pair = matched.find(p => p.transaction.id === transactionId);
    if (pair) {
      setMatched(matched.filter(p => p.transaction.id !== transactionId));
      setUnmatchedTransactions([...unmatchedTransactions, pair.transaction]);
      setUnmatchedReceipts([...unmatchedReceipts, pair.receipt]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Transaction Matching</h2>
          <p className="text-muted-foreground mt-1">
            Automatically link bank transactions with receipts
          </p>
        </div>
        <Button onClick={runMatching} disabled={isMatching}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isMatching ? 'animate-spin' : ''}`} />
          Re-match All
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Matched</p>
              <p className="text-3xl font-bold text-green-600">{matched.length}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Missing Receipts</p>
              <p className="text-3xl font-bold text-orange-600">{unmatchedTransactions.length}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Unmatched Receipts</p>
              <p className="text-3xl font-bold text-blue-600">{unmatchedReceipts.length}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="matched" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="matched">
            Matched ({matched.length})
          </TabsTrigger>
          <TabsTrigger value="missing-receipts">
            Missing Receipts ({unmatchedTransactions.length})
          </TabsTrigger>
          <TabsTrigger value="unmatched-receipts">
            Unmatched Receipts ({unmatchedReceipts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="matched" className="space-y-4 mt-4">
          {matched.length === 0 ? (
            <Alert>
              <AlertDescription>No matched transactions found. Upload receipts to start matching.</AlertDescription>
            </Alert>
          ) : (
            matched.map(pair => (
              <MatchedPairCard key={pair.transaction.id} pair={pair} onUnmatch={handleUnmatch} />
            ))
          )}
        </TabsContent>

        <TabsContent value="missing-receipts" className="space-y-4 mt-4">
          {unmatchedTransactions.map(transaction => (
            <Card key={transaction.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{transaction.source}</Badge>
                    <Badge variant="destructive">Missing Receipt</Badge>
                  </div>
                  <p className="font-semibold">{transaction.merchant}</p>
                  <p className="text-sm text-muted-foreground">{transaction.description}</p>
                  <p className="text-sm">{new Date(transaction.date).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">${transaction.amount.toFixed(2)}</p>
                  <Button size="sm" className="mt-2">Upload Receipt</Button>
                </div>
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="unmatched-receipts" className="space-y-4 mt-4">
          {unmatchedReceipts.map(receipt => (
            <Card key={receipt.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge>{receipt.category}</Badge>
                    <Badge variant="secondary">No Transaction</Badge>
                  </div>
                  <p className="font-semibold">{receipt.merchant}</p>
                  <p className="text-sm">{new Date(receipt.date).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">${receipt.amount.toFixed(2)}</p>
                  <Button size="sm" variant="outline" className="mt-2">Review</Button>
                </div>
              </div>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
