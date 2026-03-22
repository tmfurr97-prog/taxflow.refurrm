import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Mail, Brain, FileText, BarChart3, Shield, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Footer from '@/components/Footer';

const Features: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-charcoal mb-4">TaxFlow Features</h1>
          <p className="text-xl text-gray-600">Your Year-Round Tax Companion</p>
          <p className="mt-4 text-lg text-gray-700 max-w-3xl mx-auto">
            TaxFlow, built by SmartBooks Academy, turns financial overwhelm into effortless organization. 
            Designed for freelancers, entrepreneurs, and small business owners.
          </p>
        </div>

        <div className="space-y-16">
          <section>
            <h2 className="text-3xl font-bold text-charcoal mb-8">Smart Document Automation</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-6 bg-gray-50 rounded-lg">
                <Mail className="w-12 h-12 text-teal mb-4" />
                <h3 className="text-xl font-semibold mb-3">Email & Cloud Sync</h3>
                <p className="text-gray-600">
                  TaxFlow automatically scans your email for receipts, bills, and statements. 
                  Google Drive integration keeps documents safely stored.
                </p>
              </div>
              <div className="p-6 bg-gray-50 rounded-lg">
                <Brain className="w-12 h-12 text-teal mb-4" />
                <h3 className="text-xl font-semibold mb-3">AI Receipt Reader</h3>
                <p className="text-gray-600">
                  Upload receipts and TaxFlow instantly extracts details. AI assigns each transaction 
                  to the correct tax category using IRS Schedule C standards.
                </p>
              </div>
              <div className="p-6 bg-gray-50 rounded-lg">
                <FileText className="w-12 h-12 text-teal mb-4" />
                <h3 className="text-xl font-semibold mb-3">Smart Naming & Sorting</h3>
                <p className="text-gray-600">
                  Every document is labeled and filed automatically for instant access when 
                  it's time to reconcile or report.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-charcoal mb-8">Intelligent Dashboard</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="p-6 border-2 border-teal rounded-lg">
                <BarChart3 className="w-12 h-12 text-teal mb-4" />
                <h3 className="text-xl font-semibold mb-3">Tax Overview at a Glance</h3>
                <p className="text-gray-600">See income, expenses, and estimated tax totals in one clear view.</p>
              </div>
              <div className="p-6 border-2 border-teal rounded-lg">
                <CheckCircle2 className="w-12 h-12 text-teal mb-4" />
                <h3 className="text-xl font-semibold mb-3">Tax Health Score</h3>
                <p className="text-gray-600">Built-in progress indicator shows how tax-ready you are.</p>
              </div>
            </div>
          </section>

          <section className="bg-charcoal text-white p-12 rounded-lg">
            <h2 className="text-3xl font-bold mb-6">Security You Can Trust</h2>
            <p className="text-lg mb-6">Your data deserves protection. TaxFlow uses enterprise-grade encryption.</p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Shield className="w-6 h-6 text-teal flex-shrink-0 mt-1" />
                <span>IRS Publication 1075 standards for data protection</span>
              </li>
              <li className="flex items-start gap-3">
                <Shield className="w-6 h-6 text-teal flex-shrink-0 mt-1" />
                <span>Plaid's permissible-purpose financial access requirements</span>
              </li>
              <li className="flex items-start gap-3">
                <Shield className="w-6 h-6 text-teal flex-shrink-0 mt-1" />
                <span>SOC 2 and GDPR alignment for cloud security</span>
              </li>
            </ul>
          </section>

          <section className="text-center">
            <DollarSign className="w-16 h-16 text-teal mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-charcoal mb-4">Premium Subscription</h2>
            <p className="text-lg text-gray-700 mb-8">One simple plan gives you everything</p>
            <div className="flex justify-center gap-8 mb-8">
              <div className="p-6 border-2 border-teal rounded-lg">
                <p className="text-2xl font-bold text-charcoal">$24.99/month</p>
                <p className="text-gray-600">Monthly Plan</p>
              </div>
              <div className="p-6 border-2 border-teal rounded-lg bg-teal text-white">
                <p className="text-2xl font-bold">$249/year</p>
                <p>Annual Plan</p>
              </div>
            </div>
            <Link to="/pricing">
              <Button size="lg" className="bg-teal hover:bg-teal-dark text-white">
                View Pricing Details
              </Button>
            </Link>
          </section>

          <section className="text-center py-12 bg-gradient-to-r from-teal to-blue-500 text-white rounded-lg">
            <h2 className="text-4xl font-bold mb-4">Automate. Simplify. File with Confidence.</h2>
            <Link to="/signup">
              <Button size="lg" className="bg-white text-teal hover:bg-gray-100 mt-6">
                Get Started Today
              </Button>
            </Link>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Features;
