
import React, { useState } from 'react';
import { useClientContext } from "@/contexts/ClientContext";
import { useTaskContext } from "@/contexts/TaskContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ClientForm } from "@/components/ClientForm";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Building, 
  Calendar,
  Mail, 
  Phone, 
  MapPin, 
  Edit, 
  FileText,
  ClipboardCheck
} from "lucide-react";
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskListView } from "@/components/TaskListView";

interface ClientDetailProps {
  clientId: string;
  onBack: () => void;
}

export const ClientDetail: React.FC<ClientDetailProps> = ({ clientId, onBack }) => {
  const { getClientById, updateClient, serviceTypes, clientServices } = useClientContext();
  const client = getClientById(clientId);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  if (!client) {
    return (
      <div className="text-center py-8">
        <p>Client not found.</p>
        <Button variant="link" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Client List
        </Button>
      </div>
    );
  }

  const clientServiceList = clientServices
    .filter(service => service.clientId === clientId)
    .map(service => {
      const serviceType = serviceTypes.find(type => type.id === service.serviceTypeId);
      return {
        ...service,
        name: serviceType?.name || 'Unknown Service',
        description: serviceType?.description || '',
        frequency: serviceType?.frequency || 'monthly'
      };
    });

  const handleEditClient = (formData: any) => {
    updateClient(clientId, formData);
    setIsEditDialogOpen(false);
  };

  return (
    <div>
      <div className="mb-6">
        <Button variant="outline" onClick={onBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Client List
        </Button>
        
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center">
            <Building className="mr-2 h-6 w-6" /> 
            {client.name}
          </h2>
          <Button onClick={() => setIsEditDialogOpen(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Client
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Client Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="font-medium text-sm text-muted-foreground">Contact Person</p>
                <p>{client.contactPerson || '-'}</p>
              </div>
              
              <div className="space-y-2">
                <p className="font-medium text-sm text-muted-foreground">Contact Details</p>
                <div className="space-y-1">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                    {client.email}
                  </div>
                  {client.phone && (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                      {client.phone}
                    </div>
                  )}
                </div>
              </div>
              
              {client.address && (
                <div className="space-y-2">
                  <p className="font-medium text-sm text-muted-foreground">Address</p>
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground mt-1" />
                    <p>{client.address}</p>
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <p className="font-medium text-sm text-muted-foreground">Client Since</p>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  {client.startDate 
                    ? format(client.startDate, 'PPP')
                    : format(client.createdAt, 'PPP')}
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="font-medium text-sm text-muted-foreground">Compliance Requirements</p>
                <div className="flex flex-wrap gap-2">
                  {client.gstRequired && (
                    <Badge variant="secondary">GST</Badge>
                  )}
                  {client.incomeTaxRequired && (
                    <Badge variant="secondary">Income Tax</Badge>
                  )}
                  {client.tdsRequired && (
                    <Badge variant="secondary">TDS</Badge>
                  )}
                  {client.auditRequired && (
                    <Badge variant="secondary">Audit</Badge>
                  )}
                </div>
              </div>
              
              {(client.entityType || client.gstin || client.pan) && (
                <div className="space-y-2">
                  <p className="font-medium text-sm text-muted-foreground">Entity Details</p>
                  <div className="space-y-1">
                    {client.entityType && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Entity Type:</span>
                        <span>{client.entityType}</span>
                      </div>
                    )}
                    {client.gstin && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">GSTIN:</span>
                        <span className="font-mono">{client.gstin}</span>
                      </div>
                    )}
                    {client.pan && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">PAN:</span>
                        <span className="font-mono">{client.pan}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Services</CardTitle>
              <CardDescription>Services subscribed by this client</CardDescription>
            </CardHeader>
            <CardContent>
              {clientServiceList.length > 0 ? (
                <div className="space-y-4">
                  {clientServiceList.map((service) => (
                    <div 
                      key={service.serviceTypeId} 
                      className="border rounded-md p-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{service.name}</h4>
                          <p className="text-sm text-muted-foreground">{service.description}</p>
                        </div>
                        <Badge variant={service.status === 'active' ? 'default' : 'outline'}>
                          {service.status === 'active' ? 'Active' : service.status}
                        </Badge>
                      </div>
                      
                      <div className="mt-2 text-sm">
                        <div className="flex justify-between text-muted-foreground">
                          <span>Frequency:</span>
                          <span className="capitalize">{service.frequency}</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                          <span>Start Date:</span>
                          <span>{format(service.startDate, 'PP')}</span>
                        </div>
                        {service.endDate && (
                          <div className="flex justify-between text-muted-foreground">
                            <span>End Date:</span>
                            <span>{format(service.endDate, 'PP')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <ClipboardCheck className="mx-auto h-8 w-8 mb-2 opacity-50" />
                  <p>No services configured</p>
                  <p className="text-sm">Add services to start generating tasks</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Client Tasks
              </CardTitle>
              <CardDescription>
                View and manage tasks related to this client
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="pending">
                <TabsList className="mb-4">
                  <TabsTrigger value="pending">Pending Tasks</TabsTrigger>
                  <TabsTrigger value="completed">Completed Tasks</TabsTrigger>
                  <TabsTrigger value="all">All Tasks</TabsTrigger>
                </TabsList>
                
                <TabsContent value="pending">
                  <TaskListView filterClient={clientId} />
                </TabsContent>
                
                <TabsContent value="completed">
                  <div className="bg-muted/50 p-8 rounded-lg text-center">
                    <h3 className="text-xl font-medium mb-2">Task History Coming Soon</h3>
                    <p className="text-muted-foreground">
                      View historical completed tasks for this client.
                    </p>
                  </div>
                </TabsContent>
                
                <TabsContent value="all">
                  <TaskListView filterClient={clientId} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Edit Client</DialogTitle>
          </DialogHeader>
          <ClientForm client={client} onSubmit={handleEditClient} />
        </DialogContent>
      </Dialog>
    </div>
  );
};
