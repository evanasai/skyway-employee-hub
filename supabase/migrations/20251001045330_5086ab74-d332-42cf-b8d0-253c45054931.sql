-- Phase 1: Create secure helper functions
CREATE OR REPLACE FUNCTION public.get_employee_id_from_auth()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.employees WHERE id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION public.is_own_employee_record(employee_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.employees 
    WHERE id = auth.uid() 
    AND id = employee_uuid
    AND is_active = true
  )
$$;

-- Phase 2: Fix RLS Policies - Employees Table
DROP POLICY IF EXISTS "Admin can view all employees" ON public.employees;
DROP POLICY IF EXISTS "Admin can insert employees" ON public.employees;
DROP POLICY IF EXISTS "Admin can update employees" ON public.employees;
DROP POLICY IF EXISTS "Admin can delete employees" ON public.employees;

CREATE POLICY "Admins can manage all employees"
ON public.employees
FOR ALL
TO authenticated
USING (is_admin_or_super_admin())
WITH CHECK (is_admin_or_super_admin());

CREATE POLICY "Users can view their own employee record"
ON public.employees
FOR SELECT
TO authenticated
USING (id = auth.uid() AND is_active = true);

-- Phase 3: Fix RLS Policies - Employee Profiles
DROP POLICY IF EXISTS "Admin can manage employee profiles" ON public.employee_profiles;
DROP POLICY IF EXISTS "Only admins can view employee profiles" ON public.employee_profiles;

CREATE POLICY "Admins can manage all profiles"
ON public.employee_profiles
FOR ALL
TO authenticated
USING (is_admin_or_super_admin())
WITH CHECK (is_admin_or_super_admin());

CREATE POLICY "Users can view their own profile"
ON public.employee_profiles
FOR SELECT
TO authenticated
USING (employee_id = auth.uid());

-- Phase 4: Fix RLS Policies - Attendance
DROP POLICY IF EXISTS "Only admins can manage attendance" ON public.attendance;
DROP POLICY IF EXISTS "Only admins can view attendance" ON public.attendance;

CREATE POLICY "Admins can manage all attendance"
ON public.attendance
FOR ALL
TO authenticated
USING (is_admin_or_super_admin())
WITH CHECK (is_admin_or_super_admin());

CREATE POLICY "Users can view their own attendance"
ON public.attendance
FOR SELECT
TO authenticated
USING (employee_id = auth.uid());

CREATE POLICY "Users can insert their own attendance"
ON public.attendance
FOR INSERT
TO authenticated
WITH CHECK (employee_id = auth.uid());

CREATE POLICY "Users can update their own attendance"
ON public.attendance
FOR UPDATE
TO authenticated
USING (employee_id = auth.uid());

-- Phase 5: Fix RLS Policies - Task Submissions
DROP POLICY IF EXISTS "Only admins can manage task submissions" ON public.task_submissions;
DROP POLICY IF EXISTS "Only admins can view task submissions" ON public.task_submissions;

CREATE POLICY "Admins can manage all task submissions"
ON public.task_submissions
FOR ALL
TO authenticated
USING (is_admin_or_super_admin())
WITH CHECK (is_admin_or_super_admin());

CREATE POLICY "Users can view their own task submissions"
ON public.task_submissions
FOR SELECT
TO authenticated
USING (employee_id = auth.uid());

CREATE POLICY "Users can insert their own task submissions"
ON public.task_submissions
FOR INSERT
TO authenticated
WITH CHECK (employee_id = auth.uid());

-- Phase 6: Fix RLS Policies - Advance Requests
DROP POLICY IF EXISTS "Only admins can manage advance requests" ON public.advance_requests;
DROP POLICY IF EXISTS "Only admins can view advance requests" ON public.advance_requests;

CREATE POLICY "Admins can manage all advance requests"
ON public.advance_requests
FOR ALL
TO authenticated
USING (is_admin_or_super_admin())
WITH CHECK (is_admin_or_super_admin());

CREATE POLICY "Users can view their own advance requests"
ON public.advance_requests
FOR SELECT
TO authenticated
USING (employee_id = auth.uid());

CREATE POLICY "Users can create their own advance requests"
ON public.advance_requests
FOR INSERT
TO authenticated
WITH CHECK (employee_id = auth.uid());

-- Phase 7: Fix RLS Policies - Asset Requests
DROP POLICY IF EXISTS "Only admins can manage asset requests" ON public.asset_requests;
DROP POLICY IF EXISTS "Only admins can view asset requests" ON public.asset_requests;

CREATE POLICY "Admins can manage all asset requests"
ON public.asset_requests
FOR ALL
TO authenticated
USING (is_admin_or_super_admin())
WITH CHECK (is_admin_or_super_admin());

CREATE POLICY "Users can view their own asset requests"
ON public.asset_requests
FOR SELECT
TO authenticated
USING (employee_id = auth.uid());

CREATE POLICY "Users can create their own asset requests"
ON public.asset_requests
FOR INSERT
TO authenticated
WITH CHECK (employee_id = auth.uid());

-- Phase 8: Fix RLS Policies - Leave Requests
DROP POLICY IF EXISTS "Only admins can manage leave requests" ON public.leave_requests;
DROP POLICY IF EXISTS "Only admins can view leave requests" ON public.leave_requests;

CREATE POLICY "Admins can manage all leave requests"
ON public.leave_requests
FOR ALL
TO authenticated
USING (is_admin_or_super_admin())
WITH CHECK (is_admin_or_super_admin());

CREATE POLICY "Users can view their own leave requests"
ON public.leave_requests
FOR SELECT
TO authenticated
USING (employee_id = auth.uid());

CREATE POLICY "Users can create their own leave requests"
ON public.leave_requests
FOR INSERT
TO authenticated
WITH CHECK (employee_id = auth.uid());

-- Phase 9: Fix RLS Policies - KYC Details
DROP POLICY IF EXISTS "Admin can manage KYC details" ON public.kyc_details;
DROP POLICY IF EXISTS "Only admins can view KYC details" ON public.kyc_details;

CREATE POLICY "Admins can manage all KYC details"
ON public.kyc_details
FOR ALL
TO authenticated
USING (is_admin_or_super_admin())
WITH CHECK (is_admin_or_super_admin());

CREATE POLICY "Users can view their own KYC details"
ON public.kyc_details
FOR SELECT
TO authenticated
USING (employee_id = auth.uid());

CREATE POLICY "Users can create their own KYC details"
ON public.kyc_details
FOR INSERT
TO authenticated
WITH CHECK (employee_id = auth.uid());

-- Phase 10: Fix RLS Policies - Zone Assignments
DROP POLICY IF EXISTS "Admin can manage zone assignments" ON public.zone_assignments;
DROP POLICY IF EXISTS "Only admins can view zone assignments" ON public.zone_assignments;

CREATE POLICY "Admins can manage all zone assignments"
ON public.zone_assignments
FOR ALL
TO authenticated
USING (is_admin_or_super_admin())
WITH CHECK (is_admin_or_super_admin());

CREATE POLICY "Users can view their own zone assignments"
ON public.zone_assignments
FOR SELECT
TO authenticated
USING (employee_id = auth.uid());

-- Phase 11: Fix RLS Policies - Department Task Assignments
DROP POLICY IF EXISTS "Admin can manage department task assignments" ON public.department_task_assignments;
DROP POLICY IF EXISTS "Users can view department task assignments" ON public.department_task_assignments;

CREATE POLICY "Admins can manage all department task assignments"
ON public.department_task_assignments
FOR ALL
TO authenticated
USING (is_admin_or_super_admin())
WITH CHECK (is_admin_or_super_admin());

-- Phase 12: Remove password field (will be handled by Supabase Auth)
-- Keep it for now during migration, but mark for removal
COMMENT ON COLUMN public.employees.password IS 'DEPRECATED: To be removed after Supabase Auth migration';