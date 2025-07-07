
-- Add team_id column to supervisor_assignments table to support team allocation
ALTER TABLE public.supervisor_assignments 
ADD COLUMN team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE;

-- Update the assignment_type constraint to include 'team' option
ALTER TABLE public.supervisor_assignments 
DROP CONSTRAINT IF EXISTS supervisor_assignments_assignment_type_check;

ALTER TABLE public.supervisor_assignments 
ADD CONSTRAINT supervisor_assignments_assignment_type_check 
CHECK (assignment_type IN ('individual', 'team', 'department'));

-- Add constraint to ensure proper assignment logic:
-- - For individual assignments: employee_id must be set, team_id must be null
-- - For team assignments: team_id must be set, employee_id must be null
-- - For department assignments: department_id must be set, both employee_id and team_id can be null
ALTER TABLE public.supervisor_assignments 
ADD CONSTRAINT supervisor_assignments_logic_check 
CHECK (
  (assignment_type = 'individual' AND employee_id IS NOT NULL AND team_id IS NULL) OR
  (assignment_type = 'team' AND team_id IS NOT NULL AND employee_id IS NULL) OR
  (assignment_type = 'department' AND department_id IS NOT NULL)
);
