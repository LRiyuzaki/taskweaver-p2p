
export type TaskStatus = 'todo' | 'inProgress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Date;
  createdAt: Date;
  tags: string[];
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
