
export type TaskStatus = 'todo' | 'inProgress' | 'review' | 'done';
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
  completedDate?: Date;
  startedAt?: Date; // When the task was started
  timeSpentMinutes?: number; // Time tracking in minutes
  assignedTo?: string;
  assigneeName?: string;
  clientId?: string;
  clientName?: string;
  projectId?: string;
  projectName?: string;
  serviceId?: string;
  serviceName?: string;
  requiresReview?: boolean;
  reviewerId?: string;
  reviewerName?: string;
  reviewStatus?: 'pending' | 'approved' | 'rejected';
  comments?: string; // Comments on the task
  tags: string[];
  recurrence: RecurrenceType;
  recurrenceEndDate?: Date;
  subtasks?: TaskSubtask[];
}

export interface TaskSubtask {
  id: string;
  taskId: string;
  title: string;
  description?: string;
  completed: boolean;
  orderPosition: number;
  createdAt: Date;
  completedAt?: Date;
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
  review: number; // Added review to task count
  done: number;
  upcoming: number;
}

export interface ServiceInfo {
  id: string;
  name: string;
  description?: string;
  standardTimeHours?: number;
  requiresReview: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Add missing types for TaskListView
export interface SortOption {
  label: string;
  value: string;
}

export interface FilterOption {
  type: string;
  value: string;
}
