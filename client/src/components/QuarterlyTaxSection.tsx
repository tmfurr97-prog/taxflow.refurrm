import { useState, useEffect } from 'react';
import { EstimatedTaxCalculator } from './EstimatedTaxCalculator';
import { StateQuarterlyPayments } from './StateQuarterlyPayments';
import { supabase } from '@/lib/supabase';

export function QuarterlyTaxSection() {
  const [estimatedIncome, setEstimatedIncome] = useState(0);
  const [deductions, setDeductions] = useState(0);
  const [selectedState, setSelectedState] = useState('CA');

  useEffect(() => {
    loadUserState();
  }, []);

  const loadUserState = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('state')
        .eq('id', user.id)
        .single();

      if (profile?.state) {
        setSelectedState(profile.state);
      }
    } catch (error) {
      console.error('Error loading state:', error);
    }
  };

  const handleCalculation = (income: number, deduct: number) => {
    setEstimatedIncome(income);
    setDeductions(deduct);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Quarterly Estimated Tax Payments</h1>
        
        <div className="grid md:grid-cols-2 gap-6">
          <EstimatedTaxCalculator onCalculate={handleCalculation} />
          <StateQuarterlyPayments 
            stateCode={selectedState}
            estimatedIncome={estimatedIncome}
            deductions={deductions}
          />
        </div>
      </div>
    </div>
  );
}