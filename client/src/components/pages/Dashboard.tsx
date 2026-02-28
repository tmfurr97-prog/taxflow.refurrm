import { useState } from 'react';
import DocumentUpload from '@/components/DocumentUpload';
import DashboardSection from '@/components/DashboardSection';
import { EmailIntegration } from '@/components/EmailIntegration';
import { EmailScanningInfo } from '@/components/EmailScanningInfo';
import { DocumentReview } from '@/components/DocumentReview';
import TaxHealthWidget from '@/components/TaxHealthWidget';
import { useAuth } from '@/_core/hooks/useAuth';

export default function Dashboard() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<any[]>([]);
  const [reviewDocuments, setReviewDocuments] = useState<any[]>([]);
  const [showReview, setShowReview] = useState(false);

  const handleUpload = (files: File[]) => {
    const newDocs = files.map((file, index) => ({
      id: documents.length + index + 1,
      name: file.name,
      category: 'Uncategorized',
      date: new Date().toLocaleDateString(),
      amount: '',
      status: 'pending' as const
    }));
    setDocuments([...documents, ...newDocs]);
  };

  const handleDocumentsFound = (docs: any[]) => {
    setReviewDocuments(docs);
    setShowReview(true);
  };

  const handleApproveDocument = (doc: any) => {
    const newDoc = {
      id: documents.length + 1,
      name: doc.filename,
      category: 'Tax Forms',
      date: new Date().toLocaleDateString(),
      amount: doc.fields?.wages || '',
      status: 'verified' as const,
      type: doc.documentType,
      ...doc.fields
    };
    setDocuments([...documents, newDoc]);
  };

  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <div className="min-h-screen bg-slate-950">
      {showReview && reviewDocuments.length > 0 && (
        <DocumentReview
          documents={reviewDocuments}
          onApprove={handleApproveDocument}
          onReject={(doc) => console.log('Rejected:', doc.filename)}
          onClose={() => { setShowReview(false); setReviewDocuments([]); }}
        />
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Welcome back, {firstName}</h1>
          <p className="text-slate-400 text-sm mt-1">
            {new Date().getFullYear()} tax year &mdash; {documents.length === 0 ? 'Start by uploading your first document.' : `${documents.length} document${documents.length !== 1 ? 's' : ''} uploaded.`}
          </p>
        </div>

        {/* PRIMARY ACTION: Upload first */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Upload Documents</h2>
          <DocumentUpload onUpload={handleUpload} onScanEmail={() => {}} onConnectBank={() => {}} />
        </div>

        <div className="mb-8 space-y-4">
          <EmailScanningInfo />
          <EmailIntegration onDocumentsFound={handleDocumentsFound} />
        </div>

        {/* Document list — only shown when there are documents */}
        {documents.length > 0 && (
          <div className="mb-8">
            <DashboardSection
              documents={documents}
              onViewDocument={(id) => console.log('View:', id)}
              onDeleteDocument={(id) => setDocuments(documents.filter(doc => doc.id !== id))}
            />
          </div>
        )}

        {/* Tax Health — shown below upload, zeroed for new accounts */}
        <div className="mb-8">
          <TaxHealthWidget />
        </div>
      </div>
    </div>
  );
}
