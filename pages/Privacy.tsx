import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Privacy: React.FC = () => {
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-sm text-gray-500 mb-8">Last Updated: November 6, 2025</p>

          <div className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">1. Introduction</h2>
              <p>This Privacy Policy explains how <strong>SmartBooks Academy</strong> ("we," "us," or "our") collects, uses, and protects personal information when you use <strong>TaxFlow</strong>, our premium tax automation and bookkeeping platform. By using TaxFlow, you agree to this Privacy Policy and our Terms of Service.</p>
              <p className="mt-2">Our goal is to give you full control over your data while maintaining the highest standards of security and compliance.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">2. Information We Collect</h2>
              
              <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">A. Information You Provide</h3>
              <p>When creating or using a TaxFlow account, you may provide:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Personal identifiers (such as your name, email address, and phone number)</li>
                <li>Payment and billing details</li>
                <li>Uploaded receipts, invoices, or financial documents</li>
                <li>Information shared during customer support interactions</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">B. Information Collected Automatically</h3>
              <p>When you use TaxFlow, we automatically collect:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Log data (browser type, IP address, device information, access times)</li>
                <li>Usage data to help improve system performance and user experience</li>
                <li>Cookies and analytics data to remember preferences and measure functionality</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">C. Financial Data via Integrations</h3>
              <p>If you connect your bank accounts or financial platforms (such as QuickBooks Online), TaxFlow uses secure third-party integrations, including Plaid, to retrieve relevant transaction data.</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>We never store your bank credentials.</li>
                <li>Financial data retrieved through Plaid is encrypted in transit and at rest.</li>
                <li>You can revoke access to these integrations at any time through your account settings.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">3. How We Use Your Information</h2>
              <p>We use collected data to:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Provide, personalize, and improve the TaxFlow experience</li>
                <li>Automate receipt organization and tax categorization</li>
                <li>Generate reports and insights for bookkeeping and tax preparation</li>
                <li>Process payments and manage subscriptions</li>
                <li>Communicate important updates, invoices, and support messages</li>
                <li>Maintain compliance with financial regulations and partner requirements</li>
              </ul>
              <p className="mt-2 font-semibold">We do not sell or rent your personal information to any third party.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">4. Data Storage and Security</h2>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>TaxFlow operates on secure cloud infrastructure with end-to-end encryption.</li>
                <li>All data is encrypted both in transit and at rest.</li>
                <li>Access is restricted through multi-factor authentication and secure login procedures.</li>
                <li>Regular audits and vulnerability scans are performed to maintain compliance.</li>
                <li>In the event of a data breach, affected users will be notified promptly in accordance with applicable laws.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">5. Data Retention</h2>
              <p>We retain user data only as long as necessary to:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Provide ongoing services</li>
                <li>Comply with legal and tax recordkeeping requirements</li>
                <li>Resolve disputes and enforce agreements</li>
              </ul>
              <p className="mt-2">When your account is canceled or terminated, uploaded documents and account data are deleted within a commercially reasonable timeframe, except where retention is required by law.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">6. Third-Party Services</h2>
              <p>TaxFlow integrates with trusted third-party providers for:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li><strong>Plaid:</strong> secure financial data aggregation</li>
                <li><strong>Stripe:</strong> payment processing</li>
                <li><strong>Google Workspace:</strong> email and document syncing</li>
                <li><strong>QuickBooks Online:</strong> optional bookkeeping synchronization</li>
              </ul>
              <p className="mt-2">Each third party operates under its own privacy policy. We encourage users to review those policies directly.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">7. User Control and Choices</h2>
              <p>You can:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Access, download, or delete your data at any time by contacting support.</li>
                <li>Disconnect integrations such as Plaid or Google through your account settings.</li>
                <li>Manage communication preferences or unsubscribe from non-essential emails.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">8. Compliance and Legal Obligations</h2>
              <p>TaxFlow complies with applicable privacy and data protection laws, including:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>U.S. Federal and State privacy regulations</li>
                <li>IRS Publication 1075 data protection standards</li>
                <li>Financial Data Access requirements under Plaid's permissible-purpose policy</li>
              </ul>
              <p className="mt-2">We may disclose limited information if required by law, subpoena, or lawful request from authorities.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">9. Children's Privacy</h2>
              <p>TaxFlow is intended for adults and business users only. We do not knowingly collect information from individuals under 18. If we learn that data was submitted by a minor, it will be promptly deleted.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">10. Changes to This Policy</h2>
              <p>We may update this Privacy Policy periodically. Any updates will be reflected by the "Last Updated" date above. Continued use of TaxFlow after changes indicates your acceptance of the revised policy.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">11. Contact Information</h2>
              <p>For questions, access requests, or privacy-related concerns, please contact:</p>
              <p className="mt-2">
                <strong>SmartBooks Academy / TaxFlow</strong><br />
                Email: <a href="mailto:support@taxflow.refurrm.com" className="text-[#50E3E3] hover:underline">support@taxflow.refurrm.com</a><br />
                Website: <a href="https://taxflow.refurrm.com" target="_blank" rel="noopener noreferrer" className="text-[#50E3E3] hover:underline">taxflow.refurrm.com</a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
