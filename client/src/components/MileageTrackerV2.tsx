import { useState, useMemo } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Car, Plus, Trash2, MapPin } from 'lucide-react';

// 2024 IRS standard mileage rates
const IRS_RATES: Record<string, number> = {
  business: 0.67,
  medical: 0.21,
  charity: 0.14,
  personal: 0,
};

const CATEGORY_LABELS: Record<string, string> = {
  business: 'Business',
  medical: 'Medical',
  charity: 'Charity',
  personal: 'Personal',
};

export function MileageTrackerV2() {
  const { toast } = useToast();
  const taxYear = useMemo(() => new Date().getFullYear(), []);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    startLocation: '',
    endLocation: '',
    miles: '',
    purpose: '',
    category: 'business' as 'business' | 'medical' | 'charity' | 'personal',
  });

  const utils = trpc.useUtils();
  const { data: trips = [], isLoading } = trpc.mileage.list.useQuery({ taxYear });

  const createTrip = trpc.mileage.create.useMutation({
    onSuccess: () => {
      utils.mileage.list.invalidate();
      setShowAdd(false);
      setForm({ date: new Date().toISOString().slice(0, 10), startLocation: '', endLocation: '', miles: '', purpose: '', category: 'business' });
      toast({ title: 'Trip logged' });
    },
  });

  const deleteTrip = trpc.mileage.delete.useMutation({
    onSuccess: () => utils.mileage.list.invalidate(),
  });

  const totalBusinessMiles = trips
    .filter(t => t.category === 'business')
    .reduce((sum, t) => sum + parseFloat(t.miles || '0'), 0);

  const totalDeduction = trips.reduce((sum, t) => {
    const miles = parseFloat(t.miles || '0');
    const rate = IRS_RATES[t.category || 'personal'] || 0;
    return sum + miles * rate;
  }, 0);

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <Car className="h-4 w-4 text-emerald-600" />
              <span className="text-sm font-medium text-gray-600">Business Miles</span>
            </div>
            <div className="text-2xl font-bold">{totalBusinessMiles.toFixed(1)}</div>
            <p className="text-xs text-gray-400">@ $0.67/mi (2024 IRS rate)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-600">Mileage Deduction</span>
            </div>
            <div className="text-2xl font-bold">${totalDeduction.toFixed(2)}</div>
            <p className="text-xs text-gray-400">All deductible categories</p>
          </CardContent>
        </Card>
      </div>

      <Button onClick={() => setShowAdd(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white">
        <Plus className="h-4 w-4 mr-2" />
        Log Trip
      </Button>

      {/* Trip List */}
      {isLoading ? (
        <div className="text-center py-6 text-gray-400">Loading trips...</div>
      ) : trips.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <Car className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">No trips logged yet</p>
            <p className="text-sm text-gray-400 mt-1">Log your first business trip to start tracking mileage deductions.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {trips.map(t => {
            const miles = parseFloat(t.miles || '0');
            const rate = IRS_RATES[t.category || 'personal'] || 0;
            const deduction = miles * rate;
            return (
              <Card key={t.id}>
                <CardContent className="py-3 px-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-gray-900">
                          {t.startLocation && t.endLocation
                            ? `${t.startLocation} → ${t.endLocation}`
                            : t.purpose || 'Trip'}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {CATEGORY_LABELS[t.category || 'personal']}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-500 mt-0.5">
                        {t.date} · {miles.toFixed(1)} miles
                        {deduction > 0 && ` · $${deduction.toFixed(2)} deduction`}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-400 hover:text-red-500 shrink-0"
                      onClick={() => deleteTrip.mutate({ id: t.id })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Trip Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log a Trip</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Date</Label>
                <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
              </div>
              <div>
                <Label className="text-xs">Miles</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={form.miles}
                  onChange={e => setForm(f => ({ ...f, miles: e.target.value }))}
                  placeholder="0.0"
                />
              </div>
              <div>
                <Label className="text-xs">From (optional)</Label>
                <Input value={form.startLocation} onChange={e => setForm(f => ({ ...f, startLocation: e.target.value }))} placeholder="Start location" />
              </div>
              <div>
                <Label className="text-xs">To (optional)</Label>
                <Input value={form.endLocation} onChange={e => setForm(f => ({ ...f, endLocation: e.target.value }))} placeholder="End location" />
              </div>
            </div>
            <div>
              <Label className="text-xs">Purpose</Label>
              <Input value={form.purpose} onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))} placeholder="e.g. Client meeting, supply run" />
            </div>
            <div>
              <Label className="text-xs">Category</Label>
              <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v as any }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="business">Business ($0.67/mi)</SelectItem>
                  <SelectItem value="medical">Medical ($0.21/mi)</SelectItem>
                  <SelectItem value="charity">Charity ($0.14/mi)</SelectItem>
                  <SelectItem value="personal">Personal (not deductible)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => createTrip.mutate({ ...form, taxYear })}
              disabled={!form.miles || createTrip.isPending}
            >
              {createTrip.isPending ? 'Saving...' : 'Log Trip'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
