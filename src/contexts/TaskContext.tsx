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
  deleteClientTasks: (clientId: string) => void;
  getTasksByMonth: (year: number, month: number) => Task[];
  getTasksByProject: (projectId: string) => Task[];
  getTasksByClient: (clientId: string) => Task[];
  getActivityLogs: () => Array<{date: Date, action: string, details: string}>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};

interface ActivityLog {
  id: string;
  date: Date;
  action: string;
  details: string;
}

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

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const savedLogs = localStorage.getItem('activityLogs');
    if (savedLogs) {
      try {
        const parsedLogs = JSON.parse(savedLogs);
        return parsedLogs.map((log: any) => ({
          ...log,
          date: new Date(log.date)
        }));
      } catch (e) {
        console.error('Failed to parse saved activity logs', e);
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

  useEffect(() => {
    localStorage.setItem('activityLogs', JSON.stringify(activityLogs));
  }, [activityLogs]);

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
    logActivity('Task Added', `Task "${newTask.title}" was created${newTask.assigneeName ? ` and assigned to ${newTask.assigneeName}` : ''}`);
    
    return newTaskId;
  };

  const updateTask = (id: string, taskData: Partial<Task>) => {
    let updatedTaskTitle = '';
    
    setTasks((prevTasks) => 
      prevTasks.map((task) => {
        if (task.id === id) {
          const updatedTask = { ...task, ...taskData };
          updatedTaskTitle = updatedTask.title;
          
          if (task.status !== 'done' && updatedTask.status === 'done' && updatedTask.recurrence !== 'none') {
            setTimeout(() => createRecurringTaskInstance(updatedTask), 0);
          }
          
          return updatedTask;
        }
        return task;
      })
    );
    
    toast.success("Task updated successfully");
    logActivity('Task Updated', `Task "${updatedTaskTitle}" was updated`);
  };

  const deleteTask = (id: string) => {
    const taskToDelete = tasks.find(task => task.id === id);
    
    setSubtasks(prev => prev.filter(st => st.taskId !== id));
    
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
    
    if (taskToDelete) {
      toast.success("Task deleted successfully");
      logActivity('Task Deleted', `Task "${taskToDelete.title}" was deleted`);
    }
  };

  const moveTask = (taskId: string, newStatus: TaskStatus) => {
    let movedTaskTitle = '';
    
    setTasks((prevTasks) => 
      prevTasks.map((task) => {
        if (task.id === taskId) {
          const updatedTask = { ...task, status: newStatus };
          movedTaskTitle = task.title;
          
          if (task.status !== 'done' && newStatus === 'done' && task.recurrence !== 'none') {
            setTimeout(() => createRecurringTaskInstance(updatedTask), 0);
          }
          
          return updatedTask;
        }
        return task;
      })
    );
    
    if (movedTaskTitle) {
      logActivity('Task Status Changed', `Task "${movedTaskTitle}" was moved to ${newStatus}`);
    }
  };

  const addProject = (projectData: Omit<Project, 'id' | 'createdAt'>) => {
    const newProject: Project = {
      ...projectData,
      id: uuidv4(),
      createdAt: new Date(),
    };
    
    setProjects((prevProjects) => [...prevProjects, newProject]);
    toast.success(`Project "${newProject.name}" was created successfully`);
    logActivity('Project Created', `Project "${newProject.name}" was created`);
  };

  const updateProject = (id: string, projectData: Partial<Project>) => {
    let updatedProjectName = '';
    
    setProjects((prevProjects) => 
      prevProjects.map((project) => {
        if (project.id === id) {
          updatedProjectName = projectData.name || project.name;
          return { ...project, ...projectData };
        }
        return project;
      })
    );
    
    if (projectData.name) {
      setTasks((prevTasks) => 
        prevTasks.map((task) => 
          task.projectId === id ? { ...task, projectName: projectData.name } : task
        )
      );
    }
    
    toast.success("Project updated successfully");
    if (updatedProjectName) {
      logActivity('Project Updated', `Project "${updatedProjectName}" was updated`);
    }
  };

  const deleteProject = (id: string) => {
    const projectToDelete = projects.find(project => project.id === id);
    
    setProjects((prevProjects) => prevProjects.filter((project) => project.id !== id));
    
    setTasks((prevTasks) => 
      prevTasks.map((task) => 
        task.projectId === id ? { ...task, projectId: undefined, projectName: undefined } : task
      )
    );
    
    if (projectToDelete) {
      toast.success("Project deleted successfully");
      logActivity('Project Deleted', `Project "${projectToDelete.name}" was deleted`);
    }
  };

  const deleteClientTasks = (clientId: string) => {
    const clientTasks = tasks.filter(task => task.clientId === clientId);
    
    if (clientTasks.length > 0) {
      clientTasks.forEach(task => {
        setSubtasks(prev => prev.filter(st => st.taskId !== task.id));
      });
      
      setTasks(prevTasks => prevTasks.filter(task => task.clientId !== clientId));
      
      toast.success(`Deleted ${clientTasks.length} tasks associated with this client`);
      logActivity('Client Tasks Deleted', `${clientTasks.length} tasks were deleted for a removed client`);
    }
  };

  const addSubtask = (subtaskData: Omit<SubTask, 'id'>) => {
    const newSubtask: SubTask = {
      ...subtaskData,
      id: uuidv4(),
    };
    
    setSubtasks((prev) => [...prev, newSubtask]);
    logActivity('Subtask Added', `Subtask "${newSubtask.title}" was added to a task`);
    return newSubtask.id;
  };

  const updateSubtask = (id: string, subtaskData: Partial<SubTask>) => {
    let updatedSubtaskTitle = '';
    
    setSubtasks((prev) => 
      prev.map((subtask) => {
        if (subtask.id === id) {
          updatedSubtaskTitle = subtask.title;
          return { ...subtask, ...subtaskData };
        }
        return subtask;
      })
    );
    
    if (updatedSubtaskTitle && subtaskData.completed !== undefined) {
      logActivity('Subtask Updated', `Subtask "${updatedSubtaskTitle}" was marked as ${subtaskData.completed ? 'completed' : 'incomplete'}`);
    }
  };

  const deleteSubtask = (id: string) => {
    const subtaskToDelete = subtasks.find(st => st.id === id);
    
    setSubtasks((prev) => prev.filter((subtask) => subtask.id !== id));
    
    if (subtaskToDelete) {
      logActivity('Subtask Deleted', `Subtask "${subtaskToDelete.title}" was deleted`);
    }
  };

  const getTaskProgress = (taskId: string): number => {
    const taskSubtasks = subtasks.filter(st => st.taskId === taskId);
    
    if (taskSubtasks.length === 0) {
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

  const addTaskTemplate = (templateData: Omit<TaskTemplate, 'id'>) => {
    const newTemplate: TaskTemplate = {
      ...templateData,
      id: uuidv4(),
    };
    
    setTemplates((prev) => [...prev, newTemplate]);
    toast.success(`Template "${newTemplate.name}" was created successfully`);
    logActivity('Template Created', `Task template "${newTemplate.name}" was created`);
    return newTemplate.id;
  };

  const updateTaskTemplate = (id: string, templateData: Partial<TaskTemplate>) => {
    let updatedTemplateName = '';
    
    setTemplates((prev) => 
      prev.map((template) => {
        if (template.id === id) {
          updatedTemplateName = templateData.name || template.name;
          return { ...template, ...templateData };
        }
        return template;
      })
    );
    
    toast.success("Template updated successfully");
    if (updatedTemplateName) {
      logActivity('Template Updated', `Task template "${updatedTemplateName}" was updated`);
    }
  };

  const deleteTaskTemplate = (id: string) => {
    const templateToDelete = templates.find(t => t.id === id);
    
    setTemplates((prev) => prev.filter((template) => template.id !== id));
    
    if (templateToDelete) {
      toast.success("Template deleted successfully");
      logActivity('Template Deleted', `Task template "${templateToDelete.name}" was deleted`);
    }
  };

  const addBulkTasks = (tasksToAdd: Omit<Task, 'id' | 'createdAt'>[]) => {
    const newTasks = tasksToAdd.map(taskData => ({
      ...taskData,
      id: uuidv4(),
      createdAt: new Date(),
    }));
    
    setTasks((prev) => [...prev, ...newTasks]);
    toast.success(`${newTasks.length} tasks were created successfully`);
    logActivity('Bulk Tasks Created', `${newTasks.length} tasks were created in bulk`);
  };

  const createTaskFromTemplate = (templateId: string, baseTask: Omit<Task, 'id' | 'createdAt'>): string => {
    const template = templates.find(t => t.id === templateId);
    if (!template) {
      toast.error("Template not found");
      return "";
    }
    
    const taskId = addTask(baseTask);
    
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

  const getTasksByMonth = (year: number, month: number) => {
    return tasks.filter(task => {
      const taskDate = task.dueDate ? new Date(task.dueDate) : null;
      return taskDate && taskDate.getFullYear() === year && taskDate.getMonth() === month;
    });
  };
  
  const getTasksByProject = (projectId: string) => {
    return tasks.filter(task => task.projectId === projectId);
  };
  
  const getTasksByClient = (clientId: string) => {
    return tasks.filter(task => task.clientId === clientId);
  };
  
  const getActivityLogs = () => {
    return activityLogs.map(log => ({
      date: log.date,
      action: log.action,
      details: log.details
    }));
  };

  const logActivity = (action: string, details: string) => {
    const newLog: ActivityLog = {
      id: uuidv4(),
      date: new Date(),
      action,
      details
    };
    setActivityLogs(prev => [newLog, ...prev].slice(0, 200));
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
      createTaskFromTemplate,
      deleteClientTasks,
      getTasksByMonth,
      getTasksByProject,
      getTasksByClient,
      getActivityLogs
    }}>
      {children}
    </TaskContext.Provider>
  );
};
