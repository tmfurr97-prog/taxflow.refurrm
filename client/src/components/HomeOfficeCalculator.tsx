import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase';

export function HomeOfficeCalculator() {
  const [taxYear, setTaxYear] = useState(new Date().getFullYear());
  const [homeSquareFeet, setHomeSquareFeet] = useState('');
  const [officeSquareFeet, setOfficeSquareFeet] = useState('');
  const [mortgageInterest, setMortgageInterest] = useState('');
  const [propertyTaxes, setPropertyTaxes] = useState('');
  const [utilities, setUtilities] = useState('');
  const [insurance, setInsurance] = useState('');
  const [repairs, setRepairs] = useState('');
  const [monthsUsed, setMonthsUsed] = useState('12');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadData();
  }, [taxYear]);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('home_office')
      .select('*')
      .eq('user_id', user.id)
      .eq('tax_year', taxYear)
      .single();

    if (data) {
      setHomeSquareFeet(data.home_square_feet.toString());
      setOfficeSquareFeet(data.office_square_feet.toString());
      setMortgageInterest(data.mortgage_interest.toString());
      setPropertyTaxes(data.property_taxes.toString());
      setUtilities(data.utilities.toString());
      setInsurance(data.insurance.toString());
      setRepairs(data.repairs_maintenance.toString());
      setMonthsUsed(data.months_used.toString());
    }
  };

  const handleSave = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('home_office').upsert({
      user_id: user.id,
      tax_year: taxYear,
      home_square_feet: parseInt(homeSquareFeet),
      office_square_feet: parseInt(officeSquareFeet),
      mortgage_interest: parseFloat(mortgageInterest || '0'),
      property_taxes: parseFloat(propertyTaxes || '0'),
      utilities: parseFloat(utilities || '0'),
      insurance: parseFloat(insurance || '0'),
      repairs_maintenance: parseFloat(repairs || '0'),
      months_used: parseInt(monthsUsed)
    });

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const businessPercentage = homeSquareFeet && officeSquareFeet 
    ? (parseInt(officeSquareFeet) / parseInt(homeSquareFeet) * 100).toFixed(2)
    : '0';

  const totalExpenses = [mortgageInterest, propertyTaxes, utilities, insurance, repairs]
    .reduce((sum, val) => sum + parseFloat(val || '0'), 0);

  const regularMethodDeduction = totalExpenses * (parseFloat(businessPercentage) / 100) * (parseInt(monthsUsed) / 12);
  const simplifiedDeduction = Math.min(parseInt(officeSquareFeet || '0') * 5, 1500);

  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-4">Home Office Deduction (Form 8829)</h3>
      
      <Tabs defaultValue="calculator">
        <TabsList className="mb-4">
          <TabsTrigger value="calculator">Calculator</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Tax Year</Label>
              <Input type="number" value={taxYear} onChange={(e) => setTaxYear(parseInt(e.target.value))} />
            </div>
            <div>
              <Label>Months Used</Label>
              <Input type="number" value={monthsUsed} onChange={(e) => setMonthsUsed(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Total Home Square Feet</Label>
              <Input type="number" value={homeSquareFeet} onChange={(e) => setHomeSquareFeet(e.target.value)} />
            </div>
            <div>
              <Label>Office Square Feet</Label>
              <Input type="number" value={officeSquareFeet} onChange={(e) => setOfficeSquareFeet(e.target.value)} />
            </div>
          </div>

          <div className="bg-blue-50 p-3 rounded">
            <div className="text-sm text-gray-600">Business Use Percentage</div>
            <div className="text-2xl font-bold">{businessPercentage}%</div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold">Annual Home Expenses</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Mortgage Interest</Label>
                <Input type="number" step="0.01" value={mortgageInterest} onChange={(e) => setMortgageInterest(e.target.value)} />
              </div>
              <div>
                <Label>Property Taxes</Label>
                <Input type="number" step="0.01" value={propertyTaxes} onChange={(e) => setPropertyTaxes(e.target.value)} />
              </div>
              <div>
                <Label>Utilities</Label>
                <Input type="number" step="0.01" value={utilities} onChange={(e) => setUtilities(e.target.value)} />
              </div>
              <div>
                <Label>Insurance</Label>
                <Input type="number" step="0.01" value={insurance} onChange={(e) => setInsurance(e.target.value)} />
              </div>
              <div>
                <Label>Repairs & Maintenance</Label>
                <Input type="number" step="0.01" value={repairs} onChange={(e) => setRepairs(e.target.value)} />
              </div>
            </div>
          </div>

          <Button onClick={handleSave} className="w-full">
            {saved ? 'Saved!' : 'Save Data'}
          </Button>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4 bg-green-50">
              <h4 className="font-semibold mb-2">Simplified Method</h4>
              <div className="text-3xl font-bold text-green-600">${simplifiedDeduction.toFixed(2)}</div>
              <p className="text-sm text-gray-600 mt-2">$5 per sq ft (max 300 sq ft)</p>
            </Card>
            <Card className="p-4 bg-blue-50">
              <h4 className="font-semibold mb-2">Regular Method</h4>
              <div className="text-3xl font-bold text-blue-600">${regularMethodDeduction.toFixed(2)}</div>
              <p className="text-sm text-gray-600 mt-2">Based on actual expenses</p>
            </Card>
          </div>

          <div className="p-4 bg-yellow-50 rounded">
            <h4 className="font-semibold mb-2">Recommendation</h4>
            <p className="text-sm">
              {simplifiedDeduction > regularMethodDeduction 
                ? 'The simplified method provides a larger deduction. Consider using this method for easier record-keeping.'
                : 'The regular method provides a larger deduction. Keep detailed records of all home expenses.'}
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}