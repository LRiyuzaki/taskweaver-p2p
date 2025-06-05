
export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';
export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  completedDate?: Date; // For backward compatibility
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
  comments?: string;
  tags: string[];
  recurrence: RecurrenceType;
  recurrenceEndDate?: Date;
  subtasks: string[];
  timeSpentMinutes?: number;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  clientId?: string;
  clientName?: string;
  status: 'active' | 'completed' | 'on-hold';
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  color?: string;
  icon?: string;
}

export interface TaskTemplate {
  id: string;
  name: string;
  description?: string;
  subtasks: Omit<SubTask, 'id' | 'taskId'>[];
  category?: string;
}

export interface SubTask {
  id: string;
  taskId: string;
  title: string;
  description?: string;
  completed: boolean;
  order: number;
  orderPosition: number; // Alias for order
  assignedTo?: string;
  assigneeName?: string;
}

// Additional types for components
export interface TaskCount {
  total: number;
  completed: number;
  inProgress: number;
  todo: number;
  review: number;
  done: number;
  upcoming: number;
}

export interface SortOption {
  value: string;
  label: string;
}

export interface FilterOption {
  value: string;
  label: string;
  type: string;
}

// Export alias for backward compatibility
export type TaskSubtask = SubTask;
