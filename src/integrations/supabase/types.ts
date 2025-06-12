export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      attendance: {
        Row: {
          created_at: string | null
          date: string
          hours_worked: number | null
          id: string
          marked_by: string | null
          notes: string | null
          status: string
          team_member_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          hours_worked?: number | null
          id?: string
          marked_by?: string | null
          notes?: string | null
          status: string
          team_member_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          hours_worked?: number | null
          id?: string
          marked_by?: string | null
          notes?: string | null
          status?: string
          team_member_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      client_compliance: {
        Row: {
          auto_generate_tasks: boolean | null
          client_compliance_id: string
          client_id: string
          compliance_type_id: string
          created_at: string | null
          expiry_date: string
          issue_date: string | null
          next_reminder_date: string | null
          renewal_task_created: boolean | null
          status: Database["public"]["Enums"]["compliance_status"] | null
          task_template_id: string | null
          updated_at: string | null
        }
        Insert: {
          auto_generate_tasks?: boolean | null
          client_compliance_id?: string
          client_id: string
          compliance_type_id: string
          created_at?: string | null
          expiry_date: string
          issue_date?: string | null
          next_reminder_date?: string | null
          renewal_task_created?: boolean | null
          status?: Database["public"]["Enums"]["compliance_status"] | null
          task_template_id?: string | null
          updated_at?: string | null
        }
        Update: {
          auto_generate_tasks?: boolean | null
          client_compliance_id?: string
          client_id?: string
          compliance_type_id?: string
          created_at?: string | null
          expiry_date?: string
          issue_date?: string | null
          next_reminder_date?: string | null
          renewal_task_created?: boolean | null
          status?: Database["public"]["Enums"]["compliance_status"] | null
          task_template_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_compliance_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_compliance_compliance_type_id_fkey"
            columns: ["compliance_type_id"]
            isOneToOne: false
            referencedRelation: "compliance_types"
            referencedColumns: ["compliance_type_id"]
          },
        ]
      }
      client_groups: {
        Row: {
          created_at: string | null
          description: string | null
          group_type: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          group_type?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          group_type?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      client_services: {
        Row: {
          client_id: string
          created_at: string | null
          end_date: string | null
          id: string
          notes: string | null
          renewal_date: string | null
          service_id: string
          start_date: string
          updated_at: string | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          end_date?: string | null
          id?: string
          notes?: string | null
          renewal_date?: string | null
          service_id: string
          start_date: string
          updated_at?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          end_date?: string | null
          id?: string
          notes?: string | null
          renewal_date?: string | null
          service_id?: string
          start_date?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_services_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      client_services_enhanced: {
        Row: {
          client_id: string
          client_service_id: string
          created_at: string | null
          end_date: string | null
          engagement_fee: number | null
          fee_cycle: Database["public"]["Enums"]["fee_cycle"] | null
          is_active: boolean | null
          service_id: string
          start_date: string
          updated_at: string | null
        }
        Insert: {
          client_id: string
          client_service_id?: string
          created_at?: string | null
          end_date?: string | null
          engagement_fee?: number | null
          fee_cycle?: Database["public"]["Enums"]["fee_cycle"] | null
          is_active?: boolean | null
          service_id: string
          start_date: string
          updated_at?: string | null
        }
        Update: {
          client_id?: string
          client_service_id?: string
          created_at?: string | null
          end_date?: string | null
          engagement_fee?: number | null
          fee_cycle?: Database["public"]["Enums"]["fee_cycle"] | null
          is_active?: boolean | null
          service_id?: string
          start_date?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_services_enhanced_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_services_enhanced_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "team_services"
            referencedColumns: ["service_id"]
          },
        ]
      }
      client_uploads: {
        Row: {
          client_id: string | null
          created_at: string
          id: string
          status: string
          updated_at: string | null
          upload_id: string
        }
        Insert: {
          client_id?: string | null
          created_at: string
          id?: string
          status: string
          updated_at?: string | null
          upload_id: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          id?: string
          status?: string
          updated_at?: string | null
          upload_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_uploads_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          abn: string | null
          address: string | null
          business_name: string | null
          city: string | null
          client_group_id: string | null
          client_status: string | null
          company: string | null
          cost_center: string | null
          country: string | null
          created_at: string
          default_team_id: string | null
          email: string
          entity_type: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          postal_code: string | null
          preferred_contact_method: string | null
          profit_center: string | null
          registration_date: string | null
          state: string | null
          status: string | null
          team_id: string | null
          whatsapp_number: string | null
        }
        Insert: {
          abn?: string | null
          address?: string | null
          business_name?: string | null
          city?: string | null
          client_group_id?: string | null
          client_status?: string | null
          company?: string | null
          cost_center?: string | null
          country?: string | null
          created_at?: string
          default_team_id?: string | null
          email: string
          entity_type?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          postal_code?: string | null
          preferred_contact_method?: string | null
          profit_center?: string | null
          registration_date?: string | null
          state?: string | null
          status?: string | null
          team_id?: string | null
          whatsapp_number?: string | null
        }
        Update: {
          abn?: string | null
          address?: string | null
          business_name?: string | null
          city?: string | null
          client_group_id?: string | null
          client_status?: string | null
          company?: string | null
          cost_center?: string | null
          country?: string | null
          created_at?: string
          default_team_id?: string | null
          email?: string
          entity_type?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          postal_code?: string | null
          preferred_contact_method?: string | null
          profit_center?: string | null
          registration_date?: string | null
          state?: string | null
          status?: string | null
          team_id?: string | null
          whatsapp_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_client_group_id_fkey"
            columns: ["client_group_id"]
            isOneToOne: false
            referencedRelation: "client_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["team_id"]
          },
        ]
      }
      compliance_schedules: {
        Row: {
          client_id: string | null
          created_at: string | null
          description: string | null
          due_date: string
          frequency: Database["public"]["Enums"]["recurrence_type"]
          id: string
          is_active: boolean | null
          name: string
          next_due_date: string | null
          service_id: string | null
          updated_at: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          description?: string | null
          due_date: string
          frequency: Database["public"]["Enums"]["recurrence_type"]
          id?: string
          is_active?: boolean | null
          name: string
          next_due_date?: string | null
          service_id?: string | null
          updated_at?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string
          frequency?: Database["public"]["Enums"]["recurrence_type"]
          id?: string
          is_active?: boolean | null
          name?: string
          next_due_date?: string | null
          service_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "compliance_schedules_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_schedules_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_types: {
        Row: {
          compliance_type_id: string
          created_at: string | null
          description: string | null
          name: string
          renewal_notice_days: number | null
          team_id: string
          typical_duration_months: number | null
        }
        Insert: {
          compliance_type_id?: string
          created_at?: string | null
          description?: string | null
          name: string
          renewal_notice_days?: number | null
          team_id: string
          typical_duration_months?: number | null
        }
        Update: {
          compliance_type_id?: string
          created_at?: string | null
          description?: string | null
          name?: string
          renewal_notice_days?: number | null
          team_id?: string
          typical_duration_months?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "compliance_types_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["team_id"]
          },
        ]
      }
      documents: {
        Row: {
          client_id: string | null
          created_at: string
          current_version: number | null
          form_data: Json | null
          id: string
          is_locked: boolean | null
          locked_by: string | null
          mime_type: string | null
          name: string
          status: string
          submission_status: string | null
          uploaded_at: string | null
          url: string | null
          whatsapp_link: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          current_version?: number | null
          form_data?: Json | null
          id?: string
          is_locked?: boolean | null
          locked_by?: string | null
          mime_type?: string | null
          name: string
          status: string
          submission_status?: string | null
          uploaded_at?: string | null
          url?: string | null
          whatsapp_link?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string
          current_version?: number | null
          form_data?: Json | null
          id?: string
          is_locked?: boolean | null
          locked_by?: string | null
          mime_type?: string | null
          name?: string
          status?: string
          submission_status?: string | null
          uploaded_at?: string | null
          url?: string | null
          whatsapp_link?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          description: string
          id: string
          order_id: string | null
          timestamp: string
          type: string
          user_id: string
        }
        Insert: {
          description: string
          id?: string
          order_id?: string | null
          timestamp?: string
          type: string
          user_id: string
        }
        Update: {
          description?: string
          id?: string
          order_id?: string | null
          timestamp?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      file_versions: {
        Row: {
          created_at: string | null
          document_id: string | null
          file_size: number | null
          file_url: string
          id: string
          upload_reason: string | null
          uploaded_by: string | null
          version_number: number
        }
        Insert: {
          created_at?: string | null
          document_id?: string | null
          file_size?: number | null
          file_url: string
          id?: string
          upload_reason?: string | null
          uploaded_by?: string | null
          version_number: number
        }
        Update: {
          created_at?: string | null
          document_id?: string | null
          file_size?: number | null
          file_url?: string
          id?: string
          upload_reason?: string | null
          uploaded_by?: string | null
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "file_versions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      form_submissions: {
        Row: {
          client_id: string | null
          document_id: string | null
          id: string
          submitted_at: string
          submitted_data: Json
          template_id: string | null
          whatsapp_number: string | null
        }
        Insert: {
          client_id?: string | null
          document_id?: string | null
          id?: string
          submitted_at?: string
          submitted_data: Json
          template_id?: string | null
          whatsapp_number?: string | null
        }
        Update: {
          client_id?: string | null
          document_id?: string | null
          id?: string
          submitted_at?: string
          submitted_data?: Json
          template_id?: string | null
          whatsapp_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "form_submissions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_submissions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_submissions_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "form_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      form_templates: {
        Row: {
          created_at: string
          fields: Json
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          fields: Json
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          fields?: Json
          id?: string
          name?: string
        }
        Relationships: []
      }
      labels: {
        Row: {
          category: string | null
          color: string | null
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          category?: string | null
          color?: string | null
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          category?: string | null
          color?: string | null
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          related_entity_id: string | null
          related_entity_type: string | null
          title: string
          type: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          title: string
          type?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          title?: string
          type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          assigned_to: string | null
          client_name: string
          created_at: string
          difficulty: string
          due_date: string
          id: string
          priority: string
          service_type: string
          status: string
          tags: string[] | null
        }
        Insert: {
          assigned_to?: string | null
          client_name: string
          created_at?: string
          difficulty: string
          due_date: string
          id?: string
          priority: string
          service_type: string
          status: string
          tags?: string[] | null
        }
        Update: {
          assigned_to?: string | null
          client_name?: string
          created_at?: string
          difficulty?: string
          due_date?: string
          id?: string
          priority?: string
          service_type?: string
          status?: string
          tags?: string[] | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          client_id: string | null
          color: string | null
          created_at: string | null
          description: string | null
          end_date: string | null
          icon: string | null
          id: string
          name: string
          start_date: string | null
          status: Database["public"]["Enums"]["project_status"] | null
          updated_at: string | null
        }
        Insert: {
          client_id?: string | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          icon?: string | null
          id?: string
          name: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"] | null
          updated_at?: string | null
        }
        Update: {
          client_id?: string | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          icon?: string | null
          id?: string
          name?: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      reminders: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          is_sent: boolean | null
          message: string | null
          related_entity_id: string
          related_entity_type: string
          reminder_date: string
          reminder_type: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_sent?: boolean | null
          message?: string | null
          related_entity_id: string
          related_entity_type: string
          reminder_date: string
          reminder_type: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_sent?: boolean | null
          message?: string | null
          related_entity_id?: string
          related_entity_type?: string
          reminder_date?: string
          reminder_type?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string | null
          created_by: string | null
          filters: Json | null
          id: string
          last_generated: string | null
          name: string
          schedule: Json | null
          type: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          filters?: Json | null
          id?: string
          last_generated?: string | null
          name: string
          schedule?: Json | null
          type: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          filters?: Json | null
          id?: string
          last_generated?: string | null
          name?: string
          schedule?: Json | null
          type?: string
        }
        Relationships: []
      }
      service_periods: {
        Row: {
          created_at: string | null
          due_days_offset: number | null
          is_active: boolean | null
          period_name: string
          service_id: string
          service_period_id: string
          trigger_day: number | null
          trigger_month: number | null
        }
        Insert: {
          created_at?: string | null
          due_days_offset?: number | null
          is_active?: boolean | null
          period_name: string
          service_id: string
          service_period_id?: string
          trigger_day?: number | null
          trigger_month?: number | null
        }
        Update: {
          created_at?: string | null
          due_days_offset?: number | null
          is_active?: boolean | null
          period_name?: string
          service_id?: string
          service_period_id?: string
          trigger_day?: number | null
          trigger_month?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "service_periods_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "team_services"
            referencedColumns: ["service_id"]
          },
        ]
      }
      services: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          requires_review: boolean | null
          standard_time_hours: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          requires_review?: boolean | null
          standard_time_hours?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          requires_review?: boolean | null
          standard_time_hours?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      subtasks: {
        Row: {
          completed: boolean
          completed_at: string | null
          created_at: string | null
          description: string | null
          id: string
          order_position: number
          task_id: string
          title: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          order_position: number
          task_id: string
          title: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          order_position?: number
          task_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "subtasks_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      sync_documents: {
        Row: {
          cid: string
          content: Json
          created_at: string
          document_type: string
          id: string
          is_deleted: boolean
          original_id: string
          updated_at: string
          user_id: string | null
          version: number
        }
        Insert: {
          cid: string
          content: Json
          created_at?: string
          document_type: string
          id?: string
          is_deleted?: boolean
          original_id: string
          updated_at?: string
          user_id?: string | null
          version?: number
        }
        Update: {
          cid?: string
          content?: Json
          created_at?: string
          document_type?: string
          id?: string
          is_deleted?: boolean
          original_id?: string
          updated_at?: string
          user_id?: string | null
          version?: number
        }
        Relationships: []
      }
      sync_logs: {
        Row: {
          details: Json | null
          document_id: string | null
          id: string
          operation: string
          peer_id: string | null
          status: string
          timestamp: string
        }
        Insert: {
          details?: Json | null
          document_id?: string | null
          id?: string
          operation: string
          peer_id?: string | null
          status: string
          timestamp?: string
        }
        Update: {
          details?: Json | null
          document_id?: string | null
          id?: string
          operation?: string
          peer_id?: string | null
          status?: string
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "sync_logs_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "sync_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sync_logs_peer_id_fkey"
            columns: ["peer_id"]
            isOneToOne: false
            referencedRelation: "sync_peers"
            referencedColumns: ["id"]
          },
        ]
      }
      sync_peers: {
        Row: {
          device_type: string | null
          id: string
          last_seen: string
          name: string | null
          peer_id: string
          status: string
        }
        Insert: {
          device_type?: string | null
          id?: string
          last_seen?: string
          name?: string | null
          peer_id: string
          status?: string
        }
        Update: {
          device_type?: string | null
          id?: string
          last_seen?: string
          name?: string | null
          peer_id?: string
          status?: string
        }
        Relationships: []
      }
      task_assignments: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          assigned_to: string
          assignment_id: string
          is_primary: boolean | null
          task_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          assigned_to: string
          assignment_id?: string
          is_primary?: boolean | null
          task_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          assigned_to?: string
          assignment_id?: string
          is_primary?: boolean | null
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "team_users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "task_assignments_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "team_users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "task_assignments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_labels: {
        Row: {
          label_id: string
          task_id: string
        }
        Insert: {
          label_id: string
          task_id: string
        }
        Update: {
          label_id?: string
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_labels_label_id_fkey"
            columns: ["label_id"]
            isOneToOne: false
            referencedRelation: "labels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_labels_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_stages: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          is_default: boolean | null
          name: string
          order_position: number
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          order_position: number
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          order_position?: number
        }
        Relationships: []
      }
      task_templates: {
        Row: {
          checklist_items: Json | null
          created_at: string | null
          description: string | null
          estimated_hours: number | null
          id: string
          name: string
          priority: Database["public"]["Enums"]["task_priority"] | null
          requires_review: boolean | null
          service_id: string | null
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          checklist_items?: Json | null
          created_at?: string | null
          description?: string | null
          estimated_hours?: number | null
          id?: string
          name: string
          priority?: Database["public"]["Enums"]["task_priority"] | null
          requires_review?: boolean | null
          service_id?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          checklist_items?: Json | null
          created_at?: string | null
          description?: string | null
          estimated_hours?: number | null
          id?: string
          name?: string
          priority?: Database["public"]["Enums"]["task_priority"] | null
          requires_review?: boolean | null
          service_id?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_templates_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assigned_to: string | null
          auto_generated: boolean | null
          budgeted_minutes: number | null
          client_id: string | null
          client_service_id: string | null
          comments: string | null
          completed_at: string | null
          compliance_id: string | null
          created_at: string | null
          custom_fields: Json | null
          description: string | null
          due_date: string | null
          id: string
          priority: string
          project_id: string | null
          recurrence: Database["public"]["Enums"]["recurrence_type"] | null
          recurrence_end_date: string | null
          recurring_rule: string | null
          requires_review: boolean | null
          review_status: string | null
          reviewer_id: string | null
          service_id: string | null
          stage_id: string | null
          started_at: string | null
          status: string
          tags: string[] | null
          team_id: string | null
          time_spent_minutes: number | null
          title: string
          updated_at: string | null
          user_labels: string[] | null
        }
        Insert: {
          assigned_to?: string | null
          auto_generated?: boolean | null
          budgeted_minutes?: number | null
          client_id?: string | null
          client_service_id?: string | null
          comments?: string | null
          completed_at?: string | null
          compliance_id?: string | null
          created_at?: string | null
          custom_fields?: Json | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          project_id?: string | null
          recurrence?: Database["public"]["Enums"]["recurrence_type"] | null
          recurrence_end_date?: string | null
          recurring_rule?: string | null
          requires_review?: boolean | null
          review_status?: string | null
          reviewer_id?: string | null
          service_id?: string | null
          stage_id?: string | null
          started_at?: string | null
          status?: string
          tags?: string[] | null
          team_id?: string | null
          time_spent_minutes?: number | null
          title: string
          updated_at?: string | null
          user_labels?: string[] | null
        }
        Update: {
          assigned_to?: string | null
          auto_generated?: boolean | null
          budgeted_minutes?: number | null
          client_id?: string | null
          client_service_id?: string | null
          comments?: string | null
          completed_at?: string | null
          compliance_id?: string | null
          created_at?: string | null
          custom_fields?: Json | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          project_id?: string | null
          recurrence?: Database["public"]["Enums"]["recurrence_type"] | null
          recurrence_end_date?: string | null
          recurring_rule?: string | null
          requires_review?: boolean | null
          review_status?: string | null
          reviewer_id?: string | null
          service_id?: string | null
          stage_id?: string | null
          started_at?: string | null
          status?: string
          tags?: string[] | null
          team_id?: string | null
          time_spent_minutes?: number | null
          title?: string
          updated_at?: string | null
          user_labels?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_client_service_id_fkey"
            columns: ["client_service_id"]
            isOneToOne: false
            referencedRelation: "client_services_enhanced"
            referencedColumns: ["client_service_id"]
          },
          {
            foreignKeyName: "tasks_compliance_id_fkey"
            columns: ["compliance_id"]
            isOneToOne: false
            referencedRelation: "client_compliance"
            referencedColumns: ["client_compliance_id"]
          },
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "task_stages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["team_id"]
          },
        ]
      }
      team_members: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          role: string
          status: string
          workload: number | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name: string
          role: string
          status?: string
          workload?: number | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          role?: string
          status?: string
          workload?: number | null
        }
        Relationships: []
      }
      team_services: {
        Row: {
          created_at: string | null
          description: string | null
          is_compliance_service: boolean | null
          name: string
          requires_review: boolean | null
          service_id: string
          standard_time_hours: number | null
          team_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          is_compliance_service?: boolean | null
          name: string
          requires_review?: boolean | null
          service_id?: string
          standard_time_hours?: number | null
          team_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          is_compliance_service?: boolean | null
          name?: string
          requires_review?: boolean | null
          service_id?: string
          standard_time_hours?: number | null
          team_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_services_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["team_id"]
          },
        ]
      }
      team_users: {
        Row: {
          auth_user_id: string | null
          billing_rate: number | null
          cost_rate: number | null
          created_at: string | null
          email: string
          full_name: string
          is_active: boolean | null
          role: Database["public"]["Enums"]["user_role"] | null
          team_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auth_user_id?: string | null
          billing_rate?: number | null
          cost_rate?: number | null
          created_at?: string | null
          email: string
          full_name: string
          is_active?: boolean | null
          role?: Database["public"]["Enums"]["user_role"] | null
          team_id: string
          updated_at?: string | null
          user_id?: string
        }
        Update: {
          auth_user_id?: string | null
          billing_rate?: number | null
          cost_rate?: number | null
          created_at?: string | null
          email?: string
          full_name?: string
          is_active?: boolean | null
          role?: Database["public"]["Enums"]["user_role"] | null
          team_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_users_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["team_id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string | null
          name: string
          subscription_tier: string | null
          team_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          name: string
          subscription_tier?: string | null
          team_id?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          name?: string
          subscription_tier?: string | null
          team_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      time_entries: {
        Row: {
          billable: boolean | null
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          end_time: string | null
          id: string
          rate_per_hour: number | null
          start_time: string
          task_id: string | null
          user_id: string | null
        }
        Insert: {
          billable?: boolean | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          end_time?: string | null
          id?: string
          rate_per_hour?: number | null
          start_time: string
          task_id?: string | null
          user_id?: string | null
        }
        Update: {
          billable?: boolean | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          end_time?: string | null
          id?: string
          rate_per_hour?: number | null
          start_time?: string
          task_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "time_entries_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      time_entries_enhanced: {
        Row: {
          billable_seconds: number | null
          created_at: string | null
          end_time: string | null
          hourly_rate: number | null
          notes: string | null
          start_time: string
          status: Database["public"]["Enums"]["time_entry_status"] | null
          task_id: string
          time_entry_id: string
          total_logged_seconds: number | null
          user_id: string
        }
        Insert: {
          billable_seconds?: number | null
          created_at?: string | null
          end_time?: string | null
          hourly_rate?: number | null
          notes?: string | null
          start_time: string
          status?: Database["public"]["Enums"]["time_entry_status"] | null
          task_id: string
          time_entry_id?: string
          total_logged_seconds?: number | null
          user_id: string
        }
        Update: {
          billable_seconds?: number | null
          created_at?: string | null
          end_time?: string | null
          hourly_rate?: number | null
          notes?: string | null
          start_time?: string
          status?: Database["public"]["Enums"]["time_entry_status"] | null
          task_id?: string
          time_entry_id?: string
          total_logged_seconds?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_entries_enhanced_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_enhanced_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "team_users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      todos: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          completed_by: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          is_completed: boolean | null
          order_position: number
          task_id: string | null
          title: string
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          is_completed?: boolean | null
          order_position: number
          task_id?: string | null
          title: string
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          is_completed?: boolean | null
          order_position?: number
          task_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "todos_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      user_permissions: {
        Row: {
          created_at: string | null
          id: string
          permission_type: string
          scope: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          permission_type: string
          scope?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          permission_type?: string
          scope?: string | null
          user_id?: string
        }
        Relationships: []
      }
      work_done: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          billable: boolean | null
          created_at: string | null
          date_worked: string
          description: string | null
          hourly_rate: number | null
          hours_worked: number
          id: string
          rejection_reason: string | null
          status: string | null
          task_id: string | null
          team_member_id: string | null
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          billable?: boolean | null
          created_at?: string | null
          date_worked: string
          description?: string | null
          hourly_rate?: number | null
          hours_worked: number
          id?: string
          rejection_reason?: string | null
          status?: string | null
          task_id?: string | null
          team_member_id?: string | null
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          billable?: boolean | null
          created_at?: string | null
          date_worked?: string
          description?: string | null
          hourly_rate?: number | null
          hours_worked?: number
          id?: string
          rejection_reason?: string | null
          status?: string | null
          task_id?: string | null
          team_member_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "work_done_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_done_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_recurring_task: {
        Args: { original_task_id: string; new_due_date: string }
        Returns: string
      }
      get_user_team_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      update_compliance_status: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      compliance_status: "active" | "expired" | "expiring_soon"
      contact_method: "email" | "phone" | "whatsapp"
      fee_cycle: "monthly" | "quarterly" | "annually" | "one_time"
      project_status: "active" | "completed" | "onHold"
      recurrence_type:
        | "none"
        | "daily"
        | "weekly"
        | "monthly"
        | "quarterly"
        | "halfYearly"
        | "yearly"
      task_priority: "low" | "medium" | "high"
      task_status: "todo" | "inProgress" | "review" | "done"
      time_entry_status: "running" | "logged"
      user_role: "admin" | "manager" | "staff"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      compliance_status: ["active", "expired", "expiring_soon"],
      contact_method: ["email", "phone", "whatsapp"],
      fee_cycle: ["monthly", "quarterly", "annually", "one_time"],
      project_status: ["active", "completed", "onHold"],
      recurrence_type: [
        "none",
        "daily",
        "weekly",
        "monthly",
        "quarterly",
        "halfYearly",
        "yearly",
      ],
      task_priority: ["low", "medium", "high"],
      task_status: ["todo", "inProgress", "review", "done"],
      time_entry_status: ["running", "logged"],
      user_role: ["admin", "manager", "staff"],
    },
  },
} as const
