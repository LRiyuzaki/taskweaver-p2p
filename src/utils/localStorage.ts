
import { Client, ServiceType, ClientService, ServiceRenewal } from '@/types/client';
import { Task, Project, TaskTemplate, SubTask } from '@/types/task';

interface LocalStorageData {
  clients: Client[];
  serviceTypes: ServiceType[];
  clientServices: ClientService[];
  serviceRenewals: ServiceRenewal[];
  tasks: Task[];
  projects: Project[];
  taskTemplates: TaskTemplate[];
  subtasks: SubTask[];
}

class LocalStorageManager {
  getClients(): Client[] {
    try {
      const stored = localStorage.getItem('clients');
      if (!stored) return [];
      
      const clients = JSON.parse(stored);
      return Array.isArray(clients) ? clients.map((client: any) => ({
        ...client,
        createdAt: new Date(client.createdAt),
        startDate: client.startDate ? new Date(client.startDate) : undefined,
        incorporationDate: client.incorporationDate ? new Date(client.incorporationDate) : undefined,
        gstRegistrationDate: client.gstRegistrationDate ? new Date(client.gstRegistrationDate) : undefined
      })) : [];
    } catch (error) {
      console.error('Error loading clients:', error);
      return [];
    }
  }

  saveClients(clients: Client[]): void {
    try {
      localStorage.setItem('clients', JSON.stringify(clients));
    } catch (error) {
      console.error('Error saving clients:', error);
    }
  }

  getTasks(): Task[] {
    try {
      const stored = localStorage.getItem('tasks');
      if (!stored) return [];
      
      const tasks = JSON.parse(stored);
      return Array.isArray(tasks) ? tasks.map((task: any) => ({
        ...task,
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt),
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        startedAt: task.startedAt ? new Date(task.startedAt) : undefined,
        completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
        recurrenceEndDate: task.recurrenceEndDate ? new Date(task.recurrenceEndDate) : undefined
      })) : [];
    } catch (error) {
      console.error('Error loading tasks:', error);
      return [];
    }
  }

  saveTasks(tasks: Task[]): void {
    try {
      localStorage.setItem('tasks', JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving tasks:', error);
    }
  }

  getProjects(): Project[] {
    try {
      const stored = localStorage.getItem('projects');
      if (!stored) return [];
      
      const projects = JSON.parse(stored);
      return Array.isArray(projects) ? projects.map((project: any) => ({
        ...project,
        createdAt: new Date(project.createdAt),
        startDate: project.startDate ? new Date(project.startDate) : undefined,
        endDate: project.endDate ? new Date(project.endDate) : undefined
      })) : [];
    } catch (error) {
      console.error('Error loading projects:', error);
      return [];
    }
  }

  saveProjects(projects: Project[]): void {
    try {
      localStorage.setItem('projects', JSON.stringify(projects));
    } catch (error) {
      console.error('Error saving projects:', error);
    }
  }

  getTaskTemplates(): TaskTemplate[] {
    try {
      const stored = localStorage.getItem('taskTemplates');
      if (!stored) return [];
      return JSON.parse(stored);
    } catch (error) {
      console.error('Error loading task templates:', error);
      return [];
    }
  }

  saveTaskTemplates(templates: TaskTemplate[]): void {
    try {
      localStorage.setItem('taskTemplates', JSON.stringify(templates));
    } catch (error) {
      console.error('Error saving task templates:', error);
    }
  }

  getSubtasks(): SubTask[] {
    try {
      const stored = localStorage.getItem('subtasks');
      if (!stored) return [];
      return JSON.parse(stored);
    } catch (error) {
      console.error('Error loading subtasks:', error);
      return [];
    }
  }

  saveSubtasks(subtasks: SubTask[]): void {
    try {
      localStorage.setItem('subtasks', JSON.stringify(subtasks));
    } catch (error) {
      console.error('Error saving subtasks:', error);
    }
  }

  getServiceTypes(): ServiceType[] {
    try {
      const stored = localStorage.getItem('serviceTypes');
      if (!stored) return [];
      return JSON.parse(stored);
    } catch (error) {
      console.error('Error loading service types:', error);
      return [];
    }
  }

  saveServiceTypes(serviceTypes: ServiceType[]): void {
    try {
      localStorage.setItem('serviceTypes', JSON.stringify(serviceTypes));
    } catch (error) {
      console.error('Error saving service types:', error);
    }
  }

  getClientServices(): ClientService[] {
    try {
      const stored = localStorage.getItem('clientServices');
      if (!stored) return [];
      
      const services = JSON.parse(stored);
      return Array.isArray(services) ? services.map((service: any) => ({
        ...service,
        startDate: new Date(service.startDate),
        endDate: service.endDate ? new Date(service.endDate) : undefined,
        renewalDate: service.renewalDate ? new Date(service.renewalDate) : undefined,
        nextRenewalDate: service.nextRenewalDate ? new Date(service.nextRenewalDate) : undefined
      })) : [];
    } catch (error) {
      console.error('Error loading client services:', error);
      return [];
    }
  }

  saveClientServices(clientServices: ClientService[]): void {
    try {
      localStorage.setItem('clientServices', JSON.stringify(clientServices));
    } catch (error) {
      console.error('Error saving client services:', error);
    }
  }

  getClientRenewals(): ServiceRenewal[] {
    try {
      const stored = localStorage.getItem('serviceRenewals');
      if (!stored) return [];
      
      const renewals = JSON.parse(stored);
      return Array.isArray(renewals) ? renewals.map((renewal: any) => ({
        ...renewal,
        renewalDate: new Date(renewal.renewalDate),
        dueDate: renewal.dueDate ? new Date(renewal.dueDate) : undefined,
        reminderDate: renewal.reminderDate ? new Date(renewal.reminderDate) : undefined
      })) : [];
    } catch (error) {
      console.error('Error loading service renewals:', error);
      return [];
    }
  }

  saveServiceRenewals(renewals: ServiceRenewal[]): void {
    try {
      localStorage.setItem('serviceRenewals', JSON.stringify(renewals));
    } catch (error) {
      console.error('Error saving service renewals:', error);
    }
  }

  validateDataIntegrity(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    let isValid = true;

    try {
      const clients = this.getClients();
      if (!Array.isArray(clients)) {
        isValid = false;
        errors.push('Clients data is not an array.');
      }

      const serviceTypes = this.getServiceTypes();
      if (!Array.isArray(serviceTypes)) {
        isValid = false;
        errors.push('Service types data is not an array.');
      }

      const clientServices = this.getClientServices();
      if (!Array.isArray(clientServices)) {
        isValid = false;
        errors.push('Client services data is not an array.');
      }
    } catch (error) {
      isValid = false;
      errors.push(`Error during validation: ${(error as Error).message}`);
    }

    return { isValid, errors };
  }

  repairData(): boolean {
    try {
      const clients = this.getClients();
      if (!Array.isArray(clients)) {
        localStorage.setItem('clients', JSON.stringify([]));
        return true;
      }

      const serviceTypes = this.getServiceTypes();
      if (!Array.isArray(serviceTypes)) {
        localStorage.setItem('serviceTypes', JSON.stringify([]));
        return true;
      }

      const clientServices = this.getClientServices();
      if (!Array.isArray(clientServices)) {
        localStorage.setItem('clientServices', JSON.stringify([]));
        return true;
      }

      return true;
    } catch (error) {
      console.error('Repair failed:', error);
      return false;
    }
  }
}

export const localStorageManager = new LocalStorageManager();
