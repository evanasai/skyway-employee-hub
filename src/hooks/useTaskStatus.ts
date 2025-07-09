import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types';

export const useTaskStatus = (user: User | null) => {
  const [taskStatus, setTaskStatus] = useState<'idle' | 'task_started' | 'task_in_progress' | 'task_completed'>('idle');
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch current task status when component mounts
  useEffect(() => {
    if (user) {
      fetchTaskStatus();
    }
  }, [user]);

  const fetchTaskStatus = async () => {
    if (!user) return;

    try {
      const { data: employee } = await supabase
        .from('employees')
        .select('id')
        .eq('employee_id', user.employeeId)
        .single();

      if (employee) {
        const { data: taskStatusData } = await supabase
          .from('employee_task_status')
          .select('*')
          .eq('employee_id', employee.id)
          .single();

        if (taskStatusData) {
          setTaskStatus(taskStatusData.task_status as 'idle' | 'task_started' | 'task_in_progress' | 'task_completed');
          setActiveTaskId(taskStatusData.task_submission_id);
        }
      }
    } catch (error) {
      console.error('Error fetching task status:', error);
    }
  };

  const updateTaskStatus = async (
    newStatus: 'idle' | 'task_started' | 'task_in_progress' | 'task_completed',
    taskSubmissionId?: string
  ) => {
    if (!user) return false;

    setIsLoading(true);
    try {
      const { data: employee } = await supabase
        .from('employees')
        .select('id')
        .eq('employee_id', user.employeeId)
        .single();

      if (employee) {
        const { error } = await supabase
          .from('employee_task_status')
          .upsert({
            employee_id: employee.id,
            task_status: newStatus,
            task_submission_id: taskSubmissionId || null,
            started_at: newStatus === 'task_started' ? new Date().toISOString() : undefined,
            updated_at: new Date().toISOString()
          });

        if (error) throw error;

        setTaskStatus(newStatus);
        setActiveTaskId(taskSubmissionId || null);
        return true;
      }
    } catch (error) {
      console.error('Error updating task status:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
    return false;
  };

  const canLogout = () => {
    return taskStatus === 'idle' || taskStatus === 'task_completed';
  };

  const isTaskActive = () => {
    return taskStatus === 'task_started' || taskStatus === 'task_in_progress';
  };

  return {
    taskStatus,
    activeTaskId,
    isLoading,
    updateTaskStatus,
    canLogout,
    isTaskActive,
    fetchTaskStatus
  };
};