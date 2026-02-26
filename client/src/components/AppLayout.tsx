import React from 'react';
import Navbar from './Navbar';
import Hero from './Hero';
import TrustBadges from './TrustBadges';
import ServiceGrid from './ServiceGrid';
import PricingSection from './PricingSection';
import RefundCalculator from './RefundCalculator';
import TestimonialSlider from './TestimonialSlider';
import DocumentVault from './DocumentVault';
import RONServices from './RONServices';
import MobileAppBanner from './MobileAppBanner';
import ReferralProgram from './ReferralProgram';
import BlogSection from './BlogSection';
import Footer from './Footer';
import ChatWidget from './ChatWidget';

const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-white text-[#0A1628]">
      <Navbar />
      <Hero />
      <TrustBadges />
      <ServiceGrid />
      <PricingSection />
      <RefundCalculator />
      <TestimonialSlider />
      <DocumentVault />
      <RONServices />
      <MobileAppBanner />
      <ReferralProgram />
      <BlogSection />
      <Footer />
      <ChatWidget />
    </div>
  );
};

export default AppLayout;
