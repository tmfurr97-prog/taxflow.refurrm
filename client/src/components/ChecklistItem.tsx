import React from 'react';

interface ChecklistItemProps {
  title: string;
  description: string;
  completed: boolean;
  onToggle?: () => void;
}

const ChecklistItem: React.FC<ChecklistItemProps> = ({ 
  title, 
  description, 
  completed,
  onToggle 
}) => {
  return (
    <div 
      className={`flex items-start gap-4 p-4 rounded-lg border-2 transition-all ${
        completed 
          ? 'bg-green-50 border-green-300' 
          : 'bg-white border-gray-200 hover:border-blue-300'
      } ${onToggle ? 'cursor-pointer' : ''}`}
      onClick={onToggle}
    >
      <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
        completed 
          ? 'bg-green-500 border-green-500' 
          : 'border-gray-300'
      }`}>
        {completed && (
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <div className="flex-1">
        <h4 className={`font-semibold ${completed ? 'text-green-900' : 'text-gray-900'}`}>
          {title}
        </h4>
        <p className={`text-sm mt-1 ${completed ? 'text-green-700' : 'text-gray-600'}`}>
          {description}
        </p>
      </div>
    </div>
  );
};

export default ChecklistItem;
