
export interface Employee {
  id: string;
  employee_id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  role: 'employee' | 'supervisor' | 'admin' | 'super_admin';
  salary: number;
  joining_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Attendance {
  id: string;
  employee_id: string;
  check_in_time?: string;
  check_out_time?: string;
  location_lat?: number;
  location_lng?: number;
  location_address?: string;
  status: 'checked_in' | 'checked_out';
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
  status: 'in_progress' | 'completed' | 'approved' | 'rejected' | 'pending_review';
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
  payment_type: 'one_time_deduction' | 'emi_plan';
  emi_months: number;
  monthly_emi: number;
  total_amount: number;
  status: 'pending' | 'approved' | 'rejected';
  request_date: string;
  approved_by?: string;
  approved_date?: string;
  created_at: string;
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
