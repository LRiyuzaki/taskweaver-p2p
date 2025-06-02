
import { supabase } from '@/integrations/supabase/client';
import { Task } from '@/types/task';
import { Client } from '@/types/client';

// Enhanced service interfaces matching the new schema
export interface TeamUser {
  user_id: string;
  team_id: string;
  auth_user_id: string;
  full_name: string;
  email: string;
  role: 'admin' | 'manager' | 'staff';
  cost_rate?: number;
  billing_rate?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TeamService {
  service_id: string;
  team_id: string;
  name: string;
  description?: string;
  standard_time_hours?: number;
  requires_review: boolean;
  is_compliance_service: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClientServiceEnhanced {
  client_service_id: string;
  client_id: string;
  service_id: string;
  is_active: boolean;
  engagement_fee?: number;
  fee_cycle: 'monthly' | 'quarterly' | 'annually' | 'one_time';
  start_date: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
}

export interface ComplianceType {
  compliance_type_id: string;
  team_id: string;
  name: string;
  description?: string;
  typical_duration_months: number;
  renewal_notice_days: number;
  created_at: string;
}

export interface ClientCompliance {
  client_compliance_id: string;
  client_id: string;
  compliance_type_id: string;
  status: 'active' | 'expired' | 'expiring_soon';
  issue_date?: string;
  expiry_date: string;
  renewal_task_created: boolean;
  created_at: string;
  updated_at: string;
}

export interface TimeEntryEnhanced {
  time_entry_id: string;
  task_id: string;
  user_id: string;
  status: 'running' | 'logged';
  start_time: string;
  end_time?: string;
  total_logged_seconds: number;
  billable_seconds: number;
  hourly_rate?: number;
  notes?: string;
  created_at: string;
}

export interface KPISummary {
  total_active_clients: number;
  total_open_tasks: number;
  total_hours_logged_this_month: number;
  compliance_items_expiring_soon: number;
  revenue_this_month: number;
  tasks_completed_this_month: number;
  average_task_completion_time: number;
  team_utilization_rate: number;
}

// Enhanced API service class
export class EnhancedSupabaseService {
  // =============================================
  // CLIENTS API
  // =============================================
  
  async getAllClients(): Promise<Client[]> {
    const { data, error } = await supabase
      .from('clients')
      .select(`
        *,
        client_services_enhanced (
          *,
          team_services (*)
        ),
        client_compliance (
          *,
          compliance_types (*)
        )
      `)
      .eq('client_status', 'active')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async getClientById(id: string): Promise<Client | null> {
    const { data, error } = await supabase
      .from('clients')
      .select(`
        *,
        client_services_enhanced (
          *,
          team_services (*)
        ),
        client_compliance (
          *,
          compliance_types (*)
        ),
        tasks (
          id,
          title,
          status,
          priority,
          due_date,
          created_at
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  async createClient(client: Omit<Client, 'id' | 'createdAt'>): Promise<Client> {
    const { data, error } = await supabase
      .from('clients')
      .insert({
        name: client.name,
        email: client.email,
        phone: client.phone,
        company: client.company,
        business_name: client.company,
        address: client.address,
        abn: client.abn,
        registration_date: client.gstRegistrationDate?.toISOString().split('T')[0],
        entity_type: client.entityType,
        status: client.active ? 'active' : 'inactive',
        client_status: 'active',
        notes: client.notes,
        whatsapp_number: client.whatsappNumber,
        preferred_contact_method: client.preferredContactMethod
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // =============================================
  // TASKS API
  // =============================================
  
  async getAllTasks(filters?: {
    status?: string;
    assignee_id?: string;
    due_date?: string;
  }): Promise<Task[]> {
    let query = supabase
      .from('tasks')
      .select(`
        *,
        clients (name, company),
        team_services (name),
        task_assignments (
          *,
          team_users (full_name, email)
        ),
        subtasks (*)
      `)
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    
    if (filters?.due_date) {
      query = query.lte('due_date', filters.due_date);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  }

  async createTask(task: Omit<Task, 'id' | 'createdAt'>): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        due_date: task.dueDate?.toISOString().split('T')[0],
        client_id: task.clientId,
        service_id: task.projectId, // Map to service_id
        budgeted_minutes: task.timeSpentMinutes,
        recurring_rule: task.recurrence !== 'none' ? task.recurrence : null,
        requires_review: task.requiresReview,
        review_status: task.reviewStatus,
        comments: task.comments,
        tags: task.tags || []
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateTaskStatus(taskId: string, status: string): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .update({ 
        status,
        updated_at: new Date().toISOString(),
        completed_at: status === 'done' ? new Date().toISOString() : null
      })
      .eq('id', taskId);
    
    if (error) throw error;
  }

  // =============================================
  // DASHBOARD KPI API
  // =============================================
  
  async getKPISummary(): Promise<KPISummary> {
    // Get current month boundaries
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Total active clients
    const { count: totalActiveClients } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true })
      .eq('client_status', 'active');

    // Total open tasks
    const { count: totalOpenTasks } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .neq('status', 'done');

    // Total hours logged this month
    const { data: timeEntries } = await supabase
      .from('time_entries_enhanced')
      .select('total_logged_seconds')
      .gte('start_time', startOfMonth.toISOString())
      .lte('start_time', endOfMonth.toISOString());

    const totalSecondsThisMonth = timeEntries?.reduce((sum, entry) => 
      sum + (entry.total_logged_seconds || 0), 0) || 0;
    const totalHoursThisMonth = Math.round(totalSecondsThisMonth / 3600 * 100) / 100;

    // Compliance items expiring soon
    const { count: complianceExpiringSoon } = await supabase
      .from('client_compliance')
      .select('*', { count: 'exact', head: true })
      .in('status', ['expiring_soon', 'expired']);

    // Tasks completed this month
    const { count: tasksCompletedThisMonth } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'done')
      .gte('completed_at', startOfMonth.toISOString())
      .lte('completed_at', endOfMonth.toISOString());

    return {
      total_active_clients: totalActiveClients || 0,
      total_open_tasks: totalOpenTasks || 0,
      total_hours_logged_this_month: totalHoursThisMonth,
      compliance_items_expiring_soon: complianceExpiringSoon || 0,
      revenue_this_month: 0, // To be calculated based on billable hours
      tasks_completed_this_month: tasksCompletedThisMonth || 0,
      average_task_completion_time: 0, // To be calculated
      team_utilization_rate: 0 // To be calculated
    };
  }

  // =============================================
  // COMPLIANCE API
  // =============================================
  
  async getExpiringCompliance(): Promise<ClientCompliance[]> {
    const { data, error } = await supabase
      .from('client_compliance')
      .select(`
        *,
        clients (name, company),
        compliance_types (name, description)
      `)
      .in('status', ['expiring_soon', 'expired'])
      .order('expiry_date', { ascending: true });
    
    if (error) throw error;
    return data || [];
  }

  // =============================================
  // TEAM SERVICES API
  // =============================================
  
  async getTeamServices(): Promise<TeamService[]> {
    const { data, error } = await supabase
      .from('team_services')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  }

  async createTeamService(service: Omit<TeamService, 'service_id' | 'created_at' | 'updated_at'>): Promise<TeamService> {
    const { data, error } = await supabase
      .from('team_services')
      .insert(service)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
}

// Export singleton instance
export const enhancedSupabaseService = new EnhancedSupabaseService();
