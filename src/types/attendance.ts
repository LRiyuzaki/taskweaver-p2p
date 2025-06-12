
export type AttendanceStatus = 'present' | 'absent' | 'half_day' | 'sick_leave' | 'casual_leave' | 'work_from_home';

export interface Attendance {
  id: string;
  team_member_id: string;
  date: string;
  status: AttendanceStatus;
  hours_worked: number;
  notes?: string;
  marked_by?: string;
  created_at: string;
  updated_at: string;
}

export interface AttendanceFormData {
  team_member_id: string;
  date: string;
  status: AttendanceStatus;
  hours_worked: number;
  notes?: string;
}
