
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface EmployeeDepartmentTask {
  id: string;
  task_name: string;
  task_description: string;
  task_type: string;
  priority: string;
  due_date: string | null;
  assigned_at: string;
  department_name: string;
}

export const useEmployeeDepartmentTasks = (employeeId: string, employeeDepartment: string) => {
  const [departmentTasks, setDepartmentTasks] = useState<EmployeeDepartmentTask[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchDepartmentTasks = async () => {
    try {
      setIsLoading(true);
      
      // Use the employee_department_tasks view
      const { data, error } = await supabase
        .from('employee_department_tasks')
        .select('*')
        .eq('employee_id', employeeId)
        .order('assigned_at', { ascending: false });

      if (error) {
        console.error('View query failed, using fallback:', error);
        
        // Fallback to joining tables manually
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('departments')
          .select(`
            id,
            name,
            department_task_assignments!inner(
              id,
              task_name,
              task_description,
              task_type,
              priority,
              due_date,
              assigned_at,
              is_active
            )
          `)
          .eq('name', employeeDepartment)
          .eq('department_task_assignments.is_active', true);

        if (fallbackError) throw fallbackError;

        // Transform the data
        const transformedTasks: EmployeeDepartmentTask[] = [];
        (fallbackData || []).forEach((dept: any) => {
          if (dept.department_task_assignments) {
            dept.department_task_assignments.forEach((task: any) => {
              transformedTasks.push({
                id: task.id,
                task_name: task.task_name,
                task_description: task.task_description,
                task_type: task.task_type,
                priority: task.priority,
                due_date: task.due_date,
                assigned_at: task.assigned_at,
                department_name: dept.name
              });
            });
          }
        });

        setDepartmentTasks(transformedTasks);
      } else {
        setDepartmentTasks(data || []);
      }
    } catch (error) {
      console.error('Error fetching department tasks:', error);
      toast({
        title: "Error",
        description: "Failed to fetch your department tasks",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartmentTasks();
  }, [employeeId, employeeDepartment]);

  return { 
    departmentTasks, 
    isLoading, 
    fetchDepartmentTasks 
  };
};
