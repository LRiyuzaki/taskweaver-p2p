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
import { format, addMonths, addDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { CalendarIcon, PlusCircle, Trash2, Edit } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClientService } from '@/types/client';
import { toast } from '@/hooks/use-toast-extensions';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface ClientServiceManagerProps {
  clientId: string;
  clientName: string;
}

export const ClientServiceManager: React.FC<ClientServiceManagerProps> = ({ clientId, clientName }) => {
  const { serviceTypes, clientServices, addClientService, updateClientService, deleteClientService } = useClientContext();
  const { addTask, tasks, deleteTask } = useTaskContext();
  
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [reminderType, setReminderType] = useState<'days' | 'months' | 'specificDate'>('days');
  const [reminderDays, setReminderDays] = useState<number>(30);
  const [reminderMonths, setReminderMonths] = useState<number>(1);
  const [reminderDate, setReminderDate] = useState<Date | undefined>(undefined);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ClientService | null>(null);
  const [editReminderType, setEditReminderType] = useState<'days' | 'months' | 'specificDate'>('days');
  const [editReminderDays, setEditReminderDays] = useState<number>(30);
  const [editReminderMonths, setEditReminderMonths] = useState<number>(1);
  const [editReminderDate, setEditReminderDate] = useState<Date | undefined>(undefined);
  
  const clientActiveServices = clientServices.filter(
    service => service.clientId === clientId && service.status !== 'completed'
  );

  const getReminderDaysFromSettings = () => {
    switch (reminderType) {
      case 'days':
        return reminderDays;
      case 'months':
        return reminderMonths * 30; // Approximate days in a month
      case 'specificDate':
        if (reminderDate) {
          const diffTime = startDate.getTime() - reminderDate.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays > 0 ? diffDays : 30; // Default to 30 if date is after start date
        }
        return 30;
      default:
        return 30;
    }
  };

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
    const finalReminderDays = getReminderDaysFromSettings();
    
    const newClientService: Omit<ClientService, 'id'> = {
      clientId,
      serviceTypeId: selectedServiceId,
      serviceTypeName: selectedServiceType.name,
      startDate,
      endDate,
      nextRenewalDate: endDate,
      status: 'active',
      reminderDays: finalReminderDays,
      reminderType: reminderType
    };
    
    addClientService(newClientService);
    
    createServiceTasks(newClientService, selectedServiceType, clientName);
    
    setSelectedServiceId('');
    setStartDate(new Date());
    setReminderDays(30);
    setReminderMonths(1);
    setReminderDate(undefined);
    setReminderType('days');
    
    toast.success(`${selectedServiceType.name} has been added to ${clientName}`);
  };
  
  const createServiceTasks = (service: Omit<ClientService, 'id'>, serviceType: any, clientName: string) => {
    // Add initial service task
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
    
    // Only create renewal reminders for services that have an end date
    if (service.endDate && service.reminderDays) {
      const reminderDate = new Date(service.endDate);
      reminderDate.setDate(reminderDate.getDate() - service.reminderDays);
      
      // Create a renewal task with the appropriate recurrence
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

  const removeServiceTasks = (serviceTypeId: string) => {
    // Find all tasks related to this service and client and remove them
    const relatedTasks = tasks.filter(
      task => task.clientId === clientId && task.tags.includes(
        serviceTypes.find(s => s.id === serviceTypeId)?.name || ''
      )
    );
    
    relatedTasks.forEach(task => {
      deleteTask(task.id);
    });
  };

  const handleCancelService = (serviceTypeId: string, serviceTypeName: string) => {
    if (window.confirm(`Are you sure you want to cancel ${serviceTypeName}?`)) {
      // First, remove related tasks
      removeServiceTasks(serviceTypeId);
      
      // Then mark the service as inactive or delete it
      deleteClientService(clientId, serviceTypeId);
      
      toast.success(`${serviceTypeName} has been cancelled and related tasks removed`);
    }
  };
  
  const handleEditService = (service: ClientService) => {
    setEditingService(service);
    
    // Set default editing values based on the service's current settings
    setEditReminderDays(service.reminderDays || 30);
    setEditReminderMonths(Math.round((service.reminderDays || 30) / 30));
    setEditReminderType(service.reminderType || 'days');
    
    // If there's a specific date stored, calculate it from the end date and reminder days
    if (service.endDate && service.reminderDays) {
      const specificDate = new Date(service.endDate);
      specificDate.setDate(specificDate.getDate() - service.reminderDays);
      setEditReminderDate(specificDate);
    } else {
      setEditReminderDate(undefined);
    }
    
    setIsEditModalOpen(true);
  };
  
  const getEditReminderDays = () => {
    switch (editReminderType) {
      case 'days':
        return editReminderDays;
      case 'months':
        return editReminderMonths * 30; // Approximate days in a month
      case 'specificDate':
        if (editReminderDate && editingService?.endDate) {
          const endDate = new Date(editingService.endDate);
          const diffTime = endDate.getTime() - editReminderDate.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays > 0 ? diffDays : 30; // Default to 30 if date is after end date
        }
        return 30;
      default:
        return 30;
    }
  };
  
  const saveServiceChanges = () => {
    if (!editingService) return;
    
    const finalReminderDays = getEditReminderDays();
    
    // Update the service with new reminder settings
    updateClientService(clientId, editingService.serviceTypeId, {
      reminderDays: finalReminderDays,
      reminderType: editReminderType
    });
    
    // Update related tasks with the new reminder settings
    if (editingService.endDate) {
      const reminderDate = new Date(editingService.endDate);
      reminderDate.setDate(reminderDate.getDate() - finalReminderDays);
      
      // Find and update all reminder tasks for this service
      const reminderTasks = tasks.filter(
        task => task.clientId === clientId && 
               task.tags.includes('Reminder') &&
               task.tags.includes(editingService.serviceTypeName || '')
      );
      
      reminderTasks.forEach(task => {
        // Update the task with new due date
        if (task.id) {
          // Find and remove old reminder tasks
          deleteTask(task.id);
          
          // Create a new reminder task with updated settings
          addTask({
            title: task.title,
            description: `Prepare for renewal of ${editingService.serviceTypeName} for ${clientName}. Due in ${finalReminderDays} days before expiry.`,
            status: 'todo',
            priority: task.priority,
            dueDate: reminderDate,
            tags: task.tags,
            clientId,
            assignedTo: task.assignedTo || '',
            recurrence: task.recurrence,
            recurrenceEndDate: task.recurrenceEndDate,
          });
        }
      });
    }
    
    toast.success(`Reminder settings updated for ${editingService.serviceTypeName}`);
    setIsEditModalOpen(false);
  };

  return (
    <div className="space-y-8">
      <div className="bg-muted/30 p-6 rounded-lg border">
        <h3 className="text-lg font-medium mb-4">Add New Service</h3>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
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
          
          <div className="space-y-2 col-span-1 lg:col-span-2">
            <Label>Reminder Settings</Label>
            <Tabs value={reminderType} onValueChange={(v) => setReminderType(v as 'days' | 'months' | 'specificDate')}>
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="days">Days Before</TabsTrigger>
                <TabsTrigger value="months">Months Before</TabsTrigger>
                <TabsTrigger value="specificDate">Specific Date</TabsTrigger>
              </TabsList>
              
              <TabsContent value="days" className="pt-2">
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    value={reminderDays}
                    onChange={(e) => setReminderDays(parseInt(e.target.value) || 30)}
                    min={1}
                    max={365}
                    className="w-24"
                  />
                  <span>days before due date</span>
                </div>
              </TabsContent>
              
              <TabsContent value="months" className="pt-2">
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    value={reminderMonths}
                    onChange={(e) => setReminderMonths(parseInt(e.target.value) || 1)}
                    min={1}
                    max={12}
                    className="w-24"
                  />
                  <span>months before due date</span>
                </div>
              </TabsContent>
              
              <TabsContent value="specificDate" className="pt-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !reminderDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {reminderDate ? (
                        format(reminderDate, "PPP")
                      ) : (
                        <span>Pick a reminder date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={reminderDate}
                      onSelect={setReminderDate}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="flex items-end lg:col-span-4">
            <Button onClick={handleAddService} className="w-full lg:w-auto">
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
                        <span className="text-muted-foreground">Reminder:</span>
                        <p>
                          {service.reminderType === 'months' 
                            ? `${Math.round((service.reminderDays || 30) / 30)} months before due` 
                            : `${service.reminderDays || 30} days before due`}
                        </p>
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
            <Tabs value={editReminderType} onValueChange={(v) => setEditReminderType(v as 'days' | 'months' | 'specificDate')}>
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="days">Days Before</TabsTrigger>
                <TabsTrigger value="months">Months Before</TabsTrigger>
                <TabsTrigger value="specificDate">Specific Date</TabsTrigger>
              </TabsList>
              
              <TabsContent value="days" className="pt-4">
                <div className="space-y-2">
                  <Label htmlFor="editReminderDays">Days Before Due</Label>
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
              </TabsContent>
              
              <TabsContent value="months" className="pt-4">
                <div className="space-y-2">
                  <Label htmlFor="editReminderMonths">Months Before Due</Label>
                  <Input
                    id="editReminderMonths"
                    type="number"
                    value={editReminderMonths}
                    onChange={(e) => setEditReminderMonths(parseInt(e.target.value) || 1)}
                    min={1}
                    max={12}
                  />
                  <p className="text-sm text-muted-foreground">
                    Tasks will be created approximately {editReminderMonths} {editReminderMonths === 1 ? 'month' : 'months'} before the service is due for renewal.
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="specificDate" className="pt-4">
                <div className="space-y-2">
                  <Label htmlFor="editReminderDate">Specific Reminder Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="editReminderDate"
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !editReminderDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {editReminderDate ? (
                          format(editReminderDate, "PPP")
                        ) : (
                          <span>Pick a reminder date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={editReminderDate}
                        onSelect={setEditReminderDate}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  <p className="text-sm text-muted-foreground">
                    Tasks will be created on the specific date you select.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
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
