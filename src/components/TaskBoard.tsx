
import React, { useState } from 'react';
import { Task, TaskStatus } from '@/types/task';
import { TaskColumn } from './TaskColumn';
import { TaskForm } from './TaskForm';
import { useTaskContext } from '@/contexts/TaskContext';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw, Filter, Search, ClipboardCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast-extensions';

export const TaskBoard: React.FC = () => {
  const { tasks, addTask, updateTask, moveTask } = useTaskContext();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState<string | null>(null);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<string | null>(null);

  // Add filtering by service
  const filteredTasks = tasks.filter((task) => {
    // Apply search filter
    const matchesSearch = !searchTerm || 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (task.clientName && task.clientName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Apply priority filter
    const matchesPriority = !selectedPriority || task.priority === selectedPriority;
    
    // Apply client filter
    const matchesClient = !selectedClient || task.clientId === selectedClient;

    // Apply service filter
    const matchesService = !selectedService || task.serviceId === selectedService;
    
    return matchesSearch && matchesPriority && matchesClient && matchesService;
  });
  
  const todoTasks = filteredTasks.filter((task) => task.status === 'todo');
  const inProgressTasks = filteredTasks.filter((task) => task.status === 'inProgress');
  const reviewTasks = filteredTasks.filter((task) => task.status === 'review'); // Add review tasks
  const doneTasks = filteredTasks.filter((task) => task.status === 'done');

  // Get unique clients for filter dropdown
  const uniqueClients = Array.from(new Set(tasks
    .filter(t => t.clientId && t.clientName)
    .map(t => ({ id: t.clientId!, name: t.clientName! }))
  ));

  // Get unique services for filter dropdown
  const uniqueServices = Array.from(new Set(tasks
    .filter(t => t.serviceId && t.serviceName)
    .map(t => ({ id: t.serviceId!, name: t.serviceName! }))
  ));

  const handleTaskClick = (task: Task) => {
    setEditingTask(task);
    setIsDialogOpen(true);
  };

  const handleAddTask = () => {
    setEditingTask(null);
    setIsDialogOpen(true);
  };

  const handleDrop = (e: React.DragEvent, newStatus: TaskStatus) => {
    const taskId = e.dataTransfer.getData('taskId');
    moveTask(taskId, newStatus);
    
    // Provide visual feedback
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      toast.success(`Task "${task.title}" moved to ${
        newStatus === 'todo' ? 'To Do' : 
        newStatus === 'inProgress' ? 'In Progress' : 
        newStatus === 'review' ? 'Review' : 'Done'
      }`);
    }
  };

  const handleFormSubmit = (formData: Omit<Task, 'id' | 'createdAt'>) => {
    if (editingTask) {
      updateTask(editingTask.id, formData);
      toast.success('Task updated successfully');
    } else {
      addTask(formData);
      toast.success('New task created successfully');
    }
    setIsDialogOpen(false);
  };
  
  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedPriority(null);
    setSelectedClient(null);
    setSelectedService(null);
  };

  return (
    <div className="p-4">
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Task Board</h1>
          <Badge variant="outline" className="font-normal">
            {filteredTasks.length} Tasks
          </Badge>
        </div>
        
        <div className="flex gap-2 ml-auto">
          <div className="relative max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 h-10"
            />
          </div>
          
          <Button variant="outline" size="icon" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="h-4 w-4" />
          </Button>
          
          {(searchTerm || selectedPriority || selectedClient || selectedService) && (
            <Button variant="ghost" size="sm" onClick={handleClearFilters} className="text-xs">
              <RefreshCw className="h-3.5 w-3.5 mr-1" /> Clear
            </Button>
          )}
          
          <Button onClick={handleAddTask}>
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>
      </div>
      
      {showFilters && (
        <div className="mb-6 p-4 bg-muted/30 rounded-md">
          <h3 className="text-sm font-medium mb-3">Filter Tasks</h3>
          <div className="flex flex-wrap gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium">Priority</label>
              <div className="flex gap-1">
                <Badge 
                  variant={selectedPriority === 'low' ? 'default' : 'outline'} 
                  className="cursor-pointer hover:bg-primary/10"
                  onClick={() => setSelectedPriority(selectedPriority === 'low' ? null : 'low')}
                >
                  Low
                </Badge>
                <Badge 
                  variant={selectedPriority === 'medium' ? 'default' : 'outline'} 
                  className="cursor-pointer hover:bg-primary/10"
                  onClick={() => setSelectedPriority(selectedPriority === 'medium' ? null : 'medium')}
                >
                  Medium
                </Badge>
                <Badge 
                  variant={selectedPriority === 'high' ? 'default' : 'outline'} 
                  className="cursor-pointer hover:bg-primary/10"
                  onClick={() => setSelectedPriority(selectedPriority === 'high' ? null : 'high')}
                >
                  High
                </Badge>
              </div>
            </div>
            
            {uniqueClients.length > 0 && (
              <div className="space-y-1">
                <label className="text-xs font-medium">Client</label>
                <div className="flex flex-wrap gap-1">
                  {uniqueClients.map(client => (
                    <Badge 
                      key={client.id}
                      variant={selectedClient === client.id ? 'default' : 'outline'} 
                      className="cursor-pointer hover:bg-primary/10"
                      onClick={() => setSelectedClient(selectedClient === client.id ? null : client.id)}
                    >
                      {client.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Add service filter */}
            {uniqueServices.length > 0 && (
              <div className="space-y-1">
                <label className="text-xs font-medium">Service</label>
                <div className="flex flex-wrap gap-1">
                  {uniqueServices.map(service => (
                    <Badge 
                      key={service.id}
                      variant={selectedService === service.id ? 'default' : 'outline'} 
                      className="cursor-pointer hover:bg-primary/10"
                      onClick={() => setSelectedService(selectedService === service.id ? null : service.id)}
                    >
                      {service.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <TaskColumn
          title="To Do"
          status="todo"
          tasks={todoTasks}
          onTaskClick={handleTaskClick}
          onDrop={handleDrop}
        />
        <TaskColumn
          title="In Progress"
          status="inProgress"
          tasks={inProgressTasks}
          onTaskClick={handleTaskClick}
          onDrop={handleDrop}
        />
        <TaskColumn
          title="Review"
          status="review"
          tasks={reviewTasks}
          onTaskClick={handleTaskClick}
          onDrop={handleDrop}
          icon={<ClipboardCheck className="h-4 w-4 mr-1" />}
        />
        <TaskColumn
          title="Done"
          status="done"
          tasks={doneTasks}
          onTaskClick={handleTaskClick}
          onDrop={handleDrop}
        />
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingTask ? 'Edit Task' : 'Create Task'}</DialogTitle>
            <DialogDescription>
              {editingTask 
                ? 'Make changes to your task here.'
                : 'Add a new task to your board.'}
            </DialogDescription>
          </DialogHeader>
          <TaskForm 
            task={editingTask || undefined} 
            onSubmit={handleFormSubmit} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
