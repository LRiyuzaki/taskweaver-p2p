import React, { useState } from 'react';
import { Header } from "@/components/Header";
import { useClientContext } from '@/contexts/ClientContext';
import { useTaskContext } from '@/contexts/TaskContext';
import { TaskStatus, TaskPriority, RecurrenceType } from '@/types/task';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast-extensions';

const BulkTaskCreationPage = () => {
  const { clients } = useClientContext();
  const { addBulkTasks } = useTaskContext();
  const [loading, setLoading] = useState(false);
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
  const [taskTemplate, setTaskTemplate] = useState({
    title: '',
    description: '',
    dueDate: new Date(),
    priority: 'medium' as TaskPriority,
    status: 'todo' as TaskStatus,
    recurrence: 'none' as RecurrenceType
  });

  // Bulk create tasks for selected clients
  const handleCreateTasks = () => {
    if (selectedClientIds.length === 0) {
      toast.error('Please select at least one client');
      return;
    }

    if (!taskTemplate.title) {
      toast.error('Task title is required');
      return;
    }

    setLoading(true);

    try {
      const tasksToCreate = selectedClientIds.map(clientId => {
        const client = clients.find(c => c.id === clientId);
        
        return {
          title: taskTemplate.title,
          description: taskTemplate.description,
          status: taskTemplate.status,
          priority: taskTemplate.priority,
          clientId,
          clientName: client?.name || '',
          dueDate: new Date(taskTemplate.dueDate),
          tags: [],
          recurrence: taskTemplate.recurrence
        };
      });

      addBulkTasks(tasksToCreate);
      toast.success(`Created ${tasksToCreate.length} tasks successfully`);
      
      // Reset selections
      setSelectedClientIds([]);
      
    } catch (error) {
      console.error('Error creating bulk tasks:', error);
      toast.error('Failed to create tasks');
    } finally {
      setLoading(false);
    }
  };

  // Create a single task for a specific client
  const handleCreateSingleTask = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    
    if (!taskTemplate.title) {
      toast.error('Task title is required');
      return;
    }
    
    try {
      addBulkTasks([{
        title: taskTemplate.title,
        description: taskTemplate.description,
        status: taskTemplate.status,
        priority: taskTemplate.priority,
        clientId,
        clientName: client?.name || '',
        dueDate: new Date(taskTemplate.dueDate),
        tags: [],
        recurrence: taskTemplate.recurrence
      }]);
      
      toast.success(`Task created for ${client?.name}`);
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Bulk Task Creation</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Task template form would go here */}
          <div className="col-span-1">
            <h2 className="text-lg font-medium mb-4">Task Template</h2>
            {/* Form implementation would go here */}
          </div>

          {/* Client selection list would go here */}
          <div className="col-span-2">
            <h2 className="text-lg font-medium mb-4">Select Clients</h2>
            {/* Client list implementation would go here */}
          </div>
        </div>

        <div className="mt-6">
          <Button 
            onClick={handleCreateTasks}
            disabled={loading || selectedClientIds.length === 0}
          >
            {loading ? 'Creating...' : `Create Tasks for ${selectedClientIds.length} Clients`}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default BulkTaskCreationPage;
