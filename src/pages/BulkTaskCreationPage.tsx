import React, { useState, useEffect } from 'react';
import { TaskStatus, TaskPriority, RecurrenceType } from '@/types/task';
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
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { toast } from '@/hooks/use-toast-extensions';

const statusOptions: TaskStatus[] = ['todo', 'in-progress', 'review', 'done'];
const priorityOptions: TaskPriority[] = ['low', 'medium', 'high'];
const recurrenceOptions: RecurrenceType[] = ['none', 'daily', 'weekly', 'monthly', 'quarterly', 'yearly'];

const BulkTaskCreationPage: React.FC = () => {
  const { clients } = useClientContext();
  const { addTask } = useTaskContext();

  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    status: 'todo' as TaskStatus,
    priority: 'medium' as TaskPriority,
    dueDate: undefined as Date | undefined,
    tags: [] as string[],
    recurrence: 'none' as RecurrenceType
  });
  const [selectedClients, setSelectedClients] = useState<string[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTaskData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string) => (value: string) => {
    setTaskData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date: Date | undefined) => {
    setTaskData(prev => ({ ...prev, dueDate: date }));
  };

  const handleClientSelection = (clientId: string) => {
    setSelectedClients(prev => {
      if (prev.includes(clientId)) {
        return prev.filter(id => id !== clientId);
      } else {
        return [...prev, clientId];
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedClients.length === 0) {
      toast.error('Please select at least one client');
      return;
    }

    const tasksToCreate = selectedClients.map(clientId => {
      const client = clients.find(c => c.id === clientId);
      return {
        title: taskData.title,
        description: taskData.description,
        status: taskData.status,
        priority: taskData.priority,
        dueDate: taskData.dueDate,
        clientId: clientId,
        clientName: client?.name || '',
        tags: taskData.tags,
        recurrence: taskData.recurrence,
        updatedAt: new Date(),
        subtasks: []
      };
    });

    // Add all tasks
    tasksToCreate.forEach(task => addTask(task));
    
    toast.success(`Created ${tasksToCreate.length} tasks successfully`);
    
    // Reset form
    setTaskData({
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      dueDate: undefined,
      tags: [],
      recurrence: 'none'
    });
    setSelectedClients([]);
  };

  return (
    <div className="container mx-auto p-8 space-y-6">
      <h1 className="text-3xl font-bold">Bulk Task Creation</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Task Details */}
        <div className="space-y-2">
          <Label htmlFor="title">Task Title</Label>
          <Input
            type="text"
            id="title"
            name="title"
            value={taskData.title}
            onChange={handleInputChange}
            placeholder="Enter task title"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Task Description</Label>
          <Input
            type="text"
            id="description"
            name="description"
            value={taskData.description}
            onChange={handleInputChange}
            placeholder="Enter task description"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={taskData.status}
              onValueChange={handleSelectChange('status')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Priority</Label>
            <Select
              value={taskData.priority}
              onValueChange={handleSelectChange('priority')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                {priorityOptions.map(priority => (
                  <SelectItem key={priority} value={priority}>{priority}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Due Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !taskData.dueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {taskData.dueDate ? format(taskData.dueDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={taskData.dueDate}
                  onSelect={handleDateChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Recurrence</Label>
          <Select
            value={taskData.recurrence}
            onValueChange={handleSelectChange('recurrence')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select recurrence" />
            </SelectTrigger>
            <SelectContent>
              {recurrenceOptions.map(recurrence => (
                <SelectItem key={recurrence} value={recurrence}>{recurrence}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Client Selection */}
        <div className="space-y-2">
          <Label>Select Clients</Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {clients.map(client => (
              <div key={client.id} className="flex items-center">
                <Input
                  type="checkbox"
                  id={`client-${client.id}`}
                  className="mr-2"
                  checked={selectedClients.includes(client.id)}
                  onChange={() => handleClientSelection(client.id)}
                />
                <Label htmlFor={`client-${client.id}`}>{client.name}</Label>
              </div>
            ))}
          </div>
        </div>

        <Button type="submit">Create Tasks</Button>
      </form>
    </div>
  );
};

export default BulkTaskCreationPage;
