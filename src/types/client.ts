
export type EntityType = 'Individual' | 'Company' | 'LLP' | 'Partnership' | 'Proprietorship' | 'Trust' | 'HUF';
export type ServiceFrequency = 'monthly' | 'quarterly' | 'annually' | 'one-time';
export type ServiceCategory = 'gst' | 'incometax' | 'tds' | 'audit' | 'other';

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  contactPerson?: string;
  entityType: EntityType;
  gstin?: string;
  pan?: string;
  tan?: string;
  cin?: string;
  llpin?: string;
  registeredAddress?: Address;
  businessAddress?: Address;
  address?: string | Address;
  bankAccount?: BankAccount;
  bankAccounts?: BankAccount[];
  services: string[];
  notes: ClientNote[];
  documents: ClientDocument[];
  createdAt: Date;
  startDate?: Date;
  active: boolean;
  requiredServices: Record<string, boolean>;
  isGSTRegistered?: boolean;
  isMSME?: boolean;
  msmeNumber?: string;
  isIECHolder?: boolean;
  iecNumber?: string;
  financialYearEnd?: string;
  incorporationDate?: Date;
  gstRegistrationDate?: Date;
  statutoryDueDates?: {
    gstReturn?: number;
    tdsReturn?: number;
  };
  // Additional properties for recurring tasks
  isDirector?: boolean;
  hasIECode?: boolean;
  hasDSC?: boolean;
  dscStartDate?: Date;
  hasTrademark?: boolean;
  trademarkDate?: Date;
  licenseDate?: Date;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  registered?: string;
  business?: string;
}

export interface BankAccount {
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  branch: string;
}

export interface ClientNote {
  id: string;
  content: string;
  createdAt: Date;
  createdBy: string;
}

export interface ClientDocument {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedAt: Date;
  uploadedBy: string;
}

export interface ServiceType {
  id: string;
  name: string;
  description: string;
  frequency: ServiceFrequency;
  category: ServiceCategory;
  requiresGST?: boolean;
  requiresPAN?: boolean;
  requiresTAN?: boolean;
  applicableEntities: EntityType[];
  renewalPeriod: number;
}

export interface ClientService {
  id: string;
  clientId: string;
  serviceTypeId: string;
  serviceTypeName?: string;
  isActive: boolean;
  status?: 'active' | 'inactive' | 'completed' | 'pending';
  startDate: Date;
  endDate?: Date;
  renewalDate?: Date;
  nextRenewalDate?: Date;
  notes?: string;
  reminderDays?: number;
  reminderType?: 'days' | 'months' | 'specificDate';
  fee?: number;
}

export interface ServiceRenewal {
  id: string;
  clientId: string;
  serviceTypeId: string;
  serviceId?: string;
  renewalDate: Date;
  dueDate?: Date;
  reminderDate?: Date;
  isCompleted: boolean;
  reminderSent: boolean;
}

export interface ComplianceStatus {
  type: string;
  status: 'current' | 'upcoming' | 'overdue';
  dueDate: Date;
  description: string;
  missingDocuments?: string[];
  isCompliant?: boolean;
}

export interface ClientFormData {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  contactPerson?: string;
  entityType: EntityType;
  gstin?: string;
  pan?: string;
  tan?: string;
  cin?: string;
  llpin?: string;
  registeredAddress?: Address;
  businessAddress?: Address;
  address?: string;
  bankAccount?: BankAccount;
  bankAccounts?: BankAccount[];
  requiredServices?: Record<string, boolean>;
  startDate?: Date;
  isGSTRegistered?: boolean;
  isMSME?: boolean;
  msmeNumber?: string;
  isIECHolder?: boolean;
  iecNumber?: string;
  financialYearEnd?: string;
  incorporationDate?: Date;
  gstRegistrationDate?: Date;
  statutoryDueDates?: {
    gstReturn?: number;
    tdsReturn?: number;
  };
}

// Re-export types from task module for backward compatibility
export type { SubTask, TaskTemplate } from '@/types/task';
