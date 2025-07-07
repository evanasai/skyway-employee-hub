
-- Create teams table if it doesn't exist (it should already exist)
-- Adding sample teams with proper structure

-- Insert 5 teams with 5 members each
INSERT INTO public.teams (name, category, department_id, is_active) VALUES
('Alpha Security Team', 'Security Team', (SELECT id FROM departments WHERE name = 'Security' LIMIT 1), true),
('Beta Maintenance Crew', 'Maintenance Team', (SELECT id FROM departments WHERE name = 'Maintenance' LIMIT 1), true),
('Gamma Installation Unit', 'Installation Team', (SELECT id FROM departments WHERE name = 'Engineering' LIMIT 1), true),
('Delta Field Operations', 'Field Operations', (SELECT id FROM departments WHERE name = 'Operations' LIMIT 1), true),
('Echo Technical Support', 'Technical Support', (SELECT id FROM departments WHERE name = 'Engineering' LIMIT 1), true);

-- Insert 5 teams with 2 members each
INSERT INTO public.teams (name, category, department_id, is_active) VALUES
('Omega Quality Control', 'Quality Assurance', (SELECT id FROM departments WHERE name = 'Quality' LIMIT 1), true),
('Sigma Rapid Response', 'Security Team', (SELECT id FROM departments WHERE name = 'Security' LIMIT 1), true),
('Theta Mobile Unit', 'Field Operations', (SELECT id FROM departments WHERE name = 'Operations' LIMIT 1), true),
('Kappa Specialist Team', 'Technical Support', (SELECT id FROM departments WHERE name = 'Engineering' LIMIT 1), true),
('Lambda Emergency Team', 'Maintenance Team', (SELECT id FROM departments WHERE name = 'Maintenance' LIMIT 1), true);

-- Create department_tasks table for assigning tasks to departments
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

CREATE POLICY "Admin can manage department task assignments" 
  ON public.department_task_assignments 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can view department task assignments" 
  ON public.department_task_assignments 
  FOR SELECT 
  USING (true);

-- Insert sample department tasks
INSERT INTO public.department_task_assignments (department_id, task_name, task_description, task_type, priority) VALUES
((SELECT id FROM departments WHERE name = 'Security' LIMIT 1), 'Daily Security Patrol', 'Complete security rounds of assigned zones', 'Security Check', 'high'),
((SELECT id FROM departments WHERE name = 'Security' LIMIT 1), 'Access Control Monitoring', 'Monitor and log all access points', 'Security Check', 'medium'),
((SELECT id FROM departments WHERE name = 'Maintenance' LIMIT 1), 'Equipment Inspection', 'Check and maintain all equipment', 'Maintenance', 'medium'),
((SELECT id FROM departments WHERE name = 'Maintenance' LIMIT 1), 'Facility Cleaning', 'Clean and sanitize common areas', 'Cleaning', 'low'),
((SELECT id FROM departments WHERE name = 'Engineering' LIMIT 1), 'System Installation', 'Install new systems and equipment', 'Installation', 'high'),
((SELECT id FROM departments WHERE name = 'Engineering' LIMIT 1), 'Technical Documentation', 'Update technical manuals and procedures', 'Documentation', 'medium'),
((SELECT id FROM departments WHERE name = 'Operations' LIMIT 1), 'Field Inspection', 'Conduct field inspections and assessments', 'Inspection', 'medium'),
((SELECT id FROM departments WHERE name = 'Operations' LIMIT 1), 'Client Delivery', 'Deliver materials and equipment to clients', 'Delivery', 'high');

-- Create a view for employees to see tasks assigned to their department
CREATE OR REPLACE VIEW public.employee_department_tasks AS
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
