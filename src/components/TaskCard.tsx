
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Task } from '@/types/task';
import { Calendar, Tag, AlertCircle, MoreVertical, Edit2, Trash2, Check, Clock, User, FileText, ClipboardCheck } from 'lucide-react';
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
  showSubtasks?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onClick, showSubtasks = true }) => {
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

  const getStatusBadge = () => {
    switch(task.status) {
      case 'todo': 
        return <Badge variant="outline">To Do</Badge>;
      case 'inProgress': 
        return <Badge variant="secondary">In Progress</Badge>;
      case 'review': 
        return <Badge variant="outline" className="border-amber-500 text-amber-600">In Review</Badge>;
      case 'done': 
        return <Badge variant="default">Done</Badge>;
      default: 
        return null;
    }
  };

  const formatTimeSpent = (minutes?: number): string => {
    if (!minutes) return "0h";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins > 0 ? mins + 'm' : ''}` : `${mins}m`;
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

  // Check if all subtasks are completed
  const allSubtasksCompleted = task.subtasks && task.subtasks.length > 0 && 
    task.subtasks.every(subtask => subtask.completed);

  // Calculate percentage of completed subtasks
  const subtaskCompletionPercentage = task.subtasks && task.subtasks.length > 0 
    ? (task.subtasks.filter(st => st.completed).length / task.subtasks.length) * 100 
    : 0;

  return (
    <>
      <Card 
        className={cn(
          "cursor-pointer transition-all hover:shadow-md relative group",
          task.status === 'done' ? "opacity-80" : "",
          isOverdue ? "border-l-2 border-l-red-500" : "",
          isUpcoming && !isOverdue ? "border-l-2 border-l-amber-500" : "",
          task.status === 'review' ? "border-l-2 border-l-amber-500" : ""
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
            {getStatusBadge()}
            {task.requiresReview && (
              <Badge variant="outline" className="border-amber-500 text-amber-600">
                <ClipboardCheck className="h-3 w-3 mr-1" /> Needs Review
              </Badge>
            )}
            {task.reviewStatus === 'approved' && (
              <Badge variant="outline" className="border-green-500 text-green-600">
                <Check className="h-3 w-3 mr-1" /> Approved
              </Badge>
            )}
            {task.tags?.map((tag, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          {/* Service name */}
          {task.serviceName && (
            <div className="flex items-center text-xs text-muted-foreground mb-2">
              <FileText className="h-3 w-3 mr-1" />
              <span>{task.serviceName}</span>
            </div>
          )}

          {/* Due date */}
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
          
          {/* Client name */}
          {task.clientName && (
            <div className="flex items-center text-xs text-muted-foreground mb-2">
              <Tag className="h-3 w-3 mr-1" />
              <span>Client: {task.clientName}</span>
            </div>
          )}

          {/* Assigned to */}
          {task.assigneeName && (
            <div className="flex items-center text-xs text-muted-foreground mb-2">
              <User className="h-3 w-3 mr-1" />
              <span>Assigned: {task.assigneeName}</span>
            </div>
          )}

          {/* Time tracking */}
          {task.timeSpentMinutes !== undefined && task.timeSpentMinutes > 0 && (
            <div className="flex items-center text-xs text-muted-foreground mb-2">
              <Clock className="h-3 w-3 mr-1" />
              <span>Time spent: {formatTimeSpent(task.timeSpentMinutes)}</span>
            </div>
          )}

          {/* Subtasks progress */}
          {task.subtasks && task.subtasks.length > 0 && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Subtasks: {task.subtasks.filter(st => st.completed).length}/{task.subtasks.length}</span>
                <span>{Math.round(subtaskCompletionPercentage)}%</span>
              </div>
              <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full rounded-full",
                    allSubtasksCompleted ? "bg-green-500" : "bg-blue-500"
                  )} 
                  style={{ width: `${subtaskCompletionPercentage}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Only show subtasks list if enabled */}
          {showSubtasks && task.subtasks && task.subtasks.length > 0 && (
            <div className="mt-3">
              <TaskSubtaskDisplay task={task} />
            </div>
          )}
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
