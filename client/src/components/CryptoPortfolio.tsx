import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';

interface Holding {
  asset: string;
  quantity: number;
  avgCostBasis: number;
  totalCostBasis: number;
  currentValue: number;
  gainLoss: number;
  gainLossPercent: number;
}

export function CryptoPortfolio() {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHoldings();
  }, []);

  const loadHoldings = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data } = await supabase
      .from('crypto_tax_lots')
      .select('*')
      .eq('user_id', user?.id)
      .gt('remaining_quantity', 0);

    const holdingsMap = new Map<string, Holding>();
    data?.forEach((lot: any) => {
      const existing = holdingsMap.get(lot.crypto_asset);
      if (existing) {
        existing.quantity += parseFloat(lot.remaining_quantity);
        existing.totalCostBasis += parseFloat(lot.cost_basis_usd);
      } else {
        holdingsMap.set(lot.crypto_asset, {
          asset: lot.crypto_asset,
          quantity: parseFloat(lot.remaining_quantity),
          avgCostBasis: 0,
          totalCostBasis: parseFloat(lot.cost_basis_usd),
          currentValue: 0,
          gainLoss: 0,
          gainLossPercent: 0,
        });
      }
    });

    holdingsMap.forEach((h) => {
      h.avgCostBasis = h.totalCostBasis / h.quantity;
    });

    setHoldings(Array.from(holdingsMap.values()));
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Crypto Portfolio</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Asset</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Avg Cost Basis</TableHead>
              <TableHead>Total Cost Basis</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {holdings.map((h) => (
              <TableRow key={h.asset}>
                <TableCell className="font-medium">{h.asset}</TableCell>
                <TableCell>{h.quantity.toFixed(8)}</TableCell>
                <TableCell>${h.avgCostBasis.toFixed(2)}</TableCell>
                <TableCell>${h.totalCostBasis.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}