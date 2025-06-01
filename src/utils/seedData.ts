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
    notes: '',
    services: [
      createService('gst-filing', 'GST Filing'),
      createService('bookkeeping', 'Bookkeeping')
    ],
    documents: [],
    requiredServices: {
      gst: true,
      incomeTax: true,
      bookkeeping: true
    },
    gstFrequency: 'quarterly',
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
    notes: '',
    services: [
      createService('gst-filing', 'GST Filing'),
      createService('income-tax', 'Income Tax')
    ],
    documents: [],
    requiredServices: {
      gst: true,
      incomeTax: true,
      bookkeeping: false
    },
    gstFrequency: 'monthly',
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
    notes: '',
    services: [
      createService('bookkeeping', 'Bookkeeping')
    ],
    documents: [],
    requiredServices: {
      gst: false,
      incomeTax: true,
      bookkeeping: true
    },
    gstFrequency: 'annually',
    createdAt: new Date('2024-03-05'),
    whatsappNumber: '+61 400 987 654',
    preferredContactMethod: 'email'
  }
];

export const sampleTasks: Task[] = [
  {
    id: '1',
    title: 'Monthly GST Filing - Smith Enterprises',
    description: 'Complete monthly GST return for December 2024',
    status: 'todo',
    priority: 'high',
    dueDate: new Date('2024-12-31'),
    assignedTo: 'user1',
    assigneeName: 'Current User',
    clientId: '1',
    clientName: 'John Smith',
    projectId: null,
    projectName: null,
    tags: ['GST', 'Monthly'],
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
    subtasks: []
  },
  {
    id: '2',
    title: 'Quarterly BAS - Johnson & Associates',
    description: 'Prepare quarterly Business Activity Statement',
    status: 'inProgress',
    priority: 'medium',
    dueDate: new Date('2025-01-28'),
    assignedTo: 'user1',
    assigneeName: 'Current User',
    clientId: '2',
    clientName: 'Sarah Johnson',
    projectId: null,
    projectName: null,
    tags: ['BAS', 'Quarterly'],
    recurrence: 'quarterly',
    recurrenceEndDate: new Date('2025-12-31'),
    timeSpentMinutes: 45,
    requiresReview: false,
    reviewStatus: 'pending',
    reviewerId: null,
    comments: null,
    createdAt: new Date('2024-12-15'),
    startedAt: new Date('2024-12-20'),
    completedDate: null,
    subtasks: [
      {
        id: 'sub1',
        taskId: '2',
        title: 'Gather financial records',
        description: 'Collect all receipts and invoices',
        completed: true,
        orderPosition: 1,
        createdAt: new Date('2024-12-15'),
        completedAt: new Date('2024-12-18')
      },
      {
        id: 'sub2',
        taskId: '2',
        title: 'Enter data into system',
        description: 'Input all transactions',
        completed: false,
        orderPosition: 2,
        createdAt: new Date('2024-12-15'),
        completedAt: null
      }
    ]
  },
  {
    id: '3',
    title: 'Bookkeeping Review - Wilson Consulting',
    description: 'Monthly bookkeeping reconciliation and review',
    status: 'done',
    priority: 'low',
    dueDate: new Date('2024-12-15'),
    assignedTo: 'user1',
    assigneeName: 'Current User',
    clientId: '3',
    clientName: 'Mike Wilson',
    projectId: null,
    projectName: null,
    tags: ['Bookkeeping', 'Monthly'],
    recurrence: 'monthly',
    recurrenceEndDate: new Date('2025-12-31'),
    timeSpentMinutes: 120,
    requiresReview: false,
    reviewStatus: 'approved',
    reviewerId: null,
    comments: 'Completed without issues',
    createdAt: new Date('2024-11-15'),
    startedAt: new Date('2024-12-10'),
    completedDate: new Date('2024-12-14'),
    subtasks: []
  }
];

// Helper function to populate localStorage with sample data
export const seedLocalStorage = () => {
  localStorage.setItem('clients', JSON.stringify(sampleClients));
  localStorage.setItem('tasks', JSON.stringify(sampleTasks));
  console.log('Sample data seeded to localStorage');
};

// Helper function to clear localStorage
export const clearLocalStorage = () => {
  localStorage.removeItem('clients');
  localStorage.removeItem('tasks');
  console.log('localStorage cleared');
};
