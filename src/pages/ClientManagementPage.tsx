
import React, { useState } from 'react';
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  UsersIcon, 
  Plus, 
  FileTextIcon, 
  Briefcase,
  ClipboardIcon
} from "lucide-react";
import { useClientContext } from "@/contexts/ClientContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ClientForm } from "@/components/ClientForm";
import { ClientList } from "@/components/ClientList";
import { ClientDetail } from "@/components/ClientDetail";
import { ServicesManagement } from "@/components/ServicesManagement";

const ClientManagementPage = () => {
  const { clients, serviceTypes, addClient } = useClientContext();
  const [isAddClientDialogOpen, setIsAddClientDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('clients');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  const handleClientClick = (clientId: string) => {
    setSelectedClientId(clientId);
  };

  const handleAddClientSubmit = (formData: any) => {
    addClient(formData);
    setIsAddClientDialogOpen(false);
  };

  const handleBackToList = () => {
    setSelectedClientId(null);
  };

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold flex items-center">
              <UsersIcon className="mr-2 h-8 w-8" /> 
              Client Management
            </h1>
            <Button onClick={() => setIsAddClientDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Client
            </Button>
          </div>

          <Tabs 
            value={activeTab} 
            onValueChange={(value) => {
              setActiveTab(value);
              setSelectedClientId(null);
            }}
            className="w-full"
          >
            <TabsList className="mb-6">
              <TabsTrigger value="clients" className="flex items-center gap-1">
                <UsersIcon className="h-4 w-4" />
                Clients
              </TabsTrigger>
              <TabsTrigger value="services" className="flex items-center gap-1">
                <Briefcase className="h-4 w-4" />
                Services
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center gap-1">
                <FileTextIcon className="h-4 w-4" />
                Reports
              </TabsTrigger>
              <TabsTrigger value="templates" className="flex items-center gap-1">
                <ClipboardIcon className="h-4 w-4" />
                Templates
              </TabsTrigger>
            </TabsList>

            <TabsContent value="clients" className="space-y-6">
              {selectedClientId ? (
                <ClientDetail 
                  clientId={selectedClientId} 
                  onBack={handleBackToList}
                />
              ) : (
                <ClientList 
                  clients={clients}
                  onClientClick={handleClientClick}
                />
              )}
            </TabsContent>

            <TabsContent value="services" className="space-y-6">
              <ServicesManagement />
            </TabsContent>

            <TabsContent value="reports" className="space-y-6">
              <div className="bg-muted/50 p-8 rounded-lg text-center">
                <h3 className="text-xl font-medium mb-2">Reports Coming Soon</h3>
                <p className="text-muted-foreground">
                  Generate comprehensive reports for compliance tracking and team performance.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="templates" className="space-y-6">
              <div className="bg-muted/50 p-8 rounded-lg text-center">
                <h3 className="text-xl font-medium mb-2">Templates Coming Soon</h3>
                <p className="text-muted-foreground">
                  Create customizable templates for different client types and service packages.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Dialog open={isAddClientDialogOpen} onOpenChange={setIsAddClientDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Add New Client</DialogTitle>
            <DialogDescription>
              Enter client information to add them to your management system.
            </DialogDescription>
          </DialogHeader>
          <ClientForm onSubmit={handleAddClientSubmit} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientManagementPage;
