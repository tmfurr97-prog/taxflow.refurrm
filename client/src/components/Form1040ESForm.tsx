import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Download, Eye } from 'lucide-react';
import { TaxFormPreview } from './TaxFormPreview';
import { TaxYearSelector } from './TaxYearSelector';

export function Form1040ESForm() {
  const [taxYear, setTaxYear] = useState(new Date().getFullYear());

  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState({
    expected_agi: 0,
    expected_taxable_income: 0,
    expected_tax: 0,
    expected_credits: 0,
    other_taxes: 0,
    total_tax: 0,
    federal_income_tax_withheld: 0,
    estimated_tax_payments: 0,
    earned_income_credit: 0,
    amount_to_pay: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    calculateEstimates();
  }, []);

  const calculateEstimates = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: payments } = await supabase
        .from('estimated_tax_payments')
        .select('*')
        .eq('user_id', user.id);

      const totalPaid = payments?.reduce((sum: number, p: any) => sum + (p.amount || 0), 0) || 0;

      setFormData(prev => ({
        ...prev,
        estimated_tax_payments: totalPaid
      }));
    } catch (error) {
      console.error('Error calculating:', error);
    } finally {
      setCalculating(false);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-tax-form', {
        body: { formType: '1040-es', taxYear, formData }

      });

      if (error) throw error;

      toast({ title: 'Form generated!', description: 'Your Form 1040-ES is ready.' });
      
      const link = document.createElement('a');
      link.href = data.url;
      link.download = data.fileName;
      link.click();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (calculating) {
    return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Form 1040-ES - Estimated Tax for Individuals</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <TaxYearSelector selectedYear={taxYear} onYearChange={setTaxYear} />
          
          <div className="grid grid-cols-2 gap-4">

            <div>
              <Label>Expected AGI</Label>
              <Input type="number" value={formData.expected_agi} onChange={e => setFormData({...formData, expected_agi: parseFloat(e.target.value)})} />
            </div>
            <div>
              <Label>Expected Taxable Income</Label>
              <Input type="number" value={formData.expected_taxable_income} onChange={e => setFormData({...formData, expected_taxable_income: parseFloat(e.target.value)})} />
            </div>
            <div>
              <Label>Expected Tax</Label>
              <Input type="number" value={formData.expected_tax} onChange={e => setFormData({...formData, expected_tax: parseFloat(e.target.value)})} />
            </div>
            <div>
              <Label>Estimated Tax Payments Made</Label>
              <Input type="number" value={formData.estimated_tax_payments} onChange={e => setFormData({...formData, estimated_tax_payments: parseFloat(e.target.value)})} />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowPreview(true)} variant="outline">
              <Eye className="mr-2 h-4 w-4" /> Preview
            </Button>
            <Button onClick={handleGenerate} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
              Generate PDF
            </Button>
          </div>
        </CardContent>
      </Card>
      {showPreview && <TaxFormPreview formData={formData} formType="Form 1040-ES" onClose={() => setShowPreview(false)} />}
    </>
  );
}
