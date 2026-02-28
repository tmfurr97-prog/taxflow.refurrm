import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Home, Calculator, Save } from 'lucide-react';

// IRS simplified method: $5 per sq ft, max 300 sq ft = $1,500 max
const SIMPLIFIED_RATE = 5;
const SIMPLIFIED_MAX_SQFT = 300;

export function HomeOfficeCalculatorV2() {
  const { toast } = useToast();
  const [saved, setSaved] = useState(false);

  const { data: existing, isLoading } = trpc.homeOffice.get.useQuery();
  const saveHomeOffice = trpc.homeOffice.save.useMutation({
    onSuccess: () => {
      toast({ title: 'Home office info saved' });
      setSaved(true);
    },
  });

  const [form, setForm] = useState({
    officeSquareFeet: '',
    totalHomeSqFt: '',
    monthlyRentOrMortgage: '',
    monthlyUtilities: '',
    useRegularMethod: false,
  });

  // Populate form from saved data
  useEffect(() => {
    if (existing) {
      setForm({
        officeSquareFeet: existing.officeSquareFeet || '',
        totalHomeSqFt: existing.totalHomeSqFt || '',
        monthlyRentOrMortgage: existing.monthlyRentOrMortgage || '',
        monthlyUtilities: existing.monthlyUtilities || '',
        useRegularMethod: existing.useRegularMethod ?? false,
      });
      setSaved(true);
    }
  }, [existing]);

  const officeSqFt = parseFloat(form.officeSquareFeet) || 0;
  const totalSqFt = parseFloat(form.totalHomeSqFt) || 0;
  const monthlyRent = parseFloat(form.monthlyRentOrMortgage) || 0;
  const monthlyUtils = parseFloat(form.monthlyUtilities) || 0;

  const businessUsePercent = totalSqFt > 0 ? (officeSqFt / totalSqFt) * 100 : 0;

  // Simplified method
  const simplifiedSqFt = Math.min(officeSqFt, SIMPLIFIED_MAX_SQFT);
  const simplifiedDeduction = simplifiedSqFt * SIMPLIFIED_RATE;

  // Regular method
  const annualRent = monthlyRent * 12;
  const annualUtils = monthlyUtils * 12;
  const regularDeduction = (businessUsePercent / 100) * (annualRent + annualUtils);

  const recommendedMethod = simplifiedDeduction >= regularDeduction ? 'simplified' : 'regular';
  const recommendedDeduction = Math.max(simplifiedDeduction, regularDeduction);

  if (isLoading) {
    return <div className="py-6 text-center text-gray-400">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Input Form */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Home className="h-4 w-4 text-emerald-600" />
              Your Home Office
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs">Office Square Footage</Label>
              <Input
                type="number"
                value={form.officeSquareFeet}
                onChange={e => { setForm(f => ({ ...f, officeSquareFeet: e.target.value })); setSaved(false); }}
                placeholder="e.g. 120"
              />
            </div>
            <div>
              <Label className="text-xs">Total Home Square Footage</Label>
              <Input
                type="number"
                value={form.totalHomeSqFt}
                onChange={e => { setForm(f => ({ ...f, totalHomeSqFt: e.target.value })); setSaved(false); }}
                placeholder="e.g. 1200"
              />
            </div>
            <div>
              <Label className="text-xs">Monthly Rent or Mortgage ($)</Label>
              <Input
                type="number"
                value={form.monthlyRentOrMortgage}
                onChange={e => { setForm(f => ({ ...f, monthlyRentOrMortgage: e.target.value })); setSaved(false); }}
                placeholder="e.g. 1500"
              />
            </div>
            <div>
              <Label className="text-xs">Monthly Utilities ($)</Label>
              <Input
                type="number"
                value={form.monthlyUtilities}
                onChange={e => { setForm(f => ({ ...f, monthlyUtilities: e.target.value })); setSaved(false); }}
                placeholder="e.g. 150"
              />
            </div>
            <Button
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => saveHomeOffice.mutate(form)}
              disabled={saveHomeOffice.isPending}
            >
              <Save className="h-4 w-4 mr-2" />
              {saveHomeOffice.isPending ? 'Saving...' : saved ? 'Update' : 'Save'}
            </Button>
          </CardContent>
        </Card>

        {/* Calculation Results */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Calculator className="h-4 w-4 text-blue-600" />
              Deduction Estimate
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {officeSqFt === 0 ? (
              <p className="text-sm text-gray-400">Enter your office square footage to see estimates.</p>
            ) : (
              <>
                <div className="text-sm text-gray-600">
                  Business use: <span className="font-semibold text-gray-900">{businessUsePercent.toFixed(1)}%</span>
                  {totalSqFt === 0 && <span className="text-gray-400"> (enter total sq ft)</span>}
                </div>

                <div className="space-y-3">
                  <div className={`p-3 rounded-lg border ${recommendedMethod === 'simplified' ? 'border-emerald-300 bg-emerald-50' : 'border-gray-200'}`}>
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-sm">Simplified Method</div>
                        <div className="text-xs text-gray-500">${SIMPLIFIED_RATE}/sq ft, max {SIMPLIFIED_MAX_SQFT} sq ft</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">${simplifiedDeduction.toFixed(0)}</div>
                        {recommendedMethod === 'simplified' && (
                          <span className="text-xs text-emerald-600 font-medium">Recommended</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className={`p-3 rounded-lg border ${recommendedMethod === 'regular' ? 'border-emerald-300 bg-emerald-50' : 'border-gray-200'}`}>
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-sm">Regular Method</div>
                        <div className="text-xs text-gray-500">% of actual home expenses</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">${regularDeduction.toFixed(0)}</div>
                        {recommendedMethod === 'regular' && (
                          <span className="text-xs text-emerald-600 font-medium">Recommended</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Best deduction</span>
                    <span className="text-xl font-bold text-emerald-700">${recommendedDeduction.toFixed(0)}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Consult your tax preparer to confirm which method applies to your situation.
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
