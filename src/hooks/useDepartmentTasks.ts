
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Department {
  id: string;
  name: string;
}

interface DepartmentTask {
  id: string;
  department_id: string;
  task_name: string;
  task_description: string;
  task_type: string;
  priority: string;
  due_date: string | null;
  assigned_at: string;
  is_active: boolean;
  department_name?: string;
}

interface TaskFormData {
  department_id: string;
  task_name: string;
  task_description: string;
  task_type: string;
  priority: string;
  due_date: string;
}

export const useDepartmentTasks = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [departmentTasks, setDepartmentTasks] = useState<DepartmentTask[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('id, name')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setDepartments(data || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchDepartmentTasks = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('department_task_assignments')
        .select(`
          *,
          departments!inner(name)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const tasksWithDeptName = (data || []).map((task: any) => ({
        ...task,
        department_name: task.departments?.name || 'Unknown Department'
      }));

      setDepartmentTasks(tasksWithDeptName);
    } catch (error) {
      console.error('Error fetching department tasks:', error);
      toast({
        title: "Error",
        description: "Failed to fetch department tasks",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createTask = async (formData: TaskFormData) => {
    if (!formData.task_name.trim() || !formData.department_id || !formData.task_type) {
      toast({
        title: "Missing Information",
        description: "Task name, department, and task type are required",
        variant: "destructive"
      });
      return false;
    }

    try {
      setIsLoading(true);
      const taskData = {
        department_id: formData.department_id,
        task_name: formData.task_name.trim(),
        task_description: formData.task_description.trim() || null,
        task_type: formData.task_type,
        priority: formData.priority,
        due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null
      };

      const { error } = await supabase
        .from('department_task_assignments')
        .insert(taskData);

      if (error) throw error;

      await fetchDepartmentTasks();
      
      toast({
        title: "Task Created",
        description: "Department task has been created successfully",
      });
      return true;
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: "Error",
        description: "Failed to create department task",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateTask = async (taskId: string, formData: TaskFormData) => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('department_task_assignments')
        .update({
          department_id: formData.department_id,
          task_name: formData.task_name.trim(),
          task_description: formData.task_description.trim() || null,
          task_type: formData.task_type,
          priority: formData.priority,
          due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId);

      if (error) throw error;

      await fetchDepartmentTasks();
      
      toast({
        title: "Task Updated",
        description: "Department task has been updated successfully",
      });
      return true;
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Error",
        description: "Failed to update department task",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('department_task_assignments')
        .update({ is_active: false })
        .eq('id', taskId);

      if (error) throw error;

      await fetchDepartmentTasks();
      toast({
        title: "Task Deleted",
        description: "Department task has been deactivated successfully",
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "Error",
        description: "Failed to delete department task",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
    fetchDepartmentTasks();
  }, []);

  return {
    departments,
    departmentTasks,
    isLoading,
    createTask,
    updateTask,
    deleteTask,
    fetchDepartmentTasks
  };
};
