import React from 'react';
import { Award, Users, Target, Sparkles } from 'lucide-react';

const SocialProof: React.FC = () => {
  const highlights = [
    { icon: Award, title: 'Top Rated Platform', org: 'TechReview 2024' },
    { icon: Users, title: 'Trusted by 250K+', org: 'Active Users' },
    { icon: Target, title: 'Industry Leader', org: 'Tax Tech Summit' },
    { icon: Sparkles, title: 'Innovation Award', org: 'FinTech Forward' }
  ];

  const metrics = [
    { value: '250K+', label: 'Happy Customers' },
    { value: '$45M+', label: 'Deductions Found' },
    { value: '4.9/5', label: 'Average Rating' },
    { value: '99.8%', label: 'Filing Success' }
  ];

  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Recognized Excellence in Tax Technology
          </h2>
          <p className="text-lg text-gray-600">Join thousands who have simplified their tax lives</p>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {highlights.map((item, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm text-center border border-gray-100">
              <item.icon className="w-12 h-12 mx-auto mb-3 text-emerald-600" />
              <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
              <p className="text-sm text-gray-600">{item.org}</p>
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {metrics.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl font-bold text-emerald-600 mb-2">{stat.value}</div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SocialProof;
