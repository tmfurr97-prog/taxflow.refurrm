import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';


const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [, setLocation] = useLocation();


  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMobileOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const links = [
    { label: 'Services', id: 'services' },
    { label: 'Pricing', id: 'pricing' },
    { label: 'Calculator', id: 'calculator' },
    { label: 'Vault', id: 'vault' },
    { label: 'Notary', id: 'notary' },
    { label: 'Blog', id: 'blog' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100' : 'bg-white/80 backdrop-blur-sm'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 rounded-lg bg-[#18453B] flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <span className="text-[#0A1628] font-bold text-lg tracking-tight">SmartBooks24</span>
              <span className="text-[#18453B] text-xs block -mt-1 font-medium tracking-widest uppercase">by ReFurrm</span>
            </div>
          </div>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center gap-1">
            {links.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollTo(link.id)}
                className="text-[#4A5568] hover:text-[#0A1628] px-4 py-2 text-sm font-medium tracking-wide transition-colors duration-200 hover:bg-gray-50 rounded-lg"
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <button
              onClick={() => setLocation('/book-appointment')}
              className="text-[#18453B] hover:text-[#0D3328] text-sm font-medium flex items-center gap-1.5 transition-colors px-3 py-2 hover:bg-[#18453B]/5 rounded-lg"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Book Appointment
            </button>

            <button
              onClick={() => setLocation('/onboard')}
              className="bg-[#18453B] hover:bg-[#0D3328] text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-all duration-300 shadow-sm hover:shadow-md"
            >
              Get Started
            </button>

            <a
              href="https://sa.www4.irs.gov/wmr/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#1B365D] hover:text-[#0A1628] text-sm font-medium flex items-center gap-1 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Track Refund
            </a>
          </div>


          {/* Mobile Menu Button */}
          <button
            className="lg:hidden text-[#0A1628] p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-white/98 backdrop-blur-lg border-t border-gray-100">
          <div className="px-4 py-4 space-y-1">
            {links.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollTo(link.id)}
                className="block w-full text-left text-[#4A5568] hover:text-[#0A1628] px-4 py-3 text-sm font-medium hover:bg-gray-50 rounded-lg transition-colors"
              >
                {link.label}
              </button>
            ))}
            <div className="pt-3 border-t border-gray-100 space-y-2">
              <button
                onClick={() => { setLocation('/book-appointment'); setMobileOpen(false); }}
                className="w-full bg-white border border-[#18453B] text-[#18453B] font-semibold px-6 py-3 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Book Appointment
              </button>

              <button
                onClick={() => { setLocation('/onboard'); setMobileOpen(false); }}
                className="w-full bg-[#18453B] hover:bg-[#0D3328] text-white font-semibold px-6 py-3 rounded-lg text-sm transition-colors"
              >
                Get Started
              </button>

              <a
                href="https://sa.www4.irs.gov/wmr/"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center text-[#1B365D] py-2 text-sm font-medium"
              >
                Track Your Refund (IRS)
              </a>
            </div>

          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
