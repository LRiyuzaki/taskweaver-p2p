
import { Task } from './task';

export interface Client {
  id: string;
  name: string;
  email: string;
  company: string;
  contactPerson?: string;
  phone?: string;
  createdAt: Date;
  
  // Tax information
  gstRequired: boolean;
  incomeTaxRequired: boolean;
  tdsRequired: boolean;
  auditRequired: boolean;
  
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
  requiresGST?: boolean;
  requiresIncomeTax?: boolean;
  requiresTDS?: boolean;
  requiresAudit?: boolean;
}

export interface ClientService {
  clientId: string;
  serviceTypeId: string;
  startDate: Date;
  endDate?: Date;
  status: 'active' | 'inactive' | 'completed';
}
