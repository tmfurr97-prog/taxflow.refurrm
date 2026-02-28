import React, { useState } from 'react';

const DocumentVault: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [files, setFiles] = useState<{ name: string; type: string; date: string; status: string; savings?: string }[]>([
    { name: 'W2_2025_Employer.pdf', type: 'W2', date: '2026-01-15', status: 'Verified for 1040' },
    { name: 'Receipt_Office_Supplies.jpg', type: 'Receipt', date: '2026-02-10', status: 'Ready for Schedule C', savings: '$12.40' },
    { name: '1099_Freelance_Work.pdf', type: '1099', date: '2026-01-22', status: 'Verified for 1040' },
  ]);
  const [dragOver, setDragOver] = useState(false);
  const [activeFolder, setActiveFolder] = useState('all');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleLogin = (e: React.FormEvent) => { e.preventDefault(); setIsLoggedIn(true); };

  const processFile = (fileName: string) => {
    setIsProcessing(true);
    const newFile = { 
      name: fileName, 
      type: 'Pending', 
      date: new Date().toISOString().split('T')[0], 
      status: 'Smart Categorizing...' 
    };
    setFiles(prev => [newFile, ...prev]);

    setTimeout(() => {
      setFiles(prev => prev.map(f => f.name === fileName ? { ...f, status: 'Agent Andrew Reviewing...' } : f));
    }, 2000);

    setTimeout(() => {
      setFiles(prev => prev.map(f => f.name === fileName ? { 
        ...f, 
        status: 'Ready for Schedule C', 
        type: 'Receipt',
        savings: `$${(Math.random() * 50).toFixed(2)}`
      } : f));
      setIsProcessing(false);
    }, 5000);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    droppedFiles.forEach(f => processFile(f.name));
  };

  const handleFileSelect = () => {
    const input = document.createElement('input'); input.type = 'file'; input.multiple = true;
    input.onchange = (e: any) => {
      const selectedFiles = Array.from(e.target.files || []) as File[];
      selectedFiles.forEach(f => processFile(f.name));
    };
    input.click();
  };

  const statusColor = (status: string) => {
    if (status.includes('Verified') || status.includes('Ready')) return 'text-[#18453B] bg-[#18453B]/5 border border-[#18453B]/20';
    if (status.includes('Reviewing') || status.includes('Categorizing')) return 'text-amber-700 bg-amber-50 border border-amber-200';
    return 'text-[#6B7280] bg-gray-50 border border-gray-200';
  };

  if (!isLoggedIn) {
    return (
      <section id="vault" className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-black text-[#0A1628] mb-12 uppercase tracking-tight">Secure <span className="text-[#18453B]">Vault</span></h2>
          <div className="max-w-md mx-auto bg-white border border-gray-200 rounded-2xl p-8 shadow-lg">
            <form onSubmit={handleLogin} className="space-y-4">
              <input type="email" placeholder="Email Address" className="w-full bg-[#F9FAFB] border border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-[#18453B]" />
              <input type="password" placeholder="Password" className="w-full bg-[#F9FAFB] border border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-[#18453B]" />
              <button type="submit" className="w-full bg-[#18453B] text-gray-900 font-bold py-3.5 rounded-xl uppercase tracking-wider">Access Vault</button>
            </form>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="vault" className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-end mb-12">
          <div>
            <span className="text-[#18453B] text-xs font-bold uppercase tracking-widest block mb-2">Command Center</span>
            <h2 className="text-4xl font-black text-[#0A1628]">SECURE DOCUMENT <span className="text-[#18453B]">VAULT</span></h2>
          </div>
          <div className="bg-[#18453B]/5 border border-[#18453B]/10 px-4 py-2 rounded-full flex items-center gap-3">
            <span className="relative flex h-2 w-2"><span className="animate-ping absolute h-full w-full rounded-full bg-[#18453B] opacity-75"></span><span className="relative h-2 w-2 rounded-full bg-[#18453B]"></span></span>
            <span className="text-[#18453B] text-xs font-bold uppercase">Shadow Accountant active: 14 receipts sorted this week</span>
          </div>
        </div>
        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1 space-y-2">
            {['All Documents', 'W2s', '1099s', 'Receipts'].map((label, i) => (
              <button key={i} onClick={() => setActiveFolder(label.toLowerCase())} className={`w-full text-left px-5 py-3.5 rounded-xl text-sm font-bold transition-all ${activeFolder === label.toLowerCase() ? 'bg-[#18453B] text-gray-900' : 'text-gray-500 hover:bg-gray-50'}`}>{label}</button>
            ))}
          </div>
          <div className="lg:col-span-3 space-y-6">
            <div onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={handleDrop} onClick={handleFileSelect} className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all ${dragOver ? 'border-[#18453B] bg-[#18453B]/5' : 'border-gray-200 hover:bg-gray-50'}`}>
              {isProcessing ? <p className="text-[#18453B] font-bold animate-pulse">Agent Andrew is executing analysis...</p> : <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Drop files for Smart Automation</p>}
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden divide-y divide-gray-100">
              {files.map((file, idx) => (
                <div key={idx} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-all">
                  <div>
                    <p className="text-[#0A1628] text-sm font-bold">{file.name}</p>
                    <p className="text-gray-400 text-[10px] uppercase font-black">{file.date} {file.savings && `· Saved ${file.savings}`}</p>
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${statusColor(file.status)}`}>{file.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DocumentVault;