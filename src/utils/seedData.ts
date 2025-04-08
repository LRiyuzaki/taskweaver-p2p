import { v4 as uuidv4 } from 'uuid';
import { Client, ServiceType, ClientService, ServiceRenewal } from '@/types/client';
import { Task, TaskStatus, TaskPriority, RecurrenceType, Subtask } from '@/types/task';

// Function to generate seed data for testing
export const generateSeedData = () => {
  console.log('Generating seed data...');
  
  try {
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
        name: 'GST Return Filing',
        description: 'Monthly GSTR-1 and GSTR-3B filing',
        frequency: 'monthly',
        category: 'gst',
        dueDate: {
          type: 'fixed',
          day: 20, // GSTR-3B due by 20th
        },
        requiresGST: true,
        applicableEntities: ['Company', 'LLP', 'Partnership', 'Proprietorship', 'Trust', 'HUF'],
        renewalPeriod: 1,
        documentRequirements: [
          { name: 'Sales Register', description: 'Monthly sales data with GST details', required: true },
          { name: 'Purchase Register', description: 'Monthly purchase data with GST details', required: true },
          { name: 'E-way Bills', description: 'If applicable', required: false },
        ],
        taskTemplate: [
          { title: 'Collect monthly transaction data', order: 0 },
          { title: 'Reconcile input and output GST', order: 1 },
          { title: 'Prepare GSTR-1', order: 2 },
          { title: 'File GSTR-1', order: 3 },
          { title: 'Review GSTR-2B', order: 4 },
          { title: 'Prepare GSTR-3B', order: 5 },
          { title: 'Calculate tax liability', order: 6 },
          { title: 'File GSTR-3B', order: 7 },
        ]
      },
      { 
        id: uuidv4(), 
        name: 'Income Tax Return Filing',
        description: 'Annual income tax return preparation and filing',
        frequency: 'annually',
        category: 'incometax',
        dueDate: {
          type: 'relative',
          monthOffset: 7, // 7 months after financial year end (usually October 31st)
        },
        requiresPAN: true,
        applicableEntities: ['Individual', 'Company', 'LLP', 'Partnership', 'Trust', 'HUF'],
        renewalPeriod: 12,
        documentRequirements: [
          { name: 'Balance Sheet', required: true },
          { name: 'Profit & Loss Statement', required: true },
          { name: 'Form 26AS', required: true },
          { name: 'Bank Statements', required: true },
        ],
        taskTemplate: [
          { title: 'Collect annual financial statements', order: 0 },
          { title: 'Review Form 26AS', order: 1 },
          { title: 'Reconcile TDS credits', order: 2 },
          { title: 'Calculate taxable income', order: 3 },
          { title: 'Prepare income tax computation', order: 4 },
          { title: 'File ITR', order: 5 },
          { title: 'Verify ITR', order: 6 },
        ]
      },
      { 
        id: uuidv4(), 
        name: 'TDS Return Filing',
        description: 'Quarterly TDS return filing (Form 24Q, 26Q)',
        frequency: 'quarterly',
        category: 'tds',
        dueDate: {
          type: 'relative',
          daysOffset: 31, // 31 days after quarter end
        },
        requiresTAN: true,
        applicableEntities: ['Company', 'LLP', 'Partnership', 'Trust'],
        renewalPeriod: 3,
        documentRequirements: [
          { name: 'TDS Payment Challans', required: true },
          { name: 'Vendor Bills', required: true },
          { name: 'Rent Agreements', required: false },
        ],
        taskTemplate: [
          { title: 'Collect payment details', order: 0 },
          { title: 'Verify TDS rates applied', order: 1 },
          { title: 'Prepare TDS return', order: 2 },
          { title: 'Generate Form 27A', order: 3 },
          { title: 'File TDS return', order: 4 },
        ]
      },
      { 
        id: uuidv4(), 
        name: 'GST Annual Return',
        description: 'Annual GST return (GSTR-9) filing',
        frequency: 'annually',
        category: 'gst',
        dueDate: {
          type: 'relative',
          monthOffset: 9, // 9 months after financial year end (usually December 31st)
        },
        requiresGST: true,
        applicableEntities: ['Company', 'LLP', 'Partnership', 'Proprietorship'],
        renewalPeriod: 12,
        documentRequirements: [
          { name: 'Monthly GST Returns', required: true },
          { name: 'Annual Financial Statements', required: true },
          { name: 'GST Audit Report', required: false },
        ],
        taskTemplate: [
          { title: 'Review monthly GST returns', order: 0 },
          { title: 'Reconcile with books of accounts', order: 1 },
          { title: 'Prepare GSTR-9', order: 2 },
          { title: 'Review reconciliation', order: 3 },
          { title: 'File GSTR-9', order: 4 },
        ]
      },
      { 
        id: uuidv4(), 
        name: 'Company Annual Compliance',
        description: 'Annual ROC compliance including AOC-4 and MGT-7',
        frequency: 'annually',
        category: 'compliance',
        dueDate: {
          type: 'relative',
          monthOffset: 6, // 6 months after financial year end
        },
        applicableEntities: ['Company'],
        renewalPeriod: 12,
        documentRequirements: [
          { name: 'Annual Financial Statements', required: true },
          { name: 'Board Resolution', required: true },
          { name: 'AGM Minutes', required: true },
        ],
        taskTemplate: [
          { title: 'Prepare financial statements', order: 0 },
          { title: 'Conduct board meeting', order: 1 },
          { title: 'Conduct AGM', order: 2 },
          { title: 'Prepare AOC-4', order: 3 },
          { title: 'Prepare MGT-7', order: 4 },
          { title: 'File with ROC', order: 5 },
        ]
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
    const task1Id = uuidv4();
    const subtasks1: Subtask[] = [
      { id: uuidv4(), taskId: task1Id, title: 'Collect invoices', description: '', completed: true, order: 0 },
      { id: uuidv4(), taskId: task1Id, title: 'Reconcile data', description: '', completed: false, order: 1 },
      { id: uuidv4(), taskId: task1Id, title: 'File returns', description: '', completed: false, order: 2 }
    ];
    
    const tasks: Task[] = [
      {
        id: task1Id,
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
        subtasks: subtasks1
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
    
    console.log('Seed data generated successfully');
    
    return {
      clients,
      serviceTypes,
      clientServices,
      serviceRenewals,
      tasks
    };
  } catch (error) {
    console.error('Error generating seed data:', error);
    throw error;
  }
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
