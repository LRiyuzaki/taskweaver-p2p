export type TaskStatus = 'todo' | 'inProgress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';
export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'halfYearly' | 'yearly';

export interface Client {
  id: string;
  name: string;
  email: string;
  company: string;
  createdAt: Date;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role?: string;
  avatar?: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  clientId?: string;
  createdAt: Date;
  color?: string;
  icon?: string; // Added icon property
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Date;
  createdAt: Date;
  tags: string[];
  clientId?: string;
  assignedTo?: string;
  assigneeName?: string; // Store the name for easier display
  projectId?: string;
  projectName?: string; // Store the project name for easier display
  recurrence: RecurrenceType;
  recurrenceEndDate?: Date;
}

export interface TaskColumn {
  id: TaskStatus;
  title: string;
  tasks: Task[];
}

export interface DragItem {
  id: string;
  status: TaskStatus;
  index: number;
}

export interface TaskCount {
  total: number;
  todo: number;
  inProgress: number;
  done: number;
  upcoming: number; // Tasks with future due dates
}

export interface SortOption {
  label: string;
  value: string;
}

export interface FilterOption {
  type: 'status' | 'priority' | 'assignee' | 'dueDate' | 'project';
  value: string;
}
