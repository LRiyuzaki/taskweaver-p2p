
import { Task, Project, TaskTemplate, SubTask } from '@/types/task';
import { Client, ServiceType, ClientService, ServiceRenewal } from '@/types/client';

export interface LocalStorageData {
  tasks: Task[];
  clients: Client[];
  projects: Project[];
  serviceTypes: ServiceType[];
  clientServices: ClientService[];
  serviceRenewals: ServiceRenewal[];
  taskTemplates: TaskTemplate[];
  subtasks: SubTask[];
}

export interface DataIntegrityResult {
  isValid: boolean;
  errors: string[];
}

class LocalStorageManager {
  private readonly STORAGE_KEYS = {
    TASKS: 'accounting_app_tasks',
    CLIENTS: 'accounting_app_clients',
    PROJECTS: 'accounting_app_projects',
    SERVICE_TYPES: 'accounting_app_service_types',
    CLIENT_SERVICES: 'accounting_app_client_services',
    SERVICE_RENEWALS: 'accounting_app_service_renewals',
    TASK_TEMPLATES: 'accounting_app_task_templates',
    SUBTASKS: 'accounting_app_subtasks',
    DATA_VERSION: 'accounting_app_data_version'
  };

  private readonly CURRENT_VERSION = '1.0.0';

  // Generic storage methods
  private setItem<T>(key: string, data: T): void {
    try {
      const serialized = JSON.stringify(data);
      localStorage.setItem(key, serialized);
    } catch (error) {
      console.error(`Failed to save data to localStorage (${key}):`, error);
      throw new Error(`Failed to save data: ${error}`);
    }
  }

  private getItem<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return defaultValue;
      }
      return JSON.parse(item);
    } catch (error) {
      console.error(`Failed to load data from localStorage (${key}):`, error);
      return defaultValue;
    }
  }

  // Task methods
  saveTasks(tasks: Task[]): void {
    this.setItem(this.STORAGE_KEYS.TASKS, tasks);
  }

  getTasks(): Task[] {
    return this.getItem<Task[]>(this.STORAGE_KEYS.TASKS, []);
  }

  // Client methods
  saveClients(clients: Client[]): void {
    this.setItem(this.STORAGE_KEYS.CLIENTS, clients);
  }

  getClients(): Client[] {
    return this.getItem<Client[]>(this.STORAGE_KEYS.CLIENTS, []);
  }

  // Project methods
  saveProjects(projects: Project[]): void {
    this.setItem(this.STORAGE_KEYS.PROJECTS, projects);
  }

  getProjects(): Project[] {
    return this.getItem<Project[]>(this.STORAGE_KEYS.PROJECTS, []);
  }

  // Service Type methods
  saveServiceTypes(serviceTypes: ServiceType[]): void {
    this.setItem(this.STORAGE_KEYS.SERVICE_TYPES, serviceTypes);
  }

  getServiceTypes(): ServiceType[] {
    return this.getItem<ServiceType[]>(this.STORAGE_KEYS.SERVICE_TYPES, []);
  }

  // Client Service methods
  saveClientServices(clientServices: ClientService[]): void {
    this.setItem(this.STORAGE_KEYS.CLIENT_SERVICES, clientServices);
  }

  getClientServices(): ClientService[] {
    return this.getItem<ClientService[]>(this.STORAGE_KEYS.CLIENT_SERVICES, []);
  }

  // Service Renewal methods
  saveServiceRenewals(serviceRenewals: ServiceRenewal[]): void {
    this.setItem(this.STORAGE_KEYS.SERVICE_RENEWALS, serviceRenewals);
  }

  getServiceRenewals(): ServiceRenewal[] {
    return this.getItem<ServiceRenewal[]>(this.STORAGE_KEYS.SERVICE_RENEWALS, []);
  }

  // Task Template methods
  saveTaskTemplates(templates: TaskTemplate[]): void {
    this.setItem(this.STORAGE_KEYS.TASK_TEMPLATES, templates);
  }

  getTaskTemplates(): TaskTemplate[] {
    return this.getItem<TaskTemplate[]>(this.STORAGE_KEYS.TASK_TEMPLATES, []);
  }

  // Subtask methods
  saveSubtasks(subtasks: SubTask[]): void {
    this.setItem(this.STORAGE_KEYS.SUBTASKS, subtasks);
  }

  getSubtasks(): SubTask[] {
    return this.getItem<SubTask[]>(this.STORAGE_KEYS.SUBTASKS, []);
  }

  // Data validation and integrity methods
  validateDataIntegrity(): DataIntegrityResult {
    const errors: string[] = [];
    
    try {
      // Check if data exists and is valid
      const tasks = this.getTasks();
      const clients = this.getClients();
      const projects = this.getProjects();
      const subtasks = this.getSubtasks();

      // Validate task references
      tasks.forEach(task => {
        if (task.clientId && !clients.find(c => c.id === task.clientId)) {
          errors.push(`Task "${task.title}" references non-existent client`);
        }
        if (task.projectId && !projects.find(p => p.id === task.projectId)) {
          errors.push(`Task "${task.title}" references non-existent project`);
        }
      });

      // Validate subtask references
      subtasks.forEach(subtask => {
        if (!tasks.find(t => t.id === subtask.taskId)) {
          errors.push(`Subtask "${subtask.title}" references non-existent task`);
        }
      });

      // Check for duplicate IDs
      const taskIds = tasks.map(t => t.id);
      const uniqueTaskIds = new Set(taskIds);
      if (taskIds.length !== uniqueTaskIds.size) {
        errors.push('Duplicate task IDs found');
      }

      const clientIds = clients.map(c => c.id);
      const uniqueClientIds = new Set(clientIds);
      if (clientIds.length !== uniqueClientIds.size) {
        errors.push('Duplicate client IDs found');
      }

    } catch (error) {
      errors.push(`Data validation error: ${error}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  repairData(): boolean {
    try {
      const tasks = this.getTasks();
      const clients = this.getClients();
      const projects = this.getProjects();
      const subtasks = this.getSubtasks();

      // Remove invalid references
      const validTasks = tasks.filter(task => {
        if (task.clientId && !clients.find(c => c.id === task.clientId)) {
          task.clientId = undefined;
          task.clientName = undefined;
        }
        if (task.projectId && !projects.find(p => p.id === task.projectId)) {
          task.projectId = undefined;
          task.projectName = undefined;
        }
        return true;
      });

      const validSubtasks = subtasks.filter(subtask => {
        return tasks.find(t => t.id === subtask.taskId);
      });

      // Remove duplicates
      const uniqueTasks = Array.from(new Map(validTasks.map(task => [task.id, task])).values());
      const uniqueClients = Array.from(new Map(clients.map(client => [client.id, client])).values());
      const uniqueProjects = Array.from(new Map(projects.map(project => [project.id, project])).values());
      const uniqueSubtasks = Array.from(new Map(validSubtasks.map(subtask => [subtask.id, subtask])).values());

      // Save repaired data
      this.saveTasks(uniqueTasks);
      this.saveClients(uniqueClients);
      this.saveProjects(uniqueProjects);
      this.saveSubtasks(uniqueSubtasks);

      return true;
    } catch (error) {
      console.error('Failed to repair data:', error);
      return false;
    }
  }

  // Backup and restore methods
  exportData(): LocalStorageData {
    return {
      tasks: this.getTasks(),
      clients: this.getClients(),
      projects: this.getProjects(),
      serviceTypes: this.getServiceTypes(),
      clientServices: this.getClientServices(),
      serviceRenewals: this.getServiceRenewals(),
      taskTemplates: this.getTaskTemplates(),
      subtasks: this.getSubtasks()
    };
  }

  importData(data: Partial<LocalStorageData>): void {
    try {
      if (data.tasks) this.saveTasks(data.tasks);
      if (data.clients) this.saveClients(data.clients);
      if (data.projects) this.saveProjects(data.projects);
      if (data.serviceTypes) this.saveServiceTypes(data.serviceTypes);
      if (data.clientServices) this.saveClientServices(data.clientServices);
      if (data.serviceRenewals) this.saveServiceRenewals(data.serviceRenewals);
      if (data.taskTemplates) this.saveTaskTemplates(data.taskTemplates);
      if (data.subtasks) this.saveSubtasks(data.subtasks);

      // Update data version
      this.setItem(this.STORAGE_KEYS.DATA_VERSION, this.CURRENT_VERSION);
    } catch (error) {
      console.error('Failed to import data:', error);
      throw new Error(`Failed to import data: ${error}`);
    }
  }

  // Clear all data
  clearAllData(): void {
    Object.values(this.STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }

  // Storage size management
  getStorageSize(): number {
    let total = 0;
    Object.values(this.STORAGE_KEYS).forEach(key => {
      const item = localStorage.getItem(key);
      if (item) {
        total += item.length;
      }
    });
    return total;
  }

  getStorageSizeFormatted(): string {
    const bytes = this.getStorageSize();
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export const localStorageManager = new LocalStorageManager();
