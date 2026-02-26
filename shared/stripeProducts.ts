/**
 * Stripe Products & Prices for SmartBooks24 by ReFurrm
 * All price IDs are live Stripe price IDs.
 */

export type PlanTier = 'free' | 'essential' | 'pro' | 'business';

export interface StripePlan {
  tier: PlanTier;
  name: string;
  description: string;
  monthlyPriceId: string | null;
  annualPriceId: string | null;
  monthlyAmount: number; // in cents
  annualAmount: number;  // in cents
  features: string[];
  highlight?: boolean;
}

export const STRIPE_PLANS: StripePlan[] = [
  {
    tier: 'free',
    name: 'Free',
    description: 'Get started — no credit card required',
    monthlyPriceId: null,
    annualPriceId: null,
    monthlyAmount: 0,
    annualAmount: 0,
    features: [
      'Receipt scanning (10/month)',
      'Mileage tracking',
      'Basic dashboard',
      '1 quarterly tax estimate',
      'Academy intro lessons',
    ],
  },
  {
    tier: 'essential',
    name: 'Essential',
    description: 'Everything you need to stay organized',
    monthlyPriceId: 'price_1T57Mb2a3IaVlQ9NdmGgig3A',
    annualPriceId: 'price_1T57N02a3IaVlQ9N81W4Xojb',
    monthlyAmount: 999,
    annualAmount: 9900,
    features: [
      'Unlimited receipt scanning',
      'All expense tracking',
      'TaxGPT AI (limited)',
      'Quarterly tax payments',
      'Academy basics',
      'Document vault',
    ],
  },
  {
    tier: 'pro',
    name: 'Pro',
    description: 'Full power for serious filers',
    monthlyPriceId: 'price_1T57N02a3IaVlQ9NQce8qo5A',
    annualPriceId: 'price_1T57N02a3IaVlQ9NH9BhFZW5',
    monthlyAmount: 2499,
    annualAmount: 19900,
    highlight: true,
    features: [
      'Everything in Essential',
      'Full TaxGPT AI assistant',
      'Crypto tax tracking',
      'Audit defense hub',
      'Business entity management',
      'All Academy lessons',
      'E-file preparation',
    ],
  },
  {
    tier: 'business',
    name: 'Business',
    description: 'For small businesses & multi-entity filers',
    monthlyPriceId: 'price_1T57N02a3IaVlQ9NdQ46UXy1',
    annualPriceId: 'price_1T57N02a3IaVlQ9NIdzp6FLC',
    monthlyAmount: 3999,
    annualAmount: 34900,
    features: [
      'Everything in Pro',
      'Multi-entity management',
      'Bookkeeping reports (P&L)',
      'Priority support',
      'Team/accountant access (coming soon)',
      'Bulk e-filing',
    ],
  },
];

// À la carte one-time payment amounts (in cents)
export const ALACARTE_ITEMS = {
  remoteReturn: { name: 'Remote Return (Human-Filed)', amount: 19900 },
  stateReturn: { name: 'State Return Add-On', amount: 4900 },
  notarySession: { name: 'Notary Session', amount: 5000 },
  auditDefense: { name: 'Audit Defense Package (1 year)', amount: 9900 },
  bookkeepingCleanup: { name: 'Bookkeeping Cleanup (one-time)', amount: 14900 },
  priorYearReturn: { name: 'Prior Year Return', amount: 19900 },
} as const;

export type AlacarteKey = keyof typeof ALACARTE_ITEMS;
