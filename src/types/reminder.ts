
export type ReminderEntityType = 'task' | 'compliance' | 'client' | 'service';
export type ReminderType = 'deadline' | 'follow_up' | 'renewal' | 'custom';

export interface Reminder {
  id: string;
  related_entity_type: ReminderEntityType;
  related_entity_id: string;
  reminder_type: ReminderType;
  reminder_date: string;
  message?: string;
  is_sent: boolean;
  created_by?: string;
  created_at: string;
}

export interface ReminderFormData {
  related_entity_type: ReminderEntityType;
  related_entity_id: string;
  reminder_type: ReminderType;
  reminder_date: string;
  message?: string;
}
