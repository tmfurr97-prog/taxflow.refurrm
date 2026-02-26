import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Download } from 'lucide-react';

interface StateAmendmentFormProps {
  originalForm: any;
  onComplete: () => void;
}

export default function StateAmendmentForm({ originalForm, onComplete }: StateAmendmentFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [amendmentReason, setAmendmentReason] = useState('');
  const [formData, setFormData] = useState({
    original_state_income: '',
    amended_state_income: '',
    original_state_deductions: '',
    amended_state_deductions: '',
    original_state_tax: '',
    amended_state_tax: ''
  });

  useEffect(() => {
    if (originalForm?.form_data) {
      const data = originalForm.form_data;
      setFormData({
        original_state_income: data.state_income || data.federal_agi || '',
        amended_state_income: data.state_income || data.federal_agi || '',
        original_state_deductions: data.state_deductions || data.standard_deduction || '',
        amended_state_deductions: data.state_deductions || data.standard_deduction || '',
        original_state_tax: data.state_tax_owed || '',
        amended_state_tax: data.state_tax_owed || ''
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

  const getStateFormName = (formType: string) => {
    const names: Record<string, string> = {
      'state-ca': 'CA 540-X',
      'state-ny': 'NY IT-201-X',
      'state-il': 'IL-1040-X',
      'state-pa': 'PA-40-X',
      'state-ma': 'MA Form 1-X'
    };
    return names[formType] || 'State Amendment Form';
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

      const stateCode = originalForm.form_type.replace('state-', '');
      const amendedData = {
        ...formData,
        state_income_difference: calculateDifference(formData.original_state_income, formData.amended_state_income),
        state_deductions_difference: calculateDifference(formData.original_state_deductions, formData.amended_state_deductions),
        state_tax_difference: calculateDifference(formData.original_state_tax, formData.amended_state_tax),
        amendment_reason: amendmentReason
      };

      const { data, error } = await supabase.functions.invoke('generate-tax-form', {
        body: {
          formType: `state-amendment-${stateCode}`,
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
        description: `${getStateFormName(originalForm.form_type)} has been generated successfully.`
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
        <CardTitle>{getStateFormName(originalForm?.form_type)} - State Amended Return</CardTitle>
        <CardDescription>
          Tax Year {originalForm?.tax_year} - Amend your state tax return
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label>Reason for Amendment *</Label>
          <Textarea
            value={amendmentReason}
            onChange={(e) => setAmendmentReason(e.target.value)}
            placeholder="Explain why you are filing an amended state return..."
            className="mt-2"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="font-semibold">Item</div>
          <div className="font-semibold">Original Amount</div>
          <div className="font-semibold">Amended Amount</div>

          <Label>State Income</Label>
          <Input
            type="number"
            value={formData.original_state_income}
            onChange={(e) => handleChange('original_state_income', e.target.value)}
          />
          <Input
            type="number"
            value={formData.amended_state_income}
            onChange={(e) => handleChange('amended_state_income', e.target.value)}
          />

          <Label>State Deductions</Label>
          <Input
            type="number"
            value={formData.original_state_deductions}
            onChange={(e) => handleChange('original_state_deductions', e.target.value)}
          />
          <Input
            type="number"
            value={formData.amended_state_deductions}
            onChange={(e) => handleChange('amended_state_deductions', e.target.value)}
          />

          <Label>State Tax</Label>
          <Input
            type="number"
            value={formData.original_state_tax}
            onChange={(e) => handleChange('original_state_tax', e.target.value)}
          />
          <Input
            type="number"
            value={formData.amended_state_tax}
            onChange={(e) => handleChange('amended_state_tax', e.target.value)}
          />
        </div>

        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Summary of Changes</h4>
          <div className="space-y-1 text-sm">
            <p>State Income Change: ${calculateDifference(formData.original_state_income, formData.amended_state_income)}</p>
            <p>State Deductions Change: ${calculateDifference(formData.original_state_deductions, formData.amended_state_deductions)}</p>
            <p>State Tax Change: ${calculateDifference(formData.original_state_tax, formData.amended_state_tax)}</p>
          </div>
        </div>

        <Button onClick={handleGenerate} disabled={loading} className="w-full">
          <Download className="mr-2 h-4 w-4" />
          {loading ? 'Generating...' : 'Generate State Amendment'}
        </Button>
      </CardContent>
    </Card>
  );
}
