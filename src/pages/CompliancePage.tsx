
import React from 'react';
import { ComplianceDashboard } from '@/components/ComplianceDashboard';

const CompliancePage: React.FC = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Compliance Management</h1>
      <ComplianceDashboard />
    </div>
  );
};

export default CompliancePage;
