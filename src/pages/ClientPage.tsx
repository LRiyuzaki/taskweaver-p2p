import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Trash2, Download, Share, Calendar, Bell, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useClientContext } from '@/contexts/ClientContext';
import { useTaskContext } from '@/contexts/TaskContext';
import { ClientForm } from '@/components/ClientForm';
import { ClientTimeline } from '@/components/ClientTimeline';
import { ClientDocuments } from '@/components/ClientDocuments';
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { ClientServiceManager } from '@/components/ClientServiceManager';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast-extensions';

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
  const { tasks, addTask } = useTaskContext();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isReminderDialogOpen, setIsReminderDialogOpen] = useState(false);
  
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
    toast.success("Client updated successfully");
  };

  const handleDeleteClient = () => {
    deleteClient(clientId || '');
    navigate('/client-management');
    toast.success("Client deleted successfully");
  };
  
  const handleCreateReminder = () => {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);
    
    addTask({
      title: `Follow-up with ${client.name}`,
      description: `Scheduled follow-up for ${client.name}`,
      status: 'todo',
      priority: 'medium',
      dueDate,
      tags: ['Follow-up', 'Client'],
      clientId: clientId || '',
      assignedTo: '',
      recurrence: 'none'
    });
    
    setIsReminderDialogOpen(false);
    toast.success("Reminder created successfully");
  };

  const handleExportClientData = () => {
    toast.success("Client data exported successfully");
  };

  const getActiveServices = () => {
    if (!client.requiredServices) return [];
    
    return Object.entries(client.requiredServices)
      .filter(([_, isRequired]) => isRequired)
      .map(([serviceName]) => serviceName);
  };
  
  const activeServices = getActiveServices();
  
  const clientTasks = tasks.filter(task => task.clientId === clientId);
  const pendingTasks = clientTasks.filter(task => task.status !== 'done').length;
  const completedTasks = clientTasks.filter(task => task.status === 'done').length;

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
            <Button variant="outline" onClick={() => setIsReminderDialogOpen(true)}>
              <Bell className="h-4 w-4 mr-2" />
              Set Reminder
            </Button>
            <Button variant="outline" onClick={handleExportClientData}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
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
              <h3 className="text-base font-medium mb-4">Client Summary</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Services</h4>
                  {activeServices.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {activeServices.map(serviceName => (
                        <Badge key={serviceName} variant="secondary">{serviceName}</Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">No services selected</p>
                  )}
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Tasks</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-muted/30 p-2 rounded text-center">
                      <div className="text-xl font-semibold">{pendingTasks}</div>
                      <div className="text-xs text-muted-foreground">Pending</div>
                    </div>
                    <div className="bg-muted/30 p-2 rounded text-center">
                      <div className="text-xl font-semibold">{completedTasks}</div>
                      <div className="text-xs text-muted-foreground">Completed</div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Compliance Status</h4>
                  <div className="flex items-center">
                    <div className={cn(
                      "w-3 h-3 rounded-full mr-2",
                      pendingTasks === 0 ? "bg-green-500" : "bg-amber-500"
                    )}></div>
                    <span>{pendingTasks === 0 ? "All compliant" : "Pending items"}</span>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Next Follow-up</h4>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>
                      {clientTasks.some(task => task.status !== 'done' && task.dueDate) 
                        ? format(new Date(clientTasks.filter(task => task.status !== 'done' && task.dueDate)
                            .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())[0].dueDate!), 
                          'MMM d, yyyy')
                        : 'No scheduled follow-ups'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="timeline" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="timeline">Activity Timeline</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
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
          
          <TabsContent value="tasks" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Client Tasks</h2>
              <Button onClick={() => navigate(`/tasks?clientId=${clientId}`)}>
                View All Tasks
              </Button>
            </div>
            
            {clientTasks.length > 0 ? (
              <div className="space-y-4">
                {clientTasks.map(task => (
                  <Card key={task.id} className={cn(
                    "overflow-hidden",
                    task.status === 'done' ? "border-green-200 bg-green-50/30" : ""
                  )}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-base font-medium">{task.title}</h3>
                            <Badge variant={
                              task.priority === 'high' ? "destructive" : 
                              task.priority === 'medium' ? "default" : "outline"
                            }>
                              {task.priority}
                            </Badge>
                            <Badge variant={
                              task.status === 'todo' ? "outline" :
                              task.status === 'inProgress' ? "secondary" : "default"
                            }>
                              {task.status === 'todo' ? 'To Do' :
                                task.status === 'inProgress' ? 'In Progress' : 'Complete'}
                            </Badge>
                          </div>
                          
                          {task.description && (
                            <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                          )}
                          
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Clock className="h-3 w-3 mr-1" />
                            {task.dueDate ? 
                              `Due: ${format(new Date(task.dueDate), 'MMM d, yyyy')}` : 
                              'No due date'}
                          </div>
                        </div>
                        
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => navigate(`/tasks/${task.id}`)}
                        >
                          View
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <p className="text-muted-foreground mb-4">No tasks found for this client</p>
                  <Button onClick={() => navigate(`/tasks/new?clientId=${clientId}`)}>
                    Create Task
                  </Button>
                </CardContent>
              </Card>
            )}
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
        
        <Dialog open={isReminderDialogOpen} onOpenChange={setIsReminderDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Set Reminder</DialogTitle>
              <DialogDescription>
                Create a follow-up task for this client.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p>A follow-up task will be created for {client.name} with a due date of 7 days from today.</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsReminderDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateReminder}>
                Create Reminder
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default ClientPage;
