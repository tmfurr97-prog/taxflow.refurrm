import React, { useState } from 'react';
import { IntakeFormData, US_STATES } from '@/types/intake';

interface Props {
  data: IntakeFormData;
  onChange: (updates: Partial<IntakeFormData>) => void;
  onNext: () => void;
}

const StepPersonalInfo: React.FC<Props> = ({ data, onChange, onNext }) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const formatSSN = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 9);
    if (digits.length <= 3) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
  };

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 10);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!data.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!data.last_name.trim()) newErrors.last_name = 'Last name is required';
    if (!data.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) newErrors.email = 'Invalid email format';
    if (!data.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (data.phone.replace(/\D/g, '').length < 10) newErrors.phone = 'Phone must be 10 digits';
    if (!data.ssn.trim()) newErrors.ssn = 'SSN is required';
    else if (data.ssn.replace(/\D/g, '').length !== 9) newErrors.ssn = 'SSN must be 9 digits';
    if (!data.date_of_birth) newErrors.date_of_birth = 'Date of birth is required';
    if (!data.street_address.trim()) newErrors.street_address = 'Street address is required';
    if (!data.city.trim()) newErrors.city = 'City is required';
    if (!data.state) newErrors.state = 'State is required';
    if (!data.zip_code.trim()) newErrors.zip_code = 'ZIP code is required';
    else if (!/^\d{5}(-\d{4})?$/.test(data.zip_code)) newErrors.zip_code = 'Invalid ZIP code';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) onNext();
  };

  const inputClass = (field: string) =>
    `w-full bg-white border ${errors[field] ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-[#18453B] focus:ring-[#18453B]/20'} rounded-lg px-4 py-3 text-sm text-[#0A1628] placeholder-gray-400 focus:outline-none focus:ring-2 transition-all`;

  const labelClass = "block text-sm font-semibold text-[#1B365D] mb-1.5";

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-[#0A1628]">Personal Information</h2>
        <p className="text-gray-500 mt-1">Please provide your personal details exactly as they appear on your tax documents.</p>
      </div>

      {/* Security Notice */}
      <div className="bg-[#18453B]/5 border border-[#18453B]/15 rounded-xl p-4 flex items-start gap-3">
        <svg className="w-5 h-5 text-[#18453B] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <div>
          <p className="text-sm font-semibold text-[#18453B]">Your information is secure</p>
          <p className="text-xs text-gray-600 mt-0.5">All sensitive data is encrypted in transit and at rest. Your SSN is masked and stored securely.</p>
        </div>
      </div>

      {/* Name Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className={labelClass}>First Name <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={data.first_name}
            onChange={(e) => onChange({ first_name: e.target.value })}
            placeholder="John"
            className={inputClass('first_name')}
          />
          {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>}
        </div>
        <div>
          <label className={labelClass}>Last Name <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={data.last_name}
            onChange={(e) => onChange({ last_name: e.target.value })}
            placeholder="Doe"
            className={inputClass('last_name')}
          />
          {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>}
        </div>
      </div>

      {/* Contact Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className={labelClass}>Email Address <span className="text-red-500">*</span></label>
          <input
            type="email"
            value={data.email}
            onChange={(e) => onChange({ email: e.target.value })}
            placeholder="john.doe@email.com"
            className={inputClass('email')}
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>
        <div>
          <label className={labelClass}>Phone Number <span className="text-red-500">*</span></label>
          <input
            type="tel"
            value={data.phone}
            onChange={(e) => onChange({ phone: formatPhone(e.target.value) })}
            placeholder="(555) 123-4567"
            className={inputClass('phone')}
          />
          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
        </div>
      </div>

      {/* SSN & DOB */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className={labelClass}>Social Security Number <span className="text-red-500">*</span></label>
          <div className="relative">
            <input
              type="password"
              value={data.ssn}
              onChange={(e) => onChange({ ssn: formatSSN(e.target.value) })}
              placeholder="XXX-XX-XXXX"
              maxLength={11}
              className={inputClass('ssn')}
            />
            <svg className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          {errors.ssn && <p className="text-red-500 text-xs mt-1">{errors.ssn}</p>}
        </div>
        <div>
          <label className={labelClass}>Date of Birth <span className="text-red-500">*</span></label>
          <input
            type="date"
            value={data.date_of_birth}
            onChange={(e) => onChange({ date_of_birth: e.target.value })}
            className={inputClass('date_of_birth')}
          />
          {errors.date_of_birth && <p className="text-red-500 text-xs mt-1">{errors.date_of_birth}</p>}
        </div>
      </div>

      {/* Address */}
      <div>
        <label className={labelClass}>Street Address <span className="text-red-500">*</span></label>
        <input
          type="text"
          value={data.street_address}
          onChange={(e) => onChange({ street_address: e.target.value })}
          placeholder="123 Main Street, Apt 4B"
          className={inputClass('street_address')}
        />
        {errors.street_address && <p className="text-red-500 text-xs mt-1">{errors.street_address}</p>}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <div className="col-span-2 md:col-span-2">
          <label className={labelClass}>City <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={data.city}
            onChange={(e) => onChange({ city: e.target.value })}
            placeholder="New York"
            className={inputClass('city')}
          />
          {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
        </div>
        <div>
          <label className={labelClass}>State <span className="text-red-500">*</span></label>
          <select
            value={data.state}
            onChange={(e) => onChange({ state: e.target.value })}
            className={inputClass('state')}
          >
            <option value="">Select</option>
            {US_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
        </div>
        <div>
          <label className={labelClass}>ZIP Code <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={data.zip_code}
            onChange={(e) => onChange({ zip_code: e.target.value.replace(/[^\d-]/g, '').slice(0, 10) })}
            placeholder="10001"
            className={inputClass('zip_code')}
          />
          {errors.zip_code && <p className="text-red-500 text-xs mt-1">{errors.zip_code}</p>}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-end pt-4 border-t border-gray-100">
        <button
          onClick={handleNext}
          className="bg-[#18453B] hover:bg-[#0D3328] text-white font-semibold px-8 py-3 rounded-lg text-sm transition-colors flex items-center gap-2"
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

export default StepPersonalInfo;
