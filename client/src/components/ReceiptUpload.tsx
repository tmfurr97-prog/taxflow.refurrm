import { useState, useCallback } from 'react';
import { Upload, Loader2, FileText, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { ReceiptMatchingDialog } from './ReceiptMatchingDialog';
import { DuplicateReceiptsDialog } from './DuplicateReceiptsDialog';
import { detectDuplicates } from '@/utils/duplicateDetection';

interface ReceiptUploadProps {
  onUploadComplete?: (receipt: any) => void;
}



export function ReceiptUpload({ onUploadComplete }: ReceiptUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [matchingReceipt, setMatchingReceipt] = useState<any>(null);
  const [showMatchDialog, setShowMatchDialog] = useState(false);
  const [duplicates, setDuplicates] = useState<any[]>([]);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const { toast } = useToast();


  const processReceipt = async (file: File) => {
    try {
      setUploading(true);

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${(await supabase.auth.getUser()).data.user?.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('receipt-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('receipt-images')
        .getPublicUrl(filePath);

      // Process with OCR
      const { data: ocrData, error: ocrError } = await supabase.functions.invoke('process-receipt-ocr', {
        body: { imageUrl: publicUrl }
      });

      if (ocrError) throw ocrError;

      // Save to database
      const { data: receipt, error: dbError } = await supabase
        .from('receipts')
        .insert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          image_url: publicUrl,
          vendor_name: ocrData.data.vendor,
          amount: ocrData.data.amount,
          receipt_date: ocrData.data.date,
          category: ocrData.data.category,
          tax_category: ocrData.data.taxCategory,
          is_deductible: ocrData.data.isDeductible,
          deduction_confidence: ocrData.data.confidence,
          raw_ocr_text: ocrData.data.rawText,
          ai_analysis: ocrData.data,
          status: 'completed'
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // Check for duplicates
      const { data: existingReceipts } = await supabase
        .from('receipts')
        .select('*')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .neq('id', receipt.id);

      const foundDuplicates = detectDuplicates(
        {
          id: receipt.id,
          amount: ocrData.data.amount,
          date: ocrData.data.date,
          merchant_name: ocrData.data.vendor,
          category: ocrData.data.category,
          image_url: publicUrl,
          created_at: receipt.created_at
        },
        existingReceipts || []
      );

      toast({
        title: 'Receipt processed successfully',
        description: `${ocrData.data.vendor} - $${ocrData.data.amount}`,
      });

      // Show duplicate warning if found
      if (foundDuplicates.length > 0) {
        setMatchingReceipt(receipt);
        setDuplicates(foundDuplicates);
        setShowDuplicateDialog(true);
      } else {
        // Open matching dialog
        setMatchingReceipt(receipt);
        setShowMatchDialog(true);
      }

      onUploadComplete?.(receipt);


    } catch (error: any) {
      toast({
        title: 'Error processing receipt',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      processReceipt(file);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processReceipt(file);
    }
  };

  return (
    <>
      <Card className="p-6">
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          } ${uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id="receipt-upload"
            className="hidden"
            accept="image/*"
            onChange={handleChange}
            disabled={uploading}
          />
          
          {uploading ? (
            <div className="space-y-4">
              <Loader2 className="w-12 h-12 mx-auto animate-spin text-blue-600" />
              <div>
                <p className="text-lg font-medium">Processing receipt...</p>
                <p className="text-sm text-gray-500 mt-1">Extracting data with AI</p>
              </div>
            </div>
          ) : (
            <label htmlFor="receipt-upload" className="cursor-pointer">
              <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-lg font-medium mb-2">Drop receipt here or click to upload</p>
              <p className="text-sm text-gray-500">Supports JPG, PNG, PDF up to 10MB</p>
            </label>
          )}
        </div>

        <Alert className="mt-4">
          <FileText className="h-4 w-4" />
          <AlertDescription>
            Our AI will automatically extract vendor, amount, date, and categorize for tax purposes
          </AlertDescription>
        </Alert>
      </Card>

      <DuplicateReceiptsDialog
        open={showDuplicateDialog}
        onOpenChange={setShowDuplicateDialog}
        currentReceiptId={matchingReceipt?.id || ''}
        duplicates={duplicates}
        onResolved={() => {
          setShowDuplicateDialog(false);
          // After resolving duplicates, show matching dialog
          setShowMatchDialog(true);
        }}
      />

      <ReceiptMatchingDialog
        receipt={matchingReceipt}
        open={showMatchDialog}
        onClose={() => setShowMatchDialog(false)}
        onMatched={() => {
          setShowMatchDialog(false);
          onUploadComplete?.(matchingReceipt);
        }}
      />
    </>
  );
}