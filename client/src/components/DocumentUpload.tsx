import React, { useState } from 'react';

interface DocumentUploadProps {
  onUpload: (files: File[]) => void;
  onScanEmail: () => void;
  onConnectBank: () => void;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({ onUpload, onScanEmail, onConnectBank }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    onUpload(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      onUpload(files);
    }
  };

  return (
    <div className="space-y-6">
      <div
        className={`border-3 border-dashed rounded-xl p-12 text-center transition-all ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
        }`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Drop files here</h3>
        <p className="text-gray-600 mb-4">or click to browse</p>
        <input
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileInput}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700">
          Select Files
        </label>
        <p className="text-xs text-gray-500 mt-3">Supports PDF, JPEG, PNG</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <button
          onClick={onScanEmail}
          className="flex items-center gap-4 p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-400 hover:shadow-lg transition-all"
        >
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="text-left">
            <h4 className="font-semibold text-gray-900">Scan Email</h4>
            <p className="text-sm text-gray-600">Gmail/Outlook receipts</p>
          </div>
        </button>

        <button
          onClick={onConnectBank}
          className="flex items-center gap-4 p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-green-400 hover:shadow-lg transition-all"
        >
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-left">
            <h4 className="font-semibold text-gray-900">Connect Bank</h4>
            <p className="text-sm text-gray-600">Plaid API integration</p>
          </div>
        </button>
      </div>
    </div>
  );
};

export default DocumentUpload;
