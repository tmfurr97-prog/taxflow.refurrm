import React, { useState, useEffect } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Building2, CreditCard, RefreshCw, Trash2, CheckCircle, Wallet } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from './ui/use-toast';

interface BankConnection {
  id: string;
  institution_name: string;
  account_count: number;
  created_at: string;
  item_id: string;
}

export function PlaidConnection() {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [connections, setConnections] = useState<BankConnection[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    const { data, error } = await supabase
      .from('bank_connections')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setConnections(data);
  };

  const createLinkToken = async (institution?: string) => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await supabase.functions.invoke('plaid-create-link-token', {
        headers: { Authorization: `Bearer ${session?.access_token}` },
        body: institution ? { institution } : {}
      });
      
      if (response.data?.link_token) {
        setLinkToken(response.data.link_token);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to initialize bank connection',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: async (public_token, metadata) => {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await supabase.functions.invoke('plaid-exchange-token', {
        body: { public_token, metadata },
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });

      if (response.data?.success) {
        toast({
          title: 'Success',
          description: 'Account connected successfully',
        });
        fetchConnections();
        syncTransactions();
      }
    },
  });

  useEffect(() => {
    if (ready && linkToken) {
      open();
    }
  }, [ready, linkToken, open]);

  const syncTransactions = async () => {
    setSyncing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await supabase.functions.invoke('plaid-sync-transactions', {
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });

      if (response.data?.success) {
        toast({
          title: 'Transactions Synced',
          description: `${response.data.transactions_synced} transactions imported`,
        });
      }
    } catch (error) {
      toast({
        title: 'Sync Failed',
        description: 'Failed to sync transactions',
        variant: 'destructive',
      });
    } finally {
      setSyncing(false);
    }
  };

  const removeConnection = async (itemId: string) => {
    const { error } = await supabase
      .from('bank_connections')
      .delete()
      .eq('item_id', itemId);

    if (!error) {
      toast({
        title: 'Connection Removed',
        description: 'Bank connection has been removed',
      });
      fetchConnections();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bank & Payment Connections</CardTitle>
        <CardDescription>Connect your bank accounts and payment services to automatically import transactions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Button onClick={() => createLinkToken()} disabled={loading} className="h-auto py-4 flex-col gap-2">
            <Building2 className="h-6 w-6" />
            <span className="font-semibold">Bank Account</span>
            <span className="text-xs opacity-80">Chase, Wells Fargo, etc.</span>
          </Button>
          
          <Button onClick={() => createLinkToken('paypal')} disabled={loading} variant="outline" className="h-auto py-4 flex-col gap-2 border-blue-200 hover:bg-blue-50">
            <Wallet className="h-6 w-6 text-blue-600" />
            <span className="font-semibold text-blue-600">PayPal</span>
            <span className="text-xs text-gray-600">Connect PayPal account</span>
          </Button>
          
          <Button onClick={() => createLinkToken('cashapp')} disabled={loading} variant="outline" className="h-auto py-4 flex-col gap-2 border-green-200 hover:bg-green-50">
            <CreditCard className="h-6 w-6 text-green-600" />
            <span className="font-semibold text-green-600">Cash App</span>
            <span className="text-xs text-gray-600">Connect Cash App</span>
          </Button>
        </div>

        <div className="flex gap-3">
          <Button onClick={syncTransactions} variant="outline" disabled={syncing || connections.length === 0} className="flex-1">
            <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
            Sync All Transactions
          </Button>
        </div>

        {connections.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-gray-700">Connected Accounts</h4>
            {connections.map((connection) => (
              <div key={connection.id} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">{connection.institution_name}</p>
                    <p className="text-sm text-gray-500">{connection.account_count} accounts connected</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Active
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeConnection(connection.item_id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {connections.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Wallet className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No accounts connected yet</p>
            <p className="text-xs mt-1">Connect your bank or payment service to get started</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
