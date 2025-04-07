
import React, { useState } from 'react';
import { Task } from '@/types/task';
import { SubTask } from '@/types/client';
import { useTaskContext } from '@/contexts/TaskContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Pencil, Trash2, CalendarClock, User, Tag, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TaskForm } from '@/components/TaskForm';

interface TaskDetailsProps {
  task: Task;
  onClose?: () => void;
}

const TaskDetails: React.FC<TaskDetailsProps> = ({ task, onClose }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { updateTask, deleteTask, subtasks, updateSubtask, getTaskProgress } = useTaskContext();
  
  const taskSubtasks = subtasks
    .filter(st => st.taskId === task.id)
    .sort((a, b) => a.order - b.order);
  
  const progressPercentage = getTaskProgress(task.id);
  
  const handleSubtaskToggle = (subtaskId: string, isCompleted: boolean) => {
    updateSubtask(subtaskId, { completed: isCompleted });
    
    // If all subtasks are completed, mark task as done
    const allCompleted = subtasks
      .filter(st => st.taskId === task.id)
      .every(st => st.id === subtaskId ? isCompleted : st.completed);
      
    if (allCompleted && task.status !== 'done') {
      updateTask(task.id, { status: 'done' });
    }
    else if (!allCompleted && task.status === 'done') {
      updateTask(task.id, { status: 'inProgress' });
    }
    else if (isCompleted && task.status === 'todo') {
      updateTask(task.id, { status: 'inProgress' });
    }
  };
  
  const handleEditTask = (updatedTask: Omit<Task, 'id' | 'createdAt'>) => {
    updateTask(task.id, updatedTask);
    setIsEditModalOpen(false);
  };
  
  const handleDeleteTask = () => {
    if (window.confirm(`Are you sure you want to delete the task "${task.title}"?`)) {
      deleteTask(task.id);
      if (onClose) onClose();
    }
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
                <Pencil className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDeleteTask}>
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-4">
            <Badge className={getStatusColor(task.status)}>
              {task.status === 'todo' ? 'To Do' : 
               task.status === 'inProgress' ? 'In Progress' : 'Done'}
            </Badge>
            
            <Badge className={getPriorityColor(task.priority)}>
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
            </Badge>
            
            {task.projectName && (
              <Badge variant="outline">
                Project: {task.projectName}
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
            
            <Progress value={progressPercentage} className="h-2" />
            
            <div className="space-y-2 mt-4">
              {taskSubtasks.length > 0 ? (
                <div className="divide-y">
                  {taskSubtasks.map(subtask => (
                    <div key={subtask.id} className="flex items-start gap-3 py-2">
                      <Checkbox 
                        checked={subtask.completed} 
                        onCheckedChange={(checked) => 
                          handleSubtaskToggle(subtask.id, checked === true)
                        }
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${subtask.completed ? "line-through text-muted-foreground" : ""}`}>
                          {subtask.title}
                        </p>
                        {subtask.description && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {subtask.description}
                          </p>
                        )}
                        {subtask.assigneeName && (
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {subtask.assigneeName}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No subtasks for this task
                </p>
              )}
            </div>
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
    </div>
  );
};

export default TaskDetails;
