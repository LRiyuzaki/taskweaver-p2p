
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Task } from '@/types/task';
import { Calendar, Tag, AlertCircle } from 'lucide-react';
import { format, isAfter, isBefore, addDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { TaskSubtaskDisplay } from './TaskSubtaskDisplay';

interface TaskCardProps {
  task: Task;
  onClick?: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
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

  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        task.status === 'done' ? "opacity-80" : "",
        isOverdue ? "border-l-2 border-l-red-500" : "",
        isUpcoming && !isOverdue ? "border-l-2 border-l-amber-500" : ""
      )}
      onClick={() => onClick?.(task)}
    >
      <CardHeader className="p-3 pb-0">
        <div className="flex justify-between items-start">
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
          {task.tags.map((tag, i) => (
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

        {/* Integrate the new subtask display component */}
        <TaskSubtaskDisplay task={task} />
      </CardContent>
    </Card>
  );
};
