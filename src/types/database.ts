
export interface Employee {
  id: string;
  employee_id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  role: string;
  role_level: number;
  assigned_supervisor?: string;
  salary: number;
  joining_date: string;
  kyc_status: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  name: string;
  description: string;
  form_fields: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DepartmentTask {
  id: string;
  department_id: string;
  task_id: string;
  is_required: boolean;
  created_at: string;
}

export interface Team {
  id: string;
  name: string;
  category: string;
  department_id: string;
  team_leader_id?: string;
  supervisor_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  employee_id: string;
  joined_at: string;
}

export interface SupervisorAssignment {
  id: string;
  supervisor_id: string;
  employee_id?: string;
  department_id?: string;
  assignment_type: string;
  assigned_by?: string;
  assigned_at: string;
  is_active: boolean;
}

export interface ZoneAssignment {
  id: string;
  zone_id: string;
  employee_id?: string;
  department_id?: string;
  assigned_by?: string;
  assigned_at: string;
  is_active: boolean;
}

export interface KYCDetails {
  id: string;
  employee_id: string;
  personal_details: any;
  biometric_data: any;
  document_urls: any;
  verification_status: string;
  verified_by?: string;
  verified_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AdvanceRequest {
  id: string;
  employee_id: string;
  amount: number;
  reason: string;
  status: string;
  supervisor_status: string;
  request_date: string;
  supervisor_approved_by?: string;
  supervisor_approved_at?: string;
  final_approved_by?: string;
  final_approved_at?: string;
  approved_by?: string;
  approved_date?: string;
  created_at: string;
  employees?: {
    name: string;
    employee_id: string;
  } | null;
}

export interface LeaveRequest {
  id: string;
  employee_id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: string;
  supervisor_status: string;
  applied_date: string;
  supervisor_approved_by?: string;
  supervisor_approved_at?: string;
  final_approved_by?: string;
  final_approved_at?: string;
  approved_by?: string;
  approved_date?: string;
  created_at: string;
}

export interface Attendance {
  id: string;
  employee_id: string;
  check_in_time?: string;
  check_out_time?: string;
  location_lat?: number;
  location_lng?: number;
  location_address?: string;
  status: string;
  created_at: string;
}

export interface TaskSubmission {
  id: string;
  employee_id: string;
  task_type: string;
  task_description?: string;
  location_lat?: number;
  location_lng?: number;
  location_address?: string;
  start_time?: string;
  end_time?: string;
  pre_work_photo?: string;
  post_work_photo?: string;
  comments?: string;
  status: string;
  supervisor_feedback?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
  employees?: {
    name: string;
    employee_id: string;
  } | null;
}

export interface TeamTaskSubmission {
  id: string;
  team_id: string;
  submitted_by: string;
  task_type: string;
  task_description?: string;
  location_lat?: number;
  location_lng?: number;
  location_address?: string;
  start_time?: string;
  end_time?: string;
  pre_work_photo?: string;
  post_work_photo?: string;
  comments?: string;
  status: string;
  supervisor_feedback?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Asset {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  available_quantity: number;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AssetRequest {
  id: string;
  employee_id: string;
  asset_id: string;
  quantity: number;
  reason: string;
  payment_type: string;
  emi_months: number;
  emi_remaining_months: number;
  monthly_emi: number;
  total_amount: number;
  status: string;
  handover_status: string;
  request_date: string;
  approved_by?: string;
  approved_date?: string;
  issued_by?: string;
  issued_at?: string;
  next_emi_date?: string;
  created_at: string;
  employees?: {
    name: string;
    employee_id: string;
  } | null;
  assets?: {
    name: string;
    category: string;
  } | null;
}

export interface EmployeeDeduction {
  id: string;
  employee_id: string;
  deduction_type: string;
  amount: number;
  description?: string;
  start_date: string;
  end_date?: string;
  is_active: boolean;
  reference_id?: string;
  created_at: string;
}

export interface Zone {
  id: string;
  name: string;
  coordinates: { lat: number; lng: number }[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
