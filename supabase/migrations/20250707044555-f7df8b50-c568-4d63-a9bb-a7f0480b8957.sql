
-- Create departments table
CREATE TABLE public.departments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tasks table
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  form_fields JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create department_tasks junction table
CREATE TABLE public.department_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  is_required BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(department_id, task_id)
);

-- Add Row Level Security (RLS) to departments table
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

-- Create policies for departments
CREATE POLICY "Admin can manage departments" 
  ON public.departments 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can view active departments" 
  ON public.departments 
  FOR SELECT 
  USING (is_active = true);

-- Add Row Level Security (RLS) to tasks table
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Create policies for tasks
CREATE POLICY "Admin can manage tasks" 
  ON public.tasks 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can view active tasks" 
  ON public.tasks 
  FOR SELECT 
  USING (is_active = true);

-- Add Row Level Security (RLS) to department_tasks table
ALTER TABLE public.department_tasks ENABLE ROW LEVEL SECURITY;

-- Create policies for department_tasks
CREATE POLICY "Admin can manage department tasks" 
  ON public.department_tasks 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can view department tasks" 
  ON public.department_tasks 
  FOR SELECT 
  USING (true);

-- Insert some default departments
INSERT INTO public.departments (name) VALUES 
('Sales'),
('Marketing'), 
('Engineering'),
('HR'),
('Finance');

-- Insert some default tasks
INSERT INTO public.tasks (name, description) VALUES 
('Daily Report', 'Submit daily work report'),
('Weekly Meeting', 'Attend weekly team meeting'),
('Client Follow-up', 'Follow up with assigned clients'),
('Project Update', 'Update project status and progress'),
('Training Session', 'Attend mandatory training sessions');
