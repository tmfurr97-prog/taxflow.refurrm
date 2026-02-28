import React, { useState } from 'react';

interface BookingFormProps {
  selectedDate: string | null;
  selectedTime: string | null;
  serviceType: string;
  onSubmit: (formData: BookingFormData) => Promise<void>;
  isSubmitting: boolean;
}

export interface BookingFormData {
  name: string;
  email: string;
  phone: string;
  notes: string;
}

const SERVICE_INFO: Record<string, { label: string; duration: number; price: string; icon: React.ReactNode }> = {
  tax_preparation: {
    label: 'Tax Preparation',
    duration: 60,
    price: '$149+',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
      </svg>
    ),
  },
  notary_ron: {
    label: 'Notary / RON Services',
    duration: 45,
    price: '$75+',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  consultation: {
    label: 'Tax Consultation',
    duration: 30,
    price: 'Free',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
  bookkeeping: {
    label: 'Bookkeeping Review',
    duration: 45,
    price: '$99+',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
};

const BookingForm: React.FC<BookingFormProps> = ({
  selectedDate,
  selectedTime,
  serviceType,
  onSubmit,
  isSubmitting,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const service = SERVICE_INFO[serviceType];

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Invalid email address';
    const phoneDigits = phone.replace(/\D/g, '');
    if (!phoneDigits) newErrors.phone = 'Phone number is required';
    else if (phoneDigits.length < 10) newErrors.phone = 'Enter a valid 10-digit phone number';
    if (!selectedDate) newErrors.date = 'Please select a date';
    if (!selectedTime) newErrors.time = 'Please select a time';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit({ name, email, phone: phone.replace(/\D/g, ''), notes });
  };

  const dateFormatted = selectedDate
    ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  const isReady = selectedDate && selectedTime;

  return (
    <div className="space-y-6">
      {/* Appointment Summary Card */}
      <div className="bg-gradient-to-br from-[#18453B]/5 to-[#1B365D]/5 rounded-2xl border border-[#18453B]/15 p-5">
        <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <svg className="w-5 h-5 text-[#18453B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Appointment Summary
        </h4>
        <div className="space-y-2.5">
          <div className="flex items-center gap-3 text-sm">
            <span className="w-8 h-8 rounded-lg bg-[#18453B]/10 flex items-center justify-center text-[#18453B]">
              {service?.icon}
            </span>
            <div>
              <span className="font-medium text-gray-800">{service?.label}</span>
              <span className="text-gray-500 ml-2">({service?.duration} min)</span>
            </div>
            <span className="ml-auto font-semibold text-[#18453B]">{service?.price}</span>
          </div>

          {selectedDate && (
            <div className="flex items-center gap-3 text-sm">
              <span className="w-8 h-8 rounded-lg bg-[#18453B]/10 flex items-center justify-center text-[#18453B]">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </span>
              <span className="text-gray-700">{dateFormatted}</span>
            </div>
          )}

          {selectedTime && (
            <div className="flex items-center gap-3 text-sm">
              <span className="w-8 h-8 rounded-lg bg-[#18453B]/10 flex items-center justify-center text-[#18453B]">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              <span className="text-gray-700">{selectedTime}</span>
            </div>
          )}

          {(!selectedDate || !selectedTime) && (
            <p className="text-xs text-amber-600 flex items-center gap-1 mt-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              {!selectedDate ? 'Select a date from the calendar' : 'Select a time slot'}
            </p>
          )}
        </div>
      </div>

      {/* Booking Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <h4 className="font-semibold text-gray-800 flex items-center gap-2">
          <svg className="w-5 h-5 text-[#18453B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Your Information
        </h4>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            className={`w-full px-4 py-3 rounded-xl border ${errors.name ? 'border-red-400 bg-red-50/50' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-[#18453B]/20 focus:border-[#18453B] transition text-sm`}
          />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john@example.com"
            className={`w-full px-4 py-3 rounded-xl border ${errors.email ? 'border-red-400 bg-red-50/50' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-[#18453B]/20 focus:border-[#18453B] transition text-sm`}
          />
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(formatPhone(e.target.value))}
            placeholder="(555) 123-4567"
            maxLength={14}
            className={`w-full px-4 py-3 rounded-xl border ${errors.phone ? 'border-red-400 bg-red-50/50' : 'border-gray-200'} focus:outline-none focus:ring-2 focus:ring-[#18453B]/20 focus:border-[#18453B] transition text-sm`}
          />
          {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Additional Notes <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any specific questions or topics you'd like to discuss..."
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#18453B]/20 focus:border-[#18453B] transition text-sm resize-none"
          />
        </div>

        {(errors.date || errors.time) && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600 flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {errors.date || errors.time}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={!isReady || isSubmitting}
          className={`
            w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2
            ${isReady && !isSubmitting
              ? 'bg-[#18453B] hover:bg-[#0D3328] text-gray-900 shadow-lg shadow-[#18453B]/25 hover:shadow-xl hover:shadow-[#18453B]/30'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Booking...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Confirm Appointment
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default BookingForm;
