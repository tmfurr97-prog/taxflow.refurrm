import React, { useState, useEffect } from 'react';

const PORTRAITS = [
  'https://d64gsuwffb70l.cloudfront.net/699dd529e5df43ffb2a8ca6a_1771951577489_fbe0aa82.jpg',
  'https://d64gsuwffb70l.cloudfront.net/699dd529e5df43ffb2a8ca6a_1771951576509_1bc6d5ad.jpg',
  'https://d64gsuwffb70l.cloudfront.net/699dd529e5df43ffb2a8ca6a_1771951576455_d4e23085.jpg',
  'https://d64gsuwffb70l.cloudfront.net/699dd529e5df43ffb2a8ca6a_1771951577062_0f9bd25c.jpg',
  'https://d64gsuwffb70l.cloudfront.net/699dd529e5df43ffb2a8ca6a_1771951583477_11ca138d.jpg',
  'https://d64gsuwffb70l.cloudfront.net/699dd529e5df43ffb2a8ca6a_1771951584357_7f40d1ca.jpg',
  'https://d64gsuwffb70l.cloudfront.net/699dd529e5df43ffb2a8ca6a_1771951582245_a1ab107f.jpg',
];

const testimonials = [
  { name: 'Marcus T.', role: 'Small Business Owner', refund: '$14,200', text: 'SmartBooks2424 turned my tax concerns into a refund I never expected. The AI sorted my receipts in seconds. I went from owing $3K to getting $14K back. Outstanding results.', rating: 5 },
  { name: 'Keisha R.', role: 'Freelance Designer', refund: '$8,750', text: 'As a freelancer, taxes used to stress me out every year. The 24/7 plan keeps me organized year-round. My refund doubled from last year.', rating: 5 },
  { name: 'David L.', role: 'Real Estate Investor', refund: '$22,400', text: 'The corporate tax prep team found deductions my old CPA missed for years. $22K refund and counting. These professionals are exceptional.', rating: 5 },
  { name: 'Jasmine W.', role: 'Nurse Practitioner', refund: '$6,800', text: 'I uploaded my W2 from my phone and had my return ready in 48 hours. The mobile app tracking is a game-changer. Professional and fast.', rating: 5 },
  { name: 'Carlos M.', role: 'Restaurant Owner', refund: '$18,500', text: 'Had 3 years of back taxes. The IRS resolution team negotiated my $45K debt down to $12K. They literally saved my business.', rating: 5 },
  { name: 'Tanya P.', role: 'E-Commerce Seller', refund: '$11,300', text: 'The bookkeeping service pays for itself 10x over. Every expense tracked, every deduction claimed. My accountant friends are impressed.', rating: 5 },
  { name: 'Robert K.', role: 'Contractor', refund: '$9,200', text: 'The RON notarization saved me a trip downtown. Got my IRS Power of Attorney notarized from my couch. This is the future of financial services.', rating: 5 },
  { name: 'Alicia D.', role: 'Tech Startup Founder', refund: '$31,000', text: 'From R&D credits to quarterly estimates, SmartBooks24 handles it all. The Annual Plan is the best investment I made this year.', rating: 5 },
];

const TestimonialSlider: React.FC = () => {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const interval = setInterval(() => setActive((prev) => (prev + 1) % testimonials.length), 5000);
    return () => clearInterval(interval);
  }, [paused]);

  return (
    <section className="py-24 lg:py-32 bg-[#F7F9FA] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16">
          <span className="text-[#18453B] text-xs font-semibold uppercase tracking-[0.3em] block mb-3">Client Testimonials</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0A1628] mb-4">
            WHAT OUR <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#18453B] to-[#1B365D]">CLIENTS</span> SAY
          </h2>
        </div>

        <div className="max-w-3xl mx-auto mb-12" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
          <div className="bg-white border border-gray-200 rounded-2xl p-8 sm:p-10 relative shadow-lg shadow-gray-100">
            <div className="absolute top-6 right-8 text-[#18453B]/5 text-8xl font-serif leading-none">"</div>
            <div className="flex items-center gap-4 mb-6">
              <img src={PORTRAITS[active % PORTRAITS.length]} alt={testimonials[active].name} className="w-14 h-14 rounded-full object-cover border-2 border-[#18453B]/20" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[#0A1628] font-bold">{testimonials[active].name}</span>
                  <span className="bg-[#18453B]/5 text-[#18453B] text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">Verified Client</span>
                </div>
                <span className="text-[#6B7280] text-sm">{testimonials[active].role}</span>
              </div>
            </div>
            <p className="text-[#4A5568] text-lg leading-relaxed mb-6 relative z-10">"{testimonials[active].text}"</p>
            <div className="flex items-center justify-between">
              <div className="flex gap-1">{Array.from({ length: 5 }).map((_, i) => (<svg key={i} className="w-5 h-5 text-[#18453B]" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>))}</div>
              <div className="text-right"><span className="text-[#6B7280] text-xs uppercase tracking-wider block">Refund Received</span><span className="text-[#18453B] font-black text-xl">{testimonials[active].refund}</span></div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2">
          {testimonials.map((_, idx) => (<button key={idx} onClick={() => setActive(idx)} className={`transition-all duration-300 rounded-full ${idx === active ? 'w-8 h-2 bg-[#18453B]' : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'}`} />))}
        </div>

        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          {testimonials.slice(0, 4).map((t, idx) => (
            <button key={idx} onClick={() => setActive(idx)} className={`text-left p-4 rounded-xl border transition-all duration-300 ${idx === active ? 'bg-white border-[#18453B]/20 shadow-md' : 'bg-white/50 border-gray-200 hover:border-gray-300'}`}>
              <div className="flex items-center gap-2 mb-2"><img src={PORTRAITS[idx % PORTRAITS.length]} alt="" className="w-8 h-8 rounded-full object-cover" /><span className="text-[#0A1628] text-xs font-bold">{t.name}</span></div>
              <p className="text-[#6B7280] text-xs line-clamp-2">"{t.text.substring(0, 80)}..."</p>
              <span className="text-[#18453B] text-xs font-bold mt-1 block">{t.refund}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialSlider;
