import React from 'react';
import FeatureCard from './FeatureCard';

interface FeaturesSectionProps {
  onFeatureClick: (feature: string) => void;
}

const FeaturesSection: React.FC<FeaturesSectionProps> = ({ onFeatureClick }) => {
  const features = [
    {
      icon: 'https://d64gsuwffb70l.cloudfront.net/68e7f2c7e795b22e67db6507_1760031501613_189dbb3d.webp',
      title: 'Document Collection',
      description: 'Upload PDFs, JPEGs, or scan Gmail/Outlook for receipts. OCR via Azure Document Intelligence.',
      action: 'upload'
    },
    {
      icon: 'https://d64gsuwffb70l.cloudfront.net/68e7f2c7e795b22e67db6507_1760031502307_12ac1766.webp',
      title: 'Email Integration',
      description: 'Connect Gmail or Outlook to automatically scan and import tax documents with OCR technology.',
      action: 'email-integration'
    },
    {
      icon: 'https://d64gsuwffb70l.cloudfront.net/68e7f2c7e795b22e67db6507_1760031503754_34313055.webp',
      title: 'AI Tax Assistant',
      description: 'Get personalized tax advice, deduction recommendations, and document analysis from our AI assistant.',
      action: 'ai-assistant'
    },
    {
      icon: 'https://d64gsuwffb70l.cloudfront.net/68e7f2c7e795b22e67db6507_1760031503028_e0717cb5.webp',
      title: 'Tax Preview',
      description: 'January 1-15 upload window for W-2s, 1099s, 1098-Ts. Generate Form 1040 preview instantly.',
      action: 'preview'
    },
    {
      icon: 'https://d64gsuwffb70l.cloudfront.net/68e7f2c7e795b22e67db6507_1760031500874_a86bd56b.webp',
      title: 'Year-End Review',
      description: 'Complete checklist to ensure all documents are ready before year-end tax filing deadline.',
      action: 'checklist'
    },
    {
      icon: 'https://d64gsuwffb70l.cloudfront.net/68e7f2c7e795b22e67db6507_1760031502307_12ac1766.webp',
      title: 'Quarterly Tax Payments',
      description: 'Calculate estimated quarterly taxes, track payments, and get automated reminders before deadlines.',
      action: 'quarterly-taxes'
    },
    {
      icon: 'https://d64gsuwffb70l.cloudfront.net/68e7f2c7e795b22e67db6507_1760031501613_189dbb3d.webp',
      title: 'Receipt Scanner',
      description: 'AI-powered OCR extracts vendor, amount, date from receipts. Auto-categorizes for tax deductions.',
      action: 'receipt-scanner'
    },
    {
      icon: 'https://d64gsuwffb70l.cloudfront.net/68e7f2c7e795b22e67db6507_1760031503028_e0717cb5.webp',
      title: 'Tax Form Generator',
      description: 'Auto-generate filled Schedule C, Form 1040-ES from your data. Preview, edit, and download as PDF.',
      action: 'tax-forms'
    },
    {
      icon: 'https://d64gsuwffb70l.cloudfront.net/68e7f2c7e795b22e67db6507_1760031500874_a86bd56b.webp',
      title: 'Business Entity Management',
      description: 'Form LLCs, S-Corps, C-Corps. Track compliance, calculate optimal salary vs distributions.',
      action: 'entity-management'

    },
    {
      icon: 'https://d64gsuwffb70l.cloudfront.net/68e7f2c7e795b22e67db6507_1760031501613_189dbb3d.webp',
      title: 'Audit Defense',
      description: 'Complete audit trail, IRS correspondence tracking, risk scoring, and tax professional collaboration.',
      action: 'audit-defense'
    },
    {
      icon: 'https://d64gsuwffb70l.cloudfront.net/68e7f2c7e795b22e67db6507_1760031502307_12ac1766.webp',
      title: 'Crypto Tax Tracking',
      description: 'Import from Coinbase/Binance/Kraken. Calculate gains with FIFO/LIFO. Generate Form 8949.',
      action: 'crypto-tax'
    },



    {
      icon: 'https://d64gsuwffb70l.cloudfront.net/68e7f2c7e795b22e67db6507_1760031503754_34313055.webp',
      title: 'Mileage Tracking',
      description: 'GPS-based trip recording, IRS-compliant logs, vehicle expenses, and Form 8829 home office deductions.',
      action: 'mileage-tracking'
    },
    {
      icon: 'https://d64gsuwffb70l.cloudfront.net/68e7f2c7e795b22e67db6507_1760031500874_a86bd56b.webp',
      title: 'Secure & Compliant',
      description: 'AES-256 encryption, GDPR/CCPA/AR compliant. Delete your data anytime with one click.',
      action: 'security'
    }

  ];

  return (
    <div id="features" className="bg-gray-50 py-16">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Powerful Features</h2>
          <p className="text-xl text-gray-600">Everything you need to automate your tax preparation</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              onClick={() => onFeatureClick(feature.action)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturesSection;
