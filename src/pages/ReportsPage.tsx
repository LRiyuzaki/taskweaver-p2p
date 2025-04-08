
import React from 'react';
import { Header } from "@/components/Header";

const ReportsPage = () => {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Reports</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Report cards will go here */}
        </div>
      </main>
    </div>
  );
};

// Adding the export default to the ReportsPage component
export default ReportsPage;
