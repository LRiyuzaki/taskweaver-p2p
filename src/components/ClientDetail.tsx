import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Building, Mail, Phone, Pencil, Trash2, FileText, Calendar, Check, X, BookOpen, Receipt } from "lucide-react";
import { useClientContext } from '@/contexts/ClientContext';
import { useTaskContext } from '@/contexts/TaskContext';
import { ClientDocuments } from './ClientDocuments';
import { ClientTimeline } from './ClientTimeline';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ClientForm } from "./ClientForm";
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { ClientServicesTab } from './ClientServicesTab';
import { ProgressBar } from './ui/progress-bar';
import { cn } from '@/lib/utils';

interface ClientDetailProps {
  clientId: string;
  onBack: () => void;
}

export const ClientDetail: React.FC<ClientDetailProps> = ({ clientId, onBack }) => {
  const { getClientById, updateClient, deleteClient, getAvailableServiceNames } = useClientContext();
  const { tasks, deleteTasks } = useTaskContext();
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isUpdateConfirmDialogOpen, setIsUpdateConfirmDialogOpen] = useState(false);
  const [updatedClientData, setUpdatedClientData] = useState<any>(null);
  
  const client = getClientById(clientId);
  const availableServices = getAvailableServiceNames();
  
  if (!client) {
    return (
      <div className="text-center p-12">
        <h2 className="text-xl font-semibold mb-2">Client Not Found</h2>
        <p className="text-muted-foreground mb-6">The requested client could not be found.</p>
        <Button onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Clients
        </Button>
      </div>
    );
  }
  
  const clientTasks = tasks.filter(task => task.clientId === clientId);
  const pendingTasks = clientTasks.filter(task => task.status !== 'done').length;
  const completedTasks = clientTasks.filter(task => task.status === 'done').length;
  
  const taskCompletionPercent = clientTasks.length > 0 
    ? Math.round((completedTasks / clientTasks.length) * 100) 
    : 0;
  
  const handleEditSubmit = (formData: any) => {
    setUpdatedClientData(formData);
    setIsEditDialogOpen(false);
    setIsUpdateConfirmDialogOpen(true);
  };

  const confirmUpdate = () => {
    if (updatedClientData) {
      updateClient(clientId, updatedClientData);
      setIsUpdateConfirmDialogOpen(false);
      setUpdatedClientData(null);
      toast({
        title: "Client Updated",
        description: "Client information has been updated successfully."
      });
    }
  };
  
  const handleDelete = () => {
    // Delete all associated tasks first
    const tasksToDelete = tasks.filter(task => task.clientId === clientId);
    if (tasksToDelete.length > 0) {
      deleteTasks(tasksToDelete.map(task => task.id));
    }
    
    // Then delete the client
    deleteClient(clientId);
    setIsDeleteDialogOpen(false);
    onBack();
    toast({
      title: "Client Deleted",
      description: "The client and all associated data have been deleted successfully."
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between">
            <div>
              <CardTitle className="text-2xl">{client?.name}</CardTitle>
              <CardDescription>{client?.company}</CardDescription>
            </div>
            <div className="flex space-x-1">
              {client && Object.entries(client.requiredServices)
                .filter(([_, isRequired]) => isRequired)
                .map(([serviceName]) => (
                  <Badge key={serviceName}>{serviceName}</Badge>
                ))
              }
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Contact Information</h3>
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>Company: {client.company}</span>
                </div>
                {client.contactPerson && (
                  <div className="flex items-center text-sm">
                    <span className="h-4 w-4 mr-2" />
                    <span>Contact Person: {client.contactPerson}</span>
                  </div>
                )}
                <div className="flex items-center text-sm">
                  <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>Email: {client.email}</span>
                </div>
                {client.phone && (
                  <div className="flex items-center text-sm">
                    <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Phone: {client.phone}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Compliance Information</h3>
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>Client Since: {client.startDate ? format(new Date(client.startDate), 'MMMM d, yyyy') : 'Not specified'}</span>
                </div>
                <div className="flex items-center text-sm">
                  <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>Entity Type: {client.entityType || 'Not specified'}</span>
                </div>
                {client.gstin && (
                  <div className="flex items-center text-sm">
                    <span className="h-4 w-4 mr-2" />
                    <span>GSTIN: {client.gstin}</span>
                  </div>
                )}
                {client.pan && (
                  <div className="flex items-center text-sm">
                    <span className="h-4 w-4 mr-2" />
                    <span>PAN: {client.pan}</span>
                  </div>
                )}
                {client.tan && (
                  <div className="flex items-center text-sm">
                    <Receipt className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>TAN: {client.tan}</span>
                  </div>
                )}
                {client.entityType === 'Company' && client.cin && (
                  <div className="flex items-center text-sm">
                    <Receipt className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>CIN: {client.cin}</span>
                  </div>
                )}
                {client.entityType === 'LLP' && client.llpin && (
                  <div className="flex items-center text-sm">
                    <Receipt className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>LLPIN: {client.llpin}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 border-t pt-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Services</h3>
              <div className="space-y-2">
                {client && availableServices.map(serviceName => (
                  <div key={serviceName} className="flex items-center text-sm">
                    {client.requiredServices[serviceName] ? (
                      <Check className="h-4 w-4 mr-2 text-green-600" />
                    ) : (
                      <X className="h-4 w-4 mr-2 text-muted-foreground" />
                    )}
                    <span>{serviceName}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Tasks</h3>
              <div className="flex flex-col space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Task Completion:</span>
                    <span className="font-medium">{taskCompletionPercent}%</span>
                  </div>
                  <ProgressBar 
                    value={taskCompletionPercent} 
                    variant={taskCompletionPercent === 100 ? "success" : 
                             taskCompletionPercent >= 50 ? "warning" : "default"}
                    className="h-2"
                  />
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>Pending Tasks:</span>
                  <Badge variant="outline">{pendingTasks}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Completed Tasks:</span>
                  <Badge variant="outline">{completedTasks}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Total Tasks:</span>
                  <Badge variant="outline">{clientTasks.length}</Badge>
                </div>
              </div>
            </div>
          </div>
          
          {client.address && (
            <div className="mt-6 border-t pt-4">
              <h3 className="text-sm font-medium mb-2">Address</h3>
              <p className="text-sm whitespace-pre-wrap">
                {typeof client.address === 'string' 
                  ? client.address 
                  : client.address.registered || client.address.business || ''}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Client Overview</CardTitle>
              <CardDescription>Key information and metrics for this client</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Client overview dashboard with key metrics coming soon.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="services" className="mt-6">
          <ClientServicesTab client={client} />
        </TabsContent>
        
        <TabsContent value="documents" className="mt-6">
          <ClientDocuments clientId={clientId} clientName={client.name} />
        </TabsContent>
        
        <TabsContent value="tasks" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tasks</CardTitle>
              <CardDescription>Manage this client's tasks</CardDescription>
            </CardHeader>
            <CardContent>
              {clientTasks.length > 0 ? (
                <div className="divide-y">
                  {clientTasks.map(task => (
                    <div key={task.id} className="py-3 flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">{task.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {task.dueDate 
                            ? `Due: ${format(new Date(task.dueDate), 'MMM d, yyyy')}`
                            : 'No due date'}
                        </p>
                        {task.description && (
                          <p className="text-sm mt-1">{task.description}</p>
                        )}
                      </div>
                      <div className="flex items-center">
                        <Badge className={cn(
                          "mr-2",
                          task.status === 'todo' ? "bg-slate-500" :
                          task.status === 'inProgress' ? "bg-blue-500" : 
                          "bg-green-500"
                        )}>
                          {task.status === 'todo' ? 'To Do' : 
                           task.status === 'inProgress' ? 'In Progress' : 'Done'}
                        </Badge>
                        <Button size="sm" variant="outline">View</Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-4">No tasks found for this client</p>
                  <Button>Create Task</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="timeline" className="mt-6">
          <ClientTimeline clientId={clientId} tasks={tasks} />
        </TabsContent>
      </Tabs>
      
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Client</DialogTitle>
            <DialogDescription>
              Update client information and services.
            </DialogDescription>
          </DialogHeader>
          <ClientForm client={client} onSubmit={handleEditSubmit} />
        </DialogContent>
      </Dialog>
      
      <Dialog open={isUpdateConfirmDialogOpen} onOpenChange={setIsUpdateConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Update</DialogTitle>
            <DialogDescription>
              Are you sure you want to update this client's information?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpdateConfirmDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmUpdate}>
              Update Client
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Client</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this client? This action cannot be undone.
              All associated tasks, documents, and data will also be deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Client and All Related Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
