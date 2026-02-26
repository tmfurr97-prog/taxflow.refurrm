import React, { useState } from 'react';
import AnimatedCounter from './AnimatedCounter';
import LeadFunnelModal from './LeadFunnelModal';

const HERO_BG = 'https://d64gsuwffb70l.cloudfront.net/699dd529e5df43ffb2a8ca6a_1771951532273_f5ecf663.jpg';

const Hero: React.FC = () => {
  const [funnelOpen, setFunnelOpen] = useState(false);

  return (
    <section id="hero-form" className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-[#F7F9FA] via-white to-[#EEF4F2]">
      {/* Background */}
      <div className="absolute inset-0">
        <img src={HERO_BG} alt="" className="w-full h-full object-cover opacity-[0.04]" />
        <div className="absolute inset-0 bg-gradient-to-b from-white via-white/80 to-white" />
      </div>

      {/* Subtle Pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: 'linear-gradient(45deg, #18453B 25%, transparent 25%), linear-gradient(-45deg, #1B365D 25%, transparent 25%)',
        backgroundSize: '60px 60px',
      }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 lg:py-40 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div>
            <div className="inline-flex items-center gap-2 bg-[#18453B]/5 border border-[#18453B]/10 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 rounded-full bg-[#18453B] animate-pulse" />
              <span className="text-[#18453B] text-xs font-semibold uppercase tracking-widest">Professional Financial Services</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-[#0A1628] leading-[0.95] mb-6">
              TAKE{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#18453B] to-[#1E5A4C]">CONTROL</span>
              <br />
              OF YOUR{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1B365D] to-[#2A5298]">WEALTH</span>
            </h1>

            <p className="text-[#4A5568] text-lg sm:text-xl max-w-lg mb-8 leading-relaxed">
              SmartBooks24 by ReFurrm delivers year-round AI-powered tax prep, bookkeeping, and IRS resolution. 
              Professional results. Transparent pricing. Trusted by thousands.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <button
                onClick={() => setFunnelOpen(true)}
                className="bg-[#18453B] hover:bg-[#0D3328] text-white font-semibold px-8 py-4 rounded-xl text-sm uppercase tracking-widest transition-all duration-300 shadow-lg shadow-[#18453B]/15 hover:shadow-[#18453B]/25 hover:-translate-y-0.5"
              >
                Get Started Free
              </button>
              <button
                onClick={() => {
                  const el = document.getElementById('pricing');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="border border-[#1B365D]/20 hover:border-[#1B365D]/40 text-[#1B365D] hover:bg-[#1B365D]/5 font-semibold px-8 py-4 rounded-xl text-sm uppercase tracking-widest transition-all duration-300"
              >
                View Pricing
              </button>
            </div>

            <div className="flex items-center gap-4 text-sm text-[#6B7280]">
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-[#18453B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Bank-Level Security</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-[#1B365D]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span>Track via Mobile App</span>
              </div>
            </div>
          </div>

          {/* Right - Quick Lead Form */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-xl shadow-gray-200/50">
            <h3 className="text-[#0A1628] text-xl font-bold mb-1">Start Your Journey</h3>
            <p className="text-[#6B7280] text-sm mb-6">Free consultation. No obligation.</p>
            <QuickForm onOpenFull={() => setFunnelOpen(true)} />
          </div>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-8 border-t border-gray-200 pt-12">
          <AnimatedCounter end={12500} prefix="$" suffix="+" label="Avg Refund" />
          <AnimatedCounter end={8400} suffix="+" label="Returns Filed" />
          <AnimatedCounter end={99} suffix="%" label="Accuracy Rate" />
          <AnimatedCounter end={24} suffix="/7" label="AI Support" />
        </div>
      </div>

      <LeadFunnelModal isOpen={funnelOpen} onClose={() => setFunnelOpen(false)} />
    </section>
  );
};

const QuickForm: React.FC<{ onOpenFull: () => void }> = ({ onOpenFull }) => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', tax_situation: '', sms_opt_in: false });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { supabase } = await import('@/lib/supabase');
      await supabase.functions.invoke('submit-lead', { body: form });
      setSubmitted(true);
    } catch {
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-8">
        <div className="w-14 h-14 rounded-full bg-[#18453B] flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h4 className="text-[#0A1628] text-lg font-bold mb-1">You're In!</h4>
        <p className="text-[#6B7280] text-sm">We'll reach out within 24 hours.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full Name"
        className="w-full bg-[#F9FAFB] border border-gray-200 rounded-lg px-4 py-3 text-[#0A1628] placeholder-gray-400 focus:outline-none focus:border-[#18453B] focus:ring-1 focus:ring-[#18453B]/30 transition-all text-sm" />
      <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email Address"
        className="w-full bg-[#F9FAFB] border border-gray-200 rounded-lg px-4 py-3 text-[#0A1628] placeholder-gray-400 focus:outline-none focus:border-[#18453B] focus:ring-1 focus:ring-[#18453B]/30 transition-all text-sm" />
      <input type="tel" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone Number"
        className="w-full bg-[#F9FAFB] border border-gray-200 rounded-lg px-4 py-3 text-[#0A1628] placeholder-gray-400 focus:outline-none focus:border-[#18453B] focus:ring-1 focus:ring-[#18453B]/30 transition-all text-sm" />
      <select required value={form.tax_situation} onChange={(e) => setForm({ ...form, tax_situation: e.target.value })}
        className="w-full bg-[#F9FAFB] border border-gray-200 rounded-lg px-4 py-3 text-[#0A1628] focus:outline-none focus:border-[#18453B] focus:ring-1 focus:ring-[#18453B]/30 transition-all text-sm appearance-none">
        <option value="" className="text-gray-400">Tax Situation...</option>
        <option value="individual">Individual</option>
        <option value="business">Business</option>
        <option value="back_taxes">Back Taxes</option>
      </select>

      <label className="flex items-center gap-3 cursor-pointer group">
        <div className="relative">
          <input type="checkbox" checked={form.sms_opt_in} onChange={(e) => setForm({ ...form, sms_opt_in: e.target.checked })} className="sr-only" />
          <div className={`w-5 h-5 rounded border-2 transition-all flex items-center justify-center ${form.sms_opt_in ? 'bg-[#18453B] border-[#18453B]' : 'border-gray-300 group-hover:border-gray-400'}`}>
            {form.sms_opt_in && (
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        </div>
        <span className="text-[#6B7280] text-xs">Text me real-time tax status updates</span>
      </label>

      <button type="submit" disabled={loading}
        className="w-full bg-[#18453B] hover:bg-[#0D3328] disabled:opacity-50 text-white font-semibold py-3.5 rounded-lg text-sm uppercase tracking-widest transition-all duration-300 shadow-sm hover:shadow-md flex items-center justify-center gap-2">
        {loading ? (
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <>
            Claim Your Free Consultation
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </>
        )}
      </button>
    </form>
  );
};

export default Hero;
