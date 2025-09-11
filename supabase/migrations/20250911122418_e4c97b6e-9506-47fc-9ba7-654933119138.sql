-- Update RLS policies to restrict access to admin and super_admin only

-- Drop existing permissive policies and create restrictive ones
DROP POLICY IF EXISTS "Users can view all advance requests" ON public.advance_requests;
DROP POLICY IF EXISTS "Users can view all leave requests" ON public.leave_requests;
DROP POLICY IF EXISTS "Users can view all asset requests" ON public.asset_requests;
DROP POLICY IF EXISTS "Users can view all attendance" ON public.attendance;
DROP POLICY IF EXISTS "Users can view all task submissions" ON public.task_submissions;
DROP POLICY IF EXISTS "Users can view all team task submissions" ON public.team_task_submissions;
DROP POLICY IF EXISTS "Users can view all payroll" ON public.payroll;
DROP POLICY IF EXISTS "Users can view all employee profiles" ON public.employee_profiles;
DROP POLICY IF EXISTS "Users can view KYC details" ON public.kyc_details;
DROP POLICY IF EXISTS "Users can view all employee task status" ON public.employee_task_status;
DROP POLICY IF EXISTS "Users can view all assets" ON public.assets;
DROP POLICY IF EXISTS "Users can view all deductions" ON public.employee_deductions;

-- Create function to check if user is admin or super_admin
CREATE OR REPLACE FUNCTION public.is_admin_or_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.employees 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'super_admin')
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- Create function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT role FROM public.employees 
    WHERE id = auth.uid() 
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- Restrict advance requests to admin/super_admin only
CREATE POLICY "Only admins can view advance requests" 
ON public.advance_requests 
FOR SELECT 
USING (public.is_admin_or_super_admin());

CREATE POLICY "Only admins can manage advance requests" 
ON public.advance_requests 
FOR ALL 
USING (public.is_admin_or_super_admin())
WITH CHECK (public.is_admin_or_super_admin());

-- Restrict leave requests to admin/super_admin only
CREATE POLICY "Only admins can view leave requests" 
ON public.leave_requests 
FOR SELECT 
USING (public.is_admin_or_super_admin());

CREATE POLICY "Only admins can manage leave requests" 
ON public.leave_requests 
FOR ALL 
USING (public.is_admin_or_super_admin())
WITH CHECK (public.is_admin_or_super_admin());

-- Restrict asset requests to admin/super_admin only
CREATE POLICY "Only admins can view asset requests" 
ON public.asset_requests 
FOR SELECT 
USING (public.is_admin_or_super_admin());

CREATE POLICY "Only admins can manage asset requests" 
ON public.asset_requests 
FOR ALL 
USING (public.is_admin_or_super_admin())
WITH CHECK (public.is_admin_or_super_admin());

-- Restrict attendance to admin/super_admin only
CREATE POLICY "Only admins can view attendance" 
ON public.attendance 
FOR SELECT 
USING (public.is_admin_or_super_admin());

CREATE POLICY "Only admins can manage attendance" 
ON public.attendance 
FOR ALL 
USING (public.is_admin_or_super_admin())
WITH CHECK (public.is_admin_or_super_admin());

-- Restrict task submissions to admin/super_admin only
CREATE POLICY "Only admins can view task submissions" 
ON public.task_submissions 
FOR SELECT 
USING (public.is_admin_or_super_admin());

CREATE POLICY "Only admins can manage task submissions" 
ON public.task_submissions 
FOR ALL 
USING (public.is_admin_or_super_admin())
WITH CHECK (public.is_admin_or_super_admin());

-- Restrict team task submissions to admin/super_admin only
CREATE POLICY "Only admins can view team task submissions" 
ON public.team_task_submissions 
FOR SELECT 
USING (public.is_admin_or_super_admin());

CREATE POLICY "Only admins can manage team task submissions" 
ON public.team_task_submissions 
FOR ALL 
USING (public.is_admin_or_super_admin())
WITH CHECK (public.is_admin_or_super_admin());

-- Restrict payroll to admin/super_admin only
CREATE POLICY "Only admins can view payroll" 
ON public.payroll 
FOR SELECT 
USING (public.is_admin_or_super_admin());

-- Restrict employee profiles to admin/super_admin only
CREATE POLICY "Only admins can view employee profiles" 
ON public.employee_profiles 
FOR SELECT 
USING (public.is_admin_or_super_admin());

-- Restrict KYC details to admin/super_admin only
CREATE POLICY "Only admins can view KYC details" 
ON public.kyc_details 
FOR SELECT 
USING (public.is_admin_or_super_admin());

-- Restrict employee task status to admin/super_admin only
CREATE POLICY "Only admins can view employee task status" 
ON public.employee_task_status 
FOR SELECT 
USING (public.is_admin_or_super_admin());

-- Restrict assets to admin/super_admin only
CREATE POLICY "Only admins can view assets" 
ON public.assets 
FOR SELECT 
USING (public.is_admin_or_super_admin());

-- Restrict employee deductions to admin/super_admin only
CREATE POLICY "Only admins can view employee deductions" 
ON public.employee_deductions 
FOR SELECT 
USING (public.is_admin_or_super_admin());

-- Update other policies to be more restrictive
DROP POLICY IF EXISTS "Users can view department tasks" ON public.department_tasks;
CREATE POLICY "Only admins can view department tasks" 
ON public.department_tasks 
FOR SELECT 
USING (public.is_admin_or_super_admin());

DROP POLICY IF EXISTS "Users can view zone assignments" ON public.zone_assignments;
CREATE POLICY "Only admins can view zone assignments" 
ON public.zone_assignments 
FOR SELECT 
USING (public.is_admin_or_super_admin());

DROP POLICY IF EXISTS "Users can view team members" ON public.team_members;
CREATE POLICY "Only admins can view team members" 
ON public.team_members 
FOR SELECT 
USING (public.is_admin_or_super_admin());

DROP POLICY IF EXISTS "Users can view supervisor assignments" ON public.supervisor_assignments;
CREATE POLICY "Only admins can view supervisor assignments" 
ON public.supervisor_assignments 
FOR SELECT 
USING (public.is_admin_or_super_admin());

DROP POLICY IF EXISTS "Users can view teams" ON public.teams;
CREATE POLICY "Only admins can view teams" 
ON public.teams 
FOR SELECT 
USING (public.is_admin_or_super_admin());

-- Ensure all insert/update policies require admin access
DROP POLICY IF EXISTS "Users can insert advance requests" ON public.advance_requests;
DROP POLICY IF EXISTS "Users can update advance requests" ON public.advance_requests;
DROP POLICY IF EXISTS "Users can insert leave requests" ON public.leave_requests;
DROP POLICY IF EXISTS "Users can update leave requests" ON public.leave_requests;
DROP POLICY IF EXISTS "Users can insert asset requests" ON public.asset_requests;
DROP POLICY IF EXISTS "Users can update asset requests" ON public.asset_requests;
DROP POLICY IF EXISTS "Users can insert attendance" ON public.attendance;
DROP POLICY IF EXISTS "Users can update attendance" ON public.attendance;
DROP POLICY IF EXISTS "Users can insert task submissions" ON public.task_submissions;
DROP POLICY IF EXISTS "Users can update task submissions" ON public.task_submissions;
DROP POLICY IF EXISTS "Users can insert team task submissions" ON public.team_task_submissions;
DROP POLICY IF EXISTS "Users can update team task submissions" ON public.team_task_submissions;