
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Task } from '@/types/task';
import { Calendar, Tag, AlertCircle, MoreVertical, Edit2, Trash2, Check } from 'lucide-react';
import { format, isAfter, isBefore, addDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { TaskSubtaskDisplay } from './TaskSubtaskDisplay';
import { useTaskContext } from '@/contexts/TaskContext';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import TaskDetails from './TaskDetails';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { toast } from '@/hooks/use-toast-extensions';

interface TaskCardProps {
  task: Task;
  onClick?: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
  const { updateTask, deleteTask } = useTaskContext();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const isOverdue = task.dueDate && isBefore(new Date(task.dueDate), new Date()) && task.status !== 'done';
  const isUpcoming = task.dueDate && 
    isAfter(new Date(task.dueDate), new Date()) && 
    isBefore(new Date(task.dueDate), addDays(new Date(), 3));
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500 text-white';
      case 'medium': return 'bg-amber-500 text-white';
      case 'low': return 'bg-blue-500 text-white';
      default: return 'bg-slate-500 text-white';
    }
  };
  
  const handleCardClick = (e: React.MouseEvent) => {
    if (isDragging) return;
    setDetailsOpen(true);
  };
  
  const handleQuickComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateTask(task.id, { status: task.status === 'done' ? 'todo' : 'done' });
    toast.success(task.status === 'done' ? 'Task marked as incomplete' : 'Task marked as complete');
  };
  
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDetailsOpen(true);
  };
  
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteDialogOpen(true);
  };
  
  const confirmDelete = () => {
    deleteTask(task.id);
    setDeleteDialogOpen(false);
    toast.success('Task deleted successfully');
  };

  return (
    <>
      <Card 
        className={cn(
          "cursor-pointer transition-all hover:shadow-md relative group",
          task.status === 'done' ? "opacity-80" : "",
          isOverdue ? "border-l-2 border-l-red-500" : "",
          isUpcoming && !isOverdue ? "border-l-2 border-l-amber-500" : ""
        )}
        onClick={handleCardClick}
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData('taskId', task.id);
          setIsDragging(true);
        }}
        onDragEnd={() => {
          setTimeout(() => setIsDragging(false), 100);
        }}
      >
        {/* Quick action button for completion */}
        <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="rounded-full p-1 hover:bg-muted">
                <MoreVertical className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleQuickComplete}>
                <Check className="h-4 w-4 mr-2" />
                {task.status === 'done' ? 'Mark as Incomplete' : 'Mark as Complete'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleEdit}>
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Task
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Task
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <CardHeader className="p-3 pb-0">
          <div className="flex justify-between items-start pr-6">
            <CardTitle className={cn(
              "text-base font-medium line-clamp-2", 
              task.status === 'done' && "line-through text-muted-foreground"
            )}>
              {task.title}
            </CardTitle>
            <Badge className={getPriorityColor(task.priority)}>
              {task.priority}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-2">
          {task.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
              {task.description}
            </p>
          )}
          
          <div className="flex flex-wrap gap-1 mb-2">
            {task.tags?.map((tag, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          {task.dueDate && (
            <div className="flex items-center text-xs text-muted-foreground mb-2">
              {isOverdue ? (
                <AlertCircle className="h-3 w-3 text-red-500 mr-1" />
              ) : (
                <Calendar className="h-3 w-3 mr-1" />
              )}
              <span className={isOverdue ? "text-red-500 font-medium" : ""}>
                {isOverdue ? "Overdue: " : "Due: "}
                {format(new Date(task.dueDate), "MMM d, yyyy")}
              </span>
            </div>
          )}
          
          {task.clientName && (
            <div className="flex items-center text-xs text-muted-foreground mb-2">
              <Tag className="h-3 w-3 mr-1" />
              <span>Client: {task.clientName}</span>
            </div>
          )}

          {/* Subtask display component */}
          <TaskSubtaskDisplay task={task} />
        </CardContent>
      </Card>
      
      {/* Task details dialog for editing */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-3xl">
          <TaskDetails task={task} onClose={() => setDetailsOpen(false)} />
        </DialogContent>
      </Dialog>
      
      {/* Confirmation dialog for deleting */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this task? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
