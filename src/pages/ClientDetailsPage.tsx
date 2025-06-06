
import React from 'react';
import { useParams } from 'react-router-dom';
import { ClientDetail } from '@/components/ClientDetail';

const ClientDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold text-destructive">Client not found</h1>
        <p className="text-muted-foreground">The requested client could not be found.</p>
      </div>
    );
  }

  return <ClientDetail clientId={id} />;
};

export default ClientDetailsPage;
