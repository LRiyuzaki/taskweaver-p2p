import React, { useState } from 'react';
import { useClientContext } from '@/contexts/ClientContext';
import { useTaskContext } from '@/contexts/TaskContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format, addMonths } from 'date-fns';
import { cn } from '@/lib/utils';
import { CalendarIcon, PlusCircle, Trash2, Edit } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClientService } from '@/types/client';
import { toast } from '@/hooks/use-toast-extensions';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface ClientServiceManagerProps {
  clientId: string;
  clientName: string;
}

export const ClientServiceManager: React.FC<ClientServiceManagerProps> = ({ clientId, clientName }) => {
  const { serviceTypes, clientServices, addClientService, updateClientService, deleteClientService } = useClientContext();
  const { addTask } = useTaskContext();
  
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [reminderDays, setReminderDays] = useState<number>(30);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ClientService | null>(null);
  const [editReminderDays, setEditReminderDays] = useState<number>(30);
  
  const clientActiveServices = clientServices.filter(
    service => service.clientId === clientId && service.status !== 'completed'
  );

  const handleAddService = () => {
    if (!selectedServiceId) {
      toast.error("Please select a service");
      return;
    }
    
    const selectedServiceType = serviceTypes.find(type => type.id === selectedServiceId);
    if (!selectedServiceType) return;
    
    const getEndDate = () => {
      switch (selectedServiceType.frequency) {
        case 'monthly':
          return addMonths(startDate, 1);
        case 'quarterly':
          return addMonths(startDate, 3);
        case 'annually':
          return addMonths(startDate, 12);
        default:
          return undefined;
      }
    };
    
    const endDate = getEndDate();
    
    const newClientService: Omit<ClientService, 'id'> = {
      clientId,
      serviceTypeId: selectedServiceId,
      serviceTypeName: selectedServiceType.name,
      startDate,
      endDate,
      nextRenewalDate: endDate,
      status: 'active',
      reminderDays
    };
    
    addClientService(newClientService);
    
    createServiceTasks(newClientService, selectedServiceType, clientName);
    
    setSelectedServiceId('');
    setStartDate(new Date());
    setReminderDays(30);
    
    toast.success(`${selectedServiceType.name} has been added to ${clientName}`);
  };
  
  const createServiceTasks = (service: Omit<ClientService, 'id'>, serviceType: any, clientName: string) => {
    addTask({
      title: `${serviceType.name} for ${clientName}`,
      description: `Complete ${serviceType.name} for ${clientName}`,
      status: 'todo',
      priority: serviceType.frequency === 'annually' ? 'high' : 'medium',
      dueDate: service.startDate,
      tags: [serviceType.name, 'Initial'],
      clientId,
      assignedTo: '',
      recurrence: 'none',
      recurrenceEndDate: undefined,
    });
    
    if (service.endDate && service.reminderDays) {
      const reminderDate = new Date(service.endDate);
      reminderDate.setDate(reminderDate.getDate() - service.reminderDays);
      
      addTask({
        title: `Renewal: ${serviceType.name} for ${clientName}`,
        description: `Prepare for renewal of ${serviceType.name} for ${clientName}. Due in ${service.reminderDays} days before expiry.`,
        status: 'todo',
        priority: 'medium',
        dueDate: reminderDate,
        tags: [serviceType.name, 'Renewal', 'Reminder'],
        clientId,
        assignedTo: '',
        recurrence: serviceType.frequency === 'annually' ? 'yearly' : 
                   serviceType.frequency === 'quarterly' ? 'quarterly' : 'monthly',
        recurrenceEndDate: undefined,
      });
    }
  };

  const handleCancelService = (serviceTypeId: string, serviceTypeName: string) => {
    if (window.confirm(`Are you sure you want to cancel ${serviceTypeName}?`)) {
      updateClientService(clientId, serviceTypeId, { status: 'inactive' });
      toast.success(`${serviceTypeName} has been cancelled`);
    }
  };
  
  const handleEditService = (service: ClientService) => {
    setEditingService(service);
    setEditReminderDays(service.reminderDays || 30);
    setIsEditModalOpen(true);
  };
  
  const saveServiceChanges = () => {
    if (!editingService) return;
    
    updateClientService(clientId, editingService.serviceTypeId, {
      reminderDays: editReminderDays
    });
    
    toast.success(`Reminder days updated for ${editingService.serviceTypeName}`);
    
    setIsEditModalOpen(false);
  };

  return (
    <div className="space-y-8">
      <div className="bg-muted/30 p-6 rounded-lg border">
        <h3 className="text-lg font-medium mb-4">Add New Service</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="serviceType">Select Service</Label>
            <Select
              value={selectedServiceId}
              onValueChange={setSelectedServiceId}
            >
              <SelectTrigger id="serviceType">
                <SelectValue placeholder="Select service" />
              </SelectTrigger>
              <SelectContent>
                {serviceTypes.map(serviceType => (
                  <SelectItem key={serviceType.id} value={serviceType.id}>
                    {serviceType.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="startDate"
                  variant="outline"
                  className={cn(
                    "w-full pl-3 text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? (
                    format(startDate, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(date) => setStartDate(date || new Date())}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="reminderDays">Reminder Days Before Due</Label>
            <Input
              id="reminderDays"
              type="number"
              value={reminderDays}
              onChange={(e) => setReminderDays(parseInt(e.target.value) || 30)}
              min={1}
              max={365}
            />
          </div>
          
          <div className="flex items-end">
            <Button onClick={handleAddService} className="w-full">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Service
            </Button>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-4">Active Services</h3>
        {clientActiveServices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {clientActiveServices.map(service => {
              const serviceType = serviceTypes.find(type => type.id === service.serviceTypeId);
              return (
                <Card key={`${service.clientId}-${service.serviceTypeId}`} className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-base">{serviceType?.name || 'Unknown Service'}</CardTitle>
                      <Badge variant={service.status === 'active' ? 'default' : 'secondary'}>
                        {service.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Start Date:</span>
                        <p>{format(new Date(service.startDate), "MMM d, yyyy")}</p>
                      </div>
                      {service.endDate && (
                        <div>
                          <span className="text-muted-foreground">End/Renewal Date:</span>
                          <p>{format(new Date(service.endDate), "MMM d, yyyy")}</p>
                        </div>
                      )}
                      <div>
                        <span className="text-muted-foreground">Frequency:</span>
                        <p className="capitalize">{serviceType?.frequency || 'Unknown'}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Reminder Days:</span>
                        <p>{service.reminderDays || 30} days before due</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditService(service)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleCancelService(service.serviceTypeId, serviceType?.name || 'this service')}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Cancel Service
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center p-8 border rounded-lg bg-muted/30">
            <p className="text-muted-foreground">No active services found for this client.</p>
          </div>
        )}
      </div>
      
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Service Reminder</DialogTitle>
            <DialogDescription>
              Update the reminder settings for {editingService?.serviceTypeName}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editReminderDays">Reminder Days Before Due</Label>
              <Input
                id="editReminderDays"
                type="number"
                value={editReminderDays}
                onChange={(e) => setEditReminderDays(parseInt(e.target.value) || 30)}
                min={1}
                max={365}
              />
              <p className="text-sm text-muted-foreground">
                Tasks will be created {editReminderDays} days before the service is due for renewal.
              </p>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveServiceChanges}>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
