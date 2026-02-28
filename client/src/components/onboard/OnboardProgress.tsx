import React from 'react';

interface Step {
  number: number;
  title: string;
  subtitle: string;
}

const STEPS: Step[] = [
  { number: 1, title: 'Personal Info', subtitle: 'Your details' },
  { number: 2, title: 'Filing Status', subtitle: 'Status & dependents' },
  { number: 3, title: 'Income', subtitle: 'Sources & documents' },
  { number: 4, title: 'Deductions', subtitle: 'Tax deductions' },
  { number: 5, title: 'Review', subtitle: 'Confirm & submit' },
];

interface OnboardProgressProps {
  currentStep: number;
}

const OnboardProgress: React.FC<OnboardProgressProps> = ({ currentStep }) => {
  return (
    <div className="w-full">
      {/* Desktop Progress */}
      <div className="hidden md:flex items-center justify-between relative">
        {/* Background line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200" />
        {/* Active line */}
        <div
          className="absolute top-5 left-0 h-0.5 bg-[#18453B] transition-all duration-500"
          style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
        />

        {STEPS.map((step) => {
          const isCompleted = currentStep > step.number;
          const isActive = currentStep === step.number;
          const isPending = currentStep < step.number;

          return (
            <div key={step.number} className="relative flex flex-col items-center z-10">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  isCompleted
                    ? 'bg-[#18453B] text-gray-900'
                    : isActive
                    ? 'bg-[#18453B] text-gray-900 ring-4 ring-[#18453B]/20'
                    : 'bg-white text-gray-400 border-2 border-gray-200'
                }`}
              >
                {isCompleted ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step.number
                )}
              </div>
              <div className="mt-2 text-center">
                <p className={`text-xs font-semibold ${isActive || isCompleted ? 'text-[#0A1628]' : 'text-gray-400'}`}>
                  {step.title}
                </p>
                <p className={`text-[10px] mt-0.5 ${isActive || isCompleted ? 'text-gray-500' : 'text-gray-300'}`}>
                  {step.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile Progress */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-[#0A1628]">
            Step {currentStep} of {STEPS.length}
          </span>
          <span className="text-sm text-gray-500">{STEPS[currentStep - 1]?.title}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-[#18453B] h-2 rounded-full transition-all duration-500"
            style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default OnboardProgress;
