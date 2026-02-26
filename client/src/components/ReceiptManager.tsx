import { useState, useEffect } from 'react';
import { Search, Filter, Download, TrendingUp, Receipt } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { ReceiptUpload } from './ReceiptUpload';
import { ReceiptCard } from './ReceiptCard';

export function ReceiptManager() {
  const [receipts, setReceipts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [deductibleFilter, setDeductibleFilter] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    loadReceipts();
  }, []);

  const loadReceipts = async () => {
    try {
      const { data, error } = await supabase
        .from('receipts')
        .select('*')
        .order('receipt_date', { ascending: false });

      if (error) throw error;
      setReceipts(data || []);
    } catch (error: any) {
      toast({
        title: 'Error loading receipts',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id: string, data: any) => {
    try {
      const { error } = await supabase
        .from('receipts')
        .update(data)
        .eq('id', id);

      if (error) throw error;

      setReceipts(receipts.map(r => r.id === id ? { ...r, ...data } : r));
      toast({ title: 'Receipt updated successfully' });
    } catch (error: any) {
      toast({
        title: 'Error updating receipt',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('receipts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setReceipts(receipts.filter(r => r.id !== id));
      toast({ title: 'Receipt deleted successfully' });
    } catch (error: any) {
      toast({
        title: 'Error deleting receipt',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const filteredReceipts = receipts.filter(receipt => {
    const matchesSearch = receipt.vendor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          receipt.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || receipt.category === categoryFilter;
    const matchesDeductible = deductibleFilter === 'all' || 
                              (deductibleFilter === 'deductible' && receipt.is_deductible) ||
                              (deductibleFilter === 'non-deductible' && !receipt.is_deductible);
    
    return matchesSearch && matchesCategory && matchesDeductible;
  });

  const totalAmount = filteredReceipts.reduce((sum, r) => sum + (r.amount || 0), 0);
  const deductibleAmount = filteredReceipts
    .filter(r => r.is_deductible)
    .reduce((sum, r) => sum + (r.amount || 0), 0);

  const exportCSV = () => {
    const csv = [
      ['Date', 'Vendor', 'Amount', 'Category', 'Tax Category', 'Deductible'],
      ...filteredReceipts.map(r => [
        r.receipt_date,
        r.vendor_name,
        r.amount,
        r.category,
        r.tax_category,
        r.is_deductible ? 'Yes' : 'No'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipts_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Expenses</p>
              <p className="text-2xl font-bold">${totalAmount.toFixed(2)}</p>
            </div>
            <Receipt className="w-8 h-8 text-blue-600" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Tax Deductible</p>
              <p className="text-2xl font-bold">${deductibleAmount.toFixed(2)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Potential Savings</p>
              <p className="text-2xl font-bold">${(deductibleAmount * 0.25).toFixed(2)}</p>
            </div>
            <Filter className="w-8 h-8 text-purple-600" />
          </div>
        </Card>
      </div>

      <Tabs defaultValue="receipts" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="receipts">All Receipts</TabsTrigger>
          <TabsTrigger value="upload">Upload New</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-6">
          <ReceiptUpload onUploadComplete={() => loadReceipts()} />
        </TabsContent>

        <TabsContent value="receipts" className="mt-6 space-y-4">
          <Card className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search receipts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Meals">Meals</SelectItem>
                  <SelectItem value="Travel">Travel</SelectItem>
                  <SelectItem value="Office Supplies">Office Supplies</SelectItem>
                  <SelectItem value="Equipment">Equipment</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Professional Services">Professional Services</SelectItem>
                  <SelectItem value="Vehicle">Vehicle</SelectItem>
                  <SelectItem value="Utilities">Utilities</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              <Select value={deductibleFilter} onValueChange={setDeductibleFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Receipts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Receipts</SelectItem>
                  <SelectItem value="deductible">Deductible Only</SelectItem>
                  <SelectItem value="non-deductible">Non-Deductible</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={exportCSV} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </Card>

          {loading ? (
            <div className="text-center py-8">Loading receipts...</div>
          ) : filteredReceipts.length === 0 ? (
            <Card className="p-8 text-center">
              <Receipt className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No receipts found</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredReceipts.map(receipt => (
                <ReceiptCard
                  key={receipt.id}
                  receipt={receipt}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}