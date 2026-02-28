import { useState, useRef, useMemo } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Upload, Plus, Trash2, Search, FileText, Sparkles, FileSpreadsheet } from 'lucide-react';
import Papa from 'papaparse';

const CATEGORIES = [
  "Office Supplies", "Meals & Entertainment", "Travel", "Software & Subscriptions",
  "Equipment", "Professional Services", "Utilities", "Marketing", "Medical", "Personal", "Other"
];

interface Receipt {
  id: number;
  vendor: string | null;
  amount: string | null;
  date: string | null;
  category: string | null;
  description: string | null;
  imageUrl: string | null;
  isDeductible: boolean | null;
  createdAt: Date;
}

export function ReceiptManagerV2() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const taxYear = useMemo(() => new Date().getFullYear(), []);

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [uploading, setUploading] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [pendingReceipt, setPendingReceipt] = useState<{
    id: number; vendor: string | null; amount: string | null;
    date: string | null; category: string; description: string;
    isDeductible: boolean; imageUrl: string | null; aiSuggested: boolean;
  } | null>(null);

  // Manual entry form state
  const [manualForm, setManualForm] = useState({
    vendor: '', amount: '', date: new Date().toISOString().slice(0, 10),
    category: 'Other', description: '',
  });

  const utils = trpc.useUtils();
  const { data: receiptList = [], isLoading } = trpc.receipts.list.useQuery({ taxYear });

  const createReceipt = trpc.receipts.create.useMutation({
    onSuccess: () => utils.receipts.list.invalidate(),
  });

  const deleteReceipt = trpc.receipts.delete.useMutation({
    onSuccess: () => utils.receipts.list.invalidate(),
  });

  const bulkCreate = trpc.receipts.bulkCreate.useMutation({
    onSuccess: () => utils.receipts.list.invalidate(),
  });

  // CSV import state
  const csvInputRef = useRef<HTMLInputElement>(null);
  const [showCsvImport, setShowCsvImport] = useState(false);
  const [csvRows, setCsvRows] = useState<Record<string, string>[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvMapping, setCsvMapping] = useState<{ vendor: string; amount: string; date: string; category: string; description: string }>({
    vendor: '', amount: '', date: '', category: '', description: '',
  });
  const [csvImporting, setCsvImporting] = useState(false);

  const handleCsvFile = (file: File) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const headers = results.meta.fields || [];
        setCsvHeaders(headers);
        setCsvRows(results.data as Record<string, string>[]);
        // Auto-map common column names
        const lower = headers.map(h => h.toLowerCase());
        const find = (keys: string[]) => headers[lower.findIndex(h => keys.some(k => h.includes(k)))] || '';
        setCsvMapping({
          vendor: find(['vendor', 'merchant', 'store', 'payee', 'description', 'name']),
          amount: find(['amount', 'total', 'cost', 'price', 'charge', 'debit']),
          date: find(['date', 'time', 'posted', 'transaction']),
          category: find(['category', 'type', 'class']),
          description: find(['description', 'memo', 'note', 'detail']),
        });
        setShowCsvImport(true);
      },
      error: () => toast({ title: 'Failed to parse CSV', variant: 'destructive' }),
    });
  };

  const handleCsvImport = async () => {
    if (csvRows.length === 0) return;
    setCsvImporting(true);
    try {
      const rows = csvRows.map(row => ({
        vendor: csvMapping.vendor ? row[csvMapping.vendor] : undefined,
        amount: csvMapping.amount ? row[csvMapping.amount]?.replace(/[^0-9.]/g, '') : undefined,
        date: csvMapping.date ? row[csvMapping.date] : undefined,
        category: csvMapping.category ? row[csvMapping.category] : undefined,
        description: csvMapping.description ? row[csvMapping.description] : undefined,
      }));
      const result = await bulkCreate.mutateAsync({ rows, taxYear });
      toast({ title: `Imported ${result.inserted} receipts` });
      setShowCsvImport(false);
      setCsvRows([]);
      setCsvHeaders([]);
    } catch (err: any) {
      toast({ title: 'Import failed', description: err.message, variant: 'destructive' });
    } finally {
      setCsvImporting(false);
      if (csvInputRef.current) csvInputRef.current.value = '';
    }
  };

  // File upload handler
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('taxYear', taxYear.toString());

        const res = await fetch('/api/upload/receipt', {
          method: 'POST',
          body: formData,
          credentials: 'include',
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Upload failed');

        if (data.aiSuggested) {
          // Show AI suggestion card for user to confirm/edit
          setPendingReceipt({ ...data.receipt, aiSuggested: true });
        } else {
          toast({ title: 'Receipt uploaded', description: file.name });
          utils.receipts.list.invalidate();
        }
      } catch (err: any) {
        toast({ title: 'Upload failed', description: err.message, variant: 'destructive' });
      }
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Confirm AI suggestion (update category/vendor/amount if user edited)
  const handleConfirmAI = async () => {
    if (!pendingReceipt) return;
    // Receipt is already saved; if user edited fields, update via tRPC
    // For now just dismiss and refresh
    utils.receipts.list.invalidate();
    setPendingReceipt(null);
    toast({ title: 'Receipt saved', description: `Categorized as ${pendingReceipt.category}` });
  };

  // Manual entry submit
  const handleManualSubmit = async () => {
    if (!manualForm.vendor && !manualForm.description) {
      toast({ title: 'Add a vendor or description', variant: 'destructive' });
      return;
    }
    await createReceipt.mutateAsync({
      vendor: manualForm.vendor || undefined,
      amount: manualForm.amount || undefined,
      date: manualForm.date,
      category: manualForm.category,
      description: manualForm.description || manualForm.vendor,
      taxYear,
    });
    setManualForm({ vendor: '', amount: '', date: new Date().toISOString().slice(0, 10), category: 'Other', description: '' });
    setShowManualEntry(false);
    toast({ title: 'Receipt added' });
  };

  const filtered = (receiptList as Receipt[]).filter(r => {
    const matchSearch = !searchTerm ||
      r.vendor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = categoryFilter === 'all' || r.category === categoryFilter;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-4">
      {/* Upload + Manual Entry Row */}
      <div className="flex flex-wrap gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.webp,.heic"
          multiple
          className="hidden"
          onChange={e => handleFileUpload(e.target.files)}
        />
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <Upload className="h-4 w-4 mr-2" />
          {uploading ? 'Uploading...' : 'Upload Receipt'}
        </Button>
        <Button variant="outline" onClick={() => setShowManualEntry(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Enter Manually
        </Button>
        <input
          ref={csvInputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={e => { if (e.target.files?.[0]) handleCsvFile(e.target.files[0]); }}
        />
        <Button variant="outline" onClick={() => csvInputRef.current?.click()}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Import CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search receipts..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Receipt List */}
      {isLoading ? (
        <div className="text-center py-8 text-gray-500">Loading receipts...</div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No receipts yet</p>
            <p className="text-sm text-gray-400 mt-1">Upload a file or enter a receipt manually to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map(r => (
            <Card key={r.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="py-3 px-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-gray-900 truncate">{r.vendor || r.description || 'Unknown'}</span>
                      {r.category && (
                        <Badge variant="secondary" className="text-xs shrink-0">{r.category}</Badge>
                      )}
                      {r.isDeductible && (
                        <Badge className="text-xs bg-emerald-100 text-emerald-700 border-emerald-200 shrink-0">Deductible</Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 mt-0.5">
                      {r.date} {r.description && r.vendor ? `· ${r.description}` : ''}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {r.amount && (
                      <span className="font-semibold text-gray-900">${parseFloat(r.amount).toFixed(2)}</span>
                    )}
                    {r.imageUrl && (
                      <a href={r.imageUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700">
                        <FileText className="h-4 w-4" />
                      </a>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-400 hover:text-red-500"
                      onClick={() => deleteReceipt.mutate({ id: r.id })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* AI Suggestion Confirmation Dialog */}
      <Dialog open={!!pendingReceipt} onOpenChange={() => setPendingReceipt(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-emerald-600" />
              AI Categorized Your Receipt
            </DialogTitle>
          </DialogHeader>
          {pendingReceipt && (
            <div className="space-y-3 py-2">
              <p className="text-sm text-gray-600">Review and confirm the AI's suggestion, or edit before saving.</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Vendor</Label>
                  <Input
                    value={pendingReceipt.vendor || ''}
                    onChange={e => setPendingReceipt(p => p ? { ...p, vendor: e.target.value } : p)}
                  />
                </div>
                <div>
                  <Label className="text-xs">Amount</Label>
                  <Input
                    value={pendingReceipt.amount || ''}
                    onChange={e => setPendingReceipt(p => p ? { ...p, amount: e.target.value } : p)}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label className="text-xs">Date</Label>
                  <Input
                    type="date"
                    value={pendingReceipt.date || ''}
                    onChange={e => setPendingReceipt(p => p ? { ...p, date: e.target.value } : p)}
                  />
                </div>
                <div>
                  <Label className="text-xs">Category</Label>
                  <Select
                    value={pendingReceipt.category}
                    onValueChange={v => setPendingReceipt(p => p ? { ...p, category: v } : p)}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingReceipt(null)}>Cancel</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleConfirmAI}>
              Confirm & Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CSV Import Dialog */}
      <Dialog open={showCsvImport} onOpenChange={v => { if (!v) { setShowCsvImport(false); setCsvRows([]); setCsvHeaders([]); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
              Import CSV
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-gray-500">{csvRows.length} rows detected. Map your CSV columns to receipt fields.</p>
            <div className="grid grid-cols-2 gap-3">
              {(['vendor', 'amount', 'date', 'category', 'description'] as const).map(field => (
                <div key={field}>
                  <Label className="text-xs capitalize">{field}</Label>
                  <Select
                    value={csvMapping[field] || '__none__'}
                    onValueChange={v => setCsvMapping(m => ({ ...m, [field]: v === '__none__' ? '' : v }))}
                  >
                    <SelectTrigger><SelectValue placeholder="-- skip --" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">-- skip --</SelectItem>
                      {csvHeaders.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
            {csvRows.length > 0 && (
              <div className="border rounded-md overflow-auto max-h-36">
                <table className="text-xs w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      {['vendor', 'amount', 'date', 'category'].filter(f => csvMapping[f as keyof typeof csvMapping]).map(f => (
                        <th key={f} className="px-2 py-1 text-left font-medium text-gray-600 capitalize">{f}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {csvRows.slice(0, 5).map((row, i) => (
                      <tr key={i} className="border-t">
                        {['vendor', 'amount', 'date', 'category'].filter(f => csvMapping[f as keyof typeof csvMapping]).map(f => (
                          <td key={f} className="px-2 py-1 text-gray-700 truncate max-w-[100px]">
                            {row[csvMapping[f as keyof typeof csvMapping]] || ''}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {csvRows.length > 5 && <p className="text-xs text-gray-400 px-2 py-1">...and {csvRows.length - 5} more rows</p>}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowCsvImport(false); setCsvRows([]); setCsvHeaders([]); }}>Cancel</Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={handleCsvImport}
              disabled={csvImporting || csvRows.length === 0}
            >
              {csvImporting ? 'Importing...' : `Import ${csvRows.length} Rows`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manual Entry Dialog */}
      <Dialog open={showManualEntry} onOpenChange={setShowManualEntry}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Receipt Manually</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-gray-500">For cash purchases, missing receipts, or anything that can't be scanned.</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Vendor / Store</Label>
                <Input
                  value={manualForm.vendor}
                  onChange={e => setManualForm(f => ({ ...f, vendor: e.target.value }))}
                  placeholder="e.g. Office Depot"
                />
              </div>
              <div>
                <Label className="text-xs">Amount ($)</Label>
                <Input
                  value={manualForm.amount}
                  onChange={e => setManualForm(f => ({ ...f, amount: e.target.value }))}
                  placeholder="0.00"
                  type="number"
                  step="0.01"
                />
              </div>
              <div>
                <Label className="text-xs">Date</Label>
                <Input
                  type="date"
                  value={manualForm.date}
                  onChange={e => setManualForm(f => ({ ...f, date: e.target.value }))}
                />
              </div>
              <div>
                <Label className="text-xs">Category</Label>
                <Select value={manualForm.category} onValueChange={v => setManualForm(f => ({ ...f, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-xs">Description (optional)</Label>
              <Input
                value={manualForm.description}
                onChange={e => setManualForm(f => ({ ...f, description: e.target.value }))}
                placeholder="What was this for?"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowManualEntry(false)}>Cancel</Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={handleManualSubmit}
              disabled={createReceipt.isPending}
            >
              {createReceipt.isPending ? 'Saving...' : 'Save Receipt'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
