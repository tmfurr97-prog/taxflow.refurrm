import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onComplete }) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [gmailConsent, setGmailConsent] = useState(false);
  const [outlookConsent, setOutlookConsent] = useState(false);
  const [plaidConsent, setPlaidConsent] = useState(false);

  if (!isOpen) return null;

  const handleNext = async () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      // Save onboarding completion to database
      if (user) {
        try {
          await supabase
            .from('profiles')
            .update({ 
              onboarding_completed: true,
              onboarding_completed_at: new Date().toISOString()
            })
            .eq('id', user.id);
        } catch (error) {
          console.error('Error saving onboarding completion:', error);
        }
      }
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Welcome to SmartBooks24</h2>
            <span className="text-sm text-gray-500">Step {step} of 4</span>
          </div>

          {step === 1 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Terms of Service</h3>
              <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto text-sm text-gray-700">
                <p className="mb-4">By using SmartBooks24, you agree to:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Keep your login credentials secure and confidential</li>
                  <li>No sharing account credentials (violation: $50 fine, termination)</li>
                  <li>Verification optional; late uploads accepted if subscribed</li>
                  <li>SmartBooks24 is software assistance only, not tax advice</li>
                  <li>Users are responsible for accuracy and filing</li>

                </ul>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} className="w-5 h-5" />
                <span className="text-sm">I accept the terms and conditions</span>
              </label>
            </div>
          )}

          {step === 2 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Data Access Consent</h3>
              <p className="text-sm text-gray-600 mb-4">Grant permissions for automated document collection:</p>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
                  <input type="checkbox" checked={gmailConsent} onChange={(e) => setGmailConsent(e.target.checked)} className="w-5 h-5" />
                  <span className="text-sm font-medium">Scan Gmail for receipts (OCR)</span>
                </label>
                <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
                  <input type="checkbox" checked={outlookConsent} onChange={(e) => setOutlookConsent(e.target.checked)} className="w-5 h-5" />
                  <span className="text-sm font-medium">Scan Outlook for receipts (OCR)</span>
                </label>
                <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
                  <input type="checkbox" checked={plaidConsent} onChange={(e) => setPlaidConsent(e.target.checked)} className="w-5 h-5" />
                  <span className="text-sm font-medium">Connect bank accounts via Plaid API</span>
                </label>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Privacy & Compliance</h3>
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <p className="text-sm mb-3"><strong>Your data is protected:</strong></p>
                <ul className="space-y-2 text-sm">
                  <li>✓ AES-256 encryption for all documents</li>
                  <li>✓ GDPR, CCPA, and AR compliant</li>
                  <li>✓ Data deletion available anytime</li>
                  <li>✓ No data sharing with third parties</li>
                </ul>
              </div>
              <button className="w-full py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                Delete My Account & Data
              </button>
            </div>
          )}

          {step === 4 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Choose Your Plan</h3>
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white p-6 rounded-xl mb-4">
                <div className="text-sm text-blue-100 mb-2">BEST VALUE</div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl font-bold">$249</span>
                  <span className="text-lg">/year</span>
                </div>
                <p className="text-blue-100 mb-4">Simple Plan for freelancers & creators</p>
                <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm inline-block mb-4">
                  7-Day Free Trial

                </div>
                <ul className="space-y-2 text-sm">
                  <li>✓ Automated receipt and expense tracking</li>
                  <li>✓ Quarterly tax payment estimator</li>
                  <li>✓ Secure document storage</li>
                  <li>✓ Unlimited income categories</li>
                  <li>✓ Year-end tax summary for filing</li>
                  <li>✓ Priority support and updates</li>
                </ul>
              </div>
              <p className="text-sm text-gray-600 text-center">Also available: $24.99/month or $6.99/week</p>
            </div>
          )}

          <div className="flex gap-3 mt-6">
            {step > 1 && (
              <button onClick={() => setStep(step - 1)} className="px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50">
                Back
              </button>
            )}
            <button 
              onClick={handleNext} 
              disabled={step === 1 && !termsAccepted}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {step === 4 ? 'Start Free Trial' : 'Continue'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingModal;
