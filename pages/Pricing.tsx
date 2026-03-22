import React from 'react';
import { Link } from 'react-router-dom';
import PricingPlans from '@/components/PricingPlans';
import Footer from '@/components/Footer';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Pricing: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
              <ArrowLeft className="h-5 w-5" />
              <span className="font-semibold">Back to Home</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link to="/signup">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main>
        <PricingPlans />
        
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Can I cancel anytime?</h4>
                <p className="text-gray-600">Yes! You can cancel your subscription at any time. Your access will continue until the end of your billing period.</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Is there a free trial?</h4>
                <p className="text-gray-600">Yes, all plans include a 7-day free trial. No credit card required to start.</p>

              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">What's included in the Simple Plan?</h4>
                <p className="text-gray-600">Everything you need: automated receipt tracking, quarterly tax estimates, secure document storage, unlimited income categories, year-end tax summary, and priority support. Perfect for freelancers and creators!</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">What payment methods do you accept?</h4>
                <p className="text-gray-600">We accept all major credit cards (Visa, Mastercard, American Express, Discover) through our secure Stripe payment processor.</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Can I switch between weekly, monthly, and annual plans?</h4>
                <p className="text-gray-600">Yes! You can switch between our weekly ($6.99), monthly ($24.99), or annual ($249) plans anytime. Changes are prorated automatically.</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Is my data secure?</h4>
                <p className="text-gray-600">Absolutely. We use bank-level encryption and security measures to protect your financial data. We're SOC 2 compliant and never sell your data.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Pricing;
