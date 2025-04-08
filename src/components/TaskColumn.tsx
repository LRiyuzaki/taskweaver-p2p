
import React, { useState } from 'react';
import { Task, TaskStatus } from '@/types/task';
import { TaskCard } from '@/components/TaskCard';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { MoreHorizontal, ChevronUp, ChevronDown, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TaskForm } from '@/components/TaskForm';
import { useTaskContext } from '@/contexts/TaskContext';
import { toast } from '@/hooks/use-toast-extensions';

interface TaskColumnProps {
  title: string;
  status: TaskStatus;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onDrop: (e: React.DragEvent, status: TaskStatus) => void;
}

export const TaskColumn: React.FC<TaskColumnProps> = ({ 
  title, 
  status, 
  tasks, 
  onTaskClick,
  onDrop
}) => {
  const { addTask } = useTaskContext();
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [sortOrder, setSortOrder] = useState<'default' | 'priority' | 'date'>('default');
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('bg-muted/60');
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('bg-muted/60');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('bg-muted/60');
    onDrop(e, status);
  };
  
  const handleAddTask = () => {
    setIsAddTaskDialogOpen(true);
  };
  
  const handleTaskFormSubmit = (formData: Omit<Task, 'id' | 'createdAt'>) => {
    addTask({
      ...formData,
      status // Force the status to match this column
    });
    setIsAddTaskDialogOpen(false);
    toast.success(`Task added to ${title}`);
  };
  
  // Sort tasks based on current sortOrder
  const getSortedTasks = () => {
    switch (sortOrder) {
      case 'priority':
        // Sort by priority (high > medium > low)
        return [...tasks].sort((a, b) => {
          const priorityValues = { high: 3, medium: 2, low: 1 };
          return (priorityValues[b.priority as keyof typeof priorityValues] || 0) - 
                 (priorityValues[a.priority as keyof typeof priorityValues] || 0);
        });
      case 'date':
        // Sort by due date (nearest first)
        return [...tasks].sort((a, b) => {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        });
      default:
        // Default order (no sorting)
        return tasks;
    }
  };
  
  const sortedTasks = getSortedTasks();
  
  return (
    <div className="min-h-[300px]">
      <div 
        className={cn(
          "task-column h-full flex flex-col rounded-md border border-border p-4 transition-colors",
          isMinimized ? "max-h-16 overflow-hidden" : ""
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-sm uppercase tracking-wide">{title}</h3>
            <Badge variant="secondary">{tasks.length}</Badge>
          </div>
          
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6" 
              onClick={() => setIsMinimized(!isMinimized)}
            >
              {isMinimized ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleAddTask}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task to {title}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setSortOrder('default')} disabled={sortOrder === 'default'}>
                  Default Order
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOrder('priority')} disabled={sortOrder === 'priority'}>
                  Sort by Priority
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOrder('date')} disabled={sortOrder === 'date'}>
                  Sort by Due Date
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {!isMinimized && (
          <>
            <div className={cn("space-y-3 flex-1")}>
              {sortedTasks.map((task) => (
                <div 
                  key={task.id}
                  className="group"
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('taskId', task.id);
                  }}
                >
                  <TaskCard 
                    task={task} 
                    onClick={() => onTaskClick(task)}
                  />
                </div>
              ))}
              
              {tasks.length === 0 && (
                <div className="flex flex-col items-center justify-center h-32 bg-muted/30 rounded-md border border-dashed border-muted">
                  <p className="text-sm text-muted-foreground mb-2">No tasks in this column</p>
                  <Button variant="outline" size="sm" onClick={handleAddTask}>
                    <Plus className="h-4 w-4 mr-1" /> Add Task
                  </Button>
                </div>
              )}
            </div>
            
            {tasks.length > 0 && (
              <Button
                onClick={handleAddTask}
                variant="ghost"
                className="w-full mt-4 border border-dashed"
              >
                <Plus className="h-4 w-4 mr-1" /> Add Task
              </Button>
            )}
          </>
        )}
      </div>
      
      <Dialog open={isAddTaskDialogOpen} onOpenChange={setIsAddTaskDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Task to {title}</DialogTitle>
          </DialogHeader>
          <TaskForm 
            onSubmit={handleTaskFormSubmit}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
