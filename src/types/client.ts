
export type ClientStatus = 'active' | 'inactive' | 'pending';
export type ServiceCategory = 'accounting' | 'tax' | 'consulting' | 'other' | 'registration' | 'gst' | 'incometax' | 'tds' | 'audit';
export type ServiceFrequency = 'one-time' | 'monthly' | 'quarterly' | 'annually';

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  registered?: string;
  business?: string;
}

export interface BankAccount {
  id: string;
  accountNumber: string;
  bankName: string;
  ifscCode: string;
  accountType: string;
  branch: string;
}

export interface Client {
  id: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  address?: string | Address;
  status: ClientStatus;
  createdAt: Date;
  updatedAt?: Date;
  notes?: Note[];
  contacts?: Contact[];
  services?: string[] | ClientService[];
  requiredServices?: Record<string, boolean>;
  financialDetails?: FinancialDetails;
  businessDetails?: BusinessDetails;
  startDate?: Date;
  incorporationDate?: Date;
  gstRegistrationDate?: Date;
  documents?: Document[];
  
  // Additional properties
  contactPerson?: string;
  entityType?: string;
  gstin?: string;
  pan?: string;
  tan?: string;
  cin?: string;
  llpin?: string;
  bankAccounts?: BankAccount[];
  isGSTRegistered?: boolean;
  isMSME?: boolean;
  msmeNumber?: string;
  isIECHolder?: boolean;
  iecNumber?: string;
  financialYearEnd?: string;
  statutoryDueDates?: Record<string, number>;
  active?: boolean;
  
  // Additional compliance properties
  isDirector?: boolean;
  hasIECode?: boolean;
  hasDSC?: boolean;
  dscStartDate?: Date;
  hasTrademark?: boolean;
  trademarkDate?: Date;
  licenseDate?: Date;
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
  requiresGST?: boolean;
  requiresPAN?: boolean;
  requiresTAN?: boolean;
  applicableEntities?: string[];
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
  reminderDays?: number;
  reminderType?: string;
}

export interface ServiceRenewal {
  id: string;
  clientId?: string;
  clientServiceId: string;
  serviceTypeId: string;
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
  createdBy?: string;
}

export interface Document {
  id: string;
  name: string;
  url: string;
  type: string;
  uploadedAt: Date;
  fileUrl?: string;
  fileType?: string;
  fileSize?: number;
  uploadedBy?: string;
  description?: string;
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
  startDate?: Date;
  endDate?: Date;
  renewalDate?: Date;
  status?: 'active' | 'inactive';
}

export interface ComplianceStatus {
  type: string;
  status: 'current' | 'upcoming' | 'overdue';
  dueDate: Date;
  description: string;
  missingDocuments?: string[];
}

export interface ClientFormData {
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  address?: string | Address;
  status: ClientStatus;
  contactPerson?: string;
  entityType?: string;
  gstin?: string;
  pan?: string;
  tan?: string;
  cin?: string;
  llpin?: string;
  bankAccounts?: BankAccount[];
  isGSTRegistered?: boolean;
  isMSME?: boolean;
  msmeNumber?: string;
  isIECHolder?: boolean;
  iecNumber?: string;
  financialYearEnd?: string;
  statutoryDueDates?: Record<string, number>;
  requiredServices?: Record<string, boolean>;
  financialDetails?: FinancialDetails;
  businessDetails?: BusinessDetails;
  startDate?: Date;
  incorporationDate?: Date;
  gstRegistrationDate?: Date;
}

export interface ClientServicesTabProps {
  clientId: string;
}

export interface ClientDetailsTabProps {
  client: Client;
}

// Add SubTask export for seedData
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
