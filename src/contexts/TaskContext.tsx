
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Task, TaskStatus, TaskPriority, RecurrenceType } from '@/types/task';
import { localStorageManager } from '@/utils/localStorage';
import { v4 as uuidv4 } from 'uuid';

interface TaskContextType {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => Promise<string>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  getTaskById: (id: string) => Task | undefined;
  getTasksByStatus: (status: TaskStatus) => Task[];
  getTasksByClient: (clientId: string) => Task[];
  createTask: (taskData: Partial<Task>) => Promise<string>;
  bulkUpdateTasks: (updates: Array<{ id: string; updates: Partial<Task> }>) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};

interface TaskProviderProps {
  children: ReactNode;
}

export const TaskProvider: React.FC<TaskProviderProps> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load tasks from localStorage on mount
  useEffect(() => {
    const loadTasks = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const loadedTasks = localStorageManager.getTasks();
        setTasks(loadedTasks);
        
        // Validate data integrity
        const { isValid, errors } = localStorageManager.validateDataIntegrity();
        if (!isValid) {
          console.warn('Data integrity issues found:', errors);
          // Attempt to repair data
          const repaired = localStorageManager.repairData();
          if (repaired) {
            const repairedTasks = localStorageManager.getTasks();
            setTasks(repairedTasks);
          }
        }
      } catch (err) {
        setError('Failed to load tasks');
        console.error('Failed to load tasks:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadTasks();
  }, []);

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    if (!isLoading) {
      localStorageManager.saveTasks(tasks);
    }
  }, [tasks, isLoading]);

  const addTask = async (taskData: Omit<Task, 'id' | 'createdAt'>): Promise<string> => {
    try {
      const newTask: Task = {
        ...taskData,
        id: uuidv4(),
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: taskData.tags || [],
        recurrence: taskData.recurrence || 'none',
        status: taskData.status || 'todo',
        priority: taskData.priority || 'medium'
      };

      setTasks(prev => [...prev, newTask]);
      return newTask.id;
    } catch (err) {
      setError('Failed to add task');
      throw err;
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>): Promise<void> => {
    try {
      setTasks(prev => prev.map(task => 
        task.id === id 
          ? { ...task, ...updates, updatedAt: new Date() }
          : task
      ));
    } catch (err) {
      setError('Failed to update task');
      throw err;
    }
  };

  const deleteTask = async (id: string): Promise<void> => {
    try {
      setTasks(prev => prev.filter(task => task.id !== id));
    } catch (err) {
      setError('Failed to delete task');
      throw err;
    }
  };

  const createTask = async (taskData: Partial<Task>): Promise<string> => {
    return addTask({
      title: taskData.title || 'New Task',
      description: taskData.description || '',
      status: taskData.status || 'todo',
      priority: taskData.priority || 'medium',
      dueDate: taskData.dueDate,
      assignedTo: taskData.assignedTo,
      assigneeName: taskData.assigneeName,
      clientId: taskData.clientId,
      clientName: taskData.clientName,
      projectId: taskData.projectId,
      projectName: taskData.projectName,
      serviceId: taskData.serviceId,
      serviceName: taskData.serviceName,
      requiresReview: taskData.requiresReview || false,
      reviewerId: taskData.reviewerId,
      reviewerName: taskData.reviewerName,
      reviewStatus: taskData.reviewStatus,
      comments: taskData.comments || '',
      tags: taskData.tags || [],
      recurrence: taskData.recurrence || 'none',
      recurrenceEndDate: taskData.recurrenceEndDate,
      subtasks: taskData.subtasks || []
    });
  };

  const bulkUpdateTasks = async (updates: Array<{ id: string; updates: Partial<Task> }>): Promise<void> => {
    try {
      setTasks(prev => {
        const updatesMap = new Map(updates.map(u => [u.id, u.updates]));
        return prev.map(task => {
          const taskUpdates = updatesMap.get(task.id);
          return taskUpdates 
            ? { ...task, ...taskUpdates, updatedAt: new Date() }
            : task;
        });
      });
    } catch (err) {
      setError('Failed to bulk update tasks');
      throw err;
    }
  };

  const getTaskById = (id: string): Task | undefined => {
    return tasks.find(task => task.id === id);
  };

  const getTasksByStatus = (status: TaskStatus): Task[] => {
    return tasks.filter(task => task.status === status);
  };

  const getTasksByClient = (clientId: string): Task[] => {
    return tasks.filter(task => task.clientId === clientId);
  };

  const value: TaskContextType = {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    getTaskById,
    getTasksByStatus,
    getTasksByClient,
    createTask,
    bulkUpdateTasks,
    isLoading,
    error
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};
