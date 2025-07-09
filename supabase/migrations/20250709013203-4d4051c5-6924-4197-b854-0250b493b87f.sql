-- Create employee_profiles table for additional employee information
CREATE TABLE public.employee_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  date_of_birth DATE,
  gender TEXT,
  father_name TEXT,
  mother_name TEXT,
  address TEXT,
  pin_code TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relation TEXT,
  -- Aadhar details
  aadhar_number TEXT,
  aadhar_photo_front TEXT,
  aadhar_photo_back TEXT,
  -- PAN details
  pan_number TEXT,
  pan_photo TEXT,
  -- Bank details
  bank_name TEXT,
  account_number TEXT,
  ifsc_code TEXT,
  bank_document_photo TEXT,
  -- Profile photo
  profile_photo TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(employee_id)
);

-- Enable RLS
ALTER TABLE public.employee_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admin can manage employee profiles" 
ON public.employee_profiles 
FOR ALL 
USING (true)
WITH CHECK (true);

CREATE POLICY "Users can view all employee profiles" 
ON public.employee_profiles 
FOR SELECT 
USING (true);

-- Update zone_assignments table to use proper structure
DROP TABLE IF EXISTS public.zone_assignments;

CREATE TABLE public.zone_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  zone_id UUID NOT NULL REFERENCES public.zones(id) ON DELETE CASCADE,
  department_id UUID REFERENCES public.departments(id),
  assigned_by UUID REFERENCES public.employees(id),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(employee_id, zone_id)
);

-- Enable RLS
ALTER TABLE public.zone_assignments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admin can manage zone assignments" 
ON public.zone_assignments 
FOR ALL 
USING (true)
WITH CHECK (true);

CREATE POLICY "Users can view zone assignments" 
ON public.zone_assignments 
FOR SELECT 
USING (true);

-- Create task_definitions table for proper task management
CREATE TABLE public.task_definitions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  task_type TEXT NOT NULL,
  department_id UUID NOT NULL REFERENCES public.departments(id),
  required_fields JSONB DEFAULT '{
    "location": false,
    "photos": false,
    "comments": false,
    "start_end_time": false,
    "additional_notes": false
  }'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.task_definitions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admin can manage task definitions" 
ON public.task_definitions 
FOR ALL 
USING (true)
WITH CHECK (true);

CREATE POLICY "Users can view active task definitions" 
ON public.task_definitions 
FOR SELECT 
USING (is_active = true);

-- Add task status tracking for employees
CREATE TABLE public.employee_task_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  task_submission_id UUID REFERENCES public.task_submissions(id),
  task_status TEXT DEFAULT 'idle', -- idle, task_started, task_in_progress, task_completed
  started_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(employee_id)
);

-- Enable RLS
ALTER TABLE public.employee_task_status ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admin can manage employee task status" 
ON public.employee_task_status 
FOR ALL 
USING (true)
WITH CHECK (true);

CREATE POLICY "Users can view all employee task status" 
ON public.employee_task_status 
FOR SELECT 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_employee_profiles_updated_at
  BEFORE UPDATE ON public.employee_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_task_definitions_updated_at
  BEFORE UPDATE ON public.task_definitions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_employee_task_status_updated_at
  BEFORE UPDATE ON public.employee_task_status
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();