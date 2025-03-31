
export type TaskStatus = 'todo' | 'inProgress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Client {
  id: string;
  name: string;
  email: string;
  company: string;
  createdAt: Date;
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
