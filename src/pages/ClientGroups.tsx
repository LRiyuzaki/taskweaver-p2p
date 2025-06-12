
import React from 'react';
import { Header } from '@/components/Header';
import { ClientGroupList } from '@/components/ClientGroupList';

const ClientGroups = () => {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-6">
          <ClientGroupList />
        </div>
      </main>
    </div>
  );
};

export default ClientGroups;
