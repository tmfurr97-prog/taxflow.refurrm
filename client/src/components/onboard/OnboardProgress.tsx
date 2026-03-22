import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { IntakeFormData, INITIAL_FORM_DATA } from '@/types/intake';
import OnboardProgress from '@/components/onboard/OnboardProgress';
import StepPersonalInfo from '@/components/onboard/StepPersonalInfo';
import StepFilingStatus from '@/components/onboard/StepFilingStatus';
import StepIncomeSources from '@/components/onboard/StepIncomeSources';
import StepDeductions from '@/components/onboard/StepDeductions';
import StepReview from '@/components/onboard/StepReview';

const Onboard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<IntakeFormData>(INITIAL_FORM_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedIntake, setSubmittedIntake] = useState<any>(null);
  const { toast } = useToast();

  const updateFormData = (updates: Partial<IntakeFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const goNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 5));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('submit-intake', {
        body: { action: 'submit', data: formData },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setSubmittedIntake(data.intake);
      setIsSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });

      toast({
        title: 'Intake Form Submitted',
        description: 'Your information has been securely submitted. We\'ll be in touch soon!',
      });
    } catch (err: any) {
      console.error('Submit error:', err);
      toast({
        title: 'Submission Error',
        description: err.message || 'There was an error submitting your form. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirmation Screen
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#F7F9FA]">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-[#18453B] flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <span className="text-[#0A1628] font-bold text-lg">SmartBooks24</span>
              </Link>
            </div>
          </div>
        </header>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-10">
            {/* Success Animation */}
            <div className="w-20 h-20 rounded-full bg-[#18453B]/10 flex items-center justify-center mx-auto mb-6">
              <div className="w-14 h-14 rounded-full bg-[#18453B] flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-[#0A1628]">Intake Form Submitted!</h1>
            <p className="text-gray-500 mt-2 max-w-md mx-auto">
              Thank you, {submittedIntake?.first_name}. Your tax information has been securely received and is being reviewed by our team.
            </p>
          </div>

          {/* Confirmation Details */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
            <h3 className="text-sm font-bold text-[#1B365D] uppercase tracking-wider mb-4">Confirmation Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-sm text-gray-500">Reference ID</span>
                <span className="text-sm font-mono font-semibold text-[#18453B]">{submittedIntake?.id?.slice(0, 8).toUpperCase()}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-sm text-gray-500">Submitted</span>
                <span className="text-sm font-medium text-[#0A1628]">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-sm text-gray-500">Status</span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Submitted</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-sm text-gray-500">Email</span>
                <span className="text-sm font-medium text-[#0A1628]">{submittedIntake?.email}</span>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
            <h3 className="text-sm font-bold text-[#1B365D] uppercase tracking-wider mb-4">What Happens Next</h3>
            <div className="space-y-4">
              {[
                {
                  step: '1',
                  title: 'Review & Verification',
                  desc: 'Our tax professionals will review your submitted information within 1-2 business days.',
                  icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
                },
                {
                  step: '2',
                  title: 'Consultation Call',
                  desc: 'A dedicated tax advisor will contact you to discuss your return and answer any questions.',
                  icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z',
                },
                {
                  step: '3',
                  title: 'Document Preparation',
                  desc: 'We\'ll prepare your tax return and send it to you for review before filing.',
                  icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
                },
                {
                  step: '4',
                  title: 'Filing & Refund',
                  desc: 'Once approved, we\'ll file your return electronically. Track your refund status in your dashboard.',
                  icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
                },
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#18453B]/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-[#18453B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#0A1628]">{item.title}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Important Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 mb-8">
            <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-amber-800">Save Your Reference ID</p>
              <p className="text-xs text-amber-700 mt-0.5">
                Your reference ID is <span className="font-mono font-bold">{submittedIntake?.id?.slice(0, 8).toUpperCase()}</span>. 
                Please save this for your records. A confirmation email has been sent to {submittedIntake?.email}.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/"
              className="bg-[#18453B] hover:bg-[#0D3328] text-white font-semibold px-8 py-3 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Return to Home
            </Link>
            <button
              onClick={() => {
                navigator.clipboard.writeText(submittedIntake?.id?.slice(0, 8).toUpperCase() || '');
                toast({ title: 'Copied!', description: 'Reference ID copied to clipboard.' });
              }}
              className="border border-gray-200 hover:border-gray-300 text-gray-700 font-semibold px-8 py-3 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              Copy Reference ID
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F9FA]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-[#18453B] flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <span className="text-[#0A1628] font-bold text-lg">SmartBooks24</span>
            </Link>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400 hidden sm:block">Need help?</span>
              <a href="tel:+15551234567" className="text-sm font-medium text-[#18453B] hover:text-[#0D3328] transition-colors flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                (555) 123-4567
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress */}
        <div className="mb-10">
          <OnboardProgress currentStep={currentStep} />
        </div>

        {/* Step Content */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          {currentStep === 1 && (
            <StepPersonalInfo data={formData} onChange={updateFormData} onNext={goNext} />
          )}
          {currentStep === 2 && (
            <StepFilingStatus data={formData} onChange={updateFormData} onNext={goNext} onBack={goBack} />
          )}
          {currentStep === 3 && (
            <StepIncomeSources data={formData} onChange={updateFormData} onNext={goNext} onBack={goBack} />
          )}
          {currentStep === 4 && (
            <StepDeductions data={formData} onChange={updateFormData} onNext={goNext} onBack={goBack} />
          )}
          {currentStep === 5 && (
            <StepReview
              data={formData}
              onChange={updateFormData}
              onSubmit={handleSubmit}
              onBack={goBack}
              isSubmitting={isSubmitting}
            />
          )}
        </div>

        {/* Security Footer */}
        <div className="mt-6 flex items-center justify-center gap-6 text-xs text-gray-400">
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            256-bit SSL Encrypted
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            IRS Compliant
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Auto-Save Enabled
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboard;
