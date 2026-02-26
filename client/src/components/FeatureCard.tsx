import React from 'react';

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  onClick?: () => void;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, onClick }) => {
  return (
    <div 
      className={`bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <img src={icon} alt={title} className="w-16 h-16 mb-4" />
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
    </div>
  );
};

export default FeatureCard;
