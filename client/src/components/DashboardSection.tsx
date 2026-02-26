import React from 'react';
import StatusCard from './StatusCard';
import DocumentCard from './DocumentCard';

interface DashboardSectionProps {
  documents: any[];
  onViewDocument: (id: number) => void;
  onDeleteDocument: (id: number) => void;
}

const DashboardSection: React.FC<DashboardSectionProps> = ({ documents, onViewDocument, onDeleteDocument }) => {
  const stats = {
    totalDocuments: documents.length,
    verified: documents.filter(d => d.status === 'verified').length,
    pending: documents.filter(d => d.status === 'pending').length,
    totalExpenses: documents.reduce((sum, d) => sum + (parseFloat(d.amount?.replace('$', '').replace(',', '')) || 0), 0)
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Your Dashboard</h2>
      
      <div className="grid md:grid-cols-4 gap-6 mb-12">
        <StatusCard
          title="Total Documents"
          value={stats.totalDocuments}
          subtitle="Uploaded this year"
          color="blue"
          icon="https://d64gsuwffb70l.cloudfront.net/68e7f2c7e795b22e67db6507_1760031501613_189dbb3d.webp"
        />
        <StatusCard
          title="Verified"
          value={stats.verified}
          subtitle="Ready for filing"
          color="green"
          icon="https://d64gsuwffb70l.cloudfront.net/68e7f2c7e795b22e67db6507_1760031500874_a86bd56b.webp"
        />
        <StatusCard
          title="Pending Review"
          value={stats.pending}
          subtitle="Needs attention"
          color="amber"
          icon="https://d64gsuwffb70l.cloudfront.net/68e7f2c7e795b22e67db6507_1760031503754_34313055.webp"
        />
        <StatusCard
          title="Total Expenses"
          value={`$${stats.totalExpenses.toLocaleString()}`}
          subtitle="Tracked expenses"
          color="navy"
        />
      </div>

      <div className="mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Recent Documents</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.slice(0, 12).map(doc => (
            <DocumentCard
              key={doc.id}
              name={doc.name}
              category={doc.category}
              date={doc.date}
              amount={doc.amount}
              status={doc.status}
              onView={() => onViewDocument(doc.id)}
              onDelete={() => onDeleteDocument(doc.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardSection;
