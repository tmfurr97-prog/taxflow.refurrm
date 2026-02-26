import React from 'react';

interface StatusCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
  color?: 'green' | 'blue' | 'amber' | 'navy';
  onClick?: () => void;
}

const StatusCard: React.FC<StatusCardProps> = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  color = 'blue',
  onClick 
}) => {
  const colorClasses = {
    green: 'bg-green-50 border-green-200 text-green-700',
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    amber: 'bg-amber-50 border-amber-200 text-amber-700',
    navy: 'bg-slate-50 border-slate-200 text-slate-700'
  };

  return (
    <div 
      className={`p-6 rounded-xl border-2 ${colorClasses[color]} transition-all hover:shadow-lg ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      {icon && <img src={icon} alt={title} className="w-12 h-12 mb-3" />}
      <h3 className="text-sm font-semibold uppercase tracking-wide opacity-75">{title}</h3>
      <p className="text-3xl font-bold mt-2">{value}</p>
      {subtitle && <p className="text-sm mt-2 opacity-75">{subtitle}</p>}
    </div>
  );
};

export default StatusCard;
