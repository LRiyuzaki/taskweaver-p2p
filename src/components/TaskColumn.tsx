
import React from 'react';
import { Task, TaskStatus } from '@/types/task';
import { TaskCard } from '@/components/TaskCard'; // Fixed import statement
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface TaskColumnProps {
  title: string;
  status: TaskStatus;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onDrop: (e: React.DragEvent, status: TaskStatus) => void;
}

export const TaskColumn: React.FC<TaskColumnProps> = ({ 
  title, 
  status, 
  tasks, 
  onTaskClick,
  onDrop
}) => {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    onDrop(e, status);
  };

  return (
    <div 
      className="task-column" 
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-sm uppercase tracking-wide">{title}</h3>
        <Badge variant="secondary">{tasks.length}</Badge>
      </div>
      
      <div className="space-y-3">
        {tasks.map((task) => (
          <div 
            key={task.id}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('taskId', task.id);
            }}
          >
            <TaskCard 
              task={task} 
              onClick={() => onTaskClick(task)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
