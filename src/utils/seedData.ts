import { Client } from '@/types/client';
import { Project, ServiceInfo, Task, TaskStatus } from '@/types/task';

export const seedLocalStorage = () => {
  console.log("Seeding localStorage with sample data...");

  // Sample clients data
  const sampleClients: Client[] = [
    {
      id: "1",
      name: "John Smith",
      email: "john@acme.com.au",
      company: "Acme Pty Ltd",
      contactPerson: "John Smith",
      phone: "+61-3-9876-5432",
      createdAt: new Date("2024-01-15"),
      active: true,
      requiredServices: {
        "gst": true,
        "bas": true,
        "payroll": false
      },
      services: [],
      notes: "Important client - high priority",
      documents: [],
      entityType: "Company",
      gstin: "GST123456789",
      pan: "ABCDE1234F",
      abn: "12345678901",
      address: "123 Collins Street, Melbourne VIC 3000",
      whatsappNumber: "+61-400-123-456",
      preferredContactMethod: "email"
    },
    {
      id: "2", 
      name: "Sarah Wilson",
      email: "sarah@techstartup.com.au",
      company: "Tech Startup Pty Ltd",
      contactPerson: "Sarah Wilson",
      phone: "+61-2-9876-5432",
      createdAt: new Date("2024-02-01"),
      active: true,
      requiredServices: {
        "gst": true,
        "bas": true,
        "audit": true
      },
      services: [],
      notes: "Growing startup - quarterly meetings scheduled",
      documents: [],
      entityType: "Company",
      gstin: "GST987654321",
      pan: "FGHIJ5678K",
      abn: "98765432109",
      address: "456 George Street, Sydney NSW 2000",
      whatsappNumber: "+61-411-987-654",
      preferredContactMethod: "whatsapp"
    },
    {
      id: "3",
      name: "Michael Chen",
      email: "michael@consulting.com.au", 
      company: "Chen Consulting",
      contactPerson: "Michael Chen",
      phone: "+61-7-9876-5432",
      createdAt: new Date("2024-01-20"),
      active: true,
      requiredServices: {
        "gst": true,
        "income-tax": true
      },
      services: [],
      notes: "Individual consultant - monthly GST filing",
      documents: [],
      entityType: "Individual",
      pan: "LMNOP9012Q",
      abn: "56789012345",
      address: "789 Queen Street, Brisbane QLD 4000",
      whatsappNumber: "+61-422-345-678",
      preferredContactMethod: "phone"
    }
  ];

  // Sample tasks data with corrected enum values
  const sampleTasks: Task[] = [
    {
      id: "1",
      title: "GST Return Filing - Acme Pty Ltd",
      description: "Prepare and submit monthly GST return for Acme Pty Ltd",
      status: "todo", // Changed from "todo" (already correct)
      priority: "high",
      dueDate: new Date("2024-12-15"),
      createdAt: new Date("2024-12-01"),
      timeSpentMinutes: 0,
      assignedTo: "user1",
      assigneeName: "Alice Johnson",
      clientId: "1",
      clientName: "Acme Pty Ltd",
      serviceId: "gst-filing",
      serviceName: "GST Filing",
      requiresReview: true,
      reviewStatus: "pending",
      tags: ["gst", "monthly", "urgent"],
      recurrence: "monthly", // This is correct for RecurrenceType
      subtasks: []
    },
    {
      id: "2", 
      title: "BAS Lodgement - Tech Startup",
      description: "Complete quarterly BAS for Tech Startup Pty Ltd",
      status: "inProgress", // Changed from "in_progress" to "inProgress"
      priority: "medium",
      dueDate: new Date("2024-12-28"),
      createdAt: new Date("2024-12-02"),
      startedAt: new Date("2024-12-05"),
      timeSpentMinutes: 120,
      assignedTo: "user2",
      assigneeName: "Bob Smith",
      clientId: "2",
      clientName: "Tech Startup Pty Ltd",
      serviceId: "bas-lodgement",
      serviceName: "BAS Lodgement",
      requiresReview: false,
      tags: ["bas", "quarterly"],
      recurrence: "quarterly", // This is correct for RecurrenceType
      subtasks: [
        {
          id: "sub1",
          taskId: "2",
          title: "Gather financial records",
          description: "Collect all invoices and receipts",
          completed: true,
          orderPosition: 1,
          createdAt: new Date("2024-12-02")
        },
        {
          id: "sub2", 
          taskId: "2",
          title: "Calculate GST liability",
          description: "Compute total GST owed",
          completed: false,
          orderPosition: 2,
          createdAt: new Date("2024-12-02")
        }
      ]
    },
    {
      id: "3",
      title: "Annual Tax Return - Michael Chen",
      description: "Prepare individual tax return for Michael Chen",
      status: "review",
      priority: "medium", 
      dueDate: new Date("2024-12-31"),
      createdAt: new Date("2024-11-15"),
      completedDate: new Date("2024-12-10"),
      timeSpentMinutes: 180,
      assignedTo: "user1",
      assigneeName: "Alice Johnson",
      clientId: "3", 
      clientName: "Michael Chen",
      serviceId: "tax-return",
      serviceName: "Individual Tax Return",
      requiresReview: true,
      reviewerId: "user3",
      reviewerName: "Charlie Brown",
      reviewStatus: "pending",
      tags: ["tax", "individual", "annual"],
      recurrence: "yearly", // Changed from "annually" to "yearly"
      subtasks: []
    },
    {
      id: "4",
      title: "Payroll Processing - Acme Pty Ltd", 
      description: "Process monthly payroll for 15 employees",
      status: "done",
      priority: "high",
      dueDate: new Date("2024-11-30"),
      createdAt: new Date("2024-11-20"),
      startedAt: new Date("2024-11-25"),
      completedDate: new Date("2024-11-29"),
      timeSpentMinutes: 240,
      assignedTo: "user2",
      assigneeName: "Bob Smith",
      clientId: "1",
      clientName: "Acme Pty Ltd",
      serviceId: "payroll",
      serviceName: "Payroll Processing",
      requiresReview: false,
      tags: ["payroll", "employees"],
      recurrence: "monthly",
      subtasks: []
    }
  ];

  // Sample projects data
  const sampleProjects: Project[] = [
    {
      id: "1",
      name: "GST Compliance Project",
      description: "Ongoing GST compliance for Acme Pty Ltd",
      clientId: "1",
      clientName: "Acme Pty Ltd",
      status: "active",
      startDate: new Date("2024-01-01"),
      createdAt: new Date("2024-01-01"),
      color: "#2563eb",
      icon: "file-invoice"
    },
    {
      id: "2",
      name: "Year-End Tax Planning",
      description: "Tax planning and preparation for Tech Startup",
      clientId: "2",
      clientName: "Tech Startup Pty Ltd",
      status: "active",
      startDate: new Date("2024-11-01"),
      endDate: new Date("2024-12-31"),
      createdAt: new Date("2024-11-01"),
      color: "#db2777",
      icon: "chart-line"
    }
  ];

  // Sample services data
  const sampleServices: ServiceInfo[] = [
    {
      id: "gst-filing",
      name: "GST Filing",
      description: "Monthly GST return preparation and filing",
      standardTimeHours: 2,
      requiresReview: true,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01")
    },
    {
      id: "bas-lodgement",
      name: "BAS Lodgement",
      description: "Quarterly BAS preparation and lodgement",
      standardTimeHours: 4,
      requiresReview: false,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01")
    },
    {
      id: "tax-return",
      name: "Individual Tax Return",
      description: "Annual individual income tax return preparation",
      standardTimeHours: 6,
      requiresReview: true,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01")
    },
    {
      id: "payroll",
      name: "Payroll Processing",
      description: "Monthly payroll processing for small businesses",
      standardTimeHours: 4,
      requiresReview: false,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01")
    }
  ];

  // Save to localStorage
  localStorage.setItem("clients", JSON.stringify(sampleClients));
  localStorage.setItem("tasks", JSON.stringify(sampleTasks));
  localStorage.setItem("projects", JSON.stringify(sampleProjects));
  localStorage.setItem("services", JSON.stringify(sampleServices));

  console.log("Sample data loaded successfully!");
  console.log(`Loaded ${sampleClients.length} clients, ${sampleTasks.length} tasks, ${sampleProjects.length} projects, ${sampleServices.length} services`);
};
