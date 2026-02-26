import React, { useState, useMemo, useRef } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import {
  CheckCircle2, Circle, Upload, FileText, AlertCircle, Clock,
  ChevronDown, ChevronRight, User, Briefcase, Home, Bitcoin,
  TrendingUp, Shield, FileCheck, Send, RotateCcw, Star,
  Info, X, Eye, Plus, ArrowRight, Loader2, Trash2,
  FileIcon, ImageIcon
} from 'lucide-react';

type ChecklistItem = {
  id: string; label: string; description: string; required: boolean;
  newClientOnly?: boolean; examples?: string;
};
type ChecklistCategory = {
  id: string; icon: React.ElementType; title: string; color: string; items: ChecklistItem[];
};

const CHECKLIST: ChecklistCategory[] = [
  {
    id: 'prior_year', icon: RotateCcw, title: 'Prior Year Return', color: 'text-amber-400',
    items: [
      { id: 'prior_return', label: "Last Year's Tax Return (1040)", description: 'Required for all new clients — provides prior year AGI, carryover losses, and depreciation schedules.', required: true, newClientOnly: true, examples: 'Form 1040, all schedules attached' },
      { id: 'prior_state_return', label: "Last Year's State Return", description: 'Needed to carry over state-specific credits and deductions.', required: false, newClientOnly: true, examples: 'CA 540, NY IT-201, TX has no state income tax' },
      { id: 'ip_pin', label: 'IRS Identity Protection PIN (if issued)', description: 'If the IRS issued you an IP PIN, we need it to e-file your return.', required: false, newClientOnly: true, examples: '6-digit PIN from IRS letter CP01A' },
    ],
  },
  {
    id: 'personal_info', icon: User, title: 'Personal Information', color: 'text-blue-400',
    items: [
      { id: 'ssn', label: 'Social Security Cards / ITIN Letters', description: 'SSN or ITIN for you, your spouse, and all dependents.', required: true, examples: 'Social Security card, IRS ITIN assignment letter' },
      { id: 'id', label: 'Government-Issued Photo ID', description: "Driver's license or state ID for identity verification.", required: true, examples: "Driver's license, passport, state ID" },
      { id: 'bank_info', label: 'Bank Account for Direct Deposit', description: 'Routing and account number for your refund or payment.', required: false, examples: 'Voided check or bank statement' },
    ],
  },
  {
    id: 'income', icon: TrendingUp, title: 'Income Documents', color: 'text-green-400',
    items: [
      { id: 'w2', label: 'W-2 Forms', description: 'From every employer you worked for this year.', required: false, examples: 'W-2 from each employer' },
      { id: '1099_nec', label: '1099-NEC / 1099-MISC', description: 'For freelance, gig, or contract work (Uber, DoorDash, Upwork, etc.).', required: false, examples: '1099-NEC from each client/platform' },
      { id: '1099_k', label: '1099-K (Payment Processors)', description: 'From PayPal, Venmo, Stripe, Square, Etsy, eBay, etc.', required: false, examples: '1099-K from each payment processor' },
      { id: '1099_int_div', label: '1099-INT / 1099-DIV (Interest & Dividends)', description: 'From banks, credit unions, and investment accounts.', required: false, examples: '1099-INT from bank, 1099-DIV from brokerage' },
      { id: '1099_r', label: '1099-R (Retirement Distributions)', description: 'If you took distributions from a 401(k), IRA, or pension.', required: false, examples: '1099-R from retirement plan administrator' },
      { id: 'ssa_1099', label: 'SSA-1099 (Social Security Benefits)', description: 'If you received Social Security benefits.', required: false, examples: 'SSA-1099 from Social Security Administration' },
    ],
  },
  {
    id: 'deductions', icon: Home, title: 'Deductions & Credits', color: 'text-purple-400',
    items: [
      { id: 'mortgage', label: '1098 (Mortgage Interest)', description: 'From your mortgage lender if you own a home.', required: false, examples: 'Form 1098 from your lender' },
      { id: 'charitable', label: 'Charitable Donation Receipts', description: 'Cash and non-cash donations to qualified organizations.', required: false, examples: 'Bank statements, donation receipts' },
      { id: 'medical', label: 'Medical Expense Records', description: 'Out-of-pocket medical, dental, and vision expenses.', required: false, examples: 'Receipts, EOBs, prescription records' },
      { id: 'education', label: '1098-T (Tuition Statement)', description: 'From your college or university for education credits.', required: false, examples: 'Form 1098-T from school' },
      { id: 'childcare', label: 'Childcare Provider Info', description: "Name, address, and EIN/SSN of childcare provider.", required: false, examples: 'Childcare receipts, provider EIN' },
    ],
  },
  {
    id: 'business', icon: Briefcase, title: 'Business / Self-Employment', color: 'text-orange-400',
    items: [
      { id: 'business_income', label: 'Business Income Records', description: 'All income received from your business, freelance work, or gig platforms.', required: false, examples: 'Bank statements, invoices, platform earnings summaries' },
      { id: 'business_expenses', label: 'Business Expense Records', description: 'Receipts and records for deductible business expenses.', required: false, examples: 'Receipts, bank/credit card statements, mileage log' },
      { id: 'home_office', label: 'Home Office Details', description: 'Square footage of your home and dedicated office space.', required: false, examples: 'Floor plan, utility bills, rent/mortgage statements' },
      { id: 'vehicle', label: 'Vehicle / Mileage Log', description: 'Business mileage log or actual vehicle expense records.', required: false, examples: 'Mileage log, gas receipts, insurance, registration' },
    ],
  },
  {
    id: 'investments', icon: Bitcoin, title: 'Investments & Crypto', color: 'text-yellow-400',
    items: [
      { id: '1099_b', label: '1099-B (Stock Sales)', description: 'From your brokerage for any stock, ETF, or mutual fund sales.', required: false, examples: '1099-B from Robinhood, Fidelity, Schwab, etc.' },
      { id: 'crypto', label: 'Crypto Transaction History', description: 'Complete transaction history from all exchanges and wallets.', required: false, examples: 'CSV export from Coinbase, Binance, Kraken, etc.' },
    ],
  },
  {
    id: 'special', icon: Shield, title: 'Special Situations', color: 'text-red-400',
    items: [
      { id: 'irs_notices', label: 'IRS / State Tax Notices', description: 'Any letters or notices you received from the IRS or state tax agency.', required: false, examples: 'CP2000, CP3219A, state audit letters' },
      { id: 'marketplace_insurance', label: '1095-A (Marketplace Insurance)', description: 'If you had health insurance through Healthcare.gov.', required: false, examples: 'Form 1095-A from Healthcare.gov' },
      { id: 'rental_income', label: 'Rental Income & Expenses', description: 'If you own rental property — income received and expenses paid.', required: false, examples: 'Rent receipts, repair receipts, depreciation schedule' },
    ],
  },
];

const STATUS_STEPS = [
  { key: 'draft',         label: 'Checklist',    icon: FileText },
  { key: 'submitted',     label: 'Submitted',     icon: Send },
  { key: 'docs_received', label: 'Docs Received', icon: CheckCircle2 },
  { key: 'in_review',     label: 'In Review',     icon: Clock },
  { key: 'ready_to_sign', label: 'Ready to Sign', icon: FileCheck },
  { key: 'filed',         label: 'Filed!',        icon: Star },
];

type ItemStatus = 'not_started' | 'uploaded' | 'na';
type UploadedDoc = {
  id: number; fileName: string; fileUrl: string;
  fileSize: number; mimeType: string; checklistItemId: string | null;
};

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileTypeIcon({ mimeType }: { mimeType: string }) {
  if (mimeType === 'application/pdf') return <FileText className="w-4 h-4 text-red-400" />;
  if (mimeType.startsWith('image/')) return <ImageIcon className="w-4 h-4 text-blue-400" />;
  return <FileIcon className="w-4 h-4 text-slate-400" />;
}

export default function RemoteReturns() {
  const currentYear = new Date().getFullYear();
  const [taxYear] = useState(currentYear - 1);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['prior_year', 'personal_info', 'income'])
  );
  const [itemStatuses, setItemStatuses] = useState<Record<string, ItemStatus>>({});
  const [clientNotes, setClientNotes] = useState('');
  const [isNewClient, setIsNewClient] = useState(true);
  const [activeReturn, setActiveReturn] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingItem, setUploadingItem] = useState<string | null>(null);
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDoc[]>([]);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const { data: returns, refetch } = trpc.remoteReturns.list.useQuery();
  const createMutation = trpc.remoteReturns.create.useMutation({
    onSuccess: (data) => {
      setActiveReturn(data.id);
      toast.success('Return started! Upload your documents below.');
      refetch();
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });
  const submitMutation = trpc.remoteReturns.submit.useMutation({
    onSuccess: () => { toast.success("Documents submitted! We'll be in touch soon."); refetch(); },
    onError: (e: { message: string }) => toast.error(e.message),
  });
  const saveMutation = trpc.remoteReturns.saveProgress.useMutation({
    onError: (e: { message: string }) => toast.error(e.message),
  });
  const deleteDocMutation = trpc.remoteReturns.deleteDocument.useMutation({
    onSuccess: (_, vars) => {
      setUploadedDocs(prev => prev.filter(d => d.id !== vars.documentId));
      toast.success('Document removed');
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });

  const visibleItems = useMemo(
    () => CHECKLIST.flatMap(cat => cat.items.filter(item => !item.newClientOnly || isNewClient)),
    [isNewClient]
  );
  const completedCount = visibleItems.filter(
    item => itemStatuses[item.id] === 'uploaded' || itemStatuses[item.id] === 'na'
  ).length;
  const requiredItems = visibleItems.filter(i => i.required);
  const requiredComplete = requiredItems.every(
    i => itemStatuses[i.id] === 'uploaded' || itemStatuses[i.id] === 'na'
  );
  const completionPct = visibleItems.length > 0
    ? Math.round((completedCount / visibleItems.length) * 100)
    : 0;

  const toggleCategory = (id: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const setItemStatus = (itemId: string, status: ItemStatus) =>
    setItemStatuses(prev => ({ ...prev, [itemId]: status }));

  const handleStart = () => createMutation.mutate({ taxYear, isNewClient });

  const handleSaveProgress = () => {
    if (!activeReturn) return;
    saveMutation.mutate({ returnId: activeReturn, checklistProgress: itemStatuses, checklistCompletePct: completionPct, clientNotes });
    toast.success('Progress saved');
  };

  const handleSubmit = () => {
    if (!activeReturn) return;
    if (!requiredComplete) { toast.error('Please complete all required items before submitting.'); return; }
    setSubmitting(true);
    saveMutation.mutate({ returnId: activeReturn, checklistProgress: itemStatuses, checklistCompletePct: completionPct, clientNotes });
    submitMutation.mutate({ returnId: activeReturn });
    setSubmitting(false);
  };

  const handleFileUpload = async (itemId: string, categoryId: string, file: File) => {
    if (!activeReturn) { toast.error('Please start your return first.'); return; }
    if (file.size > 20 * 1024 * 1024) { toast.error('File too large. Maximum size is 20MB.'); return; }
    setUploadingItem(itemId);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('returnId', String(activeReturn));
      formData.append('checklistItemId', itemId);
      formData.append('checklistCategory', categoryId);
      const response = await fetch('/api/upload/return-document', {
        method: 'POST', body: formData, credentials: 'include',
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Upload failed' }));
        throw new Error(err.error ?? 'Upload failed');
      }
      const data = await response.json();
      setUploadedDocs(prev => [...prev, data.document as UploadedDoc]);
      setItemStatus(itemId, 'uploaded');
      toast.success(`${file.name} uploaded successfully`);
      saveMutation.mutate({
        returnId: activeReturn,
        checklistProgress: { ...itemStatuses, [itemId]: 'uploaded' },
        checklistCompletePct: completionPct,
        clientNotes,
      });
    } catch (err: any) {
      toast.error(err.message ?? 'Upload failed. Please try again.');
    } finally {
      setUploadingItem(null);
    }
  };

  const triggerFileInput = (itemId: string) => fileInputRefs.current[itemId]?.click();

  // ─── Submitted Return View ─────────────────────────────────────────────────
  const activeReturnData = returns?.find((r: { id: number }) => r.id === activeReturn);
  if (activeReturnData && activeReturnData.status !== 'draft') {
    const currentStep = STATUS_STEPS.findIndex(s => s.key === activeReturnData.status);
    return (
      <div className="min-h-screen bg-slate-950 text-white p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Your Tax Return</h1>
            <p className="text-slate-400">Tax Year {taxYear} · Prepared by SmartBooks24 · E-filed through licensed partner</p>
          </div>
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader><CardTitle className="text-white text-lg">Return Status</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center">
                {STATUS_STEPS.map((step, i) => {
                  const isDone = i <= currentStep;
                  const isCurrent = i === currentStep;
                  return (
                    <React.Fragment key={step.key}>
                      <div className="flex flex-col items-center gap-1.5 flex-1">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 ${isDone ? 'bg-emerald-500 border-emerald-500' : 'bg-slate-800 border-slate-700'} ${isCurrent ? 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-slate-900' : ''}`}>
                          <step.icon className={`w-4 h-4 ${isDone ? 'text-white' : 'text-slate-500'}`} />
                        </div>
                        <span className={`text-xs text-center leading-tight ${isCurrent ? 'text-emerald-400 font-semibold' : isDone ? 'text-slate-300' : 'text-slate-600'}`}>{step.label}</span>
                      </div>
                      {i < STATUS_STEPS.length - 1 && (
                        <div className={`h-0.5 flex-1 mx-1 ${i < currentStep ? 'bg-emerald-500' : 'bg-slate-700'}`} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white text-lg">Uploaded Documents</CardTitle>
              <CardDescription className="text-slate-400">{activeReturnData.checklistCompletePct ?? 0}% checklist complete</CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={activeReturnData.checklistCompletePct ?? 0} className="h-2 mb-4" />
              {uploadedDocs.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-4">Your documents are being reviewed. We'll update your status shortly.</p>
              ) : (
                <div className="space-y-2">
                  {uploadedDocs.map(doc => (
                    <div key={doc.id} className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg">
                      <FileTypeIcon mimeType={doc.mimeType} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{doc.fileName}</p>
                        <p className="text-xs text-slate-500">{formatFileSize(doc.fileSize)}</p>
                      </div>
                      <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-slate-400 hover:text-white">
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-lg text-xs text-slate-500">
            <p className="font-medium text-slate-400 mb-1">Preparer Disclosure</p>
            <p>Returns prepared by SmartBooks24 by ReFurrm (PTIN on file). Electronic filing performed through our authorized e-file partner. This service does not constitute legal or financial advice.</p>
          </div>
        </div>
      </div>
    );
  }

  // ─── Checklist View ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileCheck className="w-6 h-6 text-emerald-400" />
                <h1 className="text-2xl font-bold text-white">Remote Returns</h1>
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Human-Assisted</Badge>
              </div>
              <p className="text-slate-400 max-w-xl">
                No AI required. Upload your documents, complete the checklist, and your dedicated tax preparer handles everything — then e-files through our licensed partner.
              </p>
            </div>
            <div className="text-right">
              <p className="text-slate-500 text-sm">Tax Year</p>
              <p className="text-2xl font-bold text-white">{taxYear}</p>
            </div>
          </div>
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">Checklist Progress</span>
              <span className="text-sm font-medium text-emerald-400">{completionPct}% complete</span>
            </div>
            <Progress value={completionPct} className="h-2.5" />
            <p className="text-xs text-slate-500 mt-1.5">
              {completedCount} of {visibleItems.length} items complete
              {requiredComplete && completedCount > 0 && (
                <span className="text-emerald-400 ml-2">✓ All required items complete</span>
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-4">
        {/* New Client Toggle */}
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-white text-sm font-medium">First time using SmartBooks24?</p>
                <p className="text-slate-500 text-xs mt-0.5">New clients must provide last year's return so we can carry over your AGI, deductions, and depreciation schedules.</p>
              </div>
              <Switch checked={isNewClient} onCheckedChange={setIsNewClient} className="data-[state=checked]:bg-emerald-500" />
            </div>
          </CardContent>
        </Card>

        {/* Start Return Banner */}
        {!activeReturn && (
          <Card className="bg-emerald-500/10 border-emerald-500/30">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <Info className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <p className="text-emerald-300 text-sm font-medium">Start your return to enable file uploads</p>
                  <p className="text-emerald-400/70 text-xs mt-0.5">Click "Start My Return" below, then upload documents directly to each checklist item.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Checklist Categories */}
        {CHECKLIST.map(category => {
          const visibleCategoryItems = category.items.filter(item => !item.newClientOnly || isNewClient);
          if (visibleCategoryItems.length === 0) return null;
          const categoryCount = visibleCategoryItems.filter(
            i => itemStatuses[i.id] === 'uploaded' || itemStatuses[i.id] === 'na'
          ).length;
          const categoryComplete = categoryCount === visibleCategoryItems.length;
          const isExpanded = expandedCategories.has(category.id);

          return (
            <Card key={category.id} className="bg-slate-900 border-slate-800 overflow-hidden">
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full flex items-center gap-3 p-4 hover:bg-slate-800/50 transition-colors text-left"
              >
                <category.icon className={`w-5 h-5 ${category.color} shrink-0`} />
                <div className="flex-1">
                  <p className="text-white font-medium text-sm">{category.title}</p>
                  <p className="text-slate-500 text-xs">{categoryCount}/{visibleCategoryItems.length} complete</p>
                </div>
                {categoryComplete && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
                {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
              </button>

              {isExpanded && (
                <div className="border-t border-slate-800">
                  {visibleCategoryItems.map((item, idx) => {
                    const status = itemStatuses[item.id] ?? 'not_started';
                    const isUploading = uploadingItem === item.id;
                    const itemDocs = uploadedDocs.filter(d => d.checklistItemId === item.id);

                    return (
                      <div
                        key={item.id}
                        className={`p-4 ${idx < visibleCategoryItems.length - 1 ? 'border-b border-slate-800/60' : ''} ${status === 'uploaded' ? 'bg-emerald-500/5' : status === 'na' ? 'bg-slate-800/30' : ''}`}
                      >
                        {/* Hidden file input per item */}
                        <input
                          ref={el => { fileInputRefs.current[item.id] = el; }}
                          type="file"
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(item.id, category.id, file);
                            e.target.value = '';
                          }}
                        />

                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 shrink-0">
                            {status === 'uploaded'
                              ? <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                              : <Circle className="w-5 h-5 text-slate-600" />
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <p className={`text-sm font-medium ${status === 'uploaded' ? 'text-emerald-300' : status === 'na' ? 'text-slate-500 line-through' : 'text-white'}`}>
                                {item.label}{item.required && <span className="text-red-400 ml-1">*</span>}
                              </p>
                              {item.newClientOnly && (
                                <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/20 text-xs py-0">New clients</Badge>
                              )}
                            </div>
                            <p className="text-slate-500 text-xs mb-2">{item.description}</p>
                            {item.examples && (
                              <p className="text-slate-600 text-xs italic mb-3">Examples: {item.examples}</p>
                            )}

                            {/* Files uploaded for this item */}
                            {itemDocs.length > 0 && (
                              <div className="mb-3 space-y-1.5">
                                {itemDocs.map(doc => (
                                  <div key={doc.id} className="flex items-center gap-2 p-2 bg-slate-800 rounded-md">
                                    <FileTypeIcon mimeType={doc.mimeType} />
                                    <span className="text-xs text-slate-300 flex-1 truncate">{doc.fileName}</span>
                                    <span className="text-xs text-slate-500">{formatFileSize(doc.fileSize)}</span>
                                    <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-slate-400 hover:text-white">
                                        <Eye className="w-3 h-3" />
                                      </Button>
                                    </a>
                                    <Button
                                      size="sm" variant="ghost"
                                      className="h-6 w-6 p-0 text-slate-600 hover:text-red-400"
                                      onClick={() => deleteDocMutation.mutate({ documentId: doc.id })}
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2 flex-wrap">
                              <Button
                                size="sm"
                                variant={status === 'uploaded' ? 'default' : 'outline'}
                                className={`h-7 text-xs gap-1.5 ${status === 'uploaded' ? 'bg-emerald-500 hover:bg-emerald-600 text-white border-0' : 'border-slate-700 text-slate-300 hover:bg-slate-800 bg-transparent'}`}
                                disabled={isUploading || !activeReturn}
                                onClick={() => triggerFileInput(item.id)}
                              >
                                {isUploading
                                  ? <><Loader2 className="w-3 h-3 animate-spin" /> Uploading...</>
                                  : <><Upload className="w-3 h-3" /> {status === 'uploaded' ? 'Add More Files' : 'Upload File'}</>
                                }
                              </Button>
                              {!item.required && (
                                <Button
                                  size="sm" variant="ghost"
                                  className={`h-7 text-xs gap-1.5 ${status === 'na' ? 'text-slate-400 bg-slate-800' : 'text-slate-600 hover:text-slate-400'}`}
                                  onClick={() => setItemStatus(item.id, status === 'na' ? 'not_started' : 'na')}
                                >
                                  <X className="w-3 h-3" />{status === 'na' ? 'Undo N/A' : 'Not Applicable'}
                                </Button>
                              )}
                              {!activeReturn && (
                                <span className="text-xs text-slate-600 italic">Start your return to upload</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          );
        })}

        {/* Client Notes */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-400" />Notes for Your Preparer
            </CardTitle>
            <CardDescription className="text-slate-500 text-xs">
              Anything special we should know — life changes, new income sources, questions, concerns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={clientNotes}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setClientNotes(e.target.value)}
              placeholder="e.g. I started a side business this year selling on Etsy. I moved from Texas to California in June. I have a question about my home office..."
              className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-600 min-h-[100px] resize-none"
            />
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pb-4">
          {!activeReturn ? (
            <Button
              onClick={handleStart}
              disabled={createMutation.isPending}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white h-12 text-base font-semibold gap-2"
            >
              {createMutation.isPending
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Starting...</>
                : <><Plus className="w-4 h-4" /> Start My Return</>
              }
            </Button>
          ) : (
            <>
              <Button
                onClick={handleSaveProgress}
                disabled={saveMutation.isPending}
                variant="outline"
                className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800 bg-transparent h-12 gap-2"
              >
                {saveMutation.isPending
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                  : 'Save Progress'
                }
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!requiredComplete || submitting || submitMutation.isPending}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white h-12 text-base font-semibold gap-2 disabled:opacity-50"
              >
                {submitMutation.isPending
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                  : <><Send className="w-4 h-4" /> Submit for Review <ArrowRight className="w-4 h-4" /></>
                }
              </Button>
            </>
          )}
        </div>

        {/* Required items reminder */}
        {!requiredComplete && activeReturn && (
          <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg mb-4">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-amber-300 text-xs">
              <strong>Required items remaining:</strong>{' '}
              {requiredItems
                .filter(i => itemStatuses[i.id] !== 'uploaded' && itemStatuses[i.id] !== 'na')
                .map(i => i.label).join(', ')}
            </p>
          </div>
        )}

        {/* Preparer Disclosure Footer */}
        <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-lg text-xs text-slate-500 mb-6">
          <p className="font-medium text-slate-400 mb-1">Preparer Disclosure</p>
          <p>Returns prepared by SmartBooks24 by ReFurrm (PTIN on file). Electronic filing performed through our authorized e-file partner. This service does not constitute legal or financial advice. For complex tax situations, we recommend consulting a licensed CPA or tax attorney.</p>
        </div>
      </div>
    </div>
  );
}
