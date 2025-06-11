
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { ClientDetail } from '@/components/ClientDetail';

const ClientDetailsPage = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();

  if (!clientId) {
    return (
      <div className="flex flex-col h-screen">
        <Header />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 py-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">Client Not Found</h1>
              <p className="text-muted-foreground">The requested client could not be found.</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const handleBack = () => {
    navigate('/clients');
  };

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto px-4 py-6">
          <ClientDetail clientId={clientId} onBack={handleBack} />
        </div>
      </main>
    </div>
  );
};

export default ClientDetailsPage;
