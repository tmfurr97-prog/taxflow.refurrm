import React from 'react';

const PricingSection: React.FC = () => {
  const tiers = [
    {
      name: "Traditional Prep",
      price: "Quote",
      period: "per return",
      description: "For those who prefer a human touch. No AI sorting.",
      features: [
        "Client Intake",
        "Secure Document Uploads",
        "Direct Professional Handling",
        "In-Person or Virtual Review",
        "Manual Bookkeeping Audit",
        "Paper or E-File Options",
        "Personalized Tax Strategy"
      ],
      cta: "Get a Custom Quote",
      highlight: false
    }, {

      name: "Smart Personal",
      price: "$29",
      period: "/month",
      description: "Ideal for W2 earners and simple filers.",
      features: ["AI Receipt Tracking", "Secure Vault", "Standard Tax Review", "Smart Alerts"],
      cta: "Secure My Spot",
      highlight: false
    },
    {
      name: "Smart Business Pro",
      price: "$89",
      period: "/month",
      description: "Full-service for LLCs & Side-Hustles.",
      features: ["Monthly AI Bookkeeping", "Entity Tax Prep Included", "Quarterly Vouchers", "Shadow Accountant Review", "Audit Protection"],
      cta: "Automate My Business",
      highlight: true
    },
    {
      name: "Smart Annual VIP",
      price: "$301",
      period: "/year",
      description: "Total peace of mind for high earners.",
      features: ["Everything in Personal", "E-File Included", "24/7 Priority Agent", "Year-End 5-Min Review"],
      cta: "Approve & File",
      highlight: false
    }
  ];

  return (
    <section id="pricing" className="py-24 bg-[#F9FAFB]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-[#0A1628] mb-4 uppercase tracking-tight">Transparent <span className="text-[#18453B]">Pricing</span></h2>
          <p className="text-[#6B7280] max-w-2xl mx-auto">Taxes aren't a season, they're a status: <span className="font-bold text-[#18453B]">DONE.</span> Costs less per month than a bookkeeper per week.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {tiers.map((tier, idx) => (
            <div key={idx} className={`bg-white rounded-2xl p-8 border ${tier.highlight ? 'border-[#18453B] shadow-2xl ring-4 ring-[#18453B]/5' : 'border-gray-200'} relative`}>
              {tier.highlight && <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#18453B] text-gray-900 text-[10px] font-black px-4 py-1.5 rounded-full tracking-widest uppercase">Most Popular</span>}
              <h3 className="text-[#0A1628] text-xl font-bold mb-2">{tier.name}</h3>
              <p className="text-gray-400 text-xs mb-8">{tier.description}</p>
              <div className="mb-8"><span className="text-4xl font-black text-[#0A1628]">{tier.price}</span><span className="text-gray-400 text-sm">{tier.period}</span></div>
              <ul className="space-y-4 mb-8">
                {tier.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-[#0A1628] font-medium"><svg className="w-4 h-4 text-[#18453B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>{f}</li>
                ))}
              </ul>
              <button className={`w-full py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${tier.highlight ? 'bg-[#18453B] text-gray-900 hover:bg-[#0D3328]' : 'bg-gray-100 text-[#0A1628] hover:bg-gray-200'}`}>{tier.cta}</button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;