import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export function CryptoExchangeConnector({ onConnected }: { onConnected: () => void }) {
  const [exchange, setExchange] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleConnect = async () => {
    if (!exchange || !apiKey || !apiSecret) {
      toast({ title: 'Error', description: 'Please fill in all fields', variant: 'destructive' });
      return;
    }

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase.from('crypto_exchanges').insert({
      user_id: user?.id,
      exchange_name: exchange,
      api_key_encrypted: apiKey,
      api_secret_encrypted: apiSecret,
    });

    setLoading(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Exchange connected successfully' });
      setExchange('');
      setApiKey('');
      setApiSecret('');
      onConnected();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connect Exchange</CardTitle>
        <CardDescription>Connect your crypto exchange to import transactions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Exchange</Label>
          <Select value={exchange} onValueChange={setExchange}>
            <SelectTrigger>
              <SelectValue placeholder="Select exchange" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="coinbase">Coinbase</SelectItem>
              <SelectItem value="binance">Binance</SelectItem>
              <SelectItem value="kraken">Kraken</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>API Key</Label>
          <Input value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
        </div>
        <div>
          <Label>API Secret</Label>
          <Input type="password" value={apiSecret} onChange={(e) => setApiSecret(e.target.value)} />
        </div>
        <Button onClick={handleConnect} disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Connect Exchange
        </Button>
      </CardContent>
    </Card>
  );
}