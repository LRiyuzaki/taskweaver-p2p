
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useClientContext } from '@/contexts/ClientContext';
import { useTaskContext } from '@/contexts/TaskContext';
import { ClientForm } from '@/components/ClientForm';
import { ClientTimeline } from '@/components/ClientTimeline';
import { ClientDocuments } from '@/components/ClientDocuments';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ClientServiceManager } from '@/components/ClientServiceManager';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

const formatAddress = (address: any): ReactNode => {
  if (!address) return null;
  
  if (typeof address === 'string') {
    return <span>{address}</span>;
  }
  
  return <span>{address.registered}</span>;
};

const ClientPage = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const { getClientById, updateClient, deleteClient } = useClientContext();
  const { tasks } = useTaskContext();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const client = getClientById(clientId || '');
  
  if (!client) {
    return (
      <div className="flex flex-col h-screen">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Button 
            variant="outline" 
            onClick={() => navigate('/client-management')}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Clients
          </Button>
          <div className="flex flex-col items-center justify-center h-[50vh]">
            <h2 className="text-2xl font-bold mb-2">Client Not Found</h2>
            <p className="text-muted-foreground mb-4">The client you're looking for doesn't exist or has been deleted.</p>
            <Button onClick={() => navigate('/client-management')}>
              View All Clients
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const handleEditClient = (data: any) => {
    updateClient(clientId || '', data);
    setIsEditDialogOpen(false);
  };

  const handleDeleteClient = () => {
    deleteClient(clientId || '');
    navigate('/client-management');
  };

  const getActiveServices = () => {
    if (!client.requiredServices) return [];
    
    return Object.entries(client.requiredServices)
      .filter(([_, isRequired]) => isRequired)
      .map(([serviceName]) => serviceName);
  };
  
  const activeServices = getActiveServices();

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <Button 
          variant="outline" 
          onClick={() => navigate('/client-management')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Clients
        </Button>
        
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{client.name}</h1>
              {client.entityType && (
                <Badge variant="outline">{client.entityType}</Badge>
              )}
            </div>
            <p className="text-lg text-muted-foreground">{client.company}</p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="col-span-2">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                  <p className="text-base">{client.email}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Phone</h3>
                  <p className="text-base">{client.phone || 'Not provided'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Contact Person</h3>
                  <p className="text-base">{client.contactPerson || 'Not provided'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Client Since</h3>
                  <p className="text-base">{client.startDate ? format(client.startDate, 'MMMM d, yyyy') : 'Not provided'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">GSTIN</h3>
                  <p className="text-base">{client.gstin || 'Not provided'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">PAN</h3>
                  <p className="text-base">{client.pan || 'Not provided'}</p>
                </div>
                {client.address && (
                  <div className="col-span-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Address</h3>
                    {formatAddress(client.address)}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <h3 className="text-base font-medium mb-4">Services Required</h3>
              <div className="space-y-3">
                {activeServices.length > 0 ? (
                  activeServices.map(serviceName => (
                    <div key={serviceName} className="flex items-center justify-between">
                      <span>{serviceName}</span>
                      <Badge>Required</Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">No services selected for this client.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="timeline" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="timeline">Activity Timeline</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
          </TabsList>
          
          <TabsContent value="timeline">
            <ClientTimeline clientId={clientId || ''} tasks={tasks} />
          </TabsContent>
          
          <TabsContent value="documents">
            <ClientDocuments clientId={clientId || ''} clientName={client.name} />
          </TabsContent>
          
          <TabsContent value="services">
            <ClientServiceManager clientId={clientId || ''} clientName={client.name} />
          </TabsContent>
        </Tabs>
        
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Client</DialogTitle>
              <DialogDescription>
                Make changes to the client information below.
              </DialogDescription>
            </DialogHeader>
            <ClientForm client={client} onSubmit={handleEditClient} />
          </DialogContent>
        </Dialog>
        
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Client</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this client? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteClient}>
                Delete Client
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default ClientPage;
