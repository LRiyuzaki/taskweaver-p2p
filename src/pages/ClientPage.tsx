import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useClientContext } from '@/contexts/ClientContext';
import { useTaskContext } from '@/contexts/TaskContext';
import { Client } from '@/types/client';
import { Task, TaskStatus } from '@/types/task';
import { Header } from '@/components/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ClientDetailsTab } from '@/components/ClientDetailsTab';
import { ClientServicesTab } from '@/components/ClientServicesTab';
import { ClientTasksTab } from '@/components/ClientTasksTab';
import { ClientDocumentsTab } from '@/components/ClientDocumentsTab';
import { ClientNotesTab } from '@/components/ClientNotesTab';
import { ClientContactsTab } from '@/components/ClientContactsTab';
import { ClientFinancialsTab } from '@/components/ClientFinancialsTab';
import { ClientComplianceTab } from '@/components/ClientComplianceTab';
import { ClientActivityTab } from '@/components/ClientActivityTab';
import { ClientReportingTab } from '@/components/ClientReportingTab';
import { ClientSettingsTab } from '@/components/ClientSettingsTab';
import { ClientDeleteDialog } from '@/components/ClientDeleteDialog';
import { ClientEditDialog } from '@/components/ClientEditDialog';
import { toast } from '@/hooks/use-toast-extensions';
import { useClientTaskRelationship } from '@/hooks/useClientTaskRelationship';
import { useServiceAssignment } from '@/hooks/useServiceAssignment';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, FileText, Users, DollarSign, CheckSquare, Activity, BarChart2, Settings, Trash2, Edit, Plus } from 'lucide-react';

const ClientPage = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const { clients, deleteClient } = useClientContext();
  const { tasks, addTask } = useTaskContext();
  const { getClientTasks } = useClientTaskRelationship();
  const { getClientServicesWithRenewal } = useServiceAssignment();
  
  const [activeTab, setActiveTab] = useState('details');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const client = clients.find(c => c.id === clientId);
  const clientTasks = clientId ? getClientTasks(clientId) : [];
  const clientServices = clientId ? getClientServicesWithRenewal(clientId) : [];
  
  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [clientId]);
  
  const handleDeleteClient = async () => {
    if (!clientId) return;
    
    try {
      await deleteClient(clientId);
      toast.success('Client deleted successfully');
      navigate('/clients');
    } catch (error) {
      console.error('Error deleting client:', error);
      toast.error('Failed to delete client');
    }
  };
  
  const handleCreateComplianceTask = (serviceName: string, dueDate: Date) => {
    if (!client) return;
    
    try {
      const newTask: Omit<Task, 'id' | 'createdAt'> = {
        title: `${serviceName} for ${client.name}`,
        description: `Compliance task for ${serviceName}`,
        status: 'todo',
        priority: 'medium',
        dueDate: dueDate,
        tags: ['Compliance'],
        clientId: client.id,
        assignedTo: 'system',
        recurrence: 'none',
        updatedAt: new Date(),
        subtasks: []
      };
      
      addTask(newTask);
      toast.success('Compliance task created');
    } catch (error) {
      console.error('Error creating compliance task:', error);
      toast.error('Failed to create compliance task');
    }
  };
  
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-10 w-32" />
          </div>
          <Skeleton className="h-12 w-full mb-6" />
          <div className="grid gap-6">
            <Skeleton className="h-64 w-full" />
          </div>
        </main>
      </div>
    );
  }
  
  if (!client) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle>Client Not Found</CardTitle>
              <CardDescription>
                The client you are looking for does not exist or has been deleted.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/clients')}>
                Return to Clients
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }
  
  // Calculate client statistics
  const completedTasks = clientTasks.filter(task => task.status === 'done').length;
  const pendingTasks = clientTasks.filter(task => task.status !== 'done').length;
  const inProgressTasks = clientTasks.filter(task => task.status === 'in-progress').length;
  const reviewTasks = clientTasks.filter(task => task.status === 'review').length;
  const todoTasks = clientTasks.filter(task => task.status === 'todo').length;
  
  const activeServices = clientServices.filter(service => service.status === 'active').length;
  const inactiveServices = clientServices.filter(service => service.status === 'inactive').length;
  const overdueRenewals = clientServices.filter(service => service.isRenewalDue).length;
  
  const tabItems = [
    { id: 'details', label: 'Details', icon: <FileText className="h-4 w-4" /> },
    { id: 'services', label: 'Services', icon: <CheckSquare className="h-4 w-4" /> },
    { id: 'tasks', label: 'Tasks', icon: <Calendar className="h-4 w-4" /> },
    { id: 'documents', label: 'Documents', icon: <FileText className="h-4 w-4" /> },
    { id: 'notes', label: 'Notes', icon: <FileText className="h-4 w-4" /> },
    { id: 'contacts', label: 'Contacts', icon: <Users className="h-4 w-4" /> },
    { id: 'financials', label: 'Financials', icon: <DollarSign className="h-4 w-4" /> },
    { id: 'compliance', label: 'Compliance', icon: <CheckSquare className="h-4 w-4" /> },
    { id: 'activity', label: 'Activity', icon: <Activity className="h-4 w-4" /> },
    { id: 'reporting', label: 'Reporting', icon: <BarChart2 className="h-4 w-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="h-4 w-4" /> },
  ];
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">{client.name}</h1>
            <p className="text-muted-foreground">{client.company || 'Individual Client'}</p>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsEditDialogOpen(true)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{clientTasks.length}</div>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="outline">{completedTasks} Completed</Badge>
                <Badge variant="outline">{pendingTasks} Pending</Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Services</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{clientServices.length}</div>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="outline">{activeServices} Active</Badge>
                <Badge variant="outline">{inactiveServices} Inactive</Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {inProgressTasks > 0 ? 'Active' : 'Inactive'}
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="outline">{inProgressTasks} In Progress</Badge>
                <Badge variant="outline">{reviewTasks} In Review</Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Renewals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overdueRenewals}</div>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant={overdueRenewals > 0 ? "destructive" : "outline"}>
                  {overdueRenewals > 0 ? `${overdueRenewals} Overdue` : 'None Overdue'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="flex overflow-x-auto pb-2 scrollbar-hide">
            {tabItems.map(tab => (
              <TabsTrigger 
                key={tab.id} 
                value={tab.id}
                className="flex items-center"
              >
                {tab.icon}
                <span className="ml-2">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          
          <TabsContent value="details">
            <ClientDetailsTab client={client} />
          </TabsContent>
          
          <TabsContent value="services">
            <ClientServicesTab clientId={client.id} />
          </TabsContent>
          
          <TabsContent value="tasks">
            <ClientTasksTab clientId={client.id} />
          </TabsContent>
          
          <TabsContent value="documents">
            <ClientDocumentsTab clientId={client.id} />
          </TabsContent>
          
          <TabsContent value="notes">
            <ClientNotesTab clientId={client.id} />
          </TabsContent>
          
          <TabsContent value="contacts">
            <ClientContactsTab clientId={client.id} />
          </TabsContent>
          
          <TabsContent value="financials">
            <ClientFinancialsTab clientId={client.id} />
          </TabsContent>
          
          <TabsContent value="compliance">
            <ClientComplianceTab 
              clientId={client.id} 
              onCreateTask={handleCreateComplianceTask}
            />
          </TabsContent>
          
          <TabsContent value="activity">
            <ClientActivityTab clientId={client.id} />
          </TabsContent>
          
          <TabsContent value="reporting">
            <ClientReportingTab clientId={client.id} />
          </TabsContent>
          
          <TabsContent value="settings">
            <ClientSettingsTab clientId={client.id} />
          </TabsContent>
        </Tabs>
      </main>
      
      <ClientDeleteDialog 
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteClient}
        clientName={client.name}
      />
      
      <ClientEditDialog 
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        client={client}
      />
    </div>
  );
};

export default ClientPage;
