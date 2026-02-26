import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { FileText, Download } from 'lucide-react';
import { stateTaxData, getStateTaxInfoExtended } from '@/data/stateTaxData';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { TaxYearSelector } from './TaxYearSelector';

interface StateTaxFormProps {
  stateCode: string;
  federalAGI: number;
  federalTaxableIncome: number;
  scheduleC: {
    grossIncome: number;
    totalExpenses: number;
    netProfit: number;
  };
}

export function StateTaxForm({ stateCode, federalAGI, federalTaxableIncome, scheduleC }: StateTaxFormProps) {
  const [taxYear, setTaxYear] = useState(new Date().getFullYear());

  const { toast } = useToast();
  const stateInfo = getStateTaxInfoExtended(stateCode);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [formData, setFormData] = useState({
    stateWages: 0,
    stateWithholding: 0,
    stateDeductions: stateInfo?.standardDeduction || 0,
    additionalCredits: 0
  });

  if (!stateInfo || (stateInfo.taxRate ?? 0) === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>State Tax Form</CardTitle>
          <CardDescription>
            {stateInfo ? `${stateInfo.name} does not have state income tax.` : 'State information not available.'}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const calculateStateTax = (income: number): number => {
    if (stateInfo.flatTax) {
      return income * (stateInfo.taxRate ?? 0);
    }
    
    if (stateInfo.brackets) {
      let tax = 0;
      for (const bracket of stateInfo.brackets) {
        if (income > bracket.min) {
          const taxableInBracket = Math.min(income, bracket.max ?? income) - bracket.min;
          tax += taxableInBracket * bracket.rate;
        }
      }
      return tax;
    }
    
    return income * (stateInfo.taxRate ?? 0);
  };

  const stateAGI = federalAGI + formData.stateWages;
  const stateTaxableIncome = Math.max(0, stateAGI - formData.stateDeductions);
  const stateTaxBeforeCredits = calculateStateTax(stateTaxableIncome);
  const totalStateTax = Math.max(0, stateTaxBeforeCredits - formData.additionalCredits);
  const refundOrOwed = formData.stateWithholding - totalStateTax;

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const formDataToSend = {
        formType: stateInfo.formName,
        taxYear,

        data: {
          state: stateCode,
          stateName: stateInfo.name,
          stateAGI,
          stateTaxableIncome,
          stateDeductions: formData.stateDeductions,
          stateWithholding: formData.stateWithholding,
          stateTaxBeforeCredits,
          additionalCredits: formData.additionalCredits,
          totalStateTax,
          refundOrOwed,
          scheduleC
        }
      };

      const { data, error } = await supabase.functions.invoke('generate-tax-form', {
        body: formDataToSend
      });

      if (error) throw error;

      toast({
        title: 'Success!',
        description: `${stateInfo.formName} generated successfully.`
      });

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          {stateInfo.formName} - {stateInfo.name}
        </CardTitle>
        <CardDescription>State income tax return</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <TaxYearSelector selectedYear={taxYear} onYearChange={setTaxYear} />
        
        <div className="grid grid-cols-2 gap-4">

          <div className="space-y-2">
            <Label>Federal AGI</Label>
            <Input value={`$${federalAGI.toFixed(2)}`} disabled />
          </div>
          <div className="space-y-2">
            <Label>State Wages (if any)</Label>
            <Input 
              type="number" 
              value={formData.stateWages}
              onChange={(e) => setFormData({...formData, stateWages: parseFloat(e.target.value) || 0})}
            />
          </div>
          <div className="space-y-2">
            <Label>State Deductions</Label>
            <Input 
              type="number" 
              value={formData.stateDeductions}
              onChange={(e) => setFormData({...formData, stateDeductions: parseFloat(e.target.value) || 0})}
            />
          </div>
          <div className="space-y-2">
            <Label>State Withholding</Label>
            <Input 
              type="number" 
              value={formData.stateWithholding}
              onChange={(e) => setFormData({...formData, stateWithholding: parseFloat(e.target.value) || 0})}
            />
          </div>
        </div>

        <div className="border-t pt-4 space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">State AGI:</span>
            <span className="font-semibold">${stateAGI.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">State Taxable Income:</span>
            <span className="font-semibold">${stateTaxableIncome.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">State Tax:</span>
            <span className="font-semibold">${totalStateTax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold">
            <span>{refundOrOwed >= 0 ? 'Refund:' : 'Amount Owed:'}</span>
            <span className={refundOrOwed >= 0 ? 'text-green-600' : 'text-red-600'}>
              ${Math.abs(refundOrOwed).toFixed(2)}
            </span>
          </div>
        </div>

        <Button onClick={handleGenerate} disabled={isGenerating} className="w-full">
          <Download className="mr-2 h-4 w-4" />
          {isGenerating ? 'Generating...' : `Generate ${stateInfo.formName} PDF`}
        </Button>
      </CardContent>
    </Card>
  );
}