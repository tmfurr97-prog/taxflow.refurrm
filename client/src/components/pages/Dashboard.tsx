import { useState, useCallback } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { useToast } from '@/hooks/use-toast';
import TaxHealthWidget from '@/components/TaxHealthWidget';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Upload, FileText, Image, Trash2, ExternalLink, Loader2 } from 'lucide-react';

const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/heic'];
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  const taxYear = new Date().getFullYear();

  // Load persisted receipts from DB
  const { data: receipts = [], refetch } = trpc.receipts.list.useQuery({ taxYear });

  // Delete receipt mutation
  const deleteReceipt = trpc.receipts.delete.useMutation({
    onSuccess: () => { refetch(); },
    onError: (err) => toast({ title: 'Delete failed', description: err.message, variant: 'destructive' }),
  });

  const uploadFiles = useCallback(async (files: File[]) => {
    const valid = files.filter(f => {
      if (!ACCEPTED_TYPES.includes(f.type)) {
        toast({ title: 'Unsupported file type', description: `${f.name} is not a supported format (PDF, JPEG, PNG, WEBP).`, variant: 'destructive' });
        return false;
      }
      if (f.size > MAX_FILE_SIZE) {
        toast({ title: 'File too large', description: `${f.name} exceeds the 20MB limit.`, variant: 'destructive' });
        return false;
      }
      return true;
    });
    if (!valid.length) return;
    setUploading(true);
    let successCount = 0;
    for (const file of valid) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('taxYear', String(taxYear));
        formData.append('description', file.name);
        const res = await fetch('/api/upload/receipt', { method: 'POST', body: formData });
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: 'Upload failed' }));
          throw new Error(err.error || 'Upload failed');
        }
        successCount++;
      } catch (err: any) {
        toast({ title: `Failed to upload ${file.name}`, description: err.message, variant: 'destructive' });
      }
    }
    setUploading(false);
    if (successCount > 0) {
      toast({ title: `${successCount} file${successCount !== 1 ? 's' : ''} uploaded`, description: 'Saved to your receipt library.' });
      refetch();
    }
  }, [taxYear, toast, refetch]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    uploadFiles(Array.from(e.dataTransfer.files));
  }, [uploadFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      uploadFiles(Array.from(e.target.files));
      e.target.value = '';
    }
  }, [uploadFiles]);

  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {firstName}</h1>
          <p className="text-gray-500 text-sm mt-1">
            {taxYear} tax year &mdash; {receipts.length === 0
              ? 'Start by uploading your first document.'
              : `${receipts.length} document${receipts.length !== 1 ? 's' : ''} in your library.`}
          </p>
        </div>

        {/* PRIMARY ACTION: Upload */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Documents</h2>
          <div
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer ${
              isDragging ? 'border-emerald-400 bg-emerald-500/5' : 'border-gray-200 hover:border-emerald-600 hover:bg-white'
            }`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById('receipt-upload')?.click()}
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
                <p className="text-gray-500 text-sm">Uploading...</p>
              </div>
            ) : (
              <>
                <Upload className="w-12 h-12 mx-auto text-gray-600 mb-4" />
                <p className="text-gray-900 font-medium mb-1">Drop files here or click to browse</p>
                <p className="text-gray-500 text-sm">PDF, JPEG, PNG, WEBP &mdash; up to 20MB each</p>
              </>
            )}
            <input
              id="receipt-upload"
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.webp,.heic"
              onChange={handleFileInput}
              className="hidden"
            />
          </div>
        </div>

        {/* Receipt library */}
        {receipts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Receipt Library
              <span className="ml-2 text-sm font-normal text-gray-500">{taxYear}</span>
            </h2>
            <div className="space-y-2">
              {receipts.map((r: any) => (
                <Card key={r.id} className="bg-white border-gray-200">
                  <CardContent className="flex items-center gap-4 py-3 px-4">
                    <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-lg shrink-0">
                      {r.imageUrl ? <Image className="w-4 h-4 text-emerald-400" /> : <FileText className="w-4 h-4 text-gray-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-900 text-sm font-medium truncate">{r.description || r.vendor || 'Untitled'}</p>
                      <p className="text-gray-500 text-xs">{r.date} &mdash; {r.category}</p>
                    </div>
                    {r.amount && (
                      <span className="text-emerald-400 text-sm font-semibold shrink-0">${r.amount}</span>
                    )}
                    <Badge variant="secondary" className="bg-gray-100 text-gray-500 text-xs shrink-0">
                      {r.isDeductible ? 'Deductible' : 'Non-deductible'}
                    </Badge>
                    <div className="flex items-center gap-1 shrink-0">
                      {r.imageUrl && (
                        <Button size="icon" variant="ghost" className="w-7 h-7 text-gray-500 hover:text-gray-900" asChild>
                          <a href={r.imageUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="w-7 h-7 text-gray-500 hover:text-red-400"
                        onClick={() => deleteReceipt.mutate({ id: r.id })}
                        disabled={deleteReceipt.isPending}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Tax Health Score */}
        <div className="mb-8">
          <TaxHealthWidget />
        </div>

      </div>
    </div>
  );
}
