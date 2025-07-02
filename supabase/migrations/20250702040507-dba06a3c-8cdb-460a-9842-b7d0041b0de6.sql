
-- Create employee_documents table to store documents like driving license, RC, etc.
CREATE TABLE IF NOT EXISTS public.employee_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL, -- 'driving_license', 'rc_book', 'bike_photo', 'bank_passbook', 'insurance_card'
  document_url TEXT NOT NULL,
  document_name TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create employee_bank_details table
CREATE TABLE IF NOT EXISTS public.employee_bank_details (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  bank_name TEXT,
  account_number TEXT,
  ifsc_code TEXT,
  account_holder_name TEXT,
  esi_number TEXT,
  pf_number TEXT,
  insurance_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies for employee_documents
ALTER TABLE public.employee_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employees can view their own documents" 
  ON public.employee_documents 
  FOR SELECT 
  USING (true);

CREATE POLICY "Admin can manage all documents" 
  ON public.employee_documents 
  FOR ALL 
  USING (true);

-- Add RLS policies for employee_bank_details
ALTER TABLE public.employee_bank_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employees can view their own bank details" 
  ON public.employee_bank_details 
  FOR SELECT 
  USING (true);

CREATE POLICY "Admin can manage all bank details" 
  ON public.employee_bank_details 
  FOR ALL 
  USING (true);

-- Create monthly_performance_summary view for easier data access
CREATE OR REPLACE VIEW public.monthly_performance_summary AS
SELECT 
  e.id as employee_id,
  e.name,
  e.employee_id,
  DATE_PART('month', CURRENT_DATE) as current_month,
  DATE_PART('year', CURRENT_DATE) as current_year,
  -- Attendance days this month
  (SELECT COUNT(DISTINCT DATE(check_in_time)) 
   FROM attendance a 
   WHERE a.employee_id = e.id 
   AND DATE_PART('month', check_in_time) = DATE_PART('month', CURRENT_DATE)
   AND DATE_PART('year', check_in_time) = DATE_PART('year', CURRENT_DATE)
   AND status = 'checked_out') as days_attended,
  -- Leave days this month
  (SELECT COALESCE(SUM(end_date - start_date + 1), 0)
   FROM leave_requests lr 
   WHERE lr.employee_id = e.id 
   AND status = 'approved'
   AND DATE_PART('month', start_date) = DATE_PART('month', CURRENT_DATE)
   AND DATE_PART('year', start_date) = DATE_PART('year', CURRENT_DATE)) as leave_days,
  -- Tasks completed this month
  (SELECT COUNT(*) 
   FROM task_submissions ts 
   WHERE ts.employee_id = e.id 
   AND DATE_PART('month', created_at) = DATE_PART('month', CURRENT_DATE)
   AND DATE_PART('year', created_at) = DATE_PART('year', CURRENT_DATE)) as tasks_completed,
  -- Advance taken this month
  (SELECT COALESCE(SUM(amount), 0)
   FROM advance_requests ar 
   WHERE ar.employee_id = e.id 
   AND status = 'approved'
   AND DATE_PART('month', request_date) = DATE_PART('month', CURRENT_DATE)
   AND DATE_PART('year', request_date) = DATE_PART('year', CURRENT_DATE)) as advance_taken,
  e.salary as base_salary
FROM employees e;

-- Grant access to the view
GRANT SELECT ON public.monthly_performance_summary TO authenticated;
