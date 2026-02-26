import React from 'react';

interface DocumentCardProps {
  name: string;
  category: string;
  date: string;
  amount?: string;
  status: 'verified' | 'pending' | 'error';
  onView?: () => void;
  onDelete?: () => void;
}

const DocumentCard: React.FC<DocumentCardProps> = ({ 
  name, 
  category, 
  date, 
  amount, 
  status,
  onView,
  onDelete 
}) => {
  const statusColors = {
    verified: 'bg-green-100 text-green-700',
    pending: 'bg-amber-100 text-amber-700',
    error: 'bg-red-100 text-red-700'
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 text-sm">{name}</h4>
          <p className="text-xs text-gray-500 mt-1">{category}</p>
        </div>
        <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[status]}`}>
          {status}
        </span>
      </div>
      <div className="flex items-center justify-between text-xs text-gray-600 mt-3">
        <span>{date}</span>
        {amount && <span className="font-semibold">{amount}</span>}
      </div>
      <div className="flex gap-2 mt-3">
        <button onClick={onView} className="flex-1 px-3 py-1.5 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">
          View
        </button>
        <button onClick={onDelete} className="px-3 py-1.5 bg-red-50 text-red-600 rounded text-xs hover:bg-red-100">
          Delete
        </button>
      </div>
    </div>
  );
};

export default DocumentCard;
