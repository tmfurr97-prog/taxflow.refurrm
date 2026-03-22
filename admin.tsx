import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';

// Mock data for leads
const MOCK_LEADS = [
  { id: 1, name: 'Marcus Thompson', email: 'marcus@email.com', phone: '(555) 123-4567', tax_situation: 'individual', sms_opt_in: true, created_at: '2026-02-25T09:30:00Z', status: 'new' },
  { id: 2, name: 'Keisha Robinson', email: 'keisha@email.com', phone: '(555) 234-5678', tax_situation: 'business', sms_opt_in: true, created_at: '2026-02-24T14:15:00Z', status: 'contacted' },
  { id: 3, name: 'David Lee', email: 'david.lee@email.com', phone: '(555) 345-6789', tax_situation: 'back_taxes', sms_opt_in: false, created_at: '2026-02-23T11:00:00Z', status: 'converted' },
  { id: 4, name: 'Jasmine Williams', email: 'jasmine.w@email.com', phone: '(555) 456-7890', tax_situation: 'individual', sms_opt_in: true, created_at: '2026-02-22T16:45:00Z', status: 'new' },
  { id: 5, name: 'Carlos Martinez', email: 'carlos.m@email.com', phone: '(555) 567-8901', tax_situation: 'business', sms_opt_in: false, created_at: '2026-02-21T08:20:00Z', status: 'contacted' },
  { id: 6, name: 'Tanya Price', email: 'tanya.p@email.com', phone: '(555) 678-9012', tax_situation: 'individual', sms_opt_in: true, created_at: '2026-02-20T13:10:00Z', status: 'converted' },
  { id: 7, name: 'Robert Kim', email: 'robert.k@email.com', phone: '(555) 789-0123', tax_situation: 'back_taxes', sms_opt_in: true, created_at: '2026-02-19T10:30:00Z', status: 'new' },
  { id: 8, name: 'Alicia Davis', email: 'alicia.d@email.com', phone: '(555) 890-1234', tax_situation: 'business', sms_opt_in: false, created_at: '2026-02-18T15:00:00Z', status: 'contacted' },
  { id: 9, name: 'James Wilson', email: 'james.w@email.com', phone: '(555) 901-2345', tax_situation: 'individual', sms_opt_in: true, created_at: '2026-02-17T09:45:00Z', status: 'new' },
  { id: 10, name: 'Sarah Chen', email: 'sarah.c@email.com', phone: '(555) 012-3456', tax_situation: 'business', sms_opt_in: true, created_at: '2026-02-16T12:30:00Z', status: 'converted' },
  { id: 11, name: 'Michael Brown', email: 'michael.b@email.com', phone: '(555) 111-2222', tax_situation: 'back_taxes', sms_opt_in: false, created_at: '2026-02-15T14:20:00Z', status: 'contacted' },
  { id: 12, name: 'Lisa Nguyen', email: 'lisa.n@email.com', phone: '(555) 333-4444', tax_situation: 'individual', sms_opt_in: true, created_at: '2026-02-14T11:15:00Z', status: 'new' },
];

const MOCK_SUBSCRIPTIONS = [
  { id: 1, customer_name: 'David Lee', email: 'david.lee@email.com', plan: 'Annual Plan', price: 301, interval: 'year', status: 'active', created_at: '2026-01-15T10:00:00Z', current_period_end: '2027-01-15T10:00:00Z' },
  { id: 2, customer_name: 'Tanya Price', email: 'tanya.p@email.com', plan: 'Monthly Plan', price: 26.75, interval: 'month', status: 'active', created_at: '2026-02-01T12:00:00Z', current_period_end: '2026-03-01T12:00:00Z' },
  { id: 3, customer_name: 'Sarah Chen', email: 'sarah.c@email.com', plan: 'Annual Plan', price: 301, interval: 'year', status: 'active', created_at: '2026-01-20T09:00:00Z', current_period_end: '2027-01-20T09:00:00Z' },
  { id: 4, customer_name: 'Marcus Thompson', email: 'marcus@email.com', plan: 'Weekly Plan', price: 6.75, interval: 'week', status: 'active', created_at: '2026-02-20T14:00:00Z', current_period_end: '2026-02-27T14:00:00Z' },
  { id: 5, customer_name: 'Keisha Robinson', email: 'keisha@email.com', plan: 'Monthly Plan', price: 26.75, interval: 'month', status: 'past_due', created_at: '2026-01-10T11:00:00Z', current_period_end: '2026-02-10T11:00:00Z' },
  { id: 6, customer_name: 'Carlos Martinez', email: 'carlos.m@email.com', plan: 'Annual Plan', price: 301, interval: 'year', status: 'canceled', created_at: '2025-12-01T10:00:00Z', current_period_end: '2026-12-01T10:00:00Z' },
  { id: 7, customer_name: 'James Wilson', email: 'james.w@email.com', plan: 'Monthly Plan', price: 26.75, interval: 'month', status: 'active', created_at: '2026-02-10T08:00:00Z', current_period_end: '2026-03-10T08:00:00Z' },
  { id: 8, customer_name: 'Lisa Nguyen', email: 'lisa.n@email.com', plan: 'Weekly Plan', price: 6.75, interval: 'week', status: 'trialing', created_at: '2026-02-22T16:00:00Z', current_period_end: '2026-03-01T16:00:00Z' },
];

const MOCK_PAYMENTS = [
  { id: 1, customer_name: 'David Lee', email: 'david.lee@email.com', amount: 301, type: 'subscription', status: 'succeeded', created_at: '2026-01-15T10:00:00Z' },
  { id: 2, customer_name: 'Tanya Price', email: 'tanya.p@email.com', amount: 26.75, type: 'subscription', status: 'succeeded', created_at: '2026-02-01T12:00:00Z' },
  { id: 3, customer_name: 'Sarah Chen', email: 'sarah.c@email.com', amount: 301, type: 'subscription', status: 'succeeded', created_at: '2026-01-20T09:00:00Z' },
  { id: 4, customer_name: 'Marcus Thompson', email: 'marcus@email.com', amount: 6.75, type: 'subscription', status: 'succeeded', created_at: '2026-02-20T14:00:00Z' },
  { id: 5, customer_name: 'Keisha Robinson', email: 'keisha@email.com', amount: 26.75, type: 'subscription', status: 'failed', created_at: '2026-02-10T11:00:00Z' },
  { id: 6, customer_name: 'James Wilson', email: 'james.w@email.com', amount: 26.75, type: 'subscription', status: 'succeeded', created_at: '2026-02-10T08:00:00Z' },
  { id: 7, customer_name: 'Robert Kim', email: 'robert.k@email.com', amount: 999, type: 'one-time', status: 'succeeded', created_at: '2026-02-19T10:30:00Z' },
  { id: 8, customer_name: 'Alicia Davis', email: 'alicia.d@email.com', amount: 499, type: 'one-time', status: 'succeeded', created_at: '2026-02-18T15:00:00Z' },
  { id: 9, customer_name: 'Lisa Nguyen', email: 'lisa.n@email.com', amount: 0, type: 'trial', status: 'succeeded', created_at: '2026-02-22T16:00:00Z' },
  { id: 10, customer_name: 'Michael Brown', email: 'michael.b@email.com', amount: 35, type: 'one-time', status: 'refunded', created_at: '2026-02-15T14:20:00Z' },
];

type SortDir = 'asc' | 'desc';
type Tab = 'leads' | 'subscriptions' | 'payments';

const Admin: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('leads');
  const [searchQuery, setSearchQuery] = useState('');
  const [leadStatusFilter, setLeadStatusFilter] = useState('all');
  const [subStatusFilter, setSubStatusFilter] = useState('all');
  const [payStatusFilter, setPayStatusFilter] = useState('all');
  const [sortField, setSortField] = useState('created_at');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const handleSort = (field: string) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  const SortIcon = ({ field }: { field: string }) => (
    <svg className={`w-3.5 h-3.5 inline ml-1 ${sortField === field ? 'text-[#18453B]' : 'text-gray-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d={sortField === field && sortDir === 'asc' ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'} />
    </svg>
  );

  const sortData = <T extends Record<string, any>>(data: T[]) => {
    return [...data].sort((a, b) => {
      const aVal = a[sortField]; const bVal = b[sortField];
      if (typeof aVal === 'string') return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      return sortDir === 'asc' ? (aVal > bVal ? 1 : -1) : (bVal > aVal ? 1 : -1);
    });
  };

  const filteredLeads = useMemo(() => {
    let data = MOCK_LEADS.filter(l => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q || l.name.toLowerCase().includes(q) || l.email.toLowerCase().includes(q) || l.phone.includes(q);
      const matchesStatus = leadStatusFilter === 'all' || l.status === leadStatusFilter;
      return matchesSearch && matchesStatus;
    });
    return sortData(data);
  }, [searchQuery, leadStatusFilter, sortField, sortDir]);

  const filteredSubs = useMemo(() => {
    let data = MOCK_SUBSCRIPTIONS.filter(s => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q || s.customer_name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q);
      const matchesStatus = subStatusFilter === 'all' || s.status === subStatusFilter;
      return matchesSearch && matchesStatus;
    });
    return sortData(data);
  }, [searchQuery, subStatusFilter, sortField, sortDir]);

  const filteredPayments = useMemo(() => {
    let data = MOCK_PAYMENTS.filter(p => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q || p.customer_name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q);
      const matchesStatus = payStatusFilter === 'all' || p.status === payStatusFilter;
      return matchesSearch && matchesStatus;
    });
    return sortData(data);
  }, [searchQuery, payStatusFilter, sortField, sortDir]);

  // Stats
  const totalLeads = MOCK_LEADS.length;
  const newLeads = MOCK_LEADS.filter(l => l.status === 'new').length;
  const activeSubs = MOCK_SUBSCRIPTIONS.filter(s => s.status === 'active').length;
  const totalMRR = MOCK_SUBSCRIPTIONS.filter(s => s.status === 'active').reduce((sum, s) => {
    if (s.interval === 'week') return sum + s.price * 4.33;
    if (s.interval === 'month') return sum + s.price;
    if (s.interval === 'year') return sum + s.price / 12;
    return sum;
  }, 0);
  const totalRevenue = MOCK_PAYMENTS.filter(p => p.status === 'succeeded').reduce((sum, p) => sum + p.amount, 0);
  const failedPayments = MOCK_PAYMENTS.filter(p => p.status === 'failed').length;

  const exportCSV = () => {
    let csv = ''; let rows: any[] = [];
    if (activeTab === 'leads') {
      csv = 'Name,Email,Phone,Tax Situation,SMS Opt-In,Status,Created\n';
      rows = filteredLeads.map(l => `"${l.name}","${l.email}","${l.phone}","${l.tax_situation}","${l.sms_opt_in}","${l.status}","${l.created_at}"`);
    } else if (activeTab === 'subscriptions') {
      csv = 'Customer,Email,Plan,Price,Interval,Status,Created,Period End\n';
      rows = filteredSubs.map(s => `"${s.customer_name}","${s.email}","${s.plan}","${s.price}","${s.interval}","${s.status}","${s.created_at}","${s.current_period_end}"`);
    } else {
      csv = 'Customer,Email,Amount,Type,Status,Created\n';
      rows = filteredPayments.map(p => `"${p.customer_name}","${p.email}","${p.amount}","${p.type}","${p.status}","${p.created_at}"`);
    }
    csv += rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${activeTab}_export_${new Date().toISOString().split('T')[0]}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const formatCurrency = (v: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v);

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      new: 'bg-blue-50 text-blue-700 border-blue-200', contacted: 'bg-amber-50 text-amber-700 border-amber-200', converted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      active: 'bg-emerald-50 text-emerald-700 border-emerald-200', past_due: 'bg-red-50 text-red-700 border-red-200', canceled: 'bg-gray-50 text-gray-500 border-gray-200', trialing: 'bg-violet-50 text-violet-700 border-violet-200',
      succeeded: 'bg-emerald-50 text-emerald-700 border-emerald-200', failed: 'bg-red-50 text-red-700 border-red-200', refunded: 'bg-amber-50 text-amber-700 border-amber-200', trial: 'bg-violet-50 text-violet-700 border-violet-200',
    };
    return <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${map[status] || 'bg-gray-50 text-gray-500 border-gray-200'}`}>{status.replace('_', ' ')}</span>;
  };

  const thClass = "px-4 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider cursor-pointer hover:text-[#0A1628] select-none";
  const tdClass = "px-4 py-3 text-sm text-[#4A5568]";

  return (
    <div className="min-h-screen bg-[#F7F9FA]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-[#18453B] flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                </div>
                <span className="text-[#0A1628] font-bold text-lg">SmartBooks24</span>
              </Link>
              <span className="text-gray-300">|</span>
              <h1 className="text-[#0A1628] font-semibold text-sm">Admin Dashboard</h1>
            </div>
            <Link to="/" className="text-[#6B7280] hover:text-[#0A1628] text-sm font-medium flex items-center gap-1.5 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Back to Site
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-8">
          {[
            { label: 'Total Leads', value: totalLeads, icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', color: '#1B365D' },
            { label: 'New Leads', value: newLeads, icon: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z', color: '#2563EB' },
            { label: 'Active Subs', value: activeSubs, icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', color: '#18453B' },
            { label: 'Monthly MRR', value: formatCurrency(totalMRR), icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: '#059669' },
            { label: 'Total Revenue', value: formatCurrency(totalRevenue), icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', color: '#7C3AED' },
            { label: 'Failed Payments', value: failedPayments, icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z', color: '#DC2626' },
          ].map((card, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${card.color}10` }}>
                  <svg className="w-5 h-5" style={{ color: card.color }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d={card.icon} /></svg>
                </div>
              </div>
              <div className="text-2xl font-black text-[#0A1628]">{card.value}</div>
              <div className="text-xs text-[#6B7280] font-medium mt-0.5">{card.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs + Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1">
            {(['leads', 'subscriptions', 'payments'] as Tab[]).map(tab => (
              <button key={tab} onClick={() => { setActiveTab(tab); setSearchQuery(''); setSortField('created_at'); setSortDir('desc'); }}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${activeTab === tab ? 'bg-[#18453B] text-white shadow-sm' : 'text-[#6B7280] hover:text-[#0A1628] hover:bg-gray-50'}`}>
                {tab}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-72">
              <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search by name or email..."
                className="w-full bg-white border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 text-sm text-[#0A1628] placeholder-gray-400 focus:outline-none focus:border-[#18453B] focus:ring-1 focus:ring-[#18453B]/30" />
            </div>
            {activeTab === 'leads' && (
              <select value={leadStatusFilter} onChange={e => setLeadStatusFilter(e.target.value)} className="bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-[#0A1628] focus:outline-none focus:border-[#18453B] appearance-none pr-8">
                <option value="all">All Status</option><option value="new">New</option><option value="contacted">Contacted</option><option value="converted">Converted</option>
              </select>
            )}
            {activeTab === 'subscriptions' && (
              <select value={subStatusFilter} onChange={e => setSubStatusFilter(e.target.value)} className="bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-[#0A1628] focus:outline-none focus:border-[#18453B] appearance-none pr-8">
                <option value="all">All Status</option><option value="active">Active</option><option value="past_due">Past Due</option><option value="canceled">Canceled</option><option value="trialing">Trialing</option>
              </select>
            )}
            {activeTab === 'payments' && (
              <select value={payStatusFilter} onChange={e => setPayStatusFilter(e.target.value)} className="bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-[#0A1628] focus:outline-none focus:border-[#18453B] appearance-none pr-8">
                <option value="all">All Status</option><option value="succeeded">Succeeded</option><option value="failed">Failed</option><option value="refunded">Refunded</option>
              </select>
            )}
            <button onClick={exportCSV} className="bg-[#18453B] hover:bg-[#0D3328] text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-2 whitespace-nowrap">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              Export CSV
            </button>
          </div>
        </div>

        {/* Tables */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            {activeTab === 'leads' && (
              <table className="w-full">
                <thead className="bg-[#F7F9FA] border-b border-gray-200">
                  <tr>
                    <th className={thClass} onClick={() => handleSort('name')}>Name<SortIcon field="name" /></th>
                    <th className={thClass} onClick={() => handleSort('email')}>Email<SortIcon field="email" /></th>
                    <th className={`${thClass} hidden md:table-cell`} onClick={() => handleSort('phone')}>Phone<SortIcon field="phone" /></th>
                    <th className={`${thClass} hidden lg:table-cell`} onClick={() => handleSort('tax_situation')}>Situation<SortIcon field="tax_situation" /></th>
                    <th className={thClass} onClick={() => handleSort('status')}>Status<SortIcon field="status" /></th>
                    <th className={`${thClass} hidden sm:table-cell`}>SMS</th>
                    <th className={thClass} onClick={() => handleSort('created_at')}>Date<SortIcon field="created_at" /></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredLeads.map(lead => (
                    <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                      <td className={`${tdClass} font-semibold text-[#0A1628]`}>{lead.name}</td>
                      <td className={tdClass}>{lead.email}</td>
                      <td className={`${tdClass} hidden md:table-cell`}>{lead.phone}</td>
                      <td className={`${tdClass} hidden lg:table-cell capitalize`}>{lead.tax_situation.replace('_', ' ')}</td>
                      <td className={tdClass}>{statusBadge(lead.status)}</td>
                      <td className={`${tdClass} hidden sm:table-cell`}>
                        {lead.sms_opt_in ? <svg className="w-4 h-4 text-[#18453B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> : <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>}
                      </td>
                      <td className={`${tdClass} whitespace-nowrap`}>{formatDate(lead.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'subscriptions' && (
              <table className="w-full">
                <thead className="bg-[#F7F9FA] border-b border-gray-200">
                  <tr>
                    <th className={thClass} onClick={() => handleSort('customer_name')}>Customer<SortIcon field="customer_name" /></th>
                    <th className={`${thClass} hidden md:table-cell`} onClick={() => handleSort('email')}>Email<SortIcon field="email" /></th>
                    <th className={thClass} onClick={() => handleSort('plan')}>Plan<SortIcon field="plan" /></th>
                    <th className={thClass} onClick={() => handleSort('price')}>Price<SortIcon field="price" /></th>
                    <th className={thClass} onClick={() => handleSort('status')}>Status<SortIcon field="status" /></th>
                    <th className={`${thClass} hidden lg:table-cell`} onClick={() => handleSort('current_period_end')}>Renews<SortIcon field="current_period_end" /></th>
                    <th className={thClass} onClick={() => handleSort('created_at')}>Started<SortIcon field="created_at" /></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredSubs.map(sub => (
                    <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                      <td className={`${tdClass} font-semibold text-[#0A1628]`}>{sub.customer_name}</td>
                      <td className={`${tdClass} hidden md:table-cell`}>{sub.email}</td>
                      <td className={tdClass}><span className="font-medium">{sub.plan}</span></td>
                      <td className={tdClass}>{formatCurrency(sub.price)}/{sub.interval}</td>
                      <td className={tdClass}>{statusBadge(sub.status)}</td>
                      <td className={`${tdClass} hidden lg:table-cell whitespace-nowrap`}>{formatDate(sub.current_period_end)}</td>
                      <td className={`${tdClass} whitespace-nowrap`}>{formatDate(sub.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'payments' && (
              <table className="w-full">
                <thead className="bg-[#F7F9FA] border-b border-gray-200">
                  <tr>
                    <th className={thClass} onClick={() => handleSort('customer_name')}>Customer<SortIcon field="customer_name" /></th>
                    <th className={`${thClass} hidden md:table-cell`} onClick={() => handleSort('email')}>Email<SortIcon field="email" /></th>
                    <th className={thClass} onClick={() => handleSort('amount')}>Amount<SortIcon field="amount" /></th>
                    <th className={thClass} onClick={() => handleSort('type')}>Type<SortIcon field="type" /></th>
                    <th className={thClass} onClick={() => handleSort('status')}>Status<SortIcon field="status" /></th>
                    <th className={thClass} onClick={() => handleSort('created_at')}>Date<SortIcon field="created_at" /></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredPayments.map(pay => (
                    <tr key={pay.id} className="hover:bg-gray-50 transition-colors">
                      <td className={`${tdClass} font-semibold text-[#0A1628]`}>{pay.customer_name}</td>
                      <td className={`${tdClass} hidden md:table-cell`}>{pay.email}</td>
                      <td className={`${tdClass} font-semibold`}>{formatCurrency(pay.amount)}</td>
                      <td className={`${tdClass} capitalize`}>{pay.type}</td>
                      <td className={tdClass}>{statusBadge(pay.status)}</td>
                      <td className={`${tdClass} whitespace-nowrap`}>{formatDate(pay.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Empty State */}
          {((activeTab === 'leads' && filteredLeads.length === 0) || (activeTab === 'subscriptions' && filteredSubs.length === 0) || (activeTab === 'payments' && filteredPayments.length === 0)) && (
            <div className="py-16 text-center">
              <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <p className="text-[#6B7280] text-sm font-medium">No results found</p>
              <p className="text-[#9CA3AF] text-xs mt-1">Try adjusting your search or filter criteria</p>
            </div>
          )}

          {/* Row Count */}
          <div className="px-4 py-3 border-t border-gray-100 bg-[#F7F9FA] flex items-center justify-between">
            <span className="text-xs text-[#6B7280]">
              Showing {activeTab === 'leads' ? filteredLeads.length : activeTab === 'subscriptions' ? filteredSubs.length : filteredPayments.length} of {activeTab === 'leads' ? MOCK_LEADS.length : activeTab === 'subscriptions' ? MOCK_SUBSCRIPTIONS.length : MOCK_PAYMENTS.length} records
            </span>
            <span className="text-xs text-[#9CA3AF]">Click column headers to sort</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
