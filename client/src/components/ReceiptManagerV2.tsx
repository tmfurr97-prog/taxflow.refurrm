import { useState, useRef, useMemo } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Upload, Plus, Trash2, Search, FileText, Sparkles, FileSpreadsheet, Pencil, Check, X } from 'lucide-react';
import Papa from 'papaparse';

const CATEGORIES = [
  "Office Supplies", "Meals & Entertainment", "Travel", "Software & Subscriptions",
  "Equipment", "Professional Services", "Utilities", "Marketing", "Medical",
  "Bank Statements & Fees", "Contractor Payments", "Personal", "Other"
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

interface EditState {
  vendor: string;
  amount: string;
  date: string;
  category: string;
  description: string;
  isDeductible: boolean;
}

export function ReceiptManagerV2() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const taxYear = useMemo(() => new Date().getFullYear(), []);

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [uploading, setUploading] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editState, setEditState] = useState<EditState | null>(null);
  const [pendingReceipt, setPendingReceipt] = useState<{
    id: number; vendor: string | null; amount: string | null;
    date: string | null; category: string; description: string;
    isDeductible: boolean; imageUrl: string | null; aiSuggested: boolean;
  } | null>(null);

  const [manualForm, setManualForm] = useState({
    vendor: '', amount: '', date: new Date().toISOString().slice(0, 10),
    category: 'Other', description: '',
  });

  const utils = trpc.useUtils();
  const { data: receiptList = [], isLoading } = trpc.receipts.list.useQuery({ taxYear });

  const createReceipt = trpc.receipts.create.useMutation({
    onSuccess: () => utils.receipts.list.invalidate(),
  });

  const updateReceipt = trpc.receipts.update.useMutation({
    onSuccess: () => {
      utils.receipts.list.invalidate();
      setEditingId(null);
      setEditState(null);
    },
    onError: (err) => toast({ title: 'Save failed', description: err.message, variant: 'destructive' }),
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
      toast({ title: `Imported ${result.inserted} entries` });
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
          setPendingReceipt({ ...data.receipt, aiSuggested: true });
        } else {
          toast({ title: 'Document uploaded', description: file.name });
          utils.receipts.list.invalidate();
        }
      } catch (err: any) {
        toast({ title: 'Upload failed', description: err.message, variant: 'destructive' });
      }
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleConfirmAI = async () => {
    if (!pendingReceipt) return;
    await updateReceipt.mutateAsync({
      id: pendingReceipt.id,
      vendor: pendingReceipt.vendor,
      amount: pendingReceipt.amount,
      date: pendingReceipt.date || undefined,
      category: pendingReceipt.category,
      description: pendingReceipt.description,
      isDeductible: pendingReceipt.isDeductible,
    });
    setPendingReceipt(null);
    toast({ title: 'Entry saved', description: `Categorized as ${pendingReceipt.category}` });
  };

  const startEdit = (r: Receipt) => {
    setEditingId(r.id);
    setEditState({
      vendor: r.vendor || '',
      amount: r.amount || '',
      date: r.date || new Date().toISOString().slice(0, 10),
      category: r.category || 'Other',
      description: r.description || '',
      isDeductible: r.isDeductible !== false,
    });
  };

  const saveEdit = () => {
    if (!editingId || !editState) return;
    updateReceipt.mutate({
      id: editingId,
      vendor: editState.vendor || null,
      amount: editState.amount || null,
      date: editState.date,
      category: editState.category,
      description: editState.description,
      isDeductible: editState.isDeductible,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditState(null);
  };

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
    toast({ title: 'Entry added' });
  };

  const filtered = (receiptList as Receipt[]).filter(r => {
    const matchSearch = !searchTerm ||
      r.vendor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = categoryFilter === 'all' || r.category === categoryFilter;
    return matchSearch && matchCat;
  });

  // Running totals
  const totalDeductible = filtered
    .filter(r => r.isDeductible)
    .reduce((sum, r) => sum + (parseFloat(r.amount || '0') || 0), 0);
  const totalAll = filtered
    .reduce((sum, r) => sum + (parseFloat(r.amount || '0') || 0), 0);

  return (
    <div className="space-y-4">
      {/* Action Bar */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-2">
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
            {uploading ? 'Processing...' : 'Upload Document'}
          </Button>
          <Button variant="outline" onClick={() => setShowManualEntry(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Entry
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
        {/* Totals summary */}
        {filtered.length > 0 && (
          <div className="flex gap-4 text-sm">
            <span className="text-gray-500">{filtered.length} entries</span>
            <span className="text-gray-500">Total: <span className="font-semibold text-gray-900">${totalAll.toFixed(2)}</span></span>
            <span className="text-gray-500">Deductible: <span className="font-semibold text-emerald-700">${totalDeductible.toFixed(2)}</span></span>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search ledger..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Ledger Table */}
      {isLoading ? (
        <div className="text-center py-8 text-gray-500">Loading ledger...</div>
      ) : filtered.length === 0 ? (
        <div className="border border-dashed border-gray-200 rounded-lg py-12 text-center">
          <FileText className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No entries yet</p>
          <p className="text-sm text-gray-400 mt-1">Upload a document, import a CSV, or add an entry manually.</p>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-3 py-2.5 font-medium text-gray-600 w-[100px]">Date</th>
                <th className="text-left px-3 py-2.5 font-medium text-gray-600">Vendor / Payee</th>
                <th className="text-left px-3 py-2.5 font-medium text-gray-600 hidden md:table-cell">Category</th>
                <th className="text-left px-3 py-2.5 font-medium text-gray-600 hidden lg:table-cell">Description</th>
                <th className="text-center px-3 py-2.5 font-medium text-gray-600 w-[90px]">Deductible</th>
                <th className="text-right px-3 py-2.5 font-medium text-gray-600 w-[100px]">Amount</th>
                <th className="text-right px-3 py-2.5 font-medium text-gray-600 w-[80px]">Doc</th>
                <th className="w-[72px]"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, idx) => {
                const isEditing = editingId === r.id;
                return (
                  <tr
                    key={r.id}
                    className={`border-b border-gray-100 last:border-0 ${isEditing ? 'bg-emerald-50' : idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'} hover:bg-emerald-50/30 transition-colors`}
                  >
                    {/* Date */}
                    <td className="px-3 py-2">
                      {isEditing ? (
                        <Input
                          type="date"
                          value={editState!.date}
                          onChange={e => setEditState(s => s ? { ...s, date: e.target.value } : s)}
                          className="h-7 text-xs px-1.5"
                        />
                      ) : (
                        <span className="text-gray-600 tabular-nums">{r.date || '—'}</span>
                      )}
                    </td>

                    {/* Vendor */}
                    <td className="px-3 py-2">
                      {isEditing ? (
                        <Input
                          value={editState!.vendor}
                          onChange={e => setEditState(s => s ? { ...s, vendor: e.target.value } : s)}
                          className="h-7 text-xs px-1.5"
                          placeholder="Vendor / Payee"
                        />
                      ) : (
                        <span className="font-medium text-gray-900">{r.vendor || r.description || '—'}</span>
                      )}
                    </td>

                    {/* Category */}
                    <td className="px-3 py-2 hidden md:table-cell">
                      {isEditing ? (
                        <Select
                          value={editState!.category}
                          onValueChange={v => setEditState(s => s ? { ...s, category: v } : s)}
                        >
                          <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge variant="secondary" className="text-xs font-normal">{r.category || 'Uncategorized'}</Badge>
                      )}
                    </td>

                    {/* Description */}
                    <td className="px-3 py-2 hidden lg:table-cell">
                      {isEditing ? (
                        <Input
                          value={editState!.description}
                          onChange={e => setEditState(s => s ? { ...s, description: e.target.value } : s)}
                          className="h-7 text-xs px-1.5"
                          placeholder="Notes"
                        />
                      ) : (
                        <span className="text-gray-500 truncate max-w-[200px] block">{r.description || ''}</span>
                      )}
                    </td>

                    {/* Deductible toggle */}
                    <td className="px-3 py-2 text-center">
                      {isEditing ? (
                        <button
                          type="button"
                          onClick={() => setEditState(s => s ? { ...s, isDeductible: !s.isDeductible } : s)}
                          className={`text-xs px-2 py-0.5 rounded-full border font-medium transition-colors ${editState!.isDeductible ? 'bg-emerald-100 text-emerald-700 border-emerald-300' : 'bg-gray-100 text-gray-500 border-gray-200'}`}
                        >
                          {editState!.isDeductible ? 'Yes' : 'No'}
                        </button>
                      ) : (
                        r.isDeductible ? (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 font-medium">Yes</span>
                        ) : (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-400 border border-gray-200">No</span>
                        )
                      )}
                    </td>

                    {/* Amount */}
                    <td className="px-3 py-2 text-right">
                      {isEditing ? (
                        <Input
                          value={editState!.amount}
                          onChange={e => setEditState(s => s ? { ...s, amount: e.target.value } : s)}
                          className="h-7 text-xs px-1.5 text-right"
                          placeholder="0.00"
                          type="number"
                          step="0.01"
                        />
                      ) : (
                        <span className="font-semibold tabular-nums text-gray-900">
                          {r.amount ? `$${parseFloat(r.amount).toFixed(2)}` : '—'}
                        </span>
                      )}
                    </td>

                    {/* Doc link */}
                    <td className="px-3 py-2 text-right">
                      {r.imageUrl ? (
                        <a
                          href={r.imageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-700 inline-flex items-center justify-end"
                          title="View document"
                        >
                          <FileText className="h-4 w-4" />
                        </a>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-2 py-2">
                      <div className="flex items-center gap-1 justify-end">
                        {isEditing ? (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100"
                              onClick={saveEdit}
                              disabled={updateReceipt.isPending}
                              title="Save"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-gray-400 hover:text-gray-600"
                              onClick={cancelEdit}
                              title="Cancel"
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-gray-400 hover:text-emerald-600"
                              onClick={() => startEdit(r)}
                              title="Edit"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-gray-400 hover:text-red-500"
                              onClick={() => deleteReceipt.mutate({ id: r.id })}
                              title="Delete"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {/* Footer totals row */}
            {filtered.length > 0 && (
              <tfoot>
                <tr className="bg-gray-50 border-t-2 border-gray-200">
                  <td colSpan={4} className="px-3 py-2.5 text-sm font-medium text-gray-600">
                    {filtered.length} {filtered.length === 1 ? 'entry' : 'entries'}
                  </td>
                  <td className="px-3 py-2.5 text-center text-xs text-emerald-700 font-medium">
                    ${totalDeductible.toFixed(2)} deductible
                  </td>
                  <td className="px-3 py-2.5 text-right font-bold text-gray-900 tabular-nums">
                    ${totalAll.toFixed(2)}
                  </td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}

      {/* AI Suggestion Confirmation Dialog */}
      <Dialog open={!!pendingReceipt} onOpenChange={() => setPendingReceipt(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-emerald-600" />
              AI Categorized Your Document
            </DialogTitle>
          </DialogHeader>
          {pendingReceipt && (
            <div className="space-y-3 py-2">
              <p className="text-sm text-gray-500">Review and edit before saving to the ledger.</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Vendor / Payee</Label>
                  <Input
                    value={pendingReceipt.vendor || ''}
                    onChange={e => setPendingReceipt(p => p ? { ...p, vendor: e.target.value } : p)}
                    placeholder="e.g. Cash App"
                  />
                </div>
                <div>
                  <Label className="text-xs">Amount ($)</Label>
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
              <div>
                <Label className="text-xs">Description</Label>
                <Input
                  value={pendingReceipt.description || ''}
                  onChange={e => setPendingReceipt(p => p ? { ...p, description: e.target.value } : p)}
                  placeholder="What is this document?"
                />
              </div>
              <div className="flex items-center gap-3">
                <Label className="text-xs">Deductible?</Label>
                <button
                  type="button"
                  onClick={() => setPendingReceipt(p => p ? { ...p, isDeductible: !p.isDeductible } : p)}
                  className={`text-xs px-3 py-1 rounded-full border font-medium transition-colors ${pendingReceipt.isDeductible ? 'bg-emerald-100 text-emerald-700 border-emerald-300' : 'bg-gray-100 text-gray-500 border-gray-200'}`}
                >
                  {pendingReceipt.isDeductible ? 'Yes — Business Expense' : 'No — Not Deductible'}
                </button>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setPendingReceipt(null); utils.receipts.list.invalidate(); }}>
              Skip (keep AI result)
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleConfirmAI} disabled={updateReceipt.isPending}>
              {updateReceipt.isPending ? 'Saving...' : 'Save to Ledger'}
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
            <p className="text-sm text-gray-500">{csvRows.length} rows detected. Map your columns to ledger fields.</p>
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
            <DialogTitle>Add Ledger Entry</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-gray-500">For cash purchases, missing receipts, or any transaction not captured by upload.</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Vendor / Payee</Label>
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
              {createReceipt.isPending ? 'Saving...' : 'Add to Ledger'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
