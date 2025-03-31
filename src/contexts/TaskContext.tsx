
import React, { createContext, useState, useContext, useEffect } from 'react';
import { Task, TaskStatus, TaskPriority } from '@/types/task';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/components/ui/sonner';

interface TaskContextType {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveTask: (taskId: string, newStatus: TaskStatus) => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    // Load tasks from localStorage if available
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      try {
        const parsedTasks = JSON.parse(savedTasks);
        // Convert string dates back to Date objects
        return parsedTasks.map((task: any) => ({
          ...task,
          createdAt: new Date(task.createdAt),
          dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        }));
      } catch (e) {
        console.error('Failed to parse saved tasks', e);
        return [];
      }
    }
    return [];
  });

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: uuidv4(),
      createdAt: new Date(),
    };
    
    setTasks((prevTasks) => [...prevTasks, newTask]);
    toast.success('Task created successfully');
  };

  const updateTask = (id: string, taskData: Partial<Task>) => {
    setTasks((prevTasks) => 
      prevTasks.map((task) => 
        task.id === id ? { ...task, ...taskData } : task
      )
    );
    toast.success('Task updated successfully');
  };

  const deleteTask = (id: string) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
    toast.success('Task deleted successfully');
  };

  const moveTask = (taskId: string, newStatus: TaskStatus) => {
    setTasks((prevTasks) => 
      prevTasks.map((task) => 
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
  };

  return (
    <TaskContext.Provider value={{ tasks, addTask, updateTask, deleteTask, moveTask }}>
      {children}
    </TaskContext.Provider>
  );
};
