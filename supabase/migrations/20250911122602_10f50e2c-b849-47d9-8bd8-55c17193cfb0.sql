-- Create security functions first
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

-- Clean up existing permissive policies systematically
DO $$
DECLARE
    pol_name TEXT;
    table_names TEXT[] := ARRAY[
        'advance_requests', 'leave_requests', 'asset_requests', 'attendance', 
        'task_submissions', 'team_task_submissions', 'payroll', 'employee_profiles',
        'kyc_details', 'employee_task_status', 'assets', 'employee_deductions',
        'department_tasks', 'zone_assignments', 'team_members', 'supervisor_assignments', 'teams'
    ];
    tbl TEXT;
BEGIN
    FOREACH tbl IN ARRAY table_names
    LOOP
        -- Drop permissive view policies
        EXECUTE format('DROP POLICY IF EXISTS "Users can view all %I" ON public.%I', tbl, tbl);
        EXECUTE format('DROP POLICY IF EXISTS "Users can view %I" ON public.%I', tbl, tbl);
        
        -- Drop permissive insert/update policies  
        EXECUTE format('DROP POLICY IF EXISTS "Users can insert %I" ON public.%I', tbl, tbl);
        EXECUTE format('DROP POLICY IF EXISTS "Users can update %I" ON public.%I', tbl, tbl);
        
        -- Create restrictive admin-only policies
        EXECUTE format('
            CREATE POLICY "Only admins can view %I" 
            ON public.%I 
            FOR SELECT 
            USING (public.is_admin_or_super_admin())', tbl, tbl);
            
        EXECUTE format('
            CREATE POLICY "Only admins can manage %I" 
            ON public.%I 
            FOR ALL 
            USING (public.is_admin_or_super_admin())
            WITH CHECK (public.is_admin_or_super_admin())', tbl, tbl);
    END LOOP;
END $$;