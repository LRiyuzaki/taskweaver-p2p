
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
