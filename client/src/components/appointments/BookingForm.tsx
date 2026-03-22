import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

interface Appointment {
  id: string;
  name: string;
  email: string;
  phone: string;
  service_type: string;
  appointment_date: string;
  appointment_time: string;
  duration_minutes: number;
  status: string;
  notes: string | null;
  booking_reference: string;
  created_at: string;
}

const SERVICE_LABELS: Record<string, string> = {
  tax_preparation: 'Tax Preparation',
  notary_ron: 'Notary / RON Services',
  consultation: 'Tax Consultation',
  bookkeeping: 'Bookkeeping Review',
};

const SERVICE_COLORS: Record<string, string> = {
  tax_preparation: 'from-blue-500 to-indigo-600',
  notary_ron: 'from-purple-500 to-violet-600',
  consultation: 'from-emerald-500 to-teal-600',
  bookkeeping: 'from-amber-500 to-orange-600',
};

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  confirmed: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Confirmed' },
  rescheduled: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Rescheduled' },
  cancelled: { bg: 'bg-red-50', text: 'text-red-600', label: 'Cancelled' },
  completed: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Completed' },
};

const BUSINESS_HOURS_START = 9;
const BUSINESS_HOURS_END = 17;

function generateTimeSlots(): string[] {
  const slots: string[] = [];
  for (let m = BUSINESS_HOURS_START * 60; m + 30 <= BUSINESS_HOURS_END * 60; m += 30) {
    const hours = Math.floor(m / 60);
    const mins = m % 60;
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    slots.push(`${displayHour}:${mins.toString().padStart(2, '0')} ${period}`);
  }
  return slots;
}

const MyAppointments: React.FC = () => {
  const navigate = useNavigate();
  const [lookupType, setLookupType] = useState<'email' | 'reference'>('email');
  const [lookupValue, setLookupValue] = useState('');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [rescheduleAppt, setRescheduleAppt] = useState<Appointment | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [rescheduling, setRescheduling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState<string | null>(null);

  const timeSlots = generateTimeSlots();

  const handleLookup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!lookupValue.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      if (lookupType === 'email') {
        const { data } = await supabase.functions.invoke('book-appointment', {
          body: { action: 'get_by_email', email: lookupValue.trim() },
        });
        setAppointments(data?.appointments || []);
      } else {
        const { data } = await supabase.functions.invoke('book-appointment', {
          body: { action: 'get_by_reference', booking_reference: lookupValue.trim().toUpperCase() },
        });
        setAppointments(data?.appointment ? [data.appointment] : []);
      }
    } catch (err) {
      console.error('Lookup error:', err);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    setCancellingId(id);
    try {
      const { data } = await supabase.functions.invoke('book-appointment', {
        body: { action: 'cancel', id },
      });
      if (data?.success) {
        setAppointments((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status: 'cancelled' } : a))
        );
      }
    } catch (err) {
      alert('Failed to cancel appointment');
    } finally {
      setCancellingId(null);
      setShowCancelConfirm(null);
    }
  };

  const handleReschedule = async () => {
    if (!rescheduleAppt || !rescheduleDate || !rescheduleTime) return;
    setRescheduling(true);
    try {
      const { data } = await supabase.functions.invoke('book-appointment', {
        body: {
          action: 'reschedule',
          id: rescheduleAppt.id,
          appointment_date: rescheduleDate,
          appointment_time: rescheduleTime,
        },
      });
      if (data?.error) {
        alert(data.error);
        return;
      }
      if (data?.success) {
        setAppointments((prev) =>
          prev.map((a) =>
            a.id === rescheduleAppt.id
              ? { ...a, appointment_date: rescheduleDate, appointment_time: rescheduleTime, status: 'rescheduled' }
              : a
          )
        );
        setRescheduleAppt(null);
        setRescheduleDate('');
        setRescheduleTime('');
      }
    } catch (err) {
      alert('Failed to reschedule appointment');
    } finally {
      setRescheduling(false);
    }
  };

  const isUpcoming = (appt: Appointment) => {
    const apptDate = new Date(appt.appointment_date + 'T23:59:59');
    return apptDate >= new Date() && (appt.status === 'confirmed' || appt.status === 'rescheduled');
  };

  const upcomingAppointments = appointments.filter(isUpcoming);
  const pastAppointments = appointments.filter((a) => !isUpcoming(a));

  // Get min date for reschedule (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

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
                onClick={() => navigate('/book-appointment')}
                className="bg-[#18453B] hover:bg-[#0D3328] text-white font-semibold px-5 py-2 rounded-lg text-sm transition-all shadow-sm"
              >
                Book New
              </button>
              <button
                onClick={() => navigate('/')}
                className="text-sm text-gray-500 hover:text-gray-700 font-medium transition"
              >
                Home
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#0A1628] mb-2">My Appointments</h1>
          <p className="text-gray-500">Look up your appointments to view, reschedule, or cancel</p>
        </div>

        {/* Lookup Form */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-8">
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => { setLookupType('email'); setLookupValue(''); setSearched(false); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                lookupType === 'email'
                  ? 'bg-[#18453B] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Search by Email
            </button>
            <button
              onClick={() => { setLookupType('reference'); setLookupValue(''); setSearched(false); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                lookupType === 'reference'
                  ? 'bg-[#18453B] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Search by Reference
            </button>
          </div>

          <form onSubmit={handleLookup} className="flex gap-3">
            <input
              type={lookupType === 'email' ? 'email' : 'text'}
              value={lookupValue}
              onChange={(e) => setLookupValue(e.target.value)}
              placeholder={lookupType === 'email' ? 'Enter your email address' : 'Enter booking reference (e.g., SB-XXXXXXXX)'}
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#18453B]/20 focus:border-[#18453B] text-sm"
            />
            <button
              type="submit"
              disabled={loading || !lookupValue.trim()}
              className="px-6 py-3 rounded-xl bg-[#18453B] hover:bg-[#0D3328] text-white font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
              Search
            </button>
          </form>
        </div>

        {/* Results */}
        {searched && !loading && (
          <>
            {appointments.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-1">No Appointments Found</h3>
                <p className="text-gray-500 text-sm mb-6">
                  We couldn't find any appointments matching your search.
                </p>
                <button
                  onClick={() => navigate('/book-appointment')}
                  className="px-6 py-3 rounded-xl bg-[#18453B] hover:bg-[#0D3328] text-white font-semibold text-sm transition-all"
                >
                  Book an Appointment
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Upcoming */}
                {upcomingAppointments.length > 0 && (
                  <div>
                    <h2 className="text-lg font-bold text-[#0A1628] mb-4 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Upcoming Appointments ({upcomingAppointments.length})
                    </h2>
                    <div className="space-y-4">
                      {upcomingAppointments.map((appt) => (
                        <AppointmentCard
                          key={appt.id}
                          appointment={appt}
                          onCancel={() => setShowCancelConfirm(appt.id)}
                          onReschedule={() => {
                            setRescheduleAppt(appt);
                            setRescheduleDate('');
                            setRescheduleTime('');
                          }}
                          isCancelling={cancellingId === appt.id}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Past */}
                {pastAppointments.length > 0 && (
                  <div>
                    <h2 className="text-lg font-bold text-gray-500 mb-4 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-gray-400" />
                      Past & Cancelled ({pastAppointments.length})
                    </h2>
                    <div className="space-y-4 opacity-75">
                      {pastAppointments.map((appt) => (
                        <AppointmentCard
                          key={appt.id}
                          appointment={appt}
                          isPast
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Initial state */}
        {!searched && !loading && (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#18453B]/10 to-[#1B365D]/10 flex items-center justify-center mx-auto mb-5">
              <svg className="w-10 h-10 text-[#18453B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[#0A1628] mb-2">Find Your Appointments</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Enter your email address or booking reference number above to view and manage your appointments.
            </p>
          </div>
        )}
      </main>

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-center text-gray-800 mb-2">Cancel Appointment?</h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              This action cannot be undone. Are you sure you want to cancel this appointment?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelConfirm(null)}
                className="flex-1 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm transition"
              >
                Keep It
              </button>
              <button
                onClick={() => handleCancel(showCancelConfirm)}
                disabled={cancellingId === showCancelConfirm}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition flex items-center justify-center gap-2"
              >
                {cancellingId === showCancelConfirm ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Yes, Cancel'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-800">Reschedule Appointment</h3>
              <button
                onClick={() => setRescheduleAppt(null)}
                className="p-1 rounded-lg hover:bg-gray-100 transition"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-5 text-sm">
              <p className="text-gray-500 mb-1">Current appointment:</p>
              <p className="font-semibold text-gray-800">
                {new Date(rescheduleAppt.appointment_date + 'T00:00:00').toLocaleDateString('en-US', {
                  weekday: 'short', month: 'long', day: 'numeric',
                })}{' '}
                at {rescheduleAppt.appointment_time}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">New Date</label>
                <input
                  type="date"
                  value={rescheduleDate}
                  min={minDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#18453B]/20 focus:border-[#18453B] text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">New Time</label>
                <select
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#18453B]/20 focus:border-[#18453B] text-sm"
                >
                  <option value="">Select a time</option>
                  {timeSlots.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setRescheduleAppt(null)}
                className="flex-1 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm transition"
              >
                Cancel
              </button>
              <button
                onClick={handleReschedule}
                disabled={!rescheduleDate || !rescheduleTime || rescheduling}
                className="flex-1 py-2.5 rounded-xl bg-[#18453B] hover:bg-[#0D3328] text-white font-semibold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {rescheduling ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Confirm Reschedule'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Appointment Card Sub-Component
interface AppointmentCardProps {
  appointment: Appointment;
  onCancel?: () => void;
  onReschedule?: () => void;
  isPast?: boolean;
  isCancelling?: boolean;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  onCancel,
  onReschedule,
  isPast,
  isCancelling,
}) => {
  const status = STATUS_STYLES[appointment.status] || STATUS_STYLES.confirmed;
  const serviceColor = SERVICE_COLORS[appointment.service_type] || 'from-gray-500 to-gray-600';

  const dateFormatted = new Date(appointment.appointment_date + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className="flex">
        {/* Color bar */}
        <div className={`w-1.5 bg-gradient-to-b ${serviceColor}`} />

        <div className="flex-1 p-5">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-bold text-gray-800">
                  {SERVICE_LABELS[appointment.service_type]}
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${status.bg} ${status.text}`}>
                  {status.label}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                <div>
                  <span className="text-gray-400 text-xs block">Date</span>
                  <span className="text-gray-700 font-medium">{dateFormatted}</span>
                </div>
                <div>
                  <span className="text-gray-400 text-xs block">Time</span>
                  <span className="text-gray-700 font-medium">{appointment.appointment_time}</span>
                </div>
                <div>
                  <span className="text-gray-400 text-xs block">Duration</span>
                  <span className="text-gray-700 font-medium">{appointment.duration_minutes} min</span>
                </div>
                <div>
                  <span className="text-gray-400 text-xs block">Reference</span>
                  <span className="text-[#18453B] font-bold text-xs tracking-wider">{appointment.booking_reference}</span>
                </div>
              </div>

              {appointment.notes && (
                <p className="text-xs text-gray-400 mt-2 italic">Note: {appointment.notes}</p>
              )}
            </div>

            {/* Actions */}
            {!isPast && (appointment.status === 'confirmed' || appointment.status === 'rescheduled') && (
              <div className="flex sm:flex-col gap-2 flex-shrink-0">
                <button
                  onClick={onReschedule}
                  className="px-4 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Reschedule
                </button>
                <button
                  onClick={onCancel}
                  disabled={isCancelling}
                  className="px-4 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyAppointments;
