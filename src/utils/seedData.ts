import { v4 as uuidv4 } from 'uuid';
import { Client, ServiceType, ClientService, ServiceRenewal } from '@/types/client';
import { Task, TaskStatus, TaskPriority, RecurrenceType } from '@/types/task';

// Function to generate seed data for testing
export const generateSeedData = () => {
  // Clear existing data
  localStorage.removeItem('clients');
  localStorage.removeItem('serviceTypes');
  localStorage.removeItem('clientServices');
  localStorage.removeItem('serviceRenewals');
  localStorage.removeItem('tasks');
  
  // Generate service types
  const serviceTypes: ServiceType[] = [
    { 
      id: uuidv4(), 
      name: 'GST Filing', 
      description: 'Monthly GST return filing', 
      frequency: 'monthly', 
      renewalPeriod: 1 
    },
    { 
      id: uuidv4(), 
      name: 'Income Tax Filing', 
      description: 'Annual income tax return filing', 
      frequency: 'annually', 
      renewalPeriod: 12 
    },
    { 
      id: uuidv4(), 
      name: 'Bookkeeping', 
      description: 'Monthly bookkeeping services', 
      frequency: 'monthly', 
      renewalPeriod: 1 
    },
    { 
      id: uuidv4(), 
      name: 'Audit', 
      description: 'Annual audit services', 
      frequency: 'annually', 
      renewalPeriod: 12 
    },
    { 
      id: uuidv4(), 
      name: 'TDS Filing', 
      description: 'Quarterly TDS return filing', 
      frequency: 'quarterly', 
      renewalPeriod: 3 
    },
  ];
  
  localStorage.setItem('serviceTypes', JSON.stringify(serviceTypes));
  
  // Generate clients
  const clients: Client[] = [
    {
      id: uuidv4(),
      name: 'Acme Corporation',
      company: 'Acme Corp Ltd',
      email: 'contact@acmecorp.com',
      contactPerson: 'John Smith',
      phone: '9876543210',
      createdAt: new Date(),
      active: true,
      requiredServices: { 
        'GST Filing': true, 
        'Income Tax Filing': true,
        'Bookkeeping': true,
        'Audit': true,
        'TDS Filing': false
      },
      entityType: 'Company',
      gstin: '27AAPFU0939F1ZV',
      pan: 'AAPFU0939F',
      startDate: new Date(2023, 0, 15),
      address: '123 Business Park, Mumbai, 400001',
      services: [],
      notes: [
        {
          id: uuidv4(),
          content: 'Client requested quarterly financial reports',
          createdAt: new Date(2023, 1, 5),
          createdBy: 'Admin'
        },
        {
          id: uuidv4(),
          content: 'Updated client contact information',
          createdAt: new Date(2023, 2, 10),
          createdBy: 'Admin'
        }
      ],
      documents: [
        {
          id: uuidv4(),
          name: 'Incorporation Certificate',
          fileUrl: 'documents/acme_inc.pdf',
          fileType: 'application/pdf',
          fileSize: 2500000,
          uploadedAt: new Date(2023, 0, 16),
          description: 'Certificate of Incorporation'
        },
        {
          id: uuidv4(),
          name: 'GST Registration',
          fileUrl: 'documents/acme_gst.pdf',
          fileType: 'application/pdf',
          fileSize: 1800000,
          uploadedAt: new Date(2023, 0, 18),
          description: 'GST Registration Certificate'
        }
      ]
    },
    {
      id: uuidv4(),
      name: 'Globex Industries',
      company: 'Globex Industries Pvt Ltd',
      email: 'info@globexind.com',
      contactPerson: 'Sarah Johnson',
      phone: '8765432109',
      createdAt: new Date(),
      active: true,
      requiredServices: { 
        'GST Filing': true, 
        'Income Tax Filing': true,
        'Bookkeeping': false,
        'Audit': true,
        'TDS Filing': true
      },
      entityType: 'LLP',
      gstin: '29AADCG7896F1ZL',
      pan: 'AADCG7896F',
      startDate: new Date(2023, 3, 5),
      address: '456 Tech Park, Bangalore, 560001',
      services: [],
      notes: [
        {
          id: uuidv4(),
          content: 'Client interested in tax advisory services',
          createdAt: new Date(2023, 4, 15),
          createdBy: 'Admin'
        }
      ],
      documents: [
        {
          id: uuidv4(),
          name: 'LLP Agreement',
          fileUrl: 'documents/globex_llp.pdf',
          fileType: 'application/pdf',
          fileSize: 3200000,
          uploadedAt: new Date(2023, 3, 10),
          description: 'LLP Partnership Agreement'
        }
      ]
    },
    {
      id: uuidv4(),
      name: 'Quantum Solutions',
      company: 'Quantum IT Solutions',
      email: 'contact@quantumits.com',
      contactPerson: 'Michael Chen',
      phone: '7654321098',
      createdAt: new Date(),
      active: true,
      requiredServices: { 
        'GST Filing': true, 
        'Income Tax Filing': true,
        'Bookkeeping': true,
        'Audit': false,
        'TDS Filing': true
      },
      entityType: 'Company',
      gstin: '06AABCQ2345H1ZT',
      pan: 'AABCQ2345H',
      startDate: new Date(2023, 5, 20),
      address: '789 Cyber Park, Delhi, 110001',
      services: [],
      notes: [],
      documents: []
    }
  ];
  
  localStorage.setItem('clients', JSON.stringify(clients));
  
  // Generate client services
  const clientServices: ClientService[] = [
    {
      clientId: clients[0].id,
      serviceTypeId: serviceTypes[0].id,
      serviceTypeName: serviceTypes[0].name,
      startDate: new Date(2023, 0, 20),
      status: 'active',
      reminderDays: 7,
      reminderType: 'days',
    },
    {
      clientId: clients[0].id,
      serviceTypeId: serviceTypes[1].id,
      serviceTypeName: serviceTypes[1].name,
      startDate: new Date(2023, 0, 20),
      status: 'active',
      reminderDays: 30,
      reminderType: 'days',
    },
    {
      clientId: clients[1].id,
      serviceTypeId: serviceTypes[0].id,
      serviceTypeName: serviceTypes[0].name,
      startDate: new Date(2023, 3, 10),
      status: 'active',
      reminderDays: 10,
      reminderType: 'days',
    }
  ];
  
  localStorage.setItem('clientServices', JSON.stringify(clientServices));
  
  // Generate service renewals
  const serviceRenewals: ServiceRenewal[] = [
    {
      id: uuidv4(),
      clientId: clients[0].id,
      serviceId: serviceTypes[0].id,
      dueDate: new Date(2023, 3, 10),
      status: 'completed',
      completedDate: new Date(2023, 3, 8),
    },
    {
      id: uuidv4(),
      clientId: clients[0].id,
      serviceId: serviceTypes[0].id,
      dueDate: new Date(2023, 4, 10),
      status: 'completed',
      completedDate: new Date(2023, 4, 7),
    },
    {
      id: uuidv4(),
      clientId: clients[0].id,
      serviceId: serviceTypes[0].id,
      dueDate: new Date(2023, 5, 10),
      status: 'pending',
    },
    {
      id: uuidv4(),
      clientId: clients[1].id,
      serviceId: serviceTypes[0].id,
      dueDate: new Date(2023, 5, 15),
      status: 'pending',
    }
  ];
  
  localStorage.setItem('serviceRenewals', JSON.stringify(serviceRenewals));
  
  // Generate tasks
  const tasks: Task[] = [
    {
      id: uuidv4(),
      title: 'GST Filing - Acme Corp',
      description: 'Monthly GST return filing for April',
      status: 'todo' as TaskStatus,
      priority: 'high' as TaskPriority,
      dueDate: new Date(2023, 5, 10),
      clientId: clients[0].id,
      clientName: clients[0].name,
      tags: ['GST', 'Monthly'],
      recurrence: 'monthly' as RecurrenceType,
      createdAt: new Date(),
      subtasks: [
        { id: uuidv4(), taskId: '', title: 'Collect invoices', description: '', completed: true, order: 0 },
        { id: uuidv4(), taskId: '', title: 'Reconcile data', description: '', completed: false, order: 1 },
        { id: uuidv4(), taskId: '', title: 'File returns', description: '', completed: false, order: 2 }
      ]
    },
    {
      id: uuidv4(),
      title: 'Income Tax Planning - Globex',
      description: 'Quarterly tax planning session',
      status: 'inProgress' as TaskStatus,
      priority: 'medium' as TaskPriority,
      dueDate: new Date(2023, 6, 15),
      clientId: clients[1].id,
      clientName: clients[1].name,
      tags: ['Tax', 'Planning'],
      recurrence: 'none' as RecurrenceType,
      createdAt: new Date(),
      subtasks: []
    },
    {
      id: uuidv4(),
      title: 'Bookkeeping - Acme Corp',
      description: 'Monthly bookkeeping for May',
      status: 'done' as TaskStatus,
      priority: 'medium' as TaskPriority,
      dueDate: new Date(2023, 5, 30),
      clientId: clients[0].id,
      clientName: clients[0].name,
      completedDate: new Date(2023, 5, 28),
      tags: ['Bookkeeping', 'Monthly'],
      recurrence: 'monthly' as RecurrenceType,
      createdAt: new Date(),
      subtasks: []
    }
  ];
  
  localStorage.setItem('tasks', JSON.stringify(tasks));
  
  return {
    clients,
    serviceTypes,
    clientServices,
    serviceRenewals,
    tasks
  };
};

// Function to check if seed data exists
export const checkAndGenerateSeedData = () => {
  const clients = localStorage.getItem('clients');
  if (!clients || JSON.parse(clients).length === 0) {
    return generateSeedData();
  }
  return null;
};

// Function to initialize the app with seed data if needed
export const initializeWithSeedData = () => {
  // Check if we already have data
  const hasClients = localStorage.getItem('clients') !== null;
  
  if (!hasClients) {
    generateSeedData();
    console.log('Initialized app with seed data');
    return true;
  }
  
  return false;
};
