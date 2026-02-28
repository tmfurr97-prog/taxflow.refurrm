import React from 'react';
import { Link } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Lock, Zap, ArrowRight } from 'lucide-react';
import { hasFeature, getMinTierForFeature, TIER_DISPLAY_NAMES } from '../../../shared/featureGating';
import type { FeatureKey } from '../../../shared/featureGating';
import type { PlanTier } from '../../../shared/stripeProducts';
import { cn } from '@/lib/utils';

interface FeatureGateProps {
  feature: FeatureKey;
  children: React.ReactNode;
  /** Optional: override the upgrade message */
  upgradeMessage?: string;
  /** If true, renders a full-page gate; otherwise renders an inline banner */
  fullPage?: boolean;
  /** Optional className for the gate wrapper */
  className?: string;
}

function UpgradeBanner({
  requiredTier,
  upgradeMessage,
  fullPage,
  className,
}: {
  requiredTier: PlanTier;
  upgradeMessage?: string;
  fullPage?: boolean;
  className?: string;
}) {
  const tierName = TIER_DISPLAY_NAMES[requiredTier];
  const message = upgradeMessage ?? `This feature requires the ${tierName} plan or higher.`;

  if (fullPage) {
    return (
      <div className={cn('min-h-[60vh] flex items-center justify-center p-8', className)}>
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8 text-amber-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {tierName} Plan Required
            </h2>
            <p className="text-gray-500">{message}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/pricing">
              <Button className="bg-emerald-500 hover:bg-emerald-600 text-white gap-2 w-full sm:w-auto">
                <Zap className="w-4 h-4" />
                Upgrade to {tierName}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" className="border-gray-200 text-gray-600 hover:bg-gray-100 bg-transparent w-full sm:w-auto">
                Back to Dashboard
              </Button>
            </Link>
          </div>
          <p className="text-gray-600 text-xs">
            No contracts. Cancel anytime. Your data is always preserved.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg', className)}>
      <Lock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-amber-300 text-sm font-medium">{tierName} Plan Required</p>
        <p className="text-amber-400/70 text-xs mt-0.5">{message}</p>
      </div>
      <Link href="/pricing">
        <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white gap-1.5 shrink-0">
          <Zap className="w-3 h-3" /> Upgrade
        </Button>
      </Link>
    </div>
  );
}

/**
 * FeatureGate wraps content that requires a specific subscription tier.
 * If the user doesn't have the required tier, shows an upgrade prompt instead.
 */
export function FeatureGate({
  feature,
  children,
  upgradeMessage,
  fullPage = false,
  className,
}: FeatureGateProps) {
  const { data: user } = trpc.auth.me.useQuery();
  const userTier = (user?.subscriptionTier ?? 'free') as PlanTier;
  const requiredTier = getMinTierForFeature(feature);

  if (hasFeature(userTier, feature)) {
    return <>{children}</>;
  }

  return (
    <UpgradeBanner
      requiredTier={requiredTier}
      upgradeMessage={upgradeMessage}
      fullPage={fullPage}
      className={className}
    />
  );
}

/**
 * Hook version for conditional rendering logic.
 */
export function useFeatureAccess(feature: FeatureKey) {
  const { data: user } = trpc.auth.me.useQuery();
  const userTier = (user?.subscriptionTier ?? 'free') as PlanTier;
  return {
    hasAccess: hasFeature(userTier, feature),
    requiredTier: getMinTierForFeature(feature),
    userTier,
  };
}
