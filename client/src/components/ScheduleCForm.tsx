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

export function ScheduleCForm({ onDataChange }: { onDataChange?: (data: any) => void }) {
  const [taxYear, setTaxYear] = useState(new Date().getFullYear());


  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState({
    business_name: '',
    gross_receipts: 0,
    returns_allowances: 0,
    cost_of_goods: 0,
    car_truck_expenses: 0,
    depreciation: 0,
    insurance: 0,
    legal_professional: 0,
    office_expense: 0,
    rent_lease: 0,
    repairs_maintenance: 0,
    supplies: 0,
    travel: 0,
    meals: 0,
    utilities: 0,
    other_expenses: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    calculateFromData();
  }, []);

  const calculateFromData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_tax_deductible', true);

      const { data: vehicles } = await supabase
        .from('vehicles')
        .select('*')
        .eq('user_id', user.id);

      let carExpenses = 0;
      if (vehicles) {
        vehicles.forEach((v: any) => {
          carExpenses += (v.total_mileage || 0) * 0.655;
        });
      }

      const expenses = {
        office_expense: 0,
        supplies: 0,
        travel: 0,
        meals: 0
      };

      transactions?.forEach((t: any) => {
        const cat = t.tax_category?.toLowerCase() || '';
        if (cat.includes('office')) expenses.office_expense += Math.abs(t.amount);
        else if (cat.includes('supplies')) expenses.supplies += Math.abs(t.amount);
        else if (cat.includes('travel')) expenses.travel += Math.abs(t.amount);
        else if (cat.includes('meals')) expenses.meals += Math.abs(t.amount);
      });

      const updatedData = {
        business_name: '',
        gross_receipts: 0,
        returns_allowances: 0,
        cost_of_goods: 0,
        car_truck_expenses: carExpenses,
        depreciation: 0,
        insurance: 0,
        legal_professional: 0,
        office_expense: expenses.office_expense,
        rent_lease: 0,
        repairs_maintenance: 0,
        supplies: expenses.supplies,
        travel: expenses.travel,
        meals: expenses.meals,
        utilities: 0,
        other_expenses: 0
      };
      
      setFormData(updatedData);
      
      const totalExpenses = carExpenses + expenses.office_expense + expenses.supplies + expenses.travel + expenses.meals;
      const netProfit = updatedData.gross_receipts - totalExpenses;
      
      if (onDataChange) {
        onDataChange({
          ...updatedData,
          grossIncome: updatedData.gross_receipts,
          totalExpenses,
          netProfit
        });
      }


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
        body: { formType: 'schedule-c', taxYear, formData }

      });

      if (error) throw error;

      toast({ title: 'Form generated!', description: 'Your Schedule C is ready.' });
      
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
          <CardTitle>Schedule C - Profit or Loss from Business</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <TaxYearSelector selectedYear={taxYear} onYearChange={setTaxYear} />
          
          <div className="grid grid-cols-2 gap-4">

            <div>
              <Label>Business Name</Label>
              <Input value={formData.business_name} onChange={e => setFormData({...formData, business_name: e.target.value})} />
            </div>
            <div>
              <Label>Gross Receipts</Label>
              <Input type="number" value={formData.gross_receipts} onChange={e => setFormData({...formData, gross_receipts: parseFloat(e.target.value)})} />
            </div>
            <div>
              <Label>Car/Truck Expenses</Label>
              <Input type="number" value={formData.car_truck_expenses} onChange={e => setFormData({...formData, car_truck_expenses: parseFloat(e.target.value)})} />
            </div>
            <div>
              <Label>Office Expense</Label>
              <Input type="number" value={formData.office_expense} onChange={e => setFormData({...formData, office_expense: parseFloat(e.target.value)})} />
            </div>
            <div>
              <Label>Supplies</Label>
              <Input type="number" value={formData.supplies} onChange={e => setFormData({...formData, supplies: parseFloat(e.target.value)})} />
            </div>
            <div>
              <Label>Travel</Label>
              <Input type="number" value={formData.travel} onChange={e => setFormData({...formData, travel: parseFloat(e.target.value)})} />
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
      {showPreview && <TaxFormPreview formData={formData} formType="Schedule C" onClose={() => setShowPreview(false)} />}
    </>
  );
}
