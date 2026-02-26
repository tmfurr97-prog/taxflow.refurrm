import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLocation } from 'wouter';
import { useAuth } from '@/_core/hooks/useAuth';
import { getLoginUrl } from '@/const';
import {
  Check, Star, Zap, Briefcase, Building2, ArrowRight,
  Receipt, MapPin, Shield, BookOpen, Users, FileText,
  DollarSign, Clock, ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

const PLANS = [
  {
    id: 'free', name: 'Free', icon: Zap, color: 'slate',
    monthly: 0, annual: 0, tagline: 'Get organized, no commitment', cta: 'Start Free',
    features: ['Receipt scanning (10/month)', 'Mileage tracking (50 trips/month)', 'Basic dashboard', '1 quarterly tax estimate', 'Document storage (500 MB)', 'SmartBooks Academy (intro lessons)'],
    locked: ['TaxGPT AI assistant', 'Unlimited receipts & mileage', 'Bank account sync', 'E-filing'],
  },
  {
    id: 'essential', name: 'Essential', icon: Receipt, color: 'blue',
    monthly: 9.99, annual: 99, tagline: 'For gig workers & side hustlers', cta: 'Get Essential',
    features: ['Unlimited receipt scanning', 'Unlimited mileage tracking', 'All quarterly tax tools', 'TaxGPT AI (50 questions/month)', 'Document vault (5 GB)', 'SmartBooks Academy (free lessons)', 'Email & chat support'],
    locked: ['Crypto tax tracking', 'Business entity management', 'Audit defense hub', 'Full Academy access'],
  },
  {
    id: 'pro', name: 'Pro', icon: Star, color: 'emerald',
    monthly: 24.99, annual: 199, tagline: 'For freelancers & self-employed', cta: 'Go Pro', popular: true,
    features: ['Everything in Essential', 'Unlimited TaxGPT AI', 'Crypto tax tracking & Form 8949', 'Business entity management', 'Audit defense hub', 'Full SmartBooks Academy access', 'Bank account sync (Plaid)', 'Priority support'],
    locked: [],
  },
  {
    id: 'business', name: 'Business', icon: Building2, color: 'violet',
    monthly: 39.99, annual: 349, tagline: 'For small businesses & multi-entity', cta: 'Get Business',
    features: ['Everything in Pro', 'Up to 5 business entities', 'Profit & loss reports', 'Bookkeeping dashboard', 'Multi-user access (up to 3)', 'Dedicated account manager', 'White-glove onboarding'],
    locked: [],
  },
];

const ADDONS = [
  { icon: Users, title: 'Remote Return — Human Filed', desc: 'Upload your documents and our team prepares and e-files your return. Guaranteed accurate.', price: 'From $149', badge: 'Most Popular', badgeColor: 'emerald', cta: 'Book Now', path: '/remote-returns' },
  { icon: MapPin, title: 'State Return Add-On', desc: 'Add a state return to your federal filing. We handle the forms, you just review and sign.', price: '$49', badge: null, badgeColor: null, cta: 'Add to Return', path: '/remote-returns' },
  { icon: Shield, title: 'Remote Online Notarization', desc: 'Get documents notarized from anywhere. Business formation, contracts, real estate & more.', price: 'From $25', badge: null, badgeColor: null, cta: 'Book Session', path: '/notary' },
  { icon: Shield, title: 'Audit Defense Package', desc: "If the IRS comes knocking, we've got your back. Full representation and correspondence handling.", price: '$99/yr', badge: 'Peace of Mind', badgeColor: 'blue', cta: 'Add Protection', path: '/audit-defense' },
  { icon: DollarSign, title: 'Bookkeeping Cleanup', desc: "Behind on your books? We'll clean up your records and get you current — one-time service.", price: 'From $99', badge: null, badgeColor: null, cta: 'Get a Quote', path: '/remote-returns' },
  { icon: FileText, title: 'Prior Year Return', desc: 'Need to file a previous year? We handle late returns for any year, no judgment.', price: 'From $199', badge: null, badgeColor: null, cta: 'Get Started', path: '/remote-returns' },
];

const colorStyles: Record<string, { ring: string; btn: string; icon: string; check: string }> = {
  slate: { ring: 'border-slate-700', btn: 'bg-slate-700 hover:bg-slate-600 text-white', icon: 'bg-slate-800 text-slate-400', check: 'text-slate-400' },
  blue: { ring: 'border-blue-700/50', btn: 'bg-blue-600 hover:bg-blue-700 text-white', icon: 'bg-blue-500/20 text-blue-400', check: 'text-blue-400' },
  emerald: { ring: 'border-emerald-500/60 ring-2 ring-emerald-500/20', btn: 'bg-emerald-600 hover:bg-emerald-700 text-white', icon: 'bg-emerald-500/20 text-emerald-400', check: 'text-emerald-400' },
  violet: { ring: 'border-violet-700/50', btn: 'bg-violet-600 hover:bg-violet-700 text-white', icon: 'bg-violet-500/20 text-violet-400', check: 'text-violet-400' },
};

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Hero */}
        <div className="text-center mb-12">
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 mb-4">Simple, transparent pricing</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Less than what you'd pay<br /><span className="text-emerald-400">to file your taxes.</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            SmartBooks24 works all year so you're never scrambling in April. Start free — upgrade when you're ready.
          </p>
          <div className="flex items-center justify-center gap-4 mt-8">
            <span className={cn("text-sm font-medium", !isAnnual ? 'text-white' : 'text-slate-500')}>Monthly</span>
            <button onClick={() => setIsAnnual(!isAnnual)} className={cn("relative w-14 h-7 rounded-full transition-colors", isAnnual ? 'bg-emerald-600' : 'bg-slate-700')}>
              <div className={cn("absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform", isAnnual ? 'translate-x-8' : 'translate-x-1')} />
            </button>
            <span className={cn("text-sm font-medium flex items-center gap-2", isAnnual ? 'text-white' : 'text-slate-500')}>
              Annual <Badge className="bg-emerald-500/20 text-emerald-400 border-0 text-xs">Save up to 2 months</Badge>
            </span>
          </div>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {PLANS.map((plan) => {
            const price = isAnnual ? plan.annual : plan.monthly;
            const PlanIcon = plan.icon;
            const styles = colorStyles[plan.color];
            return (
              <div key={plan.id} className={cn("relative bg-slate-900 border rounded-2xl p-6 flex flex-col", styles.ring, (plan as any).popular ? 'shadow-lg shadow-emerald-500/10' : '')}>
                {(plan as any).popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-emerald-600 text-white border-0 px-3 py-1 text-xs font-semibold">⭐ Most Popular</Badge>
                  </div>
                )}
                <div className="flex items-center gap-3 mb-4">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", styles.icon)}><PlanIcon className="w-5 h-5" /></div>
                  <div><h3 className="text-white font-bold">{plan.name}</h3><p className="text-slate-500 text-xs">{plan.tagline}</p></div>
                </div>
                <div className="mb-6">
                  {price === 0 ? (
                    <div className="flex items-baseline gap-1"><span className="text-white text-4xl font-bold">Free</span><span className="text-slate-500 text-sm">forever</span></div>
                  ) : (
                    <div className="flex items-baseline gap-1"><span className="text-slate-400 text-lg">$</span><span className="text-white text-4xl font-bold">{price}</span><span className="text-slate-500 text-sm">{isAnnual ? '/yr' : '/mo'}</span></div>
                  )}
                  {isAnnual && plan.monthly > 0 && <p className="text-emerald-400 text-xs mt-1">Save ${((plan.monthly * 12) - plan.annual).toFixed(0)} vs monthly</p>}
                </div>
                <Button className={cn("w-full mb-6", styles.btn)} onClick={() => plan.id === 'free' ? (isAuthenticated ? navigate('/dashboard') : (window.location.href = getLoginUrl())) : navigate('/subscriptions')}>
                  {plan.cta} <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <div className="space-y-2.5 flex-1">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-start gap-2.5"><Check className={cn("w-4 h-4 mt-0.5 shrink-0", styles.check)} /><span className="text-slate-300 text-sm">{f}</span></div>
                  ))}
                  {plan.locked.map((f) => (
                    <div key={f} className="flex items-start gap-2.5 opacity-40"><div className="w-4 h-4 mt-0.5 shrink-0 flex items-center justify-center"><div className="w-3 h-0.5 bg-slate-600 rounded" /></div><span className="text-slate-500 text-sm line-through">{f}</span></div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* À la carte */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white mb-2">À La Carte Services</h2>
            <p className="text-slate-400">Only pay for what you need. Add services to any plan — even the free one.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {ADDONS.map((addon) => {
              const AddonIcon = addon.icon;
              return (
                <div key={addon.title} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors group cursor-pointer" onClick={() => navigate(addon.path)}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center shrink-0"><AddonIcon className="w-5 h-5 text-slate-400" /></div>
                    {addon.badge && <Badge className={cn("text-xs border-0", addon.badgeColor === 'emerald' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400')}>{addon.badge}</Badge>}
                  </div>
                  <h3 className="text-white font-semibold text-sm mb-1">{addon.title}</h3>
                  <p className="text-slate-500 text-xs mb-4 leading-relaxed">{addon.desc}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-400 font-bold">{addon.price}</span>
                    <span className="text-slate-500 text-xs flex items-center gap-1 group-hover:text-slate-300 transition-colors">{addon.cta} <ChevronRight className="w-3 h-3" /></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 mb-12">
          <h3 className="text-white font-bold text-xl mb-6 text-center">Common Questions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { q: 'Can I cancel anytime?', a: 'Yes. No contracts, no cancellation fees. Cancel from your profile settings and your access continues until the end of your billing period.' },
              { q: 'What if I start free and want to upgrade?', a: 'You can upgrade anytime from your profile. Your data is always preserved — nothing is lost when you switch plans.' },
              { q: 'Is my financial data secure?', a: "Absolutely. All data is encrypted at rest and in transit. We never sell your data. Bank connections use Plaid's bank-grade security." },
              { q: "Do I need to be tech-savvy?", a: 'Not at all. SmartBooks24 is designed for real people, not accountants. TaxGPT explains everything in plain English.' },
              { q: 'What if I have tax questions?', a: 'TaxGPT is available 24/7 to answer tax questions. Pro and Business plans also include priority human support.' },
              { q: 'Can I use this for business AND personal taxes?', a: 'Yes. The Pro plan handles both. The Business plan supports multiple entities — perfect if you have an LLC plus personal income.' },
            ].map(({ q, a }) => (
              <div key={q}><p className="text-white font-semibold text-sm mb-1">{q}</p><p className="text-slate-400 text-sm leading-relaxed">{a}</p></div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <p className="text-slate-400 text-sm mb-4">Still not sure? Start free — no credit card required.</p>
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 text-base" onClick={() => window.location.href = getLoginUrl()}>
            Get Started Free <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
