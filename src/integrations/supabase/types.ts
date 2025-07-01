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
      advance_requests: {
        Row: {
          amount: number
          approved_by: string | null
          approved_date: string | null
          created_at: string | null
          employee_id: string | null
          id: string
          reason: string
          request_date: string | null
          status: string | null
        }
        Insert: {
          amount: number
          approved_by?: string | null
          approved_date?: string | null
          created_at?: string | null
          employee_id?: string | null
          id?: string
          reason: string
          request_date?: string | null
          status?: string | null
        }
        Update: {
          amount?: number
          approved_by?: string | null
          approved_date?: string | null
          created_at?: string | null
          employee_id?: string | null
          id?: string
          reason?: string
          request_date?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "advance_requests_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "advance_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      asset_requests: {
        Row: {
          approved_by: string | null
          approved_date: string | null
          asset_id: string | null
          created_at: string | null
          emi_months: number | null
          employee_id: string | null
          id: string
          monthly_emi: number | null
          payment_type: string | null
          quantity: number
          reason: string
          request_date: string | null
          status: string | null
          total_amount: number
        }
        Insert: {
          approved_by?: string | null
          approved_date?: string | null
          asset_id?: string | null
          created_at?: string | null
          emi_months?: number | null
          employee_id?: string | null
          id?: string
          monthly_emi?: number | null
          payment_type?: string | null
          quantity?: number
          reason: string
          request_date?: string | null
          status?: string | null
          total_amount: number
        }
        Update: {
          approved_by?: string | null
          approved_date?: string | null
          asset_id?: string | null
          created_at?: string | null
          emi_months?: number | null
          employee_id?: string | null
          id?: string
          monthly_emi?: number | null
          payment_type?: string | null
          quantity?: number
          reason?: string
          request_date?: string | null
          status?: string | null
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "asset_requests_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_requests_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      assets: {
        Row: {
          available_quantity: number
          category: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          price: number
          quantity: number
          updated_at: string | null
        }
        Insert: {
          available_quantity?: number
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          price?: number
          quantity?: number
          updated_at?: string | null
        }
        Update: {
          available_quantity?: number
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          price?: number
          quantity?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      attendance: {
        Row: {
          check_in_time: string | null
          check_out_time: string | null
          created_at: string | null
          employee_id: string | null
          id: string
          location_address: string | null
          location_lat: number | null
          location_lng: number | null
          status: string | null
        }
        Insert: {
          check_in_time?: string | null
          check_out_time?: string | null
          created_at?: string | null
          employee_id?: string | null
          id?: string
          location_address?: string | null
          location_lat?: number | null
          location_lng?: number | null
          status?: string | null
        }
        Update: {
          check_in_time?: string | null
          check_out_time?: string | null
          created_at?: string | null
          employee_id?: string | null
          id?: string
          location_address?: string | null
          location_lat?: number | null
          location_lng?: number | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_deductions: {
        Row: {
          amount: number
          created_at: string | null
          deduction_type: string
          description: string | null
          employee_id: string | null
          end_date: string | null
          id: string
          is_active: boolean | null
          reference_id: string | null
          start_date: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          deduction_type: string
          description?: string | null
          employee_id?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          reference_id?: string | null
          start_date?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          deduction_type?: string
          description?: string | null
          employee_id?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          reference_id?: string | null
          start_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_deductions_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          created_at: string | null
          department: string
          email: string
          employee_id: string
          id: string
          is_active: boolean | null
          joining_date: string | null
          name: string
          phone: string
          role: string
          salary: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          department: string
          email: string
          employee_id: string
          id?: string
          is_active?: boolean | null
          joining_date?: string | null
          name: string
          phone: string
          role: string
          salary?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          department?: string
          email?: string
          employee_id?: string
          id?: string
          is_active?: boolean | null
          joining_date?: string | null
          name?: string
          phone?: string
          role?: string
          salary?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      leave_requests: {
        Row: {
          applied_date: string | null
          approved_by: string | null
          approved_date: string | null
          created_at: string | null
          employee_id: string | null
          end_date: string
          id: string
          leave_type: string
          reason: string
          start_date: string
          status: string | null
        }
        Insert: {
          applied_date?: string | null
          approved_by?: string | null
          approved_date?: string | null
          created_at?: string | null
          employee_id?: string | null
          end_date: string
          id?: string
          leave_type: string
          reason: string
          start_date: string
          status?: string | null
        }
        Update: {
          applied_date?: string | null
          approved_by?: string | null
          approved_date?: string | null
          created_at?: string | null
          employee_id?: string | null
          end_date?: string
          id?: string
          leave_type?: string
          reason?: string
          start_date?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leave_requests_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll: {
        Row: {
          advance_deduction: number | null
          asset_emi_deduction: number | null
          basic_salary: number
          created_at: string | null
          employee_id: string | null
          esi_amount: number | null
          id: string
          month: number
          net_salary: number
          other_deductions: number | null
          pf_amount: number | null
          status: string | null
          total_deductions: number | null
          year: number
        }
        Insert: {
          advance_deduction?: number | null
          asset_emi_deduction?: number | null
          basic_salary: number
          created_at?: string | null
          employee_id?: string | null
          esi_amount?: number | null
          id?: string
          month: number
          net_salary: number
          other_deductions?: number | null
          pf_amount?: number | null
          status?: string | null
          total_deductions?: number | null
          year: number
        }
        Update: {
          advance_deduction?: number | null
          asset_emi_deduction?: number | null
          basic_salary?: number
          created_at?: string | null
          employee_id?: string | null
          esi_amount?: number | null
          id?: string
          month?: number
          net_salary?: number
          other_deductions?: number | null
          pf_amount?: number | null
          status?: string | null
          total_deductions?: number | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "payroll_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      task_submissions: {
        Row: {
          comments: string | null
          created_at: string | null
          employee_id: string | null
          end_time: string | null
          id: string
          location_address: string | null
          location_lat: number | null
          location_lng: number | null
          post_work_photo: string | null
          pre_work_photo: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          start_time: string | null
          status: string | null
          supervisor_feedback: string | null
          task_description: string | null
          task_type: string
          updated_at: string | null
        }
        Insert: {
          comments?: string | null
          created_at?: string | null
          employee_id?: string | null
          end_time?: string | null
          id?: string
          location_address?: string | null
          location_lat?: number | null
          location_lng?: number | null
          post_work_photo?: string | null
          pre_work_photo?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          start_time?: string | null
          status?: string | null
          supervisor_feedback?: string | null
          task_description?: string | null
          task_type: string
          updated_at?: string | null
        }
        Update: {
          comments?: string | null
          created_at?: string | null
          employee_id?: string | null
          end_time?: string | null
          id?: string
          location_address?: string | null
          location_lat?: number | null
          location_lng?: number | null
          post_work_photo?: string | null
          pre_work_photo?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          start_time?: string | null
          status?: string | null
          supervisor_feedback?: string | null
          task_description?: string | null
          task_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_submissions_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_submissions_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
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
