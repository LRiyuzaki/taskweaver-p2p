import { useEffect } from 'react';
import { useClientContext } from '@/contexts/ClientContext';
import { useTaskContext } from '@/contexts/TaskContext';
import { addMonths, addDays, startOfMonth, endOfMonth, isBefore } from 'date-fns';

export const useComplianceScheduler = () => {
  const { clients, clientServices, serviceTypes } = useClientContext();
  const { tasks, addTask } = useTaskContext();

  useEffect(() => {
    // Create or update compliance tasks for each client
    clients.forEach(client => {
      if (!client.active) return;

      // Schedule GST tasks if client is GST registered
      if (client.isGSTRegistered) {
        const nextGSTDate = new Date();
        nextGSTDate.setDate(client.statutoryDueDates?.gstReturn || 20);

        const existingGSTTask = tasks.find(task => 
          task.clientId === client.id && 
          task.tags.includes('GST') &&
          isBefore(startOfMonth(new Date()), task.dueDate || new Date()) &&
          isBefore(task.dueDate || new Date(), endOfMonth(new Date()))
        );

        if (!existingGSTTask) {
          addTask({
            title: `GST Filing - ${client.name}`,
            description: `Monthly GST return filing for ${client.name} (GSTIN: ${client.gstin})`,
            clientId: client.id,
            clientName: client.name,
            status: 'todo',
            priority: 'high',
            dueDate: nextGSTDate,
            tags: ['GST', 'Compliance', 'Monthly'],
            recurrence: 'monthly'
          });
        }
      }

      // Schedule TDS tasks if client has TAN
      if (client.tan) {
        const currentQuarter = Math.floor(new Date().getMonth() / 3);
        const quarterEndDate = addDays(
          addMonths(startOfMonth(new Date()), (currentQuarter + 1) * 3),
          -1
        );
        const tdsDueDate = addDays(quarterEndDate, client.statutoryDueDates?.tdsReturn || 7);

        const existingTDSTask = tasks.find(task => 
          task.clientId === client.id && 
          task.tags.includes('TDS') &&
          task.dueDate && 
          isBefore(quarterEndDate, task.dueDate)
        );

        if (!existingTDSTask) {
          addTask({
            title: `TDS Return - ${client.name}`,
            description: `Quarterly TDS return filing for ${client.name} (TAN: ${client.tan})`,
            clientId: client.id,
            clientName: client.name,
            status: 'todo',
            priority: 'high',
            dueDate: tdsDueDate,
            tags: ['TDS', 'Compliance', 'Quarterly'],
            recurrence: 'quarterly'
          });
        }
      }

      // Schedule Income Tax tasks based on fiscal year end
      const isCompany = client.entityType === 'Company';
      const isFYEndMarch = client.financialYearEnd === 'March';
      
      // For companies: Due date is October 31st (7 months after March)
      // For others: Due date is July 31st (4 months after March)
      const monthsAfterFYEnd = isCompany ? 7 : 4;
      
      const fyEndMonth = isFYEndMarch ? 2 : 11; // 2 for March, 11 for December
      const currentMonth = new Date().getMonth();
      
      // Only create task if we're in the filing period
      if (currentMonth >= fyEndMonth && currentMonth <= fyEndMonth + monthsAfterFYEnd) {
        const existingITRTask = tasks.find(task => 
          task.clientId === client.id && 
          task.tags.includes('Income Tax') &&
          task.dueDate &&
          task.dueDate.getFullYear() === new Date().getFullYear()
        );

        if (!existingITRTask) {
          const dueDate = new Date(
            new Date().getFullYear(),
            fyEndMonth + monthsAfterFYEnd,
            isFYEndMarch ? 31 : 30
          );

          addTask({
            title: `Income Tax Return - ${client.name}`,
            description: `Annual ITR filing for ${client.name} (PAN: ${client.pan})`,
            clientId: client.id,
            clientName: client.name,
            status: 'todo',
            priority: 'high',
            dueDate,
            tags: ['Income Tax', 'Compliance', 'Annual'],
            recurrence: 'yearly' // Changed from "annually" to "yearly"
          });
        }
      }

      // Schedule advance tax reminders if applicable
      if (client.statutoryDueDates?.advanceTax) {
        const quarters = ['q1', 'q2', 'q3', 'q4'];
        quarters.forEach(quarter => {
          const dueDate = client.statutoryDueDates?.advanceTax?.[quarter];
          if (!dueDate) return;

          const existingAdvTaxTask = tasks.find(task => 
            task.clientId === client.id && 
            task.tags.includes('Advance Tax') &&
            task.dueDate &&
            task.dueDate.getTime() === new Date(dueDate).getTime()
          );

          if (!existingAdvTaxTask && isBefore(new Date(), new Date(dueDate))) {
            addTask({
              title: `Advance Tax - ${client.name} (${quarter.toUpperCase()})`,
              description: `Advance tax payment due for ${quarter.toUpperCase()}`,
              clientId: client.id,
              clientName: client.name,
              status: 'todo',
              priority: 'high',
              dueDate: new Date(dueDate),
              tags: ['Advance Tax', 'Compliance', 'Quarterly'],
              recurrence: 'quarterly'
            });
          }
        });
      }

      // Schedule ROC compliance tasks for companies
      if (client.entityType === 'Company') {
        const aocDueDate = addMonths(
          new Date(new Date().getFullYear(), client.financialYearEnd === 'March' ? 2 : 11, 30),
          6
        );

        const existingROCTask = tasks.find(task => 
          task.clientId === client.id && 
          task.tags.includes('ROC') &&
          task.dueDate &&
          task.dueDate.getFullYear() === aocDueDate.getFullYear()
        );

        if (!existingROCTask && isBefore(new Date(), aocDueDate)) {
          addTask({
            title: `Annual ROC Filing - ${client.name}`,
            description: `Annual ROC compliance (AOC-4 and MGT-7) for ${client.name}`,
            clientId: client.id,
            clientName: client.name,
            status: 'todo',
            priority: 'high',
            dueDate: aocDueDate,
            tags: ['ROC', 'Compliance', 'Annual'],
            recurrence: 'yearly' // Changed from "annually" to "yearly"
          });
        }
      }
    });
  }, [clients, tasks]); // Re-run when clients or tasks change
};
