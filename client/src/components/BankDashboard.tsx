import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { CreditCard, TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  institution_name: string;
}

interface Stats {
  totalDeductible: number;
  monthlySpending: number;
  categorizedCount: number;
  needsReviewCount: number;
}

export function BankDashboard() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalDeductible: 0,
    monthlySpending: 0,
    categorizedCount: 0,
    needsReviewCount: 0
  });

  useEffect(() => {
    fetchAccounts();
    fetchStats();
  }, []);

  const fetchAccounts = async () => {
    const { data } = await supabase
      .from('bank_accounts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setAccounts(data);
  };

  const fetchStats = async () => {
    const { data: transactions } = await supabase
      .from('transactions')
      .select('*');

    if (transactions) {
      const deductible = transactions
        .filter((t: any) => t.is_tax_deductible)
        .reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0);

      const thisMonth = new Date();
      thisMonth.setDate(1);
      const monthly = transactions
        .filter((t: any) => new Date(t.date) >= thisMonth)
        .reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0);

      setStats({
        totalDeductible: deductible,
        monthlySpending: monthly,
        categorizedCount: transactions.filter((t: any) => t.tax_category).length,
        needsReviewCount: transactions.filter((t: any) => t.needs_review).length
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tax Deductible</p>
                <p className="text-2xl font-bold text-green-600">${stats.totalDeductible.toFixed(2)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Monthly Spending</p>
                <p className="text-2xl font-bold">${stats.monthlySpending.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Categorized</p>
                <p className="text-2xl font-bold">{stats.categorizedCount}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Needs Review</p>
                <p className="text-2xl font-bold text-orange-600">{stats.needsReviewCount}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Connected Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          {accounts.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No accounts connected yet</p>
          ) : (
            <div className="space-y-3">
              {accounts.map((account) => (
                <div key={account.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">{account.name}</p>
                      <p className="text-sm text-gray-500">{account.institution_name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">${account.balance?.toFixed(2) || '0.00'}</p>
                    <Badge variant="secondary">{account.type}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}