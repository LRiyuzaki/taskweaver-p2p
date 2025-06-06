import { useCallback, useEffect } from 'react';
import { useClientContext } from '@/contexts/ClientContext';
import { useTaskContext } from '@/contexts/TaskContext';
import { Client } from '@/types/client';

export const useComplianceScheduler = () => {
  const { clients } = useClientContext();
  const { addTask } = useTaskContext();

  // Helper function to calculate the next due date (replace with actual logic)
  const getNextGSTDueDate = () => {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 20);
    return nextMonth;
  };

  const getNextTDSDueDate = () => {
    const now = new Date();
    let quarterEndMonth = Math.floor(now.getMonth() / 3) * 3 + 2; // 2, 5, 8, 11
    let nextDueDate = new Date(now.getFullYear(), quarterEndMonth + 1, 31); // Add one to quarterEndMonth to get the next month

    // If the current month is December, move to the next year
    if (quarterEndMonth === 11) {
      nextDueDate = new Date(now.getFullYear() + 1, 1, 31);
    }

    return nextDueDate;
  };

  const getNextITDueDate = () => {
    const now = new Date();
    const nextITDueDate = new Date(now.getFullYear() + 1, 6, 31); // July 31st of next year
    return nextITDueDate;
  };

  const getNextAuditDueDate = () => {
    const now = new Date();
    const nextAuditDueDate = new Date(now.getFullYear() + 1, 8, 30); // September 30th of next year
    return nextAuditDueDate;
  };

  const getNextCompanyComplianceDueDate = () => {
    const now = new Date();
    const nextComplianceDueDate = new Date(now.getFullYear() + 1, 9, 30); // October 30th of next year
    return nextComplianceDueDate;
  };

  const scheduleGSTFilingTasks = useCallback((client: Client) => {
    if (!client.isGSTRegistered || !client.gstin) return;

    const gstTask = {
      title: `GST Filing for ${client.name}`,
      description: `Monthly GST return filing for GSTIN: ${client.gstin}`,
      clientId: client.id,
      clientName: client.name,
      status: 'todo' as const,
      priority: 'high' as const,
      dueDate: getNextGSTDueDate(),
      tags: ['GST', 'Compliance', 'Monthly'],
      recurrence: 'monthly' as const,
      updatedAt: new Date(),
      subtasks: []
    };

    addTask(gstTask);
  }, [addTask]);

  const scheduleTDSFilingTasks = useCallback((client: Client) => {
    if (!client.tan) return;

    const tdsTask = {
      title: `TDS Filing for ${client.name}`,
      description: `Quarterly TDS return filing for TAN: ${client.tan}`,
      clientId: client.id,
      clientName: client.name,
      status: 'todo' as const,
      priority: 'high' as const,
      dueDate: getNextTDSDueDate(),
      tags: ['TDS', 'Compliance', 'Quarterly'],
      recurrence: 'quarterly' as const,
      updatedAt: new Date(),
      subtasks: []
    };

    addTask(tdsTask);
  }, [addTask]);

  const scheduleIncomeTaxTasks = useCallback((client: Client) => {
    if (!client.pan) return;

    const itTask = {
      title: `Income Tax Filing for ${client.name}`,
      description: `Annual income tax return filing for PAN: ${client.pan}`,
      clientId: client.id,
      clientName: client.name,
      status: 'todo' as const,
      priority: 'high' as const,
      dueDate: getNextITDueDate(),
      tags: ['Income Tax', 'Compliance', 'Annual'],
      recurrence: 'yearly' as const,
      updatedAt: new Date(),
      subtasks: []
    };

    addTask(itTask);
  }, [addTask]);

  const scheduleAuditTasks = useCallback((client: Client) => {
    if (client.entityType !== 'Company' && client.entityType !== 'LLP') return;

    const auditTask = {
      title: `Statutory Audit for ${client.name}`,
      description: `Annual statutory audit for ${client.entityType}`,
      clientId: client.id,
      clientName: client.name,
      status: 'todo' as const,
      priority: 'high' as const,
      dueDate: getNextAuditDueDate(),
      tags: ['Audit', 'Compliance', 'Annual'],
      recurrence: 'quarterly' as const,
      updatedAt: new Date(),
      subtasks: []
    };

    addTask(auditTask);
  }, [addTask]);

  const scheduleCompanyComplianceTasks = useCallback((client: Client) => {
    if (client.entityType !== 'Company' || !client.cin) return;

    const complianceTask = {
      title: `Company Compliance for ${client.name}`,
      description: `Annual company compliance filing for CIN: ${client.cin}`,
      clientId: client.id,
      clientName: client.name,
      status: 'todo' as const,
      priority: 'high' as const,
      dueDate: getNextCompanyComplianceDueDate(),
      tags: ['Company', 'Compliance', 'Annual'],
      recurrence: 'yearly' as const,
      updatedAt: new Date(),
      subtasks: []
    };

    addTask(complianceTask);
  }, [addTask]);

  useEffect(() => {
    clients.forEach(client => {
      scheduleGSTFilingTasks(client);
      scheduleTDSFilingTasks(client);
      scheduleIncomeTaxTasks(client);
      scheduleAuditTasks(client);
      scheduleCompanyComplianceTasks(client);
    });
  }, [clients, scheduleGSTFilingTasks, scheduleTDSFilingTasks, scheduleIncomeTaxTasks, scheduleAuditTasks, scheduleCompanyComplianceTasks]);
};
