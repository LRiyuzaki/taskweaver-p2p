
export type TaskStatus = 'todo' | 'inProgress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';
export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'halfYearly' | 'yearly';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Date;
  createdAt: Date;
  updatedAt?: Date;
  completedDate?: Date; // This was missing but referenced in ClientTimeline
  assignedTo?: string;
  assigneeName?: string;
  clientId?: string;
  clientName?: string;
  projectId?: string;
  projectName?: string;
  tags: string[];
  recurrence: RecurrenceType;
  recurrenceEndDate?: Date;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  clientId?: string;
  clientName?: string;
  status: 'active' | 'completed' | 'onHold';
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  color?: string; // Adding color for project visual distinction
  icon?: string; // Adding icon for project visual distinction
}

export interface TaskCount {
  total: number;
  todo: number;
  inProgress: number;
  done: number;
  upcoming: number;
}

export interface SortOption {
  label: string;
  value: string;
}

export interface FilterOption {
  type: string;
  value: string;
}
