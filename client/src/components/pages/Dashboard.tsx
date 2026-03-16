import { useCallback, useState } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { useToast } from '@/hooks/use-toast';
import TaxHealthWidget from '@/components/TaxHealthWidget';
import DocumentUploadZone from '@/components/DocumentUploadZone';
import ReceiptLedgerTable from '@/components/ReceiptLedgerTable';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useLocation } from 'wouter';

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [uploading, setUploading] = useState(false);

  const taxYear = new Date().getFullYear();

  // Load receipts from DB
  const { data: receipts = [], refetch, isLoading } = trpc.receipts.list.useQuery({ taxYear });

  // Delete receipt mutation
  const deleteReceipt = trpc.receipts.delete.useMutation({
    onSuccess: () => {
      refetch();
      toast({ title: 'Document deleted', description: 'The document has been removed.' });
    },
    onError: (err) =>
      toast({ title: 'Delete failed', description: err.message, variant: 'destructive' }),
  });

  // Update receipt mutation
  const updateReceipt = trpc.receipts.update.useMutation({
    onSuccess: () => {
      refetch();
      toast({ title: 'Document updated', description: 'Changes have been saved.' });
    },
    onError: (err) =>
      toast({ title: 'Update failed', description: err.message, variant: 'destructive' }),
  });

  const uploadFiles = useCallback(
    async (files: File[]) => {
      setUploading(true);
      let successCount = 0;

      for (const file of files) {
        try {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('taxYear', String(taxYear));
          formData.append('description', file.name);

          const res = await fetch('/api/upload/receipt', {
            method: 'POST',
            body: formData,
          });

          if (!res.ok) {
            const err = await res.json().catch(() => ({ error: 'Upload failed' }));
            throw new Error(err.error || 'Upload failed');
          }

          successCount++;
        } catch (err: any) {
          toast({
            title: `Failed to upload ${file.name}`,
            description: err.message,
            variant: 'destructive',
          });
        }
      }

      setUploading(false);

      if (successCount > 0) {
        toast({
          title: `${successCount} file${successCount !== 1 ? 's' : ''} uploaded`,
          description: 'Your documents are being processed by TaxGPT...',
        });
        refetch();
      }
    },
    [taxYear, toast, refetch]
  );

  const handleUpdateReceipt = async (id: number, updates: any) => {
    await updateReceipt.mutateAsync({ id, ...updates });
  };

  const handleDeleteReceipt = async (id: number) => {
    if (confirm('Are you sure you want to delete this document?')) {
      await deleteReceipt.mutateAsync({ id });
    }
  };

  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with back button */}
        <div className="mb-8 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation('/')}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, {firstName}</h1>
            <p className="text-gray-500 text-sm mt-1">
              {taxYear} tax year — {receipts.length === 0
                ? 'Start by uploading your first document.'
                : `${receipts.length} document${receipts.length !== 1 ? 's' : ''} in your library.`}
            </p>
          </div>
        </div>

        {/* Upload Section */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Documents</h2>
          <DocumentUploadZone onUpload={uploadFiles} isUploading={uploading} />
          <p className="text-xs text-gray-500 mt-3">
            💡 Tip: Upload receipts, invoices, bank statements, 1099s, W-2s, and any tax documents.
            TaxGPT will automatically categorize and extract the amounts.
          </p>
        </div>

        {/* Tax Health Score */}
        <div className="mb-12">
          <TaxHealthWidget />
        </div>

        {/* Receipt Ledger */}
        {receipts.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">
                Document Ledger
                <span className="ml-2 text-sm font-normal text-gray-500">{receipts.length} items</span>
              </h2>
            </div>
            <ReceiptLedgerTable
              receipts={receipts}
              onUpdate={handleUpdateReceipt}
              onDelete={handleDeleteReceipt}
              isLoading={isLoading || updateReceipt.isPending || deleteReceipt.isPending}
            />
          </div>
        )}
      </div>
    </div>
  );
}
