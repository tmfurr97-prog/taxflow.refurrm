import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, DollarSign, FileText } from 'lucide-react';
import { stateTaxData, getStateTaxInfoExtended } from '@/data/stateTaxData';

interface StateQuarterlyPaymentsProps {
  stateCode: string;
  estimatedIncome: number;
  deductions: number;
}

export function StateQuarterlyPayments({ stateCode, estimatedIncome, deductions }: StateQuarterlyPaymentsProps) {
  const stateInfo = getStateTaxInfoExtended(stateCode);
  
  if (!stateInfo || !stateInfo.estimatedPayments) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>State Quarterly Payments</CardTitle>
          <CardDescription>
            {stateInfo ? `${stateInfo.name} does not require quarterly estimated tax payments.` : 'State information not available.'}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const taxableIncome = Math.max(0, estimatedIncome - deductions - (stateInfo.standardDeduction || 0));
  
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

  const annualStateTax = calculateStateTax(taxableIncome);
  const quarterlyPayment = annualStateTax / 4;

  const quarters = [
    { name: 'Q1', date: stateInfo.quarterlyDates?.q1 || '04/15', status: 'upcoming' },
    { name: 'Q2', date: stateInfo.quarterlyDates?.q2 || '06/15', status: 'upcoming' },
    { name: 'Q3', date: stateInfo.quarterlyDates?.q3 || '09/15', status: 'upcoming' },
    { name: 'Q4', date: stateInfo.quarterlyDates?.q4 || '01/15', status: 'upcoming' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          {stateInfo.name} Quarterly Payments
        </CardTitle>
        <CardDescription>
          Estimated quarterly tax payments for {stateInfo.formName}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Annual State Tax</p>
            <p className="text-2xl font-bold">${annualStateTax.toFixed(2)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Quarterly Payment</p>
            <p className="text-2xl font-bold text-primary">${quarterlyPayment.toFixed(2)}</p>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold">Payment Schedule</h4>
          {quarters.map((quarter) => (
            <div key={quarter.name} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{quarter.name} Payment</p>
                  <p className="text-sm text-muted-foreground">Due: {quarter.date}/2024</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold">${quarterlyPayment.toFixed(2)}</span>
                <Badge variant="outline">{quarter.status}</Badge>
              </div>
            </div>
          ))}
        </div>

        {stateInfo.stateSpecificDeductions && stateInfo.stateSpecificDeductions.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold">State-Specific Deductions</h4>
            <ul className="space-y-1">
              {stateInfo.stateSpecificDeductions.map((deduction, idx) => (
                <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                  <DollarSign className="h-3 w-3" />
                  {deduction.name}: ${deduction.amount.toLocaleString()}
                </li>
              ))}
            </ul>
          </div>
        )}

        <Button className="w-full">
          Make {stateInfo.code} Payment
        </Button>
      </CardContent>
    </Card>
  );
}