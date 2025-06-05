
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Task, SubTask } from '@/types/task';
import { cn } from '@/lib/utils';
import { Calendar, Clock, User, AlertCircle, CheckCircle2, Circle, ChevronDown, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { useTaskContext } from '@/contexts/TaskContext';

interface TaskCardProps {
  task: Task;
  onClick?: (task: Task) => void;
  showSubtasks?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  onClick,
  showSubtasks = true 
}) => {
  const { subtasks, updateSubtask } = useTaskContext();
  const [isSubtasksExpanded, setIsSubtasksExpanded] = useState(false);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo': return 'bg-slate-100 text-slate-800 border-slate-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'review': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'done': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const taskSubtasks = subtasks.filter(s => task.subtasks.includes(s.id));
  const completedSubtasks = taskSubtasks.filter(s => s.completed);
  const subtaskProgress = taskSubtasks.length > 0 ? 
    Math.round((completedSubtasks.length / taskSubtasks.length) * 100) : 0;

  const handleSubtaskToggle = async (subtaskId: string, completed: boolean) => {
    await updateSubtask(subtaskId, { completed });
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';

  return (
    <Card 
      className={cn(
        "cursor-pointer hover:shadow-md transition-all duration-200 border-l-4",
        task.status === 'todo' && "border-l-slate-400",
        task.status === 'in-progress' && "border-l-blue-400",
        task.status === 'review' && "border-l-amber-400", 
        task.status === 'done' && "border-l-green-400",
        isOverdue && "bg-red-50 border-l-red-400"
      )}
      onClick={() => onClick?.(task)}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-medium text-sm line-clamp-2 flex-1">
              {task.title}
            </h4>
            <div className="flex gap-1 flex-shrink-0">
              <Badge 
                variant="outline" 
                className={cn("text-xs", getPriorityColor(task.priority))}
              >
                {task.priority}
              </Badge>
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Metadata */}
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            {task.dueDate && (
              <div className={cn(
                "flex items-center gap-1",
                isOverdue && "text-red-600 font-medium"
              )}>
                <Calendar className="h-3 w-3" />
                {format(new Date(task.dueDate), 'MMM dd')}
              </div>
            )}
            
            {task.assigneeName && (
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {task.assigneeName}
              </div>
            )}

            {task.timeSpentMinutes && task.timeSpentMinutes > 0 && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {Math.round(task.timeSpentMinutes / 60)}h
              </div>
            )}
          </div>

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {task.tags.slice(0, 2).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs px-1 py-0">
                  {tag}
                </Badge>
              ))}
              {task.tags.length > 2 && (
                <Badge variant="secondary" className="text-xs px-1 py-0">
                  +{task.tags.length - 2}
                </Badge>
              )}
            </div>
          )}

          {/* Subtasks Progress */}
          {showSubtasks && taskSubtasks.length > 0 && (
            <div className="space-y-2">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsSubtasksExpanded(!isSubtasksExpanded);
                }}
              >
                <div className="flex items-center gap-1 text-xs">
                  {isSubtasksExpanded ? (
                    <ChevronDown className="h-3 w-3" />
                  ) : (
                    <ChevronRight className="h-3 w-3" />
                  )}
                  <span>{completedSubtasks.length}/{taskSubtasks.length} subtasks</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {subtaskProgress}%
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-gray-200 rounded-full h-1">
                <div 
                  className="bg-blue-500 h-1 rounded-full transition-all"
                  style={{ width: `${subtaskProgress}%` }}
                />
              </div>

              {/* Expanded subtasks */}
              {isSubtasksExpanded && (
                <div className="space-y-1 mt-2">
                  {taskSubtasks.map(subtask => (
                    <div 
                      key={subtask.id}
                      className="flex items-center gap-2 text-xs"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => handleSubtaskToggle(subtask.id, !subtask.completed)}
                        className="flex-shrink-0"
                      >
                        {subtask.completed ? (
                          <CheckCircle2 className="h-3 w-3 text-green-600" />
                        ) : (
                          <Circle className="h-3 w-3 text-gray-400" />
                        )}
                      </button>
                      <span className={cn(
                        "flex-1",
                        subtask.completed && "line-through text-muted-foreground"
                      )}>
                        {subtask.title}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Status indicator */}
          {isOverdue && task.status !== 'done' && (
            <div className="flex items-center gap-1 text-xs text-red-600">
              <AlertCircle className="h-3 w-3" />
              Overdue
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
