import SubscriptionManagement from '@/components/SubscriptionManagement';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Award } from 'lucide-react';
import { trpc } from '@/lib/trpc';

export default function Subscriptions() {
  const { data: subscription } = trpc.billing.getSubscription.useQuery();
  const { data: profile } = trpc.profile.get.useQuery();

  const tier = subscription?.subscriptionTier ?? 'free';
  const tierLabel = tier === 'free' ? 'Free' : tier === 'essential' ? 'Essential' : tier === 'pro' ? 'Pro' : tier === 'business' ? 'Business' : tier === 'beta_pro' ? 'Beta Pro' : 'Free';
  const memberSince = profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Subscription & Billing</h1>
          <p className="text-gray-600">Manage your subscription, billing history, and payment methods</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-blue-600" />
                Current Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tierLabel}</div>
              <p className="text-xs text-muted-foreground capitalize">{subscription?.subscriptionStatus ?? 'inactive'}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Award className="h-4 w-4 text-orange-600" />
                Member Since
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{memberSince}</div>
              <p className="text-xs text-muted-foreground">Account created</p>
            </CardContent>
          </Card>
        </div>

        <SubscriptionManagement />
      </div>
    </div>
  );
}
