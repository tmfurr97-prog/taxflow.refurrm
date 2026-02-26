import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, CheckCircle, AlertCircle, MapPin, Flag } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { stateTaxData } from '@/data/stateTaxData';

interface Payment {
  id: string;
  year: number;
  quarter: number;
  due_date: string;
  estimated_amount: number;
  paid_amount: number;
  paid_date: string | null;
  payment_type: string;
  state?: string;
  state_amount?: number;
}

const QUARTER_DEADLINES = [
  { quarter: 1, month: 'April', day: 15, monthIndex: 3 },
  { quarter: 2, month: 'June', day: 15, monthIndex: 5 },
  { quarter: 3, month: 'September', day: 15, monthIndex: 8 },
  { quarter: 4, month: 'January', day: 15, monthIndex: 0 }
];

export function QuarterlyPayments({ estimatedAmount }: { estimatedAmount: number }) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    initializePayments();
  }, [estimatedAmount]);

  const initializePayments = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data: existing } = await supabase
      .from('estimated_tax_payments')
      .select('*')
      .eq('user_id', user.id)
      .eq('year', currentYear);

    if (!existing || existing.length === 0) {
      const newPayments = QUARTER_DEADLINES.map(({ quarter, day, monthIndex }) => ({
        user_id: user.id,
        year: currentYear,
        quarter,
        due_date: new Date(quarter === 4 ? currentYear + 1 : currentYear, monthIndex, day).toISOString().split('T')[0],
        estimated_amount: estimatedAmount || 0,
        paid_amount: 0
      }));

      await supabase.from('estimated_tax_payments').insert(newPayments);
    } else if (estimatedAmount > 0) {
      await supabase
        .from('estimated_tax_payments')
        .update({ estimated_amount: estimatedAmount })
        .eq('user_id', user.id)
        .eq('year', currentYear)
        .eq('paid_amount', 0);
    }

    loadPayments();
  };

  const loadPayments = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('estimated_tax_payments')
      .select('*')
      .eq('user_id', user.id)
      .eq('year', currentYear)
      .order('quarter');

    setPayments(data || []);
    setLoading(false);
  };

  const markAsPaid = async (paymentId: string, amount: number) => {
    const { error } = await supabase
      .from('estimated_tax_payments')
      .update({
        paid_amount: amount,
        paid_date: new Date().toISOString()
      })
      .eq('id', paymentId);

    if (error) {
      toast({ title: 'Error updating payment', variant: 'destructive' });
    } else {
      toast({ title: 'Payment marked as paid' });
      loadPayments();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          {currentYear} Quarterly Payments
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {QUARTER_DEADLINES.map(({ quarter, month, day, monthIndex }) => {
            const payment = payments.find(p => p.quarter === quarter);
            const isPaid = payment && payment.paid_amount > 0;
            const dueDate = new Date(quarter === 4 ? currentYear + 1 : currentYear, monthIndex, day);
            const isOverdue = !isPaid && dueDate < new Date();
            const amount = payment?.estimated_amount || estimatedAmount;

            return (
              <div key={quarter} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Q{quarter} {currentYear}</span>
                    {isPaid ? (
                      <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Paid</Badge>
                    ) : isOverdue ? (
                      <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Overdue</Badge>
                    ) : (
                      <Badge variant="outline">Due</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">Due: {month} {day}</p>
                  <p className="text-lg font-bold text-blue-600">${amount.toFixed(2)}</p>
                </div>
                <div className="flex gap-2">
                  {!isPaid && payment && (
                    <Button size="sm" onClick={() => markAsPaid(payment.id, amount)}>
                      Mark Paid
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
