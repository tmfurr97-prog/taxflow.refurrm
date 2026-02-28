import React, { useState } from 'react';
import { useLocation } from 'wouter';

const LeadFunnelModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [, setLocation] = useLocation();

  const nextStep = () => setStep(prev => prev + 1);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0A1628]/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-[#0A1628]">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <div className="p-8">
          {/* Progress Bar */}
          <div className="w-full bg-gray-100 h-1.5 rounded-full mb-8">
            <div className="bg-[#18453B] h-1.5 rounded-full transition-all duration-500" style={{ width: `${(step / 3) * 100}%` }}></div>
          </div>

          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4">
              <h3 className="text-2xl font-black text-[#0A1628] mb-2 text-center uppercase tracking-tight">Initialize Your Profile</h3>
              <p className="text-[#6B7280] text-center mb-8">Start your professional tax transition in seconds.</p>
              <div className="space-y-4">
                <input type="text" placeholder="Full Name" className="w-full bg-[#F9FAFB] border border-gray-200 rounded-xl px-4 py-3.5 focus:border-[#18453B] outline-none transition-all" />
                <input type="email" placeholder="Email Address" className="w-full bg-[#F9FAFB] border border-gray-200 rounded-xl px-4 py-3.5 focus:border-[#18453B] outline-none transition-all" />
                <button onClick={nextStep} className="w-full bg-[#18453B] text-gray-900 font-bold py-4 rounded-xl uppercase tracking-widest hover:bg-[#0D3328] transition-shadow shadow-lg shadow-[#18453B]/20">Next: Security Opt-in</button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-bottom-4">
              <h3 className="text-2xl font-black text-[#0A1628] mb-2 text-center uppercase tracking-tight">Smart Alert System</h3>
              <p className="text-[#6B7280] text-center mb-8">Our AI Agent monitors your spending to protect your refund.</p>
              <div className="space-y-6">
                <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
                  <p className="text-[#18453B] text-xs font-bold uppercase tracking-widest mb-2">System Preview:</p>
                  <p className="text-sm text-[#18453B] leading-relaxed italic">
                    "Smart Alert: You spent $500 on non-deductible meals. Switch to networking to save $150 on your taxes."
                  </p>
                </div>
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input type="checkbox" className="mt-1 accent-[#18453B]" defaultChecked />
                  <span className="text-sm text-[#0A1628] leading-tight group-hover:text-[#18453B] transition-colors">
                    Enable real-time <strong>Smart Alerts</strong>. I want the AI to flag non-deductible spending and audit risks as they happen.
                  </span>
                </label>
                <button onClick={nextStep} className="w-full bg-[#18453B] text-gray-900 font-bold py-4 rounded-xl uppercase tracking-widest hover:bg-[#0D3328] transition-all">Next: Finalize</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center animate-in zoom-in-95">
              <div className="w-16 h-16 bg-[#18453B]/10 rounded-full flex items-center justify-center mx-auto mb-6 text-[#18453B]">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              </div>
              <h3 className="text-2xl font-black text-[#0A1628] mb-2 uppercase tracking-tight">Access Granted</h3>
              <p className="text-[#6B7280] mb-8">Your account is initialized. The Shadow Accountant is ready to review your first document.</p>
              <button onClick={() => { onClose(); setLocation('/onboard'); }} className="w-full bg-[#18453B] text-gray-900 font-bold py-4 rounded-xl uppercase tracking-widest hover:bg-[#0D3328] transition-all">Go to Command Center</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeadFunnelModal;