import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Cpu } from 'lucide-react';

export function CryptoMinerDeductions() {
  const [electricity, setElectricity] = useState('');
  const [equipment, setEquipment] = useState('');
  const [internetCost, setInternetCost] = useState('');
  const [rentAllocation, setRentAllocation] = useState('');

  const totalDeductions = 
    (parseFloat(electricity) || 0) +
    (parseFloat(equipment) || 0) +
    (parseFloat(internetCost) || 0) +
    (parseFloat(rentAllocation) || 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cpu className="h-5 w-5" />
          Mining Deductions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Electricity Costs</Label>
          <Input
            type="number"
            placeholder="0.00"
            value={electricity}
            onChange={(e) => setElectricity(e.target.value)}
          />
        </div>
        <div>
          <Label>Mining Equipment Depreciation</Label>
          <Input
            type="number"
            placeholder="0.00"
            value={equipment}
            onChange={(e) => setEquipment(e.target.value)}
          />
        </div>
        <div>
          <Label>Internet Costs</Label>
          <Input
            type="number"
            placeholder="0.00"
            value={internetCost}
            onChange={(e) => setInternetCost(e.target.value)}
          />
        </div>
        <div>
          <Label>Rent/Space Allocation</Label>
          <Input
            type="number"
            placeholder="0.00"
            value={rentAllocation}
            onChange={(e) => setRentAllocation(e.target.value)}
          />
        </div>
        <div className="p-4 bg-muted rounded-lg">
          <div className="flex justify-between items-center">
            <span className="font-semibold">Total Mining Deductions:</span>
            <span className="text-2xl font-bold text-green-600">${totalDeductions.toFixed(2)}</span>
          </div>
        </div>
        <Button className="w-full">Save Deductions</Button>
      </CardContent>
    </Card>
  );
}