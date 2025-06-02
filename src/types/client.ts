
import { Task } from './task';

export interface Client {
  id: string;
  name: string;
  email: string;
  company: string;
  contactPerson?: string;
  phone?: string;
  createdAt: Date;
  active: boolean;
  
  // Service requirements will be stored here
  requiredServices: Record<string, boolean>;
  
  // Collections
  services: Service[];
  notes: Note[];
  documents: Document[];
  
  // Entity information
  entityType?: 'Individual' | 'Proprietorship' | 'Company' | 'LLP' | 'Partnership' | 'Trust' | 'HUF';
  gstin?: string;
  pan?: string;
  tan?: string;
  cin?: string; // Company Incorporation Number
  llpin?: string; // LLP Identification Number
  
  // Bank account details for tax purposes
  bankAccounts?: {
    accountNumber: string;
    ifscCode: string;
    bankName: string;
    branch: string;
  }[];
  
  // Registration details
  gstRegistrationDate?: Date;
  incorporationDate?: Date;
  financialYearEnd?: 'March' | 'December';
  
  // Additional fields
  startDate?: Date;
  address?: {
    registered: string;
    business?: string;
  };
  tasks?: Task[];
  
  // Compliance-specific flags
  isGSTRegistered?: boolean;
  isMSME?: boolean;
  msmeNumber?: string;
  isIECHolder?: boolean;
  iecNumber?: string;
  
  // Statutory due dates
  statutoryDueDates?: {
    gstReturn?: number; // Day of month
    tdsReturn?: number; // Day of month
    advanceTax?: {
      q1: Date;
      q2: Date;
      q3: Date;
      q4: Date;
    };
  };
  
  // Additional properties for compliance and services
  isDirector?: boolean;
  hasIECode?: boolean;
  hasDSC?: boolean;
  dscStartDate?: Date;
  hasTrademark?: boolean;
  trademarkDate?: Date;
  licenseDate?: Date;
}

export interface ClientFormData extends Omit<Client, 'id' | 'createdAt' | 'tasks' | 'active' | 'services' | 'notes' | 'documents'> {}

export interface Service {
  id: string;
  name: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  renewalDate?: Date;
  status?: 'active' | 'inactive' | 'completed';
}

export interface Note {
  id: string;
  content: string;
  createdAt: Date;
  createdBy?: string;
}

export interface Document {
  id: string;
  name: string;
  fileUrl: string;
  fileType: string;
  fileSize?: number;
  uploadedAt: Date;
  uploadedBy?: string;
  description?: string;
}

export interface ServiceType {
  id: string;
  name: string;
  description: string;
  frequency: 'one-time' | 'monthly' | 'quarterly' | 'annually';
  category: 'gst' | 'incometax' | 'tds' | 'compliance' | 'audit' | 'registration' | 'other';
  dueDate?: {
    type: 'fixed' | 'relative';
    day?: number; // Fixed day of month (1-31)
    monthOffset?: number; // Number of months after fiscal year end
    daysOffset?: number; // Number of days after period end
  };
  requiresGST?: boolean;
  requiresPAN?: boolean;
  requiresTAN?: boolean;
  applicableEntities?: ('Individual' | 'Proprietorship' | 'Company' | 'LLP' | 'Partnership' | 'Trust' | 'HUF')[];
  renewalPeriod?: number; // Period in months
  taskTemplate?: SubTask[]; // Default subtasks for this service type
  documentRequirements?: {
    name: string;
    description?: string;
    required: boolean;
  }[];
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
