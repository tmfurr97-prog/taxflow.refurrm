import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export function VehicleExpenseTracker() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [expenseType, setExpenseType] = useState('gas');
  const [amount, setAmount] = useState('');
  const [vendor, setVendor] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('vehicle_expenses')
      .select('*')
      .eq('user_id', user.id)
      .order('expense_date', { ascending: false });

    setExpenses(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('vehicle_expenses').insert({
      user_id: user.id,
      expense_date: expenseDate,
      expense_type: expenseType,
      amount: parseFloat(amount),
      vendor,
      description
    });

    setAmount('');
    setVendor('');
    setDescription('');
    setShowForm(false);
    fetchExpenses();
  };

  const deleteExpense = async (id: string) => {
    await supabase.from('vehicle_expenses').delete().eq('id', id);
    fetchExpenses();
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="font-semibold">Vehicle Expenses</h3>
            <p className="text-sm text-gray-600">Total: ${totalExpenses.toFixed(2)}</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)}><Plus className="h-4 w-4 mr-2" />Add Expense</Button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="space-y-3 mb-4 p-4 bg-gray-50 rounded">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Date</Label>
                <Input type="date" value={expenseDate} onChange={(e) => setExpenseDate(e.target.value)} required />
              </div>
              <div>
                <Label>Type</Label>
                <Select value={expenseType} onValueChange={setExpenseType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gas">Gas</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="insurance">Insurance</SelectItem>
                    <SelectItem value="registration">Registration</SelectItem>
                    <SelectItem value="repairs">Repairs</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Amount</Label>
                <Input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />
              </div>
              <div>
                <Label>Vendor</Label>
                <Input value={vendor} onChange={(e) => setVendor(e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <Button type="submit" className="w-full">Save Expense</Button>
          </form>
        )}
      </Card>

      <div className="space-y-2">
        {expenses.map(expense => (
          <Card key={expense.id} className="p-4 flex justify-between items-center">
            <div>
              <div className="font-semibold">{expense.expense_date} - {expense.expense_type}</div>
              <div className="text-sm text-gray-600">{expense.vendor} {expense.description && `- ${expense.description}`}</div>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-semibold">${parseFloat(expense.amount).toFixed(2)}</span>
              <Button variant="ghost" size="sm" onClick={() => deleteExpense(expense.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}