import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createCheckoutSession, STRIPE_PRICE_IDS } from '@/lib/stripe';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Loader2, Sparkles } from 'lucide-react';

const PricingPlans: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handleSubscribe = async (priceId: string, planName: string) => {
    if (!user) {
      window.location.href = '/login?redirect=/profile';
      return;
    }

    try {
      setLoading(true);
      setSelectedPlan(planName);
      const { url } = await createCheckoutSession(priceId, user.id);
      window.location.href = url as string;
    } catch (error) {
      console.error('Checkout error:', error);
      setLoading(false);
      setSelectedPlan(null);
    }
  };

  const features = [
    'Automated receipt and expense tracking',
    'Quarterly tax payment estimator',
    'Secure document storage',
    'Unlimited income categories',
    'Year-end tax summary for filing',
    'Priority support and updates',
    'AI-powered tax assistant',
    'Mileage tracking & home office deductions',
    'Bank account integration via Plaid',
    'Email receipt scanning',
    'Quarterly tax reminders',
    'Document organization'
  ];

  return (
    <div className="py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
          <p className="text-xl text-gray-600 mb-2">Designed for freelancers, creators, and small business owners</p>
          <p className="text-lg text-blue-600 font-semibold">Get your taxes done smarter, faster, and for less than one trip to H&R Block.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Weekly Plan */}
          <Card className="p-6 hover:shadow-xl transition-shadow">
            <Badge className="mb-4 bg-purple-100 text-purple-800">Pay-As-You-Go</Badge>
            <h3 className="text-xl font-bold mb-2">Weekly</h3>
            <div className="mb-6">
              <span className="text-4xl font-bold">$6.99</span>
              <span className="text-gray-600">/week</span>
              <p className="text-sm text-gray-500 mt-1">Perfect for trying us out</p>
            </div>
            <ul className="space-y-2 mb-6 text-sm">
              {features.slice(0, 6).map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
            <Button 
              onClick={() => handleSubscribe(STRIPE_PRICE_IDS.weekly, 'weekly')}
              disabled={loading}
              className="w-full"
              variant="outline"
            >
              {loading && selectedPlan === 'weekly' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Start Weekly'
              )}
            </Button>
          </Card>

          {/* Annual Plan - Featured */}
          <Card className="p-6 border-2 border-blue-600 relative hover:shadow-xl transition-shadow transform md:scale-105">
            <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600">
              <Sparkles className="h-3 w-3 mr-1" />
              BEST VALUE
            </Badge>
            <h3 className="text-xl font-bold mb-2">Simple Plan</h3>
            <div className="mb-6">
              <span className="text-4xl font-bold">$249</span>
              <span className="text-gray-600">/year</span>
              <p className="text-green-600 font-semibold mt-1">Save $50+ vs monthly</p>
            </div>
            <ul className="space-y-2 mb-6 text-sm">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
            <Button 
              onClick={() => handleSubscribe(STRIPE_PRICE_IDS.annual, 'annual')}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {loading && selectedPlan === 'annual' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Get Started'
              )}
            </Button>
          </Card>

          {/* Monthly Plan */}
          <Card className="p-6 hover:shadow-xl transition-shadow">
            <h3 className="text-xl font-bold mb-2">Monthly</h3>
            <div className="mb-6">
              <span className="text-4xl font-bold">$24.99</span>
              <span className="text-gray-600">/month</span>
              <p className="text-sm text-gray-500 mt-1">No long-term commitment</p>
            </div>
            <ul className="space-y-2 mb-6 text-sm">
              {features.slice(0, 8).map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
            <Button 
              onClick={() => handleSubscribe(STRIPE_PRICE_IDS.monthly, 'monthly')}
              disabled={loading}
              className="w-full"
            >
              {loading && selectedPlan === 'monthly' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Start Monthly'
              )}
            </Button>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600">
            All plans include a 7-day free trial. No credit card required to start.

          </p>
          <p className="text-sm text-gray-500 mt-2">
            Cancel anytime. Your data is always yours.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PricingPlans;