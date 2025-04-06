import { Task } from './task';

export interface Client {
  id: string;
  name: string;
  email: string;
  company: string;
  contactPerson?: string;
  phone?: string;
  createdAt: Date;
  
  // Tax information - Dynamic service requirements will be stored here
  requiredServices: Record<string, boolean>;
  
  // Entity information
  entityType?: 'Individual' | 'Company' | 'LLP' | 'Partnership' | 'Trust';
  gstin?: string;
  pan?: string;
  
  // Additional fields
  startDate?: Date;
  address?: string;
  tasks?: Task[];
  
  // Keep backward compatibility for existing code
  get gstRequired(): boolean {
    return this.requiredServices['GST'] ?? false;
  }
  
  get incomeTaxRequired(): boolean {
    return this.requiredServices['Income Tax'] ?? false;
  }
  
  get tdsRequired(): boolean {
    return this.requiredServices['TDS'] ?? false;
  }
  
  get auditRequired(): boolean {
    return this.requiredServices['Audit'] ?? false;
  }
}

export interface ClientFormData extends Omit<Client, 'id' | 'createdAt' | 'tasks' | 'gstRequired' | 'incomeTaxRequired' | 'tdsRequired' | 'auditRequired'> {}

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
