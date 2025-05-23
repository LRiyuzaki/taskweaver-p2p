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
          company: string | null
          created_at: string
          email: string
          id: string
          name: string
          notes: string | null
          phone: string | null
          preferred_contact_method: string | null
          whatsapp_number: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string
          email: string
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          preferred_contact_method?: string | null
          whatsapp_number?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          preferred_contact_method?: string | null
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      documents: {
        Row: {
          client_id: string | null
          created_at: string
          form_data: Json | null
          id: string
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
          form_data?: Json | null
          id?: string
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
          form_data?: Json | null
          id?: string
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
      tasks: {
        Row: {
          assigned_to: string | null
          client_id: string | null
          comments: string | null
          completed_at: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          priority: string
          requires_review: boolean | null
          review_status: string | null
          reviewer_id: string | null
          service_id: string | null
          started_at: string | null
          status: string
          time_spent_minutes: number | null
          title: string
        }
        Insert: {
          assigned_to?: string | null
          client_id?: string | null
          comments?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          requires_review?: boolean | null
          review_status?: string | null
          reviewer_id?: string | null
          service_id?: string | null
          started_at?: string | null
          status?: string
          time_spent_minutes?: number | null
          title: string
        }
        Update: {
          assigned_to?: string | null
          client_id?: string | null
          comments?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          requires_review?: boolean | null
          review_status?: string | null
          reviewer_id?: string | null
          service_id?: string | null
          started_at?: string | null
          status?: string
          time_spent_minutes?: number | null
          title?: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
