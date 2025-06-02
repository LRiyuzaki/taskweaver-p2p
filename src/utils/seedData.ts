
import { Client, Service } from '@/types/client';
import { Task } from '@/types/task';

// Helper function to create Service objects
const createService = (id: string, name: string): Service => ({
  id,
  name,
  description: `${name} service`,
  startDate: new Date(),
  status: 'active'
});

export const sampleClients: Client[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@example.com',
    company: 'Smith Enterprises',
    phone: '+61 2 9876 5432',
    contactPerson: 'John Smith',
    address: '123 Business Street, Sydney NSW 2000',
    abn: '12 345 678 901',
    gstRegistrationDate: new Date('2020-01-15'),
    entityType: 'Company',
    active: true,
    notes: 'High-value client with multiple compliance requirements',
    services: [
      createService('gst-filing', 'Monthly GST Filing'),
      createService('bookkeeping', 'Monthly Bookkeeping'),
      createService('payroll', 'Payroll Processing')
    ],
    documents: [],
    requiredServices: {
      gst: true,
      incomeTax: true,
      bookkeeping: true
    },
    createdAt: new Date('2024-01-15'),
    whatsappNumber: '+61 400 123 456',
    preferredContactMethod: 'email'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    company: 'Johnson & Associates',
    phone: '+61 3 8765 4321',
    contactPerson: 'Sarah Johnson',
    address: '456 Corporate Avenue, Melbourne VIC 3000',
    abn: '98 765 432 109',
    gstRegistrationDate: new Date('2019-06-20'),
    entityType: 'Partnership',
    active: true,
    notes: 'Quarterly BAS and annual compliance services',
    services: [
      createService('gst-filing', 'Quarterly GST Filing'),
      createService('income-tax', 'Annual Income Tax'),
      createService('audit', 'Annual Audit')
    ],
    documents: [],
    requiredServices: {
      gst: true,
      incomeTax: true,
      bookkeeping: false
    },
    createdAt: new Date('2024-02-10'),
    whatsappNumber: '+61 400 654 321',
    preferredContactMethod: 'phone'
  },
  {
    id: '3',
    name: 'Mike Wilson',
    email: 'mike.wilson@gmail.com',
    company: 'Wilson Consulting',
    phone: '+61 7 6543 2109',
    contactPerson: 'Mike Wilson',
    address: '789 Professional Plaza, Brisbane QLD 4000',
    abn: '11 222 333 444',
    gstRegistrationDate: new Date('2021-03-10'),
    entityType: 'Individual',
    active: true,
    notes: 'Small business with basic compliance needs',
    services: [
      createService('bookkeeping', 'Monthly Bookkeeping'),
      createService('bas', 'Quarterly BAS')
    ],
    documents: [],
    requiredServices: {
      gst: false,
      incomeTax: true,
      bookkeeping: true
    },
    createdAt: new Date('2024-03-05'),
    whatsappNumber: '+61 400 987 654',
    preferredContactMethod: 'email'
  },
  {
    id: '4',
    name: 'Emma Thompson',
    email: 'emma.thompson@techstart.com',
    company: 'TechStart Solutions',
    phone: '+61 2 5555 0123',
    contactPerson: 'Emma Thompson',
    address: '321 Innovation Drive, Sydney NSW 2000',
    abn: '55 123 456 789',
    gstRegistrationDate: new Date('2023-01-15'),
    entityType: 'Company',
    active: true,
    notes: 'Fast-growing tech startup requiring comprehensive services',
    services: [
      createService('gst-filing', 'Monthly GST Filing'),
      createService('bookkeeping', 'Monthly Bookkeeping'),
      createService('payroll', 'Fortnightly Payroll'),
      createService('management-reports', 'Monthly Management Reports')
    ],
    documents: [],
    requiredServices: {
      gst: true,
      incomeTax: true,
      bookkeeping: true
    },
    createdAt: new Date('2024-01-20'),
    whatsappNumber: '+61 400 555 123',
    preferredContactMethod: 'email'
  },
  {
    id: '5',
    name: 'David Chen',
    email: 'david.chen@retail.com',
    company: 'Chen Retail Group',
    phone: '+61 3 7777 8888',
    contactPerson: 'David Chen',
    address: '88 Retail Street, Melbourne VIC 3001',
    abn: '77 888 999 000',
    gstRegistrationDate: new Date('2018-05-10'),
    entityType: 'Company',
    active: true,
    notes: 'Multi-location retail business with complex GST requirements',
    services: [
      createService('gst-filing', 'Monthly GST Filing'),
      createService('bookkeeping', 'Monthly Bookkeeping'),
      createService('management-reports', 'Monthly Management Reports'),
      createService('inventory-management', 'Inventory Management')
    ],
    documents: [],
    requiredServices: {
      gst: true,
      incomeTax: true,
      bookkeeping: true
    },
    createdAt: new Date('2024-02-28'),
    whatsappNumber: '+61 400 777 888',
    preferredContactMethod: 'phone'
  }
];

export const sampleTasks: Task[] = [
  {
    id: '1',
    title: 'Monthly GST Filing - Smith Enterprises',
    description: 'Complete monthly GST return for December 2024. Review sales and purchase invoices, verify input tax credits, and submit BAS.',
    status: 'todo',
    priority: 'high',
    dueDate: new Date('2024-12-31'),
    assignedTo: 'user1',
    assigneeName: 'Current User',
    clientId: '1',
    clientName: 'John Smith',
    projectId: 'gst-filing',
    projectName: 'GST Filing',
    tags: ['GST', 'Monthly', 'Compliance'],
    recurrence: 'monthly',
    recurrenceEndDate: new Date('2025-12-31'),
    timeSpentMinutes: 0,
    requiresReview: true,
    reviewStatus: 'pending',
    reviewerId: null,
    comments: null,
    createdAt: new Date('2024-12-01'),
    startedAt: null,
    completedDate: null,
    subtasks: [
      {
        id: 'sub1-1',
        taskId: '1',
        title: 'Gather December sales invoices',
        description: 'Collect all sales invoices for December 2024',
        completed: false,
        orderPosition: 1,
        createdAt: new Date('2024-12-01'),
        completedAt: null
      },
      {
        id: 'sub1-2',
        taskId: '1',
        title: 'Review purchase invoices',
        description: 'Verify all purchase invoices and input tax credits',
        completed: false,
        orderPosition: 2,
        createdAt: new Date('2024-12-01'),
        completedAt: null
      }
    ]
  },
  {
    id: '2',
    title: 'Quarterly BAS - Johnson & Associates',
    description: 'Prepare quarterly Business Activity Statement for Q4 2024. Calculate GST liability and PAYG instalments.',
    status: 'in_progress',
    priority: 'medium',
    dueDate: new Date('2025-01-28'),
    assignedTo: 'user1',
    assigneeName: 'Current User',
    clientId: '2',
    clientName: 'Sarah Johnson',
    projectId: 'bas',
    projectName: 'BAS Filing',
    tags: ['BAS', 'Quarterly', 'GST'],
    recurrence: 'quarterly',
    recurrenceEndDate: new Date('2025-12-31'),
    timeSpentMinutes: 145,
    requiresReview: false,
    reviewStatus: 'pending',
    reviewerId: null,
    comments: 'Working on PAYG calculations',
    createdAt: new Date('2024-12-15'),
    startedAt: new Date('2024-12-20'),
    completedDate: null,
    subtasks: [
      {
        id: 'sub2-1',
        taskId: '2',
        title: 'Gather quarterly financial records',
        description: 'Collect all receipts and invoices for Q4',
        completed: true,
        orderPosition: 1,
        createdAt: new Date('2024-12-15'),
        completedAt: new Date('2024-12-18')
      },
      {
        id: 'sub2-2',
        taskId: '2',
        title: 'Calculate GST liability',
        description: 'Calculate total GST payable for the quarter',
        completed: true,
        orderPosition: 2,
        createdAt: new Date('2024-12-15'),
        completedAt: new Date('2024-12-22')
      },
      {
        id: 'sub2-3',
        taskId: '2',
        title: 'Enter data into BAS system',
        description: 'Input all calculated amounts into the BAS portal',
        completed: false,
        orderPosition: 3,
        createdAt: new Date('2024-12-15'),
        completedAt: null
      }
    ]
  },
  {
    id: '3',
    title: 'Monthly Bookkeeping - Wilson Consulting',
    description: 'Complete monthly bookkeeping reconciliation and review for November 2024. Bank reconciliation and expense categorization.',
    status: 'done',
    priority: 'low',
    dueDate: new Date('2024-12-15'),
    assignedTo: 'user1',
    assigneeName: 'Current User',
    clientId: '3',
    clientName: 'Mike Wilson',
    projectId: 'bookkeeping',
    projectName: 'Bookkeeping',
    tags: ['Bookkeeping', 'Monthly', 'Reconciliation'],
    recurrence: 'monthly',
    recurrenceEndDate: new Date('2025-12-31'),
    timeSpentMinutes: 180,
    requiresReview: false,
    reviewStatus: 'approved',
    reviewerId: null,
    comments: 'Completed without issues. All transactions reconciled.',
    createdAt: new Date('2024-11-15'),
    startedAt: new Date('2024-12-10'),
    completedDate: new Date('2024-12-14'),
    subtasks: []
  },
  {
    id: '4',
    title: 'Annual Income Tax Return - TechStart Solutions',
    description: 'Prepare annual company tax return for TechStart Solutions for FY2024. Review depreciation schedules and R&D claims.',
    status: 'review',
    priority: 'high',
    dueDate: new Date('2025-02-15'),
    assignedTo: 'user1',
    assigneeName: 'Current User',
    clientId: '4',
    clientName: 'Emma Thompson',
    projectId: 'income-tax',
    projectName: 'Income Tax',
    tags: ['Income Tax', 'Annual', 'Company'],
    recurrence: 'annually',
    recurrenceEndDate: new Date('2030-12-31'),
    timeSpentMinutes: 420,
    requiresReview: true,
    reviewStatus: 'pending',
    reviewerId: 'reviewer1',
    comments: 'Draft completed, awaiting senior review for R&D claims',
    createdAt: new Date('2024-11-01'),
    startedAt: new Date('2024-11-15'),
    completedDate: null,
    subtasks: [
      {
        id: 'sub4-1',
        taskId: '4',
        title: 'Review financial statements',
        description: 'Analyze P&L and balance sheet for FY2024',
        completed: true,
        orderPosition: 1,
        createdAt: new Date('2024-11-01'),
        completedAt: new Date('2024-11-20')
      },
      {
        id: 'sub4-2',
        taskId: '4',
        title: 'Calculate depreciation',
        description: 'Update depreciation schedules for all assets',
        completed: true,
        orderPosition: 2,
        createdAt: new Date('2024-11-01'),
        completedAt: new Date('2024-12-05')
      },
      {
        id: 'sub4-3',
        taskId: '4',
        title: 'Prepare R&D claim',
        description: 'Document and calculate R&D tax incentive claim',
        completed: false,
        orderPosition: 3,
        createdAt: new Date('2024-11-01'),
        completedAt: null
      }
    ]
  },
  {
    id: '5',
    title: 'Payroll Processing - Chen Retail Group',
    description: 'Process fortnightly payroll for Chen Retail Group. Calculate superannuation and PAYG withholding.',
    status: 'todo',
    priority: 'medium',
    dueDate: new Date('2025-01-10'),
    assignedTo: 'user1',
    assigneeName: 'Current User',
    clientId: '5',
    clientName: 'David Chen',
    projectId: 'payroll',
    projectName: 'Payroll',
    tags: ['Payroll', 'Fortnightly', 'Superannuation'],
    recurrence: 'weekly',
    recurrenceEndDate: new Date('2025-12-31'),
    timeSpentMinutes: 0,
    requiresReview: false,
    reviewStatus: 'pending',
    reviewerId: null,
    comments: null,
    createdAt: new Date('2024-12-20'),
    startedAt: null,
    completedDate: null,
    subtasks: [
      {
        id: 'sub5-1',
        taskId: '5',
        title: 'Collect timesheets',
        description: 'Gather timesheets from all retail locations',
        completed: false,
        orderPosition: 1,
        createdAt: new Date('2024-12-20'),
        completedAt: null
      },
      {
        id: 'sub5-2',
        taskId: '5',
        title: 'Calculate wages',
        description: 'Calculate gross wages including overtime and penalties',
        completed: false,
        orderPosition: 2,
        createdAt: new Date('2024-12-20'),
        completedAt: null
      }
    ]
  }
];

// Helper function to populate localStorage with sample data
export const seedLocalStorage = () => {
  localStorage.setItem('clients', JSON.stringify(sampleClients));
  localStorage.setItem('tasks', JSON.stringify(sampleTasks));
  console.log('Enhanced sample data seeded to localStorage');
};

// Helper function to clear localStorage
export const clearLocalStorage = () => {
  localStorage.removeItem('clients');
  localStorage.removeItem('tasks');
  console.log('localStorage cleared');
};
