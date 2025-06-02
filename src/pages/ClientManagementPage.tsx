
import React, { useState, useEffect } from 'react';
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  UsersIcon, 
  Plus, 
  FileTextIcon, 
  Briefcase,
  ClipboardIcon,
  Search,
  RefreshCw,
  Filter
} from "lucide-react";
import { useSupabaseClientContext } from "@/contexts/SupabaseClientContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ClientForm } from "@/components/ClientForm";
import { ClientList } from "@/components/ClientList";
import { ClientDetail } from "@/components/ClientDetail";
import { ServicesManagement } from "@/components/ServicesManagement";
import { Input } from "@/components/ui/input";
import { toast } from '@/hooks/use-toast';
import { SeedDataButton } from "@/components/SeedDataButton";
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

const ClientManagementPage = () => {
  const { clients, createClient, loading } = useSupabaseClientContext();
  const [isAddClientDialogOpen, setIsAddClientDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('clients');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [serviceFilters, setServiceFilters] = useState<string[]>([]);

  // Get available services from clients
  const getAvailableServiceNames = () => {
    const services = new Set<string>();
    clients.forEach(client => {
      if (client.services) {
        client.services.forEach(service => {
          if (typeof service === 'string') {
            services.add(service);
          } else if (service && typeof service === 'object' && 'name' in service) {
            services.add(service.name);
          }
        });
      }
    });
    return Array.from(services);
  };

  const availableServices = getAvailableServiceNames();

  const handleClientClick = (clientId: string) => {
    setSelectedClientId(clientId);
  };

  const handleAddClientSubmit = async (formData: any) => {
    try {
      await createClient(formData);
      setIsAddClientDialogOpen(false);
      toast({
        title: "Client Created",
        description: `${formData.name} has been added successfully.`,
      });
    } catch (error) {
      console.error("Error adding client:", error);
      toast({
        title: "Error",
        description: "There was a problem creating the client. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBackToList = () => {
    setSelectedClientId(null);
  };

  const toggleServiceFilter = (service: string) => {
    setServiceFilters(prev => {
      if (prev.includes(service)) {
        return prev.filter(s => s !== service);
      }
      return [...prev, service];
    });
  };

  // Filter clients based on search term and service filters
  const filteredClients = clients.filter(client => {
    // First check search term
    const matchesSearch = 
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.contactPerson && client.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.phone && client.phone.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Then check if we need to filter by services
    if (serviceFilters.length === 0) return matchesSearch;
    
    // Check if client has any of the required services
    return matchesSearch && serviceFilters.some(service => 
      client.services && client.services.some(clientService => 
        typeof clientService === 'string' ? clientService === service : clientService.name === service
      )
    );
  });

  if (loading) {
    return (
      <div className="flex flex-col h-screen">
        <Header />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading clients...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

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
            <div className="flex items-center space-x-2">
              <SeedDataButton />
              <Button onClick={() => setIsAddClientDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Client
              </Button>
            </div>
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
              {!selectedClientId && (
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search clients..." 
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  {availableServices.length > 0 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="gap-1">
                          <Filter className="h-4 w-4" />
                          Filter
                          {serviceFilters.length > 0 && (
                            <Badge variant="secondary" className="ml-1 h-5 px-1">
                              {serviceFilters.length}
                            </Badge>
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem disabled className="font-semibold">
                          Filter by Service
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {availableServices.map(service => (
                          <DropdownMenuCheckboxItem
                            key={service}
                            checked={serviceFilters.includes(service)}
                            onCheckedChange={() => toggleServiceFilter(service)}
                          >
                            {service}
                          </DropdownMenuCheckboxItem>
                        ))}
                        {serviceFilters.length > 0 && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setServiceFilters([])}>
                              Clear Filters
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                  
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => {
                      setSearchTerm('');
                      setServiceFilters([]);
                    }}
                    disabled={searchTerm === '' && serviceFilters.length === 0}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {selectedClientId ? (
                <ClientDetail 
                  clientId={selectedClientId} 
                  onBack={handleBackToList}
                />
              ) : (
                <>
                  <ClientList 
                    clients={filteredClients}
                    onClientClick={handleClientClick}
                  />
                  
                  {filteredClients.length === 0 && searchTerm !== '' && (
                    <div className="text-center p-8 border rounded-lg bg-muted/20">
                      <p className="text-muted-foreground">No clients match your search criteria.</p>
                      <Button 
                        variant="link" 
                        onClick={() => setSearchTerm('')}
                        className="mt-2"
                      >
                        Clear Search
                      </Button>
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            <TabsContent value="services" className="space-y-6">
              <ServicesManagement />
            </TabsContent>

            <TabsContent value="reports" className="space-y-6">
              <div className="bg-muted/50 p-8 rounded-lg text-center">
                <h3 className="text-xl font-medium mb-2">Reports Coming Soon</h3>
                <p className="text-muted-foreground mb-4">
                  Generate comprehensive reports for compliance tracking and team performance.
                </p>
                <Button onClick={() => window.location.href = '/reports'}>
                  Go to Reports
                </Button>
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
