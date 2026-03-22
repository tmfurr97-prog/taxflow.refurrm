import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import AppointmentCalendar from '@/components/appointments/AppointmentCalendar';
import BookingForm, { BookingFormData } from '@/components/appointments/BookingForm';

const SERVICE_TYPES = [
  {
    id: 'consultation',
    label: 'Tax Consultation',
    duration: '30 min',
    price: 'Free',
    description: 'Get expert advice on your tax situation, deductions, and filing strategy.',
    color: 'from-emerald-500 to-teal-600',
    bgLight: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
  {
    id: 'tax_preparation',
    label: 'Tax Preparation',
    duration: '60 min',
    price: '$149+',
    description: 'Full tax preparation service including federal and state returns.',
    color: 'from-blue-500 to-indigo-600',
    bgLight: 'bg-blue-50',
    borderColor: 'border-blue-200',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
      </svg>
    ),
  },
  {
    id: 'notary_ron',
    label: 'Notary / RON',
    duration: '45 min',
    price: '$75+',
    description: 'Remote Online Notarization and traditional notary services.',
    color: 'from-purple-500 to-violet-600',
    bgLight: 'bg-purple-50',
    borderColor: 'border-purple-200',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    id: 'bookkeeping',
    label: 'Bookkeeping Review',
    duration: '45 min',
    price: '$99+',
    description: 'Review and organize your financial records for accurate reporting.',
    color: 'from-amber-500 to-orange-600',
    bgLight: 'bg-amber-50',
    borderColor: 'border-amber-200',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
];

const BookAppointment: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'service' | 'schedule' | 'success'>('service');
  const [serviceType, setServiceType] = useState('consultation');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingResult, setBookingResult] = useState<any>(null);

  const handleServiceSelect = (id: string) => {
    setServiceType(id);
    setSelectedDate(null);
    setSelectedTime(null);
    setStep('schedule');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBooking = async (formData: BookingFormData) => {
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('book-appointment', {
        body: {
          action: 'book',
          ...formData,
          service_type: serviceType,
          appointment_date: selectedDate,
          appointment_time: selectedTime,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setBookingResult(data);
      setStep('success');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      alert(err.message || 'Failed to book appointment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedService = SERVICE_TYPES.find((s) => s.id === serviceType);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-9 h-9 rounded-lg bg-[#18453B] flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <span className="text-[#0A1628] font-bold text-base">SmartBooks24</span>
                <span className="text-[#18453B] text-[10px] block -mt-0.5 font-medium tracking-widest uppercase">by ReFurrm</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/my-appointments')}
                className="text-sm text-gray-600 hover:text-[#18453B] font-medium transition flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                My Appointments
              </button>
              <button
                onClick={() => navigate('/')}
                className="text-sm text-gray-500 hover:text-gray-700 font-medium transition"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-2">
            {['Select Service', 'Schedule & Book', 'Confirmation'].map((label, i) => {
              const stepIndex = i;
              const currentIndex = step === 'service' ? 0 : step === 'schedule' ? 1 : 2;
              const isActive = stepIndex === currentIndex;
              const isComplete = stepIndex < currentIndex;

              return (
                <React.Fragment key={label}>
                  {i > 0 && (
                    <div className={`w-8 sm:w-16 h-0.5 ${isComplete ? 'bg-[#18453B]' : 'bg-gray-200'}`} />
                  )}
                  <div className="flex items-center gap-2">
                    <div
                      className={`
                        w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
                        ${isComplete
                          ? 'bg-[#18453B] text-white'
                          : isActive
                            ? 'bg-[#18453B] text-white shadow-lg shadow-[#18453B]/25'
                            : 'bg-gray-200 text-gray-400'
                        }
                      `}
                    >
                      {isComplete ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        stepIndex + 1
                      )}
                    </div>
                    <span className={`text-sm font-medium hidden sm:block ${isActive ? 'text-[#18453B]' : isComplete ? 'text-gray-600' : 'text-gray-400'}`}>
                      {label}
                    </span>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* STEP 1: Service Selection */}
        {step === 'service' && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h1 className="text-3xl lg:text-4xl font-bold text-[#0A1628] mb-3">
                Book an Appointment
              </h1>
              <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                Choose the service that best fits your needs. Our professionals are ready to help.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {SERVICE_TYPES.map((service) => (
                <button
                  key={service.id}
                  onClick={() => handleServiceSelect(service.id)}
                  className="group text-left bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-xl hover:shadow-gray-200/50 hover:border-[#18453B]/30 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center text-white shadow-lg`}>
                      {service.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-bold text-gray-800 group-hover:text-[#18453B] transition-colors">
                          {service.label}
                        </h3>
                        <span className="text-[#18453B] font-bold text-sm">{service.price}</span>
                      </div>
                      <p className="text-sm text-gray-500 mb-3">{service.description}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {service.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Virtual or In-Person
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-end text-[#18453B] text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                    Select & Continue
                    <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: Schedule & Book */}
        {step === 'schedule' && (
          <div>
            <div className="flex items-center gap-3 mb-8">
              <button
                onClick={() => setStep('service')}
                className="text-gray-400 hover:text-gray-600 transition p-1"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h2 className="text-2xl font-bold text-[#0A1628]">
                  Schedule Your {selectedService?.label}
                </h2>
                <p className="text-gray-500 text-sm mt-0.5">
                  Pick a date and time, then fill in your details
                </p>
              </div>
            </div>

            <div className="grid lg:grid-cols-5 gap-8">
              {/* Calendar - 3 cols */}
              <div className="lg:col-span-3">
                <AppointmentCalendar
                  selectedDate={selectedDate}
                  selectedTime={selectedTime}
                  serviceType={serviceType}
                  onSelectDate={setSelectedDate}
                  onSelectTime={(t) => setSelectedTime(t || null)}
                />
              </div>

              {/* Booking Form - 2 cols */}
              <div className="lg:col-span-2">
                <BookingForm
                  selectedDate={selectedDate}
                  selectedTime={selectedTime}
                  serviceType={serviceType}
                  onSubmit={handleBooking}
                  isSubmitting={isSubmitting}
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Success */}
        {step === 'success' && bookingResult && (
          <div className="max-w-lg mx-auto text-center">
            <div className="bg-white rounded-3xl border border-gray-200 shadow-xl shadow-gray-200/50 p-8 lg:p-10">
              {/* Success Icon */}
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-[#18453B] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-200">
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <h2 className="text-2xl font-bold text-[#0A1628] mb-2">Appointment Confirmed!</h2>
              <p className="text-gray-500 mb-6">
                {bookingResult.email_sent
                  ? 'A confirmation email has been sent to your inbox.'
                  : 'Your appointment has been booked successfully.'}
              </p>

              {/* Booking Details Card */}
              <div className="bg-gradient-to-br from-[#18453B]/5 to-[#1B365D]/5 rounded-2xl p-5 text-left mb-6 border border-[#18453B]/10">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Reference</span>
                    <span className="font-bold text-[#18453B] tracking-wider">
                      {bookingResult.appointment?.booking_reference}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Service</span>
                    <span className="font-medium text-gray-800">{selectedService?.label}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Date</span>
                    <span className="font-medium text-gray-800">
                      {bookingResult.appointment?.appointment_date &&
                        new Date(bookingResult.appointment.appointment_date + 'T00:00:00').toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Time</span>
                    <span className="font-medium text-gray-800">
                      {bookingResult.appointment?.appointment_time}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Duration</span>
                    <span className="font-medium text-gray-800">
                      {bookingResult.appointment?.duration_minutes} minutes
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-400 mb-6">
                Save your booking reference to manage your appointment later.
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => navigate('/my-appointments')}
                  className="w-full py-3 rounded-xl bg-[#18453B] hover:bg-[#0D3328] text-white font-semibold text-sm transition-all shadow-lg shadow-[#18453B]/20"
                >
                  View My Appointments
                </button>
                <button
                  onClick={() => {
                    setStep('service');
                    setSelectedDate(null);
                    setSelectedTime(null);
                    setBookingResult(null);
                  }}
                  className="w-full py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm transition-all"
                >
                  Book Another Appointment
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="w-full py-2.5 text-gray-500 hover:text-gray-700 text-sm font-medium transition"
                >
                  Return to Home
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default BookAppointment;
