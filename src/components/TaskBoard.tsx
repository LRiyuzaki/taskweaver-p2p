
import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { TaskCard } from './TaskCard';
import { Task, TaskStatus } from '@/types/task';
import { useTaskContext } from '@/contexts/TaskContext';
import { cn } from '@/lib/utils';

const COLUMNS: { id: TaskStatus; title: string; color: string }[] = [
  { id: 'todo', title: 'To Do', color: 'bg-gray-100' },
  { id: 'in-progress', title: 'In Progress', color: 'bg-blue-100' },
  { id: 'review', title: 'Review', color: 'bg-yellow-100' },
  { id: 'done', title: 'Done', color: 'bg-green-100' },
];

export const TaskBoard: React.FC = () => {
  const { tasks, updateTask } = useTaskContext();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    
    if (!destination) {
      return;
    }
    
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }
    
    const task = tasks.find(t => t.id === draggableId);
    if (task) {
      const newStatus = destination.droppableId as TaskStatus;
      
      // Update task with new status and appropriate timestamps
      const updates: Partial<Task> = {
        status: newStatus,
        updatedAt: new Date()
      };
      
      // Set appropriate timestamps based on status
      if (newStatus === 'in-progress' && task.status === 'todo') {
        updates.startedAt = new Date();
      } else if (newStatus === 'done') {
        updates.completedAt = new Date();
        updates.completedDate = new Date(); // For backward compatibility
      }
      
      updateTask(task.id, updates);
    }
  };
  
  const getTasksByStatus = (status: TaskStatus): Task[] => {
    return tasks.filter(task => task.status === status);
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    // This is handled by drag and drop context
  };
  
  return (
    <div className="h-full p-6">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 h-full">
          {COLUMNS.map(column => (
            <div key={column.id} className="flex flex-col">
              <div className={cn(
                "rounded-t-lg p-3 border-b",
                column.color
              )}>
                <h3 className="font-medium text-gray-900">
                  {column.title}
                  <span className="ml-2 text-sm text-gray-500">
                    ({getTasksByStatus(column.id).length})
                  </span>
                </h3>
              </div>
              
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={cn(
                      "flex-1 p-3 border border-t-0 rounded-b-lg min-h-[200px]",
                      snapshot.isDraggingOver && "bg-blue-50"
                    )}
                  >
                    <div className="space-y-3">
                      {getTasksByStatus(column.id).map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={cn(
                                "group",
                                snapshot.isDragging && "opacity-50"
                              )}
                            >
                              <TaskCard 
                                task={task} 
                                onClick={() => handleTaskClick(task)}
                                showSubtasks={true}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                    </div>
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};
