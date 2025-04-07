
import { Task } from './task';

export interface Client {
  id: string;
  name: string;
  email: string;
  company: string;
  contactPerson?: string;
  phone?: string;
  createdAt: Date;
  
  // Service requirements will be stored here
  requiredServices: Record<string, boolean>;
  
  // Entity information
  entityType?: 'Individual' | 'Company' | 'LLP' | 'Partnership' | 'Trust';
  gstin?: string;
  pan?: string;
  
  // Additional fields
  startDate?: Date;
  address?: string;
  tasks?: Task[];
}

export interface ClientFormData extends Omit<Client, 'id' | 'createdAt' | 'tasks'> {}

export interface ServiceType {
  id: string;
  name: string;
  description: string;
  frequency: 'one-time' | 'monthly' | 'quarterly' | 'annually';
  renewalPeriod?: number; // Period in months
  taskTemplate?: SubTask[]; // Default subtasks for this service type
}

export interface ClientService {
  clientId: string;
  serviceTypeId: string;
  serviceTypeName?: string;
  startDate: Date;
  endDate?: Date;
  nextRenewalDate?: Date;
  status: 'active' | 'inactive' | 'completed';
  reminderDays?: number; // Days before due date to start reminder
  reminderType?: 'days' | 'months' | 'specificDate';
  reminderDate?: Date; // Specific date for reminder when using 'specificDate' type
}

export interface ServiceRenewal {
  id: string;
  clientId: string;
  serviceId: string;
  dueDate: Date;
  completedDate?: Date;
  status: 'pending' | 'completed' | 'overdue';
  notes?: string;
}

export interface SubTask {
  id: string;
  taskId: string;
  title: string;
  description?: string;
  completed: boolean;
  order: number;
  assignedTo?: string;
  assigneeName?: string;
}

export interface TaskTemplate {
  id: string;
  name: string;
  description?: string;
  subtasks: SubTask[];
}
