
import { useState, useEffect } from 'react';
import { taskService, clientService, teamMemberService, projectService, serviceService } from '@/services/supabaseService';
import { Task } from '@/types/task';
import { Client } from '@/types/client';

export const useSupabaseIntegration = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState<'pending' | 'in-progress' | 'completed' | 'error'>('pending');

  // Function to migrate localStorage data to Supabase
  const migrateLocalStorageData = async () => {
    try {
      setMigrationStatus('in-progress');
      
      // Migrate tasks
      const localTasks = localStorage.getItem('tasks');
      if (localTasks) {
        const tasks: Task[] = JSON.parse(localTasks);
        console.log(`Migrating ${tasks.length} tasks to Supabase...`);
        
        for (const task of tasks) {
          try {
            await taskService.create({
              title: task.title,
              description: task.description,
              status: task.status,
              priority: task.priority,
              dueDate: task.dueDate,
              assigneeId: task.assigneeId,
              assigneeName: task.assigneeName,
              clientId: task.clientId,
              clientName: task.clientName,
              projectId: task.projectId,
              projectName: task.projectName,
              tags: task.tags || [],
              recurrence: task.recurrence || 'none',
              recurrenceEndDate: task.recurrenceEndDate,
              timeSpentMinutes: task.timeSpentMinutes,
              requiresReview: task.requiresReview,
              reviewStatus: task.reviewStatus,
              reviewerId: task.reviewerId,
              comments: task.comments,
              startedAt: task.startedAt,
              completedAt: task.completedAt,
              subtasks: task.subtasks || []
            });
          } catch (taskError) {
            console.error('Error migrating task:', task.title, taskError);
          }
        }
        
        // Backup and clear localStorage tasks
        localStorage.setItem('tasks_backup', localTasks);
        localStorage.removeItem('tasks');
      }

      // Migrate clients
      const localClients = localStorage.getItem('clients');
      if (localClients) {
        const clients: Client[] = JSON.parse(localClients);
        console.log(`Migrating ${clients.length} clients to Supabase...`);
        
        for (const client of clients) {
          try {
            await clientService.create({
              name: client.name,
              email: client.email,
              phone: client.phone,
              company: client.company,
              address: client.address,
              city: client.city,
              state: client.state,
              postalCode: client.postalCode,
              country: client.country,
              abn: client.abn,
              registrationDate: client.registrationDate,
              entityType: client.entityType,
              status: client.status,
              notes: client.notes,
              whatsappNumber: client.whatsappNumber,
              preferredContactMethod: client.preferredContactMethod
            });
          } catch (clientError) {
            console.error('Error migrating client:', client.name, clientError);
          }
        }
        
        // Backup and clear localStorage clients
        localStorage.setItem('clients_backup', localClients);
        localStorage.removeItem('clients');
      }

      // Migrate team members if exists
      const localTeamMembers = localStorage.getItem('teamMembers');
      if (localTeamMembers) {
        const teamMembers = JSON.parse(localTeamMembers);
        console.log(`Migrating ${teamMembers.length} team members to Supabase...`);
        
        for (const member of teamMembers) {
          try {
            await teamMemberService.create(member);
          } catch (memberError) {
            console.error('Error migrating team member:', member.name, memberError);
          }
        }
        
        localStorage.setItem('teamMembers_backup', localTeamMembers);
        localStorage.removeItem('teamMembers');
      }

      setMigrationStatus('completed');
      console.log('Data migration completed successfully');
      
    } catch (error) {
      console.error('Migration failed:', error);
      setMigrationStatus('error');
      throw error;
    }
  };

  // Check if data migration is needed
  const checkMigrationNeeded = () => {
    const hasLocalTasks = localStorage.getItem('tasks') !== null;
    const hasLocalClients = localStorage.getItem('clients') !== null;
    const hasLocalTeamMembers = localStorage.getItem('teamMembers') !== null;
    
    return hasLocalTasks || hasLocalClients || hasLocalTeamMembers;
  };

  // Initialize Supabase integration
  const initializeSupabase = async () => {
    try {
      if (checkMigrationNeeded()) {
        await migrateLocalStorageData();
      }
      
      setIsInitialized(true);
      console.log('Supabase integration initialized');
      
    } catch (error) {
      console.error('Failed to initialize Supabase integration:', error);
      setMigrationStatus('error');
    }
  };

  useEffect(() => {
    // Auto-initialize on mount
    initializeSupabase();
  }, []);

  return {
    isInitialized,
    migrationStatus,
    initializeSupabase,
    migrateLocalStorageData,
    checkMigrationNeeded
  };
};
