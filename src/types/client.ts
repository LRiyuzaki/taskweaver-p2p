export type ClientStatus = 'active' | 'inactive' | 'pending';
export type ServiceCategory = 'accounting' | 'tax' | 'consulting' | 'other' | 'registration';
export type ServiceFrequency = 'one-time' | 'monthly' | 'quarterly' | 'annually';

export interface Client {
  id: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  address?: string;
  status: ClientStatus;
  createdAt: Date;
  updatedAt?: Date;
  notes?: string;
  contacts?: Contact[];
  services?: string[] | ClientService[];
  requiredServices?: Record<string, boolean>;
  financialDetails?: FinancialDetails;
  businessDetails?: BusinessDetails;
  startDate?: Date;
  incorporationDate?: Date;
  gstRegistrationDate?: Date;
}

export interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  position?: string;
}

export interface FinancialDetails {
  annualRevenue?: number;
  currency?: string;
  paymentTerms?: string;
}

export interface BusinessDetails {
  industry?: string;
  numberOfEmployees?: number;
  businessType?: string;
  registeredNumber?: string;
}

export interface ServiceType {
  id: string;
  name: string;
  description?: string;
  category: ServiceCategory;
  frequency?: ServiceFrequency;
  isRecurring: boolean;
  reminderDays?: number;
  renewalPeriod?: number;
  complianceRequirements?: string[];
  documentRequirements?: string[];
  isActive: boolean;
  createdAt: Date;
}

export interface ClientService {
  id: string;
  clientId: string;
  serviceTypeId: string;
  serviceTypeName: string;
  isActive: boolean;
  startDate: Date;
  endDate?: Date;
  renewalDate?: Date;
  nextRenewalDate?: Date;
  status: 'active' | 'inactive' | 'completed';
  fee?: number;
}

export interface ServiceRenewal {
  id: string;
  clientServiceId: string;
  renewalDate: Date;
  dueDate?: Date;
  reminderDate?: Date;
  status: 'pending' | 'completed' | 'overdue';
  notes?: string;
}

export interface Note {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Document {
  id: string;
  name: string;
  url: string;
  type: string;
  uploadedAt: Date;
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  category: ServiceCategory;
  frequency?: ServiceFrequency;
  isRecurring: boolean;
  reminderDays?: number;
  renewalPeriod?: number;
  complianceRequirements?: string[];
  documentRequirements?: string[];
  isActive: boolean;
  createdAt: Date;
}
