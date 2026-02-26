import React from 'react';
import { Button } from './ui/button';
import { ArrowRight, TrendingUp } from 'lucide-react';

interface ModernHeroProps {
  onGetStarted: () => void;
}

const ModernHero: React.FC<ModernHeroProps> = ({ onGetStarted }) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-teal via-teal-dark to-charcoal text-white">
      <div className="absolute inset-0 bg-black/10"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">by SmartBooks Academy</span>
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-heading font-bold mb-6 leading-tight">
              Automate. Simplify. File with confidence.
            </h1>
            
            <p className="text-xl lg:text-2xl mb-8 text-teal-light">
              Your year-round tax assistant. Store receipts, track expenses, and stay audit-ready automatically—no manual entry, no stress.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button 
                size="lg" 
                onClick={onGetStarted}
                className="bg-white text-teal hover:bg-gray-50 text-lg px-8 py-6 h-auto font-semibold"
              >
                Get Started Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => {
                  const featuresSection = document.getElementById('features');
                  featuresSection?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="border-2 border-white bg-white/10 backdrop-blur-sm text-white hover:bg-white hover:text-teal text-lg px-8 py-6 h-auto font-semibold"
              >
                Learn More
              </Button>


            </div>
            
            <div className="mt-8 text-sm text-teal-light">
              <p>No credit card required • Full feature access • SmartBooks Academy integration</p>
            </div>
          </div>
          
          <div className="hidden lg:block">
            <img 
              src="https://d64gsuwffb70l.cloudfront.net/68e7f2c7e795b22e67db6507_1762416634673_ecd9eff4.webp"
              alt="TaxFlow Dashboard"
              className="w-full max-w-md mx-auto drop-shadow-2xl rounded-lg"
            />
          </div>
        </div>
      </div>
    </div>

  );
};

export default ModernHero;
