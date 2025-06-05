
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
  registeredAddress?: Address;
  businessAddress?: Address;
  bankAccount?: BankAccount;
  services: string[];
  notes: ClientNote[];
  documents: ClientDocument[];
  createdAt: Date;
  active: boolean;
  requiredServices: Record<string, boolean>;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
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
  isActive: boolean;
  startDate: Date;
  endDate?: Date;
  renewalDate?: Date;
  notes?: string;
}

export interface ServiceRenewal {
  id: string;
  clientId: string;
  serviceTypeId: string;
  renewalDate: Date;
  isCompleted: boolean;
  reminderSent: boolean;
}

export interface ComplianceStatus {
  type: string;
  status: 'current' | 'upcoming' | 'overdue';
  dueDate: Date;
  description: string;
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
  registeredAddress?: Address;
  businessAddress?: Address;
  bankAccount?: BankAccount;
  requiredServices?: Record<string, boolean>;
}
