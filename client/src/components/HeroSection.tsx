import React from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from './ui/button';
import { User, LogOut } from 'lucide-react';

interface HeroSectionProps {
  onGetStarted: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onGetStarted }) => {
  const { user, signOut } = useAuth();
  const [, setLocation] = useLocation();

  return (
    <div className="relative bg-gradient-to-br from-brand-black via-brand-aqua to-brand-black text-gray-900 overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <img 
          src="https://d64gsuwffb70l.cloudfront.net/68e7f2c7e795b22e67db6507_1760713229618_d5a4bb79.webp" 
          alt="TaxFlow a ReFURRM App" 
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* User Menu */}
      {user && (
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
          <Button 
            variant="ghost" 
            className="text-gray-900 hover:bg-white/10"
            onClick={() => setLocation('/profile')}
          >
            <User className="mr-2 h-4 w-4" />
            {user.email}
          </Button>
          <Button 
            variant="ghost" 
            className="text-gray-900 hover:bg-white/10"
            onClick={() => signOut()}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      <div className="relative max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-block bg-brand-aqua text-gray-900 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              7-Day Free Trial • No Credit Card Required
            </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            TaxFlow a ReFURRM APP
          </h1>
          <p className="text-xl md:text-2xl text-brand-silver mt-2">
            Simplify your books. Secure your future.
          </p>
          <p className="text-xl md:text-2xl text-blue-100 mt-4">
            Complete Tax Automation for Freelancers and Small Business Owners.
          </p>
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            Built for Individuals, Freelancers, Creators, and Small Business Owners Who Want to Stay Organized, Empowered, and Tax-Ready All Year Long with Automated Tax Preparation and Bookkeeping for just $24.99/month or $249/year.
          </p>

            <div className="flex flex-wrap gap-4 mb-8">
              <button 
                onClick={onGetStarted}
                className="px-8 py-4 bg-brand-aqua text-gray-900 font-bold rounded-lg hover:bg-opacity-90 transition-all shadow-lg hover:shadow-xl"
              >
                Start Free Trial
              </button>

              <button className="px-8 py-4 bg-white bg-opacity-10 backdrop-blur text-gray-900 font-bold rounded-lg hover:bg-opacity-20 transition-all border-2 border-white border-opacity-30">
                Watch Demo
              </button>
            </div>
            <div className="flex items-center gap-8 text-sm">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>AES-256 Encrypted</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>GDPR Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>No Tax Advice</span>
              </div>
            </div>
          </div>
          
          <div className="hidden lg:block">
            <img 
              src="https://d64gsuwffb70l.cloudfront.net/68e7f2c7e795b22e67db6507_1760031500112_1b9b54f6.webp" 
              alt="Tax automation dashboard" 
              className="rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
