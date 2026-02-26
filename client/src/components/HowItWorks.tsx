import React from 'react';
import { Link2, FolderUp, Calculator, Rocket } from 'lucide-react';

const HowItWorks: React.FC = () => {
  const steps = [
    {
      icon: Link2,
      title: 'Connect Your Accounts',
      description: 'Link bank accounts and credit cards to automatically import and categorize transactions throughout the year.',
      image: 'https://d64gsuwffb70l.cloudfront.net/68e7f2c7e795b22e67db6507_1762184884702_66ae5fdc.webp'
    },
    {
      icon: FolderUp,
      title: 'Organize Your Records',
      description: 'Upload receipts and documents with our mobile app. Everything is stored securely and organized by category.',
      image: 'https://d64gsuwffb70l.cloudfront.net/68e7f2c7e795b22e67db6507_1762184886103_c40676c6.webp'
    },
    {
      icon: Calculator,
      title: 'Review Deductions',
      description: 'Our system identifies potential deductions and calculates your estimated tax liability in real-time.',
      image: 'https://d64gsuwffb70l.cloudfront.net/68e7f2c7e795b22e67db6507_1762184888203_2396c6ef.webp'
    },
    {
      icon: Rocket,
      title: 'File Electronically',
      description: 'Complete your return with guided workflows, then submit directly to federal and state tax authorities.',
      image: 'https://d64gsuwffb70l.cloudfront.net/68e7f2c7e795b22e67db6507_1762184887137_3a997d1d.webp'
    }
  ];

  return (
    <div className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Your Tax Journey, Simplified</h2>
          <p className="text-xl text-gray-600">Four straightforward steps to stress-free filing</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="relative mb-6">
                <img 
                  src={step.image} 
                  alt={step.title}
                  className="w-full h-48 object-cover rounded-lg shadow-lg"
                />
                <div className="absolute -top-4 -right-4 w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-lg">
                  {index + 1}
                </div>
              </div>
              <step.icon className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
