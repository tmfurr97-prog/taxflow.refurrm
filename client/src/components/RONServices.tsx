import React, { useState } from 'react';

const ronServices = [
  { id: 'affidavit', title: 'Tax Affidavits', desc: 'Sworn statements for IRS compliance and tax-related legal matters.', price: '$35', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { id: 'poa', title: 'IRS Power of Attorney', desc: 'Authorize representation before the IRS with Form 2848 notarization.', price: '$45', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
  { id: 'deed', title: 'Property Deeds', desc: 'Remote notarization for real estate transfers and property documents.', price: '$50', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { id: 'general', title: 'General Notary', desc: 'Any document that needs notarization — fast, professional, remote.', price: '$25', icon: 'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z' },
];

const timeSlots = ['9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'];

const RONServices: React.FC = () => {
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [showBooking, setShowBooking] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [bookingForm, setBookingForm] = useState({ name: '', email: '', phone: '' });
  const [booked, setBooked] = useState(false);

  const handleBook = (e: React.FormEvent) => { e.preventDefault(); setBooked(true); };

  const getNextDays = () => {
    const days = [];
    for (let i = 1; i <= 7; i++) { const d = new Date(); d.setDate(d.getDate() + i); days.push({ date: d.toISOString().split('T')[0], label: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) }); }
    return days;
  };

  const inputClass = "w-full bg-[#F9FAFB] border border-gray-200 rounded-lg px-4 py-3 text-[#0A1628] placeholder-gray-400 focus:outline-none focus:border-[#18453B] focus:ring-1 focus:ring-[#18453B]/30 text-sm";

  return (
    <section id="notary" className="py-24 lg:py-32 bg-[#F7F9FA] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16">
          <span className="text-[#1B365D] text-xs font-semibold uppercase tracking-[0.3em] block mb-3">Remote Online Notarization</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0A1628] mb-4">RON & <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#18453B] to-[#1B365D]">NOTARY SERVICES</span></h2>
          <p className="text-[#6B7280] max-w-2xl mx-auto text-lg">Get documents notarized from anywhere via secure video call. Tax-related and general notarization available.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {ronServices.map((svc) => (
            <div key={svc.id} onClick={() => { setSelectedService(svc.id); setShowBooking(true); setBooked(false); }}
              className={`cursor-pointer bg-white border rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${selectedService === svc.id ? 'border-[#18453B]/30 shadow-lg shadow-[#18453B]/5' : 'border-gray-200 hover:border-gray-300'}`}>
              <div className="w-12 h-12 rounded-xl bg-[#1B365D]/5 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[#1B365D]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d={svc.icon} /></svg>
              </div>
              <h3 className="text-[#0A1628] font-bold text-lg mb-2">{svc.title}</h3>
              <p className="text-[#6B7280] text-sm mb-4 leading-relaxed">{svc.desc}</p>
              <div className="flex items-center justify-between">
                <span className="text-[#18453B] font-bold">{svc.price}</span>
                <span className="text-[#1B365D] text-xs font-medium">Schedule a Session</span>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-12">
          <h3 className="text-[#0A1628] font-bold text-lg mb-6 text-center">How Remote Notarization Works</h3>
          <div className="grid sm:grid-cols-3 gap-8">
            {[{ step: '01', title: 'Schedule a Session', desc: 'Select your service and pick a time that works for you.' }, { step: '02', title: 'Join Video Call', desc: 'Connect via secure video with a certified notary public.' }, { step: '03', title: 'Sign & Receive', desc: 'E-sign your documents and receive notarized copies promptly.' }].map((s, i) => (
              <div key={i} className="text-center">
                <div className="w-10 h-10 rounded-full bg-[#18453B] flex items-center justify-center mx-auto mb-3 text-white font-bold text-sm">{s.step}</div>
                <h4 className="text-[#0A1628] font-bold text-sm mb-1">{s.title}</h4>
                <p className="text-[#6B7280] text-xs">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {showBooking && selectedService && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowBooking(false)} />
            <div className="relative bg-white border border-gray-200 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="bg-[#F7F9FA] px-6 py-4 flex items-center justify-between border-b border-gray-200">
                <h3 className="text-[#0A1628] font-bold">Schedule a Session — {ronServices.find(s => s.id === selectedService)?.title}</h3>
                <button onClick={() => setShowBooking(false)} className="text-gray-400 hover:text-[#0A1628]"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
              </div>

              {booked ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-[#18453B] flex items-center justify-center mx-auto mb-4"><svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg></div>
                  <h4 className="text-[#0A1628] text-xl font-bold mb-2">Session Scheduled!</h4>
                  <p className="text-[#6B7280] text-sm mb-4">Check your email for the video call link and instructions.</p>
                  <button onClick={() => setShowBooking(false)} className="bg-[#18453B] hover:bg-[#0D3328] text-white font-semibold px-8 py-3 rounded-lg text-sm">Done</button>
                </div>
              ) : (
                <form onSubmit={handleBook} className="p-6 space-y-5">
                  <div>
                    <span className="text-[#4A5568] text-xs uppercase tracking-wider font-medium block mb-2">Select Date</span>
                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                      {getNextDays().map((day) => (<button key={day.date} type="button" onClick={() => setSelectedDate(day.date)} className={`p-2 rounded-lg text-xs text-center transition-all ${selectedDate === day.date ? 'bg-[#18453B] text-white' : 'bg-[#F9FAFB] text-[#6B7280] hover:bg-gray-100 border border-gray-200'}`}>{day.label}</button>))}
                    </div>
                  </div>
                  {selectedDate && (
                    <div>
                      <span className="text-[#4A5568] text-xs uppercase tracking-wider font-medium block mb-2">Select Time</span>
                      <div className="grid grid-cols-4 gap-2">
                        {timeSlots.map((time) => (<button key={time} type="button" onClick={() => setSelectedTime(time)} className={`py-2 rounded-lg text-xs transition-all ${selectedTime === time ? 'bg-[#1B365D] text-white' : 'bg-[#F9FAFB] text-[#6B7280] hover:bg-gray-100 border border-gray-200'}`}>{time}</button>))}
                      </div>
                    </div>
                  )}
                  <div className="space-y-3">
                    <input type="text" required value={bookingForm.name} onChange={(e) => setBookingForm({ ...bookingForm, name: e.target.value })} placeholder="Full Name" className={inputClass} />
                    <input type="email" required value={bookingForm.email} onChange={(e) => setBookingForm({ ...bookingForm, email: e.target.value })} placeholder="Email Address" className={inputClass} />
                    <input type="tel" value={bookingForm.phone} onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })} placeholder="Phone (optional)" className={inputClass} />
                  </div>
                  <button type="submit" disabled={!selectedDate || !selectedTime} className="w-full bg-[#18453B] hover:bg-[#0D3328] disabled:opacity-40 text-white font-semibold py-3.5 rounded-lg text-sm uppercase tracking-wider shadow-sm">
                    Confirm Session — {ronServices.find(s => s.id === selectedService)?.price}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default RONServices;
