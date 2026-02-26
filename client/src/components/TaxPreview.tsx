import React, { useState } from 'react';

const TaxPreview: React.FC = () => {
  const [showPreview, setShowPreview] = useState(false);

  const taxData = {
    income: 75000,
    deductions: 18500,
    credits: 2500,
    estimatedRefund: 3200
  };

  return (
    <div>
      <div className="bg-gradient-to-br from-green-600 to-green-800 text-white p-8 rounded-xl mb-6">
        <h2 className="text-3xl font-bold mb-2">Tax Preview Ready</h2>
        <p className="text-green-100 mb-6">January 1-15 upload window is open for W-2s, 1099s, and 1098-Ts</p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white bg-opacity-20 p-4 rounded-lg">
            <p className="text-green-100 text-sm">Total Income</p>
            <p className="text-2xl font-bold">${taxData.income.toLocaleString()}</p>
          </div>
          <div className="bg-white bg-opacity-20 p-4 rounded-lg">
            <p className="text-green-100 text-sm">Deductions</p>
            <p className="text-2xl font-bold">${taxData.deductions.toLocaleString()}</p>
          </div>
          <div className="bg-white bg-opacity-20 p-4 rounded-lg">
            <p className="text-green-100 text-sm">Credits</p>
            <p className="text-2xl font-bold">${taxData.credits.toLocaleString()}</p>
          </div>
          <div className="bg-white bg-opacity-20 p-4 rounded-lg">
            <p className="text-green-100 text-sm">Est. Refund</p>
            <p className="text-2xl font-bold">${taxData.estimatedRefund.toLocaleString()}</p>
          </div>
        </div>

        <button 
          onClick={() => setShowPreview(!showPreview)}
          className="w-full py-4 bg-white text-green-700 font-bold rounded-lg hover:bg-green-50 transition-colors"
        >
          {showPreview ? 'Hide' : 'View'} Form 1040 Preview
        </button>
      </div>

      {showPreview && (
        <div className="bg-white border-2 border-gray-200 rounded-xl p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Form 1040 Preview</h3>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between py-3 border-b">
              <span className="font-semibold">Wages, salaries, tips (Line 1)</span>
              <span>${taxData.income.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-3 border-b">
              <span className="font-semibold">Standard/Itemized deductions (Line 12)</span>
              <span>${taxData.deductions.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-3 border-b">
              <span className="font-semibold">Tax credits (Line 19)</span>
              <span>${taxData.credits.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-4 bg-green-50 px-4 rounded-lg">
              <span className="font-bold text-lg">Estimated Refund</span>
              <span className="font-bold text-lg text-green-600">${taxData.estimatedRefund.toLocaleString()}</span>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> This is a preview only. SmartBooks24 provides software assistance, not tax advice.
              Users are responsible for accuracy and filing.
            </p>
          </div>

          <button className="w-full mt-6 py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">
            Download Form 1040 Preview (PDF)
          </button>
        </div>
      )}
    </div>
  );
};

export default TaxPreview;
