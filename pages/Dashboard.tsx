import { useState } from 'react';
import DashboardSection from '@/components/DashboardSection';
import DocumentUpload from '@/components/DocumentUpload';
import YearEndChecklist from '@/components/YearEndChecklist';
import TaxPreview from '@/components/TaxPreview';
import { EmailIntegration } from '@/components/EmailIntegration';
import { EmailScanningInfo } from '@/components/EmailScanningInfo';
import { DocumentReview } from '@/components/DocumentReview';
import AIAssistantSection from '@/components/AIAssistantSection';
import { PlaidConnection } from '@/components/PlaidConnection';
import { TransactionMatching } from '@/components/TransactionMatching';
import { TransactionReview } from '@/components/TransactionReview';
import TaxHealthWidget from '@/components/TaxHealthWidget';
import GoalTracker from '@/components/GoalTracker';
import SmartTimeline from '@/components/SmartTimeline';
import ReportCenter from '@/components/ReportCenter';
import QuickBooksIntegration from '@/components/QuickBooksIntegration';
import { BankDashboard } from '@/components/BankDashboard';
import { QuarterlyTaxSection } from '@/components/QuarterlyTaxSection';
import { TaxAssistant } from '@/components/TaxAssistant';
import { TaxProfessionalCollaboration } from '@/components/TaxProfessionalCollaboration';



export default function Dashboard() {
  const [documents, setDocuments] = useState([
    { id: 1, name: 'W-2 Form - ABC Corp', category: 'Tax Forms', date: 'Jan 15, 2024', amount: '', status: 'verified' as const, type: 'W-2' },
    { id: 2, name: '1099-NEC - Freelance Work', category: 'Tax Forms', date: 'Jan 20, 2024', amount: '', status: 'verified' as const, type: '1099' },
  ]);
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

  return (
    <div className="min-h-screen bg-gray-50">
      {showReview && reviewDocuments.length > 0 && (
        <DocumentReview
          documents={reviewDocuments}
          onApprove={handleApproveDocument}
          onReject={(doc) => console.log('Rejected:', doc.filename)}
          onClose={() => { setShowReview(false); setReviewDocuments([]); }}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-heading font-bold text-charcoal">Dashboard</h1>
          <div className="text-sm text-muted-foreground">
            Powered by <span className="text-teal font-semibold">SmartBooks Academy</span>
          </div>
        </div>

        {/* Top Row: Tax Health & Goals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <TaxHealthWidget />
          <GoalTracker />
        </div>

        {/* Smart Timeline */}
        <div className="mb-8">
          <SmartTimeline />
        </div>

        {/* Report Center & QuickBooks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ReportCenter />
          <QuickBooksIntegration />
        </div>
        
        <DashboardSection 
          documents={documents}
          onViewDocument={(id) => console.log('View:', id)}
          onDeleteDocument={(id) => setDocuments(documents.filter(doc => doc.id !== id))}
        />


        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Upload Documents</h2>
          <DocumentUpload onUpload={handleUpload} onScanEmail={() => {}} onConnectBank={() => {}} />
        </div>

        <div className="mt-8 space-y-4">
          <EmailScanningInfo />
          <EmailIntegration onDocumentsFound={handleDocumentsFound} />
        </div>


        <div className="mt-8">
          <BankDashboard />
          <PlaidConnection />
        </div>
        <div className="mt-8">
          <TransactionMatching />
        </div>

        <div className="mt-8">
          <TransactionReview />
        </div>

        <div className="mt-8">
          <TaxProfessionalCollaboration />
        </div>

        <div className="mt-8">
          <QuarterlyTaxSection />
        </div>

        <div className="mt-8">
          <YearEndChecklist />
        </div>

        <div className="mt-8">
          <TaxPreview />
        </div>
      </div>


      <AIAssistantSection />
      <TaxAssistant userContext={{ filingStatus: 'single', dependents: 0, income: 0, state: 'CA', homeOwner: false, selfEmployed: false }} />
    </div>
  );
}
