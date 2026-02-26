import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { FileText, Upload, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from './ui/use-toast';
import { TransactionFilters } from './TransactionFilters';
import { CategorySuggestions } from './CategorySuggestions';

interface Transaction {
  id: string;
  name: string;
  amount: number;
  date: string;
  category: string;
  merchant_name: string;
  is_tax_deductible: boolean;
  needs_review: boolean;
  tax_category: string;
  receipt_url: string;
  notes: string;
}

const TAX_CATEGORIES = [
  'Office Supplies', 'Travel', 'Meals & Entertainment', 'Vehicle',
  'Professional Services', 'Advertising', 'Insurance', 'Utilities',
  'Education', 'Home Office', 'Charitable', 'Medical', 'Other'
];

export function TransactionReview() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, [filter]);

  const fetchTransactions = async () => {
    let query = supabase.from('transactions').select('*');
    
    if (filter === 'needs_review') {
      query = query.eq('needs_review', true);
    } else if (filter === 'deductible') {
      query = query.eq('is_tax_deductible', true);
    }
    
    const { data } = await query.order('date', { ascending: false });
    if (data) setTransactions(data);
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    const { error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', id);

    if (!error) {
      fetchTransactions();
      toast({ title: 'Transaction updated' });
    }
  };

  const handleFileUpload = async (transactionId: string, file: File) => {
    const fileName = `${transactionId}-${file.name}`;
    const { data, error } = await supabase.storage
      .from('receipts')
      .upload(fileName, file);

    if (!error && data) {
      const { data: urlData } = supabase.storage
        .from('receipts')
        .getPublicUrl(fileName);
      
      await updateTransaction(transactionId, { receipt_url: urlData.publicUrl });
    }
  };

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.merchant_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'All Categories' || t.tax_category === categoryFilter;
    
    const matchesDateRange = (!startDate || t.date >= startDate) && (!endDate || t.date <= endDate);
    
    return matchesSearch && matchesCategory && matchesDateRange;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('All Categories');
    setStartDate('');
    setEndDate('');
    setFilter('all');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction Review</CardTitle>
        <TransactionFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filter={filter}
          onFilterChange={setFilter}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={setCategoryFilter}
          startDate={startDate}
          onStartDateChange={setStartDate}
          endDate={endDate}
          onEndDateChange={setEndDate}
          onClearFilters={clearFilters}
        />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredTransactions.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No transactions found</p>
          ) : (
            filteredTransactions.map((transaction) => (
              <div key={transaction.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold">{transaction.name}</h3>
                    <p className="text-sm text-gray-500">{transaction.merchant_name || 'Unknown'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">${Math.abs(transaction.amount).toFixed(2)}</p>
                    <p className="text-sm text-gray-500">{transaction.date}</p>
                  </div>
                </div>

                <CategorySuggestions
                  transactionName={transaction.name}
                  merchantName={transaction.merchant_name || ''}
                  amount={transaction.amount}
                  onSelectCategory={(category) => 
                    updateTransaction(transaction.id, { tax_category: category, is_tax_deductible: true })
                  }
                />

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                  <Select
                    value={transaction.tax_category || ''}
                    onValueChange={(value) => updateTransaction(transaction.id, { tax_category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tax Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {TAX_CATEGORIES.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={transaction.is_tax_deductible}
                      onCheckedChange={(checked) => 
                        updateTransaction(transaction.id, { is_tax_deductible: !!checked })
                      }
                    />
                    <label className="text-sm">Tax Deductible</label>
                  </div>

                  <div className="flex gap-2">
                    {transaction.receipt_url ? (
                      <Badge variant="secondary">
                        <FileText className="mr-1 h-3 w-3" />
                        Receipt
                      </Badge>
                    ) : (
                      <label className="cursor-pointer">
                        <Input
                          type="file"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(transaction.id, file);
                          }}
                        />
                        <Button size="sm" variant="outline">
                          <Upload className="h-4 w-4" />
                        </Button>
                      </label>
                    )}
                    
                    {transaction.needs_review && (
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => updateTransaction(transaction.id, { needs_review: false })}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <Input
                  placeholder="Add notes..."
                  value={transaction.notes || ''}
                  onChange={(e) => updateTransaction(transaction.id, { notes: e.target.value })}
                  className="mt-3"
                />
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}