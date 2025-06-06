import React, { useState } from 'react';
import { useClientContext } from '@/contexts/ClientContext';
import { useTaskContext } from '@/contexts/TaskContext';
import { Task, TaskStatus, TaskPriority, RecurrenceType } from '@/types/task';
import { toast } from '@/hooks/use-toast-extensions';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TaskForm } from '@/components/TaskForm';
import { ClientService } from '@/types/client';

export const ClientServicesTab: React.FC<ClientServicesTabProps> = ({ clientId }) => {
  const { clients, clientServices, updateClientService } = useClientContext();
  const { addTask } = useTaskContext();
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ClientService | null>(null);
  
  const client = clients.find(c => c.id === clientId);
  const services = clientServices.filter(s => s.clientId === clientId);
  
  const handleAddTask = (service: ClientService) => {
    setSelectedService(service);
    setIsAddTaskDialogOpen(true);
  };
  
  const handleTaskFormSubmit = (formData: Omit<Task, 'id' | 'createdAt'>) => {
    // Ensure the task data has all required properties
    const taskData: Omit<Task, 'id' | 'createdAt'> = {
      ...formData,
      updatedAt: formData.updatedAt || new Date(),
      subtasks: formData.subtasks || []
    };
    
    addTask(taskData);
    setIsAddTaskDialogOpen(false);
    toast.success('Task created successfully');
  };
  
  const handleServiceStatusChange = (service: ClientService, status: 'active' | 'inactive' | 'completed') => {
    updateClientService(service.clientId, service.serviceTypeId, {
      ...service,
      status
    });
    toast.success(`Service status updated to ${status}`);
  };
  
  const createRenewalTask = (service: ClientService, client: Client) => {
    const renewalTask = {
      title: `${service.serviceTypeName} Renewal for ${client.name}`,
      description: `Service renewal task for ${service.serviceTypeName}`,
      status: 'todo' as TaskStatus,
      priority: 'medium' as TaskPriority,
      clientId: client.id,
      clientName: client.name,
      serviceId: service.serviceTypeId,
      serviceName: service.serviceTypeName,
      tags: ['Renewal', 'Service'],
      recurrence: 'none' as RecurrenceType,
      updatedAt: new Date(),
      subtasks: []
    };

    addTask(renewalTask);
  };
  
  if (!client) {
    return <div>Client not found</div>;
  }
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Services for {client.name}</h2>
      
      {services.length === 0 ? (
        <div className="text-center p-8 border rounded-lg">
          <p className="text-muted-foreground">No services found for this client.</p>
          <Button className="mt-4">Add Service</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map((service) => (
            <div key={service.serviceTypeId} className="border rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-start">
                <h3 className="font-medium">{service.serviceTypeName}</h3>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleAddTask(service)}
                  >
                    Create Task
                  </Button>
                </div>
              </div>
              
              <div className="mt-2 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="font-medium">{service.status || 'Active'}</span>
                </div>
                
                {service.startDate && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Start Date:</span>
                    <span>{new Date(service.startDate).toLocaleDateString()}</span>
                  </div>
                )}
                
                {service.nextRenewalDate && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Next Renewal:</span>
                    <span>{new Date(service.nextRenewalDate).toLocaleDateString()}</span>
                  </div>
                )}
                
                {service.fee && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fee:</span>
                    <span>${service.fee}</span>
                  </div>
                )}
              </div>
              
              <div className="mt-4 pt-2 border-t flex justify-end gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleServiceStatusChange(service, 'active')}
                  disabled={service.status === 'active'}
                >
                  Mark Active
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleServiceStatusChange(service, 'inactive')}
                  disabled={service.status === 'inactive'}
                >
                  Mark Inactive
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <Dialog open={isAddTaskDialogOpen} onOpenChange={setIsAddTaskDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              Create Task for {selectedService?.serviceTypeName}
            </DialogTitle>
          </DialogHeader>
          <TaskForm 
            onSubmit={handleTaskFormSubmit}
            initialClientId={clientId}
            task={{
              title: selectedService ? `${selectedService.serviceTypeName} for ${client.name}` : '',
              description: '',
              status: 'todo' as TaskStatus,
              priority: 'medium' as TaskPriority,
              clientId: clientId,
              clientName: client.name,
              serviceId: selectedService?.serviceTypeId,
              serviceName: selectedService?.serviceTypeName,
              tags: selectedService ? [selectedService.serviceTypeName] : [],
              recurrence: 'none' as RecurrenceType,
              updatedAt: new Date(),
              subtasks: []
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientServicesTab;
