import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { FileText, Download } from 'lucide-react';

interface Form1040XProps {
  originalForm: any;
  onComplete: () => void;
}

export default function Form1040X({ originalForm, onComplete }: Form1040XProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [amendmentReason, setAmendmentReason] = useState('');
  const [formData, setFormData] = useState({
    original_income: '',
    amended_income: '',
    original_deductions: '',
    amended_deductions: '',
    original_tax: '',
    amended_tax: '',
    refund_or_amount_owed: ''
  });

  useEffect(() => {
    if (originalForm?.form_data) {
      const data = originalForm.form_data;
      setFormData({
        original_income: data.gross_income || data.total_income || '',
        amended_income: data.gross_income || data.total_income || '',
        original_deductions: data.total_expenses || data.total_deductions || '',
        amended_deductions: data.total_expenses || data.total_deductions || '',
        original_tax: data.estimated_tax || '',
        amended_tax: data.estimated_tax || '',
        refund_or_amount_owed: '0'
      });
    }
  }, [originalForm]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateDifference = (original: string, amended: string) => {
    const diff = parseFloat(amended || '0') - parseFloat(original || '0');
    return diff.toFixed(2);
  };

  const handleGenerate = async () => {
    if (!amendmentReason.trim()) {
      toast({
        title: 'Reason Required',
        description: 'Please provide a reason for the amendment.',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const amendedData = {
        ...formData,
        income_difference: calculateDifference(formData.original_income, formData.amended_income),
        deductions_difference: calculateDifference(formData.original_deductions, formData.amended_deductions),
        tax_difference: calculateDifference(formData.original_tax, formData.amended_tax),
        amendment_reason: amendmentReason
      };

      const { data, error } = await supabase.functions.invoke('generate-tax-form', {
        body: {
          formType: '1040-x',
          taxYear: originalForm.tax_year,
          formData: amendedData,
          isAmendment: true,
          originalFormId: originalForm.id,
          amendmentReason
        }
      });

      if (error) throw error;

      toast({
        title: 'Amendment Generated',
        description: 'Form 1040-X has been generated successfully.'
      });

      onComplete();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Form 1040-X - Amended U.S. Individual Income Tax Return</CardTitle>
        <CardDescription>
          Tax Year {originalForm?.tax_year} - Make corrections to your previously filed return
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label>Reason for Amendment *</Label>
          <Textarea
            value={amendmentReason}
            onChange={(e) => setAmendmentReason(e.target.value)}
            placeholder="Explain why you are filing an amended return..."
            className="mt-2"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="font-semibold">Item</div>
          <div className="font-semibold">Original Amount</div>
          <div className="font-semibold">Amended Amount</div>

          <Label>Income</Label>
          <Input
            type="number"
            value={formData.original_income}
            onChange={(e) => handleChange('original_income', e.target.value)}
          />
          <Input
            type="number"
            value={formData.amended_income}
            onChange={(e) => handleChange('amended_income', e.target.value)}
          />

          <Label>Deductions</Label>
          <Input
            type="number"
            value={formData.original_deductions}
            onChange={(e) => handleChange('original_deductions', e.target.value)}
          />
          <Input
            type="number"
            value={formData.amended_deductions}
            onChange={(e) => handleChange('amended_deductions', e.target.value)}
          />

          <Label>Tax</Label>
          <Input
            type="number"
            value={formData.original_tax}
            onChange={(e) => handleChange('original_tax', e.target.value)}
          />
          <Input
            type="number"
            value={formData.amended_tax}
            onChange={(e) => handleChange('amended_tax', e.target.value)}
          />
        </div>

        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Summary of Changes</h4>
          <div className="space-y-1 text-sm">
            <p>Income Change: ${calculateDifference(formData.original_income, formData.amended_income)}</p>
            <p>Deductions Change: ${calculateDifference(formData.original_deductions, formData.amended_deductions)}</p>
            <p>Tax Change: ${calculateDifference(formData.original_tax, formData.amended_tax)}</p>
          </div>
        </div>

        <Button onClick={handleGenerate} disabled={loading} className="w-full">
          <Download className="mr-2 h-4 w-4" />
          {loading ? 'Generating...' : 'Generate Form 1040-X'}
        </Button>
      </CardContent>
    </Card>
  );
}
