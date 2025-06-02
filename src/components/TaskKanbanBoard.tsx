
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Calendar, 
  Clock, 
  User, 
  MoreHorizontal,
  Plus,
  AlertCircle,
  CheckCircle2,
  Timer,
  Eye
} from 'lucide-react';
import { enhancedSupabaseService } from '@/services/enhancedSupabaseService';
import { Task } from '@/types/task';
import { format, isAfter, isToday } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const COLUMN_CONFIG = {
  todo: {
    title: 'To Do',
    icon: Plus,
    color: 'bg-gray-50 border-gray-200',
    count: 0
  },
  in_progress: {
    title: 'In Progress',
    icon: Timer,
    color: 'bg-blue-50 border-blue-200',
    count: 0
  },
  review: {
    title: 'Review',
    icon: Eye,
    color: 'bg-yellow-50 border-yellow-200',
    count: 0
  },
  done: {
    title: 'Done',
    icon: CheckCircle2,
    color: 'bg-green-50 border-green-200',
    count: 0
  }
};

interface TaskCardProps {
  task: Task;
  index: number;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, index }) => {
  const getDueDateColor = (dueDate?: Date) => {
    if (!dueDate) return 'text-muted-foreground';
    if (isToday(dueDate)) return 'text-orange-600 font-medium';
    if (isAfter(new Date(), dueDate)) return 'text-red-600 font-medium';
    return 'text-muted-foreground';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-red-50';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50';
      case 'low': return 'border-l-green-500 bg-green-50';
      default: return 'border-l-gray-300';
    }
  };

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={cn(
            "mb-3 select-none",
            snapshot.isDragging && "transform rotate-2"
          )}
        >
          <Card className={cn(
            "border-l-4 hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing",
            getPriorityColor(task.priority),
            snapshot.isDragging && "shadow-lg"
          )}>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-sm leading-tight line-clamp-2">
                    {task.title}
                  </h4>
                  {task.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {task.description}
                    </p>
                  )}
                </div>
                
                {task.clientName && (
                  <div className="flex items-center text-xs text-muted-foreground">
                    <User className="h-3 w-3 mr-1" />
                    {task.clientName}
                  </div>
                )}
                
                {task.dueDate && (
                  <div className={cn(
                    "flex items-center text-xs",
                    getDueDateColor(task.dueDate)
                  )}>
                    <Calendar className="h-3 w-3 mr-1" />
                    {format(task.dueDate, 'MMM dd, yyyy')}
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <Badge 
                    variant={task.priority === 'high' ? 'destructive' : 
                            task.priority === 'medium' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {task.priority}
                  </Badge>
                  
                  {task.timeSpentMinutes && task.timeSpentMinutes > 0 && (
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      {Math.round(task.timeSpentMinutes / 60 * 10) / 10}h
                    </div>
                  )}
                </div>
                
                {task.tags && task.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {task.tags.slice(0, 2).map((tag, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {task.tags.length > 2 && (
                      <span className="text-xs text-muted-foreground">
                        +{task.tags.length - 2} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Draggable>
  );
};

export const TaskKanbanBoard: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: tasks, isLoading, error } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => enhancedSupabaseService.getAllTasks(),
  });

  const updateTaskStatusMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: string }) =>
      enhancedSupabaseService.updateTaskStatus(taskId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: "Task Updated",
        description: "Task status has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update task status. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId;
    updateTaskStatusMutation.mutate({ taskId: draggableId, status: newStatus });
  };

  const getTasksByStatus = (status: string) => {
    return tasks?.filter(task => task.status === status) || [];
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center text-destructive">
            <AlertCircle className="h-5 w-5 mr-2" />
            Error loading tasks: {error.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.keys(COLUMN_CONFIG).map((status) => (
          <Card key={status}>
            <CardHeader className="pb-3">
              <Skeleton className="h-6 w-24" />
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(COLUMN_CONFIG).map(([status, config]) => {
          const statusTasks = getTasksByStatus(status);
          const IconComponent = config.icon;
          
          return (
            <Card key={status} className={cn("h-fit min-h-[400px]", config.color)}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <IconComponent className="h-4 w-4 mr-2" />
                    {config.title}
                  </div>
                  <Badge variant="secondary" className="ml-2">
                    {statusTasks.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Droppable droppableId={status}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={cn(
                        "min-h-[300px] transition-colors",
                        snapshot.isDraggingOver && "bg-blue-100 rounded-md"
                      )}
                    >
                      {statusTasks.map((task, index) => (
                        <TaskCard key={task.id} task={task} index={index} />
                      ))}
                      {provided.placeholder}
                      
                      {statusTasks.length === 0 && !snapshot.isDraggingOver && (
                        <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                          <IconComponent className="h-8 w-8 mb-2 opacity-50" />
                          <p className="text-sm">No tasks</p>
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </DragDropContext>
  );
};
