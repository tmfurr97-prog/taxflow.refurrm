import React, { useState } from 'react';
import ModernHero from '@/components/ModernHero';
import SocialProof from '@/components/SocialProof';
import HowItWorks from '@/components/HowItWorks';
import BenefitsGrid from '@/components/BenefitsGrid';
import Testimonials from '@/components/Testimonials';
import CTASection from '@/components/CTASection';
import Footer from '@/components/Footer';
import OnboardingModal from '@/components/OnboardingModal';
import { useLocation } from 'wouter';

const Landing: React.FC = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [, setLocation] = useLocation();

  const handleGetStarted = () => {
    setLocation('/signup');
  };

  return (
    <div className="min-h-screen bg-background">
      <OnboardingModal 
        isOpen={showOnboarding} 
        onComplete={() => {
          setShowOnboarding(false);
          setLocation('/dashboard');
        }} 
      />
      
      <ModernHero onGetStarted={handleGetStarted} />
      <SocialProof />
      <HowItWorks />
      <BenefitsGrid />
      <Testimonials />
      <CTASection onGetStarted={handleGetStarted} />
      <Footer />
    </div>
  );
};

export default Landing;
