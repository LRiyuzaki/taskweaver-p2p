
import React from 'react';
import { Task } from '@/types/task';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Clock, Calendar, User, Briefcase, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  onClick: (task: Task) => void;
  isDraggable?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onClick, isDraggable = true }) => {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('taskId', task.id);
  };
  
  // Format due date if present
  const formattedDueDate = task.dueDate ? 
    format(new Date(task.dueDate), 'MMM d, yyyy') : 
    null;
    
  // Calculate if task is overdue
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';
  
  // Determine priority color
  const priorityColor = {
    low: 'bg-slate-400',
    medium: 'bg-blue-500',
    high: 'bg-red-500'
  }[task.priority];
  
  return (
    <Card 
      className={cn(
        "mb-2 cursor-pointer hover:shadow-md transition-shadow border-l-4",
        task.status === 'done' ? "border-l-green-500" : 
        isOverdue ? "border-l-red-500" : 
        "border-l-blue-500"
      )}
      draggable={isDraggable}
      onDragStart={handleDragStart}
      onClick={() => onClick(task)}
    >
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-sm truncate">{task.title}</h3>
          <div className={`w-2 h-2 rounded-full ${priorityColor}`} />
        </div>
        
        {task.description && (
          <p className="text-muted-foreground text-xs mb-2 line-clamp-2">{task.description}</p>
        )}
        
        {/* Display client information if available */}
        {task.clientId && (
          <div className="flex items-center text-xs text-muted-foreground mb-2">
            <Building2 className="h-3 w-3 mr-1" />
            <span className="truncate">{task.clientName || "Client"}</span>
          </div>
        )}
        
        {task.assigneeName && (
          <div className="flex items-center text-xs text-muted-foreground mb-2">
            <User className="h-3 w-3 mr-1" />
            <span className="truncate">{task.assigneeName}</span>
          </div>
        )}
        
        {task.projectName && (
          <div className="flex items-center text-xs text-muted-foreground mb-2">
            <Briefcase className="h-3 w-3 mr-1" />
            <span className="truncate">{task.projectName}</span>
          </div>
        )}
        
        <div className="flex items-center justify-between text-xs mt-2">
          {formattedDueDate && (
            <div className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              <span className={isOverdue ? "text-red-500 font-medium" : "text-muted-foreground"}>
                {formattedDueDate}
              </span>
            </div>
          )}
          
          {task.recurrence !== 'none' && (
            <Badge variant="outline" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              {task.recurrence}
            </Badge>
          )}
          
          {task.tags && task.tags.length > 0 && (
            <div className="flex gap-1 flex-wrap justify-end">
              {task.tags.slice(0, 2).map(tag => (
                <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>
              ))}
              {task.tags.length > 2 && <span className="text-muted-foreground">+{task.tags.length - 2}</span>}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskCard;
