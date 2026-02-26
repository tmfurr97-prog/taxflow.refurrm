import React, { useState } from 'react';
import { IntakeFormData, FILING_STATUSES } from '@/types/intake';

interface Props {
  data: IntakeFormData;
  onChange: (updates: Partial<IntakeFormData>) => void;
  onSubmit: () => void;
  onBack: () => void;
  isSubmitting: boolean;
}

const StepReview: React.FC<Props> = ({ data, onChange, onSubmit, onBack, isSubmitting }) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!data.consent_given) newErrors.consent = 'You must agree to the terms to submit';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) onSubmit();
  };

  const filingLabel = FILING_STATUSES.find((f) => f.value === data.filing_status)?.label || data.filing_status;

  const formatCurrency = (v: string) => {
    const num = parseFloat(v);
    if (isNaN(num)) return '$0.00';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
  };

  const SectionHeader = ({ title, step }: { title: string; step: number }) => (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-7 h-7 rounded-full bg-[#18453B] text-white flex items-center justify-center text-xs font-bold">{step}</div>
      <h3 className="text-lg font-bold text-[#0A1628]">{title}</h3>
    </div>
  );

  const InfoRow = ({ label, value }: { label: string; value: string | React.ReactNode }) => (
    <div className="flex justify-between py-2 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-[#0A1628] text-right">{value || <span className="text-gray-300 italic">Not provided</span>}</span>
    </div>
  );

  const Badge = ({ text, color }: { text: string; color: string }) => (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${color}`}>{text}</span>
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-[#0A1628]">Review Your Information</h2>
        <p className="text-gray-500 mt-1">Please review all information carefully before submitting. You can go back to any step to make changes.</p>
      </div>

      {/* Personal Information */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <SectionHeader title="Personal Information" step={1} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
          <InfoRow label="Full Name" value={`${data.first_name} ${data.last_name}`} />
          <InfoRow label="Email" value={data.email} />
          <InfoRow label="Phone" value={data.phone} />
          <InfoRow label="SSN" value={data.ssn ? `***-**-${data.ssn.slice(-4)}` : ''} />
          <InfoRow label="Date of Birth" value={data.date_of_birth ? new Date(data.date_of_birth + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : ''} />
          <InfoRow label="Address" value={data.street_address ? `${data.street_address}, ${data.city}, ${data.state} ${data.zip_code}` : ''} />
        </div>
      </div>

      {/* Filing Status & Dependents */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <SectionHeader title="Filing Status & Dependents" step={2} />
        <InfoRow label="Filing Status" value={filingLabel} />
        {(data.filing_status === 'married_jointly' || data.filing_status === 'married_separately') && (
          <>
            <InfoRow label="Spouse Name" value={`${data.spouse_first_name} ${data.spouse_last_name}`} />
            <InfoRow label="Spouse SSN" value={data.spouse_ssn ? `***-**-${data.spouse_ssn.slice(-4)}` : ''} />
          </>
        )}
        <InfoRow
          label="Dependents"
          value={
            data.dependents.length > 0 ? (
              <Badge text={`${data.dependents.length} dependent${data.dependents.length > 1 ? 's' : ''}`} color="bg-blue-50 text-blue-700" />
            ) : (
              'None'
            )
          }
        />
        {data.dependents.length > 0 && (
          <div className="mt-3 space-y-2">
            {data.dependents.map((dep, idx) => (
              <div key={dep.id} className="bg-gray-50 rounded-lg px-4 py-2.5 text-sm">
                <span className="font-medium text-[#0A1628]">{dep.first_name} {dep.last_name}</span>
                {dep.relationship && <span className="text-gray-400 ml-2">({dep.relationship})</span>}
                {dep.date_of_birth && <span className="text-gray-400 ml-2">DOB: {dep.date_of_birth}</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Income Sources */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <SectionHeader title="Income Sources" step={3} />
        <div className="space-y-3">
          {data.has_w2 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge text="W-2" color="bg-blue-50 text-blue-700" />
                <span className="text-sm font-medium text-[#0A1628]">{data.w2_employers.length} employer{data.w2_employers.length > 1 ? 's' : ''}</span>
              </div>
              {data.w2_employers.map((w2) => (
                <div key={w2.id} className="bg-gray-50 rounded-lg px-4 py-2.5 text-sm mb-1.5">
                  <span className="font-medium text-[#0A1628]">{w2.employer_name || 'Unnamed'}</span>
                  {w2.wages && <span className="text-gray-500 ml-2">Wages: {formatCurrency(w2.wages)}</span>}
                </div>
              ))}
            </div>
          )}
          {data.has_1099 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge text="1099" color="bg-purple-50 text-purple-700" />
                <span className="text-sm font-medium text-[#0A1628]">{data.ten99_sources.length} source{data.ten99_sources.length > 1 ? 's' : ''}</span>
              </div>
              {data.ten99_sources.map((src) => (
                <div key={src.id} className="bg-gray-50 rounded-lg px-4 py-2.5 text-sm mb-1.5">
                  <span className="font-medium text-[#0A1628]">{src.payer_name || 'Unnamed'}</span>
                  <span className="text-gray-400 ml-2">{src.type}</span>
                  {src.amount && <span className="text-gray-500 ml-2">{formatCurrency(src.amount)}</span>}
                </div>
              ))}
            </div>
          )}
          {data.has_self_employment && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge text="Self-Employed" color="bg-amber-50 text-amber-700" />
              </div>
              <div className="bg-gray-50 rounded-lg px-4 py-2.5 text-sm">
                <span className="font-medium text-[#0A1628]">{data.self_employment_details.business_name || 'Unnamed Business'}</span>
                {data.self_employment_details.gross_income && <span className="text-gray-500 ml-2">Gross: {formatCurrency(data.self_employment_details.gross_income)}</span>}
              </div>
            </div>
          )}
          {data.has_other_income && data.other_income_details.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge text="Other" color="bg-emerald-50 text-emerald-700" />
                <span className="text-sm font-medium text-[#0A1628]">{data.other_income_details.length} source{data.other_income_details.length > 1 ? 's' : ''}</span>
              </div>
            </div>
          )}
          {!data.has_w2 && !data.has_1099 && !data.has_self_employment && !data.has_other_income && (
            <p className="text-sm text-gray-400 italic">No income sources specified</p>
          )}
        </div>

        {data.uploaded_documents.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm font-semibold text-[#1B365D] mb-2">Uploaded Documents ({data.uploaded_documents.length})</p>
            <div className="flex flex-wrap gap-2">
              {data.uploaded_documents.map((doc) => (
                <span key={doc.id} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg">{doc.name}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Deductions */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <SectionHeader title="Deductions & Credits" step={4} />
        <InfoRow label="Deduction Preference" value={data.deduction_preference === 'standard' ? 'Standard Deduction' : data.deduction_preference === 'itemized' ? 'Itemized Deductions' : 'Not Sure (We\'ll Calculate)'} />
        <div className="mt-3 space-y-1">
          {data.has_mortgage_interest && <InfoRow label="Mortgage Interest" value={formatCurrency(data.mortgage_interest_amount)} />}
          {data.has_property_tax && <InfoRow label="Property Tax" value={formatCurrency(data.property_tax_amount)} />}
          {data.has_medical_expenses && <InfoRow label="Medical Expenses" value={formatCurrency(data.medical_expenses_amount)} />}
          {data.has_charitable_donations && <InfoRow label="Charitable Donations" value={formatCurrency(data.charitable_donations_amount)} />}
          {data.has_student_loan_interest && <InfoRow label="Student Loan Interest" value={formatCurrency(data.student_loan_interest_amount)} />}
          {data.has_educator_expenses && <InfoRow label="Educator Expenses" value={formatCurrency(data.educator_expenses_amount)} />}
          {data.has_home_office && <InfoRow label="Home Office" value={data.home_office_sqft ? `${data.home_office_sqft} sq ft` : 'Yes'} />}
          {data.has_retirement_contributions && <InfoRow label="Retirement Contributions" value={formatCurrency(data.retirement_contributions_amount)} />}
          {!data.has_mortgage_interest && !data.has_property_tax && !data.has_medical_expenses && !data.has_charitable_donations && !data.has_student_loan_interest && !data.has_educator_expenses && !data.has_home_office && !data.has_retirement_contributions && (
            <p className="text-sm text-gray-400 italic py-2">No deductions specified</p>
          )}
        </div>
        {data.additional_notes && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm font-semibold text-[#1B365D] mb-1">Additional Notes</p>
            <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">{data.additional_notes}</p>
          </div>
        )}
      </div>

      {/* Consent & Submit */}
      <div className="bg-[#18453B]/5 border border-[#18453B]/15 rounded-xl p-6 space-y-4">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => onChange({ consent_given: !data.consent_given })}
            className={`w-5 h-5 rounded border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all ${
              data.consent_given ? 'bg-[#18453B] border-[#18453B]' : 'border-gray-300 bg-white'
            }`}
          >
            {data.consent_given && (
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
          <div>
            <p className="text-sm text-[#0A1628] font-medium">
              I certify that the information provided is accurate and complete to the best of my knowledge.
            </p>
            <p className="text-xs text-gray-500 mt-1">
              I authorize SmartBooks24 Financial to use this information for the purpose of preparing my tax return. I understand that my sensitive data is encrypted and stored securely.
            </p>
          </div>
        </div>
        {errors.consent && <p className="text-red-500 text-xs">{errors.consent}</p>}

        {/* Referral Source */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">How did you hear about us? (Optional)</label>
          <select
            value={data.referral_source}
            onChange={(e) => onChange({ referral_source: e.target.value })}
            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-[#0A1628] focus:outline-none focus:border-[#18453B] focus:ring-2 focus:ring-[#18453B]/20"
          >
            <option value="">Select</option>
            <option value="google">Google Search</option>
            <option value="referral">Friend/Family Referral</option>
            <option value="social_media">Social Media</option>
            <option value="advertisement">Advertisement</option>
            <option value="returning_client">Returning Client</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t border-gray-100">
        <button
          onClick={onBack}
          disabled={isSubmitting}
          className="text-gray-600 hover:text-[#0A1628] font-semibold px-6 py-3 rounded-lg text-sm transition-colors flex items-center gap-2 border border-gray-200 hover:border-gray-300 disabled:opacity-50"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="bg-[#18453B] hover:bg-[#0D3328] text-white font-semibold px-8 py-3 rounded-lg text-sm transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Submitting...
            </>
          ) : (
            <>
              Submit Intake Form
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default StepReview;
