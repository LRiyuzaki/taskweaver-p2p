import React, { useState, ReactNode } from 'react';
import { Task, TaskStatus } from '@/types/task';
import { TaskCard } from '@/components/TaskCard';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { MoreHorizontal, ChevronUp, ChevronDown, Plus, Filter, SortAsc, SortDesc, ClipboardCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuCheckboxItem
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
  icon?: ReactNode;
}

export const TaskColumn: React.FC<TaskColumnProps> = ({ 
  title, 
  status, 
  tasks, 
  onTaskClick,
  onDrop,
  icon
}) => {
  const { addTask } = useTaskContext();
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [sortOrder, setSortOrder] = useState<'default' | 'priority' | 'date' | 'timeSpent'>('default');
  const [priorityFilter, setPriorityFilter] = useState<string[]>([]); 
  const [showSubtasks, setShowSubtasks] = useState(true); // Toggle for subtask visibility
  
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
      status, // Force the status to match this column
      recurrence: formData.recurrence || 'none',
    });
    setIsAddTaskDialogOpen(false);
    toast.success(`Task added to ${title}`);
  };
  
  const getFilteredAndSortedTasks = () => {
    let filteredTasks = tasks;
    
    if (priorityFilter.length > 0) {
      filteredTasks = filteredTasks.filter(task => priorityFilter.includes(task.priority));
    }
    
    switch (sortOrder) {
      case 'priority':
        return [...filteredTasks].sort((a, b) => {
          const priorityValues = { high: 3, medium: 2, low: 1 };
          return (priorityValues[b.priority as keyof typeof priorityValues] || 0) - 
                 (priorityValues[a.priority as keyof typeof priorityValues] || 0);
        });
      case 'date':
        return [...filteredTasks].sort((a, b) => {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        });
      case 'timeSpent':
        return [...filteredTasks].sort((a, b) => {
          const aTime = a.timeSpentMinutes || 0;
          const bTime = b.timeSpentMinutes || 0;
          return bTime - aTime; // Sort by most time spent first
        });
      default:
        return filteredTasks;
    }
  };
  
  const processedTasks = getFilteredAndSortedTasks();
  const isPriorityFiltered = priorityFilter.length > 0;
  
  const togglePriorityFilter = (priority: string) => {
    setPriorityFilter(prev => {
      if (prev.includes(priority)) {
        return prev.filter(p => p !== priority);
      } else {
        return [...prev, priority];
      }
    });
  };
  
  // Get appropriate status color
  const getStatusColor = () => {
    switch(status) {
      case 'todo': return 'border-slate-200';
      case 'inProgress': return 'border-blue-200';
      case 'review': return 'border-amber-200';
      case 'done': return 'border-green-200';
      default: return 'border-slate-200';
    }
  };
  
  return (
    <div className="min-h-[300px]">
      <div 
        className={cn(
          "task-column h-full flex flex-col rounded-md border-2 p-4 transition-all hover:border-border/80",
          getStatusColor(),
          isMinimized ? "max-h-16 overflow-hidden" : ""
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {icon}
            <h3 className="font-medium text-sm uppercase tracking-wide">{title}</h3>
            <Badge variant={
              status === 'todo' ? "outline" :
              status === 'inProgress' ? "secondary" :
              status === 'review' ? "outline" : 
              "default"
            }>{processedTasks.length}</Badge>
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
                
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Filter className="h-4 w-4 mr-2" />
                    Filter by Priority
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuCheckboxItem
                      checked={priorityFilter.includes('high')}
                      onCheckedChange={() => togglePriorityFilter('high')}
                    >
                      High Priority
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={priorityFilter.includes('medium')}
                      onCheckedChange={() => togglePriorityFilter('medium')}
                    >
                      Medium Priority
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={priorityFilter.includes('low')}
                      onCheckedChange={() => togglePriorityFilter('low')}
                    >
                      Low Priority
                    </DropdownMenuCheckboxItem>
                    {isPriorityFiltered && (
                      <DropdownMenuItem onClick={() => setPriorityFilter([])}>
                        Clear Filters
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <SortAsc className="h-4 w-4 mr-2" />
                    Sort Tasks
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem 
                      onClick={() => setSortOrder('default')} 
                      disabled={sortOrder === 'default'}
                    >
                      Default Order
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setSortOrder('priority')} 
                      disabled={sortOrder === 'priority'}
                    >
                      By Priority
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setSortOrder('date')} 
                      disabled={sortOrder === 'date'}
                    >
                      By Due Date
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setSortOrder('timeSpent')} 
                      disabled={sortOrder === 'timeSpent'}
                    >
                      By Time Spent
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>

                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem 
                  checked={showSubtasks}
                  onCheckedChange={setShowSubtasks}
                >
                  Show Subtasks
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {!isMinimized && (
          <>
            <div className={cn("space-y-3 flex-1")}>
              {processedTasks.map((task) => (
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
                    showSubtasks={showSubtasks}
                  />
                </div>
              ))}
              
              {processedTasks.length === 0 && (
                <div className="flex flex-col items-center justify-center h-32 bg-muted/30 rounded-md border border-dashed border-muted">
                  <p className="text-sm text-muted-foreground mb-2">
                    {isPriorityFiltered ? 
                      "No tasks match your filter" : 
                      "No tasks in this column"
                    }
                  </p>
                  <Button variant="outline" size="sm" onClick={handleAddTask}>
                    <Plus className="h-4 w-4 mr-1" /> Add Task
                  </Button>
                </div>
              )}
            </div>
            
            {processedTasks.length > 0 && (
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
            initialClientId={undefined}
            task={undefined}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
