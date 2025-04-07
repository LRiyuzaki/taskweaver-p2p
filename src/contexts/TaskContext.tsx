import React, { createContext, useState, useContext, useEffect } from 'react';
import { Task, TaskStatus, TaskPriority, Project, RecurrenceType } from '@/types/task';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/hooks/use-toast-extensions';
import { addDays, addWeeks, addMonths, addQuarters, addYears } from 'date-fns';

interface TaskContextType {
  tasks: Task[];
  projects: Project[];
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveTask: (taskId: string, newStatus: TaskStatus) => void;
  addProject: (project: Omit<Project, 'id' | 'createdAt'>) => void;
  updateProject: (id: string, project: Partial<Project>) => void;
  deleteProject: (id: string) => void;
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
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      try {
        const parsedTasks = JSON.parse(savedTasks);
        return parsedTasks.map((task: any) => ({
          ...task,
          createdAt: new Date(task.createdAt),
          dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
          recurrenceEndDate: task.recurrenceEndDate ? new Date(task.recurrenceEndDate) : undefined,
          recurrence: task.recurrence || 'none',
        }));
      } catch (e) {
        console.error('Failed to parse saved tasks', e);
        return [];
      }
    }
    return [];
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    const savedProjects = localStorage.getItem('projects');
    if (savedProjects) {
      try {
        const parsedProjects = JSON.parse(savedProjects);
        return parsedProjects.map((project: any) => ({
          ...project,
          createdAt: new Date(project.createdAt),
        }));
      } catch (e) {
        console.error('Failed to parse saved projects', e);
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('projects', JSON.stringify(projects));
  }, [projects]);

  const calculateNextDueDate = (dueDate: Date, recurrenceType: RecurrenceType): Date => {
    switch (recurrenceType) {
      case 'daily':
        return addDays(dueDate, 1);
      case 'weekly':
        return addWeeks(dueDate, 1);
      case 'monthly':
        return addMonths(dueDate, 1);
      case 'quarterly':
        return addQuarters(dueDate, 1);
      case 'halfYearly':
        return addMonths(dueDate, 6);
      case 'yearly':
        return addYears(dueDate, 1);
      default:
        return dueDate;
    }
  };

  const createRecurringTaskInstance = (completedTask: Task) => {
    if (
      completedTask.recurrence !== 'none' && 
      completedTask.dueDate && 
      (!completedTask.recurrenceEndDate || new Date() < completedTask.recurrenceEndDate)
    ) {
      const nextDueDate = calculateNextDueDate(completedTask.dueDate, completedTask.recurrence);
      
      if (completedTask.recurrenceEndDate && nextDueDate > completedTask.recurrenceEndDate) {
        return;
      }
      
      const newTask: Task = {
        ...completedTask,
        id: uuidv4(),
        status: 'todo',
        dueDate: nextDueDate,
        createdAt: new Date(),
      };
      
      setTasks((prevTasks) => [...prevTasks, newTask]);
      toast.success(`Recurring task "${newTask.title}" has been scheduled for ${nextDueDate.toLocaleDateString()}`);
    }
  };

  const addTask = (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: uuidv4(),
      createdAt: new Date(),
    };
    
    setTasks((prevTasks) => [...prevTasks, newTask]);
    toast.success(`"${newTask.title}" was added successfully${newTask.assigneeName ? ` and assigned to ${newTask.assigneeName}` : ''}`);
  };

  const updateTask = (id: string, taskData: Partial<Task>) => {
    setTasks((prevTasks) => 
      prevTasks.map((task) => {
        if (task.id === id) {
          const updatedTask = { ...task, ...taskData };
          
          if (task.status !== 'done' && updatedTask.status === 'done' && updatedTask.recurrence !== 'none') {
            setTimeout(() => createRecurringTaskInstance(updatedTask), 0);
          }
          
          return updatedTask;
        }
        return task;
      })
    );
    toast.success("Task updated successfully");
  };

  const deleteTask = (id: string) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
    toast.success("Task deleted successfully");
  };

  const moveTask = (taskId: string, newStatus: TaskStatus) => {
    setTasks((prevTasks) => 
      prevTasks.map((task) => {
        if (task.id === taskId) {
          const updatedTask = { ...task, status: newStatus };
          
          if (task.status !== 'done' && newStatus === 'done' && task.recurrence !== 'none') {
            setTimeout(() => createRecurringTaskInstance(updatedTask), 0);
          }
          
          return updatedTask;
        }
        return task;
      })
    );
  };

  const addProject = (projectData: Omit<Project, 'id' | 'createdAt'>) => {
    const newProject: Project = {
      ...projectData,
      id: uuidv4(),
      createdAt: new Date(),
    };
    
    setProjects((prevProjects) => [...prevProjects, newProject]);
    toast.success(`Project "${newProject.name}" was created successfully`);
  };

  const updateProject = (id: string, projectData: Partial<Project>) => {
    setProjects((prevProjects) => 
      prevProjects.map((project) => 
        project.id === id ? { ...project, ...projectData } : project
      )
    );
    
    if (projectData.name) {
      setTasks((prevTasks) => 
        prevTasks.map((task) => 
          task.projectId === id ? { ...task, projectName: projectData.name } : task
        )
      );
    }
    
    toast.success("Project updated successfully");
  };

  const deleteProject = (id: string) => {
    setProjects((prevProjects) => prevProjects.filter((project) => project.id !== id));
    
    setTasks((prevTasks) => 
      prevTasks.map((task) => 
        task.projectId === id ? { ...task, projectId: undefined, projectName: undefined } : task
      )
    );
    
    toast.success("Project deleted successfully");
  };

  return (
    <TaskContext.Provider value={{ 
      tasks, 
      projects, 
      addTask, 
      updateTask, 
      deleteTask, 
      moveTask,
      addProject,
      updateProject,
      deleteProject
    }}>
      {children}
    </TaskContext.Provider>
  );
};
