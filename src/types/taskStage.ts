
export interface TaskStage {
  id: string;
  name: string;
  order_position: number;
  color: string;
  is_default: boolean;
  created_at: string;
}

export interface TaskStageFormData {
  name: string;
  order_position: number;
  color: string;
  is_default: boolean;
}
