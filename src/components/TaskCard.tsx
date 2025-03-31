
import React from 'react';
import { cn } from '@/lib/utils';
import { Task, TaskPriority } from '@/types/task';
import { format } from 'date-fns';
import { CalendarIcon, Clock, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
  className?: string;
}

const priorityClasses: Record<TaskPriority, string> = {
  high: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
};

export const TaskCard: React.FC<TaskCardProps> = ({ task, onClick, className }) => {
  return (
    <Card 
      className={cn('task-card', className)}
      onClick={onClick}
    >
      <CardHeader className="p-3 pb-0">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base font-medium">{task.title}</CardTitle>
          <Badge className={cn('ml-2', priorityClasses[task.priority])}>
            {task.priority}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-2">
        {task.description && (
          <CardDescription className="text-sm mt-1 line-clamp-2">
            {task.description}
          </CardDescription>
        )}
      </CardContent>
      <CardFooter className="p-3 pt-0 flex flex-wrap gap-2">
        {task.dueDate && (
          <div className="flex items-center text-xs text-muted-foreground">
            <CalendarIcon className="h-3 w-3 mr-1" />
            {format(task.dueDate, 'MMM d, yyyy')}
          </div>
        )}
        
        {task.tags && task.tags.length > 0 && (
          <div className="flex items-center flex-wrap gap-1 ml-auto">
            {task.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs py-0">
                {tag}
              </Badge>
            ))}
            {task.tags.length > 2 && (
              <Badge variant="outline" className="text-xs py-0">
                +{task.tags.length - 2}
              </Badge>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
};
