import { Task } from '@/types/task';
import { Client } from '@/types/client';
import { ServiceType } from '@/types/client';

// Storage keys
const STORAGE_KEYS = {
  TASKS: 'accountmaster_tasks',
  CLIENTS: 'accountmaster_clients',
  SERVICE_TYPES: 'accountmaster_service_types',
  LAST_SYNC: 'accountmaster_last_sync',
  USER_PREFERENCES: 'accountmaster_user_preferences'
} as const;

// Data validation helpers
const isValidTask = (task: any): task is Task => {
  return task && 
    typeof task === 'object' && 
    typeof task.id === 'string' && 
    typeof task.title === 'string' &&
    ['todo', 'inProgress', 'review', 'done'].includes(task.status) &&
    ['low', 'medium', 'high'].includes(task.priority);
};

const isValidClient = (client: any): client is Client => {
  return client && 
    typeof client === 'object' && 
    typeof client.id === 'string' && 
    typeof client.name === 'string' &&
    typeof client.email === 'string';
};

// Safe JSON operations
const safeJsonParse = <T>(data: string, fallback: T): T => {
  try {
    const parsed = JSON.parse(data);
    return parsed ?? fallback;
  } catch (error) {
    console.warn('Failed to parse localStorage data:', error);
    return fallback;
  }
};

const safeJsonStringify = (data: any): string | null => {
  try {
    return JSON.stringify(data);
  } catch (error) {
    console.error('Failed to stringify data for localStorage:', error);
    return null;
  }
};

// Core storage operations
export const localStorageManager = {
  // Tasks
  getTasks: (): Task[] => {
    const data = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (!data) return [];
    
    const tasks = safeJsonParse<Task[]>(data, []);
    return tasks.filter(isValidTask).map(task => ({
      ...task,
      createdAt: new Date(task.createdAt),
      updatedAt: task.updatedAt ? new Date(task.updatedAt) : undefined,
      dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
      completedDate: task.completedDate ? new Date(task.completedDate) : undefined,
      startedAt: task.startedAt ? new Date(task.startedAt) : undefined,
      recurrenceEndDate: task.recurrenceEndDate ? new Date(task.recurrenceEndDate) : undefined
    }));
  },

  saveTasks: (tasks: Task[]): boolean => {
    const data = safeJsonStringify(tasks);
    if (!data) return false;
    
    try {
      localStorage.setItem(STORAGE_KEYS.TASKS, data);
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
      return true;
    } catch (error) {
      console.error('Failed to save tasks to localStorage:', error);
      return false;
    }
  },

  // Clients
  getClients: (): Client[] => {
    const data = localStorage.getItem(STORAGE_KEYS.CLIENTS);
    if (!data) return [];
    
    const clients = safeJsonParse<Client[]>(data, []);
    return clients.filter(isValidClient).map(client => ({
      ...client,
      createdAt: new Date(client.createdAt),
      startDate: client.startDate ? new Date(client.startDate) : undefined,
      gstRegistrationDate: client.gstRegistrationDate ? new Date(client.gstRegistrationDate) : undefined,
      incorporationDate: client.incorporationDate ? new Date(client.incorporationDate) : undefined
    }));
  },

  saveClients: (clients: Client[]): boolean => {
    const data = safeJsonStringify(clients);
    if (!data) return false;
    
    try {
      localStorage.setItem(STORAGE_KEYS.CLIENTS, data);
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
      return true;
    } catch (error) {
      console.error('Failed to save clients to localStorage:', error);
      return false;
    }
  },

  // Service Types
  getServiceTypes: (): ServiceType[] => {
    const data = localStorage.getItem(STORAGE_KEYS.SERVICE_TYPES);
    if (!data) return [];
    
    return safeJsonParse<ServiceType[]>(data, []);
  },

  saveServiceTypes: (serviceTypes: ServiceType[]): boolean => {
    const data = safeJsonStringify(serviceTypes);
    if (!data) return false;
    
    try {
      localStorage.setItem(STORAGE_KEYS.SERVICE_TYPES, data);
      return true;
    } catch (error) {
      console.error('Failed to save service types to localStorage:', error);
      return false;
    }
  },

  // User Preferences
  getUserPreferences: () => {
    const data = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
    return safeJsonParse(data, {
      theme: 'system',
      defaultView: 'board',
      showCompletedTasks: true,
      taskSortBy: 'dueDate',
      clientSortBy: 'name'
    });
  },

  saveUserPreferences: (preferences: any): boolean => {
    const data = safeJsonStringify(preferences);
    if (!data) return false;
    
    try {
      localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, data);
      return true;
    } catch (error) {
      console.error('Failed to save user preferences:', error);
      return false;
    }
  },

  // Data integrity checks
  validateDataIntegrity: (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    try {
      const tasks = localStorageManager.getTasks();
      const clients = localStorageManager.getClients();
      
      // Check for orphaned tasks (tasks with clientId that doesn't exist)
      const clientIds = new Set(clients.map(c => c.id));
      const orphanedTasks = tasks.filter(t => t.clientId && !clientIds.has(t.clientId));
      
      if (orphanedTasks.length > 0) {
        errors.push(`Found ${orphanedTasks.length} tasks with invalid client references`);
      }
      
      // Check for duplicate IDs
      const taskIds = tasks.map(t => t.id);
      const duplicateTaskIds = taskIds.filter((id, index) => taskIds.indexOf(id) !== index);
      
      if (duplicateTaskIds.length > 0) {
        errors.push(`Found duplicate task IDs: ${duplicateTaskIds.join(', ')}`);
      }
      
      const clientIdList = clients.map(c => c.id);
      const duplicateClientIds = clientIdList.filter((id, index) => clientIdList.indexOf(id) !== index);
      
      if (duplicateClientIds.length > 0) {
        errors.push(`Found duplicate client IDs: ${duplicateClientIds.join(', ')}`);
      }
      
    } catch (error) {
      errors.push(`Data validation failed: ${error}`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Cleanup and repair
  repairData: (): boolean => {
    try {
      const tasks = localStorageManager.getTasks();
      const clients = localStorageManager.getClients();
      
      // Remove orphaned tasks
      const clientIds = new Set(clients.map(c => c.id));
      const validTasks = tasks.filter(t => !t.clientId || clientIds.has(t.clientId));
      
      // Remove duplicate tasks (keep the latest)
      const taskMap = new Map<string, Task>();
      validTasks.forEach(task => {
        const existing = taskMap.get(task.id);
        if (!existing || new Date(task.updatedAt || task.createdAt) > new Date(existing.updatedAt || existing.createdAt)) {
          taskMap.set(task.id, task);
        }
      });
      
      // Remove duplicate clients (keep the latest)
      const clientMap = new Map<string, Client>();
      clients.forEach(client => {
        const existing = clientMap.get(client.id);
        if (!existing || new Date(client.createdAt) > new Date(existing.createdAt)) {
          clientMap.set(client.id, client);
        }
      });
      
      // Save repaired data
      const repairedTasks = Array.from(taskMap.values());
      const repairedClients = Array.from(clientMap.values());
      
      localStorageManager.saveTasks(repairedTasks);
      localStorageManager.saveClients(repairedClients);
      
      return true;
    } catch (error) {
      console.error('Failed to repair data:', error);
      return false;
    }
  },

  // Clear all data
  clearAll: (): void => {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }
};
