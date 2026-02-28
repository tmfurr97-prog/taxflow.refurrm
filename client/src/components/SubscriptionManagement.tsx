import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createCheckoutSession, manageSubscription, getSubscriptionDetails, getInvoices, STRIPE_PRICE_IDS } from '@/lib/stripe';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CreditCard, FileText, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Invoice {
  id: string;
  amount_paid: number;
  currency: string;
  status: string;
  invoice_pdf: string | null;
  hosted_invoice_url: string | null;
  created_at: string;
}

const SubscriptionManagement: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    if (user) {
      loadSubscriptionData();
    }
  }, [user]);

  const loadSubscriptionData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [subData, invoiceData] = await Promise.all([
        getSubscriptionDetails(user!.id),
        getInvoices(user!.id)
      ]);
      setSubscription(subData);
      setInvoices((invoiceData as unknown as any[]) || []);
    } catch (err: any) {
      console.error('Error loading subscription data:', err);
      setError(err.message || 'Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  };


  const handleSubscribe = async (priceId: string) => {
    try {
      setLoading(true);
      setError(null);
      const { url } = await createCheckoutSession(priceId, user!.id);
      window.location.href = url ?? "";
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      setLoading(true);
      setError(null);
      await manageSubscription('cancel', user!.id);
      await loadSubscriptionData();
      setShowCancelModal(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReactivate = async () => {
    try {
      setLoading(true);
      setError(null);
      await manageSubscription('reactivate', '');
      await loadSubscriptionData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !subscription) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const hasActiveSubscription = subscription && (subscription.subscription_status === 'active' || subscription.subscription_status === 'trialing');


  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Subscription Management</h2>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {hasActiveSubscription ? (
        <>
          <Card className="bg-gradient-to-br from-blue-600 to-blue-800 text-gray-900 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold capitalize">{subscription.subscription_plan} Plan</h3>
                <Badge variant="secondary" className="mt-2">
                  {subscription.subscription_status}
                </Badge>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold">
                  {subscription.subscription_plan === 'weekly' ? '$6.99' : 
                   subscription.subscription_plan === 'monthly' ? '$24.99' : '$249'}
                </p>
                <p className="text-blue-100 text-sm">
                  /{subscription.subscription_plan === 'weekly' ? 'week' : 
                    subscription.subscription_plan === 'monthly' ? 'month' : 'year'}
                </p>
              </div>
            </div>
            {subscription.subscription_current_period_end && (
              <div className="bg-white bg-opacity-20 p-4 rounded-lg">
                <p className="text-sm mb-1">
                  {subscription.subscription_cancel_at_period_end ? 'Access until' : 'Next billing date'}
                </p>
                <p className="font-semibold">
                  {new Date(subscription.subscription_current_period_end).toLocaleDateString()}
                </p>
              </div>
            )}
          </Card>

          <div className="space-y-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-gray-600" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Billing History</h4>
                    <p className="text-sm text-gray-600">{invoices.length} invoice(s)</p>
                  </div>
                </div>
              </div>
              {invoices.length > 0 && (
                <div className="mt-4 space-y-2">
                  {invoices.slice(0).map((invoice) => (
                    <div key={invoice.id} className="flex justify-between items-center text-sm border-t pt-2">
                      <span>{new Date(invoice.created_at).toLocaleDateString()}</span>
                      <span className="font-semibold">${(invoice.amount_paid / 100).toFixed(2)}</span>
                      {invoice.invoice_pdf && (
                        <a href={invoice.invoice_pdf} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          Download
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-gray-600" />
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {subscription.subscription_cancel_at_period_end ? 'Reactivate Subscription' : 'Cancel Subscription'}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {subscription.subscription_cancel_at_period_end 
                        ? 'Resume your subscription' 
                        : 'Access until end of billing period'}
                    </p>
                  </div>
                </div>
                {subscription.subscription_cancel_at_period_end ? (
                  <Button onClick={handleReactivate} disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Reactivate'}
                  </Button>
                ) : (
                  <Button variant="destructive" onClick={() => setShowCancelModal(true)} disabled={loading}>
                    Cancel
                  </Button>
                )}
              </div>
            </Card>
          </div>
        </>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6">
            <Badge className="mb-2 bg-purple-100 text-purple-800">Pay-As-You-Go</Badge>
            <h3 className="text-xl font-bold mb-2">Weekly Plan</h3>
            <p className="text-3xl font-bold mb-4">$6.99<span className="text-lg text-gray-600">/wk</span></p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center gap-2">✓ Perfect for trying us out</li>
              <li className="flex items-center gap-2">✓ All core features</li>
              <li className="flex items-center gap-2">✓ Cancel anytime</li>
            </ul>
            <Button onClick={() => handleSubscribe(STRIPE_PRICE_IDS.weekly)} disabled={loading} className="w-full">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Start Weekly'}
            </Button>
          </Card>

          <Card className="p-6 border-2 border-blue-600">
            <Badge className="mb-2">BEST VALUE</Badge>
            <h3 className="text-xl font-bold mb-2">Simple Plan</h3>
            <p className="text-3xl font-bold mb-4">$249<span className="text-lg text-gray-600">/yr</span></p>
            <p className="text-sm text-green-600 mb-4">Save $50+ vs monthly!</p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center gap-2">✓ Everything included</li>
              <li className="flex items-center gap-2">✓ Priority support</li>
              <li className="flex items-center gap-2">✓ Advanced reports</li>
              <li className="flex items-center gap-2">✓ Tax strategy insights</li>
            </ul>
            <Button onClick={() => handleSubscribe(STRIPE_PRICE_IDS.annual)} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Get Started'}
            </Button>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-bold mb-2">Monthly Plan</h3>
            <p className="text-3xl font-bold mb-4">$24.99<span className="text-lg text-gray-600">/mo</span></p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center gap-2">✓ No commitment</li>
              <li className="flex items-center gap-2">✓ All features included</li>
              <li className="flex items-center gap-2">✓ Receipt OCR scanning</li>
              <li className="flex items-center gap-2">✓ Quarterly reminders</li>
            </ul>
            <Button onClick={() => handleSubscribe(STRIPE_PRICE_IDS.monthly)} disabled={loading} className="w-full">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Start Monthly'}
            </Button>
          </Card>
        </div>
      )}

      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6 max-w-md">
            <h3 className="text-xl font-bold mb-4">Cancel Subscription?</h3>
            <p className="text-gray-600 mb-6">
              Your subscription will remain active until the end of your billing period. You can reactivate anytime before then.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowCancelModal(false)} className="flex-1">
                Keep Subscription
              </Button>
              <Button variant="destructive" onClick={handleCancelSubscription} disabled={loading} className="flex-1">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm Cancel'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SubscriptionManagement;
