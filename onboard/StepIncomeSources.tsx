import React, { useState, useRef } from 'react';
import { IntakeFormData, W2Employer, Ten99Source, OtherIncome, UploadedDocument, TEN99_TYPES } from '@/types/intake';

interface Props {
  data: IntakeFormData;
  onChange: (updates: Partial<IntakeFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const StepIncomeSources: React.FC<Props> = ({ data, onChange, onNext, onBack }) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!data.has_w2 && !data.has_1099 && !data.has_self_employment && !data.has_other_income) {
      newErrors.income = 'Please select at least one income source';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) onNext();
  };

  // W2 management
  const addW2 = () => {
    const newW2: W2Employer = { id: Date.now().toString(), employer_name: '', wages: '', federal_tax_withheld: '', state_tax_withheld: '' };
    onChange({ w2_employers: [...data.w2_employers, newW2] });
  };

  const updateW2 = (id: string, field: keyof W2Employer, value: string) => {
    onChange({ w2_employers: data.w2_employers.map((w) => (w.id === id ? { ...w, [field]: value } : w)) });
  };

  const removeW2 = (id: string) => {
    onChange({ w2_employers: data.w2_employers.filter((w) => w.id !== id) });
  };

  // 1099 management
  const add1099 = () => {
    const newSrc: Ten99Source = { id: Date.now().toString(), payer_name: '', type: '1099-NEC', amount: '' };
    onChange({ ten99_sources: [...data.ten99_sources, newSrc] });
  };

  const update1099 = (id: string, field: keyof Ten99Source, value: string) => {
    onChange({ ten99_sources: data.ten99_sources.map((s) => (s.id === id ? { ...s, [field]: value } : s)) });
  };

  const remove1099 = (id: string) => {
    onChange({ ten99_sources: data.ten99_sources.filter((s) => s.id !== id) });
  };

  // Other income management
  const addOtherIncome = () => {
    const newInc: OtherIncome = { id: Date.now().toString(), type: '', description: '', amount: '' };
    onChange({ other_income_details: [...data.other_income_details, newInc] });
  };

  const updateOtherIncome = (id: string, field: keyof OtherIncome, value: string) => {
    onChange({ other_income_details: data.other_income_details.map((o) => (o.id === id ? { ...o, [field]: value } : o)) });
  };

  const removeOtherIncome = (id: string) => {
    onChange({ other_income_details: data.other_income_details.filter((o) => o.id !== id) });
  };

  // File upload handling
  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const newDocs: UploadedDocument[] = Array.from(files).map((file) => ({
      id: Date.now().toString() + Math.random().toString(36).slice(2),
      name: file.name,
      type: file.type,
      category: 'tax_document',
      size: file.size,
      uploadedAt: new Date().toISOString(),
    }));
    onChange({ uploaded_documents: [...data.uploaded_documents, ...newDocs] });
  };

  const removeDocument = (id: string) => {
    onChange({ uploaded_documents: data.uploaded_documents.filter((d) => d.id !== id) });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatCurrencyInput = (value: string) => value.replace(/[^0-9.]/g, '');

  const toggleClass = (active: boolean) =>
    `relative w-12 h-6 rounded-full transition-colors cursor-pointer ${active ? 'bg-[#18453B]' : 'bg-gray-300'}`;

  const toggleDot = (active: boolean) =>
    `absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${active ? 'translate-x-6' : 'translate-x-0.5'}`;

  const sectionClass = 'bg-gray-50 rounded-xl p-5 border border-gray-100 space-y-4';
  const inputSmClass = 'w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-[#0A1628] placeholder-gray-400 focus:outline-none focus:border-[#18453B] focus:ring-2 focus:ring-[#18453B]/20';

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-[#0A1628]">Income Sources</h2>
        <p className="text-gray-500 mt-1">Tell us about your income for the tax year. Toggle on each type that applies.</p>
      </div>

      {errors.income && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-sm text-red-700">{errors.income}</p>
        </div>
      )}

      {/* W-2 Income */}
      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
        <div className="flex items-center justify-between p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0A1628]">W-2 Employment Income</h3>
              <p className="text-xs text-gray-500">Wages, salaries, and tips from employers</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              onChange({ has_w2: !data.has_w2 });
              if (!data.has_w2 && data.w2_employers.length === 0) addW2();
            }}
            className={toggleClass(data.has_w2)}
          >
            <div className={toggleDot(data.has_w2)} />
          </button>
        </div>

        {data.has_w2 && (
          <div className="border-t border-gray-100 p-5 space-y-4">
            {data.w2_employers.map((w2, idx) => (
              <div key={w2.id} className={sectionClass}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-500 uppercase">Employer #{idx + 1}</span>
                  {data.w2_employers.length > 1 && (
                    <button type="button" onClick={() => removeW2(w2.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Employer Name</label>
                    <input type="text" value={w2.employer_name} onChange={(e) => updateW2(w2.id, 'employer_name', e.target.value)} placeholder="Company Name" className={inputSmClass} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Total Wages ($)</label>
                    <input type="text" value={w2.wages} onChange={(e) => updateW2(w2.id, 'wages', formatCurrencyInput(e.target.value))} placeholder="0.00" className={inputSmClass} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Federal Tax Withheld ($)</label>
                    <input type="text" value={w2.federal_tax_withheld} onChange={(e) => updateW2(w2.id, 'federal_tax_withheld', formatCurrencyInput(e.target.value))} placeholder="0.00" className={inputSmClass} />
                  </div>
                </div>
              </div>
            ))}
            <button type="button" onClick={addW2} className="text-[#18453B] hover:text-[#0D3328] text-sm font-semibold flex items-center gap-1.5 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              Add Another Employer
            </button>
          </div>
        )}
      </div>

      {/* 1099 Income */}
      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
        <div className="flex items-center justify-between p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0A1628]">1099 Income</h3>
              <p className="text-xs text-gray-500">Freelance, contract, interest, dividends, retirement</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              onChange({ has_1099: !data.has_1099 });
              if (!data.has_1099 && data.ten99_sources.length === 0) add1099();
            }}
            className={toggleClass(data.has_1099)}
          >
            <div className={toggleDot(data.has_1099)} />
          </button>
        </div>

        {data.has_1099 && (
          <div className="border-t border-gray-100 p-5 space-y-4">
            {data.ten99_sources.map((src, idx) => (
              <div key={src.id} className={sectionClass}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-500 uppercase">1099 Source #{idx + 1}</span>
                  {data.ten99_sources.length > 1 && (
                    <button type="button" onClick={() => remove1099(src.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Payer Name</label>
                    <input type="text" value={src.payer_name} onChange={(e) => update1099(src.id, 'payer_name', e.target.value)} placeholder="Payer name" className={inputSmClass} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Form Type</label>
                    <select value={src.type} onChange={(e) => update1099(src.id, 'type', e.target.value)} className={inputSmClass}>
                      {TEN99_TYPES.map((t) => (<option key={t} value={t}>{t}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Amount ($)</label>
                    <input type="text" value={src.amount} onChange={(e) => update1099(src.id, 'amount', formatCurrencyInput(e.target.value))} placeholder="0.00" className={inputSmClass} />
                  </div>
                </div>
              </div>
            ))}
            <button type="button" onClick={add1099} className="text-[#18453B] hover:text-[#0D3328] text-sm font-semibold flex items-center gap-1.5 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              Add Another 1099
            </button>
          </div>
        )}
      </div>

      {/* Self-Employment */}
      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
        <div className="flex items-center justify-between p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0A1628]">Self-Employment Income</h3>
              <p className="text-xs text-gray-500">Business income, sole proprietorship, LLC</p>
            </div>
          </div>
          <button type="button" onClick={() => onChange({ has_self_employment: !data.has_self_employment })} className={toggleClass(data.has_self_employment)}>
            <div className={toggleDot(data.has_self_employment)} />
          </button>
        </div>

        {data.has_self_employment && (
          <div className="border-t border-gray-100 p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Business Name</label>
                <input type="text" value={data.self_employment_details.business_name} onChange={(e) => onChange({ self_employment_details: { ...data.self_employment_details, business_name: e.target.value } })} placeholder="Your Business LLC" className={inputSmClass} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Business Type</label>
                <select value={data.self_employment_details.business_type} onChange={(e) => onChange({ self_employment_details: { ...data.self_employment_details, business_type: e.target.value } })} className={inputSmClass}>
                  <option value="">Select type</option>
                  <option value="sole_proprietorship">Sole Proprietorship</option>
                  <option value="single_member_llc">Single-Member LLC</option>
                  <option value="partnership">Partnership</option>
                  <option value="s_corp">S-Corporation</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Gross Income ($)</label>
                <input type="text" value={data.self_employment_details.gross_income} onChange={(e) => onChange({ self_employment_details: { ...data.self_employment_details, gross_income: formatCurrencyInput(e.target.value) } })} placeholder="0.00" className={inputSmClass} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Total Expenses ($)</label>
                <input type="text" value={data.self_employment_details.total_expenses} onChange={(e) => onChange({ self_employment_details: { ...data.self_employment_details, total_expenses: formatCurrencyInput(e.target.value) } })} placeholder="0.00" className={inputSmClass} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Other Income */}
      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
        <div className="flex items-center justify-between p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0A1628]">Other Income</h3>
              <p className="text-xs text-gray-500">Rental, alimony, gambling, crypto, etc.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              onChange({ has_other_income: !data.has_other_income });
              if (!data.has_other_income && data.other_income_details.length === 0) addOtherIncome();
            }}
            className={toggleClass(data.has_other_income)}
          >
            <div className={toggleDot(data.has_other_income)} />
          </button>
        </div>

        {data.has_other_income && (
          <div className="border-t border-gray-100 p-5 space-y-4">
            {data.other_income_details.map((inc, idx) => (
              <div key={inc.id} className={sectionClass}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-500 uppercase">Source #{idx + 1}</span>
                  {data.other_income_details.length > 1 && (
                    <button type="button" onClick={() => removeOtherIncome(inc.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Type</label>
                    <select value={inc.type} onChange={(e) => updateOtherIncome(inc.id, 'type', e.target.value)} className={inputSmClass}>
                      <option value="">Select</option>
                      <option value="rental">Rental Income</option>
                      <option value="alimony">Alimony</option>
                      <option value="gambling">Gambling Winnings</option>
                      <option value="crypto">Cryptocurrency</option>
                      <option value="social_security">Social Security</option>
                      <option value="pension">Pension</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Description</label>
                    <input type="text" value={inc.description} onChange={(e) => updateOtherIncome(inc.id, 'description', e.target.value)} placeholder="Brief description" className={inputSmClass} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Amount ($)</label>
                    <input type="text" value={inc.amount} onChange={(e) => updateOtherIncome(inc.id, 'amount', formatCurrencyInput(e.target.value))} placeholder="0.00" className={inputSmClass} />
                  </div>
                </div>
              </div>
            ))}
            <button type="button" onClick={addOtherIncome} className="text-[#18453B] hover:text-[#0D3328] text-sm font-semibold flex items-center gap-1.5 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              Add Another Source
            </button>
          </div>
        )}
      </div>

      {/* Document Upload */}
      <div>
        <h3 className="text-lg font-bold text-[#0A1628] mb-2">Upload Documents</h3>
        <p className="text-sm text-gray-500 mb-4">Upload your W-2s, 1099s, and other tax documents. Accepted formats: PDF, JPG, PNG.</p>

        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            dragActive ? 'border-[#18453B] bg-[#18453B]/5' : 'border-gray-200 hover:border-gray-300 bg-gray-50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
          />
          <svg className="w-10 h-10 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="text-sm font-semibold text-[#0A1628]">
            {dragActive ? 'Drop files here' : 'Drag & drop files here'}
          </p>
          <p className="text-xs text-gray-400 mt-1">or click to browse your computer</p>
        </div>

        {data.uploaded_documents.length > 0 && (
          <div className="mt-4 space-y-2">
            {data.uploaded_documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-3">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-[#18453B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-[#0A1628]">{doc.name}</p>
                    <p className="text-xs text-gray-400">{formatFileSize(doc.size)}</p>
                  </div>
                </div>
                <button type="button" onClick={() => removeDocument(doc.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t border-gray-100">
        <button onClick={onBack} className="text-gray-600 hover:text-[#0A1628] font-semibold px-6 py-3 rounded-lg text-sm transition-colors flex items-center gap-2 border border-gray-200 hover:border-gray-300">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back
        </button>
        <button onClick={handleNext} className="bg-[#18453B] hover:bg-[#0D3328] text-white font-semibold px-8 py-3 rounded-lg text-sm transition-colors flex items-center gap-2">
          Continue
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
        </button>
      </div>
    </div>
  );
};

export default StepIncomeSources;
