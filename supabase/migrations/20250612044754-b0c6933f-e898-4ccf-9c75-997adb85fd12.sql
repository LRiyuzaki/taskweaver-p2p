
-- Create ClientGroup table for family/entity grouping
CREATE TABLE IF NOT EXISTS public.client_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  group_type TEXT DEFAULT 'family' CHECK (group_type IN ('family', 'entity', 'business')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add client_group_id to clients table
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS client_group_id UUID REFERENCES public.client_groups(id),
ADD COLUMN IF NOT EXISTS profit_center TEXT,
ADD COLUMN IF NOT EXISTS cost_center TEXT,
ADD COLUMN IF NOT EXISTS default_team_id UUID;

-- Create enhanced permissions table for granular RBAC
CREATE TABLE IF NOT EXISTS public.user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  permission_type TEXT NOT NULL CHECK (permission_type IN ('admin', 'billing', 'delete', 'view_all', 'edit_all', 'client_management', 'task_management', 'compliance_management', 'document_management', 'reporting')),
  scope TEXT DEFAULT 'office' CHECK (scope IN ('personal', 'team', 'office')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create attendance table for team member tracking
CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_member_id UUID REFERENCES public.team_members(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'half_day', 'sick_leave', 'casual_leave', 'work_from_home')),
  hours_worked DECIMAL(4,2) DEFAULT 0,
  notes TEXT,
  marked_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_member_id, date)
);

-- Create WorkDone table with approval workflow
CREATE TABLE IF NOT EXISTS public.work_done (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  team_member_id UUID REFERENCES public.team_members(id) ON DELETE CASCADE,
  hours_worked DECIMAL(4,2) NOT NULL,
  description TEXT,
  date_worked DATE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  billable BOOLEAN DEFAULT true,
  hourly_rate DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create stages table for task lifecycle
CREATE TABLE IF NOT EXISTS public.task_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  order_position INTEGER NOT NULL,
  color TEXT DEFAULT '#3B82F6',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default task stages
INSERT INTO public.task_stages (name, order_position, color, is_default) VALUES
('Created', 1, '#6B7280', true),
('Going', 2, '#3B82F6', false),
('Stuck', 3, '#EF4444', false),
('Completed', 4, '#10B981', false),
('Verified', 5, '#8B5CF6', false)
ON CONFLICT DO NOTHING;

-- Add stage_id to tasks table
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS stage_id UUID REFERENCES public.task_stages(id),
ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS user_labels TEXT[] DEFAULT '{}';

-- Create labels table for custom labeling
CREATE TABLE IF NOT EXISTS public.labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  color TEXT DEFAULT '#3B82F6',
  category TEXT DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create task_labels junction table
CREATE TABLE IF NOT EXISTS public.task_labels (
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  label_id UUID REFERENCES public.labels(id) ON DELETE CASCADE,
  PRIMARY KEY (task_id, label_id)
);

-- Create file versions table for document versioning
CREATE TABLE IF NOT EXISTS public.file_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  uploaded_by UUID,
  upload_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add versioning fields to documents table
ALTER TABLE public.documents 
ADD COLUMN IF NOT EXISTS current_version INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS locked_by UUID,
ADD COLUMN IF NOT EXISTS mime_type TEXT;

-- Create reminders table
CREATE TABLE IF NOT EXISTS public.reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  related_entity_type TEXT NOT NULL CHECK (related_entity_type IN ('task', 'compliance', 'client', 'service')),
  related_entity_id UUID NOT NULL,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('deadline', 'follow_up', 'renewal', 'custom')),
  reminder_date TIMESTAMP WITH TIME ZONE NOT NULL,
  message TEXT,
  is_sent BOOLEAN DEFAULT false,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create compliance enhancements
ALTER TABLE public.client_compliance 
ADD COLUMN IF NOT EXISTS auto_generate_tasks BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS task_template_id UUID,
ADD COLUMN IF NOT EXISTS next_reminder_date TIMESTAMP WITH TIME ZONE;

-- Create todos table for checklist items
CREATE TABLE IF NOT EXISTS public.todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  is_completed BOOLEAN DEFAULT false,
  order_position INTEGER NOT NULL,
  assigned_to UUID,
  due_date DATE,
  completed_by UUID,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_client_groups_type ON public.client_groups(group_type);
CREATE INDEX IF NOT EXISTS idx_clients_group_id ON public.clients(client_group_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.attendance(date);
CREATE INDEX IF NOT EXISTS idx_attendance_team_member ON public.attendance(team_member_id);
CREATE INDEX IF NOT EXISTS idx_work_done_task ON public.work_done(task_id);
CREATE INDEX IF NOT EXISTS idx_work_done_team_member ON public.work_done(team_member_id);
CREATE INDEX IF NOT EXISTS idx_work_done_status ON public.work_done(status);
CREATE INDEX IF NOT EXISTS idx_tasks_stage ON public.tasks(stage_id);
CREATE INDEX IF NOT EXISTS idx_task_labels_task ON public.task_labels(task_id);
CREATE INDEX IF NOT EXISTS idx_task_labels_label ON public.task_labels(label_id);
CREATE INDEX IF NOT EXISTS idx_reminders_entity ON public.reminders(related_entity_type, related_entity_id);
CREATE INDEX IF NOT EXISTS idx_reminders_date ON public.reminders(reminder_date);
CREATE INDEX IF NOT EXISTS idx_todos_task ON public.todos(task_id);

-- Enable RLS on new tables
ALTER TABLE public.client_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_done ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies (can be refined later)
CREATE POLICY "Users can view their team's client groups" ON public.client_groups FOR SELECT USING (true);
CREATE POLICY "Users can manage their team's client groups" ON public.client_groups FOR ALL USING (true);

CREATE POLICY "Users can view attendance records" ON public.attendance FOR SELECT USING (true);
CREATE POLICY "Users can manage attendance records" ON public.attendance FOR ALL USING (true);

CREATE POLICY "Users can view work done records" ON public.work_done FOR SELECT USING (true);
CREATE POLICY "Users can manage their work done records" ON public.work_done FOR ALL USING (true);

CREATE POLICY "Users can view task stages" ON public.task_stages FOR SELECT USING (true);
CREATE POLICY "Admins can manage task stages" ON public.task_stages FOR ALL USING (true);

CREATE POLICY "Users can view labels" ON public.labels FOR SELECT USING (true);
CREATE POLICY "Users can manage labels" ON public.labels FOR ALL USING (true);

CREATE POLICY "Users can manage task labels" ON public.task_labels FOR ALL USING (true);

CREATE POLICY "Users can view file versions" ON public.file_versions FOR SELECT USING (true);
CREATE POLICY "Users can manage file versions" ON public.file_versions FOR ALL USING (true);

CREATE POLICY "Users can view reminders" ON public.reminders FOR SELECT USING (true);
CREATE POLICY "Users can manage reminders" ON public.reminders FOR ALL USING (true);

CREATE POLICY "Users can view todos" ON public.todos FOR SELECT USING (true);
CREATE POLICY "Users can manage todos" ON public.todos FOR ALL USING (true);

-- Update trigger for updated_at fields
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_client_groups_updated_at BEFORE UPDATE ON public.client_groups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_attendance_updated_at BEFORE UPDATE ON public.attendance FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_work_done_updated_at BEFORE UPDATE ON public.work_done FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
