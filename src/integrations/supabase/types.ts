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
          final_approved_at: string | null
          final_approved_by: string | null
          id: string
          reason: string
          request_date: string | null
          status: string | null
          supervisor_approved_at: string | null
          supervisor_approved_by: string | null
          supervisor_status: string | null
        }
        Insert: {
          amount: number
          approved_by?: string | null
          approved_date?: string | null
          created_at?: string | null
          employee_id?: string | null
          final_approved_at?: string | null
          final_approved_by?: string | null
          id?: string
          reason: string
          request_date?: string | null
          status?: string | null
          supervisor_approved_at?: string | null
          supervisor_approved_by?: string | null
          supervisor_status?: string | null
        }
        Update: {
          amount?: number
          approved_by?: string | null
          approved_date?: string | null
          created_at?: string | null
          employee_id?: string | null
          final_approved_at?: string | null
          final_approved_by?: string | null
          id?: string
          reason?: string
          request_date?: string | null
          status?: string | null
          supervisor_approved_at?: string | null
          supervisor_approved_by?: string | null
          supervisor_status?: string | null
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
          {
            foreignKeyName: "advance_requests_final_approved_by_fkey"
            columns: ["final_approved_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "advance_requests_supervisor_approved_by_fkey"
            columns: ["supervisor_approved_by"]
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
          emi_remaining_months: number | null
          employee_id: string | null
          handover_status: string | null
          id: string
          issued_at: string | null
          issued_by: string | null
          monthly_emi: number | null
          next_emi_date: string | null
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
          emi_remaining_months?: number | null
          employee_id?: string | null
          handover_status?: string | null
          id?: string
          issued_at?: string | null
          issued_by?: string | null
          monthly_emi?: number | null
          next_emi_date?: string | null
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
          emi_remaining_months?: number | null
          employee_id?: string | null
          handover_status?: string | null
          id?: string
          issued_at?: string | null
          issued_by?: string | null
          monthly_emi?: number | null
          next_emi_date?: string | null
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
          {
            foreignKeyName: "asset_requests_issued_by_fkey"
            columns: ["issued_by"]
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
      department_tasks: {
        Row: {
          created_at: string
          department_id: string
          id: string
          is_required: boolean
          task_id: string
        }
        Insert: {
          created_at?: string
          department_id: string
          id?: string
          is_required?: boolean
          task_id: string
        }
        Update: {
          created_at?: string
          department_id?: string
          id?: string
          is_required?: boolean
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "department_tasks_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "department_tasks_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
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
          assigned_supervisor: string | null
          created_at: string | null
          department: string
          email: string
          employee_id: string
          id: string
          is_active: boolean | null
          joining_date: string | null
          kyc_status: string | null
          name: string
          password: number | null
          phone: string
          role: string
          role_level: number | null
          salary: number | null
          updated_at: string | null
        }
        Insert: {
          assigned_supervisor?: string | null
          created_at?: string | null
          department: string
          email: string
          employee_id: string
          id?: string
          is_active?: boolean | null
          joining_date?: string | null
          kyc_status?: string | null
          name: string
          password?: number | null
          phone: string
          role: string
          role_level?: number | null
          salary?: number | null
          updated_at?: string | null
        }
        Update: {
          assigned_supervisor?: string | null
          created_at?: string | null
          department?: string
          email?: string
          employee_id?: string
          id?: string
          is_active?: boolean | null
          joining_date?: string | null
          kyc_status?: string | null
          name?: string
          password?: number | null
          phone?: string
          role?: string
          role_level?: number | null
          salary?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employees_assigned_supervisor_fkey"
            columns: ["assigned_supervisor"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      kyc_details: {
        Row: {
          biometric_data: Json | null
          created_at: string | null
          document_urls: Json | null
          employee_id: string | null
          id: string
          personal_details: Json | null
          updated_at: string | null
          verification_status: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          biometric_data?: Json | null
          created_at?: string | null
          document_urls?: Json | null
          employee_id?: string | null
          id?: string
          personal_details?: Json | null
          updated_at?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          biometric_data?: Json | null
          created_at?: string | null
          document_urls?: Json | null
          employee_id?: string | null
          id?: string
          personal_details?: Json | null
          updated_at?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kyc_details_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: true
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kyc_details_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_requests: {
        Row: {
          applied_date: string | null
          approved_by: string | null
          approved_date: string | null
          created_at: string | null
          employee_id: string | null
          end_date: string
          final_approved_at: string | null
          final_approved_by: string | null
          id: string
          leave_type: string
          reason: string
          start_date: string
          status: string | null
          supervisor_approved_at: string | null
          supervisor_approved_by: string | null
          supervisor_status: string | null
        }
        Insert: {
          applied_date?: string | null
          approved_by?: string | null
          approved_date?: string | null
          created_at?: string | null
          employee_id?: string | null
          end_date: string
          final_approved_at?: string | null
          final_approved_by?: string | null
          id?: string
          leave_type: string
          reason: string
          start_date: string
          status?: string | null
          supervisor_approved_at?: string | null
          supervisor_approved_by?: string | null
          supervisor_status?: string | null
        }
        Update: {
          applied_date?: string | null
          approved_by?: string | null
          approved_date?: string | null
          created_at?: string | null
          employee_id?: string | null
          end_date?: string
          final_approved_at?: string | null
          final_approved_by?: string | null
          id?: string
          leave_type?: string
          reason?: string
          start_date?: string
          status?: string | null
          supervisor_approved_at?: string | null
          supervisor_approved_by?: string | null
          supervisor_status?: string | null
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
          {
            foreignKeyName: "leave_requests_final_approved_by_fkey"
            columns: ["final_approved_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_requests_supervisor_approved_by_fkey"
            columns: ["supervisor_approved_by"]
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
      supervisor_assignments: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          assignment_type: string | null
          department_id: string | null
          employee_id: string | null
          id: string
          is_active: boolean | null
          supervisor_id: string | null
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          assignment_type?: string | null
          department_id?: string | null
          employee_id?: string | null
          id?: string
          is_active?: boolean | null
          supervisor_id?: string | null
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          assignment_type?: string | null
          department_id?: string | null
          employee_id?: string | null
          id?: string
          is_active?: boolean | null
          supervisor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "supervisor_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supervisor_assignments_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supervisor_assignments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supervisor_assignments_supervisor_id_fkey"
            columns: ["supervisor_id"]
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
      tasks: {
        Row: {
          created_at: string
          description: string | null
          form_fields: Json | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          form_fields?: Json | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          form_fields?: Json | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      team_members: {
        Row: {
          employee_id: string | null
          id: string
          joined_at: string | null
          team_id: string | null
        }
        Insert: {
          employee_id?: string | null
          id?: string
          joined_at?: string | null
          team_id?: string | null
        }
        Update: {
          employee_id?: string | null
          id?: string
          joined_at?: string | null
          team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_members_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_task_submissions: {
        Row: {
          comments: string | null
          created_at: string | null
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
          submitted_by: string | null
          supervisor_feedback: string | null
          task_description: string | null
          task_type: string
          team_id: string | null
          updated_at: string | null
        }
        Insert: {
          comments?: string | null
          created_at?: string | null
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
          submitted_by?: string | null
          supervisor_feedback?: string | null
          task_description?: string | null
          task_type: string
          team_id?: string | null
          updated_at?: string | null
        }
        Update: {
          comments?: string | null
          created_at?: string | null
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
          submitted_by?: string | null
          supervisor_feedback?: string | null
          task_description?: string | null
          task_type?: string
          team_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_task_submissions_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_task_submissions_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_task_submissions_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          category: string
          created_at: string | null
          department_id: string | null
          id: string
          is_active: boolean | null
          name: string
          supervisor_id: string | null
          team_leader_id: string | null
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          department_id?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          supervisor_id?: string | null
          team_leader_id?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          department_id?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          supervisor_id?: string | null
          team_leader_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teams_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_supervisor_id_fkey"
            columns: ["supervisor_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_team_leader_id_fkey"
            columns: ["team_leader_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      zone_assignments: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          department_id: string | null
          employee_id: string | null
          id: string
          is_active: boolean | null
          zone_id: string | null
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          department_id?: string | null
          employee_id?: string | null
          id?: string
          is_active?: boolean | null
          zone_id?: string | null
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          department_id?: string | null
          employee_id?: string | null
          id?: string
          is_active?: boolean | null
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "zone_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "zone_assignments_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "zone_assignments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "zone_assignments_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
        ]
      }
      zones: {
        Row: {
          coordinates: Json
          created_at: string
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          coordinates: Json
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          coordinates?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
