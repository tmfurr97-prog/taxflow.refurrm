import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';

const ReferralProgram: React.FC = () => {
  const [form, setForm] = useState({ name: '', email: '' });
  const [referralCode, setReferralCode] = useState('');
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      const { data } = await supabase.functions.invoke('create-referral', { body: form });
      if (data) { setReferralCode(data.referral_code || 'SB-DEMO'); setPoints(data.points || 100); }
    } catch { setReferralCode('SB-' + Math.random().toString(36).substring(2, 8).toUpperCase()); setPoints(100); }
    finally { setLoading(false); }
  };

  const copyCode = () => { navigator.clipboard.writeText(`${window.location.origin}?ref=${referralCode}`); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const rewards = [
    { points: 100, reward: 'Sign-up bonus', icon: 'M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7' },
    { points: 250, reward: '$25 account credit', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { points: 500, reward: 'Free month of service', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { points: 1000, reward: 'Free Annual Plan', icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z' },
  ];

  const inputClass = "w-full bg-[#F9FAFB] border border-gray-200 rounded-lg px-4 py-3 text-[#0A1628] placeholder-gray-400 focus:outline-none focus:border-[#18453B] focus:ring-1 focus:ring-[#18453B]/30 text-sm";

  return (
    <section className="py-24 lg:py-32 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          <div>
            <span className="text-[#18453B] text-xs font-semibold uppercase tracking-[0.3em] block mb-3">Earn Rewards</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0A1628] mb-4">CLIENT <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#18453B] to-[#1B365D]">REFERRAL</span> PROGRAM</h2>
            <p className="text-[#6B7280] text-lg mb-8 leading-relaxed">Share the value. Every friend you refer earns you points toward free services, account credits, and exclusive perks.</p>
            <div className="space-y-4">
              {rewards.map((r, i) => (
                <div key={i} className="flex items-center gap-4 bg-[#F7F9FA] border border-gray-100 rounded-xl p-4 hover:border-gray-200 transition-all">
                  <div className="w-10 h-10 rounded-lg bg-[#18453B]/5 flex items-center justify-center flex-shrink-0"><svg className="w-5 h-5 text-[#18453B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d={r.icon} /></svg></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between"><span className="text-[#0A1628] font-bold text-sm">{r.reward}</span><span className="text-[#18453B] font-bold text-xs">{r.points} pts</span></div>
                    <div className="mt-1.5 h-1 bg-gray-200 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-[#18453B] to-[#1B365D] rounded-full" style={{ width: `${Math.min(100, (points / r.points) * 100)}%` }} /></div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[#9CA3AF] text-xs mt-4">Earn 250 points per successful referral. Points never expire.</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-xl shadow-gray-100">
            {referralCode ? (
              <div className="space-y-6">
                <div className="text-center">
                  <span className="text-[#6B7280] text-xs uppercase tracking-widest block mb-2">Your Referral Code</span>
                  <div className="bg-[#F7F9FA] border border-[#18453B]/10 rounded-xl p-4 flex items-center justify-between">
                    <span className="text-[#18453B] font-mono font-bold text-lg tracking-wider">{referralCode}</span>
                    <button onClick={copyCode} className="text-gray-400 hover:text-[#0A1628] transition-colors p-2">
                      {copied ? <svg className="w-5 h-5 text-[#18453B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>}
                    </button>
                  </div>
                </div>
                <div className="text-center"><span className="text-[#6B7280] text-xs uppercase tracking-widest block mb-1">Your Points</span><span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#18453B] to-[#1B365D]">{points}</span></div>
                <div className="space-y-3">
                  <button onClick={copyCode} className="w-full bg-[#18453B] hover:bg-[#0D3328] text-gray-900 font-semibold py-3 rounded-xl text-sm uppercase tracking-wider shadow-sm">{copied ? 'Link Copied!' : 'Copy Referral Link'}</button>
                  <div className="grid grid-cols-3 gap-2">
                    {['Twitter', 'Facebook', 'Email'].map((platform) => (
                      <button key={platform} onClick={() => { const url = encodeURIComponent(`${window.location.origin}?ref=${referralCode}`); const text = encodeURIComponent('Take control of your wealth with SmartBooks24 by ReFurrm!'); if (platform === 'Twitter') window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`); if (platform === 'Facebook') window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`); if (platform === 'Email') window.open(`mailto:?subject=SmartBooks24%20Referral&body=${text}%20${url}`); }}
                        className="bg-[#F7F9FA] border border-gray-200 text-[#6B7280] hover:text-[#0A1628] hover:border-gray-300 py-2.5 rounded-lg text-xs font-medium transition-all">{platform}</button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleGenerate} className="space-y-4">
                <h3 className="text-[#0A1628] font-bold text-lg mb-1">Get Your Referral Code</h3>
                <p className="text-[#6B7280] text-sm mb-4">Start earning points with every referral.</p>
                <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your Name" className={inputClass} />
                <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email Address" className={inputClass} />
                <button type="submit" disabled={loading} className="w-full bg-[#18453B] hover:bg-[#0D3328] text-gray-900 font-semibold py-3.5 rounded-lg text-sm uppercase tracking-wider shadow-sm flex items-center justify-center gap-2 disabled:opacity-50">
                  {loading ? <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> : 'Generate My Code'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReferralProgram;
