import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export default function SCorpOptimizer({ entityId }: { entityId: string }) {
  const [netIncome, setNetIncome] = useState('');
  const [currentSalary, setCurrentSalary] = useState('');
  const [recommendation, setRecommendation] = useState<any>(null);
  const { toast } = useToast();

  const calculateOptimal = () => {
    const income = parseFloat(netIncome);
    const salary = parseFloat(currentSalary);

    if (!income || !salary) return;

    // Reasonable compensation typically 30-40% of net income
    const minReasonable = income * 0.30;
    const maxReasonable = income * 0.40;
    const optimalSalary = Math.min(Math.max(salary, minReasonable), maxReasonable);
    const distribution = income - optimalSalary;

    // Tax calculations (simplified)
    const payrollTax = optimalSalary * 0.153; // 15.3% FICA
    const incomeTax = income * 0.24; // Approximate federal rate
    const totalTax = payrollTax + incomeTax;

    // Current scenario
    const currentPayrollTax = salary * 0.153;
    const currentIncomeTax = income * 0.24;
    const currentTotalTax = currentPayrollTax + currentIncomeTax;

    const savings = currentTotalTax - totalTax;

    setRecommendation({
      optimalSalary,
      distribution,
      payrollTax,
      totalTax,
      savings,
      isOptimal: salary >= minReasonable && salary <= maxReasonable
    });
  };

  const saveSalary = async () => {
    if (!recommendation) return;

    const { error } = await supabase
      .from('business_entities')
      .update({ reasonable_salary: recommendation.optimalSalary })
      .eq('id', entityId);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Salary recommendation saved' });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          S-Corp Salary Optimizer
        </CardTitle>
        <CardDescription>
          Calculate the optimal split between salary and distributions to minimize taxes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Annual Net Business Income</Label>
            <Input
              type="number"
              value={netIncome}
              onChange={e => setNetIncome(e.target.value)}
              placeholder="150000"
            />
          </div>
          <div>
            <Label>Current Annual Salary</Label>
            <Input
              type="number"
              value={currentSalary}
              onChange={e => setCurrentSalary(e.target.value)}
              placeholder="60000"
            />
          </div>
        </div>

        <Button onClick={calculateOptimal} className="w-full">
          Calculate Optimal Split
        </Button>

        {recommendation && (
          <div className="space-y-4">
            {!recommendation.isOptimal && (
              <div className="flex items-start gap-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-yellow-900">Salary Adjustment Recommended</p>
                  <p className="text-yellow-700">Your current salary may not meet IRS reasonable compensation standards.</p>
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">Recommended Salary</p>
                    <p className="text-3xl font-bold text-green-600">
                      ${recommendation.optimalSalary.toLocaleString()}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">Distribution</p>
                    <p className="text-3xl font-bold text-blue-600">
                      ${recommendation.distribution.toLocaleString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span>Payroll Tax (FICA)</span>
                <span className="font-semibold">${recommendation.payrollTax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Total Tax</span>
                <span className="font-semibold">${recommendation.totalTax.toLocaleString()}</span>
              </div>
              {recommendation.savings > 0 && (
                <div className="flex justify-between text-green-600 pt-2 border-t">
                  <span className="font-semibold">Potential Tax Savings</span>
                  <span className="font-bold">${recommendation.savings.toLocaleString()}</span>
                </div>
              )}
            </div>

            <Button onClick={saveSalary} variant="outline" className="w-full">
              Save This Recommendation
            </Button>

            <p className="text-xs text-muted-foreground">
              * This is a simplified calculation. Consult with a tax professional for personalized advice.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}