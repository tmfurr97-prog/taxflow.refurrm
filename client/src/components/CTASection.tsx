import React from 'react';
import { Button } from './ui/button';
import { ArrowRight, CheckCircle } from 'lucide-react';

interface CTASectionProps {
  onGetStarted: () => void;
}

const CTASection: React.FC<CTASectionProps> = ({ onGetStarted }) => {
  return (
    <div className="py-20 bg-gradient-to-br from-emerald-600 to-teal-600 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl lg:text-5xl font-bold mb-6">
          Transform Your Tax Experience Today
        </h2>
        <p className="text-xl mb-8 text-emerald-100">
          Join thousands of professionals who've automated their tax workflow
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button 
            size="lg" 
            onClick={onGetStarted}
            className="bg-white text-emerald-600 hover:bg-emerald-50 text-lg px-8 py-6 h-auto"
          >
            Begin Free Trial
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 text-left">
          {[
            'Free for 14 days',
            'No payment info needed',
            'Full feature access'
          ].map((item, index) => (
            <div key={index} className="flex items-center gap-2 justify-center md:justify-start">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CTASection;
