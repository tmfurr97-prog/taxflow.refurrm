import React, { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useLocation } from 'wouter';
import {
  BookOpen, Lock, CheckCircle2, Play, Clock, Star,
  ChevronRight, ChevronLeft, ArrowRight, Briefcase,
  DollarSign, Building2, FileText, Users, Zap, Gift,
  TrendingUp, Shield, X
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Static Course Data ────────────────────────────────────────────────────────
const TRACKS = [
  {
    id: 'gig_worker',
    icon: Zap,
    color: 'emerald',
    label: 'Gig Workers',
    tagline: 'Uber, DoorDash, Instacart & more',
    courses: [
      {
        slug: 'gig-tax-basics',
        title: 'Tax Basics for Gig Workers',
        description: 'Understand self-employment tax, quarterly payments, and what the IRS expects from you.',
        lessons: [
          { slug: 'what-is-self-employment-tax', title: 'What Is Self-Employment Tax?', duration: '4 min', isPremium: false, upsell: null },
          { slug: 'quarterly-estimated-payments', title: 'Quarterly Estimated Payments Explained', duration: '6 min', isPremium: false, upsell: 'quarterly' },
          { slug: 'deductions-gig-workers', title: 'Top 10 Deductions for Gig Workers', duration: '8 min', isPremium: true, upsell: 'remote_returns' },
          { slug: 'mileage-tracking-101', title: 'Mileage Tracking: The Right Way', duration: '5 min', isPremium: true, upsell: null },
        ]
      }
    ]
  },
  {
    id: 'freelancer',
    icon: Briefcase,
    color: 'blue',
    label: 'Freelancers',
    tagline: 'Designers, developers, consultants',
    courses: [
      {
        slug: 'freelancer-finances',
        title: 'Self-Employed & Freelancer Finances',
        description: 'Invoicing, business bank accounts, 1099s, and keeping the IRS happy all year.',
        lessons: [
          { slug: 'separate-business-personal', title: 'Separate Business & Personal Finances', duration: '5 min', isPremium: false, upsell: null },
          { slug: 'understanding-1099s', title: 'Understanding 1099-NEC & 1099-K', duration: '7 min', isPremium: false, upsell: null },
          { slug: 'home-office-deduction', title: 'The Home Office Deduction (Done Right)', duration: '6 min', isPremium: true, upsell: 'remote_returns' },
          { slug: 'retirement-accounts-freelancers', title: 'Retirement Accounts That Cut Your Tax Bill', duration: '8 min', isPremium: true, upsell: null },
        ]
      }
    ]
  },
  {
    id: 'bookkeeping',
    icon: DollarSign,
    color: 'violet',
    label: 'Bookkeeping',
    tagline: 'Track money in, money out',
    courses: [
      {
        slug: 'bookkeeping-101',
        title: 'Small Business Bookkeeping 101',
        description: 'No accounting degree needed. Learn to track income, expenses, and generate reports.',
        lessons: [
          { slug: 'income-expense-tracking', title: 'Income & Expense Tracking Made Simple', duration: '5 min', isPremium: false, upsell: null },
          { slug: 'categories-that-matter', title: 'The Categories That Actually Matter for Taxes', duration: '6 min', isPremium: false, upsell: null },
          { slug: 'reading-profit-loss', title: 'Reading Your Profit & Loss Report', duration: '7 min', isPremium: true, upsell: null },
          { slug: 'year-end-cleanup', title: 'Year-End Books Cleanup Checklist', duration: '9 min', isPremium: true, upsell: 'remote_returns' },
        ]
      }
    ]
  },
  {
    id: 'business',
    icon: Building2,
    color: 'amber',
    label: 'Business Formation',
    tagline: 'LLC, S-Corp, EIN & compliance',
    courses: [
      {
        slug: 'start-protect-business',
        title: 'Start & Protect Your Business',
        description: 'LLC vs S-Corp, getting your EIN, registered agents, and staying compliant.',
        lessons: [
          { slug: 'llc-vs-sole-prop', title: 'LLC vs Sole Proprietor: Which Is Right for You?', duration: '6 min', isPremium: false, upsell: null },
          { slug: 'getting-your-ein', title: 'Getting Your EIN (Free, 5 Minutes)', duration: '4 min', isPremium: false, upsell: null },
          { slug: 'scorp-election', title: 'The S-Corp Election: Save Thousands in Tax', duration: '10 min', isPremium: true, upsell: 'notary' },
          { slug: 'annual-compliance', title: 'Annual Compliance: What You Must File', duration: '7 min', isPremium: true, upsell: 'notary' },
        ]
      }
    ]
  },
];

// ─── Lesson Content ────────────────────────────────────────────────────────────
const LESSON_CONTENT: Record<string, string> = {
  'what-is-self-employment-tax': `## What Is Self-Employment Tax?

When you work for an employer, they pay half of your Social Security and Medicare taxes. When you work for yourself, **you pay both halves** — that's the self-employment (SE) tax.

### The Numbers
- **15.3%** of your net self-employment income
- Broken down: 12.4% Social Security + 2.9% Medicare
- Applies to the first **$168,600** of net earnings (2024)

### The Good News
You can deduct **half of your SE tax** on your income tax return (Form 1040, Schedule 1). So if you owe $3,000 in SE tax, you get a $1,500 deduction.

### What This Means for You
If you earn **$50,000** from gig work:
- Net SE income ≈ $47,000 (after 92.35% adjustment)
- SE tax ≈ **$7,200**
- Deductible half ≈ **$3,600**

> **Pro tip:** Set aside 25-30% of every payment you receive. This covers both SE tax and income tax so you're never caught off guard.

### Next Step
Now that you understand SE tax, let's look at how to pay it throughout the year — before the IRS charges you penalties.`,

  'quarterly-estimated-payments': `## Quarterly Estimated Payments Explained

The IRS wants its money **throughout the year**, not just in April. If you expect to owe $1,000 or more in taxes, you're required to make quarterly payments.

### The Four Deadlines
| Quarter | Period | Due Date |
|---------|--------|----------|
| Q1 | Jan 1 – Mar 31 | **April 15** |
| Q2 | Apr 1 – May 31 | **June 15** |
| Q3 | Jun 1 – Aug 31 | **September 15** |
| Q4 | Sep 1 – Dec 31 | **January 15** (next year) |

### How to Calculate
The simplest method: **pay 25% of last year's total tax bill** each quarter. This is called the "safe harbor" method — if you hit 100% of last year's tax, you won't owe penalties even if you earn more this year.

### How to Pay
- **IRS Direct Pay** at irs.gov/payments (free)
- **EFTPS** (Electronic Federal Tax Payment System)
- **IRS2Go app**
- Or let TaxFlow calculate and remind you automatically 📱

> **Missing a payment?** The penalty is typically 0.5% per month on the unpaid amount — small, but avoidable.`,

  'separate-business-personal': `## Separate Business & Personal Finances

This is the **#1 habit** that separates organized freelancers from stressed ones at tax time.

### Why It Matters
- Every business expense needs to be **provable** to the IRS
- Mixing accounts makes it nearly impossible to find deductions
- A dedicated business account makes your bookkeeping 10x faster

### What You Need
1. **Business checking account** — open one at any bank, often free for sole proprietors
2. **Business credit card** — earns rewards AND creates a clean expense record
3. **Pay yourself** — transfer money from business to personal on a schedule

### The Rule
**Every dollar that touches your business goes through the business account.** Client payments in, business expenses out. Simple.

### Recommended Setup
- Business checking: Relay, Mercury, or Novo (all free, built for freelancers)
- Business card: Chase Ink Cash or American Express Blue Business Cash
- Accounting: TaxFlow tracks everything automatically once connected

> **Already mixed?** Don't panic. Go back 3 months, highlight business transactions in your statements, and start clean from today.`,

  'income-expense-tracking': `## Income & Expense Tracking Made Simple

Good bookkeeping isn't complicated — it's just **consistent**. Here's the system that works.

### The Two Things You Track
1. **Income** — every dollar that comes in (invoices paid, platform payouts, cash)
2. **Expenses** — every dollar that goes out for business purposes

### Categories That Matter Most
| Category | Examples |
|----------|---------|
| Cost of Goods Sold | Materials, inventory, subcontractors |
| Advertising | Facebook ads, Google ads, business cards |
| Office Expenses | Software, supplies, printer ink |
| Travel | Flights, hotels for business trips |
| Meals (50%) | Client dinners, business lunches |
| Vehicle | Mileage or actual expenses |
| Professional Services | Accountant, attorney fees |
| Home Office | Portion of rent/mortgage, utilities |

### The Weekly Habit
Set aside **15 minutes every Friday** to:
1. Log any cash transactions
2. Review and categorize new bank/card transactions
3. Upload any paper receipts

That's it. 15 minutes a week = zero stress in April.

> **TaxFlow tip:** Connect your bank account and TaxGPT will auto-categorize transactions for you. Review and confirm — done.`,

  'llc-vs-sole-prop': `## LLC vs Sole Proprietor: Which Is Right for You?

Most freelancers and gig workers start as sole proprietors without even knowing it. Here's how to decide if you need an LLC.

### Sole Proprietor
- **Default status** — you're automatically one if you work for yourself
- **No paperwork** required to start
- **No separation** between personal and business legally
- Your personal assets (car, house, savings) are at risk if sued

### LLC (Limited Liability Company)
- **Protects personal assets** from business lawsuits and debts
- Costs $50–$500 to form (varies by state)
- Requires annual fees and reports in most states
- **Same tax treatment** as sole prop by default (pass-through)

### When You Need an LLC
✅ You work with clients directly (consulting, services)
✅ You have significant assets to protect
✅ You want to look more professional
✅ Your income is growing above $40,000/year

### When You Can Wait
⏳ Just starting out with minimal income
⏳ Very low-risk work (writing, data entry)
⏳ Testing a business idea

> **Next level:** Once your LLC earns $40,000+ in profit, look into the **S-Corp election** — it can save you $5,000–$15,000/year in self-employment tax. See the next lesson.`,
};

// ─── Upsell Cards ─────────────────────────────────────────────────────────────
function UpsellCard({ type }: { type: string | null }) {
  const [, navigate] = useLocation();
  if (!type) return null;

  const cards: Record<string, { icon: React.ElementType; title: string; desc: string; cta: string; path: string; color: string }> = {
    remote_returns: {
      icon: Users,
      title: 'Want us to handle this for you?',
      desc: 'Skip the DIY. Upload your documents and our team files your return — guaranteed accurate.',
      cta: 'Start My Remote Return',
      path: '/remote-returns',
      color: 'emerald',
    },
    notary: {
      icon: Shield,
      title: 'Need documents notarized?',
      desc: 'We offer Remote Online Notarization (RON) for business formation docs, contracts, and more.',
      cta: 'Book a Notary Session',
      path: '/notary',
      color: 'blue',
    },
    quarterly: {
      icon: DollarSign,
      title: 'Never miss a quarterly payment',
      desc: 'TaxFlow calculates your estimated payments and reminds you before every deadline.',
      cta: 'Set Up Quarterly Tracking',
      path: '/quarterly',
      color: 'violet',
    },
    upgrade: {
      icon: Star,
      title: 'Unlock all premium lessons',
      desc: 'Get full access to every course, lesson, and resource for just $24.99/month.',
      cta: 'Upgrade to Premium',
      path: '/pricing',
      color: 'amber',
    },
  };

  const card = cards[type];
  if (!card) return null;

  return (
    <div className={cn(
      "mt-8 p-5 rounded-xl border flex items-start gap-4",
      type === 'remote_returns' ? 'bg-emerald-500/10 border-emerald-500/30' :
      type === 'notary' ? 'bg-blue-500/10 border-blue-500/30' :
      type === 'quarterly' ? 'bg-violet-500/10 border-violet-500/30' :
      'bg-amber-500/10 border-amber-500/30'
    )}>
      <div className={cn(
        "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
        type === 'remote_returns' ? 'bg-emerald-500/20' :
        type === 'notary' ? 'bg-blue-500/20' :
        type === 'quarterly' ? 'bg-violet-500/20' :
        'bg-amber-500/20'
      )}>
        <card.icon className={cn(
          "w-5 h-5",
          type === 'remote_returns' ? 'text-emerald-400' :
          type === 'notary' ? 'text-blue-400' :
          type === 'quarterly' ? 'text-violet-400' :
          'text-amber-400'
        )} />
      </div>
      <div className="flex-1">
        <p className="text-gray-900 font-semibold text-sm">{card.title}</p>
        <p className="text-gray-500 text-sm mt-1">{card.desc}</p>
        <Button
          size="sm"
          onClick={() => navigate(card.path)}
          className={cn(
            "mt-3 text-gray-900",
            type === 'remote_returns' ? 'bg-emerald-600 hover:bg-emerald-700' :
            type === 'notary' ? 'bg-blue-600 hover:bg-blue-700' :
            type === 'quarterly' ? 'bg-violet-600 hover:bg-violet-700' :
            'bg-amber-600 hover:bg-amber-700'
          )}
        >
          {card.cta} <ArrowRight className="w-3 h-3 ml-1" />
        </Button>
      </div>
    </div>
  );
}

// ─── Lead Magnet Modal ─────────────────────────────────────────────────────────
function LeadMagnetModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const captureMutation = trpc.academy.captureLeadMagnet.useMutation({
    onSuccess: () => setSubmitted(true),
    onError: () => toast.error('Something went wrong. Please try again.'),
  });

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-gray-200 rounded-2xl p-8 max-w-md w-full relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-900">
          <X className="w-5 h-5" />
        </button>
        {submitted ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="text-gray-900 text-xl font-bold mb-2">You're in!</h3>
            <p className="text-gray-500 text-sm">Check your email for the Gig Worker Tax Starter Kit. We'll also send you tax tips and deadline reminders throughout the year.</p>
            <Button onClick={onClose} className="mt-6 bg-emerald-600 hover:bg-emerald-700 text-gray-900 w-full">
              Start Learning
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                <Gift className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-gray-900 font-bold text-lg leading-tight">Free Gig Worker Tax Starter Kit</h3>
                <p className="text-emerald-400 text-sm">Valued at $47 — yours free</p>
              </div>
            </div>
            <ul className="space-y-2 mb-6">
              {[
                'Quarterly payment calculator spreadsheet',
                'Top 25 gig worker deductions checklist',
                'What to save all year (document list)',
                'Tax deadline calendar for 2025',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-gray-600 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="space-y-3">
              <Input
                placeholder="Your first name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-gray-100 border-gray-200 text-gray-900 placeholder:text-gray-500"
              />
              <Input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-gray-100 border-gray-200 text-gray-900 placeholder:text-gray-500"
              />
              <Button
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-gray-900"
                disabled={!email || captureMutation.isPending}
                onClick={() => captureMutation.mutate({ email, name })}
              >
                {captureMutation.isPending ? 'Sending...' : 'Send Me the Starter Kit →'}
              </Button>
            </div>
            <p className="text-gray-600 text-xs text-center mt-3">No spam. Unsubscribe anytime.</p>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Lesson Viewer ─────────────────────────────────────────────────────────────
function LessonViewer({
  lesson,
  isPremiumUser,
  onBack,
  onComplete,
  isCompleted,
}: {
  lesson: typeof TRACKS[0]['courses'][0]['lessons'][0];
  isPremiumUser: boolean;
  onBack: () => void;
  onComplete: () => void;
  isCompleted: boolean;
}) {
  const locked = lesson.isPremium && !isPremiumUser;
  const [, navigate] = useLocation();
  const content = LESSON_CONTENT[lesson.slug] || `## ${lesson.title}\n\nThis lesson content is coming soon. Check back shortly!`;

  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 transition-colors text-sm">
        <ChevronLeft className="w-4 h-4" /> Back to courses
      </button>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-gray-900 text-xl font-bold">{lesson.title}</h1>
              <div className="flex items-center gap-3 mt-2">
                <span className="flex items-center gap-1 text-gray-500 text-sm">
                  <Clock className="w-3.5 h-3.5" /> {lesson.duration}
                </span>
                {lesson.isPremium && (
                  <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">
                    <Star className="w-3 h-3 mr-1" /> Premium
                  </Badge>
                )}
                {isCompleted && (
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Completed
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        {locked ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-amber-400" />
            </div>
            <h3 className="text-gray-900 text-lg font-semibold mb-2">Premium Lesson</h3>
            <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6">
              Upgrade to SmartBooks Academy Premium to unlock this lesson and all future content.
            </p>
            <Button
              onClick={() => navigate('/pricing')}
              className="bg-amber-600 hover:bg-amber-700 text-gray-900"
            >
              <Star className="w-4 h-4 mr-2" /> Unlock for $24.99/mo
            </Button>
            <p className="text-gray-600 text-xs mt-3">Cancel anytime. Includes all app features.</p>
          </div>
        ) : (
          <div className="p-6">
            {/* Render markdown-like content */}
            <div className="prose prose-invert prose-sm max-w-none">
              {content.split('\n').map((line, i) => {
                if (line.startsWith('## ')) return <h2 key={i} className="text-gray-900 text-lg font-bold mt-6 mb-3 first:mt-0">{line.slice(3)}</h2>;
                if (line.startsWith('### ')) return <h3 key={i} className="text-gray-900 font-semibold mt-4 mb-2">{line.slice(4)}</h3>;
                if (line.startsWith('> ')) return (
                  <blockquote key={i} className="border-l-4 border-emerald-500 pl-4 py-1 my-3 bg-emerald-500/5 rounded-r-lg">
                    <p className="text-emerald-300 text-sm italic">{line.slice(2)}</p>
                  </blockquote>
                );
                if (line.startsWith('✅') || line.startsWith('⏳')) return <p key={i} className="text-gray-600 text-sm my-1">{line}</p>;
                if (line.startsWith('- **') || line.startsWith('- ')) return (
                  <li key={i} className="text-gray-600 text-sm ml-4 my-0.5 list-disc">{line.slice(2).replace(/\*\*(.*?)\*\*/g, '$1')}</li>
                );
                if (line.startsWith('| ')) {
                  const cells = line.split('|').filter(c => c.trim());
                  const isHeader = content.split('\n')[i + 1]?.includes('---');
                  const isSeparator = line.includes('---');
                  if (isSeparator) return null;
                  return (
                    <div key={i} className={cn("flex gap-0 text-sm", isHeader ? "font-semibold text-gray-900 border-b border-gray-200 pb-1 mb-1" : "text-gray-600 border-b border-gray-200/50")}>
                      {cells.map((cell, j) => (
                        <div key={j} className="flex-1 py-1.5 px-2 first:pl-0">{cell.trim()}</div>
                      ))}
                    </div>
                  );
                }
                if (line.trim() === '') return <div key={i} className="h-2" />;
                return <p key={i} className="text-gray-600 text-sm leading-relaxed my-1"
                  dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-gray-900">$1</strong>') }}
                />;
              })}
            </div>

            {/* Upsell */}
            <UpsellCard type={lesson.upsell} />

            {/* Complete button */}
            {!isCompleted && (
              <Button
                onClick={onComplete}
                className="mt-6 bg-emerald-600 hover:bg-emerald-700 text-gray-900 w-full"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" /> Mark as Complete
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Academy Page ─────────────────────────────────────────────────────────
export default function Academy() {
  const { user } = useAuth();
  const [selectedLesson, setSelectedLesson] = useState<typeof TRACKS[0]['courses'][0]['lessons'][0] | null>(null);
  const [showLeadMagnet, setShowLeadMagnet] = useState(false);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());

  const { data: progress } = trpc.academy.getProgress.useQuery(undefined, { enabled: !!user });
  const markCompleteMutation = trpc.academy.markLessonComplete.useMutation({
    onSuccess: (_, vars) => {
      setCompletedLessons(prev => new Set(Array.from(prev).concat(vars.lessonSlug)));
      toast.success('Lesson completed! Great work 🎉');
    },
  });

  // Merge server progress with local state
  const allCompleted = new Set(
    (progress?.map((p: { lessonSlug: string }) => p.lessonSlug) ?? []).concat(Array.from(completedLessons))
  );

  // Premium check — users with paid subscription
  const isPremiumUser = (user as any)?.subscriptionStatus === 'active';

  // Count total and completed lessons per track
  const trackStats = TRACKS.map(track => {
    const allLessons = track.courses.flatMap(c => c.lessons);
    const completed = allLessons.filter(l => allCompleted.has(l.slug)).length;
    return { id: track.id, total: allLessons.length, completed };
  });

  if (selectedLesson) {
    return (
      <div className="p-6">
        <LessonViewer
          lesson={selectedLesson}
          isPremiumUser={isPremiumUser}
          onBack={() => setSelectedLesson(null)}
          isCompleted={allCompleted.has(selectedLesson.slug)}
          onComplete={() => {
            markCompleteMutation.mutate({ lessonSlug: selectedLesson.slug });
          }}
        />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {showLeadMagnet && <LeadMagnetModal onClose={() => setShowLeadMagnet(false)} />}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-gray-900 text-2xl font-bold">SmartBooks Academy</h1>
            <p className="text-gray-500 text-sm">Tax & finance education for the self-employed</p>
          </div>
        </div>

        {/* Lead magnet banner */}
        <div
          className="mt-4 p-4 bg-gradient-to-r from-emerald-900/40 to-teal-900/40 border border-emerald-700/40 rounded-xl flex items-center gap-4 cursor-pointer hover:border-emerald-500/60 transition-colors"
          onClick={() => setShowLeadMagnet(true)}
        >
          <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center shrink-0">
            <Gift className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex-1">
            <p className="text-gray-900 font-semibold text-sm">🎁 Free: Gig Worker Tax Starter Kit</p>
            <p className="text-gray-500 text-xs">Quarterly calculator, deductions checklist, deadline calendar — all free</p>
          </div>
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-gray-900 shrink-0">
            Get It Free
          </Button>
        </div>
      </div>

      {/* Overall progress */}
      {user && (
        <div className="mb-8 p-4 bg-white border border-gray-200 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-900 text-sm font-medium">Your Overall Progress</span>
            <span className="text-emerald-400 text-sm font-semibold">
              {allCompleted.size} / {TRACKS.flatMap(t => t.courses.flatMap(c => c.lessons)).length} lessons
            </span>
          </div>
          <Progress
            value={(allCompleted.size / TRACKS.flatMap(t => t.courses.flatMap(c => c.lessons)).length) * 100}
            className="h-2 bg-gray-100"
          />
        </div>
      )}

      {/* Course tracks */}
      <div className="space-y-8">
        {TRACKS.map((track) => {
          const stats = trackStats.find(s => s.id === track.id)!;
          const TrackIcon = track.icon;
          const colorMap: Record<string, string> = {
            emerald: 'bg-emerald-500/10 border-emerald-700/40 text-emerald-400',
            blue: 'bg-blue-500/10 border-blue-700/40 text-blue-400',
            violet: 'bg-violet-500/10 border-violet-700/40 text-violet-400',
            amber: 'bg-amber-500/10 border-amber-700/40 text-amber-400',
          };
          const badgeColor: Record<string, string> = {
            emerald: 'bg-emerald-500/20 text-emerald-400',
            blue: 'bg-blue-500/20 text-blue-400',
            violet: 'bg-violet-500/20 text-violet-400',
            amber: 'bg-amber-500/20 text-amber-400',
          };

          return (
            <div key={track.id}>
              {/* Track header */}
              <div className="flex items-center gap-3 mb-4">
                <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center border", colorMap[track.color])}>
                  <TrackIcon className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-gray-900 font-bold">{track.label}</h2>
                  <p className="text-gray-500 text-xs">{track.tagline}</p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <span className="text-gray-500 text-xs">{stats.completed}/{stats.total} done</span>
                  <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all", `bg-${track.color}-500`)}
                      style={{ width: `${(stats.completed / stats.total) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Lessons */}
              {track.courses.map(course => (
                <div key={course.slug} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <div className="px-5 py-3 border-b border-gray-200 bg-white/80">
                    <h3 className="text-gray-900 text-sm font-semibold">{course.title}</h3>
                    <p className="text-gray-500 text-xs mt-0.5">{course.description}</p>
                  </div>
                  <div className="divide-y divide-slate-800">
                    {course.lessons.map((lesson, idx) => {
                      const isLocked = lesson.isPremium && !isPremiumUser;
                      const isDone = allCompleted.has(lesson.slug);
                      return (
                        <div
                          key={lesson.slug}
                          onClick={() => setSelectedLesson(lesson)}
                          className={cn(
                            "flex items-center gap-4 px-5 py-4 cursor-pointer transition-colors group",
                            isLocked ? "opacity-70 hover:bg-gray-100/30" : "hover:bg-gray-100/50"
                          )}
                        >
                          {/* Status icon */}
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-semibold",
                            isDone ? "bg-emerald-500/20 text-emerald-400" :
                            isLocked ? "bg-gray-100 text-gray-600" :
                            "bg-gray-100 text-gray-500 group-hover:bg-gray-200"
                          )}>
                            {isDone ? <CheckCircle2 className="w-4 h-4" /> :
                             isLocked ? <Lock className="w-3.5 h-3.5" /> :
                             <Play className="w-3.5 h-3.5" />}
                          </div>

                          {/* Lesson info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={cn("text-sm font-medium", isDone ? "text-gray-500 line-through" : "text-gray-900")}>
                                {lesson.title}
                              </span>
                              {lesson.isPremium && (
                                <Badge className={cn("text-xs border-0 px-1.5 py-0", badgeColor[track.color])}>
                                  <Star className="w-2.5 h-2.5 mr-0.5" /> Pro
                                </Badge>
                              )}
                            </div>
                            <span className="text-gray-500 text-xs flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3" /> {lesson.duration}
                            </span>
                          </div>

                          <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-500 transition-colors shrink-0" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Premium upgrade CTA */}
      {!isPremiumUser && (
        <div className="mt-10 p-6 bg-gradient-to-br from-amber-900/30 to-orange-900/20 border border-amber-700/40 rounded-2xl text-center">
          <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <TrendingUp className="w-6 h-6 text-amber-400" />
          </div>
          <h3 className="text-gray-900 font-bold text-lg mb-1">Unlock All Premium Lessons</h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto mb-4">
            Get full access to every course, plus TaxGPT, automated bookkeeping, and all app features — for less than a cup of coffee a day.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <div className="text-center">
              <p className="text-gray-900 font-bold text-2xl">$6.99<span className="text-gray-500 text-sm font-normal">/wk</span></p>
              <p className="text-gray-500 text-xs">Weekly</p>
            </div>
            <div className="text-center border-x border-gray-200 px-4">
              <p className="text-amber-400 font-bold text-2xl">$24.99<span className="text-gray-500 text-sm font-normal">/mo</span></p>
              <p className="text-amber-500 text-xs font-medium">Most Popular</p>
            </div>
            <div className="text-center">
              <p className="text-gray-900 font-bold text-2xl">$249<span className="text-gray-500 text-sm font-normal">/yr</span></p>
              <p className="text-gray-500 text-xs">Save 17%</p>
            </div>
          </div>
          <Button
            className="mt-5 bg-amber-600 hover:bg-amber-700 text-gray-900 px-8"
            onClick={() => window.location.href = '/pricing'}
          >
            <Star className="w-4 h-4 mr-2" /> Get Full Access
          </Button>
        </div>
      )}
    </div>
  );
}
