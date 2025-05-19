
import React, { useState } from 'react';
import { Task } from '@/types/task';
import { useTaskContext } from '@/contexts/TaskContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarClock, User, Tag, CheckCircle2, Edit2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TaskForm } from '@/components/TaskForm';
import { toast } from '@/hooks/use-toast-extensions';
import { cn } from '@/lib/utils';
import { TaskSubtaskDisplay } from './TaskSubtaskDisplay';
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
import { useNavigate } from 'react-router-dom';

interface TaskDetailsProps {
  task: Task;
  onClose?: () => void;
}

const TaskDetails: React.FC<TaskDetailsProps> = ({ task, onClose }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { updateTask, deleteTask, getTaskProgress } = useTaskContext();
  const navigate = useNavigate();
  
  const progressPercentage = getTaskProgress(task.id);
  
  const handleEditTask = (updatedTask: Omit<Task, 'id' | 'createdAt'>) => {
    updateTask(task.id, updatedTask);
    setIsEditModalOpen(false);
    toast.success('Task updated successfully');
  };
  
  const handleDeleteTask = () => {
    deleteTask(task.id);
    if (onClose) onClose();
    toast.success('Task deleted successfully');
    navigate('/tasks');
  };
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500 text-white';
      case 'medium': return 'bg-amber-500 text-white';
      case 'low': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done': return 'bg-green-500 text-white';
      case 'inProgress': return 'bg-blue-500 text-white';
      case 'review': return 'bg-amber-500 text-white';
      case 'todo': return 'bg-slate-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl font-bold">{task.title}</CardTitle>
              {task.clientName && (
                <CardDescription>
                  Client: {task.clientName}
                </CardDescription>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsEditModalOpen(true)}>
                <Edit2 className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <Button variant="destructive" size="sm" onClick={() => setIsDeleteDialogOpen(true)}>
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-4">
            <Badge className={getStatusColor(task.status)}>
              {task.status === 'todo' ? 'To Do' : 
               task.status === 'inProgress' ? 'In Progress' : 
               task.status === 'review' ? 'In Review' : 'Done'}
            </Badge>
            
            <Badge className={getPriorityColor(task.priority)}>
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
            </Badge>
            
            {task.projectName && (
              <Badge variant="outline">
                Project: {task.projectName}
              </Badge>
            )}
            
            {task.recurrence !== 'none' && (
              <Badge variant="outline" className="bg-purple-100">
                {task.recurrence.charAt(0).toUpperCase() + task.recurrence.slice(1)} Recurring
              </Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {task.description && (
            <div className="space-y-2">
              <h3 className="font-medium">Description</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{task.description}</p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {task.dueDate && (
              <div className="flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Due: {format(new Date(task.dueDate), "PPP")}
                </span>
              </div>
            )}
            
            {task.assigneeName && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Assigned to: {task.assigneeName}
                </span>
              </div>
            )}
          </div>
          
          {task.tags && task.tags.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-medium">Tags</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {task.tags.map(tag => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>
            </div>
          )}
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                Progress 
                <span className="text-sm text-muted-foreground">({progressPercentage}%)</span>
              </h3>
            </div>
            
            <TaskSubtaskDisplay task={task} showCheckboxes={true} showAll={true} editable={true} />
          </div>
        </CardContent>
        
        {onClose && (
          <CardFooter className="flex justify-end">
            <Button variant="outline" onClick={onClose}>Close</Button>
          </CardFooter>
        )}
      </Card>
      
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <TaskForm task={task} onSubmit={handleEditTask} />
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{task.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteTask} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TaskDetails;
