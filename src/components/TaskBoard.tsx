
import React, { useState } from 'react';
import { Task, TaskStatus } from '@/types/task';
import { TaskColumn } from './TaskColumn';
import { TaskForm } from './TaskForm';
import { useTaskContext } from '@/contexts/TaskContext';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export const TaskBoard: React.FC = () => {
  const { tasks, addTask, updateTask, moveTask } = useTaskContext();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const todoTasks = tasks.filter((task) => task.status === 'todo');
  const inProgressTasks = tasks.filter((task) => task.status === 'inProgress');
  const doneTasks = tasks.filter((task) => task.status === 'done');

  const handleTaskClick = (task: Task) => {
    setEditingTask(task);
    setIsDialogOpen(true);
  };

  const handleAddTask = () => {
    setEditingTask(null);
    setIsDialogOpen(true);
  };

  const handleDrop = (e: React.DragEvent, newStatus: TaskStatus) => {
    const taskId = e.dataTransfer.getData('taskId');
    moveTask(taskId, newStatus);
  };

  const handleFormSubmit = (formData: Omit<Task, 'id' | 'createdAt'>) => {
    if (editingTask) {
      updateTask(editingTask.id, formData);
    } else {
      addTask(formData);
    }
    setIsDialogOpen(false);
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Task Board</h1>
        <Button onClick={handleAddTask}>
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <TaskColumn
          title="To Do"
          status="todo"
          tasks={todoTasks}
          onTaskClick={handleTaskClick}
          onDrop={handleDrop}
        />
        <TaskColumn
          title="In Progress"
          status="inProgress"
          tasks={inProgressTasks}
          onTaskClick={handleTaskClick}
          onDrop={handleDrop}
        />
        <TaskColumn
          title="Done"
          status="done"
          tasks={doneTasks}
          onTaskClick={handleTaskClick}
          onDrop={handleDrop}
        />
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingTask ? 'Edit Task' : 'Create Task'}</DialogTitle>
            <DialogDescription>
              {editingTask 
                ? 'Make changes to your task here.'
                : 'Add a new task to your board.'}
            </DialogDescription>
          </DialogHeader>
          <TaskForm 
            task={editingTask || undefined} 
            onSubmit={handleFormSubmit} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
