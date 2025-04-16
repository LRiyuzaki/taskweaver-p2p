
import React from 'react';
import { Task, TaskSubtask } from '@/types/task';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { useTaskContext } from '@/contexts/TaskContext';

interface TaskSubtaskDisplayProps {
  task: Task;
  showCheckboxes?: boolean;
}

export const TaskSubtaskDisplay: React.FC<TaskSubtaskDisplayProps> = ({ 
  task,
  showCheckboxes = true
}) => {
  const { updateTask } = useTaskContext();

  if (!task.subtasks || task.subtasks.length === 0) {
    return null;
  }

  const handleSubtaskToggle = (subtaskId: string, checked: boolean) => {
    if (!task.subtasks) return;
    
    const updatedSubtasks = task.subtasks.map(subtask => 
      subtask.id === subtaskId 
        ? { ...subtask, completed: checked }
        : subtask
    );
    
    updateTask(task.id, { subtasks: updatedSubtasks });
    
    // Check if all subtasks are now completed
    const allCompleted = updatedSubtasks.every(subtask => subtask.completed);
    if (allCompleted && task.status !== 'done') {
      // Optionally auto-complete the parent task when all subtasks are done
      // updateTask(task.id, { status: 'done' });
    }
  };

  return (
    <div className="space-y-1.5">
      {task.subtasks.sort((a, b) => a.orderPosition - b.orderPosition).map(subtask => (
        <div 
          key={subtask.id} 
          className={cn(
            "flex items-start text-xs py-0.5 px-1 rounded",
            subtask.completed && "bg-muted/50"
          )}
        >
          {showCheckboxes && (
            <Checkbox
              checked={subtask.completed}
              onCheckedChange={(checked) => handleSubtaskToggle(subtask.id, checked === true)}
              className="mr-1.5 mt-0.5 h-3 w-3"
            />
          )}
          <div>
            <span className={cn(subtask.completed && "line-through text-muted-foreground")}>
              {subtask.title}
            </span>
            {subtask.description && (
              <p className="text-xs text-muted-foreground mt-0.5">{subtask.description}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
