import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, UploadCloud, FilePlus, GitMerge } from 'lucide-react';
import { useClientContext } from '@/contexts/ClientContext';
import { useTaskContext } from '@/contexts/TaskContext';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast-extensions';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import TaskDetails from '@/components/TaskDetails';

const BulkTaskCreationPage = () => {
  const { clients } = useClientContext();
  const { addBulkTasks, templates, createTaskFromTemplate, tasks } = useTaskContext();
  const [taskList, setTaskList] = useState('');
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [bulkDueDate, setBulkDueDate] = useState<Date | undefined>(undefined);
  const [createdTaskIds, setCreatedTaskIds] = useState<string[]>([]);
  const [showTasksPreview, setShowTasksPreview] = useState(false);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [viewingTaskId, setViewingTaskId] = useState('');
  const [taskTitles, setTaskTitles] = useState(['']);
  const [selectedPriority, setSelectedPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [selectedDueDate, setSelectedDueDate] = useState<Date | undefined>(undefined);

  const handleBulkTasksFromLines = () => {
    if (!taskList.trim()) {
      toast.error('Please enter at least one task');
      return;
    }
    
    const lines = taskList.trim().split('\n');
    const tasksToCreate = lines
      .filter(line => line.trim().length > 0)
      .map(line => ({
        title: line.trim(),
        status: 'todo' as const,
        priority: priority,
        clientId: selectedClient || undefined,
        clientName: selectedClient ? clients.find(c => c.id === selectedClient)?.name : undefined,
        dueDate: bulkDueDate,
        tags: [],
        recurrence: 'none' as const
      }));
    
    if (tasksToCreate.length === 0) {
      toast.error('No valid tasks found');
      return;
    }
    
    addBulkTasks(tasksToCreate);
    
    // Clear the form
    setTaskList('');
    setSelectedClient('');
    setBulkDueDate(undefined);
    toast.success(`Successfully created ${tasksToCreate.length} tasks`);
  };
  
  const handleBulkFromTemplate = () => {
    if (!selectedTemplate) {
      toast.error('Please select a template');
      return;
    }
    
    if (!taskList.trim()) {
      toast.error('Please enter at least one task title');
      return;
    }
    
    const lines = taskList.trim().split('\n');
    const createdIds: string[] = [];
    
    lines
      .filter(line => line.trim().length > 0)
      .forEach(line => {
        const taskId = createTaskFromTemplate(selectedTemplate, {
          title: line.trim(),
          status: 'todo',
          priority: priority,
          clientId: selectedClient || undefined,
          clientName: selectedClient ? clients.find(c => c.id === selectedClient)?.name : undefined,
          dueDate: bulkDueDate,
          tags: [],
          recurrence: 'none'
        });
        
        if (taskId) {
          createdIds.push(taskId);
        }
      });
    
    // Show the created tasks preview
    setCreatedTaskIds(createdIds);
    setShowTasksPreview(true);
    
    // Clear the form
    setTaskList('');
    setSelectedTemplate('');
    setSelectedClient('');
    setBulkDueDate(undefined);
    
    toast.success(`Successfully created ${createdIds.length} tasks with subtasks`);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setTaskList(content);
    };
    reader.readAsText(file);
  };
  
  const handleViewTask = (taskId: string) => {
    setViewingTaskId(taskId);
  };
  
  const handleAddTasks = () => {
    if (!selectedClient || !selectedDueDate) {
      toast.error('Please select a client and due date');
      return;
    }
    
    const client = clients.find(c => c.id === selectedClient);
    if (!client) {
      toast.error('Invalid client selected');
      return;
    }

    const tasksToAdd = taskTitles
      .filter(title => title.trim())
      .map(title => ({
        title: title,
        description: '',
        status: 'todo' as TaskStatus,
        priority: selectedPriority,
        dueDate: selectedDueDate,
        clientId: selectedClient,
        clientName: client.name,
        tags: [],        // Add required tags array
        recurrence: 'none' as RecurrenceType // Add required recurrence property
      }));

    if (tasksToAdd.length === 0) {
      toast.error('No valid task titles entered');
      return;
    }

    addBulkTasks(tasksToAdd);
    toast.success(`${tasksToAdd.length} tasks created successfully`);
    
    // Reset form
    setTaskTitles(['']);
    setSelectedClient('');
    setSelectedPriority('medium');
    setSelectedDueDate(undefined);
  };

  const handleAddRow = () => {
    if (!selectedClient) {
      toast.error('Please select a client first');
      return;
    }
    
    const client = clients.find(c => c.id === selectedClient);
    if (!client) {
      toast.error('Invalid client selected');
      return;
    }

    const newTask = {
      title: '',
      status: 'todo' as TaskStatus,
      priority: selectedPriority as TaskPriority,
      clientId: selectedClient,
      clientName: client.name,
      dueDate: selectedDueDate || new Date(),
      tags: [],  // Add required tags array
      recurrence: 'none' as RecurrenceType // Add required recurrence property
    };
    
    setTaskTitles([...taskTitles, newTask.title]);
  };

  const createdTasks = tasks.filter(task => createdTaskIds.includes(task.id));

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Bulk Task Creation</h1>
              <p className="text-muted-foreground">
                Create multiple tasks at once by entering them line by line or using templates.
              </p>
            </div>

            <Tabs defaultValue="simple">
              <TabsList>
                <TabsTrigger value="simple">
                  <FilePlus className="h-4 w-4 mr-2" />
                  Simple Tasks
                </TabsTrigger>
                <TabsTrigger value="template">
                  <GitMerge className="h-4 w-4 mr-2" />
                  From Template
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="simple" className="space-y-4 pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Create Multiple Tasks</CardTitle>
                    <CardDescription>
                      Enter one task per line. All tasks will be created with the same settings.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="client">Client (Optional)</Label>
                        <Select 
                          value={selectedClient} 
                          onValueChange={setSelectedClient}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select client" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">No client</SelectItem>
                            {clients.map(client => (
                              <SelectItem key={client.id} value={client.id}>
                                {client.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="dueDate">Due Date (Optional)</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !bulkDueDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {bulkDueDate ? (
                                format(bulkDueDate, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={bulkDueDate}
                              onSelect={setBulkDueDate}
                              initialFocus
                              className="p-3 pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority</Label>
                      <Select 
                        value={priority} 
                        onValueChange={(value) => setPriority(value as 'low' | 'medium' | 'high')}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="taskList">Tasks (One Per Line)</Label>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          className="text-xs"
                          onClick={() => document.getElementById('fileUpload')?.click()}
                        >
                          <UploadCloud className="h-3 w-3 mr-1" />
                          Import from file
                        </Button>
                        <input
                          id="fileUpload"
                          type="file"
                          accept=".txt,.csv"
                          className="hidden"
                          onChange={handleFileUpload}
                        />
                      </div>
                      <Textarea
                        id="taskList"
                        value={taskList}
                        onChange={(e) => setTaskList(e.target.value)}
                        placeholder="Enter tasks, one per line:&#10;GST Filing for Client A&#10;Income Tax Return&#10;Audit Report Preparation"
                        rows={10}
                      />
                    </div>
                    
                    <Button onClick={handleBulkTasksFromLines} className="w-full">
                      Create Tasks
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="template" className="space-y-4 pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Create Tasks from Template</CardTitle>
                    <CardDescription>
                      Create tasks with predefined subtasks using templates. Enter one task per line.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="template">Select Template</Label>
                      <Select 
                        value={selectedTemplate} 
                        onValueChange={setSelectedTemplate}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a template" />
                        </SelectTrigger>
                        <SelectContent>
                          {templates.length === 0 ? (
                            <SelectItem value="" disabled>No templates available</SelectItem>
                          ) : (
                            templates.map(template => (
                              <SelectItem key={template.id} value={template.id}>
                                {template.name} ({template.subtasks.length} steps)
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      
                      {templates.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                          No templates available. Create templates in the Task Templates section.
                        </p>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="client">Client (Optional)</Label>
                        <Select 
                          value={selectedClient} 
                          onValueChange={setSelectedClient}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select client" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">No client</SelectItem>
                            {clients.map(client => (
                              <SelectItem key={client.id} value={client.id}>
                                {client.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="dueDate">Due Date (Optional)</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !bulkDueDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {bulkDueDate ? (
                                format(bulkDueDate, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={bulkDueDate}
                              onSelect={setBulkDueDate}
                              initialFocus
                              className="p-3 pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority</Label>
                      <Select 
                        value={priority} 
                        onValueChange={(value) => setPriority(value as 'low' | 'medium' | 'high')}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="taskList">Task Titles (One Per Line)</Label>
                      <Textarea
                        id="taskList"
                        value={taskList}
                        onChange={(e) => setTaskList(e.target.value)}
                        placeholder="Enter task titles, one per line:&#10;DGFT Registration for ABC Ltd&#10;DGFT Registration for XYZ Inc"
                        rows={6}
                      />
                    </div>
                    
                    <Button 
                      onClick={handleBulkFromTemplate} 
                      className="w-full"
                      disabled={!selectedTemplate || !taskList.trim()}
                    >
                      Create Tasks from Template
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {showTasksPreview && createdTasks.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Created Tasks</CardTitle>
                  <CardDescription>
                    {createdTasks.length} tasks were successfully created
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {createdTasks.map(task => (
                      <div 
                        key={task.id} 
                        className="p-3 border rounded-md flex justify-between items-center hover:bg-accent/30 cursor-pointer"
                        onClick={() => handleViewTask(task.id)}
                      >
                        <div>
                          <p className="font-medium">{task.title}</p>
                          {task.clientName && (
                            <p className="text-sm text-muted-foreground">Client: {task.clientName}</p>
                          )}
                        </div>
                        <Button variant="outline" size="sm">View</Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
      
      <Dialog open={!!viewingTaskId} onOpenChange={(open) => {
        if (!open) setViewingTaskId('');
      }}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Task Details</DialogTitle>
          </DialogHeader>
          {viewingTaskId && (
            <TaskDetails 
              task={tasks.find(t => t.id === viewingTaskId)!} 
              onClose={() => setViewingTaskId('')}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BulkTaskCreationPage;
