
import React, { createContext, useState, useContext, useEffect } from 'react';
import { Task, TaskStatus, TaskPriority, Project, RecurrenceType } from '@/types/task';
import { SubTask, TaskTemplate } from '@/types/client';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/hooks/use-toast-extensions';
import { addDays, addWeeks, addMonths, addQuarters, addYears } from 'date-fns';

interface TaskContextType {
  tasks: Task[];
  projects: Project[];
  templates: TaskTemplate[];
  subtasks: SubTask[];
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => string;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveTask: (taskId: string, newStatus: TaskStatus) => void;
  addProject: (project: Omit<Project, 'id' | 'createdAt'>) => void;
  updateProject: (id: string, project: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  addSubtask: (subtask: Omit<SubTask, 'id'>) => void;
  updateSubtask: (id: string, subtask: Partial<SubTask>) => void;
  deleteSubtask: (id: string) => void;
  getTaskProgress: (taskId: string) => number;
  addTaskTemplate: (template: Omit<TaskTemplate, 'id'>) => void;
  updateTaskTemplate: (id: string, template: Partial<TaskTemplate>) => void;
  deleteTaskTemplate: (id: string) => void;
  addBulkTasks: (tasks: Omit<Task, 'id' | 'createdAt'>[]) => void;
  createTaskFromTemplate: (templateId: string, baseTask: Omit<Task, 'id' | 'createdAt'>) => string;
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

  const [subtasks, setSubtasks] = useState<SubTask[]>(() => {
    const savedSubtasks = localStorage.getItem('subtasks');
    if (savedSubtasks) {
      try {
        return JSON.parse(savedSubtasks);
      } catch (e) {
        console.error('Failed to parse saved subtasks', e);
        return [];
      }
    }
    return [];
  });

  const [templates, setTemplates] = useState<TaskTemplate[]>(() => {
    const savedTemplates = localStorage.getItem('taskTemplates');
    if (savedTemplates) {
      try {
        return JSON.parse(savedTemplates);
      } catch (e) {
        console.error('Failed to parse saved task templates', e);
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

  useEffect(() => {
    localStorage.setItem('subtasks', JSON.stringify(subtasks));
  }, [subtasks]);

  useEffect(() => {
    localStorage.setItem('taskTemplates', JSON.stringify(templates));
  }, [templates]);

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
      
      const newTaskId = newTask.id;
      setTasks((prevTasks) => [...prevTasks, newTask]);
      
      // Duplicate subtasks for recurring task
      const taskSubtasks = subtasks.filter(st => st.taskId === completedTask.id);
      if (taskSubtasks.length > 0) {
        const newSubtasks = taskSubtasks.map(st => ({
          ...st,
          id: uuidv4(),
          taskId: newTaskId,
          completed: false
        }));
        
        setSubtasks(prev => [...prev, ...newSubtasks]);
      }
      
      toast.success(`Recurring task "${newTask.title}" has been scheduled for ${nextDueDate.toLocaleDateString()}`);
    }
  };

  const addTask = (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    const newTaskId = uuidv4();
    const newTask: Task = {
      ...taskData,
      id: newTaskId,
      createdAt: new Date(),
    };
    
    setTasks((prevTasks) => [...prevTasks, newTask]);
    toast.success(`"${newTask.title}" was added successfully${newTask.assigneeName ? ` and assigned to ${newTask.assigneeName}` : ''}`);
    
    return newTaskId;
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
    // Delete all subtasks for this task
    setSubtasks(prev => prev.filter(st => st.taskId !== id));
    
    // Delete the task itself
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

  // New functions for subtasks
  const addSubtask = (subtaskData: Omit<SubTask, 'id'>) => {
    const newSubtask: SubTask = {
      ...subtaskData,
      id: uuidv4(),
    };
    
    setSubtasks((prev) => [...prev, newSubtask]);
    return newSubtask.id;
  };

  const updateSubtask = (id: string, subtaskData: Partial<SubTask>) => {
    setSubtasks((prev) => 
      prev.map((subtask) => 
        subtask.id === id ? { ...subtask, ...subtaskData } : subtask
      )
    );
  };

  const deleteSubtask = (id: string) => {
    setSubtasks((prev) => prev.filter((subtask) => subtask.id !== id));
  };

  // Calculate progress percentage for a task based on its subtasks
  const getTaskProgress = (taskId: string): number => {
    const taskSubtasks = subtasks.filter(st => st.taskId === taskId);
    
    if (taskSubtasks.length === 0) {
      // If no subtasks, use the task status
      const task = tasks.find(t => t.id === taskId);
      if (!task) return 0;
      
      switch (task.status) {
        case 'todo': return 0;
        case 'inProgress': return 50;
        case 'done': return 100;
        default: return 0;
      }
    }
    
    const completedCount = taskSubtasks.filter(st => st.completed).length;
    return Math.round((completedCount / taskSubtasks.length) * 100);
  };

  // Task template functions
  const addTaskTemplate = (templateData: Omit<TaskTemplate, 'id'>) => {
    const newTemplate: TaskTemplate = {
      ...templateData,
      id: uuidv4(),
    };
    
    setTemplates((prev) => [...prev, newTemplate]);
    toast.success(`Template "${newTemplate.name}" was created successfully`);
    return newTemplate.id;
  };

  const updateTaskTemplate = (id: string, templateData: Partial<TaskTemplate>) => {
    setTemplates((prev) => 
      prev.map((template) => 
        template.id === id ? { ...template, ...templateData } : template
      )
    );
    toast.success("Template updated successfully");
  };

  const deleteTaskTemplate = (id: string) => {
    setTemplates((prev) => prev.filter((template) => template.id !== id));
    toast.success("Template deleted successfully");
  };

  // Bulk task creation
  const addBulkTasks = (tasksToAdd: Omit<Task, 'id' | 'createdAt'>[]) => {
    const newTasks = tasksToAdd.map(taskData => ({
      ...taskData,
      id: uuidv4(),
      createdAt: new Date(),
    }));
    
    setTasks((prev) => [...prev, ...newTasks]);
    toast.success(`${newTasks.length} tasks were created successfully`);
  };

  // Create task from template
  const createTaskFromTemplate = (templateId: string, baseTask: Omit<Task, 'id' | 'createdAt'>): string => {
    const template = templates.find(t => t.id === templateId);
    if (!template) {
      toast.error("Template not found");
      return "";
    }
    
    // Create the main task
    const taskId = addTask(baseTask);
    
    // Create subtasks from template
    if (template.subtasks && template.subtasks.length > 0) {
      const newSubtasks = template.subtasks.map((st, index) => ({
        id: uuidv4(),
        taskId: taskId,
        title: st.title,
        description: st.description || "",
        completed: false,
        order: index,
        assignedTo: st.assignedTo,
        assigneeName: st.assigneeName
      }));
      
      setSubtasks(prev => [...prev, ...newSubtasks]);
    }
    
    return taskId;
  };

  return (
    <TaskContext.Provider value={{ 
      tasks, 
      projects, 
      subtasks,
      templates,
      addTask, 
      updateTask, 
      deleteTask, 
      moveTask,
      addProject,
      updateProject,
      deleteProject,
      addSubtask,
      updateSubtask,
      deleteSubtask,
      getTaskProgress,
      addTaskTemplate,
      updateTaskTemplate,
      deleteTaskTemplate,
      addBulkTasks,
      createTaskFromTemplate
    }}>
      {children}
    </TaskContext.Provider>
  );
};
