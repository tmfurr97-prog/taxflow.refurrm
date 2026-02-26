import React, { useState } from 'react';
import ChecklistItem from './ChecklistItem';

const YearEndChecklist: React.FC = () => {
  const [items, setItems] = useState([
    { id: 1, title: 'Review all uploaded documents', description: 'Verify all receipts and statements are accurate', completed: true },
    { id: 2, title: 'Categorize expenses', description: 'Ensure all expenses are properly categorized', completed: true },
    { id: 3, title: 'Check medical expenses', description: 'Review healthcare and medical deductions', completed: true },
    { id: 4, title: 'Verify charitable donations', description: 'Confirm all donation receipts are uploaded', completed: false },
    { id: 5, title: 'Review business expenses', description: 'Check home office and business deductions', completed: false },
    { id: 6, title: 'Confirm education expenses', description: 'Verify tuition and student loan interest', completed: false },
    { id: 7, title: 'Check retirement contributions', description: 'Review IRA and 401(k) contributions', completed: false },
    { id: 8, title: 'Verify investment income', description: 'Ensure all investment documents are included', completed: false },
    { id: 9, title: 'Review state tax documents', description: 'Check state-specific deductions', completed: false },
    { id: 10, title: 'Final accuracy check', description: 'Review all data for accuracy before lock', completed: false },
  ]);

  const toggleItem = (id: number) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const completedCount = items.filter(item => item.completed).length;
  const progress = (completedCount / items.length) * 100;

  return (
    <div>
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-gray-700">Progress</span>
          <span className="text-sm font-semibold text-blue-600">{completedCount}/{items.length} Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-blue-600 to-green-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="space-y-3">
        {items.map(item => (
          <ChecklistItem
            key={item.id}
            title={item.title}
            description={item.description}
            completed={item.completed}
            onToggle={() => toggleItem(item.id)}
          />
        ))}
      </div>

      <div className="mt-6 p-4 bg-amber-50 border-2 border-amber-200 rounded-lg">
        <p className="text-sm text-amber-800">
          <strong>Year-End Lock:</strong> Data entry closes December 31. Complete verification before the deadline (optional, no fine for skipping).
        </p>
      </div>
    </div>
  );
};

export default YearEndChecklist;
