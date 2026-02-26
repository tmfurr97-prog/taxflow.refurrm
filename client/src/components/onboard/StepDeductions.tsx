import React, { useState } from 'react';
import { IntakeFormData, CharitableDonation } from '@/types/intake';

interface Props {
  data: IntakeFormData;
  onChange: (updates: Partial<IntakeFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const StepDeductions: React.FC<Props> = ({ data, onChange, onNext, onBack }) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    // No required fields on deductions - all optional
    return true;
  };

  const handleNext = () => {
    if (validate()) onNext();
  };

  const formatCurrencyInput = (value: string) => value.replace(/[^0-9.]/g, '');

  const addDonation = () => {
    const newDon: CharitableDonation = { id: Date.now().toString(), organization: '', amount: '', type: 'cash' };
    onChange({ charitable_donations_details: [...data.charitable_donations_details, newDon] });
  };

  const updateDonation = (id: string, field: keyof CharitableDonation, value: string) => {
    onChange({ charitable_donations_details: data.charitable_donations_details.map((d) => (d.id === id ? { ...d, [field]: value } : d)) });
  };

  const removeDonation = (id: string) => {
    onChange({ charitable_donations_details: data.charitable_donations_details.filter((d) => d.id !== id) });
  };

  const toggleClass = (active: boolean) =>
    `relative w-12 h-6 rounded-full transition-colors cursor-pointer ${active ? 'bg-[#18453B]' : 'bg-gray-300'}`;

  const toggleDot = (active: boolean) =>
    `absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${active ? 'translate-x-6' : 'translate-x-0.5'}`;

  const inputSmClass = 'w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-[#0A1628] placeholder-gray-400 focus:outline-none focus:border-[#18453B] focus:ring-2 focus:ring-[#18453B]/20';

  const DeductionRow = ({
    label,
    description,
    icon,
    iconBg,
    iconColor,
    checked,
    onToggle,
    amountValue,
    onAmountChange,
    children,
  }: {
    label: string;
    description: string;
    icon: string;
    iconBg: string;
    iconColor: string;
    checked: boolean;
    onToggle: () => void;
    amountValue?: string;
    onAmountChange?: (v: string) => void;
    children?: React.ReactNode;
  }) => (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg ${iconBg} flex items-center justify-center`}>
            <svg className={`w-4.5 h-4.5 ${iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[#0A1628]">{label}</h4>
            <p className="text-xs text-gray-500">{description}</p>
          </div>
        </div>
        <button type="button" onClick={onToggle} className={toggleClass(checked)}>
          <div className={toggleDot(checked)} />
        </button>
      </div>
      {checked && (
        <div className="border-t border-gray-100 p-4 space-y-3">
          {amountValue !== undefined && onAmountChange && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Amount ($)</label>
              <input
                type="text"
                value={amountValue}
                onChange={(e) => onAmountChange(formatCurrencyInput(e.target.value))}
                placeholder="0.00"
                className={inputSmClass}
              />
            </div>
          )}
          {children}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-[#0A1628]">Deductions & Credits</h2>
        <p className="text-gray-500 mt-1">Toggle on any deductions that apply to you. We'll help determine if itemizing saves you more.</p>
      </div>

      {/* Deduction Preference */}
      <div className="bg-[#18453B]/5 border border-[#18453B]/15 rounded-xl p-5">
        <label className="block text-sm font-bold text-[#1B365D] mb-3">Deduction Preference</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { value: 'standard', label: 'Standard Deduction', desc: 'Simpler, fixed amount' },
            { value: 'itemized', label: 'Itemized Deductions', desc: 'May save more if expenses are high' },
            { value: 'unsure', label: 'Not Sure', desc: "We'll calculate the best option" },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange({ deduction_preference: opt.value })}
              className={`p-3 rounded-lg border-2 text-left transition-all ${
                data.deduction_preference === opt.value
                  ? 'border-[#18453B] bg-white'
                  : 'border-transparent bg-white/60 hover:bg-white'
              }`}
            >
              <p className={`text-sm font-semibold ${data.deduction_preference === opt.value ? 'text-[#18453B]' : 'text-gray-600'}`}>{opt.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{opt.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Deduction Categories */}
      <div className="space-y-3">
        <DeductionRow
          label="Mortgage Interest"
          description="Interest paid on your home mortgage (Form 1098)"
          icon="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          checked={data.has_mortgage_interest}
          onToggle={() => onChange({ has_mortgage_interest: !data.has_mortgage_interest })}
          amountValue={data.mortgage_interest_amount}
          onAmountChange={(v) => onChange({ mortgage_interest_amount: v })}
        />

        <DeductionRow
          label="Property Tax"
          description="State and local property taxes paid"
          icon="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          iconBg="bg-indigo-50"
          iconColor="text-indigo-600"
          checked={data.has_property_tax}
          onToggle={() => onChange({ has_property_tax: !data.has_property_tax })}
          amountValue={data.property_tax_amount}
          onAmountChange={(v) => onChange({ property_tax_amount: v })}
        />

        <DeductionRow
          label="Medical & Dental Expenses"
          description="Out-of-pocket medical expenses exceeding 7.5% of AGI"
          icon="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          iconBg="bg-red-50"
          iconColor="text-red-500"
          checked={data.has_medical_expenses}
          onToggle={() => onChange({ has_medical_expenses: !data.has_medical_expenses })}
          amountValue={data.medical_expenses_amount}
          onAmountChange={(v) => onChange({ medical_expenses_amount: v })}
        />

        <DeductionRow
          label="Charitable Donations"
          description="Cash and non-cash contributions to qualified organizations"
          icon="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          checked={data.has_charitable_donations}
          onToggle={() => {
            onChange({ has_charitable_donations: !data.has_charitable_donations });
            if (!data.has_charitable_donations && data.charitable_donations_details.length === 0) addDonation();
          }}
          amountValue={data.charitable_donations_amount}
          onAmountChange={(v) => onChange({ charitable_donations_amount: v })}
        >
          <div className="space-y-3 mt-3">
            <label className="block text-xs font-semibold text-gray-500">Donation Details (Optional)</label>
            {data.charitable_donations_details.map((don, idx) => (
              <div key={don.id} className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-gray-50 rounded-lg p-3">
                <div className="md:col-span-2">
                  <input type="text" value={don.organization} onChange={(e) => updateDonation(don.id, 'organization', e.target.value)} placeholder="Organization name" className={inputSmClass} />
                </div>
                <div>
                  <input type="text" value={don.amount} onChange={(e) => updateDonation(don.id, 'amount', formatCurrencyInput(e.target.value))} placeholder="Amount" className={inputSmClass} />
                </div>
                <div className="flex gap-2">
                  <select value={don.type} onChange={(e) => updateDonation(don.id, 'type', e.target.value)} className={`${inputSmClass} flex-1`}>
                    <option value="cash">Cash</option>
                    <option value="property">Property</option>
                    <option value="stock">Stock</option>
                  </select>
                  <button type="button" onClick={() => removeDonation(don.id)} className="text-gray-400 hover:text-red-500 transition-colors px-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              </div>
            ))}
            <button type="button" onClick={addDonation} className="text-[#18453B] hover:text-[#0D3328] text-xs font-semibold flex items-center gap-1 transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              Add Donation
            </button>
          </div>
        </DeductionRow>

        <DeductionRow
          label="Student Loan Interest"
          description="Interest paid on qualified student loans (up to $2,500)"
          icon="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
          iconBg="bg-violet-50"
          iconColor="text-violet-600"
          checked={data.has_student_loan_interest}
          onToggle={() => onChange({ has_student_loan_interest: !data.has_student_loan_interest })}
          amountValue={data.student_loan_interest_amount}
          onAmountChange={(v) => onChange({ student_loan_interest_amount: v })}
        />

        <DeductionRow
          label="Educator Expenses"
          description="Classroom supplies and materials (up to $300 per educator)"
          icon="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
          checked={data.has_educator_expenses}
          onToggle={() => onChange({ has_educator_expenses: !data.has_educator_expenses })}
          amountValue={data.educator_expenses_amount}
          onAmountChange={(v) => onChange({ educator_expenses_amount: v })}
        />

        <DeductionRow
          label="Home Office"
          description="Dedicated space used exclusively for business"
          icon="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          iconBg="bg-cyan-50"
          iconColor="text-cyan-600"
          checked={data.has_home_office}
          onToggle={() => onChange({ has_home_office: !data.has_home_office })}
        >
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Office Square Footage</label>
            <input
              type="text"
              value={data.home_office_sqft}
              onChange={(e) => onChange({ home_office_sqft: e.target.value.replace(/\D/g, '') })}
              placeholder="e.g., 150"
              className={inputSmClass}
            />
          </div>
        </DeductionRow>

        <DeductionRow
          label="Retirement Contributions"
          description="IRA, 401(k), or other retirement account contributions"
          icon="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
          iconBg="bg-orange-50"
          iconColor="text-orange-600"
          checked={data.has_retirement_contributions}
          onToggle={() => onChange({ has_retirement_contributions: !data.has_retirement_contributions })}
          amountValue={data.retirement_contributions_amount}
          onAmountChange={(v) => onChange({ retirement_contributions_amount: v })}
        >
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Account Type</label>
            <select
              value={data.retirement_account_type}
              onChange={(e) => onChange({ retirement_account_type: e.target.value })}
              className={inputSmClass}
            >
              <option value="">Select type</option>
              <option value="traditional_ira">Traditional IRA</option>
              <option value="roth_ira">Roth IRA</option>
              <option value="401k">401(k)</option>
              <option value="403b">403(b)</option>
              <option value="sep_ira">SEP IRA</option>
              <option value="simple_ira">SIMPLE IRA</option>
              <option value="other">Other</option>
            </select>
          </div>
        </DeductionRow>
      </div>

      {/* Additional Notes */}
      <div>
        <label className="block text-sm font-semibold text-[#1B365D] mb-1.5">Additional Notes</label>
        <textarea
          value={data.additional_notes}
          onChange={(e) => onChange({ additional_notes: e.target.value })}
          placeholder="Any other deductions, credits, or information you'd like us to know about..."
          rows={4}
          className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm text-[#0A1628] placeholder-gray-400 focus:outline-none focus:border-[#18453B] focus:ring-2 focus:ring-[#18453B]/20 resize-none"
        />
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t border-gray-100">
        <button onClick={onBack} className="text-gray-600 hover:text-[#0A1628] font-semibold px-6 py-3 rounded-lg text-sm transition-colors flex items-center gap-2 border border-gray-200 hover:border-gray-300">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back
        </button>
        <button onClick={handleNext} className="bg-[#18453B] hover:bg-[#0D3328] text-white font-semibold px-8 py-3 rounded-lg text-sm transition-colors flex items-center gap-2">
          Review & Submit
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
        </button>
      </div>
    </div>
  );
};

export default StepDeductions;
