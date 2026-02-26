/**
 * Feature gating for SmartBooks24 subscription tiers.
 * Each feature maps to the minimum tier required to access it.
 */
import type { PlanTier } from './stripeProducts';

export type FeatureKey =
  | 'taxgpt_basic'        // Essential+
  | 'taxgpt_full'         // Pro+
  | 'receipts_unlimited'  // Essential+
  | 'receipts_limited'    // Free (10/mo)
  | 'quarterly_full'      // Essential+
  | 'quarterly_basic'     // Free (1 estimate)
  | 'crypto'              // Pro+
  | 'audit_defense'       // Pro+
  | 'business_entities'   // Pro+
  | 'academy_full'        // Pro+
  | 'academy_basics'      // Essential+
  | 'efile'               // Pro+
  | 'remote_returns'      // Always (paid separately via à la carte)
  | 'notary'              // Always (paid separately)
  | 'backups'             // Essential+
  | 'document_vault'      // Essential+;

const TIER_RANK: Record<PlanTier, number> = {
  free: 0,
  essential: 1,
  pro: 2,
  business: 3,
};

const FEATURE_MIN_TIER: Record<FeatureKey, PlanTier> = {
  taxgpt_basic:        'essential',
  taxgpt_full:         'pro',
  receipts_limited:    'free',
  receipts_unlimited:  'essential',
  quarterly_basic:     'free',
  quarterly_full:      'essential',
  crypto:              'pro',
  audit_defense:       'pro',
  business_entities:   'pro',
  academy_basics:      'essential',
  academy_full:        'pro',
  efile:               'pro',
  remote_returns:      'free',   // gated by à la carte payment, not tier
  notary:              'free',   // gated by à la carte payment, not tier
  backups:             'essential',
  document_vault:      'essential',
};

/**
 * Check if a user's tier grants access to a feature.
 * 'beta_pro' is treated as Pro for all platform features.
 * Remote Returns and à la carte services are always paid separately.
 */
export function hasFeature(userTier: PlanTier | string | null | undefined, feature: FeatureKey): boolean {
  // beta_pro maps to Pro for all platform features
  const normalizedTier: PlanTier = userTier === 'beta_pro' ? 'pro' : ((userTier as PlanTier) ?? 'free');
  const required = FEATURE_MIN_TIER[feature];
  return TIER_RANK[normalizedTier] >= TIER_RANK[required];
}

export function getMinTierForFeature(feature: FeatureKey): PlanTier {
  return FEATURE_MIN_TIER[feature];
}

export const TIER_DISPLAY_NAMES: Record<PlanTier | 'beta_pro', string> = {
  free: 'Free',
  essential: 'Essential',
  pro: 'Pro',
  business: 'Business',
  beta_pro: 'Beta Pro',
};
