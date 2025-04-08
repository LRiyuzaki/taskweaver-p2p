import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Plus, X, User, Repeat, Check, List, ClipboardList, GitMerge } from 'lucide-react';
import { Task, TaskPriority, TaskStatus, RecurrenceType } from '@/types/task';
import { SubTask } from '@/types/client';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useTaskContext } from '@/contexts/TaskContext';
import { useClientContext } from '@/contexts/ClientContext';
import { Checkbox } from "@/components/ui/checkbox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";

// Simulate team members data (in a real app, this would come from your API/context)
const teamMembers = [
  { id: '1', name: 'John Doe', email: 'john@example.com' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
  { id: '3', name: 'Alex Johnson', email: 'alex@example.com' },
];

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  status: z.enum(['todo', 'inProgress', 'done']),
  priority: z.enum(['low', 'medium', 'high']),
  dueDate: z.date().optional(),
  tags: z.array(z.string()).optional(),
  assignedTo: z.string().optional(),
  clientId: z.string().optional(),
  projectId: z.string().optional(),
  recurrence: z.enum(['none', 'daily', 'weekly', 'monthly', 'quarterly', 'halfYearly', 'yearly']).default('none'),
  recurrenceEndDate: z.date().optional()
    .refine(
      (date) => {
        if (!date) return true;
        const recurrence = form?.getValues('recurrence');
        const dueDate = form?.getValues('dueDate');
        if (recurrence === 'none' || !dueDate) return true;
        return date > dueDate;
      },
      'End date must be after the due date'
    ),
  templateId: z.string().optional(),
}).refine((data) => {
  // Require due date if recurrence is set
  if (data.recurrence !== 'none' && !data.dueDate) {
    return false;
  }
  return true;
}, {
  message: "Due date is required for recurring tasks",
  path: ["dueDate"]
});

type FormValues = z.infer<typeof formSchema>;

interface TaskFormProps {
  task?: Task;
  initialClientId?: string;
  onSubmit: (values: Omit<Task, 'id' | 'createdAt'>) => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({ task, initialClientId, onSubmit }) => {
  const [tagInput, setTagInput] = useState('');
  const [subtasks, setSubtasks] = useState<Partial<SubTask>[]>([]);
  const [subtaskInput, setSubtaskInput] = useState('');
  const [useTemplate, setUseTemplate] = useState(false);
  const { projects, templates, subtasks: existingSubtasks, addSubtask } = useTaskContext();
  const { clients } = useClientContext();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
      status: task?.status || 'todo',
      priority: task?.priority || 'medium',
      dueDate: task?.dueDate,
      tags: task?.tags || [],
      assignedTo: task?.assignedTo || '',
      clientId: task?.clientId || initialClientId || '',
      projectId: task?.projectId || '',
      recurrence: task?.recurrence || 'none',
      recurrenceEndDate: task?.recurrenceEndDate,
      templateId: '',
    },
  });

  // Load existing subtasks if editing
  useEffect(() => {
    if (task?.id) {
      const taskSubtasks = existingSubtasks
        .filter(st => st.taskId === task.id)
        .sort((a, b) => a.order - b.order)
        .map(st => ({
          id: st.id,
          title: st.title,
          description: st.description,
          completed: st.completed,
          order: st.order,
          assignedTo: st.assignedTo,
          assigneeName: st.assigneeName
        }));
      
      setSubtasks(taskSubtasks);
    }
  }, [task?.id, existingSubtasks]);

  // Show client in form when editing task with clientId
  useEffect(() => {
    if (initialClientId) {
      form.setValue('clientId', initialClientId);
    }
  }, [initialClientId, form]);

  // Set additional conditions for recurrence end date visibility
  const showRecurrenceEndDate = form.watch('recurrence') !== 'none';
  const selectedClientId = form.watch('clientId');
  const selectedTemplateId = form.watch('templateId');
  
  // Get selected client details
  const selectedClient = selectedClientId ? 
    clients.find(client => client.id === selectedClientId) : null;

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const currentTags = form.getValues('tags') || [];
      if (!currentTags.includes(tagInput.trim())) {
        form.setValue('tags', [...currentTags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    const currentTags = form.getValues('tags') || [];
    form.setValue(
      'tags',
      currentTags.filter((t) => t !== tag)
    );
  };

  const handleTemplateChange = (templateId: string) => {
    if (!templateId || templateId === 'no-template') {
      return;
    }
    
    const template = templates.find(t => t.id === templateId);
    if (template && template.subtasks) {
      setSubtasks(template.subtasks.map((st, index) => ({
        title: st.title,
        description: st.description,
        completed: false,
        order: index,
        assignedTo: st.assignedTo,
        assigneeName: st.assigneeName
      })));
    }
  };

  const handleAddSubtask = () => {
    if (subtaskInput.trim()) {
      setSubtasks([
        ...subtasks, 
        { 
          title: subtaskInput.trim(), 
          completed: false, 
          order: subtasks.length 
        }
      ]);
      setSubtaskInput('');
    }
  };

  const handleRemoveSubtask = (index: number) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  const handleToggleSubtaskComplete = (index: number) => {
    setSubtasks(
      subtasks.map((st, i) => 
        i === index ? { ...st, completed: !st.completed } : st
      )
    );
  };

  const handleSubmitWithSubtasks = (values: FormValues) => {
    const submitValues = { ...values } as any;

    // If there are subtasks, default status to 'todo' regardless of selection
    // This ensures proper progress tracking through subtasks
    if (subtasks.length > 0) {
      submitValues.status = 'todo';
    }
    
    // Add the assignee name if an assignee is selected
    if (values.assignedTo) {
      const assignee = teamMembers.find(member => member.id === values.assignedTo);
      if (assignee) {
        submitValues.assigneeName = assignee.name;
      }
    }
    
    // Add the project name if a project is selected
    if (values.projectId && values.projectId !== 'no-project') {
      const project = projects.find(p => p.id === values.projectId);
      if (project) {
        submitValues.projectName = project.name;
      }
    }
    
    // Add client name if client is selected
    if (values.clientId && values.clientId !== 'no-client') {
      const client = clients.find(c => c.id === values.clientId);
      if (client) {
        submitValues.clientName = client.name;
      }
    }
    
    // Handle task submission
    const taskId = onSubmit(submitValues);
    
    // Add subtasks if any exist
    if (subtasks.length > 0 && addSubtask) {
      subtasks.forEach((subtask, index) => {
        addSubtask({
          taskId,
          title: subtask.title || '',
          description: subtask.description,
          completed: subtask.completed || false,
          order: index,
          assignedTo: subtask.assignedTo,
          assigneeName: subtask.assigneeName
        });
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmitWithSubtasks)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Task title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Add details..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Template selection */}
        <FormField
          control={form.control}
          name="templateId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <GitMerge className="h-4 w-4" />
                Use Template
              </FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  handleTemplateChange(value);
                }}
                value={field.value || 'no-template'}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="no-template">No Template</SelectItem>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name} ({template.subtasks.length} steps)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Client selection field */}
        <FormField
          control={form.control}
          name="clientId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Associated Client</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value || ''}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="no-client">No Client</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name} ({client.company})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
              
              {/* Show selected client information if available */}
              {selectedClient && (
                <div className="mt-2 p-2 bg-muted/40 rounded-md">
                  <p className="text-sm">
                    <span className="font-medium">Selected Client:</span> {selectedClient.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {selectedClient.email} • {selectedClient.phone || "No phone"}
                  </p>
                </div>
              )}
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="inProgress">In Progress</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priority</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Due Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="assignedTo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Assign To</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select team member" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {teamMembers.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="projectId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="no-project">No Project</SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="recurrence"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Recurrence</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select recurrence" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">One-time (No recurrence)</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="halfYearly">Half-yearly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {showRecurrenceEndDate && (
          <FormField
            control={form.control}
            name="recurrenceEndDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Recurrence End Date (Optional)</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>No end date</span>
                        )}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <div className="p-2">
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start mb-2"
                        onClick={(e) => {
                          e.preventDefault();
                          field.onChange(undefined);
                        }}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Clear date
                      </Button>
                    </div>
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < new Date()
                      }
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <div className="flex flex-wrap gap-2 mb-2">
                {field.value?.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <button 
                      type="button" 
                      onClick={() => handleRemoveTag(tag)}
                      className="text-xs leading-none"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex items-center">
                <Input
                  placeholder="Add tag (press Enter)"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  className="flex-1"
                />
                {tagInput && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="ml-2"
                    onClick={() => {
                      const currentTags = form.getValues('tags') || [];
                      if (tagInput.trim() && !currentTags.includes(tagInput.trim())) {
                        form.setValue('tags', [...currentTags, tagInput.trim()]);
                      }
                      setTagInput('');
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="subtasks">
            <AccordionTrigger className="font-medium text-sm">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4" />
                Task Steps/Subtasks {subtasks.length > 0 && `(${subtasks.length})`}
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Add a subtask"
                    value={subtaskInput}
                    onChange={(e) => setSubtaskInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSubtask();
                      }
                    }}
                    className="flex-1"
                  />
                  <Button 
                    type="button"
                    size="sm" 
                    onClick={handleAddSubtask}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
                
                {subtasks.length > 0 ? (
                  <div className="space-y-2">
                    {subtasks.map((subtask, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 rounded-md border">
                        <Checkbox 
                          checked={subtask.completed}
                          onCheckedChange={() => handleToggleSubtaskComplete(index)}
                        />
                        <div className="flex-1">
                          <p className={cn(
                            "text-sm font-medium",
                            subtask.completed && "line-through text-muted-foreground"
                          )}>
                            {subtask.title}
                          </p>
                          {subtask.description && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {subtask.description}
                            </p>
                          )}
                        </div>
                        <Button 
                          type="button"
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleRemoveSubtask(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-2">
                    No subtasks added yet
                  </p>
                )}
                
                <div className="text-xs text-muted-foreground">
                  Add steps to track the progress of this task. Each step can be marked as completed individually.
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Button type="submit" className="w-full">
          {task ? 'Update Task' : 'Create Task'}
        </Button>
      </form>
    </Form>
  );
};
