-- Clean up existing data and reset for fresh start
-- Remove all existing employees except super admin
DELETE FROM employees WHERE role != 'super_admin';

-- Remove all existing tasks
DELETE FROM tasks;
DELETE FROM department_task_assignments;

-- Remove all existing departments
DELETE FROM departments;

-- Remove all existing assets
DELETE FROM assets;

-- Remove all existing zones
DELETE FROM zones;

-- Remove all team data
DELETE FROM team_members;
DELETE FROM teams;

-- Remove supervisor assignments
DELETE FROM supervisor_assignments;

-- Remove zone assignments
DELETE FROM zone_assignments;

-- Update zones table to include radius for geofencing
ALTER TABLE zones ADD COLUMN IF NOT EXISTS radius NUMERIC DEFAULT 100;
ALTER TABLE zones ADD COLUMN IF NOT EXISTS center_lat NUMERIC;
ALTER TABLE zones ADD COLUMN IF NOT EXISTS center_lng NUMERIC;

-- Update employees table to ensure proper role constraints
UPDATE employees SET role = 'super_admin' WHERE role IN ('admin', 'sub_admin');

-- Create a function to validate role creation permissions
CREATE OR REPLACE FUNCTION validate_role_creation()
RETURNS TRIGGER AS $$
DECLARE
    creator_role TEXT;
BEGIN
    -- Get the creator's role (this would be set by the application)
    SELECT role INTO creator_role FROM employees WHERE id = auth.uid();
    
    -- Super admin can create any role
    IF creator_role = 'super_admin' THEN
        RETURN NEW;
    END IF;
    
    -- Admin can only create employees
    IF creator_role = 'admin' AND NEW.role = 'employee' THEN
        RETURN NEW;
    END IF;
    
    -- Prevent creation if not authorized
    RAISE EXCEPTION 'Insufficient permissions to create user with role %', NEW.role;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for role validation (optional, can be handled in application logic)
-- DROP TRIGGER IF EXISTS validate_role_creation_trigger ON employees;
-- CREATE TRIGGER validate_role_creation_trigger
--     BEFORE INSERT ON employees
--     FOR EACH ROW
--     EXECUTE FUNCTION validate_role_creation();