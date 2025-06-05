
import React, { useState } from 'react';
import { useClientContext } from '@/contexts/ClientContext';
import { useTaskContext } from '@/contexts/TaskContext';
import { ServiceRenewal, ClientService } from '@/types/client';
import { Task, TaskStatus, TaskPriority, RecurrenceType } from '@/types/task';
import { toast } from '@/hooks/use-toast-extensions';

interface ReminderSettings {
  reminderType: 'days' | 'months' | 'specificDate';
  reminderDays?: number;
  reminderDate?: Date;
}

export const ServiceRenewalsDashboard: React.FC = () => {
  const { clients, clientServices, serviceRenewals, addServiceRenewal, updateClientService } = useClientContext();
  const { addTask } = useTaskContext();
  const [reminderServiceId, setReminderServiceId] = useState<null | string>(null);
  const [reminderSettings, setReminderSettings] = useState<ReminderSettings>({
    reminderType: 'days',
    reminderDays: 14,
  });
  
  // Create a reminder task for a service renewal
  const createReminderTask = (renewal: ServiceRenewal) => {
    const client = clients.find(c => c.id === renewal.clientId);
    const service = clientServices.find(s => s.clientId === renewal.clientId && s.serviceTypeId === renewal.serviceTypeId);
    
    if (!client || !service) {
      toast.error('Client or service not found');
      return;
    }
    
    const task = {
      title: `${service.serviceTypeName} Renewal for ${client.name}`,
      description: `Renewal reminder for ${service.serviceTypeName}`,
      status: 'todo' as TaskStatus,
      priority: 'medium' as TaskPriority,
      dueDate: renewal.dueDate ? new Date(renewal.dueDate) : new Date(renewal.renewalDate),
      clientId: client.id,
      clientName: client.name,
      tags: [service.serviceTypeName || 'Renewal'],
      recurrence: 'none' as RecurrenceType,
      updatedAt: new Date(),
      subtasks: []
    };
    
    addTask(task);
    toast.success('Reminder task created successfully');
  };

  // Schedule a reminder for a service
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
      recurrence: 'none' as RecurrenceType,
      updatedAt: new Date(),
      subtasks: []
    };
    
    addTask(task);
    
    // Update the service to include reminder settings
    updateClientService(service.clientId, service.serviceTypeId, {
      ...service,
      reminderDays: reminderSettings.reminderDays,
      reminderType: reminderSettings.reminderType
    });
    
    toast.success('Reminder scheduled successfully');
    setReminderServiceId(null);
  };
  
  return (
    <div>
      {/* Implementation of the component UI would go here */}
      <h2>Service Renewals Dashboard</h2>
      <p>This component needs UI implementation.</p>
    </div>
  );
};

export default ServiceRenewalsDashboard;
