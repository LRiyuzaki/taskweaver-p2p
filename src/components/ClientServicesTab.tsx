import React, { useState } from 'react';
import { useClientContext } from '@/contexts/ClientContext';
import { useTaskContext } from '@/contexts/TaskContext';
import { ClientService, ClientServicesTabProps, Client } from '@/types/client';
import { Task, TaskStatus, TaskPriority, RecurrenceType } from '@/types/task';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MoreVertical, Edit, Trash, Plus } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { toast } from '@/hooks/use-toast-extensions';
import { Separator } from "@/components/ui/separator";
import { useServiceAssignment } from '@/hooks/useServiceAssignment';

export const ClientServicesTab: React.FC<ClientServicesTabProps> = ({ clientId }) => {
  const { clients } = useClientContext();
  const { addTask } = useTaskContext();
  const { assignServiceToClient, removeServiceFromClient, serviceTypes } = useServiceAssignment();

  const [isAssigningService, setIsAssigningService] = useState(false);
  const [selectedService, setSelectedService] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [isRemovingService, setIsRemovingService] = useState(false);
  const [serviceToRemove, setServiceToRemove] = useState<string | null>(null);

  const client = clients.find(c => c.id === clientId);
  if (!client) return <div>Client not found</div>;

  const handleAssignService = async () => {
    if (!selectedService) {
      toast.error('Please select a service to assign.');
      return;
    }

    setIsAssigningService(true);
    try {
      const success = await assignServiceToClient(clientId, selectedService, startDate);
      if (success) {
        toast.success('Service assigned successfully!');
      } else {
        toast.error('Failed to assign service.');
      }
    } finally {
      setIsAssigningService(false);
      setSelectedService('');
    }
  };

  const handleRemoveService = async () => {
    if (!serviceToRemove) return;

    setIsRemovingService(true);
    try {
      const success = await removeServiceFromClient(clientId, serviceToRemove);
      if (success) {
        toast.success('Service removed successfully!');
      } else {
        toast.error('Failed to remove service.');
      }
    } finally {
      setIsRemovingService(false);
      setServiceToRemove(null);
    }
  };

  const getClientServices = (): ClientService[] => {
    return (client.services || []).filter(service => typeof service !== 'string') as ClientService[];
  };

  const createComplianceTask = (client: Client, serviceName: string, dueDate: Date) => {
    const newTask = {
      id: `task_${Date.now()}`,
      title: `${serviceName} for ${client.name}`,
      description: `Compliance task for ${serviceName}`,
      status: 'todo' as TaskStatus,
      priority: 'medium' as TaskPriority,
      createdAt: new Date(),
      updatedAt: new Date(),
      clientId: client.id,
      clientName: client.name,
      serviceId: 'compliance',
      serviceName: serviceName,
      tags: ['Compliance'],
      recurrence: 'none' as RecurrenceType,
      subtasks: []
    };
    
    addTask(newTask);
    toast.success('Compliance task created');
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Assigned Services</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {getClientServices().map((service) => (
              <div key={service.id} className="border rounded-md p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold">{service.serviceTypeName}</h3>
                    <Badge variant="secondary">{service.status}</Badge>
                    <p className="text-sm text-muted-foreground">
                      Start Date: {format(new Date(service.startDate), 'PPP')}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem disabled>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem>
                            <Trash className="mr-2 h-4 w-4" /> Remove
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently remove the service from the client.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => {
                              setServiceToRemove(service.serviceTypeId);
                              handleRemoveService();
                            }}
                            >
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
            {getClientServices().length === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                No services assigned to this client.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Assign New Service</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="service">Service</Label>
              <Select onValueChange={setSelectedService} value={selectedService}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                <SelectContent>
                  {serviceTypes.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full pl-3 text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    {startDate ? (
                      format(startDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    disabled={(date) =>
                      date > new Date() || date < new Date('1900-01-01')
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <Button
            className="mt-4"
            onClick={handleAssignService}
            disabled={isAssigningService || !selectedService}
          >
            {isAssigningService ? 'Assigning...' : 'Assign Service'}
          </Button>
        </CardContent>
      </Card>

      <AlertDialog open={isRemovingService}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Removing Service</AlertDialogTitle>
            <AlertDialogDescription>
              Please wait while we remove the service from the client.
            </AlertDialogDescription>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
