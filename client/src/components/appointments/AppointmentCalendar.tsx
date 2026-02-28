import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';

interface AppointmentCalendarProps {
  selectedDate: string | null;
  selectedTime: string | null;
  serviceType: string;
  onSelectDate: (date: string) => void;
  onSelectTime: (time: string) => void;
}

const SERVICE_DURATIONS: Record<string, number> = {
  tax_preparation: 60,
  notary_ron: 45,
  consultation: 30,
  bookkeeping: 45,
};

const BUSINESS_HOURS = {
  start: 9, // 9 AM
  end: 17,  // 5 PM
};

function generateTimeSlots(serviceDuration: number): string[] {
  const slots: string[] = [];
  const startMinutes = BUSINESS_HOURS.start * 60;
  const endMinutes = BUSINESS_HOURS.end * 60;

  for (let m = startMinutes; m + serviceDuration <= endMinutes; m += 30) {
    const hours = Math.floor(m / 60);
    const mins = m % 60;
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    slots.push(`${displayHour}:${mins.toString().padStart(2, '0')} ${period}`);
  }
  return slots;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const AppointmentCalendar: React.FC<AppointmentCalendarProps> = ({
  selectedDate,
  selectedTime,
  serviceType,
  onSelectDate,
  onSelectTime,
}) => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [bookedSlots, setBookedSlots] = useState<{ appointment_time: string; duration_minutes: number }[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const duration = SERVICE_DURATIONS[serviceType] || 30;
  const allTimeSlots = useMemo(() => generateTimeSlots(duration), [duration]);

  // Fetch booked slots when date changes
  useEffect(() => {
    if (!selectedDate) {
      setBookedSlots([]);
      return;
    }

    const fetchSlots = async () => {
      setLoadingSlots(true);
      try {
        const { data } = await supabase.functions.invoke('book-appointment', {
          body: { action: 'get_booked_slots', date: selectedDate },
        });
        setBookedSlots(data?.booked_slots || []);
      } catch (err) {
        console.error('Failed to fetch booked slots:', err);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [selectedDate]);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const goToPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const isDateDisabled = (day: number): boolean => {
    const date = new Date(currentYear, currentMonth, day);
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    // Disable past dates
    if (date < todayStart) return true;
    // Disable weekends (Saturday=6, Sunday=0)
    const dow = date.getDay();
    if (dow === 0 || dow === 6) return true;
    return false;
  };

  const formatDateStr = (day: number): string => {
    const m = (currentMonth + 1).toString().padStart(2, '0');
    const d = day.toString().padStart(2, '0');
    return `${currentYear}-${m}-${d}`;
  };

  const isToday = (day: number): boolean => {
    return (
      day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()
    );
  };

  const isSlotBooked = (time: string): boolean => {
    return bookedSlots.some((s) => s.appointment_time === time);
  };

  // Check if we can go to previous month (don't go before current month)
  const canGoPrev = currentYear > today.getFullYear() || (currentYear === today.getFullYear() && currentMonth > today.getMonth());

  // Calendar grid cells
  const calendarCells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d);

  return (
    <div className="space-y-6">
      {/* Calendar */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Month Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-[#18453B] to-[#1B365D]">
          <button
            onClick={goToPrevMonth}
            disabled={!canGoPrev}
            className="p-1.5 rounded-lg text-gray-900/80 hover:text-gray-900 hover:bg-white/10 transition disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h3 className="text-gray-900 font-semibold text-lg">
            {MONTH_NAMES[currentMonth]} {currentYear}
          </h3>
          <button
            onClick={goToNextMonth}
            className="p-1.5 rounded-lg text-gray-900/80 hover:text-gray-900 hover:bg-white/10 transition"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Day Names */}
        <div className="grid grid-cols-7 border-b border-gray-100">
          {DAY_NAMES.map((d) => (
            <div key={d} className="text-center text-xs font-semibold text-gray-400 uppercase tracking-wider py-3">
              {d}
            </div>
          ))}
        </div>

        {/* Day Grid */}
        <div className="grid grid-cols-7 gap-px bg-gray-50 p-2">
          {calendarCells.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-${idx}`} className="h-11" />;
            }

            const dateStr = formatDateStr(day);
            const disabled = isDateDisabled(day);
            const selected = selectedDate === dateStr;
            const todayMark = isToday(day);

            return (
              <button
                key={day}
                disabled={disabled}
                onClick={() => {
                  onSelectDate(dateStr);
                  onSelectTime('');
                }}
                className={`
                  h-11 rounded-xl text-sm font-medium transition-all duration-200 relative
                  ${disabled
                    ? 'text-gray-300 cursor-not-allowed'
                    : selected
                      ? 'bg-[#18453B] text-gray-900 shadow-md shadow-[#18453B]/25 scale-105'
                      : 'text-gray-700 hover:bg-[#18453B]/10 hover:text-[#18453B]'
                  }
                `}
              >
                {day}
                {todayMark && !selected && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#18453B]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Time Slots */}
      {selectedDate && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-[#18453B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h4 className="font-semibold text-gray-800">
              Available Times for{' '}
              {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </h4>
          </div>

          {loadingSlots ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-[#18453B] border-t-transparent rounded-full animate-spin" />
              <span className="ml-2 text-sm text-gray-500">Loading available times...</span>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {allTimeSlots.map((time) => {
                const booked = isSlotBooked(time);
                const selected = selectedTime === time;

                return (
                  <button
                    key={time}
                    disabled={booked}
                    onClick={() => onSelectTime(time)}
                    className={`
                      py-2.5 px-3 rounded-xl text-sm font-medium transition-all duration-200 border
                      ${booked
                        ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed line-through'
                        : selected
                          ? 'bg-[#18453B] text-gray-900 border-[#18453B] shadow-md shadow-[#18453B]/20'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-[#18453B] hover:text-[#18453B]'
                      }
                    `}
                  >
                    {time}
                  </button>
                );
              })}
            </div>
          )}

          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className="w-3 h-3 rounded bg-white border border-gray-200" />
              Available
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className="w-3 h-3 rounded bg-[#18453B]" />
              Selected
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className="w-3 h-3 rounded bg-gray-100 border border-gray-100" />
              Booked
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentCalendar;
