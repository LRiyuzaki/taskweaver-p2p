
import { v4 as uuidv4 } from 'uuid';
import { Client, Note, Document, Service, ClientService, ServiceType, SubTask } from '@/types/client';
import { Task, RecurrenceType, TaskStatus, TaskPriority, Project } from '@/types/task';
import { addDays, subDays, addMonths } from 'date-fns';

// Helper function to create a random date within a range
const randomDate = (start: Date, end: Date): Date => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Helper function to pick a random item from an array
const pickRandom = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

// Client data
export const generateClients = (count: number = 10): Client[] => {
  const clients: Client[] = [];
  
  const companyNames = [
    'Stellar Systems', 'Green Ventures', 'Blue Ocean Inc', 'Red Mountain LLC',
    'Horizon Technologies', 'Phoenix Solutions', 'Golden Gate Enterprises', 
    'Silver Stream Services', 'Crystal Clear Consulting', 'Emerald Innovations'
  ];
  
  const entityTypes: ('Individual' | 'Proprietorship' | 'Company' | 'LLP' | 'Partnership' | 'Trust' | 'HUF')[] = [
    'Individual', 'Proprietorship', 'Company', 'LLP', 'Partnership', 'Trust', 'HUF'
  ];
  
  const services = [
    'GST Filing', 'Income Tax Return', 'Trademark Registration', 
    'Company Registration', 'Accounting Services', 'Tax Consultation',
    'Compliance Management', 'Audit Services', 'ROC Filing', 'Annual Filings'
  ];
  
  for (let i = 0; i < count; i++) {
    const name = `Client ${i + 1}`;
    const company = pickRandom(companyNames);
    const entityType = pickRandom(entityTypes);
    
    // Generate a random selection of services
    const requiredServices: Record<string, boolean> = {};
    services.forEach(service => {
      requiredServices[service] = Math.random() > 0.6;
    });
    
    // Create a new client
    const newClient: Client = {
      id: uuidv4(),
      name,
      email: `${name.toLowerCase().replace(' ', '.')}@example.com`,
      company,
      contactPerson: `Contact Person for ${name}`,
      phone: `+91-${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      createdAt: randomDate(subDays(new Date(), 365), new Date()),
      active: true,
      requiredServices,
      services: [],
      notes: [],
      documents: [],
      entityType,
      gstin: entityType !== 'Individual' ? `22AAAAA0000A1Z${i % 10}` : undefined,
      pan: `ABCDE${i}234F`,
      startDate: randomDate(subDays(new Date(), 730), subDays(new Date(), 30)),
      address: {
        registered: `${i + 100} Business Park, Corporate Lane\nCity - 400001`,
        business: `${i + 100} Business Park, Corporate Lane\nCity - 400001`,
      },
    };
    
    // Create some services for this client
    const clientServices: Service[] = [];
    Object.entries(requiredServices).forEach(([serviceName, isRequired]) => {
      if (isRequired) {
        clientServices.push({
          id: uuidv4(),
          name: serviceName,
          startDate: randomDate(subDays(new Date(), 180), new Date()),
          endDate: randomDate(new Date(), addDays(new Date(), 180)),
          renewalDate: randomDate(addDays(new Date(), 30), addDays(new Date(), 120)),
          status: Math.random() > 0.2 ? 'active' : 'inactive',
        });
      }
    });
    
    // Create some notes for this client
    const notes: Note[] = [];
    const notesCount = Math.floor(Math.random() * 3) + 1;
    for (let j = 0; j < notesCount; j++) {
      notes.push({
        id: uuidv4(),
        content: `Important note ${j + 1} for ${name}. This client requires special attention.`,
        createdAt: randomDate(subDays(new Date(), 60), new Date()),
        createdBy: 'System Admin',
      });
    }
    
    // Create some documents for this client
    const documents: Document[] = [];
    const docTypes = ['PDF', 'DOCX', 'XLSX', 'PNG', 'JPG'];
    const docCount = Math.floor(Math.random() * 3);
    for (let j = 0; j < docCount; j++) {
      const fileType = pickRandom(docTypes);
      documents.push({
        id: uuidv4(),
        name: `Document ${j + 1} - ${name}.${fileType.toLowerCase()}`,
        fileUrl: `https://example.com/docs/${j}`,
        fileType,
        fileSize: Math.floor(Math.random() * 1000000) + 100000,
        uploadedAt: randomDate(subDays(new Date(), 60), new Date()),
        uploadedBy: 'System Admin',
        description: `Important document for ${name}`,
      });
    }
    
    // Add services, notes, and documents to the client
    newClient.services = clientServices;
    newClient.notes = notes;
    newClient.documents = documents;
    
    clients.push(newClient);
  }
  
  return clients;
};

// Project data
export const generateProjects = (clients: Client[], count: number = 5): Project[] => {
  const projects: Project[] = [];
  const projectNames = [
    'GST Implementation', 'Annual Compliance', 'Tax Planning', 
    'Business Restructuring', 'Audit Preparation', 'Financial Assessment',
    'Legal Documentation', 'Registration Process', 'Corporate Filing'
  ];
  
  const projectStatuses: ('active' | 'completed' | 'onHold')[] = ['active', 'completed', 'onHold'];
  const projectColors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-amber-500', 'bg-rose-500'];
  const projectIcons = ['file-text', 'briefcase', 'check-circle', 'bar-chart', 'shield'];
  
  for (let i = 0; i < count; i++) {
    // Select a random client for this project
    const client = pickRandom(clients);
    
    const projectStatus = pickRandom(projectStatuses);
    const startDate = randomDate(subDays(new Date(), 180), subDays(new Date(), 30));
    let endDate;
    
    if (projectStatus === 'completed') {
      endDate = randomDate(startDate, new Date());
    } else if (projectStatus === 'active') {
      endDate = randomDate(addDays(new Date(), 30), addDays(new Date(), 180));
    }
    
    projects.push({
      id: uuidv4(),
      name: pickRandom(projectNames),
      description: `This project involves ${client.name} and requires careful attention.`,
      clientId: client.id,
      clientName: client.name,
      status: projectStatus,
      startDate,
      endDate,
      createdAt: subDays(startDate, Math.floor(Math.random() * 30) + 1),
      color: pickRandom(projectColors),
      icon: pickRandom(projectIcons),
    });
  }
  
  return projects;
};

// Task data
export const generateTasks = (clients: Client[], projects: Project[], count: number = 15): Task[] => {
  const tasks: Task[] = [];
  
  const taskTitles = [
    'File GST Return', 'Prepare Income Tax Computation', 'Submit Annual Compliance',
    'Review Client Documents', 'Follow up on Registration', 'Prepare Legal Notice',
    'Complete Due Diligence', 'Reconcile Accounts', 'Finalize Audit Report',
    'Resolve Tax Notice', 'Draft Agreement', 'Submit Regulatory Filing'
  ];
  
  const taskStatuses: TaskStatus[] = ['todo', 'inProgress', 'done'];
  const taskPriorities: TaskPriority[] = ['low', 'medium', 'high'];
  const recurrenceTypes: RecurrenceType[] = ['none', 'daily', 'weekly', 'monthly', 'quarterly', 'yearly'];
  
  const tags = [
    'GST', 'Income Tax', 'Compliance', 'Legal', 'Audit', 'Registration', 
    'Payroll', 'Accounts', 'Advisory', 'Documentation', 'Due Diligence', 'Urgent'
  ];
  
  for (let i = 0; i < count; i++) {
    // Randomly assign a client or project (or both) to this task
    const useClient = Math.random() > 0.3;
    const useProject = Math.random() > 0.6;
    
    const client = useClient ? pickRandom(clients) : undefined;
    const project = useProject ? pickRandom(projects) : undefined;
    
    const status = pickRandom(taskStatuses);
    const priority = pickRandom(taskPriorities);
    const recurrence = pickRandom(recurrenceTypes);
    
    // Generate random due date
    let dueDate;
    if (status === 'done') {
      dueDate = randomDate(subDays(new Date(), 60), subDays(new Date(), 1));
    } else {
      dueDate = randomDate(new Date(), addDays(new Date(), 60));
    }
    
    // Generate tags (1-3 random tags)
    const taskTags: string[] = [];
    const numTags = Math.floor(Math.random() * 3) + 1;
    for (let j = 0; j < numTags; j++) {
      const tag = pickRandom(tags);
      if (!taskTags.includes(tag)) {
        taskTags.push(tag);
      }
    }
    
    const createdAt = subDays(new Date(), Math.floor(Math.random() * 60) + 1);
    
    // Create a new task
    const newTask: Task = {
      id: uuidv4(),
      title: pickRandom(taskTitles),
      description: `This task requires attention for ${client?.name || 'a client'}.`,
      status,
      priority,
      dueDate,
      createdAt,
      updatedAt: randomDate(createdAt, new Date()),
      completedDate: status === 'done' ? randomDate(createdAt, new Date()) : undefined,
      assignedTo: 'user-1',
      assigneeName: 'Admin User',
      clientId: client?.id,
      clientName: client?.name,
      projectId: project?.id,
      projectName: project?.name,
      tags: taskTags,
      recurrence,
      recurrenceEndDate: recurrence !== 'none' ? addMonths(new Date(), 12) : undefined,
    };
    
    tasks.push(newTask);
  }
  
  return tasks;
};

// Generate subtasks for existing tasks
export const generateSubtasks = (tasks: Task[], count: number = 30): SubTask[] => {
  const subtasks: SubTask[] = [];
  
  // For each task, potentially generate some subtasks
  tasks.forEach(task => {
    // Only generate subtasks for some tasks
    if (Math.random() > 0.4) {
      const numSubtasks = Math.floor(Math.random() * 4) + 1;
      
      for (let i = 0; i < numSubtasks; i++) {
        subtasks.push({
          id: uuidv4(),
          taskId: task.id,
          title: `Subtask ${i + 1} for ${task.title}`,
          description: Math.random() > 0.5 ? `This is a subtask that requires attention.` : undefined,
          completed: task.status === 'done' || (Math.random() > 0.7),
          order: i,
          assignedTo: task.assignedTo,
          assigneeName: task.assigneeName,
        });
      }
    }
  });
  
  return subtasks;
};

// Service Type data
export const generateServiceTypes = (): ServiceType[] => {
  return [
    {
      id: uuidv4(),
      name: 'GST Filing',
      description: 'Monthly/Quarterly GST return filing service',
      frequency: 'monthly',
      category: 'gst',
      dueDate: {
        type: 'fixed',
        day: 20,
      },
      requiresGST: true,
      applicableEntities: ['Proprietorship', 'Company', 'LLP', 'Partnership'],
      taskTemplate: []
    },
    {
      id: uuidv4(),
      name: 'Income Tax Return',
      description: 'Annual income tax return filing',
      frequency: 'annually',
      category: 'incometax',
      dueDate: {
        type: 'fixed',
        day: 31,
        monthOffset: 7,
      },
      requiresPAN: true,
      applicableEntities: ['Individual', 'Proprietorship', 'Company', 'LLP', 'Partnership', 'Trust', 'HUF'],
      taskTemplate: []
    },
    {
      id: uuidv4(),
      name: 'TDS Return',
      description: 'Quarterly TDS return filing',
      frequency: 'quarterly',
      category: 'tds',
      requiresTAN: true,
      applicableEntities: ['Company', 'LLP', 'Partnership'],
      taskTemplate: []
    },
    {
      id: uuidv4(),
      name: 'Company Registration',
      description: 'New company registration with MCA',
      frequency: 'one-time',
      category: 'registration',
      applicableEntities: ['Company'],
      documentRequirements: [
        { name: 'PAN Card', description: 'PAN card of all directors', required: true },
        { name: 'Address Proof', description: 'Address proof of registered office', required: true },
        { name: 'ID Proof', description: 'ID proof of all directors', required: true }
      ],
      taskTemplate: []
    },
    {
      id: uuidv4(),
      name: 'Trademark Registration',
      description: 'Trademark registration service',
      frequency: 'one-time',
      category: 'ipr',
      renewalPeriod: 120, // 10 years in months
      applicableEntities: ['Individual', 'Proprietorship', 'Company', 'LLP', 'Partnership'],
      taskTemplate: []
    }
  ];
};

// Client Service data
export const generateClientServices = (clients: Client[], serviceTypes: ServiceType[]): ClientService[] => {
  const clientServices: ClientService[] = [];
  
  clients.forEach(client => {
    // Randomly assign some service types to this client
    serviceTypes.forEach(serviceType => {
      if (Math.random() > 0.6) {
        const startDate = randomDate(subDays(new Date(), 180), new Date());
        let endDate;
        
        if (serviceType.frequency === 'one-time') {
          endDate = undefined;
        } else {
          const months = serviceType.frequency === 'annually' ? 12 : 
                         serviceType.frequency === 'quarterly' ? 3 : 1;
          endDate = addMonths(startDate, months);
        }
        
        clientServices.push({
          clientId: client.id,
          serviceTypeId: serviceType.id,
          serviceTypeName: serviceType.name,
          startDate,
          endDate,
          nextRenewalDate: endDate,
          status: 'active',
          reminderDays: 30,
          reminderType: 'days'
        });
      }
    });
  });
  
  return clientServices;
};

// Generate all seed data
export const generateSeedData = () => {
  // Generate clients first
  const clients = generateClients(10);
  
  // Generate projects using clients
  const projects = generateProjects(clients, 8);
  
  // Generate tasks using clients and projects
  const tasks = generateTasks(clients, projects, 25);
  
  // Generate subtasks for tasks
  const subtasks = generateSubtasks(tasks);
  
  // Generate service types
  const serviceTypes = generateServiceTypes();
  
  // Generate client services
  const clientServices = generateClientServices(clients, serviceTypes);
  
  return {
    clients,
    projects,
    tasks,
    subtasks,
    serviceTypes,
    clientServices
  };
};
