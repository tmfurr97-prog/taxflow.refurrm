import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Terms: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>
        
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-sm text-gray-500 mb-8">Last Updated: November 6, 2025</p>

          <div className="space-y-6 text-gray-700 prose max-w-none">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h2>
              <p>By accessing or using <strong>TaxFlow</strong>, a product of <strong>SmartBooks Academy</strong>, you agree to be bound by these Terms of Service. If you do not agree, please discontinue use immediately.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">2. Service Overview</h2>
              <p>TaxFlow is a premium tax automation and bookkeeping platform designed for self-employed individuals, freelancers, and small business owners. The service provides automated receipt scanning, document organization, expense categorization, tax calculation assistance, and report generation to simplify year-round financial management.</p>
              <p className="mt-2">TaxFlow integrates with SmartBooks Academy's educational resources and accounting tools to provide users with a seamless experience in both learning and application.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">3. Account Requirements</h2>
              <p>To use TaxFlow, you must:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Provide accurate and complete registration information.</li>
                <li>Maintain the confidentiality of your login credentials.</li>
                <li>Be at least 18 years old or the legal age of majority in your jurisdiction.</li>
                <li>Use the service only for lawful business and personal accounting purposes.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">4. User Responsibilities</h2>
              <p>You agree to:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Review all tax calculations, reports, and data before filing.</li>
                <li>Consult with a qualified tax professional for complex or specialized tax matters.</li>
                <li>Avoid uploading unlawful, fraudulent, or misleading information.</li>
                <li>Not attempt to access or interfere with the system outside the scope of authorized use.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">5. Paid Access and Subscription Terms</h2>
              <p>TaxFlow does not offer a free version. All users must maintain an active paid subscription to access the service.</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Subscription fees are billed in advance and recur automatically unless canceled.</li>
                <li>Pricing and included features are subject to change with notice.</li>
                <li>Refunds are granted only under exceptional circumstances, reviewed on a case-by-case basis.</li>
                <li>Failure to complete payment may result in suspension or termination of service access.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">6. Beta Program (If Applicable)</h2>
              <p>Certain features may be released under limited beta access for testing and feedback. By participating in any beta, you acknowledge that:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>The feature may be incomplete, contain errors, or change without notice.</li>
                <li>Feedback you provide may be used to improve the platform.</li>
                <li>Beta features are offered "as-is" without warranty.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">7. Disclaimer</h2>
              <p className="font-semibold">TaxFlow is a tax automation and organization tool, not a substitute for licensed tax or accounting advice. While the platform uses AI and automation to assist with accuracy and efficiency, it does not guarantee acceptance of returns, audit outcomes, or complete error-free results. Users are solely responsible for verifying all information before submission to any tax authority.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">8. Limitation of Liability</h2>
              <p>SmartBooks Academy and TaxFlow shall not be liable for any indirect, incidental, punitive, or consequential damages resulting from use or inability to use the service, including but not limited to tax penalties, interest, loss of data, or business interruption.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">9. Referral Program</h2>
              <p>If TaxFlow offers referral rewards, eligibility and terms will be disclosed at the time of participation. Fraudulent or misleading referrals will result in account suspension and forfeiture of rewards.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">10. Termination</h2>
              <p>SmartBooks Academy reserves the right to suspend or terminate any account at any time, with or without cause. Users may cancel their subscriptions through their account settings, effective at the end of the current billing cycle.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">11. Modifications to Terms</h2>
              <p>SmartBooks Academy may revise these Terms of Service at any time. Continued use of TaxFlow following any update constitutes acceptance of the revised terms.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">12. Contact</h2>
              <p>For legal or compliance inquiries, contact:</p>
              <p className="mt-2"><strong>SmartBooks Academy / TaxFlow</strong><br />
              Email: <a href="mailto:support@taxflow.refurrm.com" className="text-teal hover:underline">support@taxflow.refurrm.com</a><br />
              Website: <a href="https://taxflow.refurrm.com" className="text-teal hover:underline" target="_blank" rel="noopener noreferrer">taxflow.refurrm.com</a></p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
