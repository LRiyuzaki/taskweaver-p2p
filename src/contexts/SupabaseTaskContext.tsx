
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Task, TaskStatus, TaskPriority } from '@/types/task';
import { taskService } from '@/services/supabaseService';
import { toast } from '@/hooks/use-toast';

interface SupabaseTaskContextType {
  tasks: Task[];
  loading: boolean;
  createTask: (task: Omit<Task, 'id' | 'createdAt'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  deleteTasks: (ids: string[]) => Promise<void>;
  getTaskProgress: (taskId: string) => number;
  refreshTasks: () => Promise<void>;
}

const SupabaseTaskContext = createContext<SupabaseTaskContextType | undefined>(undefined);

export const useSupabaseTaskContext = () => {
  const context = useContext(SupabaseTaskContext);
  if (!context) {
    throw new Error('useSupabaseTaskContext must be used within a SupabaseTaskProvider');
  }
  return context;
};

export const SupabaseTaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshTasks = async () => {
    try {
      setLoading(true);
      const data = await taskService.getAll();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: "Error",
        description: "Failed to fetch tasks",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshTasks();
  }, []);

  const createTask = async (task: Omit<Task, 'id' | 'createdAt'>) => {
    try {
      await taskService.create(task);
      await refreshTasks();
      toast({
        title: "Success",
        description: "Task created successfully"
      });
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      await taskService.update(id, updates);
      await refreshTasks();
      toast({
        title: "Success",
        description: "Task updated successfully"
      });
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await taskService.delete(id);
      await refreshTasks();
      toast({
        title: "Success",
        description: "Task deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteTasks = async (ids: string[]) => {
    try {
      await taskService.deleteMultiple(ids);
      await refreshTasks();
      toast({
        title: "Success",
        description: `${ids.length} task(s) deleted successfully`
      });
    } catch (error) {
      console.error('Error deleting tasks:', error);
      toast({
        title: "Error",
        description: "Failed to delete tasks",
        variant: "destructive"
      });
      throw error;
    }
  };

  const getTaskProgress = (taskId: string): number => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !task.subtasks || task.subtasks.length === 0) {
      return task?.status === 'done' ? 100 : 0;
    }
    
    const completedSubtasks = task.subtasks.filter(subtask => subtask.completed).length;
    return Math.round((completedSubtasks / task.subtasks.length) * 100);
  };

  return (
    <SupabaseTaskContext.Provider value={{
      tasks,
      loading,
      createTask,
      updateTask,
      deleteTask,
      deleteTasks,
      getTaskProgress,
      refreshTasks
    }}>
      {children}
    </SupabaseTaskContext.Provider>
  );
};
