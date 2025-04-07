
import React from 'react';
import { Header } from "@/components/Header";
import { AppDocumentation } from "@/components/AppDocumentation";

const HelpPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 overflow-y-auto py-6">
        <AppDocumentation />
      </main>
    </div>
  );
};

export default HelpPage;
