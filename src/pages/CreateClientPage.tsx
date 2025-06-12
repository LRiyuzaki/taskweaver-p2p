
import React from 'react';
import { Header } from '@/components/Header';
import { EnhancedClientForm } from '@/components/EnhancedClientForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const CreateClientPage = () => {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-6">
          <Card>
            <CardHeader>
              <CardTitle>Create New Client</CardTitle>
              <CardDescription>Add a new client to your practice management system</CardDescription>
            </CardHeader>
            <CardContent>
              <EnhancedClientForm />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default CreateClientPage;
