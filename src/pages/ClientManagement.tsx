
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClientContext } from '@/contexts/ClientContext';
import { useTaskContext } from '@/contexts/TaskContext';
import { Client } from '@/types/client';
import { Task, TaskStatus, TaskPriority, RecurrenceType } from '@/types/task';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/hooks/use-toast-extensions"

const ClientManagement = () => {
  const { clients, createClient, updateClient, deleteClient } = useClientContext();
  const { addTask } = useTaskContext();
  const [newClientName, setNewClientName] = useState('');
  const [newClientCompany, setNewClientCompany] = useState('');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [frequency, setFrequency] = useState<string>('monthly');
  const navigate = useNavigate();

  useEffect(() => {
    // You can perform any necessary initialization here
  }, []);

  const handleCreateClient = async () => {
    if (newClientName && newClientCompany) {
      try {
        const newClient = await createClient({
          name: newClientName,
          company: newClientCompany,
          status: 'active'
        });

        toast.success('Client created successfully');
        setNewClientName('');
        setNewClientCompany('');

        // Create automated tasks for selected services
        selectedServices.forEach(async (serviceName) => {
          const renewalDate = date ? new Date(date) : new Date();
          let recurrence: RecurrenceType = 'monthly';

          const getRecurrenceFromFrequency = (freq: string): RecurrenceType => {
            switch (freq) {
              case 'monthly': return 'monthly';
              case 'quarterly': return 'quarterly';
              case 'yearly': return 'yearly';
              default: return 'monthly';
            }
          };

          const newTask: Omit<Task, 'id' | 'createdAt'> = {
            title: `${serviceName} for ${newClient.name}`,
            description: `Automated ${serviceName} task`,
            status: 'todo',
            priority: 'medium',
            dueDate: renewalDate,
            tags: [],
            clientId: newClient.id,
            assignedTo: 'system',
            recurrence: getRecurrenceFromFrequency(frequency),
            recurrenceEndDate: undefined,
            updatedAt: new Date(),
            subtasks: []
          };

          addTask(newTask);
        });
      } catch (error) {
        toast.error('Failed to create client');
      }
    }
  };

  const handleUpdateClient = async (client: Client, updatedData: Partial<Client>) => {
    await updateClient(client.id, updatedData);
    toast.success('Client updated successfully');
  };

  const handleDeleteClient = async (clientId: string) => {
    await deleteClient(clientId);
    toast.success('Client deleted successfully');
  };

  const handleViewClient = (clientId: string) => {
    navigate(`/client/${clientId}`);
  };

  const handleServiceSelection = (service: string) => {
    setSelectedServices((prev) => {
      if (prev.includes(service)) {
        return prev.filter((s) => s !== service);
      } else {
        return [...prev, service];
      }
    });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Client Management</h1>

      {/* Create Client Form */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Create New Client</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="clientName">Client Name</Label>
            <Input
              type="text"
              id="clientName"
              placeholder="Enter client name"
              value={newClientName}
              onChange={(e) => setNewClientName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="clientCompany">Client Company</Label>
            <Input
              type="text"
              id="clientCompany"
              placeholder="Enter client company"
              value={newClientCompany}
              onChange={(e) => setNewClientCompany(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-4">
          <Label>Select Services</Label>
          <div className="flex flex-wrap gap-2">
            {['Tax Preparation', 'Bookkeeping', 'Payroll Services'].map((service) => (
              <div key={service} className="space-x-2">
                <Checkbox
                  id={`service-${service}`}
                  checked={selectedServices.includes(service)}
                  onCheckedChange={() => handleServiceSelection(service)}
                />
                <Label htmlFor={`service-${service}`}>{service}</Label>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Frequency</Label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Due Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[240px] justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="center">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(date) =>
                    date < new Date()
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <Button className="mt-4" onClick={handleCreateClient}>
          Create Client
        </Button>
      </div>

      {/* Client List */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Existing Clients</h2>
        {clients.map((client) => (
          <div key={client.id} className="border p-4 mb-2">
            <h3 className="text-lg font-medium">{client.name}</h3>
            <p className="text-gray-600">{client.company}</p>
            <div className="mt-2 flex gap-2">
              <Button size="sm" onClick={() => handleViewClient(client.id)}>
                View
              </Button>
              <Button size="sm" onClick={() => handleUpdateClient(client, { name: 'Updated Name' })}>
                Update
              </Button>
              <Button size="sm" onClick={() => handleDeleteClient(client.id)}>
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClientManagement;
