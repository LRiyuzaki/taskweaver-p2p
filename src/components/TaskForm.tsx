
import React, { useState, useEffect } from 'react';
import { Task, TaskStatus, TaskPriority, RecurrenceType, SubTask } from '@/types/task';
import { useClientContext } from '@/contexts/ClientContext';
import { useTaskContext } from '@/contexts/TaskContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { CalendarIcon, Plus, Trash2, GripVertical } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { v4 as uuidv4 } from 'uuid';

interface TaskFormProps {
  task?: Task;
  onSubmit: (data: Omit<Task, 'id' | 'createdAt'>) => void;
  initialClientId?: string;
}

export const TaskForm: React.FC<TaskFormProps> = ({ task, onSubmit, initialClientId }) => {
  const { clients } = useClientContext();
  const { subtasks, addSubtask, updateSubtask, deleteSubtask } = useTaskContext();
  
  const [formData, setFormData] = useState<Omit<Task, 'id' | 'createdAt'>>({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    dueDate: undefined,
    updatedAt: new Date(),
    assignedTo: '',
    assigneeName: '',
    clientId: initialClientId || '',
    clientName: '',
    projectId: '',
    projectName: '',
    serviceId: '',
    serviceName: '',
    requiresReview: false,
    reviewerId: '',
    reviewerName: '',
    reviewStatus: undefined,
    comments: '',
    tags: [],
    recurrence: 'none',
    recurrenceEndDate: undefined,
    subtasks: [],
    timeSpentMinutes: 0
  });

  const [newTag, setNewTag] = useState('');
  const [localSubtasks, setLocalSubtasks] = useState<Omit<SubTask, 'id' | 'taskId'>[]>([]);

  // Initialize form with task data if provided
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        updatedAt: new Date(),
        assignedTo: task.assignedTo || '',
        assigneeName: task.assigneeName || '',
        clientId: task.clientId || '',
        clientName: task.clientName || '',
        projectId: task.projectId || '',
        projectName: task.projectName || '',
        serviceId: task.serviceId || '',
        serviceName: task.serviceName || '',
        requiresReview: task.requiresReview || false,
        reviewerId: task.reviewerId || '',
        reviewerName: task.reviewerName || '',
        reviewStatus: task.reviewStatus,
        comments: task.comments || '',
        tags: task.tags || [],
        recurrence: task.recurrence || 'none',
        recurrenceEndDate: task.recurrenceEndDate,
        subtasks: task.subtasks || [],
        timeSpentMinutes: task.timeSpentMinutes || 0
      });

      // Load existing subtasks
      if (task.id) {
        const taskSubtasks = subtasks.filter(s => s.taskId === task.id);
        setLocalSubtasks(taskSubtasks.map(s => ({
          title: s.title,
          description: s.description || '',
          completed: s.completed,
          order: s.order,
          orderPosition: s.orderPosition,
          assignedTo: s.assignedTo || '',
          assigneeName: s.assigneeName || ''
        })));
      }
    }
  }, [task, subtasks]);

  const handleChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleClientSelect = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    setFormData(prev => ({
      ...prev,
      clientId,
      clientName: client?.name || ''
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleAddSubtask = () => {
    const newSubtask: Omit<SubTask, 'id' | 'taskId'> = {
      title: '',
      description: '',
      completed: false,
      order: localSubtasks.length,
      orderPosition: localSubtasks.length,
      assignedTo: '',
      assigneeName: ''
    };
    setLocalSubtasks(prev => [...prev, newSubtask]);
  };

  const handleUpdateSubtask = (index: number, field: keyof Omit<SubTask, 'id' | 'taskId'>, value: any) => {
    setLocalSubtasks(prev => prev.map((subtask, i) => 
      i === index ? { ...subtask, [field]: value } : subtask
    ));
  };

  const handleRemoveSubtask = (index: number) => {
    setLocalSubtasks(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create final form data with properly formatted subtasks
    const finalFormData: Omit<Task, 'id' | 'createdAt'> = {
      ...formData,
      updatedAt: new Date(),
      subtasks: localSubtasks.map((_, index) => `subtask-${index}`) // Simple array of IDs
    };

    onSubmit(finalFormData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Task Details</h3>
        
        <div className="space-y-2">
          <Label htmlFor="title">Title <span className="text-destructive">*</span></Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: TaskStatus) => handleChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="review">Review</SelectItem>
                <SelectItem value="done">Done</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Priority</Label>
            <Select
              value={formData.priority}
              onValueChange={(value: TaskPriority) => handleChange('priority', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
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
                    !formData.dueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.dueDate ? format(formData.dueDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.dueDate}
                  onSelect={(date) => handleChange('dueDate', date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* Client Assignment */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Assignment</h3>
        
        <div className="space-y-2">
          <Label>Client</Label>
          <Select
            value={formData.clientId}
            onValueChange={handleClientSelect}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a client" />
            </SelectTrigger>
            <SelectContent>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="assigneeName">Assigned To</Label>
            <Input
              id="assigneeName"
              value={formData.assigneeName}
              onChange={(e) => handleChange('assigneeName', e.target.value)}
              placeholder="Team member name"
            />
          </div>

          <div className="space-y-2">
            <Label>Recurrence</Label>
            <Select
              value={formData.recurrence}
              onValueChange={(value: RecurrenceType) => handleChange('recurrence', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Tags</h3>
        
        <div className="flex gap-2">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Add a tag"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddTag();
              }
            }}
          />
          <Button type="button" onClick={handleAddTag} size="sm">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {formData.tags.map(tag => (
            <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveTag(tag)}>
              {tag} ×
            </Badge>
          ))}
        </div>
      </div>

      {/* Subtasks */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Subtasks</h3>
          <Button type="button" onClick={handleAddSubtask} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add Subtask
          </Button>
        </div>

        {localSubtasks.map((subtask, index) => (
          <Card key={index}>
            <CardContent className="pt-4">
              <div className="flex items-start gap-2">
                <GripVertical className="h-4 w-4 text-gray-400 mt-2" />
                <div className="flex-1 space-y-2">
                  <Input
                    value={subtask.title}
                    onChange={(e) => handleUpdateSubtask(index, 'title', e.target.value)}
                    placeholder="Subtask title"
                  />
                  <Input
                    value={subtask.description}
                    onChange={(e) => handleUpdateSubtask(index, 'description', e.target.value)}
                    placeholder="Subtask description (optional)"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveSubtask(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end">
        <Button type="submit">
          {task ? 'Update Task' : 'Create Task'}
        </Button>
      </div>
    </form>
  );
};
