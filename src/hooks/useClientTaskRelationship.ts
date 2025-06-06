import { useMemo } from 'react';
import { useTaskContext } from '@/contexts/TaskContext';
import { useClientContext } from '@/contexts/ClientContext';
import { Task } from '@/types/task';
import { Client } from '@/types/client';

export interface ClientTaskSummary {
  client: Client;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  upcomingTasks: number;
  activeTasks: number;
}

export const useClientTaskRelationship = () => {
  const { tasks, updateTask, createTask } = useTaskContext();
  const { clients } = useClientContext();

  // Get tasks for a specific client
  const getClientTasks = (clientId: string): Task[] => {
    return tasks.filter(task => task.clientId === clientId);
  };

  // Get client summary with task statistics
  const getClientTaskSummary = (clientId: string): ClientTaskSummary | null => {
    const client = clients.find(c => c.id === clientId);
    if (!client) return null;

    const clientTasks = getClientTasks(clientId);
    const now = new Date();

    const completedTasks = clientTasks.filter(task => task.status === 'done').length;
    const pendingTasks = clientTasks.filter(task => task.status !== 'done').length;
    const overdueTasks = clientTasks.filter(task => 
      task.status !== 'done' && 
      task.dueDate && 
      new Date(task.dueDate) < now
    ).length;
    const upcomingTasks = clientTasks.filter(task => 
      task.status !== 'done' && 
      task.dueDate && 
      new Date(task.dueDate) >= now &&
      new Date(task.dueDate) <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // Next 7 days
    ).length;
    const activeTasks = clientTasks.filter(task => 
      task.status === 'inProgress' || task.status === 'review'
    ).length;

    return {
      client,
      totalTasks: clientTasks.length,
      completedTasks,
      pendingTasks,
      overdueTasks,
      upcomingTasks,
      activeTasks
    };
  };

  // Get all clients with their task summaries
  const getAllClientTaskSummaries = (): ClientTaskSummary[] => {
    return clients.map(client => getClientTaskSummary(client.id)).filter(Boolean) as ClientTaskSummary[];
  };

  // Create a task for a specific client
  const createClientTask = async (clientId: string, taskData: Partial<Task>): Promise<string> => {
    const client = clients.find(c => c.id === clientId);
    if (!client) {
      throw new Error('Client not found');
    }

    return createTask({
      ...taskData,
      clientId,
      clientName: client.name
    } as Partial<Task>);
  };

  // Assign existing task to client
  const assignTaskToClient = async (taskId: string, clientId: string): Promise<void> => {
    const client = clients.find(c => c.id === clientId);
    if (!client) {
      throw new Error('Client not found');
    }

    await updateTask(taskId, {
      clientId,
      clientName: client.name
    });
  };

  // Remove client assignment from task
  const unassignTaskFromClient = async (taskId: string): Promise<void> => {
    await updateTask(taskId, {
      clientId: undefined,
      clientName: undefined
    });
  };

  // Get tasks without client assignments
  const getUnassignedTasks = (): Task[] => {
    return tasks.filter(task => !task.clientId);
  };

  // Get clients without any tasks
  const getClientsWithoutTasks = (): Client[] => {
    const clientsWithTasks = new Set(tasks.map(task => task.clientId).filter(Boolean));
    return clients.filter(client => !clientsWithTasks.has(client.id));
  };

  // Task completion statistics
  const getTaskCompletionStats = () => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'done').length;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    return {
      totalTasks,
      completedTasks,
      pendingTasks: totalTasks - completedTasks,
      completionRate
    };
  };

  // Get task statistics for a specific client
  const getClientTaskStats = (clientId: string) => {
    const clientTasks = tasks.filter(task => task.clientId === clientId);
    const completedTasks = clientTasks.filter(task => task.status === 'done');
    const inProgressTasks = clientTasks.filter(task => task.status === 'in-progress');
    const todoTasks = clientTasks.filter(task => task.status === 'todo');
    
    return {
      total: clientTasks.length,
      completed: completedTasks.length,
      inProgress: inProgressTasks.length,
      todo: todoTasks.length,
      completionRate: clientTasks.length > 0 ? Math.round((completedTasks.length / clientTasks.length) * 100) : 0
    };
  };

  return {
    getClientTasks,
    getClientTaskSummary,
    getAllClientTaskSummaries,
    createClientTask,
    assignTaskToClient,
    unassignTaskFromClient,
    getUnassignedTasks,
    getClientsWithoutTasks,
    getTaskCompletionStats
  };
};
