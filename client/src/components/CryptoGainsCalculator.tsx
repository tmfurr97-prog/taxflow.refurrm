import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Calculator } from 'lucide-react';

export function CryptoGainsCalculator() {
  const [method, setMethod] = useState('fifo');
  const [taxYear, setTaxYear] = useState('2024');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const { toast } = useToast();

  const handleCalculate = async () => {
    setLoading(true);
    const { data, error } = await supabase.functions.invoke('calculate-crypto-gains', {
      body: { method, taxYear: parseInt(taxYear) },
    });

    setLoading(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setResults(data);
      toast({ title: 'Success', description: 'Gains calculated successfully' });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Calculate Gains/Losses</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Calculation Method</Label>
          <Select value={method} onValueChange={setMethod}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fifo">FIFO (First In, First Out)</SelectItem>
              <SelectItem value="lifo">LIFO (Last In, First Out)</SelectItem>
              <SelectItem value="hifo">HIFO (Highest In, First Out)</SelectItem>
              <SelectItem value="specific">Specific Identification</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Tax Year</Label>
          <Select value={taxYear} onValueChange={setTaxYear}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="2022">2022</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleCalculate} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Calculator className="mr-2 h-4 w-4" />}
          Calculate Gains
        </Button>
        {results && (
          <div className="mt-4 p-4 bg-muted rounded-lg space-y-2">
            <div className="flex justify-between">
              <span>Short-term Gains:</span>
              <span className="font-bold">${results.shortTermGains?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Long-term Gains:</span>
              <span className="font-bold">${results.longTermGains?.toFixed(2)}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}