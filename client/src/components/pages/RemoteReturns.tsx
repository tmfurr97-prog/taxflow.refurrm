import React, { useState, useMemo } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  CheckCircle2, Circle, Upload, FileText, AlertCircle, Clock,
  ChevronDown, ChevronRight, User, Briefcase, Home, Bitcoin,
  TrendingUp, Shield, FileCheck, Send, RotateCcw, Star,
  Info, X, Eye, Download, Plus, ArrowRight, Loader2
} from 'lucide-react';

// ─── Checklist Definition ─────────────────────────────────────────────────────

type ChecklistItem = {
  id: string;
  label: string;
  description: string;
  required: boolean;
  newClientOnly?: boolean;
  examples?: string;
};

type ChecklistCategory = {
  id: string;
  icon: React.ElementType;
  title: string;
  color: string;
  items: ChecklistItem[];
};

const CHECKLIST: ChecklistCategory[] = [
  {
    id: 'prior_year',
    icon: RotateCcw,
    title: 'Prior Year Return',
    color: 'text-amber-400',
    items: [
      {
        id: 'prior_return',
        label: 'Last Year\'s Tax Return (1040)',
        description: 'Your most recently filed federal tax return. Required for all new clients — provides prior year AGI, carryover losses, and depreciation schedules.',
        required: true,
        newClientOnly: true,
        examples: 'Form 1040, all schedules attached',
      },
      {
        id: 'prior_state_return',
        label: 'Last Year\'s State Return',
        description: 'Your most recently filed state tax return. Needed to carry over state-specific credits and deductions.',
        required: false,
        newClientOnly: true,
        examples: 'State 1040 equivalent (e.g., CA 540, NY IT-201)',
      },
      {
        id: 'irs_pin',
        label: 'IRS Identity Protection PIN (if applicable)',
        description: 'If the IRS issued you an IP PIN, we need it to e-file your return.',
        required: false,
        examples: '6-digit PIN from IRS letter CP01A',
      },
    ],
  },
  {
    id: 'personal_info',
    icon: User,
    title: 'Personal Information',
    color: 'text-blue-400',
    items: [
      {
        id: 'ssn_card',
        label: 'Social Security Card or ITIN Letter',
        description: 'Photo or scan of your Social Security card, or IRS ITIN assignment letter.',
        required: true,
        examples: 'SSN card front, or CP565 ITIN letter',
      },
      {
        id: 'govt_id',
        label: 'Government-Issued Photo ID',
        description: 'Driver\'s license, state ID, or passport — required for identity verification.',
        required: true,
        examples: 'Driver\'s license front & back, passport photo page',
      },
      {
        id: 'dependent_ssn',
        label: 'Dependents\' SSNs / Birth Certificates',
        description: 'Social Security numbers and dates of birth for all dependents you are claiming.',
        required: false,
        examples: 'SSN cards or birth certificates for each dependent',
      },
      {
        id: 'bank_info',
        label: 'Bank Account for Direct Deposit / Debit',
        description: 'Routing and account number for your refund direct deposit or balance due payment.',
        required: true,
        examples: 'Voided check or bank statement showing routing/account numbers',
      },
    ],
  },
  {
    id: 'income',
    icon: TrendingUp,
    title: 'Income Documents',
    color: 'text-emerald-400',
    items: [
      {
        id: 'w2',
        label: 'W-2 (Wages from Employer)',
        description: 'One W-2 per employer you worked for during the tax year.',
        required: false,
        examples: 'W-2 from each employer — should arrive by Jan 31',
      },
      {
        id: '1099_nec',
        label: '1099-NEC (Freelance / Gig Income)',
        description: 'Received from clients who paid you $600+ as an independent contractor.',
        required: false,
        examples: 'Uber, DoorDash, Upwork, direct client payments',
      },
      {
        id: '1099_k',
        label: '1099-K (Payment Processor Income)',
        description: 'From payment platforms like PayPal, Venmo, Cash App, Stripe, or Square.',
        required: false,
        examples: 'PayPal, Stripe, Square, Shopify Payments',
      },
      {
        id: '1099_int',
        label: '1099-INT (Bank Interest)',
        description: 'From banks or credit unions where you earned interest income.',
        required: false,
        examples: 'Savings account interest statements',
      },
      {
        id: '1099_div',
        label: '1099-DIV (Dividends)',
        description: 'From brokerage accounts that paid dividends.',
        required: false,
        examples: 'Fidelity, Schwab, Vanguard dividend statements',
      },
      {
        id: '1099_r',
        label: '1099-R (Retirement / Pension Distributions)',
        description: 'If you took distributions from an IRA, 401(k), or pension.',
        required: false,
        examples: 'IRA withdrawal, 401(k) distribution, pension income',
      },
      {
        id: 'ssa_1099',
        label: 'SSA-1099 (Social Security Benefits)',
        description: 'If you received Social Security benefits during the year.',
        required: false,
        examples: 'Social Security benefit statement',
      },
      {
        id: 'other_income',
        label: 'Other Income (Rental, Alimony, Gambling, etc.)',
        description: 'Any other income not covered above — rental income, alimony received, gambling winnings, jury duty pay, etc.',
        required: false,
        examples: 'Rental income records, W-2G gambling winnings, alimony agreement',
      },
    ],
  },
  {
    id: 'deductions',
    icon: Home,
    title: 'Deductions & Credits',
    color: 'text-purple-400',
    items: [
      {
        id: 'mortgage_1098',
        label: '1098 (Mortgage Interest)',
        description: 'From your mortgage lender showing interest paid — deductible if you itemize.',
        required: false,
        examples: 'Form 1098 from your bank or mortgage servicer',
      },
      {
        id: 'property_tax',
        label: 'Property Tax Statements',
        description: 'Annual property tax bills paid on your home.',
        required: false,
        examples: 'County tax assessor statement or mortgage escrow summary',
      },
      {
        id: 'charitable',
        label: 'Charitable Donation Receipts',
        description: 'Receipts for cash or non-cash donations to qualified organizations.',
        required: false,
        examples: 'Church receipts, Goodwill donation slips, GoFundMe receipts',
      },
      {
        id: 'medical',
        label: 'Medical & Dental Expenses',
        description: 'Out-of-pocket medical costs that exceed 7.5% of your AGI may be deductible.',
        required: false,
        examples: 'Doctor bills, prescription receipts, health insurance premiums',
      },
      {
        id: 'education_1098t',
        label: '1098-T (Tuition — Education Credits)',
        description: 'From your college or university — needed for American Opportunity or Lifetime Learning credits.',
        required: false,
        examples: 'Form 1098-T from your school',
      },
      {
        id: 'student_loan_1098e',
        label: '1098-E (Student Loan Interest)',
        description: 'Up to $2,500 in student loan interest may be deductible.',
        required: false,
        examples: 'Form 1098-E from your loan servicer',
      },
      {
        id: 'childcare',
        label: 'Child & Dependent Care Expenses',
        description: 'Daycare, after-school care, or summer camp costs for children under 13.',
        required: false,
        examples: 'Daycare receipts with provider\'s EIN/SSN',
      },
      {
        id: 'hsa_1099sa',
        label: '1099-SA (HSA Distributions)',
        description: 'If you have a Health Savings Account and took distributions.',
        required: false,
        examples: 'Form 1099-SA from your HSA administrator',
      },
    ],
  },
  {
    id: 'business',
    icon: Briefcase,
    title: 'Self-Employment & Business',
    color: 'text-orange-400',
    items: [
      {
        id: 'business_income',
        label: 'Business Income Summary',
        description: 'Total income received from your business, freelance work, or gig platforms.',
        required: false,
        examples: 'Bank statements, invoices, Stripe/PayPal reports, Uber/Lyft earnings summary',
      },
      {
        id: 'business_expenses',
        label: 'Business Expense Records',
        description: 'All receipts and records for deductible business expenses.',
        required: false,
        examples: 'Office supplies, software subscriptions, advertising, phone bill (business %)',
      },
      {
        id: 'mileage_log',
        label: 'Mileage Log',
        description: 'Record of business miles driven — worth 67¢/mile for 2024.',
        required: false,
        examples: 'Spreadsheet, MileIQ export, or handwritten log with dates/destinations',
      },
      {
        id: 'home_office',
        label: 'Home Office Details',
        description: 'Square footage of your home office and total home square footage.',
        required: false,
        examples: 'Floor plan measurements, utility bills, rent/mortgage statement',
      },
      {
        id: 'equipment',
        label: 'Equipment & Asset Purchases',
        description: 'Business equipment purchased during the year (computers, tools, vehicles, etc.)',
        required: false,
        examples: 'Receipts for items over $100 used for business',
      },
      {
        id: 'retirement_contrib',
        label: 'Self-Employed Retirement Contributions',
        description: 'Contributions to SEP-IRA, SIMPLE IRA, or Solo 401(k) — fully deductible.',
        required: false,
        examples: 'Contribution statements from your retirement account',
      },
    ],
  },
  {
    id: 'investments',
    icon: Bitcoin,
    title: 'Investments & Crypto',
    color: 'text-yellow-400',
    items: [
      {
        id: '1099_b',
        label: '1099-B (Stock / Investment Sales)',
        description: 'From your brokerage showing stocks, ETFs, or mutual funds sold during the year.',
        required: false,
        examples: 'Fidelity, Schwab, Robinhood, E*TRADE consolidated 1099',
      },
      {
        id: 'crypto_report',
        label: 'Crypto Transaction Report',
        description: 'Complete transaction history from all exchanges and wallets — sales, trades, and income.',
        required: false,
        examples: 'Coinbase, Binance, Kraken CSV export; or CoinTracker/Koinly report',
      },
      {
        id: 'k1',
        label: 'Schedule K-1 (Partnership / S-Corp / Trust)',
        description: 'If you are a partner in a business, S-Corp shareholder, or trust beneficiary.',
        required: false,
        examples: 'K-1 from your partnership, LLC, S-Corp, or estate/trust',
      },
    ],
  },
  {
    id: 'special',
    icon: Shield,
    title: 'Special Situations',
    color: 'text-red-400',
    items: [
      {
        id: 'irs_notices',
        label: 'Any IRS / State Tax Notices Received',
        description: 'Upload any letters or notices you received from the IRS or state tax agency this year.',
        required: false,
        examples: 'CP2000, CP501, audit letter, balance due notice',
      },
      {
        id: 'aca_1095',
        label: '1095-A (ACA Marketplace Insurance)',
        description: 'If you purchased health insurance through Healthcare.gov or a state marketplace.',
        required: false,
        examples: 'Form 1095-A from your marketplace',
      },
      {
        id: 'foreign_income',
        label: 'Foreign Income / FBAR Documents',
        description: 'If you have foreign bank accounts, income, or assets.',
        required: false,
        examples: 'Foreign bank statements, W-8BEN, FBAR (FinCEN 114)',
      },
      {
        id: 'sale_of_home',
        label: 'Home Sale Documents',
        description: 'If you sold your primary residence or investment property.',
        required: false,
        examples: 'HUD-1/closing disclosure, original purchase price records',
      },
    ],
  },
];

// ─── Status Config ────────────────────────────────────────────────────────────

const STATUS_STEPS = [
  { key: 'draft',          label: 'Checklist',        icon: FileText },
  { key: 'submitted',      label: 'Submitted',         icon: Send },
  { key: 'docs_received',  label: 'Docs Received',     icon: CheckCircle2 },
  { key: 'in_review',      label: 'In Review',         icon: Eye },
  { key: 'ready_to_sign',  label: 'Ready to Sign',     icon: FileCheck },
  { key: 'filed',          label: 'Filed!',            icon: Star },
];

type ItemStatus = 'not_started' | 'uploaded' | 'na';

// ─── Main Component ───────────────────────────────────────────────────────────

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

  // tRPC queries
  const { data: returns, refetch } = trpc.remoteReturns.list.useQuery();
  const createMutation = trpc.remoteReturns.create.useMutation({
    onSuccess: (data) => {
      setActiveReturn(data.id);
      toast.success('Your return has been started! Complete the checklist below.');
      refetch();
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });
  const submitMutation = trpc.remoteReturns.submit.useMutation({
    onSuccess: () => {
      toast.success('Your documents have been submitted for review. We\'ll be in touch soon!');
      refetch();
    },
    onError: (e: { message: string }) => toast.error(e.message),
  });
  const saveMutation = trpc.remoteReturns.saveProgress.useMutation({
    onSuccess: () => toast.success('Progress saved'),
    onError: (e: { message: string }) => toast.error(e.message),
  });

  // Compute checklist progress
  const visibleItems = useMemo(() => {
    return CHECKLIST.flatMap(cat =>
      cat.items.filter(item => !item.newClientOnly || isNewClient)
    );
  }, [isNewClient]);

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

  const setItemStatus = (itemId: string, status: ItemStatus) => {
    setItemStatuses(prev => ({ ...prev, [itemId]: status }));
  };

  const handleStart = () => {
    createMutation.mutate({ taxYear, isNewClient });
  };

  const handleSaveProgress = () => {
    if (!activeReturn) return;
    saveMutation.mutate({
      returnId: activeReturn,
      checklistProgress: itemStatuses,
      checklistCompletePct: completionPct,
      clientNotes,
    });
  };

  const handleSubmit = () => {
    if (!activeReturn) return;
    if (!requiredComplete) {
      toast.error('Please complete all required items before submitting.');
      return;
    }
    setSubmitting(true);
    saveMutation.mutate({
      returnId: activeReturn,
      checklistProgress: itemStatuses,
      checklistCompletePct: completionPct,
      clientNotes,
    });
    submitMutation.mutate({ returnId: activeReturn });
    setSubmitting(false);
  };

  // ─── Active Return View ─────────────────────────────────────────────────────

  const activeReturnData = returns?.find((r: { id: number }) => r.id === activeReturn);

  if (activeReturnData && activeReturnData.status !== 'draft') {
    const currentStep = STATUS_STEPS.findIndex(s => s.key === activeReturnData.status);
    return (
      <div className="min-h-screen bg-slate-950 text-white p-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-1">Your Tax Return</h1>
            <p className="text-slate-400">Tax Year {taxYear} · Remote Filing</p>
          </div>

          {/* Status Timeline */}
          <Card className="bg-slate-900 border-slate-800 mb-6">
            <CardHeader>
              <CardTitle className="text-white text-lg">Return Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-0">
                {STATUS_STEPS.map((step, i) => {
                  const isDone = i <= currentStep;
                  const isCurrent = i === currentStep;
                  return (
                    <React.Fragment key={step.key}>
                      <div className="flex flex-col items-center gap-1.5 flex-1">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                          isDone
                            ? 'bg-emerald-500 border-emerald-500'
                            : 'bg-slate-800 border-slate-700'
                        } ${isCurrent ? 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-slate-900' : ''}`}>
                          <step.icon className={`w-4 h-4 ${isDone ? 'text-white' : 'text-slate-500'}`} />
                        </div>
                        <span className={`text-xs text-center leading-tight ${
                          isCurrent ? 'text-emerald-400 font-semibold' : isDone ? 'text-slate-300' : 'text-slate-600'
                        }`}>{step.label}</span>
                      </div>
                      {i < STATUS_STEPS.length - 1 && (
                        <div className={`h-0.5 flex-1 mb-5 ${i < currentStep ? 'bg-emerald-500' : 'bg-slate-700'}`} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Preparer Notes */}
          {activeReturnData.preparerNotes && (
            <Card className="bg-emerald-500/10 border-emerald-500/30 mb-6">
              <CardContent className="pt-4">
                <div className="flex gap-3">
                  <Info className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-emerald-400 font-semibold text-sm mb-1">Note from your preparer</p>
                    <p className="text-slate-300 text-sm">{activeReturnData.preparerNotes}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Documents Uploaded */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white text-lg">Uploaded Documents</CardTitle>
              <CardDescription className="text-slate-400">
                {activeReturnData.checklistCompletePct}% checklist complete
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={activeReturnData.checklistCompletePct ?? 0} className="h-2 mb-4" />
              <p className="text-slate-400 text-sm text-center py-4">
                Your documents are being reviewed. We'll update your status shortly.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ─── Checklist View ─────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
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
                No AI required. Upload your documents, complete the checklist, and your dedicated tax preparer handles everything — then e-files on your behalf.
              </p>
            </div>
            <div className="text-right">
              <p className="text-slate-500 text-sm">Tax Year</p>
              <p className="text-2xl font-bold text-white">{taxYear}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">
                {completedCount} of {visibleItems.length} items completed
              </span>
              <span className={`text-sm font-semibold ${
                completionPct === 100 ? 'text-emerald-400' :
                completionPct >= 60 ? 'text-yellow-400' : 'text-slate-400'
              }`}>{completionPct}%</span>
            </div>
            <Progress value={completionPct} className="h-3" />
            {!requiredComplete && (
              <p className="text-amber-400 text-xs mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Complete all required items (marked with *) before submitting
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-4">

        {/* New Client Toggle */}
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-amber-500/15 rounded-lg flex items-center justify-center">
                  <Star className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm">First time filing with us?</p>
                  <p className="text-slate-500 text-xs">Enables the "Prior Year Return" section so we can carry over your data</p>
                </div>
              </div>
              <Switch
                checked={isNewClient}
                onCheckedChange={setIsNewClient}
                className="data-[state=checked]:bg-amber-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Checklist Categories */}
        {CHECKLIST.map(category => {
          const visibleCategoryItems = category.items.filter(
            item => !item.newClientOnly || isNewClient
          );
          if (visibleCategoryItems.length === 0) return null;

          const categoryComplete = visibleCategoryItems.filter(
            i => itemStatuses[i.id] === 'uploaded' || itemStatuses[i.id] === 'na'
          ).length;
          const isExpanded = expandedCategories.has(category.id);

          return (
            <Card key={category.id} className="bg-slate-900 border-slate-800 overflow-hidden">
              {/* Category Header */}
              <button
                className="w-full flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors"
                onClick={() => toggleCategory(category.id)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center`}>
                    <category.icon className={`w-5 h-5 ${category.color}`} />
                  </div>
                  <div className="text-left">
                    <p className="text-white font-semibold text-sm">{category.title}</p>
                    <p className="text-slate-500 text-xs">
                      {categoryComplete}/{visibleCategoryItems.length} completed
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {categoryComplete === visibleCategoryItems.length && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  )}
                  {isExpanded
                    ? <ChevronDown className="w-4 h-4 text-slate-400" />
                    : <ChevronRight className="w-4 h-4 text-slate-400" />
                  }
                </div>
              </button>

              {/* Category Items */}
              {isExpanded && (
                <div className="border-t border-slate-800">
                  {visibleCategoryItems.map((item, idx) => {
                    const status = itemStatuses[item.id] ?? 'not_started';
                    return (
                      <div
                        key={item.id}
                        className={`p-4 ${idx < visibleCategoryItems.length - 1 ? 'border-b border-slate-800/60' : ''} ${
                          status === 'uploaded' ? 'bg-emerald-500/5' :
                          status === 'na' ? 'bg-slate-800/30' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Status Icon */}
                          <div className="mt-0.5 shrink-0">
                            {status === 'uploaded' ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                            ) : status === 'na' ? (
                              <Circle className="w-5 h-5 text-slate-600" />
                            ) : (
                              <Circle className="w-5 h-5 text-slate-600" />
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <p className={`text-sm font-medium ${
                                status === 'uploaded' ? 'text-emerald-300' :
                                status === 'na' ? 'text-slate-500 line-through' :
                                'text-white'
                              }`}>
                                {item.label}
                                {item.required && (
                                  <span className="text-red-400 ml-1">*</span>
                                )}
                              </p>
                              {item.newClientOnly && (
                                <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/20 text-xs py-0">
                                  New clients
                                </Badge>
                              )}
                            </div>
                            <p className="text-slate-500 text-xs mb-2">{item.description}</p>
                            {item.examples && (
                              <p className="text-slate-600 text-xs italic mb-3">
                                Examples: {item.examples}
                              </p>
                            )}

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2 flex-wrap">
                              <Button
                                size="sm"
                                variant={status === 'uploaded' ? 'default' : 'outline'}
                                className={`h-7 text-xs gap-1.5 ${
                                  status === 'uploaded'
                                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white border-0'
                                    : 'border-slate-700 text-slate-300 hover:bg-slate-800 bg-transparent'
                                }`}
                                onClick={() => setItemStatus(item.id, status === 'uploaded' ? 'not_started' : 'uploaded')}
                              >
                                <Upload className="w-3 h-3" />
                                {status === 'uploaded' ? 'Uploaded ✓' : 'Mark as Uploaded'}
                              </Button>
                              {!item.required && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className={`h-7 text-xs gap-1.5 ${
                                    status === 'na'
                                      ? 'text-slate-400 bg-slate-800'
                                      : 'text-slate-600 hover:text-slate-400'
                                  }`}
                                  onClick={() => setItemStatus(item.id, status === 'na' ? 'not_started' : 'na')}
                                >
                                  <X className="w-3 h-3" />
                                  {status === 'na' ? 'Undo N/A' : 'Not Applicable'}
                                </Button>
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
              <FileText className="w-4 h-4 text-slate-400" />
              Notes for Your Preparer
            </CardTitle>
            <CardDescription className="text-slate-500 text-xs">
              Anything special we should know — life changes, new income sources, questions, concerns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={clientNotes}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setClientNotes(e.target.value)}
              placeholder="e.g. I started a side business this year selling on Etsy. I also moved from Texas to California in June. I have a question about whether my home office qualifies..."
              className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-600 min-h-[100px] resize-none"
            />
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pb-8">
          {!activeReturn ? (
            <Button
              onClick={handleStart}
              disabled={createMutation.isPending}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white h-12 text-base font-semibold gap-2"
            >
              {createMutation.isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Starting...</>
              ) : (
                <><Plus className="w-4 h-4" /> Start My Return</>
              )}
            </Button>
          ) : (
            <>
              <Button
                onClick={handleSaveProgress}
                disabled={saveMutation.isPending}
                variant="outline"
                className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800 bg-transparent h-12 gap-2"
              >
                {saveMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                ) : (
                  'Save Progress'
                )}
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!requiredComplete || submitting || submitMutation.isPending}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white h-12 text-base font-semibold gap-2 disabled:opacity-50"
              >
                {submitMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                ) : (
                  <><Send className="w-4 h-4" /> Submit for Review <ArrowRight className="w-4 h-4" /></>
                )}
              </Button>
            </>
          )}
        </div>

        {/* Required items reminder */}
        {!requiredComplete && (
          <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg -mt-2 mb-6">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-amber-300 text-xs">
              <strong>Required items remaining:</strong>{' '}
              {requiredItems
                .filter(i => itemStatuses[i.id] !== 'uploaded' && itemStatuses[i.id] !== 'na')
                .map(i => i.label)
                .join(', ')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
