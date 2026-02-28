import React from 'react';

const MobileAppBanner: React.FC = () => {
  return (
    <section className="py-20 lg:py-24 bg-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-[#18453B]/[0.02] to-[#1B365D]/[0.02]" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-[#1B365D] text-xs font-semibold uppercase tracking-[0.3em] block mb-3">SmartBooks24 Platform</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0A1628] mb-4">TRACK YOUR STATUS <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#18453B] to-[#1B365D]">ANYWHERE</span></h2>
            <p className="text-[#6B7280] text-lg mb-8 leading-relaxed">Our clients get full access to the SmartBooks24 mobile app. Track your return status, upload documents on the go, and receive real-time SMS notifications.</p>
            <div className="space-y-4 mb-8">
              {[{ title: 'Real-Time Status Tracking', desc: 'Know exactly where your return is at every step' }, { title: 'Mobile Document Upload', desc: 'Snap a photo of receipts and W2s instantly' }, { title: 'SMS & Push Notifications', desc: 'Get alerted the moment your status changes' }, { title: 'IRS Refund Tracker', desc: 'Direct link to "Where\'s My Refund" built in' }].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#18453B]/5 flex items-center justify-center flex-shrink-0 mt-0.5"><svg className="w-4 h-4 text-[#18453B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg></div>
                  <div><span className="text-[#0A1628] font-bold text-sm">{item.title}</span><p className="text-[#6B7280] text-xs mt-0.5">{item.desc}</p></div>
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <a href="https://sa.www4.irs.gov/wmr/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 bg-[#1B365D] hover:bg-[#0A1628] text-gray-900 font-semibold px-6 py-3 rounded-xl text-sm transition-all shadow-sm">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                Check IRS Refund Status
              </a>
              <button onClick={() => { const el = document.getElementById('hero-form'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }} className="inline-flex items-center justify-center gap-2 border border-gray-200 hover:border-gray-300 text-[#0A1628] hover:bg-gray-50 font-semibold px-6 py-3 rounded-xl text-sm transition-all">Get Started</button>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="relative">
              <div className="w-64 sm:w-72 bg-white border border-gray-200 rounded-[2.5rem] p-3 shadow-2xl shadow-gray-200/50">
                <div className="bg-[#F7F9FA] rounded-[2rem] overflow-hidden">
                  <div className="flex items-center justify-between px-6 py-2 text-[#0A1628] text-[10px]"><span>9:41</span><div className="flex items-center gap-1"><div className="w-4 h-2 border border-gray-400 rounded-sm"><div className="w-3/4 h-full bg-[#18453B] rounded-sm" /></div></div></div>
                  <div className="px-5 pb-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-[#18453B] flex items-center justify-center"><svg className="w-4 h-4 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg></div>
                      <span className="text-[#0A1628] font-bold text-xs">SmartBooks24</span>
                    </div>
                    <div className="bg-white rounded-xl p-4 mb-3 border border-gray-100"><span className="text-[#6B7280] text-[10px] uppercase tracking-wider">Return Status</span><div className="flex items-center gap-2 mt-1"><div className="w-2 h-2 rounded-full bg-[#18453B] animate-pulse" /><span className="text-[#18453B] font-bold text-sm">Accepted by IRS</span></div></div>
                    <div className="bg-white rounded-xl p-4 mb-3 border border-gray-100"><span className="text-[#6B7280] text-[10px] uppercase tracking-wider">Estimated Refund</span><span className="text-[#18453B] font-black text-2xl block mt-1">$8,450</span></div>
                    <div className="space-y-2">
                      {[{ label: 'Documents Uploaded', status: 'Complete', color: 'text-[#18453B]' }, { label: 'AI Review', status: 'Complete', color: 'text-[#18453B]' }, { label: 'Professional Review', status: 'Complete', color: 'text-[#18453B]' }, { label: 'E-Filed', status: 'Complete', color: 'text-[#18453B]' }, { label: 'IRS Accepted', status: 'Active', color: 'text-[#1B365D]' }, { label: 'Refund Deposited', status: 'Pending', color: 'text-gray-400' }].map((step, i) => (
                        <div key={i} className="flex items-center justify-between py-1">
                          <div className="flex items-center gap-2"><div className={`w-1.5 h-1.5 rounded-full ${step.status === 'Complete' ? 'bg-[#18453B]' : step.status === 'Active' ? 'bg-[#1B365D] animate-pulse' : 'bg-gray-300'}`} /><span className="text-[#6B7280] text-[10px]">{step.label}</span></div>
                          <span className={`text-[10px] font-medium ${step.color}`}>{step.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -inset-4 bg-gradient-to-r from-[#18453B]/10 to-[#1B365D]/10 rounded-[3rem] blur-xl -z-10" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MobileAppBanner;
