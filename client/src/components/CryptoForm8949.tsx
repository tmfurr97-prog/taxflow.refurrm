import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Loader2, FileText } from 'lucide-react';

export function CryptoForm8949() {
  const [taxYear, setTaxYear] = useState('2024');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    setLoading(true);
    const { data, error } = await supabase.functions.invoke('generate-form-8949', {
      body: { taxYear: parseInt(taxYear) },
    });

    setLoading(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      const blob = new Blob([data.pdf], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Form-8949-${taxYear}.pdf`;
      a.click();
      toast({ title: 'Success', description: 'Form 8949 generated' });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate Form 8949</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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
        <Button onClick={handleGenerate} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
          Generate Form 8949
        </Button>
        <p className="text-sm text-muted-foreground">
          This will generate IRS Form 8949 with all your crypto transactions for the selected tax year.
        </p>
      </CardContent>
    </Card>
  );
}