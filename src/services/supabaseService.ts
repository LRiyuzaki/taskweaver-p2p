
import { supabase } from '@/integrations/supabase/client';
import { Task, TaskStatus, TaskPriority } from '@/types/task';
import { Client } from '@/types/client';

// Client Services
export const clientService = {
  async getAll() {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(client: Omit<Client, 'id' | 'createdAt'>) {
    const { data, error } = await supabase
      .from('clients')
      .insert({
        name: client.name,
        email: client.email,
        phone: client.phone,
        company: client.company,
        address: client.address,
        city: client.city,
        state: client.state,
        postal_code: client.postalCode,
        country: client.country,
        abn: client.abn,
        registration_date: client.registrationDate,
        entity_type: client.entityType,
        status: client.status,
        notes: client.notes,
        whatsapp_number: client.whatsappNumber,
        preferred_contact_method: client.preferredContactMethod
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Client>) {
    const { data, error } = await supabase
      .from('clients')
      .update({
        name: updates.name,
        email: updates.email,
        phone: updates.phone,
        company: updates.company,
        address: updates.address,
        city: updates.city,
        state: updates.state,
        postal_code: updates.postalCode,
        country: updates.country,
        abn: updates.abn,
        registration_date: updates.registrationDate,
        entity_type: updates.entityType,
        status: updates.status,
        notes: updates.notes,
        whatsapp_number: updates.whatsappNumber,
        preferred_contact_method: updates.preferredContactMethod
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Task Services
export const taskService = {
  async getAll() {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        client:clients(name),
        project:projects(name),
        assignee:team_members(name),
        subtasks(*)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Transform data to match our Task interface
    return data?.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status as TaskStatus,
      priority: task.priority as TaskPriority,
      dueDate: task.due_date,
      assigneeId: task.assigned_to,
      assigneeName: task.assignee?.name,
      clientId: task.client_id,
      clientName: task.client?.name,
      projectId: task.project_id,
      projectName: task.project?.name,
      tags: task.tags || [],
      recurrence: task.recurrence || 'none',
      recurrenceEndDate: task.recurrence_end_date,
      timeSpentMinutes: task.time_spent_minutes || 0,
      requiresReview: task.requires_review || false,
      reviewStatus: task.review_status,
      reviewerId: task.reviewer_id,
      comments: task.comments,
      createdAt: task.created_at,
      startedAt: task.started_at,
      completedAt: task.completed_at,
      subtasks: task.subtasks?.map(subtask => ({
        id: subtask.id,
        title: subtask.title,
        description: subtask.description,
        completed: subtask.completed,
        orderPosition: subtask.order_position
      })) || []
    })) || [];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        client:clients(name),
        project:projects(name),
        assignee:team_members(name),
        subtasks(*)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    // Transform data to match our Task interface
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      status: data.status as TaskStatus,
      priority: data.priority as TaskPriority,
      dueDate: data.due_date,
      assigneeId: data.assigned_to,
      assigneeName: data.assignee?.name,
      clientId: data.client_id,
      clientName: data.client?.name,
      projectId: data.project_id,
      projectName: data.project?.name,
      tags: data.tags || [],
      recurrence: data.recurrence || 'none',
      recurrenceEndDate: data.recurrence_end_date,
      timeSpentMinutes: data.time_spent_minutes || 0,
      requiresReview: data.requires_review || false,
      reviewStatus: data.review_status,
      reviewerId: data.reviewer_id,
      comments: data.comments,
      createdAt: data.created_at,
      startedAt: data.started_at,
      completedAt: data.completed_at,
      subtasks: data.subtasks?.map(subtask => ({
        id: subtask.id,
        title: subtask.title,
        description: subtask.description,
        completed: subtask.completed,
        orderPosition: subtask.order_position
      })) || []
    };
  },

  async create(task: Omit<Task, 'id' | 'createdAt'>) {
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        due_date: task.dueDate,
        assigned_to: task.assigneeId,
        client_id: task.clientId,
        project_id: task.projectId,
        tags: task.tags,
        recurrence: task.recurrence,
        recurrence_end_date: task.recurrenceEndDate,
        requires_review: task.requiresReview,
        comments: task.comments
      })
      .select()
      .single();
    
    if (error) throw error;

    // Create subtasks if provided
    if (task.subtasks && task.subtasks.length > 0) {
      const subtaskInserts = task.subtasks.map(subtask => ({
        task_id: data.id,
        title: subtask.title,
        description: subtask.description,
        completed: subtask.completed,
        order_position: subtask.orderPosition
      }));

      const { error: subtaskError } = await supabase
        .from('subtasks')
        .insert(subtaskInserts);
      
      if (subtaskError) throw subtaskError;
    }
    
    return data;
  },

  async update(id: string, updates: Partial<Task>) {
    const { data, error } = await supabase
      .from('tasks')
      .update({
        title: updates.title,
        description: updates.description,
        status: updates.status,
        priority: updates.priority,
        due_date: updates.dueDate,
        assigned_to: updates.assigneeId,
        client_id: updates.clientId,
        project_id: updates.projectId,
        tags: updates.tags,
        recurrence: updates.recurrence,
        recurrence_end_date: updates.recurrenceEndDate,
        requires_review: updates.requiresReview,
        review_status: updates.reviewStatus,
        reviewer_id: updates.reviewerId,
        comments: updates.comments,
        time_spent_minutes: updates.timeSpentMinutes,
        started_at: updates.startedAt,
        completed_at: updates.completedAt
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;

    // Update subtasks if provided
    if (updates.subtasks) {
      // Delete existing subtasks
      await supabase
        .from('subtasks')
        .delete()
        .eq('task_id', id);

      // Insert new subtasks
      if (updates.subtasks.length > 0) {
        const subtaskInserts = updates.subtasks.map(subtask => ({
          task_id: id,
          title: subtask.title,
          description: subtask.description,
          completed: subtask.completed,
          order_position: subtask.orderPosition
        }));

        const { error: subtaskError } = await supabase
          .from('subtasks')
          .insert(subtaskInserts);
        
        if (subtaskError) throw subtaskError;
      }
    }
    
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async deleteMultiple(ids: string[]) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .in('id', ids);
    
    if (error) throw error;
  }
};

// Team Member Services
export const teamMemberService = {
  async getAll() {
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  },

  async create(member: { name: string; email: string; role: string }) {
    const { data, error } = await supabase
      .from('team_members')
      .insert(member)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// Project Services
export const projectService = {
  async getAll() {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        client:clients(name)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async create(project: {
    name: string;
    description?: string;
    client_id?: string;
    status?: string;
    start_date?: string;
    end_date?: string;
    color?: string;
    icon?: string;
  }) {
    const { data, error } = await supabase
      .from('projects')
      .insert(project)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Service Services
export const serviceService = {
  async getAll() {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  },

  async create(service: {
    name: string;
    description?: string;
    standard_time_hours?: number;
    requires_review?: boolean;
  }) {
    const { data, error } = await supabase
      .from('services')
      .insert(service)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};
