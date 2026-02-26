import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator, DollarSign, MapPin } from 'lucide-react';
import { stateTaxData, getStateTaxInfoExtended } from '@/data/stateTaxData';

interface TaxCalculation {
  federalTax: number;
  stateTax: number;
  selfEmploymentTax: number;
  totalTax: number;
  federalQuarterly: number;
  stateQuarterly: number;
  totalQuarterly: number;
}

export function EstimatedTaxCalculator({ onCalculate }: { onCalculate: (income: number, deductions: number) => void }) {

  const [income, setIncome] = useState('');
  const [expenses, setExpenses] = useState('');
  const [selectedState, setSelectedState] = useState('CA');
  const [calculation, setCalculation] = useState<TaxCalculation | null>(null);

  const calculateTax = () => {
    const grossIncome = parseFloat(income) || 0;
    const totalExpenses = parseFloat(expenses) || 0;
    const netIncome = grossIncome - totalExpenses;

    // Self-employment tax
    const seIncome = netIncome * 0.9235;
    const selfEmploymentTax = seIncome * 0.153;

    // Federal income tax
    let federalTax = 0;
    const adjustedIncome = netIncome - (selfEmploymentTax / 2);
    
    if (adjustedIncome > 0) {
      if (adjustedIncome <= 11000) {
        federalTax = adjustedIncome * 0.10;
      } else if (adjustedIncome <= 44725) {
        federalTax = 1100 + (adjustedIncome - 11000) * 0.12;
      } else if (adjustedIncome <= 95375) {
        federalTax = 5147 + (adjustedIncome - 44725) * 0.22;
      } else {
        federalTax = 16290 + (adjustedIncome - 95375) * 0.24;
      }
    }

    // State income tax
    const stateInfo = getStateTaxInfoExtended(selectedState);
    const stateTax = stateInfo.estimatedPayments ? netIncome * (stateInfo as any).rate : 0;

    const totalTax = federalTax + stateTax + selfEmploymentTax;
    const federalQuarterly = (federalTax + selfEmploymentTax) / 4;
    const stateQuarterly = stateTax / 4;

    setCalculation({
      federalTax,
      stateTax,
      selfEmploymentTax,
      totalTax,
      federalQuarterly,
      stateQuarterly,
      totalQuarterly: federalQuarterly + stateQuarterly
    });

    onCalculate(grossIncome, totalExpenses);

  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Federal & State Tax Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="state">State</Label>
          <Select value={selectedState} onValueChange={setSelectedState}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(stateTaxData).map(([code, info]) => (
                <SelectItem key={code} value={code}>
                  {info.name} ({info.rate > 0 ? `${(info.rate * 100).toFixed(1)}%` : 'No Tax'})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="income">Annual Gross Income</Label>
          <Input
            id="income"
            type="number"
            placeholder="$100,000"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="expenses">Annual Business Expenses</Label>
          <Input
            id="expenses"
            type="number"
            placeholder="$20,000"
            value={expenses}
            onChange={(e) => setExpenses(e.target.value)}
          />
        </div>
        <Button onClick={calculateTax} className="w-full">
          Calculate Estimated Tax
        </Button>

        {calculation && (
          <div className="mt-4 space-y-3">
            <div className="p-4 bg-blue-50 rounded-lg space-y-2">
              <h4 className="font-semibold text-blue-900">Federal Taxes</h4>
              <div className="flex justify-between text-sm">
                <span>Income Tax:</span>
                <span>${calculation.federalTax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Self-Employment:</span>
                <span>${calculation.selfEmploymentTax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Federal Quarterly:</span>
                <span className="text-blue-600">${calculation.federalQuarterly.toFixed(2)}</span>
              </div>
            </div>
            
            {calculation.stateTax > 0 && (
              <div className="p-4 bg-green-50 rounded-lg space-y-2">
                <h4 className="font-semibold text-green-900 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {getStateTaxInfoExtended(selectedState).name} State Tax
                </h4>
                <div className="flex justify-between text-sm">
                  <span>State Income Tax:</span>
                  <span>${calculation.stateTax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>State Quarterly:</span>
                  <span className="text-green-600">${calculation.stateQuarterly.toFixed(2)}</span>
                </div>
              </div>
            )}
            
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex justify-between text-lg font-bold">
                <span>Total Quarterly Payment:</span>
                <span className="text-purple-600">${calculation.totalQuarterly.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}