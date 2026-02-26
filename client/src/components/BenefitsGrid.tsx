import React from 'react';
import { Zap, TrendingDown, Shield, Clock, Bot, Headphones, FileText, Award } from 'lucide-react';

const BenefitsGrid: React.FC = () => {
  const benefits = [
    {
      icon: Bot,
      title: 'Smart Automation',
      description: 'Intelligent categorization and tracking',
      color: 'emerald'
    },
    {
      icon: TrendingDown,
      title: 'Lower Your Bill',
      description: 'Discover overlooked deductions',
      color: 'teal'
    },
    {
      icon: Clock,
      title: 'Save Time',
      description: 'Hours of work done in minutes',
      color: 'cyan'
    },
    {
      icon: Shield,
      title: 'Audit Protection',
      description: 'Comprehensive coverage included',
      color: 'blue'
    },
    {
      icon: Zap,
      title: 'Real-Time Updates',
      description: 'Live tax estimates as you go',
      color: 'violet'
    },
    {
      icon: Headphones,
      title: 'Expert Support',
      description: 'Tax professionals on standby',
      color: 'purple'
    },
    {
      icon: FileText,
      title: 'All Tax Forms',
      description: 'Complete form library supported',
      color: 'pink'
    },
    {
      icon: Award,
      title: 'Guaranteed Accurate',
      description: 'Maximum refund promise',
      color: 'rose'
    }
  ];

  return (
    <div className="py-20 bg-gradient-to-br from-emerald-50 to-teal-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Everything You Need in One Place Simple tools that keep freelancers, families, and small businesses financially grounded year-round.
          </h2>
          <p className="text-xl text-gray-600">
            Built for freelancers, contractors, and small business owners who’d rather focus on their work than their paperwork.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
              <benefit.icon className={`w-12 h-12 mb-4 text-${benefit.color}-600`} />
              <h3 className="text-xl font-bold text-gray-900 mb-2">{benefit.title}</h3>
              <p className="text-gray-600">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BenefitsGrid;
