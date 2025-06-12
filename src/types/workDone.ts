
export type WorkDoneStatus = 'pending' | 'approved' | 'rejected';

export interface WorkDone {
  id: string;
  task_id: string;
  team_member_id: string;
  hours_worked: number;
  description?: string;
  date_worked: string;
  status: WorkDoneStatus;
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
  billable: boolean;
  hourly_rate?: number;
  created_at: string;
  updated_at: string;
}

export interface WorkDoneFormData {
  task_id: string;
  hours_worked: number;
  description?: string;
  date_worked: string;
  billable: boolean;
  hourly_rate?: number;
}
