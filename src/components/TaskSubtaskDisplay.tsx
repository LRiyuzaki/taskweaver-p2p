
import React from 'react';
import { Task } from '@/types/task';
import { SubTask } from '@/types/client';
import { useTaskContext } from '@/contexts/TaskContext';
import { Checkbox } from '@/components/ui/checkbox';
import { ProgressBar } from '@/components/ui/progress-bar';
import { cn } from '@/lib/utils';

interface TaskSubtaskDisplayProps {
  task: Task;
  showAll?: boolean;
}

export const TaskSubtaskDisplay: React.FC<TaskSubtaskDisplayProps> = ({ task, showAll = false }) => {
  const { subtasks, updateSubtask, getTaskProgress } = useTaskContext();
  
  // Get subtasks for this task and sort them by order
  const taskSubtasks = subtasks
    .filter(st => st.taskId === task.id)
    .sort((a, b) => a.order - b.order);
  
  const progress = getTaskProgress(task.id);
  
  // If there are no subtasks, don't render anything
  if (taskSubtasks.length === 0) return null;
  
  const handleSubtaskToggle = (subtask: SubTask, isCompleted: boolean) => {
    updateSubtask(subtask.id, { completed: isCompleted });
  };
  
  return (
    <div className="mt-3 space-y-2">
      <div className="flex justify-between items-center text-xs text-muted-foreground">
        <span>Progress: {progress}%</span>
      </div>
      
      <ProgressBar 
        value={progress} 
        className="h-1.5"
        variant={progress === 100 ? "success" : "default"}
      />
      
      {/* Always show subtasks to fix visibility issue */}
      <div className="mt-2 pl-1 space-y-1 border-l-2 border-l-muted/50">
        {taskSubtasks.map((subtask) => (
          <div key={subtask.id} className="flex items-center gap-2">
            <Checkbox
              id={`subtask-${subtask.id}`} 
              checked={subtask.completed}
              onCheckedChange={(checked) => handleSubtaskToggle(subtask, checked === true)}
              className={subtask.completed ? "text-green-500" : ""}
            />
            <label 
              htmlFor={`subtask-${subtask.id}`}
              className={cn(
                "text-sm cursor-pointer flex-1",
                subtask.completed && "line-through text-muted-foreground"
              )}
            >
              {subtask.title}
            </label>
          </div>
        ))}
      </div>
      
      {!showAll && taskSubtasks.length > 3 && (
        <div className="text-xs text-muted-foreground mt-1">
          {taskSubtasks.filter(st => st.completed).length} of {taskSubtasks.length} subtasks completed
        </div>
      )}
    </div>
  );
};
