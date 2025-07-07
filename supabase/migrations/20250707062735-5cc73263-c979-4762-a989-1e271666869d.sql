
-- Add role hierarchy support to employees table
ALTER TABLE public.employees 
ADD COLUMN IF NOT EXISTS role_level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS assigned_supervisor UUID REFERENCES public.employees(id),
ADD COLUMN IF NOT EXISTS kyc_status TEXT DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'in_progress', 'completed', 'rejected'));

-- Create teams table
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE,
  team_leader_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  supervisor_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create team_members junction table
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, employee_id)
);

-- Create supervisor_assignments table for flexible supervisor-employee relationships
CREATE TABLE IF NOT EXISTS public.supervisor_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  supervisor_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE,
  assignment_type TEXT CHECK (assignment_type IN ('individual', 'department')) DEFAULT 'individual',
  assigned_by UUID REFERENCES public.employees(id),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(supervisor_id, employee_id)
);

-- Create zone_assignments table for employee zone management
CREATE TABLE IF NOT EXISTS public.zone_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  zone_id UUID REFERENCES public.zones(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES public.employees(id),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Create KYC details table
CREATE TABLE IF NOT EXISTS public.kyc_details (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  personal_details JSONB DEFAULT '{}',
  biometric_data JSONB DEFAULT '{}',
  document_urls JSONB DEFAULT '{}',
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  verified_by UUID REFERENCES public.employees(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(employee_id)
);

-- Update asset_requests table for EMI tracking and handover status
ALTER TABLE public.asset_requests 
ADD COLUMN IF NOT EXISTS handover_status TEXT DEFAULT 'pending' CHECK (handover_status IN ('pending', 'issued', 'returned')),
ADD COLUMN IF NOT EXISTS issued_by UUID REFERENCES public.employees(id),
ADD COLUMN IF NOT EXISTS issued_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS emi_remaining_months INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS next_emi_date DATE;

-- Create team_task_submissions table for team-based task submissions
CREATE TABLE IF NOT EXISTS public.team_task_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  submitted_by UUID REFERENCES public.employees(id) ON DELETE CASCADE,
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
  status TEXT CHECK (status IN ('submitted', 'approved', 'rejected', 'pending_review')) DEFAULT 'submitted',
  supervisor_feedback TEXT,
  reviewed_by UUID REFERENCES public.employees(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update advance_requests table to track approval hierarchy
ALTER TABLE public.advance_requests 
ADD COLUMN IF NOT EXISTS supervisor_approved_by UUID REFERENCES public.employees(id),
ADD COLUMN IF NOT EXISTS supervisor_approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS supervisor_status TEXT DEFAULT 'pending' CHECK (supervisor_status IN ('pending', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS final_approved_by UUID REFERENCES public.employees(id),
ADD COLUMN IF NOT EXISTS final_approved_at TIMESTAMP WITH TIME ZONE;

-- Update leave_requests table for two-level approval
ALTER TABLE public.leave_requests 
ADD COLUMN IF NOT EXISTS supervisor_approved_by UUID REFERENCES public.employees(id),
ADD COLUMN IF NOT EXISTS supervisor_approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS supervisor_status TEXT DEFAULT 'pending' CHECK (supervisor_status IN ('pending', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS final_approved_by UUID REFERENCES public.employees(id),
ADD COLUMN IF NOT EXISTS final_approved_at TIMESTAMP WITH TIME ZONE;

-- Enable RLS on new tables
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supervisor_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zone_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_task_submissions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for teams
CREATE POLICY "Users can view teams" ON public.teams FOR SELECT USING (true);
CREATE POLICY "Admin can manage teams" ON public.teams FOR ALL USING (true);

-- Create RLS policies for team_members
CREATE POLICY "Users can view team members" ON public.team_members FOR SELECT USING (true);
CREATE POLICY "Admin can manage team members" ON public.team_members FOR ALL USING (true);

-- Create RLS policies for supervisor_assignments
CREATE POLICY "Users can view supervisor assignments" ON public.supervisor_assignments FOR SELECT USING (true);
CREATE POLICY "Admin can manage supervisor assignments" ON public.supervisor_assignments FOR ALL USING (true);

-- Create RLS policies for zone_assignments
CREATE POLICY "Users can view zone assignments" ON public.zone_assignments FOR SELECT USING (true);
CREATE POLICY "Admin can manage zone assignments" ON public.zone_assignments FOR ALL USING (true);

-- Create RLS policies for kyc_details
CREATE POLICY "Users can view KYC details" ON public.kyc_details FOR SELECT USING (true);
CREATE POLICY "Admin can manage KYC details" ON public.kyc_details FOR ALL USING (true);

-- Create RLS policies for team_task_submissions
CREATE POLICY "Users can view team task submissions" ON public.team_task_submissions FOR SELECT USING (true);
CREATE POLICY "Users can insert team task submissions" ON public.team_task_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update team task submissions" ON public.team_task_submissions FOR UPDATE USING (true);

-- Insert default team categories
INSERT INTO public.departments (name) VALUES 
('Field Operations'),
('Installation Team'),
('Maintenance Team'),
('Security Team')
ON CONFLICT (name) DO NOTHING;

-- Update role levels for existing employees based on their current roles
UPDATE public.employees SET role_level = CASE 
  WHEN role = 'super_admin' THEN 5
  WHEN role = 'admin' THEN 4
  WHEN role = 'sub_admin' THEN 3
  WHEN role = 'supervisor' THEN 2
  WHEN role = 'employee' THEN 1
  ELSE 1
END;
