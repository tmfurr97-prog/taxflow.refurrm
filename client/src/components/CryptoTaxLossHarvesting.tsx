import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { TrendingDown } from 'lucide-react';

interface Opportunity {
  asset: string;
  currentLoss: number;
  quantity: number;
  taxSavings: number;
  washSaleRisk: boolean;
}

export function CryptoTaxLossHarvesting() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadOpportunities();
  }, []);

  const loadOpportunities = async () => {
    const { data, error } = await supabase.functions.invoke('identify-tax-loss-harvesting');
    
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setOpportunities(data.opportunities || []);
    }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingDown className="h-5 w-5" />
          Tax Loss Harvesting Opportunities
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Asset</TableHead>
              <TableHead>Unrealized Loss</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Tax Savings</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {opportunities.map((opp, idx) => (
              <TableRow key={idx}>
                <TableCell className="font-medium">{opp.asset}</TableCell>
                <TableCell className="text-red-600">-${Math.abs(opp.currentLoss).toFixed(2)}</TableCell>
                <TableCell>{opp.quantity.toFixed(8)}</TableCell>
                <TableCell className="text-green-600">${opp.taxSavings.toFixed(2)}</TableCell>
                <TableCell>
                  {opp.washSaleRisk ? (
                    <Badge variant="destructive">Wash Sale Risk</Badge>
                  ) : (
                    <Badge variant="secondary">Safe</Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}