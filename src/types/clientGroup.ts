
export interface ClientGroup {
  id: string;
  name: string;
  description?: string;
  group_type: 'family' | 'entity' | 'business';
  created_at: string;
  updated_at: string;
}

export interface ClientGroupFormData {
  name: string;
  description?: string;
  group_type: 'family' | 'entity' | 'business';
}
