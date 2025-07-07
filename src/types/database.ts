
export interface Employee {
  id: string;
  employee_id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  role: string; // Changed from union type to string to match database
  salary: number;
  joining_date: string;
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
  form_fields: any; // Changed from any[] to any to match Supabase Json type
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

export interface AdvanceRequest {
  id: string;
  employee_id: string;
  amount: number;
  reason: string;
  status: string; // Changed from union type to string to match database
  request_date: string;
  approved_by?: string;
  approved_date?: string;
  created_at: string;
  employees?: {
    name: string;
    employee_id: string;
  } | null;
}

export interface Attendance {
  id: string;
  employee_id: string;
  check_in_time?: string;
  check_out_time?: string;
  location_lat?: number;
  location_lng?: number;
  location_address?: string;
  status: string; // Changed from union type to string to match database
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
  payment_type: string; // Changed from union type to string to match database
  emi_months: number;
  monthly_emi: number;
  total_amount: number;
  status: string; // Changed from union type to string to match database
  request_date: string;
  approved_by?: string;
  approved_date?: string;
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
