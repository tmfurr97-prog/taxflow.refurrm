import React, { useState } from 'react';

const SERVICE_IMAGES = [
  'https://d64gsuwffb70l.cloudfront.net/699dd529e5df43ffb2a8ca6a_1771951549726_2d315703.jpg',
  'https://d64gsuwffb70l.cloudfront.net/699dd529e5df43ffb2a8ca6a_1771951550938_8d29f104.jpg',
  'https://d64gsuwffb70l.cloudfront.net/699dd529e5df43ffb2a8ca6a_1771951547766_794cc75d.jpg',
  'https://d64gsuwffb70l.cloudfront.net/699dd529e5df43ffb2a8ca6a_1771951554700_5b8ea3df.jpg',
  'https://d64gsuwffb70l.cloudfront.net/699dd529e5df43ffb2a8ca6a_1771951551850_9c6a075a.jpg',
  'https://d64gsuwffb70l.cloudfront.net/699dd529e5df43ffb2a8ca6a_1771951551672_3898ad91.jpg',
];

const services = [
  { title: 'Bookkeeping', desc: 'Year-round financial tracking with AI-powered categorization. Stay organized, stay ahead.', price: 'From $149/mo',
    icon: (<svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>),
    color: '#18453B', features: ['Monthly reconciliation', 'Expense categorization', 'Financial reports', 'Payroll integration'] },
  { title: 'Corporate Tax Prep', desc: 'S-Corp, C-Corp, LLC, Partnership — we handle the complexity so you can focus on growth.', price: 'From $499',
    icon: (<svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>),
    color: '#1B365D', features: ['Multi-state filing', 'Quarterly estimates', 'Tax planning strategy', 'Audit protection'] },
  { title: 'IRS Resolution', desc: 'Liens, levies, back taxes — we advocate on your behalf with the IRS. Professional defense guaranteed.', price: 'From $999',
    icon: (<svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>),
    color: '#18453B', features: ['Offer in Compromise', 'Installment agreements', 'Penalty abatement', 'Wage garnishment relief'] },
  { title: 'RON Services', desc: 'Remote Online Notarization for tax documents, affidavits, and more — from anywhere.', price: 'From $25/doc',
    icon: (<svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>),
    color: '#1B365D', features: ['Tax affidavits', 'IRS Power of Attorney', 'Property deeds', 'General notary'] },
  { title: 'General Notary', desc: 'Need a notary for non-tax documents? We provide fast, professional service.', price: 'From $15/doc',
    icon: (<svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>),
    color: '#18453B', features: ['Same-day service', 'Video call notarization', 'Multi-state certified', 'Digital seal & stamp'] },
  { title: 'Remote Returns', desc: 'Secure digital filing with your choice of AI-speed or personalized human-led review.', price: 'From $199',
    icon: (<svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>),
    color: '#18453B', features: ['Secure document vault', 'AI categorization (Optional)', 'Personalized human-led filing', 'Professional e-file included'] },
];


const ServiceGrid: React.FC = () => {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  return (
    <section id="services" className="py-24 lg:py-32 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16">
          <span className="text-[#18453B] text-xs font-semibold uppercase tracking-[0.3em] block mb-3">What We Do</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0A1628] mb-4">
            PROFESSIONAL <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#18453B] to-[#1B365D]">SERVICES</span>
          </h2>
          <p className="text-[#6B7280] max-w-2xl mx-auto text-lg">
            From bookkeeping to IRS advocacy, we deliver professional-grade financial services with precision and care.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, idx) => (
            <div key={idx} onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
              className="group cursor-pointer bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-gray-300 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-gray-200/50">
              <div className="relative h-40 overflow-hidden">
                <img src={SERVICE_IMAGES[idx]} alt={service.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-white/50 to-transparent" />
                <div className="absolute bottom-4 left-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${service.color}10`, color: service.color }}>
                    {service.icon}
                  </div>
                  <span className="text-[#0A1628] font-bold text-lg">{service.title}</span>
                </div>
              </div>
              <div className="p-5">
                <p className="text-[#6B7280] text-sm leading-relaxed mb-4">{service.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm" style={{ color: service.color }}>{service.price}</span>
                  <span className="text-[#9CA3AF] text-xs uppercase tracking-wider group-hover:text-[#6B7280] transition-colors flex items-center gap-1">
                    Details
                    <svg className={`w-3 h-3 transition-transform duration-300 ${expandedIdx === idx ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </div>
                <div className={`overflow-hidden transition-all duration-500 ${expandedIdx === idx ? 'max-h-48 mt-4 pt-4 border-t border-gray-100' : 'max-h-0'}`}>
                  <ul className="space-y-2">
                    {service.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-center gap-2 text-sm text-[#6B7280]">
                        <svg className="w-4 h-4 flex-shrink-0" style={{ color: service.color }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        {feat}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServiceGrid;
