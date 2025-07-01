
-- Create employees table with extended information
CREATE TABLE public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  department TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('employee', 'supervisor', 'admin', 'super_admin')),
  salary DECIMAL(10,2) DEFAULT 0,
  joining_date DATE DEFAULT CURRENT_DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create attendance table
CREATE TABLE public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  check_in_time TIMESTAMP WITH TIME ZONE,
  check_out_time TIMESTAMP WITH TIME ZONE,
  location_lat DECIMAL(10,8),
  location_lng DECIMAL(11,8),
  location_address TEXT,
  status TEXT CHECK (status IN ('checked_in', 'checked_out')) DEFAULT 'checked_out',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create task_submissions table
CREATE TABLE public.task_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  task_type TEXT NOT NULL,
  task_description TEXT,
  location_lat DECIMAL(10,8),
  location_lng DECIMAL(11,8),
  location_address TEXT,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  pre_work_photo TEXT,
  post_work_photo TEXT,
  comments TEXT,
  status TEXT CHECK (status IN ('in_progress', 'completed', 'approved', 'rejected', 'pending_review')) DEFAULT 'pending_review',
  supervisor_feedback TEXT,
  reviewed_by UUID REFERENCES public.employees(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create leave_requests table
CREATE TABLE public.leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  leave_type TEXT CHECK (leave_type IN ('sick', 'casual', 'earned', 'emergency')) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  applied_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_by UUID REFERENCES public.employees(id),
  approved_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create advance_requests table
CREATE TABLE public.advance_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  reason TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  request_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_by UUID REFERENCES public.employees(id),
  approved_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create assets table
CREATE TABLE public.assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  quantity INTEGER NOT NULL DEFAULT 0,
  available_quantity INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create asset_requests table
CREATE TABLE public.asset_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  reason TEXT NOT NULL,
  payment_type TEXT CHECK (payment_type IN ('one_time_deduction', 'emi_plan')) DEFAULT 'one_time_deduction',
  emi_months INTEGER DEFAULT 1,
  monthly_emi DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  request_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_by UUID REFERENCES public.employees(id),
  approved_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create employee_deductions table
CREATE TABLE public.employee_deductions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  deduction_type TEXT NOT NULL, -- 'advance', 'asset_emi', 'pf', 'esi', 'other'
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  start_date DATE DEFAULT CURRENT_DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  reference_id UUID, -- Reference to advance_request or asset_request
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payroll table
CREATE TABLE public.payroll (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  basic_salary DECIMAL(10,2) NOT NULL,
  total_deductions DECIMAL(10,2) DEFAULT 0,
  net_salary DECIMAL(10,2) NOT NULL,
  pf_amount DECIMAL(10,2) DEFAULT 0,
  esi_amount DECIMAL(10,2) DEFAULT 0,
  advance_deduction DECIMAL(10,2) DEFAULT 0,
  asset_emi_deduction DECIMAL(10,2) DEFAULT 0,
  other_deductions DECIMAL(10,2) DEFAULT 0,
  status TEXT CHECK (status IN ('draft', 'processed', 'paid')) DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(employee_id, month, year)
);

-- Insert sample assets
INSERT INTO public.assets (name, category, price, quantity, available_quantity, description) VALUES
('Fiber Splicing Kit', 'Tools', 15000.00, 10, 8, 'Professional fiber optic splicing equipment'),
('ONT Device', 'Hardware', 2500.00, 50, 45, 'Optical Network Terminal for customer premises'),
('Ethernet Cable (100m)', 'Materials', 800.00, 100, 85, 'Cat6 Ethernet cable roll'),
('Power Drill', 'Tools', 5000.00, 15, 12, 'Heavy duty power drill for installations'),
('Safety Equipment Set', 'Safety', 3000.00, 25, 20, 'Complete safety gear including helmet, harness, boots'),
('Testing Equipment', 'Tools', 25000.00, 5, 4, 'Network testing and measurement equipment'),
('Laptop', 'Electronics', 45000.00, 20, 18, 'Work laptop for field operations'),
('Mobile Phone', 'Electronics', 15000.00, 30, 25, 'Company mobile phone for employees');

-- Enable Row Level Security
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_deductions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for employees (admin can see all, employees can see their own)
CREATE POLICY "Admin can view all employees" ON public.employees FOR SELECT USING (true);
CREATE POLICY "Admin can insert employees" ON public.employees FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin can update employees" ON public.employees FOR UPDATE USING (true);
CREATE POLICY "Admin can delete employees" ON public.employees FOR DELETE USING (true);

-- Create RLS policies for attendance
CREATE POLICY "Users can view all attendance" ON public.attendance FOR SELECT USING (true);
CREATE POLICY "Users can insert attendance" ON public.attendance FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update attendance" ON public.attendance FOR UPDATE USING (true);

-- Create RLS policies for task_submissions
CREATE POLICY "Users can view all task submissions" ON public.task_submissions FOR SELECT USING (true);
CREATE POLICY "Users can insert task submissions" ON public.task_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update task submissions" ON public.task_submissions FOR UPDATE USING (true);

-- Create RLS policies for leave_requests
CREATE POLICY "Users can view all leave requests" ON public.leave_requests FOR SELECT USING (true);
CREATE POLICY "Users can insert leave requests" ON public.leave_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update leave requests" ON public.leave_requests FOR UPDATE USING (true);

-- Create RLS policies for advance_requests
CREATE POLICY "Users can view all advance requests" ON public.advance_requests FOR SELECT USING (true);
CREATE POLICY "Users can insert advance requests" ON public.advance_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update advance requests" ON public.advance_requests FOR UPDATE USING (true);

-- Create RLS policies for assets
CREATE POLICY "Users can view all assets" ON public.assets FOR SELECT USING (true);
CREATE POLICY "Admin can manage assets" ON public.assets FOR ALL USING (true);

-- Create RLS policies for asset_requests
CREATE POLICY "Users can view all asset requests" ON public.asset_requests FOR SELECT USING (true);
CREATE POLICY "Users can insert asset requests" ON public.asset_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update asset requests" ON public.asset_requests FOR UPDATE USING (true);

-- Create RLS policies for employee_deductions
CREATE POLICY "Users can view all deductions" ON public.employee_deductions FOR SELECT USING (true);
CREATE POLICY "Admin can manage deductions" ON public.employee_deductions FOR ALL USING (true);

-- Create RLS policies for payroll
CREATE POLICY "Users can view all payroll" ON public.payroll FOR SELECT USING (true);
CREATE POLICY "Admin can manage payroll" ON public.payroll FOR ALL USING (true);
