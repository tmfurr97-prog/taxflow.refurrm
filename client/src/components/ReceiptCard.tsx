import { useState } from 'react';
import { Calendar, DollarSign, FileText, Edit2, Trash2, Check, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DuplicateReceiptsDialog } from './DuplicateReceiptsDialog';
import { detectDuplicates } from '@/utils/duplicateDetection';
import { supabase } from '@/lib/supabase';

interface ReceiptCardProps {
  receipt: any;
  onUpdate?: (id: string, data: any) => void;
  onDelete?: (id: string) => void;
}

const categories = [
  'Meals', 'Travel', 'Office Supplies', 'Equipment', 
  'Marketing', 'Professional Services', 'Vehicle', 'Utilities', 'Other'
];

export function ReceiptCard({ receipt, onUpdate, onDelete }: ReceiptCardProps) {
  const [showImage, setShowImage] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState(receipt);

  const handleSave = () => {
    onUpdate?.(receipt.id, editData);
    setEditing(false);
  };

  const confidenceColor = receipt.deduction_confidence > 0.8 ? 'text-green-600' : 
                          receipt.deduction_confidence > 0.5 ? 'text-yellow-600' : 'text-red-600';

  return (
    <>
      <Card className="p-4 hover:shadow-lg transition-shadow">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{receipt.vendor_name || 'Unknown Vendor'}</h3>
            <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              {new Date(receipt.receipt_date).toLocaleDateString()}
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-xl font-bold">
              <DollarSign className="w-5 h-5" />
              {receipt.amount.toFixed(2)}
            </div>
          </div>
        </div>


        <div className="flex gap-2 mb-3">
          <Badge variant="outline">{receipt.category}</Badge>
          {receipt.is_deductible && (
            <Badge className="bg-green-100 text-green-800">
              <Check className="w-3 h-3 mr-1" />
              Deductible
            </Badge>
          )}
        </div>

        {receipt.description && (
          <p className="text-sm text-gray-600 mb-3">{receipt.description}</p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Confidence:</span>
            <span className={`text-sm font-medium ${confidenceColor}`}>
              {(receipt.deduction_confidence * 100).toFixed(0)}%
            </span>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowImage(true)}
            >
              <FileText className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setEditing(true)}
            >
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete?.(receipt.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      <Dialog open={showImage} onOpenChange={setShowImage}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Receipt Image</DialogTitle>
          </DialogHeader>
          <img src={receipt.image_url} alt="Receipt" className="w-full rounded-lg" />
        </DialogContent>
      </Dialog>

      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Receipt</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Vendor</Label>
              <Input
                value={editData.vendor_name}
                onChange={(e) => setEditData({...editData, vendor_name: e.target.value})}
              />
            </div>
            <div>
              <Label>Amount</Label>
              <Input
                type="number"
                step="0.01"
                value={editData.amount}
                onChange={(e) => setEditData({...editData, amount: parseFloat(e.target.value)})}
              />
            </div>
            <div>
              <Label>Category</Label>
              <Select
                value={editData.category}
                onValueChange={(value) => setEditData({...editData, category: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
              <Button onClick={handleSave}>Save Changes</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}