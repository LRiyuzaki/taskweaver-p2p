
// Add the missing properties to the createReminderTask function:
const createReminderTask = (renewal: ServiceRenewal) => {
  const client = clients.find(c => c.id === renewal.clientId);
  const service = services.find(s => s.id === renewal.serviceId);
  
  if (!client || !service) {
    toast.error('Client or service not found');
    return;
  }
  
  const task = {
    title: `${service.serviceTypeName} Renewal for ${client.name}`,
    description: `Renewal reminder for ${service.serviceTypeName}`,
    status: 'todo' as TaskStatus,
    priority: 'medium' as TaskPriority,
    dueDate: new Date(renewal.dueDate),
    clientId: client.id,
    clientName: client.name,
    tags: [service.serviceTypeName || 'Renewal'],
    recurrence: 'none' as RecurrenceType  // Add required recurrence
  };
  
  addTask(task);
  toast.success('Reminder task created successfully');
};

// And also in the scheduleReminder function:
const scheduleReminder = (service: ClientService) => {
  const { reminderType, reminderDays } = reminderSettings;
  
  if (!reminderType || (reminderType !== 'specificDate' && !reminderDays)) {
    toast.error('Please configure reminder settings');
    return;
  }
  
  let reminderDate: Date;
  
  if (reminderType === 'specificDate') {
    if (!reminderSettings.reminderDate) {
      toast.error('Please select a specific date');
      return;
    }
    reminderDate = new Date(reminderSettings.reminderDate);
  } else {
    // Calculate date based on service renewal date
    if (!service.nextRenewalDate) {
      toast.error('Service has no renewal date');
      return;
    }
    
    const renewalDate = new Date(service.nextRenewalDate);
    
    if (reminderType === 'days') {
      // Subtract days
      reminderDate = new Date(renewalDate);
      reminderDate.setDate(renewalDate.getDate() - (reminderDays || 0));
    } else { // months
      // Subtract months
      reminderDate = new Date(renewalDate);
      reminderDate.setMonth(renewalDate.getMonth() - (reminderDays || 0));
    }
  }
  
  // Create the task
  const client = clients.find(c => c.id === service.clientId);
  if (!client) {
    toast.error('Client not found');
    return;
  }
  
  const task = {
    title: `Upcoming Renewal: ${service.serviceTypeName}`,
    description: `Prepare for upcoming renewal of ${service.serviceTypeName} for ${client.name}`,
    status: 'todo' as TaskStatus,
    priority: 'medium' as TaskPriority,
    dueDate: reminderDate,
    clientId: client.id,
    clientName: client.name,
    tags: ['Reminder', service.serviceTypeName || ''],
    recurrence: 'none' as RecurrenceType  // Add required recurrence
  };
  
  addTask(task);
  
  // Update the service to include reminder settings
  updateClientService(service.clientId, service.serviceTypeId, {
    ...service,
    reminderDays: reminderSettings.reminderDays,
    reminderType: reminderSettings.reminderType,
    reminderDate: reminderSettings.reminderDate ? new Date(reminderSettings.reminderDate) : undefined
  });
  
  toast.success('Reminder scheduled successfully');
  setReminderServiceId(null);
};
