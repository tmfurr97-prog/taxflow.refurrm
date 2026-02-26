import React, { useState } from 'react';

const RefundCalculator: React.FC = () => {
  const [income, setIncome] = useState('');
  const [filingStatus, setFilingStatus] = useState('');
  const [dependents, setDependents] = useState('0');
  const [deductions, setDeductions] = useState('standard');
  const [result, setResult] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [animating, setAnimating] = useState(false);

  const calculateRefund = () => {
    const inc = parseFloat(income.replace(/,/g, '')) || 0;
    const deps = parseInt(dependents) || 0;
    let standardDeduction = 0; let taxRate = 0.22;
    switch (filingStatus) {
      case 'single': standardDeduction = 14600; break;
      case 'married_joint': standardDeduction = 29200; taxRate = 0.18; break;
      case 'married_separate': standardDeduction = 14600; break;
      case 'head_household': standardDeduction = 21900; taxRate = 0.20; break;
    }
    const childCredit = deps * 2000;
    const deductionAmount = deductions === 'itemized' ? standardDeduction * 1.3 : standardDeduction;
    const taxableIncome = Math.max(0, inc - deductionAmount);
    const estimatedTax = taxableIncome * taxRate;
    const withheld = inc * 0.25;
    const refund = Math.max(0, withheld - estimatedTax + childCredit);
    setAnimating(true);
    setTimeout(() => { setResult(Math.round(refund)); setShowResult(true); setAnimating(false); }, 1500);
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  const inputClass = "w-full bg-[#F9FAFB] border border-gray-200 rounded-lg px-4 py-3 text-[#0A1628] placeholder-gray-400 focus:outline-none focus:border-[#18453B] focus:ring-1 focus:ring-[#18453B]/30 text-sm appearance-none";

  return (
    <section id="calculator" className="py-24 lg:py-32 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <span className="text-[#1B365D] text-xs font-semibold uppercase tracking-[0.3em] block mb-3">Free Tool</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0A1628] mb-4">
              REFUND <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#18453B] to-[#1B365D]">ESTIMATOR</span>
            </h2>
            <p className="text-[#6B7280] text-lg mb-8 leading-relaxed">Get a quick estimate of your potential refund. No login required. See what you could be leaving on the table.</p>
            <div className="space-y-4">
              {[{ icon: 'M13 10V3L4 14h7v7l9-11h-7z', text: 'Instant calculation — no waiting' }, { icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z', text: 'Your data stays private' }, { icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', text: 'Based on 2025 tax brackets' }].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#18453B]/5 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-[#18453B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d={item.icon} /></svg>
                  </div>
                  <span className="text-[#4A5568] text-sm">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-xl shadow-gray-200/50">
            {showResult ? (
              <div className="text-center py-8">
                <div className="mb-6">
                  <span className="text-[#6B7280] text-sm uppercase tracking-widest block mb-2">Your Estimated Refund</span>
                  <div className="text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#18453B] to-[#1B365D]">{formatCurrency(result || 0)}</div>
                </div>
                <p className="text-[#6B7280] text-sm mb-8 max-w-sm mx-auto">This is an estimate based on the information provided. Your actual refund may vary. Let our professionals maximize every dollar.</p>
                <div className="space-y-3">
                  <button onClick={() => { const el = document.getElementById('hero-form'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }} className="w-full bg-[#18453B] hover:bg-[#0D3328] text-white font-semibold py-3.5 rounded-xl text-sm uppercase tracking-wider shadow-sm">Claim Your Full Refund</button>
                  <button onClick={() => { setShowResult(false); setResult(null); }} className="w-full text-[#6B7280] hover:text-[#0A1628] py-2 text-sm font-medium transition-colors">Calculate Again</button>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <h3 className="text-[#0A1628] font-bold text-lg mb-1">Estimate Your Refund</h3>
                <p className="text-[#6B7280] text-sm mb-4">4 quick fields. Instant results.</p>
                <label className="block"><span className="text-[#4A5568] text-xs uppercase tracking-wider font-medium">Annual Income</span>
                  <div className="relative mt-1.5"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                    <input type="text" value={income} onChange={(e) => setIncome(e.target.value.replace(/[^0-9,]/g, ''))} placeholder="75,000" className={`${inputClass} pl-8`} /></div>
                </label>
                <label className="block"><span className="text-[#4A5568] text-xs uppercase tracking-wider font-medium">Filing Status</span>
                  <select value={filingStatus} onChange={(e) => setFilingStatus(e.target.value)} className={`mt-1.5 ${inputClass}`}><option value="">Select status...</option><option value="single">Single</option><option value="married_joint">Married Filing Jointly</option><option value="married_separate">Married Filing Separately</option><option value="head_household">Head of Household</option></select>
                </label>
                <label className="block"><span className="text-[#4A5568] text-xs uppercase tracking-wider font-medium">Dependents</span>
                  <select value={dependents} onChange={(e) => setDependents(e.target.value)} className={`mt-1.5 ${inputClass}`}>{[0,1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}</select>
                </label>
                <label className="block"><span className="text-[#4A5568] text-xs uppercase tracking-wider font-medium">Deductions</span>
                  <select value={deductions} onChange={(e) => setDeductions(e.target.value)} className={`mt-1.5 ${inputClass}`}><option value="standard">Standard Deduction</option><option value="itemized">Itemized Deductions</option></select>
                </label>
                <button onClick={calculateRefund} disabled={!income || !filingStatus || animating} className="w-full bg-[#18453B] hover:bg-[#0D3328] disabled:opacity-40 text-white font-semibold py-3.5 rounded-xl text-sm uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-2">
                  {animating ? (<><svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Calculating...</>) : (<>Calculate My Refund<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg></>)}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default RefundCalculator;
