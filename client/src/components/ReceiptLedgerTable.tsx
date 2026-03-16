import { useState } from 'react';
import { Edit2, Trash2, ExternalLink, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const CATEGORIES = [
  'Office Supplies',
  'Meals & Entertainment',
  'Travel',
  'Software & Subscriptions',
  'Equipment',
  'Professional Services',
  'Utilities',
  'Marketing',
  'Medical',
  'Bank Statements & Fees',
  'Contractor Payments',
  'Mileage',
  'Gas',
  'Personal',
  'Other',
];

const TYPES = [
  { value: 'deduction', label: 'Deduction', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'expense', label: 'Expense', color: 'bg-blue-100 text-blue-700' },
  { value: 'income', label: 'Income', color: 'bg-purple-100 text-purple-700' },
];

interface Receipt {
  id: number;
  vendor?: string;
  amount?: string;
  date: string;
  category: string;
  description: string;
  imageUrl?: string;
  isDeductible: boolean;
  notes?: string;
}

interface ReceiptLedgerTableProps {
  receipts: Receipt[];
  onUpdate: (id: number, updates: Partial<Receipt>) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  isLoading?: boolean;
}

export default function ReceiptLedgerTable({
  receipts,
  onUpdate,
  onDelete,
  isLoading = false,
}: ReceiptLedgerTableProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<Receipt>>({});
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [notesId, setNotesId] = useState<number | null>(null);
  const [notesText, setNotesText] = useState('');

  const handleEdit = (receipt: Receipt) => {
    setEditingId(receipt.id);
    setEditData({
      vendor: receipt.vendor,
      amount: receipt.amount,
      date: receipt.date,
      category: receipt.category,
      description: receipt.description,
      isDeductible: receipt.isDeductible,
    });
  };

  const handleSaveEdit = async () => {
    if (editingId) {
      await onUpdate(editingId, editData);
      setEditingId(null);
      setEditData({});
    }
  };

  const handleOpenNotes = (receipt: Receipt) => {
    setNotesId(receipt.id);
    setNotesText(receipt.notes || '');
    setNotesDialogOpen(true);
  };

  const handleSaveNotes = async () => {
    if (notesId) {
      await onUpdate(notesId, { notes: notesText });
      setNotesDialogOpen(false);
      setNotesId(null);
      setNotesText('');
    }
  };

  const getTypeLabel = (isDeductible: boolean): string => {
    return isDeductible ? 'Deduction' : 'Expense';
  };

  const getTypeColor = (isDeductible: boolean): string => {
    return isDeductible ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700';
  };

  if (receipts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No documents yet. Upload your first document to get started.</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Description</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Category</th>
              <th className="text-right py-3 px-4 font-semibold text-gray-700">Amount</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-700">Doc</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-700">Notes</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {receipts.map((receipt) => (
              <tr key={receipt.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                <td className="py-3 px-4 text-gray-900">{receipt.date}</td>
                <td className="py-3 px-4">
                  <Badge className={getTypeColor(receipt.isDeductible)}>
                    {getTypeLabel(receipt.isDeductible)}
                  </Badge>
                </td>
                <td className="py-3 px-4">
                  {editingId === receipt.id ? (
                    <Input
                      value={editData.description || ''}
                      onChange={(e) =>
                        setEditData({ ...editData, description: e.target.value })
                      }
                      className="text-sm"
                    />
                  ) : (
                    <span className="text-gray-900">{receipt.description || receipt.vendor || 'Untitled'}</span>
                  )}
                </td>
                <td className="py-3 px-4">
                  {editingId === receipt.id ? (
                    <Select
                      value={editData.category || ''}
                      onValueChange={(value) =>
                        setEditData({ ...editData, category: value })
                      }
                    >
                      <SelectTrigger className="text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <span className="text-gray-700 text-sm">{receipt.category}</span>
                  )}
                </td>
                <td className="py-3 px-4 text-right">
                  {editingId === receipt.id ? (
                    <Input
                      type="number"
                      step="0.01"
                      value={editData.amount || ''}
                      onChange={(e) =>
                        setEditData({ ...editData, amount: e.target.value })
                      }
                      className="text-sm text-right"
                    />
                  ) : (
                    <span className="font-semibold text-emerald-600">
                      {receipt.amount ? `$${parseFloat(receipt.amount).toFixed(2)}` : '—'}
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 text-center">
                  {receipt.imageUrl && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="w-7 h-7 text-gray-500 hover:text-gray-900"
                      asChild
                    >
                      <a href={receipt.imageUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                  )}
                </td>
                <td className="py-3 px-4 text-center">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="w-7 h-7 text-gray-500 hover:text-gray-900"
                    onClick={() => handleOpenNotes(receipt)}
                  >
                    <MessageSquare className="w-4 h-4" />
                  </Button>
                </td>
                <td className="py-3 px-4 text-center">
                  <div className="flex items-center justify-center gap-1">
                    {editingId === receipt.id ? (
                      <>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="w-7 h-7 text-emerald-600 hover:text-emerald-700"
                          onClick={handleSaveEdit}
                          disabled={isLoading}
                        >
                          ✓
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="w-7 h-7 text-gray-500 hover:text-gray-900"
                          onClick={() => setEditingId(null)}
                          disabled={isLoading}
                        >
                          ✕
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="w-7 h-7 text-gray-500 hover:text-gray-900"
                          onClick={() => handleEdit(receipt)}
                          disabled={isLoading}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="w-7 h-7 text-gray-500 hover:text-red-500"
                          onClick={() => onDelete(receipt.id)}
                          disabled={isLoading}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Notes Dialog */}
      <Dialog open={notesDialogOpen} onOpenChange={setNotesDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add or Edit Notes</DialogTitle>
          </DialogHeader>
          <Textarea
            value={notesText}
            onChange={(e) => setNotesText(e.target.value)}
            placeholder="Add notes about this document (visible to you and TaxGPT)..."
            className="min-h-24"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setNotesDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveNotes} className="bg-emerald-600 hover:bg-emerald-700">
              Save Notes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
