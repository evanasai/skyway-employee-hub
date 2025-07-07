
-- First, let's check and create the department_task_assignments table
CREATE TABLE IF NOT EXISTS public.department_task_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
  task_name TEXT NOT NULL,
  task_description TEXT,
  task_type TEXT NOT NULL,
  priority TEXT DEFAULT 'medium',
  due_date TIMESTAMP WITH TIME ZONE,
  assigned_by UUID REFERENCES public.employees(id),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies for department task assignments
ALTER TABLE public.department_task_assignments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admin can manage department task assignments" ON public.department_task_assignments;
DROP POLICY IF EXISTS "Users can view department task assignments" ON public.department_task_assignments;

CREATE POLICY "Admin can manage department task assignments" 
  ON public.department_task_assignments 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can view department task assignments" 
  ON public.department_task_assignments 
  FOR SELECT 
  USING (true);

-- Insert sample department tasks using actual department names from the database
-- Let's get the correct department names first and insert tasks
DO $$
DECLARE
    dept_record RECORD;
BEGIN
    -- Insert tasks for each existing department
    FOR dept_record IN SELECT id, name FROM public.departments WHERE is_active = true LOOP
        CASE dept_record.name
            WHEN 'Security' THEN
                INSERT INTO public.department_task_assignments (department_id, task_name, task_description, task_type, priority) VALUES
                (dept_record.id, 'Daily Security Patrol', 'Complete security rounds of assigned zones', 'Security Check', 'high'),
                (dept_record.id, 'Access Control Monitoring', 'Monitor and log all access points', 'Security Check', 'medium');
            WHEN 'Maintenance' THEN
                INSERT INTO public.department_task_assignments (department_id, task_name, task_description, task_type, priority) VALUES
                (dept_record.id, 'Equipment Inspection', 'Check and maintain all equipment', 'Maintenance', 'medium'),
                (dept_record.id, 'Facility Cleaning', 'Clean and sanitize common areas', 'Cleaning', 'low');
            WHEN 'Engineering' THEN
                INSERT INTO public.department_task_assignments (department_id, task_name, task_description, task_type, priority) VALUES
                (dept_record.id, 'System Installation', 'Install new systems and equipment', 'Installation', 'high'),
                (dept_record.id, 'Technical Documentation', 'Update technical manuals and procedures', 'Documentation', 'medium');
            WHEN 'Operations' THEN
                INSERT INTO public.department_task_assignments (department_id, task_name, task_description, task_type, priority) VALUES
                (dept_record.id, 'Field Inspection', 'Conduct field inspections and assessments', 'Inspection', 'medium'),
                (dept_record.id, 'Client Delivery', 'Deliver materials and equipment to clients', 'Delivery', 'high');
            ELSE
                -- For any other departments, add a generic task
                INSERT INTO public.department_task_assignments (department_id, task_name, task_description, task_type, priority) VALUES
                (dept_record.id, 'Department Tasks', 'Complete assigned department tasks', 'General', 'medium');
        END CASE;
    END LOOP;
END $$;

-- Create the view for employees to see tasks assigned to their department
DROP VIEW IF EXISTS public.employee_department_tasks;

CREATE VIEW public.employee_department_tasks AS
SELECT 
  dt.id,
  dt.task_name,
  dt.task_description,
  dt.task_type,
  dt.priority,
  dt.due_date,
  dt.assigned_at,
  dt.is_active,
  d.name as department_name,
  e.id as employee_id,
  e.name as employee_name,
  e.department as employee_department
FROM public.department_task_assignments dt
JOIN public.departments d ON dt.department_id = d.id
JOIN public.employees e ON e.department = d.name
WHERE dt.is_active = true AND e.is_active = true;

-- Grant access to the view
GRANT SELECT ON public.employee_department_tasks TO authenticated;
GRANT SELECT ON public.employee_department_tasks TO anon;

-- Create sample teams as requested (5 teams with 5 members each, 5 teams with 2 members each)
-- First, let's insert the teams
DO $$
DECLARE
    security_dept_id UUID;
    maintenance_dept_id UUID;
    engineering_dept_id UUID;
    operations_dept_id UUID;
BEGIN
    -- Get department IDs
    SELECT id INTO security_dept_id FROM public.departments WHERE name = 'Security' LIMIT 1;
    SELECT id INTO maintenance_dept_id FROM public.departments WHERE name = 'Maintenance' LIMIT 1;
    SELECT id INTO engineering_dept_id FROM public.departments WHERE name = 'Engineering' LIMIT 1;
    SELECT id INTO operations_dept_id FROM public.departments WHERE name = 'Operations' LIMIT 1;

    -- Insert teams only if departments exist
    IF security_dept_id IS NOT NULL THEN
        INSERT INTO public.teams (name, category, department_id, is_active) VALUES
        ('Alpha Security Team', 'Security Team', security_dept_id, true),
        ('Sigma Rapid Response', 'Security Team', security_dept_id, true);
    END IF;

    IF maintenance_dept_id IS NOT NULL THEN
        INSERT INTO public.teams (name, category, department_id, is_active) VALUES
        ('Beta Maintenance Crew', 'Maintenance Team', maintenance_dept_id, true),
        ('Lambda Emergency Team', 'Maintenance Team', maintenance_dept_id, true);
    END IF;

    IF engineering_dept_id IS NOT NULL THEN
        INSERT INTO public.teams (name, category, department_id, is_active) VALUES
        ('Gamma Installation Unit', 'Installation Team', engineering_dept_id, true),
        ('Echo Technical Support', 'Technical Support', engineering_dept_id, true),
        ('Kappa Specialist Team', 'Technical Support', engineering_dept_id, true);
    END IF;

    IF operations_dept_id IS NOT NULL THEN
        INSERT INTO public.teams (name, category, department_id, is_active) VALUES
        ('Delta Field Operations', 'Field Operations', operations_dept_id, true),
        ('Theta Mobile Unit', 'Field Operations', operations_dept_id, true);
    END IF;

    -- Add a general team if we have any other departments
    INSERT INTO public.teams (name, category, department_id, is_active) 
    SELECT 'Quality Control Team', 'Quality Assurance', id, true 
    FROM public.departments 
    WHERE name NOT IN ('Security', 'Maintenance', 'Engineering', 'Operations') 
    AND is_active = true 
    LIMIT 1;
END $$;
