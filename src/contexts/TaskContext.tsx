
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Task, TaskStatus, TaskPriority, RecurrenceType, Project, TaskTemplate, SubTask } from '@/types/task';
import { localStorageManager } from '@/utils/localStorage';
import { v4 as uuidv4 } from 'uuid';

interface TaskContextType {
  tasks: Task[];
  projects: Project[];
  templates: TaskTemplate[];
  subtasks: SubTask[];
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => Promise<string>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  deleteTasks: (ids: string[]) => Promise<void>;
  getTaskById: (id: string) => Task | undefined;
  getTasksByStatus: (status: TaskStatus) => Task[];
  getTasksByClient: (clientId: string) => Task[];
  createTask: (taskData: Partial<Task>) => Promise<string>;
  bulkUpdateTasks: (updates: Array<{ id: string; updates: Partial<Task> }>) => Promise<void>;
  addBulkTasks: (tasks: Array<Omit<Task, 'id' | 'createdAt'>>) => Promise<string[]>;
  moveTask: (taskId: string, newStatus: TaskStatus) => Promise<void>;
  getTaskProgress: (taskId: string) => number;
  addProject: (project: Omit<Project, 'id' | 'createdAt'>) => Promise<string>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  addTaskTemplate: (template: Omit<TaskTemplate, 'id'>) => Promise<string>;
  updateTaskTemplate: (id: string, updates: Partial<TaskTemplate>) => Promise<void>;
  deleteTaskTemplate: (id: string) => Promise<void>;
  addSubtask: (subtask: Omit<SubTask, 'id'>) => Promise<string>;
  updateSubtask: (id: string, updates: Partial<SubTask>) => Promise<void>;
  deleteSubtask: (id: string) => Promise<void>;
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
  const [projects, setProjects] = useState<Project[]>([]);
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [subtasks, setSubtasks] = useState<SubTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data from localStorage on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const loadedTasks = localStorageManager.getTasks();
        const loadedProjects = localStorageManager.getProjects();
        const loadedTemplates = localStorageManager.getTaskTemplates();
        const loadedSubtasks = localStorageManager.getSubtasks();
        
        setTasks(loadedTasks);
        setProjects(loadedProjects);
        setTemplates(loadedTemplates);
        setSubtasks(loadedSubtasks);
        
        // Validate data integrity
        const { isValid, errors } = localStorageManager.validateDataIntegrity();
        if (!isValid) {
          console.warn('Data integrity issues found:', errors);
          const repaired = localStorageManager.repairData();
          if (repaired) {
            const repairedTasks = localStorageManager.getTasks();
            setTasks(repairedTasks);
          }
        }
      } catch (err) {
        setError('Failed to load data');
        console.error('Failed to load data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Save data to localStorage whenever data changes
  useEffect(() => {
    if (!isLoading) {
      localStorageManager.saveTasks(tasks);
      localStorageManager.saveProjects(projects);
      localStorageManager.saveTaskTemplates(templates);
      localStorageManager.saveSubtasks(subtasks);
    }
  }, [tasks, projects, templates, subtasks, isLoading]);

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
      setSubtasks(prev => prev.filter(subtask => subtask.taskId !== id));
    } catch (err) {
      setError('Failed to delete task');
      throw err;
    }
  };

  const deleteTasks = async (ids: string[]): Promise<void> => {
    try {
      setTasks(prev => prev.filter(task => !ids.includes(task.id)));
      setSubtasks(prev => prev.filter(subtask => !ids.includes(subtask.taskId)));
    } catch (err) {
      setError('Failed to delete tasks');
      throw err;
    }
  };

  const addBulkTasks = async (tasksData: Array<Omit<Task, 'id' | 'createdAt'>>): Promise<string[]> => {
    try {
      const newTasks: Task[] = tasksData.map(taskData => ({
        ...taskData,
        id: uuidv4(),
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: taskData.tags || [],
        recurrence: taskData.recurrence || 'none',
        status: taskData.status || 'todo',
        priority: taskData.priority || 'medium'
      }));

      setTasks(prev => [...prev, ...newTasks]);
      return newTasks.map(task => task.id);
    } catch (err) {
      setError('Failed to add bulk tasks');
      throw err;
    }
  };

  const moveTask = async (taskId: string, newStatus: TaskStatus): Promise<void> => {
    try {
      setTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { ...task, status: newStatus, updatedAt: new Date() }
          : task
      ));
    } catch (err) {
      setError('Failed to move task');
      throw err;
    }
  };

  const getTaskProgress = (taskId: string): number => {
    const taskSubtasks = subtasks.filter(s => s.taskId === taskId);
    if (taskSubtasks.length === 0) return 0;
    
    const completedSubtasks = taskSubtasks.filter(s => s.completed);
    return Math.round((completedSubtasks.length / taskSubtasks.length) * 100);
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
      subtasks: taskData.subtasks || [],
      updatedAt: new Date() // Add required updatedAt
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

  // Project methods
  const addProject = async (projectData: Omit<Project, 'id' | 'createdAt'>): Promise<string> => {
    try {
      const newProject: Project = {
        ...projectData,
        id: uuidv4(),
        createdAt: new Date()
      };

      setProjects(prev => [...prev, newProject]);
      return newProject.id;
    } catch (err) {
      setError('Failed to add project');
      throw err;
    }
  };

  const updateProject = async (id: string, updates: Partial<Project>): Promise<void> => {
    try {
      setProjects(prev => prev.map(project => 
        project.id === id 
          ? { ...project, ...updates }
          : project
      ));
    } catch (err) {
      setError('Failed to update project');
      throw err;
    }
  };

  const deleteProject = async (id: string): Promise<void> => {
    try {
      setProjects(prev => prev.filter(project => project.id !== id));
      // Update tasks to remove project reference
      setTasks(prev => prev.map(task => 
        task.projectId === id 
          ? { ...task, projectId: undefined, projectName: undefined }
          : task
      ));
    } catch (err) {
      setError('Failed to delete project');
      throw err;
    }
  };

  // Template methods
  const addTaskTemplate = async (templateData: Omit<TaskTemplate, 'id'>): Promise<string> => {
    try {
      const newTemplate: TaskTemplate = {
        ...templateData,
        id: uuidv4()
      };

      setTemplates(prev => [...prev, newTemplate]);
      return newTemplate.id;
    } catch (err) {
      setError('Failed to add template');
      throw err;
    }
  };

  const updateTaskTemplate = async (id: string, updates: Partial<TaskTemplate>): Promise<void> => {
    try {
      setTemplates(prev => prev.map(template => 
        template.id === id 
          ? { ...template, ...updates }
          : template
      ));
    } catch (err) {
      setError('Failed to update template');
      throw err;
    }
  };

  const deleteTaskTemplate = async (id: string): Promise<void> => {
    try {
      setTemplates(prev => prev.filter(template => template.id !== id));
    } catch (err) {
      setError('Failed to delete template');
      throw err;
    }
  };

  // Subtask methods
  const addSubtask = async (subtaskData: Omit<SubTask, 'id'>): Promise<string> => {
    try {
      const newSubtask: SubTask = {
        ...subtaskData,
        id: uuidv4()
      };

      setSubtasks(prev => [...prev, newSubtask]);
      return newSubtask.id;
    } catch (err) {
      setError('Failed to add subtask');
      throw err;
    }
  };

  const updateSubtask = async (id: string, updates: Partial<SubTask>): Promise<void> => {
    try {
      setSubtasks(prev => prev.map(subtask => 
        subtask.id === id 
          ? { ...subtask, ...updates }
          : subtask
      ));
    } catch (err) {
      setError('Failed to update subtask');
      throw err;
    }
  };

  const deleteSubtask = async (id: string): Promise<void> => {
    try {
      setSubtasks(prev => prev.filter(subtask => subtask.id !== id));
    } catch (err) {
      setError('Failed to delete subtask');
      throw err;
    }
  };

  const value: TaskContextType = {
    tasks,
    projects,
    templates,
    subtasks,
    addTask,
    updateTask,
    deleteTask,
    deleteTasks,
    getTaskById,
    getTasksByStatus,
    getTasksByClient,
    createTask,
    bulkUpdateTasks,
    addBulkTasks,
    moveTask,
    getTaskProgress,
    addProject,
    updateProject,
    deleteProject,
    addTaskTemplate,
    updateTaskTemplate,
    deleteTaskTemplate,
    addSubtask,
    updateSubtask,
    deleteSubtask,
    isLoading,
    error
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};
