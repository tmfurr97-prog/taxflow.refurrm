import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface TaxFormPreviewProps {
  formData: Record<string, any>;
  formType: string;
  onClose: () => void;
}

export function TaxFormPreview({ formData, formType, onClose }: TaxFormPreviewProps) {
  const formatLabel = (key: string) => {
    return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatValue = (value: any) => {
    if (typeof value === 'number') {
      return `$${value.toFixed(2)}`;
    }
    return value;
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {formType} Preview
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-semibold mb-4">Form Data</h3>
            <div className="grid gap-3">
              {Object.entries(formData).map(([key, value]) => (
                <div key={key} className="flex justify-between border-b pb-2">
                  <span className="text-sm font-medium">{formatLabel(key)}</span>
                  <span className="text-sm">{formatValue(value)}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Review the values above. You can close this preview and edit any values before generating the PDF.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
