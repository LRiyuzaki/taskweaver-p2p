import React, { useMemo, useState } from 'react';
import { useClientContext } from '@/contexts/ClientContext';
import { useTaskContext } from '@/contexts/TaskContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarClock, AlertTriangle, CheckCircle, Edit, Filter, Calendar as CalendarIcon } from 'lucide-react';
import { format, isAfter, isBefore, addDays, differenceInDays } from 'date-fns';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast-extensions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export const ServiceRenewalsDashboard: React.FC = () => {
  const { clientServices, serviceTypes, clients, updateClientService, deleteClientService } = useClientContext();
  const { tasks, addTask, deleteTask } = useTaskContext();
  const [timeFrame, setTimeFrame] = useState<'7days' | '30days' | '90days' | 'all'>('30days');
  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'overdue' | 'completed'>('all');
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<any | null>(null);
  const [editReminderType, setEditReminderType] = useState<'days' | 'months' | 'specificDate'>('days');
  const [editReminderDays, setEditReminderDays] = useState<number>(30);
  const [editReminderMonths, setEditReminderMonths] = useState<number>(1);
  const [editReminderDate, setEditReminderDate] = useState<Date | undefined>(undefined);
  
  const today = new Date();
  
  const cutoffDate = useMemo(() => {
    switch (timeFrame) {
      case '7days':
        return addDays(today, 7);
      case '30days':
        return addDays(today, 30);
      case '90days':
        return addDays(today, 90);
      default:
        return addDays(today, 365);
    }
  }, [timeFrame, today]);
  
  const filteredServices = useMemo(() => {
    return clientServices
      .filter(service => {
        if (!service.endDate) return false;
        
        const endDate = new Date(service.endDate);
        const isOverdue = isBefore(endDate, today);
        const isUpcoming = isBefore(endDate, cutoffDate) && isAfter(endDate, today);
        const isCompleted = service.status === 'completed';
        
        switch (statusFilter) {
          case 'upcoming':
            return isUpcoming;
          case 'overdue':
            return isOverdue;
          case 'completed':
            return isCompleted;
          default:
            return isBefore(endDate, cutoffDate) || isOverdue;
        }
      })
      .map(service => {
        const serviceType = serviceTypes.find(type => type.id === service.serviceTypeId);
        const client = clients.find(client => client.id === service.clientId);
        
        const endDate = new Date(service.endDate!);
        const daysUntilDue = differenceInDays(endDate, today);
        
        return {
          ...service,
          serviceTypeName: serviceType?.name || 'Unknown Service',
          clientName: client?.name || 'Unknown Client',
          daysUntilDue,
          status: daysUntilDue < 0 ? 'overdue' : 'upcoming'
        };
      })
      .sort((a, b) => a.daysUntilDue - b.daysUntilDue);
  }, [clientServices, serviceTypes, clients, cutoffDate, statusFilter, today]);
  
  const overdueCount = filteredServices.filter(s => s.daysUntilDue < 0).length;
  const upcomingCount = filteredServices.filter(s => s.daysUntilDue >= 0).length;
  
  const handleEditService = (service: any) => {
    setEditingService(service);
    
    setEditReminderDays(service.reminderDays || 30);
    setEditReminderMonths(Math.round((service.reminderDays || 30) / 30));
    setEditReminderType(service.reminderType || 'days');
    
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
        return editReminderMonths * 30;
      case 'specificDate':
        if (editReminderDate && editingService?.endDate) {
          const endDate = new Date(editingService.endDate);
          const diffTime = endDate.getTime() - editReminderDate.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays > 0 ? diffDays : 30;
        }
        return 30;
      default:
        return 30;
    }
  };
  
  const createReminderTask = (service: any, reminderDate: Date) => {
    const serviceType = serviceTypes.find(type => type.id === service.serviceTypeId);
    if (serviceType) {
      const taskId = addTask({
        title: `Reminder: ${serviceType.name} renewal for ${service.clientName}`,
        description: `This service is due for renewal on ${format(new Date(service.endDate), "PPP")}`,
        status: 'todo',
        priority: 'medium',
        dueDate: reminderDate,
        clientId: service.clientId,
        clientName: service.clientName,
        tags: ['Reminder', serviceType.name],
        recurrence: 'none'
      });
      
      return taskId;
    }
    return null;
  };
  
  const saveReminderChanges = () => {
    if (!editingService) return;
    
    const finalReminderDays = getEditReminderDays();
    
    const updatedService: any = {
      reminderDays: finalReminderDays,
      reminderType: editReminderType
    };
    
    if (editReminderType === 'specificDate' && editReminderDate) {
      updatedService.reminderDate = editReminderDate;
    }
    
    updateClientService(editingService.clientId, editingService.serviceTypeId, updatedService);
    
    if (editingService.endDate) {
      let reminderDate: Date;
      if (editReminderType === 'specificDate' && editReminderDate) {
        reminderDate = editReminderDate;
      } else {
        reminderDate = new Date(editingService.endDate);
        reminderDate.setDate(reminderDate.getDate() - finalReminderDays);
      }
      
      const reminderTasks = tasks.filter(
        task => task.clientId === editingService.clientId && 
               task.tags && task.tags.includes('Reminder') &&
               task.tags.includes(editingService.serviceTypeName || '')
      );
      
      reminderTasks.forEach(task => {
        if (task.id) {
          deleteTask(task.id);
        }
      });
      
      if (reminderDate >= new Date()) {
        createReminderTask(editingService, reminderDate);
      }
    }
    
    toast.success(`Reminder period updated for ${editingService.serviceTypeName}`);
    setIsEditModalOpen(false);
  };

  const handleCancelService = (service: any) => {
    if (window.confirm(`Are you sure you want to cancel the ${service.serviceTypeName} service for ${service.clientName}?`)) {
      const relatedTasks = tasks.filter(
        task => task.clientId === service.clientId && task.tags && task.tags.includes(
          serviceTypes.find(s => s.id === service.serviceTypeId)?.name || ''
        )
      );
      
      relatedTasks.forEach(task => {
        deleteTask(task.id);
      });
      
      deleteClientService(service.clientId, service.serviceTypeId);
      
      toast.success(`${service.serviceTypeName} has been cancelled for ${service.clientName}`);
    }
  };
  
  const processRenewal = (service: any) => {
    updateClientService(service.clientId, service.serviceTypeId, {
      status: 'completed'
    });
    
    toast.success(`Successfully processed renewal for ${service.serviceTypeName}`);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex flex-wrap gap-4">
          <Card className="w-full md:w-auto flex-grow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Renewals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredServices.length}</div>
            </CardContent>
          </Card>
          
          <Card className="w-full md:w-auto flex-grow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-amber-700">Upcoming</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingCount}</div>
            </CardContent>
          </Card>
          
          <Card className="w-full md:w-auto flex-grow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-destructive">Overdue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overdueCount}</div>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-2">
            <Label htmlFor="timeFrame">Time Frame</Label>
            <Select
              value={timeFrame}
              onValueChange={(value: any) => setTimeFrame(value)}
            >
              <SelectTrigger id="timeFrame" className="w-[180px]">
                <SelectValue placeholder="Select time frame" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Next 7 days</SelectItem>
                <SelectItem value="30days">Next 30 days</SelectItem>
                <SelectItem value="90days">Next 90 days</SelectItem>
                <SelectItem value="all">All</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="statusFilter">Status</Label>
            <Select
              value={statusFilter}
              onValueChange={(value: any) => setStatusFilter(value)}
            >
              <SelectTrigger id="statusFilter" className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {filteredServices.length > 0 ? (
        <div className="space-y-4">
          {filteredServices.map(service => (
            <Card key={`${service.clientId}-${service.serviceTypeId}`} className={cn(
              "border-l-4",
              service.daysUntilDue < 0 ? "border-l-destructive" : 
              service.daysUntilDue < 7 ? "border-l-amber-500" : "border-l-blue-500"
            )}>
              <CardContent className="p-4">
                <div className="flex flex-wrap justify-between gap-4">
                  <div>
                    <h3 className="font-medium text-lg">{service.serviceTypeName}</h3>
                    <p className="text-muted-foreground">Client: {service.clientName}</p>
                    <div className="mt-1 text-sm">
                      <span className="text-muted-foreground">Reminder: </span>
                      {service.reminderType === 'specificDate' && service.reminderDate ? (
                        `On ${format(new Date(service.reminderDate), "MMM d, yyyy")}`
                      ) : service.reminderType === 'months' ? (
                        `${Math.round((service.reminderDays || 30) / 30)} months before due`
                      ) : (
                        `${service.reminderDays || 30} days before due`
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <CalendarClock className="h-4 w-4 text-muted-foreground" />
                    <span>
                      Due: {format(new Date(service.endDate), "MMM d, yyyy")}
                    </span>
                    
                    <Badge variant={service.daysUntilDue < 0 ? "destructive" : "outline"}>
                      {service.daysUntilDue < 0 
                        ? `Overdue by ${Math.abs(service.daysUntilDue)} days` 
                        : `${service.daysUntilDue} days remaining`}
                    </Badge>
                  </div>
                  
                  <div className="w-full md:w-auto flex flex-wrap gap-2 justify-end mt-2 md:mt-0">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleEditService(service)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Reminder
                    </Button>
                    
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="border-destructive text-destructive hover:bg-destructive/10"
                      onClick={() => handleCancelService(service)}
                    >
                      <AlertTriangle className="mr-2 h-4 w-4" />
                      Cancel Service
                    </Button>
                    
                    <Button 
                      size="sm" 
                      variant={service.daysUntilDue < 0 ? "destructive" : "default"}
                      onClick={() => processRenewal(service)}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      {service.daysUntilDue < 0 ? "Process Overdue Renewal" : "Process Renewal"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center p-12 border rounded-lg bg-muted/30">
          <CalendarClock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No renewals found</h3>
          <p className="text-muted-foreground">
            There are no service renewals due within the selected time frame.
          </p>
        </div>
      )}
      
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Reminder Period</DialogTitle>
            <DialogDescription>
              {editingService && (
                <>Update the reminder days for {editingService.serviceTypeName} for client {editingService.clientName}</>
              )}
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
            <Button onClick={saveReminderChanges}>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
