import React, { useState } from 'react';
import { IntakeFormData, Dependent, FILING_STATUSES, RELATIONSHIP_TYPES } from '@/types/intake';

interface Props {
  data: IntakeFormData;
  onChange: (updates: Partial<IntakeFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const StepFilingStatus: React.FC<Props> = ({ data, onChange, onNext, onBack }) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const needsSpouseInfo = data.filing_status === 'married_jointly' || data.filing_status === 'married_separately';

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!data.filing_status) newErrors.filing_status = 'Please select a filing status';
    if (needsSpouseInfo) {
      if (!data.spouse_first_name.trim()) newErrors.spouse_first_name = 'Spouse first name is required';
      if (!data.spouse_last_name.trim()) newErrors.spouse_last_name = 'Spouse last name is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) onNext();
  };

  const addDependent = () => {
    const newDep: Dependent = {
      id: Date.now().toString(),
      first_name: '',
      last_name: '',
      date_of_birth: '',
      relationship: '',
      ssn_last_four: '',
      months_lived_with_you: 12,
    };
    onChange({ dependents: [...data.dependents, newDep] });
  };

  const updateDependent = (id: string, field: keyof Dependent, value: any) => {
    onChange({
      dependents: data.dependents.map((d) => (d.id === id ? { ...d, [field]: value } : d)),
    });
  };

  const removeDependent = (id: string) => {
    onChange({ dependents: data.dependents.filter((d) => d.id !== id) });
  };

  const inputClass = (field: string) =>
    `w-full bg-white border ${errors[field] ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-[#18453B] focus:ring-[#18453B]/20'} rounded-lg px-4 py-3 text-sm text-[#0A1628] placeholder-gray-400 focus:outline-none focus:ring-2 transition-all`;

  const labelClass = 'block text-sm font-semibold text-[#1B365D] mb-1.5';

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-[#0A1628]">Filing Status & Dependents</h2>
        <p className="text-gray-500 mt-1">Select your tax filing status and add any dependents you wish to claim.</p>
      </div>

      {/* Filing Status Selection */}
      <div>
        <label className={labelClass}>Filing Status <span className="text-red-500">*</span></label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {FILING_STATUSES.map((status) => (
            <button
              key={status.value}
              type="button"
              onClick={() => onChange({ filing_status: status.value })}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                data.filing_status === status.value
                  ? 'border-[#18453B] bg-[#18453B]/5 ring-2 ring-[#18453B]/20'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    data.filing_status === status.value ? 'border-[#18453B]' : 'border-gray-300'
                  }`}
                >
                  {data.filing_status === status.value && (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#18453B]" />
                  )}
                </div>
                <span className={`text-sm font-medium ${data.filing_status === status.value ? 'text-[#0A1628]' : 'text-gray-600'}`}>
                  {status.label}
                </span>
              </div>
            </button>
          ))}
        </div>
        {errors.filing_status && <p className="text-red-500 text-xs mt-2">{errors.filing_status}</p>}
      </div>

      {/* Spouse Information */}
      {needsSpouseInfo && (
        <div className="bg-gray-50 rounded-xl p-6 space-y-5 border border-gray-100">
          <h3 className="text-lg font-bold text-[#0A1628] flex items-center gap-2">
            <svg className="w-5 h-5 text-[#18453B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Spouse Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Spouse First Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={data.spouse_first_name}
                onChange={(e) => onChange({ spouse_first_name: e.target.value })}
                placeholder="Jane"
                className={inputClass('spouse_first_name')}
              />
              {errors.spouse_first_name && <p className="text-red-500 text-xs mt-1">{errors.spouse_first_name}</p>}
            </div>
            <div>
              <label className={labelClass}>Spouse Last Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={data.spouse_last_name}
                onChange={(e) => onChange({ spouse_last_name: e.target.value })}
                placeholder="Doe"
                className={inputClass('spouse_last_name')}
              />
              {errors.spouse_last_name && <p className="text-red-500 text-xs mt-1">{errors.spouse_last_name}</p>}
            </div>
            <div>
              <label className={labelClass}>Spouse SSN</label>
              <input
                type="password"
                value={data.spouse_ssn}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, '').slice(0, 9);
                  let formatted = digits;
                  if (digits.length > 3) formatted = `${digits.slice(0, 3)}-${digits.slice(3)}`;
                  if (digits.length > 5) formatted = `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
                  onChange({ spouse_ssn: formatted });
                }}
                placeholder="XXX-XX-XXXX"
                maxLength={11}
                className={inputClass('spouse_ssn')}
              />
            </div>
            <div>
              <label className={labelClass}>Spouse Date of Birth</label>
              <input
                type="date"
                value={data.spouse_dob}
                onChange={(e) => onChange({ spouse_dob: e.target.value })}
                className={inputClass('spouse_dob')}
              />
            </div>
          </div>
        </div>
      )}

      {/* Dependents */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-[#0A1628]">Dependents</h3>
            <p className="text-sm text-gray-500">Add any dependents you plan to claim on your return.</p>
          </div>
          <button
            type="button"
            onClick={addDependent}
            className="bg-[#18453B] hover:bg-[#0D3328] text-gray-900 font-semibold px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Dependent
          </button>
        </div>

        {data.dependents.length === 0 && (
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
            <svg className="w-10 h-10 text-gray-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-sm text-gray-400">No dependents added yet</p>
            <p className="text-xs text-gray-300 mt-1">Click "Add Dependent" to get started</p>
          </div>
        )}

        <div className="space-y-4">
          {data.dependents.map((dep, index) => (
            <div key={dep.id} className="bg-white border border-gray-200 rounded-xl p-5 relative">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-[#1B365D]">Dependent #{index + 1}</h4>
                <button
                  type="button"
                  onClick={() => removeDependent(dep.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors p-1"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">First Name</label>
                  <input
                    type="text"
                    value={dep.first_name}
                    onChange={(e) => updateDependent(dep.id, 'first_name', e.target.value)}
                    placeholder="First name"
                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-[#0A1628] placeholder-gray-400 focus:outline-none focus:border-[#18453B] focus:ring-2 focus:ring-[#18453B]/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={dep.last_name}
                    onChange={(e) => updateDependent(dep.id, 'last_name', e.target.value)}
                    placeholder="Last name"
                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-[#0A1628] placeholder-gray-400 focus:outline-none focus:border-[#18453B] focus:ring-2 focus:ring-[#18453B]/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Relationship</label>
                  <select
                    value={dep.relationship}
                    onChange={(e) => updateDependent(dep.id, 'relationship', e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-[#0A1628] focus:outline-none focus:border-[#18453B] focus:ring-2 focus:ring-[#18453B]/20"
                  >
                    <option value="">Select</option>
                    {RELATIONSHIP_TYPES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={dep.date_of_birth}
                    onChange={(e) => updateDependent(dep.id, 'date_of_birth', e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-[#0A1628] focus:outline-none focus:border-[#18453B] focus:ring-2 focus:ring-[#18453B]/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">SSN (Last 4)</label>
                  <input
                    type="text"
                    value={dep.ssn_last_four}
                    onChange={(e) => updateDependent(dep.id, 'ssn_last_four', e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="1234"
                    maxLength={4}
                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-[#0A1628] placeholder-gray-400 focus:outline-none focus:border-[#18453B] focus:ring-2 focus:ring-[#18453B]/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Months Lived With You</label>
                  <input
                    type="number"
                    min={0}
                    max={12}
                    value={dep.months_lived_with_you}
                    onChange={(e) => updateDependent(dep.id, 'months_lived_with_you', parseInt(e.target.value) || 0)}
                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-[#0A1628] focus:outline-none focus:border-[#18453B] focus:ring-2 focus:ring-[#18453B]/20"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t border-gray-100">
        <button
          onClick={onBack}
          className="text-gray-600 hover:text-[#0A1628] font-semibold px-6 py-3 rounded-lg text-sm transition-colors flex items-center gap-2 border border-gray-200 hover:border-gray-300"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>
        <button
          onClick={handleNext}
          className="bg-[#18453B] hover:bg-[#0D3328] text-gray-900 font-semibold px-8 py-3 rounded-lg text-sm transition-colors flex items-center gap-2"
        >
          Continue
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default StepFilingStatus;
