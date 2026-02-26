import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Download } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function CryptoTransactionImporter() {
  const [exchanges, setExchanges] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadExchanges();
  }, []);

  const loadExchanges = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data } = await supabase
      .from('crypto_exchanges')
      .select('*')
      .eq('user_id', user?.id)
      .eq('is_active', true);
    setExchanges(data || []);
  };

  const handleImport = async (exchangeId: string) => {
    setLoading(true);
    const { data, error } = await supabase.functions.invoke('import-crypto-transactions', {
      body: { exchangeId },
    });

    setLoading(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: `Imported ${data.count} transactions` });
      loadExchanges();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Exchange</TableHead>
              <TableHead>Last Sync</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {exchanges.map((ex) => (
              <TableRow key={ex.id}>
                <TableCell className="font-medium capitalize">{ex.exchange_name}</TableCell>
                <TableCell>{ex.last_sync ? new Date(ex.last_sync).toLocaleDateString() : 'Never'}</TableCell>
                <TableCell>
                  <Button size="sm" onClick={() => handleImport(ex.id)} disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}